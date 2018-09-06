import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Select, Table, Tooltip, Modal, Form, Card, Checkbox } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, Action } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import './UserMsg.scss';
import UserMsgStore from '../../../stores/user/user-msg/UserMsgStore';

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
    // this.reload();
    this.setState({
      showAll: show,
    });
  }

  renderMsgTitle(title, id, isRead, reciveTime) {
    return (
      <div>
        <Checkbox style={{ verticalAlign: 'text-bottom' }} onChange={() => this.handleCheckboxChange(id)} />
        <span className={isRead ? 'c7n-user-msg-read-title' : 'c7n-user-msg-unread-title'}>{title}</span>
        <span className={isRead ? 'c7n-user-msg-read' : 'c7n-user-msg-unread'}>{reciveTime}</span>
        <span className={isRead ? 'c7n-user-msg-read' : 'c7n-user-msg-unread'}>{isRead ? '已读' : '未读'}</span>
      </div>
    );
  }

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

  loadUserInfo = () => {
    UserMsgStore.setUserInfo(this.props.AppState.getUserInfo);
  };

  renderUserMsgCard() {
    const innerHTML = UserMsgStore.getUserMsg.map(({ msg, title, id, isRead, reciveTime }) => (
      <Card
        key={id}
        className={classnames('ant-card-wider-padding', { 'c7n-user-msg-card': true }, { active: UserMsgStore.getExpandCardId === id })}
        title={this.renderMsgTitle(title, id, isRead, reciveTime)}
        onHeadClick={() => this.handleCardClick(id)}
        style={{ display: !isRead || this.state.showAll ? null : 'none' }}
      >
        <div dangerouslySetInnerHTML={{ __html: `${msg}` }} />
      </Card>
    ));
    return (
      <div>
        {innerHTML}
      </div>
    );
  }

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
          >
            <FormattedMessage id={`${intlPrefix}.markread`} />
          </Button>
          <Button
            icon="all_read"
          >
            <FormattedMessage id={`${intlPrefix}.markreadall`} />
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
