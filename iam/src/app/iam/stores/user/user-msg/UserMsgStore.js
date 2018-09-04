import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('UserMsgStore')
class UserMsgStore {
  @observable userMsg = {};

  @observable userInfo = {};

  @computed
  get getUserMsg() {
    return this.userMsg;
  }

  @action
  setUserMsg(data) {
    this.userMsg = data;
  }

  @computed
  get getUserInfo() {
    return this.userInfo;
  }

  @action
  setUserInfo(data) {
    this.userInfo = data;
  }
}

const userMsgStore = new UserMsgStore();
export default userMsgStore;
