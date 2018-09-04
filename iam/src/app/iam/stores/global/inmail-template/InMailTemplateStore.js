/**
 * Created by chenbinjie on 2018/9/4.
 */
import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import querystring from 'query-string';

@store('InMailTemplateStore')
class InMailTemplateStore {
  @observable loading = true;

  @observable mailTemplate = [];

  @observable templateType = [];

  @observable currentCode = 'global.inmail-template';

  @action
  setLoading(flag) {
    this.loading = flag;
  }

  @computed
  get getLoading() {
    return this.loading;
  }

  @action
  setCurrentCode(code) {
    this.currentCode = code;
  }

  @computed
  get getCurrentCode() {
    return this.currentCode;
  }

  loadMailTemplate = (
    { current, pageSize },
    { name, code, type, isPredefined },
    { columnKey = 'id', order = 'descend' },
    params, appType, orgId,
  ) => {
    const queryObj = {
      name: name && name[0],
      type: type && type[0],
      code: code && code[0],
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
}

const inMailTemplateStore = new InMailTemplateStore();
export default inMailTemplateStore;
