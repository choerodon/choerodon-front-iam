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

  @observable detailFlag = false;

  @observable apiDetail = {
    description: '[]',
    responses: [],
  };

  // TODO: 这里调用删除的接口
  deleteMailTemplate = id => console.log(`delete${id}`);


  @action setLoading(flag) {
    this.loading = flag;
  }

  @action setMailTemplate(data) {
    this.mailTemplate = data;
  }

  getMailTemplate() {
    return this.mailTemplate;
  }

  loadMailTemplate = ({
    current,
    pageSize,
  }, { realName, email },
  { columnKey = 'id', order = 'descend' },
  params) => {
    const queryObj = {
      realName: realName && realName[0],
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
    return axios.get(`/iam/v1/users/admin?page=${current - 1}&size=${pageSize}&${querystring.stringify(queryObj)}`);
  }
}

const mailTemplateStore = new MailTemplateStore();
export default mailTemplateStore;
