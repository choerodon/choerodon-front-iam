/**
 * Created by jinqin.ma on 2017/6/27.
 */

import { action, computed, observable } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import querystring from 'query-string';

const { AppState } = stores;
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
  @observable optionAgileData = [];
  @observable disabledTime = {};
  projectRelationNeedRemove = [];

  constructor(totalPage = 1, totalSize = 0) {
    this.totalPage = totalPage;
    this.totalSize = totalSize;
  }


  @action
  setDisabledTime(projectId) {
    if (projectId) {
      return axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/project_relations/${projectId}/unavailable/under/${this.currentGroup.id}`).then(action((data) => {
        this.disabledTime[projectId] = data;
      }));
    }
    return false;
  }

  @action
  setOptionAgileData(data) {
    this.optionAgileData = data.concat(this.groupProjects.map(v => ({ ...v, name: v.projName, code: v.proCode, id: v.projectId })));
  }

  @action
  setCurrentGroup(data) {
    this.currentGroup = data;
  }

  @action
  removeProjectFromGroup(index) {
    const delId = this.groupProjects.splice(index, 1)[0].id;
    if (delId) this.deleteProjectFromGroup(delId);
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
  setGroupProjectByIndex(index, data) {
    this.groupProjects[index] = data;
  }

  @action
  addNewProjectToGroup() {
    this.groupProjects = [...this.groupProjects, { projectId: null, startDate: null, endDate: null, enabled: true }];
  }

  @action
  deleteProjectFromGroup(projectId) {
    this.groupProjects = this.groupProjects.filter(action((data) => {
      if (data.projectId !== projectId) {
        // this.optionAgileData = this.optionAgileData.toJS().push({ ...data, name: data.projName, code: data.proCode, id: data.projectId });
        return true;
      }
      return false;
    }));

    // 待删除的项目关系，需要等到提交表单的时候再发请求
    this.projectRelationNeedRemove.push(projectId);
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

  getAgileProject(organizationId, projectId) {
    return axios.get(`/iam/v1/organizations/${organizationId}/projects/${projectId}/agile`);
  }

  saveProjectGroup = (data) => {
    const copyGroupProjects = JSON.parse(JSON.stringify(this.groupProjects));
    Object.keys(data).forEach((k) => {
      if (data[k] && isNum.test(data[k])) {
        copyGroupProjects[k].projectId = data[k];
        copyGroupProjects[k].enabled = !!data[`enabled-${k}`];
        copyGroupProjects[k].startDate = data[`startDate-${k}`] && data[`startDate-${k}`].format('YYYY-MM-DD 00:00:00');
        copyGroupProjects[k].endDate = data[`endDate-${k}`] && data[`endDate-${k}`].format('YYYY-MM-DD 00:00:00');
        copyGroupProjects[k].parentId = this.currentGroup.id;
      }
    });
    return axios.put('/iam/v1/organizations/${AppState.currentMenuType.organizationId}/project_relations', copyGroupProjects.filter(value => value.projectId !== null));
  };

  getProjectsByGroupId = parentId => axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/project_relations/${parentId}`);

  axiosDeleteProjectsFromGroup = () => {
    this.projectRelationNeedRemove.forEach((id) => {
      axios.delete(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/project_relations/${id}`);
    });
    this.projectRelationNeedRemove = [];
  };

  loadProjectTypes = () => axios.get('/iam/v1/projects/types');

  loadMyData = (organizationId, userId) => {
    this.getRolesById(organizationId, userId).then(action((roles) => {
      this.myRoles = roles;
    }));
  };

  clearProjectRelationNeedRemove = () => {
    this.projectRelationNeedRemove = [];
  }

  checkCanEnable = id => axios.get(`/iam/v1/organizations/${AppState.currentMenuType.organizationId}/project_relations/check/${id}/can_be_enabled`)
}

const projectStore = new ProjectStore();
export default projectStore;
