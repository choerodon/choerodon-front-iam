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
    }
  }

  render() {
    return (
      <Page>
        <Header title="组织信息">
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh"/>
          </Button>
        </Header>
        <Content />
      </Page>
    )
  }
}

export default withRouter(OrganizationInfo);

