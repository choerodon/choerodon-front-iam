import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const home = asyncRouter(() => import('./UserInfo'));

const index = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={home} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default index;
