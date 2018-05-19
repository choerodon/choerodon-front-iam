import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const LDAP = asyncRouter(() => import('./ldapHome'), () => import('../../../stores/organization/ldap/LDAPStore'));

const LDAPIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={LDAP} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default LDAPIndex;
