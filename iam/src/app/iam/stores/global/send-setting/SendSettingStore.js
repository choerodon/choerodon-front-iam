import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('SendSettingStore')
class SendSettingStore {
  @observable data = [];

  @observable currentRecord = {};

  @observable template = [];

  @observable currentTemplate = [];

  @action setData(data) {
    this.data = data;
  }

  @computed get getData() {
    return this.data;
  }

  @action setCurrentRecord(data) {
    this.currentRecord = data;
  }

  @computed get getCurrentRecord() {
    return this.currentRecord;
  }

  @action setCurrentTemplate(data) {
    this.currentTemplate = data;
  }

  @computed get getCurrentTemplate() {
    return this.currentTemplate;
  }

  @action setTemplate(data) {
    this.template = data;
  }

  @computed get getTemplate() {
    return this.template;
  }


  loadData(
    { current, pageSize },
    { name, code, description },
    { columnKey = 'id', order = 'descend' },
    params, appType, orgId) {
    const queryObj = {
      page: current - 1,
      size: pageSize,
      name,
      code,
      description,
      params,
    };
    if (columnKey) {
      const sorter = [];
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
      queryObj.sort = sorter.join(',');
    }
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    return axios.get(`/notify/v1/notices/send_settings${path}?${querystring.stringify(queryObj)}`);
  }

  loadCurrentRecord = (id, appType, orgId) => {
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    return axios.get(`/notify/v1/notices/send_settings/${id}${path}`);
  }

  loadTemplate = (appType, orgId) => {
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    axios.get(`notify/v1/notices/emails/templates/names${path}`).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setTemplate(data);
      }
    });
  }

  modifySetting = (id, body, appType, orgId) => {
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    return axios.put(`notify/v1/notices/send_settings/${id}${path}`, JSON.stringify(body));
  }
}

const sendSettingStore = new SendSettingStore();

export default sendSettingStore;
