/**
 * Created by hulingfangzi on 2018/6/11.
 */
import React from 'react';
import { Route, Switch, } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const Configuration = asyncRouter(() => (import('./Configuration')), () => import('../../../stores/globalStores/configuration'));
const CreateConfiguration = asyncRouter(() => import('./createConfiguration'));
const EditConfiguration = asyncRouter(() => import('./editConfiguration'));

const ConfigurationIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Configuration} />
    <Route path={`${match.url}/create`} component={CreateConfiguration} />
    <Route path={`${match.url}/edit/:name/:id`} component={EditConfiguration} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ConfigurationIndex;
