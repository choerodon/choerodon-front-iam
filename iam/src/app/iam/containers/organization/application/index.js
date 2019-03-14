import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';


const index = asyncRouter(() => import('./Application'), () => import('../../../stores/organization/application'));
const manageApplication = asyncRouter(() => import('./ManageApplication'), () => import('../../../stores/organization/application'));

const Index = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={index} />
    <Route exact path={`${match.url}/manage/:applicationId`} component={manageApplication} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default Index;
