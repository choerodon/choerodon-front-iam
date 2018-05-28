/**
 * Created by hulingfangzi on 2018/5/28.
 */
import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const route = asyncRouter(() => (import('./routeHome')), () => (import('../../../stores/globalStores/route')));

const RouteIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={route} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default RouteIndex;
