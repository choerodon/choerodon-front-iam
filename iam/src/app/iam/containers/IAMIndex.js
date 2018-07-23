import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncLocaleProvider, asyncRouter, nomatch, } from 'choerodon-front-boot';

// global 对应目录
const apiTest = asyncRouter(() => import('./global/api-test'));
const configuration = asyncRouter(() => import('./global/configuration'));
const instance = asyncRouter(() => import('./global/instance'));
const memberRole = asyncRouter(() => import('./global/member-role'));
const menuSetting = asyncRouter(() => import('./global/menu-setting'));
const microService = asyncRouter(() => import('./global/micro-service'));
const organization = asyncRouter(() => import('./global/organization'));
const role = asyncRouter(() => import('./global/role'));
const roleLabel = asyncRouter(() => import('./global/role-label'));
const rootUser = asyncRouter(() => import('./global/root-user'));
const route = asyncRouter(() => import('./global/route'));

// organization
const client = asyncRouter(() => import('./organization/client'));
const ldap = asyncRouter(() => import('./organization/ldap'));
const passwordPolicy = asyncRouter(() => import('./organization/password-policy'));
const project = asyncRouter(() => import('./organization/project'));
const user = asyncRouter(() => import('./organization/user'));

// project
const projectSetting = asyncRouter(() => import('./project/project-setting'));

// user
const password = asyncRouter(() => import('./user/password'));
const organizationInfo = asyncRouter(() => import('./user/organization-info'));
const projectInfo = asyncRouter(() => import('./user/project-info'));
const userInfo = asyncRouter(() => import('./user/user-info'));


@inject('AppState')
class IAMIndex extends React.Component {
  render() {
    const { match, AppState } = this.props;
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../locale/${langauge}`));
    return (
      <IntlProviderAsync>
        <Switch>
          <Route path={`${match.url}/api-test`} component={apiTest} />
          <Route path={`${match.url}/configuration`} component={configuration} />
          <Route path={`${match.url}/instance`} component={instance} />
          <Route path={`${match.url}/member-role`} component={memberRole} />
          <Route path={`${match.url}/menu-setting`} component={menuSetting} />
          <Route path={`${match.url}/micro-service`} component={microService} />
          <Route path={`${match.url}/organization`} component={organization} />
          <Route path={`${match.url}/role`} component={role} />
          <Route path={`${match.url}/role-label`} component={roleLabel} />
          <Route path={`${match.url}/root-user`} component={rootUser} />
          <Route path={`${match.url}/route`} component={route} />
          <Route path={`${match.url}/client`} component={client} />
          <Route path={`${match.url}/organization-info`} component={ldap} />
          <Route path={`${match.url}/password-policy`} component={passwordPolicy} />
          <Route path={`${match.url}/project`} component={project} />
          <Route path={`${match.url}/user`} component={user} />
          <Route path={`${match.url}/project-setting`} component={projectSetting} />
          <Route path={`${match.url}/password`} component={password} />
          <Route path={`${match.url}/organization-info`} component={organizationInfo} />
          <Route path={`${match.url}/project-info`} component={projectInfo} />
          <Route path={`${match.url}/user-info`} component={userInfo} />
          <Route path={'*'} component={nomatch} />
        </Switch>
      </IntlProviderAsync>
    );
  }
}

export default IAMIndex;
