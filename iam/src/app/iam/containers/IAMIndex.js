import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncLocaleProvider, asyncRouter, nomatch } from 'choerodon-front-boot';

const ClientIndex = asyncRouter(() => import('./organization/client'));
const UserIndex = asyncRouter(() => import('./organization/user'));
const ProjectIndex = asyncRouter(() => import('./organization/project'));
const PasswordPolicyIndex = asyncRouter(() => import('./organization/passwordPolicy'));
const LDAPIndex = asyncRouter(() => import('./organization/ldap'));

// global
const OrganizationIndex = asyncRouter(() => import('./global/organization'));
const RoleIndex = asyncRouter(() => import('./global/role'));
const MemberRole = asyncRouter(() => import('./global/memberRole'));
const menuTree = asyncRouter(() => import('./global/menuTree'));
const InstanceIndex = asyncRouter(() => import('./global/instance'));
const ConfigurationIndex = asyncRouter(() => import('./global/configuration'));
const RouteIndex = asyncRouter(() => import('./global/route'));
const RootUser = asyncRouter(() => import('./global/rootUser'));

const ProjectSettingIndex = asyncRouter(() => import('./project/projectSetting'));

const UserInfoIndex = asyncRouter(() => import('./user/userInfo'));
const PasswordIndex = asyncRouter(() => import('./user/changePassword'));


@inject('AppState')
class IAMIndex extends React.Component {
  render() {
    const { match, AppState } = this.props;
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../locale/${langauge}`));
    return (
      <IntlProviderAsync>
        <Switch>
          <Route path={`${match.url}/client`} component={ClientIndex} />
          <Route path={`${match.url}/user`} component={UserIndex} />
          <Route path={`${match.url}/project`} component={ProjectIndex} />
          <Route path={`${match.url}/organization`} component={OrganizationIndex} />
          <Route path={`${match.url}/password-policy`} component={PasswordPolicyIndex} />
          <Route path={`${match.url}/ldap`} component={LDAPIndex} />
          <Route path={`${match.url}/role`} component={RoleIndex} />
          <Route path={`${match.url}/instance`} component={InstanceIndex} />
          <Route path={`${match.url}/route`} component={RouteIndex} />
          <Route path={`${match.url}/configuration`} component={ConfigurationIndex} />
          <Route path={`${match.url}/proManage`} component={ProjectSettingIndex} />
          <Route path={`${match.url}/userinfo`} component={UserInfoIndex} />
          <Route path={`${match.url}/memberRole`} component={MemberRole} />
          <Route path={`${match.url}/menuTree`} component={menuTree} />
          <Route path={`${match.url}/usermodifyPwd`} component={PasswordIndex} />
          <Route path={`${match.url}/rootuser`} component={RootUser} />
          <Route path={'*'} component={nomatch} />
        </Switch>
      </IntlProviderAsync>
    );
  }
}

export default IAMIndex;
