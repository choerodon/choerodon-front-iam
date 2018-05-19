import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const Clients = asyncRouter(() => import('./clientHome'), () => import('../../../stores/organization/client'));
const CreateClient = asyncRouter(() => import('./clientCreate'), () => import('../../../stores/organization/client'));
const EditClient = asyncRouter(() => import('./clientEdit'), () => import('../../../stores/organization/client'));

const ClientIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Clients} />
    <Route path={`${match.url}/new`} component={CreateClient} />
    <Route path={`${match.url}/edit/:id`} component={EditClient} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ClientIndex;
