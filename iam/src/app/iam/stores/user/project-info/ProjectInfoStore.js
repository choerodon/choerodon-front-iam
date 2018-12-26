import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import queryString from 'query-string';

@store('ProjectInfoStore')
class ProjectInfoStore {
  @observable myProjectData = [];
  @observable projectRolesData = [];
  @observable loading = false;
  @observable sidebarVisible = false;
  @observable pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  @observable params = [];
  @observable showSize = 10;

  refresh(id) {
    this.loadData(id, { current: 1, pageSize: 10 }, []);
  }

  @action
  setShowSize(size) {
    this.showSize = size;
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
  loadMyProjects(orgId) {
    this.loading = true;
    return axios.get(`/iam/v1/users/self/projects/paging_query?${queryString.stringify({
      organization_id: orgId,
      page: 0,
      size: 20,
      enabled: true,
    })}`).then(action((result) => {
      const { failed, content } = result;
      if (!failed) {
        this.myProjectData = content || result;
      }
      this.loading = false;
    }))
      .catch(action((error) => {
        Choerodon.handleResponseError(error);
        this.loading = false;
      }));
  }

  @action
  loadData(id, pagination = this.pagination, params = this.params) {
    this.loading = true;
    this.params = params;
    return axios.get(`/iam/v1/users/${id}/project_roles?${queryString.stringify({
      page: pagination.current - 1,
      size: pagination.pageSize,
      params: params.join(','),
    })}`)
      .then(action(({ failed, content, totalElements }) => {
        if (!failed) {
          this.projectRolesData = content;
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
}

export default new ProjectInfoStore();
