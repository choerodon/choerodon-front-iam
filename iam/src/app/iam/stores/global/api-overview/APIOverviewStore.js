import { action, computed, observable, toJS } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import moment from 'moment';

@store('APIOverviewStore')
class APIOverviewStore {
  @observable service = [];
  @observable firstChartData = null;
  @observable secChartData = null;
  @observable firstLoading = true;
  @observable secLoading = true;
  @observable thirdLoaidng = true;
  @observable secStartTime = moment().subtract(6, 'days');
  @observable secEndTime = moment();
  // @observable thirdStartTime = moment().subtract(6, 'days');
  // @observable thirdEndTime = moment();


  @action setSecStartTime(data) {
    this.secStartTime = data;
  }

  @computed get getSecStartTime() {
    return this.secStartTime;
  }

  // @action setThirdStartTime(data) {
  //   this.thirdStartTime = data;
  // }
  //
  // @computed get getThirdStartTime() {
  //   return this.thirdStartTime;
  // }

  @action setSecEndTime(data) {
    this.secEndTime = data;
  }

  @computed get getSecEndTime() {
    return this.secEndTime;
  }

  // @action setThirdEndTime(data) {
  //   this.thirdEndTime = data;
  // }
  //
  // @computed get getThirdEndTime() {
  //   return this.thirdEndTime;
  // }

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

  @action setFirstLoading(flag) {
    this.firstLoading = flag;
  }

  @action setSecLoading(flag) {
    this.secLoading = flag;
  }

  @action setThirdLoading(flag) {
    this.thirdLoaidng = flag;
  }


  loadFirstChart = () => axios.get('/manager/v1/swaggers/api/count')
    .then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setFirstChartData(data);
        this.setFirstLoading(false);
      }
    }).catch((error) => {
      Choerodon.handleResponseError(error);
    })

  loadSecChart = (beginDate, endDate) => axios.get(`/manager/v1/swaggers/service_invoke/count?begin_date=${beginDate}&end_date=${endDate}`)
    .then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setSecChartData(data);
        this.setSecLoading(false);
      }
    }).catch((error) => {
      Choerodon.handleResponseError(error);
    })
}

const apioverviewStore = new APIOverviewStore();
export default apioverviewStore;
