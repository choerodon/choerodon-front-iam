/**
 * Created by jinqin.ma on 2017/6/27.
 */

import { action, computed, observable } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import queryString from 'query-string';
import { handleFiltersParams } from '../../../common/util';

const { AppState } = stores;

@store('ApplicationStore')
class ApplicationStore {
  @observable applicationData = [];
  @observable projectData = [];
  @observable loading = false;
  @observable sidebarVisible = false;
  @observable pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  @observable filters = {};
  @observable sort = {};
  @observable params = [];
  @observable editData = null;
  @observable operation;
  @observable submitting = false;

  refresh() {
    this.loadProject();
    this.loadData({ current: 1, pageSize: 10 }, {}, {}, []);
  }

  @action
  setEditData(data) {
    this.editData = data;
  }

  @action
  setSubmitting(flag) {
    this.submitting = flag;
  }

  @action
  setOperation(data) {
    this.operation = data;
  }

  @action
  showSidebar() {
    this.sidebarVisible = true;
  }

  @action
  closeSidebar() {
    this.sidebarVisible = false;
  }

  constructor(totalPage = 1, totalSize = 0) {
    this.totalPage = totalPage;
    this.totalSize = totalSize;
  }

  @action
  loadProject() {
    axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/projects?page=-1`).then(action((data) => {
      if (!data.failed) {
        this.projectData = data.content;
      }
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
    // 若params或filters含特殊字符表格数据置空
    const isIncludeSpecialCode = handleFiltersParams(params, filters);
    if (isIncludeSpecialCode) {
      this.dashboardData.length = 0;
      this.pagination = {
        current: 1,
        pageSize: 10,
        total: 0,
      };
      this.loading = false;
      return;
    }

    return axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications?${queryString.stringify({
      page: pagination.current - 1,
      size: pagination.pageSize,
      name: filters.name,
      code: filters.code,
      enabled: filters.enabled,
      params: params.join(','),
      sort: sorter.join(','),
    })}`)
      .then(action(({ failed, content, totalElements }) => {
        if (!failed) {
          this.applicationData = content;
          this.pagination = {
            ...pagination,
            total: totalElements,
          };
        }
        this.loading = false;
      }))
      .catch(action((error) => {
        Choerodon.handleResponseError(error);
        this.loading = false;
      }));
  }
  createApplication = applicationData =>
    axios.post(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications`, JSON.stringify(applicationData));

  updateApplication = (applicationData, id) =>
    axios.put(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}`, JSON.stringify(applicationData));

  enableApplication = id => axios.put(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}/enable`);

  disableApplication = id => axios.put(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}/disable`);

  checkApplicationCode = codes => axios.post(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/check`, JSON.stringify(codes));
}

const applicationStore = new ApplicationStore();
export default applicationStore;
