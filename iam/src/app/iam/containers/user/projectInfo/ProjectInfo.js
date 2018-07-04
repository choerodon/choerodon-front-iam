/**
 * Created by hulingfangzi on 2018/7/2.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button,  Form, Modal, Table, Icon, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Action, axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import querystring from 'query-string';
const intlPrefix = 'user.proinfo';
const { Sidebar } = Modal;

@inject('AppState')
@observer

class ProjectInfo extends Component {
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
    const { AppState } = this.props;
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
          <Table />
        </Content>
      </Page>
    )
  }
}

export default withRouter(ProjectInfo);

