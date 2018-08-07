import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('MailSettingStore')
class MailSettingStore {
  @observable mailSettingData = [];

  @action setMailSettingData(data) {
    this.mailSettingData = data;
  }

  @computed get getMailSettingData() {
    return this.mailSettingData;
  }
}

const mailSettingStore = new MailSettingStore();
export default mailSettingStore;
