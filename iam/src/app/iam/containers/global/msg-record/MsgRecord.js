/**
 * Created by chenbinjie on 2018/8/6.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Button, Select, Table, Tooltip, 
} from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import {
  axios, Content, Header, Page, Permission, 
} from 'choerodon-front-boot';

// const intlPrefix = 'global.msgrecord';

// 公用方法类
class MsgRecordType {
  constructor(context) {
    this.context = context;
    const { AppState } = this.context.props;
    this.data = AppState.currentMenuType;
    const { type, id, name } = this.data;
    const codePrefix = type === 'organization' ? 'organization' : 'global';
    this.code = `${codePrefix}.msgrecord`;
    this.values = { name: name || 'Choerodon' };
    this.type = type;
    this.orgId = id;
  }
}

@withRouter
@injectIntl
@inject('AppState')
@observer
export default class APITest extends Component {
  componentWillMount() {
    this.initMsgRecord();
  }

  initMsgRecord() {
    this.msgrecord = new MsgRecordType(this);
  }

  render() {
    const { intl } = this.props;

    return (
      <Page
        service={['manager-service.service.pageManager']}
      >
        <Header
          title={<FormattedMessage id="msgrecord.header.title" />}
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={this.msgrecord.code}
          values={{ name: `${this.msgrecord.values.name || 'Choerodon'}` }}
        >
          <Table
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
        </Content>
      </Page>
    );
  }
}
