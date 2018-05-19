import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const menuTreePage = asyncRouter(() => import('./MenuTree'));

const menuTree = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={menuTreePage} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default menuTree;
