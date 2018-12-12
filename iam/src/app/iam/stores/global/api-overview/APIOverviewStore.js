import { action, computed, observable, toJS } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('APIOverviewStore')
class APIOverviewStore {
  @observable service = [];
  @observable firstChartData = null;
  @observable firstLoading = true;
  @observable secLoading = true;
  @observable thirdLoaidng = true;

  @action setFirstChartData(data) {
    this.firstChartData = data;
  }

  @computed get getFirstChartData() {
    return this.firstChartData;
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
}

const apioverviewStore = new APIOverviewStore();
export default apioverviewStore;
