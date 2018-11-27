import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import queryString from 'query-string';

@store('TokenManagerStore')
class TokenManagerStore {
  @observable tokenData = [];
  @observable loading = false;
  @observable pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  @observable params = [];

  @observable filters = {
    expire: [],
  };

  refresh(token) {
    this.loadData(token, { current: 1, pageSize: 10 }, []);
  }

  deleteTokenById(tokenId, token) {
    return axios.delete(`/iam/v1/token?tokenId=${tokenId}&currentToken=${token}`);
  }

  @action
  loadData(currentToken, pagination = this.pagination, params = this.params, filters = this.filters) {
    this.loading = true;
    this.params = params;
    return axios.get(`/iam/v1/token?${queryString.stringify({
      currentToken,
      page: pagination.current - 1,
      size: pagination.pageSize,
      params: params.join(','),
      expire: filters.expire[0],
    })}`)
      .then(action(({ failed, content, totalElements }) => {
        if (!failed) {
          this.tokenData = content;
          this.pagination = {
            ...pagination,
            total: totalElements,
          };
        }
        this.loading = false;
      }))
      .catch(action((error) => {
        Choerodon.handleResponseError(error);
        this.loading = false;
      }));
  }
}

export default new TokenManagerStore();
