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
  @observable pagination = {};
  @observable loading = true;
  @observable currentServiceConfig = {};

  @action setLoading(flag) {
    this.loading = flag;
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

  @action setPagination(data) {
    this.pagination = data;
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

  loadInitData = () => {
    this.setLoading(true);
    this.setConfigData([]);
    this.loadService().then((res) => {
      this.setService(res.content || []);
      const response = this.handleProptError(res);
      if (response) {
        const { content } = res;
        if (content.length) {
          const defaultService = content[0];
          this.setCurrentService(defaultService);
          this.loadConfig(defaultService.id,
            { current: 1, pageSize: 10 },
            { columnKey: 'id', order: 'descend' });
        } else {
          this.setLoading(false);
        }
      }
    })
  }

  loadService() {
    return axios.get('manager/v1/services/page')
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

  // loadConfig(
  //   serviceId,
  //   { current = 1, pageSize = 10 },
  //   { columnKey = 'id', order = 'descend' },
  //   params) {
  //   this.setLoading(true);
  //   const queryObj = {
  //     serviceId,
  //     page: current - 1,
  //     size: pageSize,
  //     params,
  //   };
  //   if (columnKey) {
  //     const sorter = [];
  //     sorter.push(columnKey);
  //     if (order === 'descend') {
  //       sorter.push('desc');
  //     }
  //     queryObj.sort = sorter.join(',');
  //   }
  //   axios.get(`/manager/v1/configs?${querystring.stringify(queryObj)}`).then((res) => {
  //     const response = this.handleProptError(res);
  //     if (response) {
  //       this.setConfigData(res.content || []);
  //       this.setPagination({
  //         current: res.number + 1,
  //         pageSize: res.size,
  //         total: res.totalElements,
  //       });
  //     }
  //     this.setLoading(false);
  //   }).catch((error) => {
  //     this.setLoading(false);
  //     Choerodon.prompt(error.message);
  //   });
  // }

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
