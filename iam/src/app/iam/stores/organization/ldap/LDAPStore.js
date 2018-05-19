/**
 * Created by song on 2017/6/26.
 */

import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';

@store('LDAPStore')
class LDAPStore {
  @observable ldapData = null;
  @observable isLoading = true;

  @action setIsLoading(flag) {
    this.isLoading = flag;
  }

  @computed get getIsLoading() {
    return this.isLoading;
  }

  @action setLDAPData(data) {
    this.ldapData = data;
  }

  @computed get getLDAPData() {
    return this.ldapData;
  }

  @action cleanData() {
    this.ldapData = {};
  }

  loadLDAP = (organizationId) => {
    this.setIsLoading(true);
    return axios.get(`/iam/v1/organizations/${organizationId}/ldaps`).then((data) => {
      if (data) {
        this.setLDAPData(data);
      }
      this.setIsLoading(false);
    });
  };

  loadOrganization(organizationId) {
    this.setIsLoading(true);
    axios.get(`/uaa/v1/organizations/${organizationId}`).then((data) => {
      if (data) {
        this.setOrganization(data);
      }
      this.setIsLoading(false);
    });
  }

  updateLDAP = (organizationId, id, ldap) =>
    axios.post(`/iam/v1/organizations/${organizationId}/ldaps/${id}`, JSON.stringify(ldap));
}

const ldapStore = new LDAPStore();

export default ldapStore;
