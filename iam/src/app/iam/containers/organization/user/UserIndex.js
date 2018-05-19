import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const UserHome = asyncRouter(() => import('./userHome'), () => import('../../../stores/organization/user/UserStore'));

const UserIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={UserHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default UserIndex;
