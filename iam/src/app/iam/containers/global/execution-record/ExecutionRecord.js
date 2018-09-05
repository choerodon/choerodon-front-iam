import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Table, Tooltip, Input, Popover, Icon } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, Action } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import './ExecutionRecord.scss';

const intlPrefix = 'global.execution';
const tablePrefix = 'global.taskdetail';
const dataSource = {
  totalPages: 1,
  totalElements: 3,
  numberOfElements: 3,
  number: 0,
  size: 20,
  content: [
    {
      id: 705,
      name: '名称1',
      lastExecutionTime: '2018-08-05 14:22',
      nextExecutionTime: '2018-08-10 14:22',
      status: 'RUNNING',
      planExecutionTime: '2018-08-10 14:22',
      actualExecutionTime: '2018-08-10 14:22',
      failReason: '123',
    },
    {
      id: 704,
      name: '名称2',
      lastExecutionTime: '2018-08-05 14:22',
      nextExecutionTime: '2018-08-10 14:22',
      status: 'FAILED',
      planExecutionTime: '2018-08-10 14:22',
      actualExecutionTime: '2018-08-10 14:22',
      failReason: '123',
    },
    {
      id: 703,
      name: '名称3',
      lastExecutionTime: '2018-08-05 14:22',
      nextExecutionTime: '2018-08-10 14:22',
      status: 'COMPLETED',
      planExecutionTime: '2018-08-10 14:22',
      actualExecutionTime: '2018-08-10 14:22',
      failReason: '123',
    },
  ],
  empty: false,
};

@withRouter
@injectIntl
@inject('AppState')

export default class ExecutionRecord extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      loading: true,
      pagination: {
        current: dataSource.number + 1,
        pageSize: dataSource.size,
        total: dataSource.totalElements,
      },
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
      filters: {},
      params: [],
    };
  }

  renderStatus(status) {
    let obj = {};
    switch (status) {
      case 'RUNNING':
        obj = {
          key: 'running',
          value: '进行中',
        };
        break;
      case 'FAILED':
        obj = {
          key: 'failed',
          value: '失败',
        };
        break;
      case 'COMPLETED':
        obj = {
          key: 'completed',
          value: '完成',
        };
        break;
      default:
        break;
    }

    return (
      <span className={`c7n-execution-record-status ${obj.key}`}>
        {obj.value}
      </span>
    );
  }

  render() {
    const { intl } = this.props;
    const { sort: { columnKey, order }, filters, params, pagination, loading } = this.state;
    const columns = [{
      title: <FormattedMessage id="status" />,
      dataIndex: 'status',
      key: 'status',
      filters: [{
        value: 'RUNNING',
        text: '进行中',
      }, {
        value: 'FAILED',
        text: '失败',
      }, {
        value: 'COMPLETED',
        text: '完成',
      }],
      filteredValue: filters.status || [],
      render: status => this.renderStatus(status),
    }, {
      title: <FormattedMessage id="name" />,
      dataIndex: 'name',
      key: 'name',
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.failed.reason`} />,
      dataIndex: 'failReason',
      key: 'failReason',
      filters: [],
      filteredValue: filters.failReason || [],
    }, {
      title: <FormattedMessage id={`${tablePrefix}.last.execution.time`} />,
      dataIndex: 'lastExecutionTime',
      key: 'lastExecutionTime',
    }, {
      title: <FormattedMessage id={`${tablePrefix}.plan.execution.time`} />,
      dataIndex: 'planExecutionTime',
      key: 'planExecutionTime',
    }, {
      title: <FormattedMessage id={`${tablePrefix}.next.execution.time`} />,
      dataIndex: 'nextExecutionTime',
      key: 'nextExecutionTime',
    }, {
      title: <FormattedMessage id={`${tablePrefix}.actual.execution.time`} />,
      dataIndex: 'actualExecutionTime',
      key: 'actualExecutionTime',
    }]
    return (
      <Page>
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
        >
          <Table
            columns={columns}
            dataSource={dataSource.content}
            pagination={pagination}
            filters={params}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
        </Content>
      </Page>
    );
  }
}
