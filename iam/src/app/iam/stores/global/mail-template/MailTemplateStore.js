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

  // TODO: 这里调用删除的接口
  deleteMailTemplate = id => console.log(`delete${id}`);


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

  getMailTemplate() {
    return this.mailTemplate;
  }

  loadMailTemplate = (
    { current, pageSize },
    { name, type, isPredefined },
    { columnKey = 'id', order = 'descend' },
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
      console.log('site');
      return axios.get(`/notify/v1/notices/emails/templates?page=${current - 1}&size=${pageSize}&${querystring.stringify(queryObj)}`);
    } else {
      console.log('organization');
      return axios.get(`/notify/v1/notices/emails/templates/organizations/${orgId}?page=${current - 1}&size=${pageSize}&${querystring.stringify(queryObj)}`);
    }
  }

  loadTemplateType = () => axios.get('/notify/v1/notices/send_settings/names');

  createTemplate = data => axios.post('notify/v1/notices/emails/templates', JSON.stringify(data));
}

const mailTemplateStore = new MailTemplateStore();
export default mailTemplateStore;
