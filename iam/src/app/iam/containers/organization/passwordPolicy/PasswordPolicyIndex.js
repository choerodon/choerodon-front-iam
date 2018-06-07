import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const UpdatePasswordPolicy = asyncRouter(() => import('./passwordPolicyHome'), () => import('../../../stores/organization/passwordPolicy/PasswordPolicyStore'));
const PasswordPolicyIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={UpdatePasswordPolicy} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default PasswordPolicyIndex;
