/**
 * Created by cheon on 6/27/17.
 */
import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const Role = asyncRouter(() => (import('./roleHome')), () => (import('../../../stores/globalStores/role')));
const EditRole = asyncRouter(() => (import('./roleEdit')), () => (import('../../../stores/globalStores/role')));
const CreateRole = asyncRouter(() => (import('./roleCreate')), () => (import('../../../stores/globalStores/role')));

const RoleIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Role} />
    <Route path={`${match.url}/create`} component={CreateRole} />
    <Route path={`${match.url}/edit/:id`} component={EditRole} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default RoleIndex;
