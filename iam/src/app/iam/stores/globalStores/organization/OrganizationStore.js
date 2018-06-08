/**
 * Created by jinqin.ma on 2017/6/27.
 */
import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('OrganizationStore')
class OrganizationStore {
  @observable orgData = [];
  @observable totalSize;
  @observable totalPage;
  @observable isLoading = true;

  constructor(totalPage = 1, totalSize = 0) {
    this.totalPage = totalPage;
    this.totalSize = totalSize;
  }

  @action setTotalSize(totalSize) {
    this.totalSize = totalSize;
  }

  @computed get getTotalSize() {
    return this.totalSize;
  }

  @action setTotalPage(totalPage) {
    this.totalPage = totalPage;
  }

  @computed get getTotalPage() {
    return this.totalPage;
  }

  @action setOrgData(data) {
    this.orgData = data;
  }

  @computed get getOrgData() {
    return this.orgData.slice();
  }

  @action changeLoading(flag) {
    this.isLoading = flag;
  }

  @computed get getIsLoading() {
    return this.isLoading;
  }

  loadOrg = (organizationId, page, state) => {
    this.changeLoading(true);
    if (state) {
      if (state.code === '') {
        return axios.get(`/iam/v1/organizations/list?page=${page}&size=10&param=${state.input}`).then((data) => {
          if (data) {
            this.setOrgData(data.content);
            // this.setTotalPage(data.totalPages);
            // this.setTotalSize(data.totalElements);
          }
          this.changeLoading(false);
        });
      } else {
        return axios.get(`/iam/v1/organizations/list?page=${page}&size=10&${state.code}=${state.input}`).then((data) => {
          if (data) {
            this.setProjectData(data.content);
            this.setTotalPage(data.totalPages);
            this.setTotalSize(data.totalElements);
          }
          this.changeLoading(false);
        });
      }
    } else {
      return axios.get(`/iam/v1/organizations/list?page=${page}&size=10`).then((data) => {
        if (data) {
          this.setOrgData(data);
          // this.setTotalPage(data.totalPages);
          // this.setTotalSize(data.totalElements);
        }
        this.changeLoading(false);
      });
    }
  };
  enableProject(orgId, projectId, data) {
    return axios.put(`/uaa/v1/organization/${orgId}/projects/${projectId}`, data);
  }
  checkProjectName = organizationId =>
    axios.get(`/uaa/v1/organization/${organizationId}/projects/self`);

  checkProjectCode = (organizationId, codes) =>
    axios.get(`/uaa/v1/organization/${organizationId}/projects/code?code=${codes}`);

  createOrg = (organizationId, projectData) =>
    axios.post(`/uaa/v1/organization/${organizationId}/projects`, JSON.stringify(projectData));

  updateOrg = (organizationId, Data) =>
    axios.put(`/iam/v1/organizations/${organizationId}`, JSON.stringify(Data));

  getOrgById = organizationId =>
    axios.get(`/iam/v1/organizations/${organizationId}`);

  deleteOrgById = (organizationId, id) =>
    axios.delete(`/uaa/v1/organization/${organizationId}/projects/${id}`);
}
const organizationStore = new OrganizationStore();
export default organizationStore;
