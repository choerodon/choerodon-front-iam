import { observable, action, computed } from 'mobx';
import store from 'Store';
import axios from 'Axios';

@store('UserInfoStore')
class UserInfoStore {
  @observable userInfo = {};
  @observable avatar;

  @computed
  get getUserInfo() {
    return this.userInfo;
  }

  @action
  setUserInfo(data) {
    this.userInfo = data;
    this.avatar = data.imageUrl;
  }

  @action
  setAvatar(avatar) {
    this.userInfo.imageUrl = avatar;
    this.avatar = avatar;
  }

  @computed
  get getAvatar() {
    return this.avatar;
  }

  updateUserInfo = user => axios.put(`/iam/v1/users/${user.id}/info`, JSON.stringify(user));

  checkEmailAddress = email => (
    axios.post('/iam/v1/users/check', JSON.stringify({ id: this.userInfo.id, email }))
  );
}

const userInfoStore = new UserInfoStore();
export default userInfoStore;
