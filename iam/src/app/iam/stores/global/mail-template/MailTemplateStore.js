/**
 * Created by chenbinjie on 2018/8/6.
 */
import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('MailTemplateStore')
class MailTemplateStore {
  @observable apiData = [];

  @observable loading = true;

  @observable mailTemplate = [];

  @observable templateType = [];

  @observable currentDetail = {};

  @action setLoading(flag) {
    this.loading = flag;
  }

  @action setMailTemplate(data) {
    this.mailTemplate = data;
  }

  @action setTemplateType(data) {
    this.templateType = data;
  }

  @computed get getTemplateType() {
    return this.templateType;
  }

  @action setCurrentDetail(data) {
    this.currentDetail = data;
  }

  @computed get getCurrentDetail() {
    return this.currentDetail;
  }

  getMailTemplate() {
    return this.mailTemplate;
  }

  loadMailTemplate = (
    { current, pageSize },
    { name, type, isPredefined },
    { columnKey = 'isPredefined', order = 'asc' },
    params, appType, orgId) => {
    const queryObj = {
      name: name && name[0],
      type: type && type[0],
      isPredefined: isPredefined && isPredefined[0],
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
    if (appType === 'site') {
      return axios.get(`/notify/v1/notices/emails/templates?page=${current - 1}&size=${pageSize}&${querystring.stringify(queryObj)}`);
    } else {
      return axios.get(`/notify/v1/notices/emails/templates/organizations/${orgId}?page=${current - 1}&size=${pageSize}&${querystring.stringify(queryObj)}`);
    }
  };

  loadTemplateType = (appType, orgId) => {
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    return axios.get(`/notify/v1/notices/send_settings/names${path}`);
  }

  createTemplate = (data, appType, orgId) => {
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    return axios.post(`notify/v1/notices/emails/templates${path}`, JSON.stringify(data));
  }

  deleteMailTemplate = (id, appType, orgId) => {
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    return axios.delete(`/notify/v1/notices/emails/templates/${id}${path}`);
  }

  getTemplateDetail = (id, appType, orgId) => {
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    return axios.get(`notify/v1/notices/emails/templates/${id}${path}`);
  }


  updateTemplateDetail = (id, data, appType, orgId) => {
    const path = appType === 'site' ? '' : `/organizations/${orgId}`;
    return axios.put(`notify/v1/notices/emails/templates/${id}${path}`, JSON.stringify(data));
  }
}

const mailTemplateStore = new MailTemplateStore();
export default mailTemplateStore;
