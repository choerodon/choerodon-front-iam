import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Select, Table, Tooltip, Modal, Form, Input, Popover, Icon } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, Action } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';


@Form.create()
@withRouter
@injectIntl
@inject('AppState')

export default class TaskDetail extends Component {
  state = this.getInitState();

  getInitState() {
    return {

    };
  }

  render() {
    return (
      <Page>
        <Header
          title="任务明细"
        >
          <Button
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content />
      </Page>
    );
  }
}
