/**
 * Created by jinqin.ma on 2017/6/27.
 */

import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

const isNum = /^\d+$/;

@store('ProjectStore')
class ProjectStore {
  @observable projectData = [];
  @observable totalSize;
  @observable totalPage;
  @observable isLoading = true;
  @observable myRoles = [];
  @observable projectTypes = [];
  @observable groupProjects = [];
  @observable currentGroup = null;

  constructor(totalPage = 1, totalSize = 0) {
    this.totalPage = totalPage;
    this.totalSize = totalSize;
  }

  @action
  setCurrentGroup(id) {
    this.currentGroup = id;
  }

  @action
  removeProjectFromGroup(index) {
    const delId = this.groupProjects.splice(index, 1)[0].projectId;
    if (delId) this.deleteProjectsFromGroup(delId);
  }

  @action
  addProjectToGroup(data) {
    this.groupProjects = [...this.projectData, data];
  }

  @action
  setGroupProjects(data) {
    this.groupProjects = data;
  }

  @action
  addNewProjectToGroup() {
    this.groupProjects = [...this.groupProjects, { projectId: null, startDate: null, endDate: null }];
  }

  @action
  deleteProjectFromGroup(projectId) {
    this.groupProjects = this.groupProjects.filter(data => data.projectId !== projectId);
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

  @action setProjectTypes(data) {
    this.projectTypes = data;
  }

  @computed get getProjectTypes() {
    return this.projectTypes;
  }

  loadProject = (organizationId,
    { current, pageSize },
    { columnKey = 'id', order = 'descend' },
    { name, code, typeName, enabled, params }) => {
    this.changeLoading(true);
    const queryObj = {
      page: current - 1,
      size: pageSize,
      name,
      code,
      enabled,
      typeName,
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

  saveProjectGroup = (data) => {
    const copyGroupProjects = JSON.parse(JSON.stringify(this.groupProjects));
    Object.keys(data).forEach((k) => {
      if (data[k] && isNum.test(data[k])) {
        copyGroupProjects[k].projectId = data[k];
        copyGroupProjects[k].enabled = !!data[`enabled-${k}`];
        copyGroupProjects[k].startDate = data[`startDate-${k}`] && data[`startDate-${k}`].format('YYYY-MM-DD 00:00:00');
        copyGroupProjects[k].endDate = data[`endDate-${k}`] && data[`endDate-${k}`].format('YYYY-MM-DD 23:59:59');
        copyGroupProjects[k].parentId = this.currentGroup;
      }
    });
    debugger;
    return axios.put('/iam/v1/project_group', copyGroupProjects.filter(value => value.projectId !== null));
  };

  getProjectsByGroupId = parentId => axios.get(`/iam/v1/project_group/${parentId}`);

  deleteProjectsFromGroup = id => axios.delete(`/iam/v1/project_group/${id}`);

  loadProjectTypes = () => axios.get('/iam/v1/projects/types');

  loadMyData = (organizationId, userId) => {
    this.getRolesById(organizationId, userId).then(action((roles) => {
      this.myRoles = roles;
    }));
  };
}

const projectStore = new ProjectStore();
export default projectStore;
