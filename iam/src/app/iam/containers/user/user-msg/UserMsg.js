import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, List, Tabs, Collapse, Modal, Form, Icon, Checkbox, Avatar, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, WSHandler } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import './UserMsg.scss';
import UserMsgStore from '../../../stores/user/user-msg/UserMsgStore';

const intlPrefix = 'user.usermsg';
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

// 兼容ie和w3c标准的阻止事件冒泡函数
function cancelBubble(e) {
  const evt = e || window.event;
  if (evt.stopPropagation) {
    evt.stopPropagation();
  } else {
    evt.cancelBubble = true;
  }
}

function timestampFormat(timestamp) {
  function zeroize(num) {
    return (String(num).length === 1 ? '0' : '') + num;
  }

  const curTimestamp = parseInt(new Date().getTime() / 1000, 10); // 当前时间戳
  const timestampDiff = curTimestamp - timestamp; // 参数时间戳与当前时间戳相差秒数

  const curDate = new Date(curTimestamp * 1000); // 当前时间日期对象
  const tmDate = new Date(timestamp * 1000); // 参数时间戳转换成的日期对象

  const Y = tmDate.getFullYear(); const m = tmDate.getMonth() + 1; const 
    d = tmDate.getDate();
  const H = tmDate.getHours(); const i = tmDate.getMinutes(); const 
    s = tmDate.getSeconds();

  if (timestampDiff < 60) { // 一分钟以内
    return '刚刚';
  } else if (timestampDiff < 3600) { // 一小时前之内
    return `${Math.floor(timestampDiff / 60)}分钟前`;
  } else if (curDate.getFullYear() === Y && curDate.getMonth() + 1 === m && curDate.getDate() === d) {
    return `今天${zeroize(H)}:${zeroize(i)}`;
  } else {
    const newDate = new Date((curTimestamp - 86400) * 1000); // 参数中的时间戳加一天转换成的日期对象
    if (newDate.getFullYear() === Y && newDate.getMonth() + 1 === m && newDate.getDate() === d) {
      return `昨天${zeroize(H)}:${zeroize(i)}`;
    } else if (curDate.getFullYear() === Y) {
      return `${zeroize(m)}月${zeroize(d)}日 ${zeroize(H)}:${zeroize(i)}`;
    } else {
      return `${Y}年${zeroize(m)}月${zeroize(d)}日 ${zeroize(H)}:${zeroize(i)}`;
    }
  }
}

