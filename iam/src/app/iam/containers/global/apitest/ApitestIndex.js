/**
 * Created by hand on 2018/7/3.
 */
import React from 'react';
import { Route, Switch, } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const Apitest = asyncRouter(() => (import('./Apitest')), () => import('../../../stores/globalStores/apitest') );

const ApitestIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Apitest} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ApitestIndex;
