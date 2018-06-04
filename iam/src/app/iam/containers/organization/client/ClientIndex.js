import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const Clients = asyncRouter(() => import('./clientHome'), () => import('../../../stores/organization/client'));

const ClientIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Clients} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ClientIndex;
