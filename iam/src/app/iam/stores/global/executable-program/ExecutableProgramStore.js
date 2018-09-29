import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('ExecutableProgramStore')
class ExecutableProgramStore {
  @observable data = [];
  @observable detail = {};

  @action setData(data) {
    this.data = data;
  }

  @computed get getData() {
    return this.data;
  }

  @action setDetail(data) {
    this.detail = data;
  }

  @computed get getDetail() {
    return this.detail;
  }

  loadData(
    { current, pageSize },
    { code, service, method, description },
    { columnKey = 'id', order = 'descend' },
    params) {
    const queryObj = {
      page: current - 1,
      size: pageSize,
      code,
      service,
      method,
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
    return axios.get(`/asgard/v1/schedules/methods?${querystring.stringify(queryObj)}`);
  }

  loadProgramDetail = id => axios.get(`/asgard/v1/schedules/methods/${id}`);
}

const executableProgramStore = new ExecutableProgramStore();
export default executableProgramStore;
