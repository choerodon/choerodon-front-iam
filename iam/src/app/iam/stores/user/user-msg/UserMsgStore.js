import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import queryString from 'query-string';

@store('UserMsgStore')
class UserMsgStore {
  @observable userMsg = [];

  @observable userInfo = {};

  @observable expandCardId = 0;

  @observable selectMsg = new Set();

  @observable loading = false;

  @computed
  get getSelectMsg() {
    return this.selectMsg;
  }

  @action
  addSelectMsgById(id) {
    this.selectMsg.add(id);
  }

  @computed
  get getLoading() {
    return this.loading;
  }

  @action
  setLoading(flag) {
    this.loading = flag;
  }

  @action
  deleteSelectMsgById(id) {
    this.selectMsg.delete(id);
  }

  @computed
  get getExpandCardId() {
    return this.expandCardId;
  }

  @action
  setExpandCardId(id) {
    this.expandCardId = id;
  }

  @computed
  get getUserMsg() {
    return this.userMsg;
  }

  @action
  setUserMsg(data) {
    this.userMsg = data;
  }

  @computed
  get getUserInfo() {
    return this.userInfo;
  }

  @action
  setUserInfo(data) {
    this.userInfo = data;
  }

  @action
  setReadLocal(id) {
    this.userMsg.forEach((v) => {
      if (v.id === id) v.read = true;
    });
  }

  /**
   * 不传data时默认将store中选中的消息设为已读
   * @param data
   * @returns {*|IDBRequest|Promise<void>}
   */
  @action
  readMsg(data) {
    data = data === undefined ? [...this.selectMsg] : data;
    return axios.put(`/notify/v1/notices/sitemsgs/users/${this.userInfo.id}/batch_read`, JSON.stringify(data));
  }

  /**
   * 不传data时默认将store中选中的消息设为删除
   * @param data
   * @returns {*|IDBRequest|Promise<void>}
   */
  @action
  deleteMsg(data) {
    data = data === undefined ? [...this.selectMsg] : data;
    return axios.put(`/notify/v1/notices/sitemsgs/users/${this.userInfo.id}/batch_delete`, JSON.stringify(data));
  }

  @action
  loadData(pagination = this.pagination, filters = this.filters, { columnKey = 'id', order = 'descend' }, params = this.params, showAll) {
    this.setLoading(true);
    const sorter = [];
    if (columnKey) {
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
    }
    this.loading = true;
    this.filters = filters;
    this.params = params;
    return axios.get(`/notify/v1/notices/sitemsgs/users/${this.userInfo.id}${showAll ? '' : '/not_read'}?${queryString.stringify({
      page: pagination.current - 1,
      size: pagination.pageSize,
      params: params.join(','),
      sort: sorter.join(','),
    })}`).then((data) => {
      this.setUserMsg(data.content ? data.content : data);
      this.setLoading(false);
    })
      .catch(action((error) => {
        this.setLoading(false);
        Choerodon.handleResponseError(error);
      }));
  }
}

const userMsgStore = new UserMsgStore();
export default userMsgStore;
