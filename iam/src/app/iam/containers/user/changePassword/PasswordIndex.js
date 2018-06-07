import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const PasswordHome = asyncRouter(() => import('./password'));

const PasswordHomeIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={PasswordHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default PasswordHomeIndex;
