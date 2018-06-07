import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const menuTreePage = asyncRouter(() => import('./MenuTree'));

const menuTree = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={menuTreePage} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default menuTree;
