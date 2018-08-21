import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('SendSettingStore')
class SendSettingStore {
  @observable data = [];

  @observable currentRecord = {};

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
}

const sendSettingStore = new SendSettingStore();

export default sendSettingStore;
