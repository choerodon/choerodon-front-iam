import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import queryString from 'query-string';

const PAGELOADSIZE = 5;

@store('UserMsgStore')
class UserMsgStore {
  @observable userMsg = [];

  @observable userInfo = {};

  @observable expandCardId = 0;

  @observable selectMsg = new Set();

  @observable loading = true;

  @observable pagination= {
    current: 1,
    pageSize: PAGELOADSIZE,
    total: 0,
    totalPages: 0,
  };

  @observable sort = {
    columnKey: 'id',
    order: 'descend',
  };

  @observable filters = {};

  @observable params = [];

  @observable loadingMore = false;

  @action
  initPagination() {
    this.pagination = {
      current: 1,
      pageSize: PAGELOADSIZE,
      total: 0,
      totalPages: 0,
    };
  }

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

  @computed
  get getLoadingMore() {
    return this.loadingMore;
  }

  @action
  setLoadingMore(flag) {
    this.loadingMore = flag;
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

  @computed
  get isNoMore() {
    return this.pagination.current === this.pagination.totalPages;
  }

  /**
   * 不传data时默认将store中选中的消息设为已读
   * @param data
   * @returns {*|IDBRequest|Promise<void>}
   */
  @action
  readMsg(data) {
    data = data === undefined ? [...this.selectMsg] : data;
    return axios.put(`/notify/v1/notices/sitemsgs/batch_read?user_id=${this.userInfo.id}`, JSON.stringify(data));
  }

  /**
   * 不传data时默认将store中选中的消息设为删除
   * @param data
   * @returns {*|IDBRequest|Promise<void>}
   */
  @action
  deleteMsg(data) {
    data = data === undefined ? [...this.selectMsg] : data;
    return axios.put(`/notify/v1/notices/sitemsgs/batch_delete?user_id=${this.userInfo.id}`, JSON.stringify(data));
  }

  @action
  loadMore(showAll) {
    if (this.pagination.totalPages > this.pagination.current && showAll) {
      this.setLoadingMore(true);
      this.pagination.current += 1;
      this.load(this.pagination, this.filters, this.sort, this.params, showAll).then(action((data) => {
        this.setUserMsg(this.userMsg.concat(data.content));
        this.setLoadingMore(false);
      })).catch(action((error) => {
        this.setLoadingMore(false);
        Choerodon.handleResponseError(error);
      }));
    }
  }

  @action load(pagination = this.pagination, filters = this.filters, { columnKey = 'id', order = 'descend' }, params = this.params, showAll) {
    const sorter = [];
    if (columnKey) {
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
    }
    this.filters = filters;
    this.params = params;
    return axios.get(`/notify/v1/notices/sitemsgs?${queryString.stringify({
      user_id: this.userInfo.id,
      read: showAll ? null : false,
      page: pagination.current - 1,
      size: pagination.pageSize,
      params: params.join(','),
      sort: sorter.join(','),
    })}`);
  }

  @action
  loadData(pagination = this.pagination, filters = this.filters, { columnKey = 'id', order = 'descend' }, params = this.params, showAll, isWebSocket) {
    if (!showAll) {
      // 在未读消息中显示尽量多的消息
      pagination.pageSize = 100;
    }
    if (isWebSocket) this.setLoadingMore(true); else this.setLoading(true);
    this.load(pagination, filters, { columnKey, order }, params, showAll).then(action((data) => {
      this.setUserMsg(data.content ? data.content : data);
      this.pagination.totalPages = data.content ? data.totalPages : data.length / PAGELOADSIZE + 1;
      if (isWebSocket) this.setLoadingMore(false); else this.setLoading(false);
    }))
      .catch(action((error) => {
        if (isWebSocket) this.setLoadingMore(false); else this.setLoading(false);
        Choerodon.handleResponseError(error);
      }));
  }
}

const userMsgStore = new UserMsgStore();
export default userMsgStore;
