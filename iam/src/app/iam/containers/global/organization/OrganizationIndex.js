/**
 * Created by chesmilesoulon on 3/26/18.
 */

import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const Organization = asyncRouter(() => (import('./orgHome')), () => import('../../../stores/globalStores/organization'));

const OrganizationIndex = ({ match }) => (
  <Switch> 
    <Route exact path={match.url} component={Organization} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default OrganizationIndex;
