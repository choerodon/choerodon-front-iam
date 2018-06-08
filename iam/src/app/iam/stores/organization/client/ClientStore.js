import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { Observable } from 'rxjs';

@store('ClientStore')
class ClientStore {
  @observable clients = [];
  @observable clientById = null;
  @observable totalSize;
  @observable totalPage;
  @observable isLoading = true;
  @observable seachData = [];
  @observable isRefresh = false;

  constructor(totalPage = 1, totalSize = 0) {
    this.totalPage = totalPage;
    this.totalSize = totalSize;
  }

  @action setClients(data) {
    this.clients = data;
  }

  @action setSearchData(data) {
    this.seachData = data;
  }

  @computed get getClients() {
    return this.clients.slice();
  }

  @action setClientById(data) {
    this.clientById = data;
  }

  @computed get getClient() {
    return this.clientById;
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

  @action changeLoading(flag) {
    this.isLoading = flag;
  }

  @action changeRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsLoading() {
    return this.isLoading;
  }

  loadClients(organizationId, page, sortParam = 'id,desc', filters = {
    name: '',
    params: '',
  }) {
    this.changeLoading(true);
    return axios.get(`/iam/v1/organizations/${organizationId}/clients?page=${page.current - 1}&size=${page.pageSize}&sort=${sortParam}&name=${filters.name}&params=${filters.params}`);
  }

  getClientById = (organizationId, id) =>
    Observable.fromPromise(axios.get(`/iam/v1/organizations/${organizationId}/clients/${id}`));

  createClient = (organizationId, client) =>
    axios.post(`/iam/v1/organizations/${organizationId}/clients`, JSON.stringify(client));


  updateClient = (organizationId, client, id) =>
    axios.post(`/iam/v1/organizations/${organizationId}/clients/${id}`, JSON.stringify(client));


  deleteClientById = (organizationId, id) =>
    axios.delete(`/iam/v1/organizations/${organizationId}/clients/${id}`);

  checkName = (organizationId, client) => axios.post(`/iam/v1/organizations/${organizationId}/clients/check`, client);
}

const clientStore = new ClientStore();

export default clientStore;
