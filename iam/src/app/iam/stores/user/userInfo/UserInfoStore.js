import { observable, action, computed } from 'mobx';
import store from 'Store';
import axios from 'Axios';

@store('UserInfoStore')
class UserInfoStore {
  @observable userInfo = {};
  @observable isLoading = true;

  @computed get getIsLoading() {
    return this.isLoading;
  }

  @action setIsLoading(data) {
    this.isLoading = data;
  }

  @computed get getUserInfo() {
    return this.userInfo;
  }

  @action setUserInfo(data) {
    this.userInfo = data;
  }

  loadUserInfo(id) {
    return axios.get(`/iam/v1/users/${id}/info`);
  }
}

const userInfoStore = new UserInfoStore();
export default userInfoStore;
