/**
 * Created by jinqin.ma on 2017/6/27.
 */

import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';


@store('ProjectStore')
class ProjectStore {
  @observable projectData = [];
  @observable totalSize;
  @observable totalPage;
  @observable isLoading = true;
  @observable myRoles = [];

  constructor(totalPage = 1, totalSize = 0) {
    this.totalPage = totalPage;
    this.totalSize = totalSize;
  }

  @action
  setTotalSize(totalSize) {
    this.totalSize = totalSize;
  }

  @computed
  get getTotalSize() {
    return this.totalSize;
  }

  @action
  setTotalPage(totalPage) {
    this.totalPage = totalPage;
  }

  @computed
  get getTotalPage() {
    return this.totalPage;
  }

  @action
  setProjectData(data) {
    this.projectData = data;
  }

  @computed
  get getProjectData() {
    return this.projectData.slice();
  }

  @action
  changeLoading(flag) {
    this.isLoading = flag;
  }

  @computed
  get getIsLoading() {
    return this.isLoading;
  }

  loadProject = (organizationId,
    { current, pageSize },
    { columnKey = 'id', order = 'descend' },
    { name, code, enabled, params }) => {
    this.changeLoading(true);
    const queryObj = {
      page: current - 1,
      size: pageSize,
      name,
      code,
      enabled,
      params,
    };
    if (columnKey) {
      const sorter = [];
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
      queryObj.sort = sorter.join(',');
    }
    return axios.get(`/iam/v1/organizations/${organizationId}/projects?${querystring.stringify(queryObj)}`);
  };

  enableProject(orgId, projectId, data) {
    return data ? axios.put(`/iam/v1/organizations/${orgId}/projects/${projectId}/disable`) : axios.put(`/iam/v1/organizations/${orgId}/projects/${projectId}/enable`);
  }

  checkProjectName = organizationId =>
    axios.get(`/iam/v1/organization/${organizationId}/projects/self`);

  checkProjectCode = (orgId, codes) =>
    axios.post(`/iam/v1/organizations/${orgId}/projects/check`, JSON.stringify(codes));

  createProject = (orgId, projectData) =>
    axios.post(`/iam/v1/organizations/${projectData.organizationId}/projects`, JSON.stringify(projectData));

  updateProject = (organizationId, projectData, id) =>
    axios.put(`/iam/v1/organizations/${organizationId}/projects/${id}`, JSON.stringify(projectData));

  getProjectById = (organizationId, id) =>
    axios.get(`/iam/v1/organizations/${organizationId}/projects?param=${id}`);

  getRolesById(organizationId, userId) {
    return axios.get(`/iam/v1/projects/${organizationId}/role_members/users/${userId}`);
  }

  loadMyData = (organizationId, userId) => {
    this.getRolesById(organizationId, userId).then(action((roles) => {
      this.myRoles = roles;
    }));
  };
}

const projectStore = new ProjectStore();
export default projectStore;
