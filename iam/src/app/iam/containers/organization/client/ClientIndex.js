import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const Clients = asyncRouter(() => import('./clientHome'), () => import('../../../stores/organization/client'));

const ClientIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Clients} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ClientIndex;
