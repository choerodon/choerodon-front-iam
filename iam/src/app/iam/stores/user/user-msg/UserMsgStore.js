import { action, computed, observable } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

const mockData = [
  {
    id: 1,
    title: '修改密码',
    isRead: false,
    reciveTime: '2018-08-10 11:51:56',
    msg: `<p>
      <h4>xxx用户：</h4>
     
您好！<br>&nbsp&nbsp&nbsp&nbsp您已成功修改您的用户密码。
</p >`,
  },
  {
    id: 2,
    title: '您的角色权限被更改',
    isRead: true,
    reciveTime: '2018-08-10 11:51:56',
    msg: `<p>
<h4>xxx用户：</h4>
您好！
<br>&nbsp&nbsp&nbsp&nbsp您在xxxx组织下的角色权限已被管理员更改为组织测试员。
<br>&nbsp&nbsp&nbsp&nbsp点击链接了解该角色的权限信息。
        <a href="http://choerodon.io/zh/docs/concept/choerodon-org/">组织测试员权限信息</a>
      </p >`,
  },
  {
    id: 3,
    title: '项目状态修改',
    isRead: true,
    reciveTime: '2018-08-10 11:51:56',
    msg: `<p>
        <h4>xxx用户：</h4>
        您好！
        <br>&nbsp&nbsp&nbsp&nbsp您所在的xxx项目已被停用。
        </p >`,
  },
  {
    id: 4,
    title: '任务调度上线啦',
    isRead: true,
    reciveTime: '2018-08-10 11:51:56',
    msg: `<p>
        <h4>xxx用户：</h4>
        您好！
        <br>&nbsp&nbsp&nbsp&nbspchoerodon的新功能任务调度已经上线了~~~~~~
        <br>
        <br>
        <li>任务调度支持国际标准的跟quartz一样的时间表达式，该表达式精确到秒级别。</li>
        <br>
        <li>任务调度提供了非常友好的自主运维控制台方便用户创建，删除Job。提供了立即触发执行一次的功能，方便用户测试以及关键时刻手动立即执行一次。 还为用户提供了历史执行记录查询的功能，用户可以看到任何一个job过去100次的历史执行记录。</li>
        <br>
        <li>用户可以设置任意的时间点或者周期性的定时任务。</li>



        </p >`,
  },
];

@store('UserMsgStore')
class UserMsgStore {
  @observable userMsg = mockData;

  @observable userInfo = {};

  @observable expandCardId = mockData[0].id;

  @observable selectMsg = new Set();

  @computed
  get getSelectMsg() {
    return this.selectMsg;
  }

  @action
  addSelectMsgById(id) {
    this.selectMsg.add(id);
  }

  @action
  deleteSelectMsgById(id) {
    this.selectMsg.delete(id);
  }

  @computed
  get getExpandCardId() {
    return this.expandCardId;
  }

  @action
  setExpandCardId(id) {
    this.expandCardId = id;
  }

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
