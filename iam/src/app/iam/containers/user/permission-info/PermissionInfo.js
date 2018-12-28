import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import classnames from 'classnames';
import { Content, Header, Page } from 'choerodon-front-boot';
import { Table, Button, Tooltip } from 'choerodon-ui';
import './PermissionInfo.scss';
import StatusTag from '../../../components/statusTag';
import MouseOverWrapper from '../../../components/mouseOverWrapper';

const intlPrefix = 'user.permissioninfo';

@injectIntl
@inject('AppState', 'PermissionInfoStore')
@observer
export default class PermissionInfo extends Component {
  handlePageChange = (pagination, filters, sort, params) => {
    this.props.PermissionInfoStore.loadData(pagination, params);
  };

  handleRefresh = () => {
    this.loadData();
  };

  loadData = () => {
    this.props.PermissionInfoStore.setRole(this.props.AppState.getUserInfo);
    this.props.PermissionInfoStore.loadData();
  };

  componentDidMount() {
    this.loadData();
  }

  renderRoleColumn = (text) => {
    const roles = text.split('\n');
    return roles.map((value) => {
      const item = <span className={'role-wrapper'} key={value}>{value}</span>;
      return item;
    });
  };

  getTableColumns() {
    const iconType = { site: 'dvr', project: 'project', organization: 'domain' };
    return [{
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      width: '25%',
      dataIndex: 'name',
      key: 'name',
      className: 'c7n-permission-info-code',
      render: (text, record) => (
        <StatusTag iconType={iconType[record.level]} name={text} mode="icon" />
      ),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.code`} />,
      width: '20%',
      dataIndex: 'code',
      key: 'code',
      className: 'c7n-permission-info-description',
      render: text => (
        <MouseOverWrapper text={text} width={0.15}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="level" />,
      width: '5%',
      dataIndex: 'level',
      key: 'level',
      className: 'c7n-permission-info-description',
      render: text => (
        <MouseOverWrapper text={text} width={0.04}>
          <FormattedMessage id={text} />
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="role" />,
      width: '30%',
      dataIndex: 'roles',
      key: 'roles',
      className: 'c7n-permission-info-description',
      render: this.renderRoleColumn,
    }];
  }

  render() {
    const { intl, PermissionInfoStore: { pagination, params }, PermissionInfoStore } = this.props;
    return (
      <Page
        service={[
          'iam-service.user.pagingQueryRole',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code={intlPrefix}>
          <Table
            loading={PermissionInfoStore.getLoading}
            columns={this.getTableColumns()}
            pagination={pagination}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
            dataSource={PermissionInfoStore.getDataSource}
            filters={params}
            rowKey="id"
            onChange={this.handlePageChange}
            fixed
            className="c7n-permission-info-table"
          />
        </Content>
      </Page>
    );
  }
}
