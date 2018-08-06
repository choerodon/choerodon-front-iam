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
import classnames from 'classnames';

const intlPrefix = 'global.mailtemplate';

@withRouter
@injectIntl
@inject('AppState')
@observer
export default class APITest extends Component {
  render() {
    const { intl } = this.props;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      dataIndex: 'name',
      key: 'name',
      width: 350,
      render: (text, data) => {
        const { name } = data;
        if (name) {
          return (
            <span>
              {name}
            </span>
          );
        }
      },
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.code`} />,
      dataIndex: 'url',
      key: 'url',
      width: 438,
      render: (text, record) => (
        <Tooltip
          title={text}
          placement="bottomLeft"
          overlayStyle={{ wordBreak: 'break-all' }}
        >
          <div className="urlContainer">
            {text}
          </div>
        </Tooltip>
      ),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.type`} />,
      dataIndex: 'remark',
      key: 'remark',
      width: 475,
      render: (text, data) => {
        const { description, remark } = data;
        if (remark) {
          return remark;
        } else {
          return description;
        }
      },
    }, {
      title: '',
      width: '100px',
      key: 'action',
      align: 'right',
      render: (text, record) => {
        if ('method' in record) {
          return (
            <Button
              shape="circle"
              icon="find_in_page"
              size="small"
              onClick={this.goDetail.bind(this, record)}
            />
          );
        }
      },
    }];

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
        <Table
          columns={columns}
          childrenColumnName="paths"
          onChange={this.handlePageChange}
          rowKey={record => ('paths' in record ? record.name : record.operationId)}
          filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
        />
      </Page>
    );
  }
}
