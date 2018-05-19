import { observable, action, computed } from 'mobx';
import store from 'Store';
import axios from 'Axios';

@store("ProjectSettingStore")
class ProjectSettingStore {
  @observable projectInfo = {};
  
  @action setProjectInfo(data) {
    this.projectInfo = data;
  }

  @computed get getProjectInfo() {
    return this.projectInfo;
  }

  axiosGetProjectInfo(id) {
    return axios.get(`/iam/v1/projects/${id}`);
  }

  axiosSaveProjectInfo(orgId, proId, data) {
    return axios.put(`/iam/v1/projects/${proId}`, data);
  }

  disableProject(proId) {
    return axios.put(`/iam/v1/projects/${proId}/disable`);
  }
}

const projectSettingStore = new ProjectSettingStore();

export default projectSettingStore;
