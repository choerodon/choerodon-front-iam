import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const LDAP = asyncRouter(() => import('./ldapHome'), () => import('../../../stores/organization/ldap/LDAPStore'));

const LDAPIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={LDAP} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default LDAPIndex;
