import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('TaskDetailStore')
class TaskDetailStore {
  @observable data = [];
  @observable service = [];
  @observable info = {}; // 任务信息
  @observable log = []; // 任务日志
  @observable currentService = {};
  @observable classNames = []; // 任务类名下拉框数据
  @observable currentClassNames = {}; // 当前任务程序
  @observable currentTask = {};

  @action setData(data) {
    this.data = data;
  }

  @computed get getData() {
    return this.data;
  }

  @action setLog(data) {
    this.log = data;
  }

  @computed get getLog() {
    return this.log;
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

  @action setClassNames(data) {
    this.classNames = data;
  }

  @computed get getClassNames() {
    return this.classNames;
  }

  @action setInfo(data) {
    this.info = data;
    if (this.info.simpleRepeatCount != null) this.info.simpleRepeatCount += 1;
  }

  @action setCurrentTask(data) {
    this.currentTask = data;
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

  loadLogData(
    { current, pageSize },
    { status, serviceInstanceId },
    { columnKey = 'id', order = 'descend' },
    params, taskId) {
    const queryObj = {
      page: current - 1,
      size: pageSize,
      status,
      serviceInstanceId,
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
    return axios.get(`/asgard/v1/schedules/tasks/instances/${taskId}?${querystring.stringify(queryObj)}`);
  }

  loadService = () => axios.get('manager/v1/services');

  loadClass = service => axios.get(`/asgard/v1/schedules/methods/service?service=${service}`)

  loadParams = id => axios.get(`/asgard/v1/schedules/methods/${id}`);

  ableTask = (id, objectVersionNumber, status) => axios.put(`/asgard/v1/schedules/tasks/${id}/${status}?objectVersionNumber=${objectVersionNumber}`);

  deleteTask = id => axios.delete(`/asgard/v1/schedules/tasks/${id}`);

  checkName = name => axios.post(`/asgard/v1/schedules/tasks/check?name=${name}`);

  createTask = body => axios.post('/asgard/v1/schedules/tasks', JSON.stringify(body));

  loadInfo = id => axios.get(`/asgard/v1/schedules/tasks/${id}`);

  checkCron = body => axios.post('/asgard/v1/schedules/tasks/cron', body);
}


const taskDetailStore = new TaskDetailStore();
export default taskDetailStore;
