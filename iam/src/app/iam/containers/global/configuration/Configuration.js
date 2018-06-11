/**
 * Created by hand on 2018/6/11.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, Modal, Progress, Select, Table, Tooltip } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import classnames from 'classnames';
import querystring from 'query-string';
import './Configuration.scss';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const pageSize = 10;
const FormItemNumLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};

@inject('AppState')
@observer

class Configuration extends Component {

  goCreate = () => {
    this.props.history.push('configuration/create');
  }

  render() {
    return (
      <Page>
        <Header
          title="配置管理"
        >
          <Button
            icon="playlist_add"
            onClick={this.goCreate}
          >
            创建配置
          </Button>
        </Header>
        <Content
          title={`平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"的配置管理`}
          description="配置管理用来集中管理应用的当前环境的配置，配置修改后能够实时推送到应用端。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/microservice-management/route/"
        >
          <Table />
        </Content>
      </Page>
    )
  }
}

export default Form.create({})(withRouter(Configuration));
