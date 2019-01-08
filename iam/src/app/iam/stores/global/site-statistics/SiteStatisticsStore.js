import { action, computed, observable, toJS } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import moment from 'moment';
import querystring from 'query-string';
import _ from 'lodash';

@store('SiteStatisticsStore')
class SiteStatisticsStore {
  @observable chartData = null;
  @observable startTime = moment().subtract(6, 'days');
  @observable endTime = moment();
  @observable currentLevel = 'site';
  @observable startDate = null;
  @observable endDate = null;
  @observable loading = false;

  @action setStartDate(data) {
    this.startDate = data;
  }

  @computed get getStartDate() {
    return this.startDate;
  }

  @action setEndDate(data) {
    this.endDate = data;
  }

  @computed get getEndDate() {
    return this.endDate;
  }

  @action setStartTime(data) {
    this.startTime = data;
  }

  @computed get getStartTime() {
    return this.startTime;
  }

  @action setEndTime(data) {
    this.endTime = data;
  }

  @computed get getEndTime() {
    return this.endTime;
  }

  @action setChartData(data) {
    this.chartData = data;
  }

  @computed get getChartData() {
    return this.chartData;
  }

  @action setLoading(flag) {
    this.loading = flag;
  }

  @action setCurrentLevel(data) {
    this.currentLevel = data;
  }

  @computed get getCurrentLevel() {
    return this.currentLevel;
  }

  loadChart = (beginDate, endDate, level) => {
    const queryObj = {
      begin_date: beginDate,
      end_date: endDate,
      level,
    };
    return axios.get(`/manager/v1/statistic/menu_click?${querystring.stringify(queryObj)}`)
      .then((data) => {
        if (data.failed) {
          Choerodon.prompt(data.message);
        } else {
          if (data.menu.length) {
            const arr = data.menu.map(item => `${item.split(':')[1]}: ${item.split(':')[0]}`);
            data.menu = arr;
          }

          this.setChartData(data);
        }
        this.setLoading(false);
      }).catch((error) => {
        this.setLoading(false);
        Choerodon.handleResponseError(error);
      });
  }
}

const siteStatisticsStore = new SiteStatisticsStore();
export default siteStatisticsStore;
