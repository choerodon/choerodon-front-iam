import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('TaskDetailStore')
class TaskDetailStore {
  @observable data = [];

  @action setData(data) {
    this.data = data;
  }

  @computed get getData() {
    return this.data;
  }

  loadData(
    { current, pageSize },
    { status, name, description },
    { columnKey = 'id', order = 'descend' },
    params) {
    const queryObj = {
      page: current - 1,
      size: pageSize,
      status,
      name,
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
    return axios.get(`asgard/v1/schedules/tasks?${querystring.stringify(queryObj)}`);
  }
}

const taskDetailStore = new TaskDetailStore();
export default taskDetailStore;
