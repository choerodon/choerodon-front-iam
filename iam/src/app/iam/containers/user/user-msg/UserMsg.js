import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, List, Spin, Tooltip, Modal, Form, Card, Checkbox } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, WSHandler } from 'choerodon-front-boot';
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
    UserMsgStore.loadData({ current: 1, pageSize: 5 }, {}, {}, [], this.state.showAll);
  }

  refresh = () => {
    UserMsgStore.loadData({ current: 1, pageSize: 5 }, {}, {}, [], this.state.showAll);
    UserMsgStore.selectMsg.clear();
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

  handleCardClick = (id, read) => {
    setTimeout(() => {
      if (this.state.needExpand) {
        UserMsgStore.setExpandCardId(UserMsgStore.getExpandCardId !== id ? id : null);
        // 如果消息未读则发送已读消息的请求
        if (!read) {
          UserMsgStore.readMsg([id]);
          UserMsgStore.setReadLocal(id);
        }
      }
      this.setState({
        needExpand: true,
      });
    }, 10);
  };

  handleMessage = () => {
    UserMsgStore.loadData({ current: 1, pageSize: 5 }, {}, {}, [], this.state.showAll, true);
  }

  loadUserInfo = () => UserMsgStore.setUserInfo(this.props.AppState.getUserInfo);

  renderUserMsgCard(item) {
    const innerHTML = (
      <List.Item>
        <Card
          key={item.id}
          className={classnames('ant-card-wider-padding', { 'c7n-user-msg-card': true }, { active: UserMsgStore.getExpandCardId === item.id }, { 'c7n-unread-line': !item.read })}
          title={this.renderMsgTitle(item.title, item.id, item.read, item.sendTime)}
          onHeadClick={() => this.handleCardClick(item.id, item.read)}
        >
          <div dangerouslySetInnerHTML={{ __html: `${item.content}` }} />
        </Card>
      </List.Item>
    );
    return innerHTML;
  }

  renderEmpty = () => (
    <div>
      <div className="c7n-user-msg-empty-icon" />
      <div className="c7n-user-msg-empty-icon-text"><FormattedMessage id={this.state.showAll ? 'user.usermsg.allempty' : 'user.usermsg.empty'} /></div>
    </div>
  );

  onLoadMore = () => {
    UserMsgStore.loadMore(this.state.showAll);
  };

  renderLoadMore = () => (UserMsgStore.getUserMsg.length > 0 ? (
    <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px', color: 'rgba(0, 0, 0, 0.54)' }}>
      {UserMsgStore.getLoadingMore && <Spin />}
      {!UserMsgStore.getLoadingMore && this.state.showAll && !UserMsgStore.getLoading && !UserMsgStore.isNoMore &&
        <Button type="primary" funcType="raised" onClick={this.onLoadMore}> <FormattedMessage id={`${intlPrefix}.load-more`} /></Button>
      }
      {UserMsgStore.isNoMore && !UserMsgStore.getLoadingMore ? <FormattedMessage id={`${intlPrefix}.nomore`} /> : null}
    </div>
  ) : null);

  render() {
    const user = UserMsgStore.getUserInfo;
    const { AppState } = this.props;
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
            disabled={UserMsgStore.getSelectMsg.size === 0}
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
            disabled={UserMsgStore.getSelectMsg.size === 0}
            onClick={this.handleDelete}
          >
            <FormattedMessage id={'delete'} />
          </Button>
        </Header>
        <Content>
          <WSHandler messageKey={`choerodon:msg:sit-msg:${AppState.userInfo.id}`} onMessage={this.handleMessage} path={`choerodon:msg/sit-msg/${AppState.userInfo.id}`}>
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
            <List
              className="c7n-user-msg-list"
              loading={UserMsgStore.getLoading}
              itemLayout="horizontal"
              loadMore={this.renderLoadMore()}
              dataSource={UserMsgStore.getUserMsg}
              renderItem={item => (
                this.renderUserMsgCard(item)
              )}
              split={false}
              empty={this.renderEmpty()}
            />
          </WSHandler>
        </Content>
      </Page>
    );
  }
}
