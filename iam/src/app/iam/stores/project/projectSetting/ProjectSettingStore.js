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

  axiosSaveProjectInfo(data) {
    return axios.put(`/iam/v1/projects/${data.id}`, data);
  }

  disableProject(proId) {
    return axios.put(`/iam/v1/projects/${proId}/disable`);
  }
}

const projectSettingStore = new ProjectSettingStore();

export default projectSettingStore;
