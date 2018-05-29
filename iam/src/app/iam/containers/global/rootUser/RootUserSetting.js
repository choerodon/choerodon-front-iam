/*eslint-disable*/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, Input, Modal, Popconfirm, Progress, Select, Table, Tooltip } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import Page, { Content, Header } from 'Page';
import Permission from 'PerComponent';
import axios from 'Axios';
import classnames from 'classnames';
import querystring from 'query-string';
import _ from 'lodash';

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
class RootUserSetting extends Component {
  constructor(props, context) {
    super(props, context);
  }
  addRootUser = () => {

  }
  reload = () => {

  }
  render() {
    const { AppState } = this.props;
    const { type, id: organizationId } = AppState.currentMenuType;
    return (
      <Page>
        <Header title={'Root用户设置'}>
          <Permission
            service={['iam-service.user.addDefaultUsers']}
            type={type}
            organizationId={organizationId}
          >
            <Button
              onClick={this.addRootUser}
              icon="playlist_add"
            >
              添加
            </Button>
          </Permission>
          <Button
            onClick={this.reload}
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”的Root用户设置`}
          link=""
          description="Root用户能管理平台以及平台中的所有组织和项目。平台中可以有一个或多个Root用户。您可以添加和移除Root用户。"
        >
          <Table />
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(RootUserSetting));
