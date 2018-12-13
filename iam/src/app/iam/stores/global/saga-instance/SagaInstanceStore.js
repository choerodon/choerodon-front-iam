import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('SagaInstanceStore')
class SagaInstanceStore {
  @observable loading = true;
  @observable data = [];
  @observable taskData = [];
  @observable statistics = {
    COMPLETED: 0,
    FAILED: 0,
    RUNNING: 0,
    ROLLBACK: 0,
  };

  sagaInstanceType = null;

  @action
  setData(data) {
    this.data = data;
  }

  @action
  setTaskData(data) {
    this.taskData = data;
  }

  @computed
  get getStatistics() {
    return this.statistics;
  }

  @computed
  get getData() {
    return this.data;
  }

  @computed
  get getTaskData() {
    return this.taskData;
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
    return axios.get(`${this.sagaInstanceType.apiGetway}instances/${id}`);
  }

  /**
   * 加载统计数据
   * @returns {*}
   */
  @action
  loadStatistics() {
    return axios.get(`${this.sagaInstanceType.apiGetway}instances/statistics`).then(action((data) => {
      this.statistics = data;
    }));
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
   * @param taskInstanceCode
   * @param sagaInstanceCode
   * @param description
   * @param columnKey
   * @param order
   * @param params
   * @param sagaInstanceType
   * @param type
   */
  loadData(
    { current, pageSize },
    { id, status, sagaCode, refType, refId, taskInstanceCode, sagaInstanceCode, description },
    { columnKey = 'id', order = 'descend' },
    params,
    sagaInstanceType,
    type) {
    this.sagaInstanceType = sagaInstanceType;
    const queryObj = type !== 'task' ? {
      page: current - 1,
      size: pageSize,
      id,
      status,
      sagaCode,
      refType,
      refId,
      params,
    } : {
      page: current - 1,
      size: pageSize,
      id,
      status,
      taskInstanceCode,
      sagaInstanceCode,
      description,
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
    switch (type) {
      case 'instance':
        return axios.get(`${sagaInstanceType.apiGetway}instances?${querystring.stringify(queryObj)}`);
      case 'task':
        return axios.get(`${sagaInstanceType.apiGetway}tasks/instances?${querystring.stringify(queryObj)}`);
      default:
        return axios.get(`${sagaInstanceType.apiGetway}instances?${querystring.stringify(queryObj)}`);
    }
  }
}

const sagaInstanceStore = new SagaInstanceStore();

export default sagaInstanceStore;
