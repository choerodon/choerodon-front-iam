/**
 * Created by hulingfangzi on 2018/7/2.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button,  Form, Modal, Progress, Select, Table, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Action, axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import querystring from 'query-string';
const intlPrefix = 'user.orginfo';

const { Sidebar } = Modal;

@inject('AppState')
@observer

class OrganizationInfo extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
      filters: {},
      params: '',
      content: [
        {
          "id": 3,
          "code": "choerodon.code.iam",
          "name": "运营组织",
          "level": "site",
          "parentId": 0,
          "icon": "IAM",
          "route": null,
          "objectVersionNumber": 222,
          "permissions": [],
          "zhName": null,
          "enName": null,
          "subMenus": null,
          "default": true
        },
        {
          "id": 49,
          "code": "choerodon.code.microservice",
          "name": "销售组织",
          "level": "site",
          "parentId": 0,
          "icon": "micro",
          "route": null,
          "objectVersionNumber": 181,
          "permissions": [],
          "zhName": null,
          "enName": null,
          "subMenus": null,
          "default": true
        },
        {
          "id": 160,
          "code": "choerodon.code.api",
          "name": "API管理",
          "level": "site",
          "parentId": 0,
          "icon": "API",
          "route": null,
          "objectVersionNumber": 1,
          "permissions": [],
          "zhName": null,
          "enName": null,
          "subMenus": null,
          "default": true
        },
      ]
    }
  }


  render() {
    const { content } = this.state;
    const { AppState } = this.props;
    const columns = [{
      title: '组织/角色',
      dataIndex: 'name',
      key: 'name',
    }]
    return (
      <Page>
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`}/>}
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh"/>
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{name: AppState.getUserInfo.loginName}}
        >
          <Table
            dataSource={content}
            pagination={false}
            columns={columns}
          />
        </Content>
      </Page>
    )
  }
}

export default withRouter(injectIntl(OrganizationInfo));

