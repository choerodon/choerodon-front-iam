import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const UserHome = asyncRouter(() => import('./userHome'), () => import('../../../stores/organization/user/UserStore'));

const UserIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={UserHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default UserIndex;
