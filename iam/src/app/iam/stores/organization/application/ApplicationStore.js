import { action, computed, observable } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import queryString from 'query-string';
import { handleFiltersParams } from '../../../common/util';

const { AppState } = stores;

class TreeData {
  treeDatas = [];
  constructor(data) {
    if (data.length > 0) {
      this.treeDatas.push({ ...data[0], children: null });
      if (data.length > 1) {
        this.treeDatas[0].children = this.dfsAdd(data[0].applicationId, data);
      }
    }
  }
  dfsAdd = (rootId, data) => data.filter(v => (v.parentId === rootId)).map((v) => {
    const children = this.dfsAdd(v.applicationId, data);
    if (children.length > 0) {
      return ({ ...v, children });
    }
    return v;
  });
}

@store('ApplicationStore')
class ApplicationStore {
  /**
   * 应用列表数据
   * @type {Array}
   */
  @observable applicationData = [];

  /**
   * 应用树数据
   * @type {Array}
   */
  @observable applicationTreeData = [];

  /**
   * 应用清单数据
   * @type {Array}
   */
  @observable applicationListData = [];

  /**
   * 组织内的项目数据
   * @type {Array}
   */
  @observable projectData = [];

  /**
   * 可选择的数据
   * @type {Array}
   */
  @observable addListData = [];
  @observable selectedRowKeys = [];
  /**
   * 创建按钮是否正在加载中
   * @type {boolean}
   */
  @observable loading = false;

  @observable addListLoading = false;
  @observable listLoading = false;
  @observable sidebarVisible = false;
  @observable pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  @observable listPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  @observable addListPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  @observable filters = {};
  @observable sort = {};
  @observable params = [];
  @observable listParams = [];
  @observable editData = null;
  @observable operation;
  @observable submitting = false;

  refresh() {
    this.loadProject();
    this.loadData();
  }

  @action
  initSelectedKeys() {
    if (this.applicationTreeData.length > 0) {
      if (this.applicationTreeData[0].children && this.applicationTreeData[0].children.length > 0) {
        this.selectedRowKeys = this.applicationTreeData[0].children.map(v => v.applicationId);
      } else {
        this.selectedRowKeys = [];
      }
    } else {
      this.selectedRowKeys = [];
    }
  }

  @action
  setSelectedRowKeys(keys) {
    this.selectedRowKeys = keys;
  }

  getProjectById(id) {
    const value = this.projectData.filter(v => v.id === id);
    return value.length > 0 ? value[0] : { name: null, imageUrl: null };
  }

  @computed
  get getDataSource() {
    return this.applicationData.map(v => ({ ...v, projectName: this.getProjectById(v.projectId).name, imageUrl: this.getProjectById(v.projectId).imageUrl }));
  }

  @computed
  get getAddListDataSource() {
    return this.addListData.map(v => ({ ...v, projectName: this.getProjectById(v.projectId).name, imageUrl: this.getProjectById(v.projectId).imageUrl }));
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
  loadTreeData(id) {
    return axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}/descendant`).then(action((data) => {
      if (!data.failed) {
        const treeData = new TreeData(data);
        this.applicationTreeData = treeData.treeDatas.map(v => ({ ...v, projectName: this.getProjectById(v.projectId).name, imageUrl: this.getProjectById(v.projectId).imageUrl }));
        this.initSelectedKeys();
      }
    }));
  }

  @action
  loadListData(pagination = this.listPagination, filters, sort, params = this.listParams) {
    this.listLoading = true;
    this.listParams = params;

    return axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${this.editData.id}/app_list?${queryString.stringify({
      page: pagination.current - 1,
      size: pagination.pageSize,
      params: params.join(','),
    })}`)
      .then(action(({ failed, content, totalElements }) => {
        if (!failed) {
          this.applicationListData = content;
          this.listPagination = {
            ...pagination,
            total: totalElements,
          };
        }
        this.listLoading = false;
      }))
      .catch(action((error) => {
        Choerodon.handleResponseError(error);
        this.listLoading = false;
      }));
  }

  @action
  loadAddListData(id) {
    return axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}/enabled_app`).then(action((data) => {
      if (!data.failed) {
        this.addListData = data;
      } else {
        Choerodon.prompt(data.message);
      }
    }));
  }

  // @action
  // loadAddListData(id, pagination = this.addListPagination) {
  //   this.addListLoading = true;
  //   return axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}/enabled_app?${queryString.stringify({
  //     page: pagination.current - 1,
  //     size: pagination.pageSize,
  //   })}`).then(action(({ failed, content, totalElements, message }) => {
  //     if (!failed) {
  //       this.addListData = content;
  //       this.applicationData = content;
  //       this.addListPagination = {
  //         ...pagination,
  //         total: totalElements,
  //       };
  //       this.addListLoading = false;
  //     } else {
  //       Choerodon.prompt(message);
  //     }
  //   }));
  // }


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
    axios.post(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}`, JSON.stringify(applicationData));

  enableApplication = id => axios.put(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}/enable`);

  disableApplication = id => axios.put(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}/disable`);

  checkApplicationCode = codes => axios.post(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/check`, JSON.stringify(codes));

  /**
   * 添加到组合应用中
   * @param id {Number}
   * @param ids {Array}
   * @returns {Promise}
   */
  addToCombination = (id, ids) => axios.post(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/applications/${id}/add_to_combination`, JSON.stringify(ids));
}

const applicationStore = new ApplicationStore();
export default applicationStore;
