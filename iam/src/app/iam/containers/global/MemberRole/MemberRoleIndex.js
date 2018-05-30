import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const MemberRole = asyncRouter(() => import('./MemberRole'));

const GlobalIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={MemberRole} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default GlobalIndex;