@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class UserMsg extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      showAll: false,
      needExpand: true,
      isAllSelect: false,
    };
  }

  componentDidMount() {
    this.loadUserInfo();
    const matchId = this.props.location.search.match(/msgId=(\d+)/g);
    if (matchId) {
      const id = Number(matchId[0].match(/\d+/g)[0]);
      UserMsgStore.loadData({ current: 1, pageSize: 10 }, {}, {}, [], this.state.showAll, false, id);
    } else UserMsgStore.loadData({ current: 1, pageSize: 10 }, {}, {}, [], this.state.showAll, false);
    const matchType = this.props.location.search.match(/(?<=msgType=)(.+)/g);
    if (matchType) {
      UserMsgStore.setCurrentType(matchType[0]);
    }
  }

  refresh = () => {
    UserMsgStore.loadData({ current: 1, pageSize: 10 }, {}, {}, [], this.state.showAll);
    UserMsgStore.selectMsg.clear();
    UserMsgStore.expandMsg.clear();
    UserMsgStore.initPagination();
  };

  getUserMsgClass(name) {
    const { showAll } = this.state;
    if (name === 'unRead') {
      return classnames({
        active: !showAll,
      });
    } else if (name === 'all') {
      return classnames({
        active: showAll,
      });
    }
  }

  showUserMsg(show) {
    this.setState({
      showAll: show,
    },
    () => this.refresh());
  }

  renderMsgTitle = (title, id, read, sendTime, isChecked) => (
    <div className="c7n-iam-user-msg-collapse-title">
      <Checkbox
        style={{ verticalAlign: 'text-bottom' }}
        onChange={e => this.handleCheckboxChange(e, id)}
        checked={isChecked}
      />
      <span className="c7n-iam-user-msg-unread-title">{title}</span>
      <span className="c7n-iam-user-msg-unread">{timestampFormat(new Date(sendTime).getTime() / 1000)}</span>
      <Icon type={read ? 'drafts' : 'markunread'} onClick={() => { this.handleReadIconClick(id); }} />
    </div>
  );

  handleBatchRead = () => {
    if (UserMsgStore.getSelectMsg.size > 0) {
      UserMsgStore.readMsg(UserMsgStore.getSelectMsg).then(() => this.refresh());
    }
  };

  handleDelete = () => {
    const { intl } = this.props;
    if (UserMsgStore.getSelectMsg.size > 0) {
      Modal.confirm({
        title: intl.formatMessage({ id: `${intlPrefix}.delete.owntitle` }),
        content: intl.formatMessage({ id: `${intlPrefix}.delete.owncontent` }, {
          count: UserMsgStore.selectMsg.size,
        }),
        onOk: () => {
          UserMsgStore.deleteMsg().then(() => {
            Choerodon.prompt(intl.formatMessage({ id: 'delete.success' }));
            this.refresh();
          });
        },
      });
    }
  };

  handleTabsChange = (key) => {
    UserMsgStore.setCurrentType(key);
    this.refresh();
  };

  handleCheckboxChange = (e, id) => {
    // cancelBubble(e);
    if (UserMsgStore.getSelectMsg.has(id)) {
      UserMsgStore.deleteSelectMsgById(id);
    } else {
      UserMsgStore.addSelectMsgById(id);
    }
    this.setState({
      needExpand: false,
    });
  };

  handleReadIconClick = (id) => {
    UserMsgStore.setReadLocal(id);
    UserMsgStore.readMsg([id]);
    this.setState({
      needExpand: false,
    });
  };

  handleCollapseChange = (item) => {
    setTimeout(() => {
      if (this.state.needExpand && UserMsgStore.getExpandMsg.has(item.id)) {
        UserMsgStore.unExpandMsgById(item.id);
      } else if (this.state.needExpand && !UserMsgStore.getExpandMsg.has(item.id)) {
        UserMsgStore.expandMsgById(item.id);
        UserMsgStore.readMsg([item.id]);
        UserMsgStore.setReadLocal(item.id);
      }
      this.setState({
        needExpand: true,
      });
    }, 10);
  };

  loadUserInfo = () => UserMsgStore.setUserInfo(this.props.AppState.getUserInfo);

  selectAllMsg = () => {
    UserMsgStore.selectAllMsg();
    this.setState({
      isAllSelect: !this.state.isAllSelect,
    });
  };

  renderUserMsgCard(item) {
    const { id, title, read, sendTime, content, sendByUser } = item;
    const { AppState } = this.props;
    const innerStyle = {
      userSelect: 'none', verticalAlign: 'top', marginRight: '22px', marginLeft: '24px',
    };
    let avatar;
    if (sendByUser !== null) {
      const { imageUrl, loginName, realName } = sendByUser;
      avatar = (
        <Tooltip title={`${loginName} ${realName}`}>
          <Avatar src={imageUrl} style={innerStyle}>
            {realName[0]}
          </Avatar>
        </Tooltip>
      );
    } else {
      avatar = (
        <Tooltip title={AppState.siteInfo.systemName || 'Choerodon'}>
          <Avatar src={AppState.siteInfo.favicon || './favicon.ico'} style={innerStyle}>
            {(AppState.siteInfo.systemName && AppState.siteInfo.systemName[0]) || 'Choerodon'}
          </Avatar>
        </Tooltip>
      );
    }
    const innerHTML = (
      <List.Item>
        <Collapse
          onChange={() => this.handleCollapseChange(item)}
          className="c7n-iam-user-msg-collapse"
          activeKey={UserMsgStore.getExpandMsg.has(id) ? [id.toString()] : []}
          style={UserMsgStore.getExpandMsg.has(id) ? null : { backgroundColor: '#fff' }}
        >
          <Panel header={this.renderMsgTitle(title, id, read, sendTime, UserMsgStore.getSelectMsg.has(id))} key={id.toString()} className="c7n-iam-user-msg-collapse-panel">
            {<div>
              {avatar}
              <div style={{ width: 'calc(100% - 78px)', display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: `${content}` }} />
            </div> }
          </Panel>
        </Collapse>

      </List.Item>
    );
    return innerHTML;
  }

  renderEmpty = type => (
    <div>
      <div className="c7n-iam-user-msg-empty-icon" />
      <div className="c7n-iam-user-msg-empty-icon-text"><FormattedMessage id={this.state.showAll ? 'user.usermsg.allempty' : 'user.usermsg.empty'} />{type}</div>
    </div>
  );

  render() {
    const { intl } = this.props;
    const pagination = UserMsgStore.getPagination;
    const userMsg = UserMsgStore.getUserMsg;
    return (
      <Page>
        <Header
          title={<FormattedMessage id="user.usermsg.header.title" />}
        >
          <Button
            icon="check_box"
            onClick={this.selectAllMsg}
          >
            <FormattedMessage id="selectall" />
          </Button>
          <Button
            icon="all_read"
            onClick={this.handleBatchRead}
          >
            <FormattedMessage id={`${intlPrefix}.markreadall`} />
          </Button>
          <Button
            icon="delete"
            disabled={UserMsgStore.getSelectMsg.size === 0}
            onClick={this.handleDelete}
          >
            <FormattedMessage id={'remove'} />
          </Button>
          <Button
            icon="refresh"
            onClick={this.refresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          <Tabs defaultActiveKey="msg" onChange={this.handleTabsChange} activeKey={UserMsgStore.getCurrentType} animated={false}>
            <TabPane tab="消息" key="msg" className="c7n-iam-user-msg-tab">
              <div className="c7n-iam-user-msg-btns">
                <div className="text">
                  {intl.formatMessage({ id: 'user.usermsg.view' })}
                </div>
                <Button
                  className={this.getUserMsgClass('unRead')}
                  onClick={() => {
                    this.showUserMsg(false);
                  }}
                  type="primary"
                ><FormattedMessage id="user.usermsg.unread" /></Button>
                <Button
                  className={this.getUserMsgClass('all')}
                  onClick={() => {
                    this.showUserMsg(true);
                  }}
                  type="primary"
                ><FormattedMessage id="user.usermsg.all" /></Button>
              </div>
              <List
                className="c7n-iam-user-msg-list"
                loading={UserMsgStore.getLoading}
                itemLayout="horizontal"
                pagination={userMsg.length > 0 ? pagination : false}
                dataSource={userMsg}
                renderItem={item => (
                  this.renderUserMsgCard(item)
                )}
                split={false}
                empty={this.renderEmpty('消息')}
              />
            </TabPane>
            <TabPane tab="通知" key="notice" className="c7n-iam-user-msg-tab">
              <div className="c7n-iam-user-msg-btns">
                <div className="text">
                  {intl.formatMessage({ id: 'user.usermsg.view' })}
                </div>
                <Button
                  className={this.getUserMsgClass('unRead')}
                  onClick={() => {
                    this.showUserMsg(false);
                  }}
                  type="primary"
                ><FormattedMessage id="user.usermsg.unread" /></Button>
                <Button
                  className={this.getUserMsgClass('all')}
                  onClick={() => {
                    this.showUserMsg(true);
                  }}
                  type="primary"
                ><FormattedMessage id="user.usermsg.all" /></Button>
              </div>
              <List
                className="c7n-iam-user-msg-list"
                loading={UserMsgStore.getLoading}
                itemLayout="horizontal"
                pagination={userMsg.length > 0 ? pagination : false}
                dataSource={userMsg}
                renderItem={item => (
                  this.renderUserMsgCard(item)
                )}
                split={false}
                empty={this.renderEmpty('通知')}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}
