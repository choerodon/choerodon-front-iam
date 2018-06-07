/**
 * Created by song on 2017/6/26.
 */

import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('LDAPStore')
class LDAPStore {
  @observable ldapData = null;
  @observable testData = null;
  @observable isLoading = true;
  @observable isConnectLoading = true;
  @observable isShowResult = false;
  @observable confirmLoading = false;

  @action setIsLoading(flag) {
    this.isLoading = flag;
  }

  @computed get getIsLoading() {
    return this.isLoading;
  }

  @action setIsConnectLoading(flag) {
    this.isConnectLoading = flag;
  }

  @computed get getIsConnectLoading() {
    return this.isConnectLoading;
  }

  @action setIsConfirmLoading(flag) {
    this.confirmLoading = flag;
  }

  @computed get getIsConfirmLoading() {
    return this.confirmLoading;
  }

  @action setIsShowResult(data) {
    this.isShowResult = data;
  }

  @computed get getIsShowResult() {
    return this.isShowResult;
  }

  @action setLDAPData(data) {
    this.ldapData = data;
  }

  @computed get getLDAPData() {
    return this.ldapData;
  }

  @action setTestData(data) {
    this.testData = data;
  }

  @computed get getTestData() {
    return this.testData;
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

  testConnect = (organizationId, id, ldap) =>
    axios.post(`/iam/v1/organizations/${organizationId}/ldaps/${id}/test_connect`, JSON.stringify(ldap));
}

const ldapStore = new LDAPStore();

export default ldapStore;
