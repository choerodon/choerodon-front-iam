/**
 * Created by hand on 2017/6/27.
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

// const Project = asyncRouter(
// () => import('./Project'), () => import('../../../stores/organization/project/ProjectStore'));
const UserInfoHome = asyncRouter(() => import('./userInfoHome'));

const ProjectSettingIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={UserInfoHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ProjectSettingIndex;
