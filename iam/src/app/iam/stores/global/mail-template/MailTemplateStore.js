/**
 * Created by chenbinjie on 2018/8/6.
 */
import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('MailTemplateStore')
class MailTemplateStore {
  @observable apiData = [];

  @observable loading = true;

  @observable mailTemplate = [];

  @observable detailFlag = false;

  @observable apiDetail = {
    description: '[]',
    responses: [],
  };

  @action setLoading(flag) {
    this.loading = flag;
  }

  @action setMailTemplate(data) {
    this.mailTemplate = data;
  }

  getMailTemplate() {
    return this.mailTemplate;
  }

  loadMailTemplate = () => axios.get('/iam/v1/users/admin');
}

const mailTemplateStore = new MailTemplateStore();
export default mailTemplateStore;
