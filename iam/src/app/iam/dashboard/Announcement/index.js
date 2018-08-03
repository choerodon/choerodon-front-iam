import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import { DashBoardNavBar } from 'choerodon-front-boot';
import './index.scss';

export default class Announcement extends Component {
  render() {
    return (
      <div className="c7n-iam-dashboard-announcement">
        <ul>
          <li>
            <Icon type="volume_up" />
            <a target="choerodon" href="http://choerodon.io/zh/docs/release-notes/changelog_v0.8/">Choerodon 发布0.8.0</a>
          </li>
          <li>
            <Icon type="volume_up" />
            <a target="choerodon" href="http://choerodon.io/zh/docs/release-notes/changelog_v0.7/">Choerodon 发布0.7.0</a>
          </li>
          <li>
            <Icon type="volume_up" />
            <a target="choerodon" href="http://choerodon.io/zh/docs/release-notes/changelog_v0.6/">Choerodon 发布0.6.0</a>
          </li>
        </ul>
        <DashBoardNavBar>
          <a target="choerodon" href="http://choerodon.io/zh/docs/release-notes/">转至所有公告</a>
        </DashBoardNavBar>
      </div>
    );
  }
}
