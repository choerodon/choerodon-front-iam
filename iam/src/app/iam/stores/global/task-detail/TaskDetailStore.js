import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('TaskDetailStore')
class TaskDetailStore {
  @observable data = [];
  @observable service = [];
  @observable currentService = {};
  @observable classWithParams = {}; // 根据服务名得到的所有任务类名及参数
  @observable classNames = []; // 任务类名下拉框数据
  @observable currentClassNames = {}; // 当前任务程序

  @action setData(data) {
    this.data = data;
  }

  @computed get getData() {
    return this.data;
  }

  @action setService(data) {
    this.service = data;
  }

  @action setCurrentService(data) {
    this.currentService = data;
  }

  @computed get getCurrentService() {
    return this.currentService;
  }

  @action setCurrentClassNames(data) {
    this.currentClassNames = data;
  }

  @computed get getCurrentClassNames() {
    return this.currentClassNames;
  }


  @action setClassWithParams(data) {
    this.classWithParams = data;
  }

  @computed get getClassWithParams() {
    return this.classWithParams;
  }

  @action setClassNames(data) {
    this.classNames = data;
  }

  @computed get getClassNames() {
    return this.classNames;
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

  loadService = () => axios.get('manager/v1/services');

  loadClass = service => axios.get(`/asgard/v1/schedules/methods/service?service=${service}`)

  loadParams = id => axios.get(`/asgard/v1/schedules/methods/${id}`);

  ableTask = (id, objectVersionNumber, status) => axios.put(`/asgard/v1/schedules/tasks/${id}/${status}?objectVersionNumber=${objectVersionNumber}`);

  deleteTask = id => axios.delete(`/asgard/v1/schedules/tasks/${id}`);
}


const taskDetailStore = new TaskDetailStore();
export default taskDetailStore;
