/**
 * Created by hulingfangzi on 2018/7/3.
 */
import React from 'react';
import { Route, Switch, } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const Microservice = asyncRouter(() => import('./Microservice'));

const MicroserviceIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Microservice} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default MicroserviceIndex;
