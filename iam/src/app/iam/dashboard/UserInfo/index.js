import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { DashBoardNavBar } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import UserInfoStore from '../../stores/user/user-info/UserInfoStore';
import './index.scss';

const intlPrefix = 'dashboard.userinfo';

@inject('AppState')
@observer
export default class ProjectInfo extends Component {

  componentWillMount() {
    this.loadUserInfo();
  }

  loadUserInfo = () => {
    UserInfoStore.setUserInfo(this.props.AppState.getUserInfo);
  };

  render() {
    const { getUserInfo: { loginName, realName, email, ldap } } = UserInfoStore;
    return (
      <div className="c7n-iam-dashboard-user-info">
        <dl>
          <dt><FormattedMessage id={`${intlPrefix}.realname`} /></dt>
          <dd>{realName}</dd>
          <dt><FormattedMessage id={`${intlPrefix}.loginname`} /></dt>
          <dd>{loginName}</dd>
          <dt><FormattedMessage id={`${intlPrefix}.email`} /></dt>
          <dd>{email}</dd>
          <dt><FormattedMessage id={`${intlPrefix}.ldap`} /></dt>
          <dd><FormattedMessage id={`${intlPrefix}.ldap.${!!ldap}`} /></dd>
        </dl>
        <DashBoardNavBar>
          <Link to="/iam/user-info?type=site"><FormattedMessage id={`${intlPrefix}.redirect`} /></Link>
        </DashBoardNavBar>
      </div>
    );
  }
}
