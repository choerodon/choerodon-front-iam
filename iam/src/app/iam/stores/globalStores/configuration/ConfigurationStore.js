/**
 * Created by hulingfangzi on 2018/6/12.
 */
import { action, computed, observable } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
const { AppState } = stores;
import querystring from 'query-string';

@store('ConfigurationStore')
class ConfigurationStore {
  @observable service = [];
  @observable currentService = {};
  @observable configData = [];
  @observable instanceData = [];
  @observable pagination = {};
  @observable loading = true;
  @observable instanceLoading = true;
  @observable currentServiceConfig = {};
  @observable currentConfigId = null;
  @observable status = 'create';
  @observable editConfig = null;

  @action setStatus(data) {
    this.status = data;
  }

  @computed get getStatus(){
    return this.status;
  }

  @action setLoading(flag) {
    this.loading = flag;
  }

  @action setInstanceLoading(flag) {
    this.instanceLoading = flag;
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

  @action setConfigData(data) {
    this.configData = data;
  }

  @computed get getConfigData() {
    return this.configData;
  }

  @action setCurrentServiceConfig(data) {
    this.currentServiceConfig = data;
  }

  @computed get getCurrentServiceConfig() {
    return this.currentServiceConfig;
  }

  @action setInstanceData(data) {
    this.instanceData = data;
  }

  @computed get getInstanceData() {
    return this.instanceData;
  }

  @action setCurrentConfigId(data) {
    this.currentConfigId = data;
  }

  @computed get getCurrentConfigId() {
    return this.currentConfigId;
  }

  @action setEditConfig(data) {
    this.editConfig = data;
  }

  @computed get getEditConfig(){
    return this.editConfig;
  }

  loadService() {
    return axios.get('manager/v1/services')
      .then(datas => this.handleProptError(datas));
  }

  loadCurrentServiceConfig(serviceId) {
    const queryObj = {
      serviceId,
      page: 0,
      size: 200,
    };
    axios.get(`/manager/v1/configs?${querystring.stringify(queryObj)}`).then(data => this.setCurrentServiceConfig(data.content.slice()))
  }

  deleteConfig = (configId) => axios.delete(`manager/v1/configs/${configId}`);

  setDefaultConfig = (configId) => axios.put(`manager/v1/configs/${configId}/default`)

  createConfig = (data) => axios.post(`manager/v1/configs`, JSON.stringify(data))

  handleProptError = (error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}
const configurationStore = new ConfigurationStore();
export default configurationStore;
