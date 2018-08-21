import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { DashBoardNavBar } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import './index.scss';

const intlPrefix = 'dashboard.projectinfo';

@inject('AppState', 'HeaderStore')
@observer
export default class ProjectInfo extends Component {
  render() {
    const { HeaderStore, AppState } = this.props;
    const { id: projectId, organizationId, type } = AppState.currentMenuType;
    const projectData = HeaderStore.getProData || [];
    const orgData = HeaderStore.getOrgData || [];
    const { name, code } = projectData.find(({ id }) => String(id) === String(projectId)) || {};
    const { name: organizeName } = orgData.find(({ id }) => String(id) === String(organizationId)) || {};
    return (
      <div className="c7n-iam-dashboard-project">
        <dl>
          <dt><FormattedMessage id={`${intlPrefix}.name`} /></dt>
          <dd>{name}</dd>
          <dt><FormattedMessage id={`${intlPrefix}.code`} /></dt>
          <dd>{code}</dd>
          <dt><FormattedMessage id={`${intlPrefix}.organization`} /></dt>
          <dd>{organizeName}</dd>
        </dl>
        <DashBoardNavBar>
          <Link to={`/iam/project-setting?type=${type}&id=${projectId}&name=${name}&organizationId=${organizationId}`}>
            <FormattedMessage id={`${intlPrefix}.redirect`} />
          </Link>
        </DashBoardNavBar>
      </div>
    );
  }
}
