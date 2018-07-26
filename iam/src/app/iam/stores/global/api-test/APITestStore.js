/**
 * Created by hulingfangzi on 2018/7/9.
 */
import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('ApitestStore')
class ApitestStore {
  @observable service = [];
  @observable currentService = {};
  @observable apiData = [];
  @observable loading = true;
  @observable apiDetail = {};

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

  @action setApiData(data) {
    this.apiData = data;
  }

  @computed get getApiData() {
    return this.apiData;
  }

  @action setApiDetail(data) {
    this.apiDetail = data;
  }

  @computed get getApiDetail() {
    return this.apiDetail;
  }

  loadService = () => axios.get('manager/v1/swaggers/resources');
}

const apitestStore = new ApitestStore();
export default apitestStore;
