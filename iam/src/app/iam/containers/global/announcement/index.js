import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const index = asyncRouter(() => (import('./Announcement')), {
  AnnouncementStore: () => import('../../../stores/global/announcement'),
});
// const detail = asyncRouter(() => import('./APIDetail'));

const Index = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={index} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default Index;
