import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('ExecutionRecordStore')
class ExecutionRecordStore {
  @observable data = [];

  @action setData(data) {
    this.data = data;
  }

  @computed get getData() {
    return this.data;
  }

  loadData(
    { current, pageSize },
    { status, email, retryStatus },
    { columnKey = 'id', order = 'descend' },
    params) {
    const queryObj = {
      page: current - 1,
      size: pageSize,
      status,
      email,
      retryStatus,
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
    return axios.get(`/notify/v1/records/emails?${querystring.stringify(queryObj)}`);
  }
}

const executionRecordStore = new ExecutionRecordStore();
export default executionRecordStore;
