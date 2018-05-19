import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const PasswordHome = asyncRouter(() => import('./password'));

const PasswordHomeIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={PasswordHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default PasswordHomeIndex;
