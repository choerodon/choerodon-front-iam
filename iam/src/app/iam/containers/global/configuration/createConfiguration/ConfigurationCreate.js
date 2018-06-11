/**
 * Created by hulingfangzi on 2018/6/11.
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, axios } from 'choerodon-front-boot';
import { Button, Form, Icon, Modal, Progress, Select, Table, Tooltip } from 'choerodon-ui';
import './ConfigurationCreate.scss';

@inject('AppState')
@observer

class CreateConfig extends Component {
  render() {
    return (
      <Page>
        <Header
          title="创建配置"
          backPath="/iam/configuration"
        />
        <Content
          title={`平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"的配置管理`}
          description="配置管理用来集中管理应用的当前环境的配置，配置修改后能够实时推送到应用端。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/platform/role/"
        />
      </Page>
    )
  }
}

export default Form.create({})(withRouter(CreateConfig));
