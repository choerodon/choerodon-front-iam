import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject } from 'mobx-react';
import { DashBoardNavBar } from 'choerodon-front-boot';
import { Spin } from 'choerodon-ui';
import './index.scss';

@inject('AppState', 'HeaderStore')
export default class Project extends Component {

  render() {
    const { HeaderStore, AppState } = this.props;
    const { id: projectId, organizationId, type } = AppState.currentMenuType;
    const projectData = HeaderStore.getProData || [];
    const orgData = HeaderStore.getOrgData || [];
    const { name, code } = projectData.find(({ id }) => id == projectId) || {};
    const { name: organizeName } = orgData.find(({ id }) => id == organizationId) || {};
    return (
      <Spin spinning={!code || !organizeName}>
        <div className="c7n-iam-dashboard-project">
          <section>
            <label>项目信息</label>
            <p>{name}</p>
            <label>项目编码</label>
            <p>{code}</p>
            <label>所属组织</label>
            <p>{organizeName}</p>
          </section>
          <DashBoardNavBar>
            <Link to={`/iam/project-setting?type=${type}&id=${projectId}&name=${name}&organizationId=${organizationId}`}>转至项目设置</Link>
          </DashBoardNavBar>
        </div>
      </Spin>
    );
  }
}
