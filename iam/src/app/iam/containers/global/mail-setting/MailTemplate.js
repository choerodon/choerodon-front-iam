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

const intlPrefix = 'global.mailsetting';

@withRouter
@injectIntl
@inject('AppState')
@observer
export default class APITest extends Component {
  render() {
    const { intl } = this.props;

    return (
      <Page
        service={['manager-service.service.pageManager']}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{ name: `${process.env.HEADER_TITLE_NAME || 'Choerodon'}` }}
        />
      </Page>
    );
  }
}
