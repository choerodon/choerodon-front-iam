import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './index.scss';
import { Button, Icon } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { StepFooter, StepBar, GuideMask, Permission } from 'choerodon-front-boot';

@inject('GuideStore', 'AppState')
@injectIntl
@observer
export default class Basic extends Component {
  renderStep(current) {
    const { AppState, GuideStore, intl } = this.props;
    switch (current) {
      case 0:
        return (
          <div>
            <h2>{intl.formatMessage({ id: 'guide.iam.basic.h2' })}</h2>
            <h3>choerodon的基础系统配置</h3>
            <p>在本新手指引中，您可以创建一个新组织，并且在该组织中创建组织下的新项目，向新组织添加新用户，分别在组织层和项目层给用户分配角色。</p>
            <p>本教程会分步指导您完成如下任务：</p>
            <ul>
              <li><a onClick={() => GuideStore.setCurrentStep(1)} style={{ borderBottom: 0 }}>平台基本设置</a></li>
              <li><a onClick={() => GuideStore.setCurrentStep(2)} style={{ borderBottom: 0 }}>组织基本设置</a></li>
              <li><a onClick={() => GuideStore.setCurrentStep(3)} style={{ borderBottom: 0 }}>项目基本设置</a></li>
            </ul>
          </div>
        );
      case 1:
        return (
          <div>
            <h2>{intl.formatMessage({ id: 'guide.iam.basic.h2' })}</h2>
            <h3>创建组织</h3>
            <p>组织是项目的上一级。通过组织您可以管理项目、用户。</p>
            <p>您可以使用组织创建表单来创建组织，创建后平台默认您是这个组织的组织管理员。</p>
            <ol>
              <li>点击 <Link to="/iam/organization">管理</Link>，进入组织管理页面。</li>
              <li>点击 <GuideMask highLight="icon-playlist_add" level={1} siteLevel="site" route="/iam/organization">创建组织</GuideMask>，输入组织信息。</li>
            </ol>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>{intl.formatMessage({ id: 'guide.iam.basic.h2' })}</h2>
            <h3>组织基本设置</h3>
            <p>如果要进行组织基本操作的步骤，首先您必须先选择一个组织</p>
            <ol>
              <li>选择组织，点击<GuideMask highLight="c7n-boot-header-menu-type-button" mode="click">选择项目</GuideMask>，选择您要进入的组织。</li>
              <li>创建一个项目</li>
              <ul>
                <li>
                  导航至
                  <Link
                    onClick={e => (AppState.menuType.type === 'organization' ? null : e.preventDefault())}
                    to={`/iam/project?type=organization&id=${AppState.menuType.id}&name=${AppState.menuType.name}&organizationId=${AppState.menuType.id}`}
                  >项目管理
                  </Link>
                </li>
                <li>点击<GuideMask highLight="icon-playlist_add" level={1} siteLevel="organization" route="/iam/project">创建项目</GuideMask></li>
              </ul>
              <li>添加用户</li>
              <ul>
                <li>
                  导航至
                  <Link
                    onClick={e => (AppState.menuType.type === 'organization' ? null : e.preventDefault())}
                    to={`/iam/user?type=organization&id=${AppState.menuType.id}&name=${AppState.menuType.name}&organizationId=${AppState.menuType.organizationId}`}
                  >用户管理
                  </Link>
                </li>
                <li>点击<GuideMask highLight="icon-playlist_add" level={1} siteLevel="organization" route="/iam/user">创建用户</GuideMask></li>
              </ul>
              <li>分配组织层角色</li>
              <ul>
                <li>
                  导航至
                  <Link
                    onClick={e => (AppState.menuType.type === 'organization' ? null : e.preventDefault())}
                    to={`/iam/member-role?type=organization&id=${AppState.menuType.id}&name=${AppState.menuType.name}&organizationId=${AppState.menuType.organizationId}`}
                  >组织角色分配
                  </Link>
                </li>
                <li>点击<GuideMask highLight="icon-playlist_add" level={1} siteLevel="organization" route="/iam/member-role">添加</GuideMask></li>
              </ul>
            </ol>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>{intl.formatMessage({ id: 'guide.iam.basic.h2' })}</h2>
            <h3>项目基本设置</h3>
            <p>项目是最小粒度的管理层次。</p>
            <p>如果要进行项目基本操作的步骤，首先您必须先选择一个项目</p>
            <ol>
              <li>选择项目，点击<GuideMask highLight="c7n-boot-header-menu-type-button" mode="click">选择项目</GuideMask>，选择您要进入的项目。</li>
              <li>分配项目层角色</li>
              <ul>
                <li>
                  导航至
                  <Link
                    onClick={e => (AppState.menuType.type === 'project' ? null : e.preventDefault())}
                    to={`/iam/member-role?type=project&id=${AppState.menuType.id}&name=${AppState.menuType.name}&organizationId=${AppState.menuType.organizationId}`}
                  >项目角色分配
                  </Link>
                </li>
                <li>点击<GuideMask highLight="icon-playlist_add" level={1} siteLevel="project" route="/iam/member-role">添加</GuideMask></li>
              </ul>
            </ol>
          </div>
        );
      default:
        return (
          <div>
            <h2>{intl.formatMessage({ id: 'guide.iam.basic.h2' })}</h2>
            <h3>完成</h3>
            <p>恭喜！</p>
            <div className="icon-winner" />
            <p>现在您已经知道如何在choerodon初始状态下进行系统配置的一系列基础操作。</p>
            <p>您可以点击表单页面的“<a href="http://choerodon.io">了解更多<Icon type="open_in_new" /></a>”，了解系统配置的更多用户手册。</p>
            <p><a href="http://v0-10.choerodon.io/zh/docs/user-guide/system-configuration/platform/menu_configuration/">菜单配置<Icon type="open_in_new" /></a> 用于配置平台菜单</p>
            <p><a href="http://v0-10.choerodon.io/zh/docs/user-guide/system-configuration/platform/dashboard-config/">仪表盘配置<Icon type="open_in_new" /></a> 用于预置用户可见的仪表盘卡片</p>
            <p><a href="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/ldap/">LDAP<Icon type="open_in_new" /></a> 对组织应用的LDAP信息设置的管理</p>
            <p>或者了解如何在完成系统配置之后进行其他choerodon产品功能：</p>
          </div>
        );
    }
  }

  render() {
    const { GuideStore } = this.props;
    return (
      <div className="c7n-iam-guide-basic">
        <div style={{ width: '90%', margin: '0 auto' }}>
          <StepBar current={GuideStore.getCurrentStep} total={4} />
          {this.renderStep(GuideStore.getCurrentStep)}
        </div>
        <StepFooter total={4} />
      </div>
    );
  }
}
