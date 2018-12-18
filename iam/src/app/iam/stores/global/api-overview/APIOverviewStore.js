import { action, computed, observable, toJS } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import moment from 'moment';
import querystring from 'query-string';

@store('APIOverviewStore')
class APIOverviewStore {
  @observable service = [];
  @observable firstChartData = null;
  @observable secChartData = null;
  @observable thirdChartData = null;
  @observable firstLoading = true;
  @observable secLoading = true;
  @observable thirdLoaidng = true;
  @observable secStartTime = moment().subtract(6, 'days');
  @observable secEndTime = moment();
  @observable thirdStartTime = moment().subtract(6, 'days');
  @observable thirdEndTime = moment();
  @observable currentService = {};
  @observable thirdStartDate = null;
  @observable thirdEndDate = null;

  @action setThirdStartDate(data) {
    this.thirdStartDate = data;
  }

  @computed get getThirdStartDate() {
    return this.thirdStartDate;
  }

  @action setThirdEndDate(data) {
    this.thirdEndDate = data;
  }

  @computed get getThirdEndDate() {
    return this.thirdEndDate;
  }

  @action setSecStartTime(data) {
    this.secStartTime = data;
  }

  @computed get getSecStartTime() {
    return this.secStartTime;
  }

  @action setThirdStartTime(data) {
    this.thirdStartTime = data;
  }

  @computed get getThirdStartTime() {
    return this.thirdStartTime;
  }

  @action setSecEndTime(data) {
    this.secEndTime = data;
  }

  @computed get getSecEndTime() {
    return this.secEndTime;
  }

  @action setThirdEndTime(data) {
    this.thirdEndTime = data;
  }

  @computed get getThirdEndTime() {
    return this.thirdEndTime;
  }

  @action setFirstChartData(data) {
    this.firstChartData = data;
  }

  @computed get getFirstChartData() {
    return this.firstChartData;
  }

  @action setSecChartData(data) {
    this.secChartData = data;
  }

  @computed get getSecChartData() {
    return this.secChartData;
  }

  @action setThirdChartData(data) {
    this.thirdChartData = data;
  }

  @computed get getThirdChartData() {
    return this.thirdChartData;
  }

  @action setFirstLoading(flag) {
    this.firstLoading = flag;
  }

  @action setSecLoading(flag) {
    this.secLoading = flag;
  }

  @action setThirdLoading(flag) {
    this.thirdLoaidng = flag;
  }

  @action setService(service) {
    this.service = service;
  }

  @computed get getService() {
    return this.service;
  }

  @action setCurrentService(data) {
    this.currentService = data;
  }

  @computed get getCurrentService() {
    return this.currentService;
  }


  loadFirstChart = () => axios.get('/manager/v1/swaggers/api/count')
    .then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setFirstChartData(data);
      }
      this.setFirstLoading(false);
    }).catch((error) => {
      this.setFirstLoading(false);
      Choerodon.handleResponseError(error);
    })

  loadSecChart = (beginDate, endDate) => axios.get(`/manager/v1/swaggers/service_invoke/count?begin_date=${beginDate}&end_date=${endDate}`)
    .then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setSecChartData(data);
      }
      this.setSecLoading(false);
    }).catch((error) => {
      this.setSecLoading(false);
      Choerodon.handleResponseError(error);
    })

  loadServices = () => axios.get('/manager/v1/swaggers/resources');

  loadThirdChart = (beginDate, endDate, service) => {
    const queryObj = {
      begin_date: beginDate,
      end_date: endDate,
      service,
    };
    return axios.get(`/manager/v1/swaggers/api_invoke/count?${querystring.stringify(queryObj)}`)
      .then((data) => {
        if (data.failed) {
          Choerodon.prompt(data.message);
        } else {
          if (data.apis.length) {
            const arr = data.apis.map(item => `${item.split(':')[1]}: ${item.split(':')[0]}`);
            data.apis = arr;
          }

          this.setThirdChartData(data);
        }
        this.setThirdLoading(false);
      }).catch((error) => {
        this.setThirdLoading(false);
        Choerodon.handleResponseError(error);
      });
  }
}

const apioverviewStore = new APIOverviewStore();
export default apioverviewStore;
