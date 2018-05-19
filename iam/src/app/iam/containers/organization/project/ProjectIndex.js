/**
 * Created by hand on 2017/6/27.
 */

import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

// const Project = asyncRouter(
// () => import('./Project'), () => import('../../../stores/organization/project/ProjectStore'));
const Project = asyncRouter(() => import('./projectHome'), () => import('../../../stores/organization/project'));

const ProjectIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Project} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ProjectIndex;
