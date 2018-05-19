import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const UserGroupHome = asyncRouter(() => import('./userGroupHome'), () => import('../../../stores/organization/userGroup'));
const AddUser = asyncRouter(() => import('./addUser'), () => import('../../../stores/organization/userGroup'));

const UserGroupIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={UserGroupHome} />
    <Route path={`${match.url}/:id`} component={AddUser} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default UserGroupIndex;
