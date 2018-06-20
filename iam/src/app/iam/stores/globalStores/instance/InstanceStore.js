/**
 * Created by hulingfangzi on 2018/6/20.
 */
import { action, computed, observable } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
const { AppState } = stores;
import querystring from 'query-string';

@store('InstanceStore')
class InstanceStore {
  @observable service = [];
  @observable currentService = {};
  @observable loading = true;
  @observable instanceData = [];

  @action setLoading(flag) {
    this.loading = flag;
  }

  @action setCurrentService(data) {
    this.currentService = data;
  }

  @computed get getCurrentService() {
    return this.currentService;
  }

  @action setInstanceData(data) {
    this.instanceData = data;
  }

  @computed get getInstanceData() {
    return this.instanceData;
  }

  @action setService(data) {
    this.service = data;
  }

  loadService = () => axios.get('manager/v1/services');
}

const instanceStore = new InstanceStore();
export default instanceStore;
