import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';
import querystring from 'query-string';

@store('RootUserStore')
class RootUserStore {
  @observable loading = true;
  @observable rootUserData = [];

  @action
  setRootUserData(data) {
    this.rootUserData = data;
  }

  @computed
  get getRootUserData() {
    return this.rootUserData;
  }

  @action
  setLoading(loading) {
    this.loading = loading;
  }

  @computed
  get getLoading() {
    return this.loading;
  }

  loadRootUserData(
    { current, pageSize },
    { loginName, realName, enabled, locked },
    { columnKey = 'id', order = 'descend' },
    params) {
    const queryObj = {
      page: current - 1,
      size: pageSize,
      loginName,
      realName,
      enabled,
      locked,
      params,
    };
    if (columnKey) {
      const sorter = [];
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
      queryObj.sort = sorter.join(',');
    }
    return axios.get(`/iam/v1/users/admin?${querystring.stringify(queryObj)}`);
  }

  searchMemberIds(loginNames) {
    const promises = loginNames.map(index => axios.get(`/iam/v1/users?login_name=${index}`));
    return axios.all(promises);
  }

  addRootUser(ids) {
    const id = ids.join(',');
    return axios.post(`/iam/v1/users/admin?id=${id}`);
  }

  deleteRootUser(id) {
    return axios.delete(`/iam/v1/users/admin/${id}`);
  }
}

const rootUserStore = new RootUserStore();

export default rootUserStore;
