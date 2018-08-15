import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import queryString from 'query-string';

@store('DashboardSettingStore')
class DashboardSettingStore {
  @observable dashboardData = [];
  @observable loading = false;
  @observable sidebarVisible = false;
  @observable pagination = {
    current: 1,
    pageSize: 10,
  };
  @observable filters = {};
  @observable sort = {};
  @observable params = [];
  @observable total = 0;
  @observable editData = {};

  refresh() {
    this.loadData({ current: 1, pageSize: 10 }, {}, {}, []);
  }

  @action
  setEditData(data) {
    this.editData = data;
  }

  @action
  showSideBar() {
    this.sidebarVisible = true;
  }

  @action
  hideSideBar() {
    this.sidebarVisible = false;
  }

  @action
  updateData(values) {
    this.loading = true;
    return axios.post(`/iam/v1/dashboards/${this.editData.id}`, JSON.stringify(Object.assign({}, this.editData, values)))
      .then(action((data) => {
        Object.assign(this.editData, data);
        this.loading = false;
        this.sidebarVisible = false;
        return data;
      }))
      .catch(action((error) => {
        Choerodon.handleResponseError(error);
        this.loading = false;
      }));
  }

  @action
  loadData(pagination = this.pagination, filters = this.filters, sort = this.sort, params = this.params) {
    const { columnKey, order } = sort;
    const sorter = [];
    if (columnKey) {
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
    }
    this.loading = true;
    this.filters = filters;
    this.sort = sort;
    this.params = params;
    return axios.get(`/iam/v1/dashboards?${queryString.stringify({
      page: pagination.current - 1,
      size: pagination.pageSize,
      name: filters.name,
      code: filters.code,
      level: filters.level,
      params: params.join(','),
      sort: sorter.join(','),
    })}`)
      .then(action(({ failed, content, size, totalElements }) => {
        if (!failed) {
          this.dashboardData = content;
          this.pagination = pagination;
          this.total = totalElements;
        }
        this.loading = false;
      }))
      .catch(action((error) => {
        Choerodon.handleResponseError(error);
        this.loading = false;
      }));
  }
}

const dashboardSettingStore = new DashboardSettingStore();

export default dashboardSettingStore;
