import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';

@store('CreateUserStore')
class CreateUserStore {
  @observable language;
  @observable organization;
  @observable passwordPolicy;

  @action
  setLanguage(lang) {
    this.language = lang;
  }

  @computed
  get getLanguage() {
    return this.language;
  }

  @action
  setOrganization(data) {
    this.organization = data;
  }

  @computed
  get getOrganization() {
    return this.organization;
  }

  @action
  setPasswordPolicy(data) {
    this.passwordPolicy = data;
  }

  @computed
  get getPasswordPolicy() {
    return this.passwordPolicy;
  }

  loadOrganizationById(organizationId) {
    return axios.get(`/iam/v1/organizations/${organizationId}`).then((data) => {
      this.setOrganization(data);
    });
  }

  loadPasswordPolicyById(id) {
    return axios.get(`/iam/v1/organizations/${id}/password_policies`).then((data) => {
      this.setPasswordPolicy(data);
    });
  }

  checkUsername = (organizationId, loginName) => (
    axios.post(`/iam/v1/organizations/${organizationId}/users/check`, JSON.stringify({ organizationId, loginName }))
  );

  checkEmailAddress = (organizationId, email) => (
    axios.post(`/iam/v1/organizations/${organizationId}/users/check`, JSON.stringify({ organizationId, email }))
  );

  createUser = (user, id) => (
    axios.post(`/iam/v1/organizations/${id}/users`, JSON.stringify(user))
  );

  getUserInfoById = (orgId, id) => (
    axios.get(`/iam/v1/organizations/${orgId}/users/${id}`)
  );

  updateUser = (orgId, id, user) => (
    axios.put(`/iam/v1/organizations/${orgId}/users/${id}`, JSON.stringify(user))
  );
}

const createUserStore = new CreateUserStore();

export default createUserStore;
