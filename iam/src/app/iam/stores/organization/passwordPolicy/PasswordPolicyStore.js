import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';

@store('PasswordPolicyStore')
class PasswordPolicyStore {
  @observable passwordPolicy = null;
  @observable isLoading = true;

  @action setIsLoading(flag) {
    this.isLoading = flag;
  }

  @computed get getIsLoading() {
    return this.isLoading;
  }

  @action setPasswordPolicy(data) {
    this.passwordPolicy = data;
  }

  @computed get getPasswordPolicy() {
    return this.passwordPolicy;
  }

  @action cleanData() {
    this.passwordPolicy = {};
  }

  @action setPasswordChange(change) {
    this.passwordChange = change;
  }

  @computed get getPasswordChange() {
    return this.passwordChange;
  }

  @action setLoginChange(change) {
    this.passwordChange = change;
  }

  @computed get getLoginChange() {
    return this.passwordChange;
  }

  loadPasswordPolicy = (handleErr) => {
    this.setIsLoading(true);
    axios.get('/uaa/v1/passwordPolicies/querySelf').then((data) => {
      this.setPasswordPolicy(data);
    }).catch((error) => {
      this.cleanData();
      if (error.response.status === 400) {
        this.setIsLoading(false);
        handleErr(Choerodon.getMessage('密码策略不存在', 'Policy is not found!'));
      }
    });
  };

  loadData(organizationId) {
    return axios.get(`/iam/v1/organizations/${organizationId}/password_policies`);
  }

  updatePasswordPolicy = (orgId, id, data) => (
    axios.post(`/iam/v1/organizations/${orgId}/password_policies/${id}`, JSON.stringify(data))
  )
}

const passwordPolicyStore = new PasswordPolicyStore();

export default passwordPolicyStore;
