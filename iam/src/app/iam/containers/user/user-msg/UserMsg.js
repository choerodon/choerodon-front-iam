import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Select, Table, Tooltip, Modal, Form, Card, Checkbox } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, Action } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import './UserMsg.scss';
import UserMsgStore from '../../../stores/user/user-msg/UserMsgStore';
import InMailTemplateStore from '../../../stores/global/inmail-template';
import User from "../../organization/user/User";

const intlPrefix = 'user.usermsg';

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
    };
  }

  componentDidMount() {
    this.loadUserInfo();
    UserMsgStore.loadData({ current: 1, pageSize: 100 }, {}, {}, []);
  }

  refresh() {
    UserMsgStore.loadData({ current: 1, pageSize: 100 }, {}, {}, []);
    UserMsgStore.selectMsg.clear();
  }

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
    this.refresh();
    this.setState({
      showAll: show,
    });
  }

  renderMsgTitle(title, id, read, sendTime) {
    return (
      <div>
        <Checkbox style={{ verticalAlign: 'text-bottom' }} onChange={() => this.handleCheckboxChange(id)} checked={UserMsgStore.getSelectMsg.has(id)} />
        <span className={read ? 'c7n-user-msg-read-title' : 'c7n-user-msg-unread-title'}>{title}</span>
        <span className={read ? 'c7n-user-msg-read' : 'c7n-user-msg-unread'}>{sendTime}</span>
        <span className={read ? 'c7n-user-msg-read' : 'c7n-user-msg-unread'}>{read ? '已读' : '未读'}</span>
      </div>
    );
  }

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

  handleCheckboxChange = (id) => {
    if (UserMsgStore.getSelectMsg.has(id)) {
      UserMsgStore.deleteSelectMsgById(id);
    } else {
      UserMsgStore.addSelectMsgById(id);
    }
    this.setState({
      needExpand: false,
    });
  };

  handleCardClick = (id) => {
    setTimeout(() => {
      if (this.state.needExpand) {
        UserMsgStore.setExpandCardId(UserMsgStore.getExpandCardId !== id ? id : null);
      }
      this.setState({
        needExpand: true,
      });
    }, 10);
  };

  loadUserInfo = () => UserMsgStore.setUserInfo(this.props.AppState.getUserInfo);

  renderUserMsgCard() {
    let visiableCardCount = 0;
    const innerHTML = UserMsgStore.getUserMsg && UserMsgStore.getUserMsg.map(({ content, title, id, read, sendTime }) => {
      visiableCardCount += read ? 0 : 1;
      return (
        <Card
          key={id}
          className={classnames('ant-card-wider-padding', { 'c7n-user-msg-card': true }, { active: UserMsgStore.getExpandCardId === id }, { 'c7n-unread-line': !read })}
          title={this.renderMsgTitle(title, id, read, sendTime)}
          onHeadClick={() => this.handleCardClick(id)}
          style={{ display: !read || this.state.showAll ? null : 'none' }}
        >
          <div dangerouslySetInnerHTML={{ __html: `${content}` }} />
        </Card>
      );
    });
    return (
      <div>
        {(visiableCardCount !== 0 || this.state.showAll) ? innerHTML : this.renderEmpty()}
      </div>
    );
  }

  renderEmpty = () => (
    <div>
      <div className="c7n-user-msg-empty-icon" />
      <div className="c7n-user-msg-empty-icon-text"><FormattedMessage id="user.usermsg.empty" /></div>
    </div>
  );

  render() {
    const user = UserMsgStore.getUserInfo;
    return (
      <Page>
        <Header
          title={<FormattedMessage id="user.usermsg.header.title" />}
        >
          <Button
            icon="refresh"
            onClick={this.refresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
          <Button
            icon="drafts"
            onClick={() => UserMsgStore.readMsg().then(() => this.refresh())}
          >
            <FormattedMessage id={`${intlPrefix}.markread`} />
          </Button>
          <Button
            icon="all_read"
            onClick={() => UserMsgStore.userMsg && UserMsgStore.readMsg(UserMsgStore.userMsg.map(v => v.id)).then(() => this.refresh())}
          >
            <FormattedMessage id={`${intlPrefix}.markreadall`} />
          </Button>
          <Button
            icon="delete"
            onClick={this.handleDelete}
          >
            <FormattedMessage id={'delete'} />
          </Button>
        </Header>
        <Content
          code="user.usermsg"
          values={{ name: user.loginName }}
        >
          <div className="c7n-user-msg-btns">
            <span className="text">
              <FormattedMessage id="user.usermsg.view" />：
            </span>
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
          {this.renderUserMsgCard()}
        </Content>
      </Page>
    );
  }
}
