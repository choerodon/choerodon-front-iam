import React from 'react';
import { Route, Switch, } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const MemberRole = asyncRouter(() => import('./MemberRole'));

const GlobalIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={MemberRole} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default GlobalIndex;
