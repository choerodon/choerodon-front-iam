import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const RootUserSetting = asyncRouter(() => import('./RootUserSetting'));

const RootUser = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={RootUserSetting} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default RootUser;
