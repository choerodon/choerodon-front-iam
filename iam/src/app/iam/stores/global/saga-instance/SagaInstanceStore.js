import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('SagaInstanceStore')
class SagaInstanceStore {
  @observable loading = true;
  @observable data = [];

  @action
  setData(data) {
    this.data = data;
  }

  @computed
  get getData() {
    return this.data;
  }

  @action
  setLoading(loading) {
    this.loading = loading;
  }

  @computed
  get getLoading() {
    return this.loading;
  }

  /**
   * 重试
   * @param id
   * @returns {IDBRequest | Promise<void>}
   */
  retry(id) {
    return axios.put(`/asgard/v1/sagas/tasks/instances/${id}/retry`);
  }

  /**
   * 解锁
   */
  unLock(id) {
    return axios.put(`/asgard/v1/sagas/tasks/instances/${id}/unlock`);
  }

  /**
   * 详情
   * @param id
   */
  loadDetailData(id) {
    return axios.get(`/asgard/v1/sagas/instances/${id}`);
  }

  /**
   * 初始数据
   * @param current
   * @param pageSize
   * @param id
   * @param status
   * @param sagaCode
   * @param refType
   * @param refId
   * @param columnKey
   * @param order
   * @param params
   */
  loadData(
    { current, pageSize },
    { id, status, sagaCode, refType, refId },
    { columnKey = 'id', order = 'descend' },
    params) {
    const queryObj = {
      page: current - 1,
      size: pageSize,
      id,
      status,
      sagaCode,
      refType,
      refId,
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
    return axios.get(`/asgard/v1/sagas/instances?${querystring.stringify(queryObj)}`);
  }
}

const sagaInstanceStore = new SagaInstanceStore();

export default sagaInstanceStore;
