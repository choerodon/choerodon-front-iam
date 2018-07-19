/**
 * Created by hulingfangzi on 2018/7/2.
 */
import React from 'react';
import { Route, Switch, } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ProjectInfo = asyncRouter(() => import('./ProjectInfo'));

const ProjectInfoIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={ProjectInfo} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ProjectInfoIndex;
