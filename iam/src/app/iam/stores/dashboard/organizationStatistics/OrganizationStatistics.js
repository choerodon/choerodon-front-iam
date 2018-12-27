import { action, computed, observable, toJS } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import moment from 'moment';

@store('OrganizationStatisticsStore')
class OrganizationStatisticsStore {
  @observable loading = true;
  // @observable showSize = 220;
  @observable organizations = [];
  @observable currentorg = null;
  @observable chartData = {};

  @action setLoading(flag) {
    this.loading = flag;
  }

  // @action
  // setShowSize(size) {
  //   this.showSize = size;
  // }

  @action setChartData(data) {
    this.chartData = data;
  }

  @computed get getChartData() {
    return this.chartData;
  }

  @action setOrganizations(data) {
    this.organizations = data;
  }

  @computed get getOrganizations() {
    return this.organizations;
  }

  @action setCurrentOrg(data) {
    this.currentorg = data;
  }

  @computed get getCurrentOrg() {
    return this.currentorg;
  }

  @action loadOrganizations = () => axios.get('/iam/v1/organizations/all')
    .then(action((data) => {
      this.organizations = data;
      if (data.length) {
        this.currentorg = data[0].id;
        this.loadPie(data[0].id);
      }
    }))

  @action loadPie = id => axios.get(`/iam/v1/organizations/${id}/projects/under_the_type`)
    .then(action(
      (data) => {
        this.chartData = data;
        this.loading = false;
      },
    ))
}

const organizationStatisticsStore = new OrganizationStatisticsStore();
export default organizationStatisticsStore;
