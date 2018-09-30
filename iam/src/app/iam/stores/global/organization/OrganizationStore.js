/**
 * Created by jinqin.ma on 2017/6/27.
 */
import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import queryString from 'query-string';

@store('OrganizationStore')
class OrganizationStore {
  @observable orgData = [];
  @observable loading = false;
  @observable submitting = false;
  @observable show;
  @observable sidebarVisible = false;
  @observable pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  @observable filters = {};
  @observable sort = {};
  @observable params = [];
  @observable editData = {};
  @observable myOrg = {};
  @observable myRoles = [];

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

  refresh() {
    this.loadData({ current: 1, pageSize: 10 }, {}, {}, []);
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
    return axios.get(`/iam/v1/organizations?${queryString.stringify({
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
          this.orgData = content;
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

  toggleDisable(id, enabled) {
    return axios.put(`/iam/v1/organizations/${id}/${enabled ? 'disable' : 'enable'}`)
      .then(() => this.loadData());
  }

  checkCode = value =>
    axios.post('/iam/v1/organizations/check', JSON.stringify({ code: value }));

  @action
  createOrUpdateOrg({ code, name }, modify, HeaderStore) {
    const { show, editData: { id, code: originCode, objectVersionNumber } } = this;
    const isCreate = show === 'create';
    if (!modify && !isCreate) {
      return Promise.resolve('modify.success');
    } else {
      let url;
      let body;
      let message;
      let method;
      if (isCreate) {
        url = '/org/v1/organizations';
        body = {
          name,
          code,
        };
        message = 'create.success';
        method = 'post';
      } else {
        url = `/iam/v1/organizations/${id}`;
        body = {
          name,
          objectVersionNumber,
          code: originCode,
        };
        message = 'modify.success';
        method = 'put';
      }
      this.submitting = true;
      return axios[method](url, JSON.stringify(body))
        .then(action((data) => {
          this.submitting = false;
          if (data.failed) {
            return data.message;
          } else {
            this.sidebarVisible = false;
            if (isCreate) {
              this.refresh();
              HeaderStore.addOrg(data);
            } else {
              this.loadData();
              HeaderStore.updateOrg(data);
            }
            return message;
          }
        }))
        .catch(action((error) => {
          this.submitting = false;
          Choerodon.handleResponseError(error);
        }));
    }
  }

  getOrgById = organizationId =>
    axios.get(`/iam/v1/organizations/${organizationId}`);

  getOrgByIdOrgLevel = organizationId =>
    axios.get(`/iam/v1/organizations/${organizationId}/org_level`);

  getRolesById = (organizationId, userId) =>
    axios.get(`/iam/v1/organizations/${organizationId}/role_members/users/${userId}`);

  loadMyData(organizationId, userId) {
    axios.all([
      this.getOrgByIdOrgLevel(organizationId),
      this.getRolesById(organizationId, userId),
    ])
      .then(action(([org, roles]) => {
        this.myOrg = org;
        this.myRoles = roles;
      }))
      .catch(Choerodon.handleResponseError);
  }
}

export default new OrganizationStore();
