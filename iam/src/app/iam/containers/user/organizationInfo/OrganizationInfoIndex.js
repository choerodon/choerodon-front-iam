/**
 * Created by hulingfangzi on 2018/7/2.
 */
import React from 'react';
import { Route, Switch, } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const OrganizationInfo = asyncRouter(() => import('./OrganizationInfo'));

const OrganizationInfoIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={OrganizationInfo} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default OrganizationInfoIndex;
