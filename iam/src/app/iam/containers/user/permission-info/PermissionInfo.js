import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Content } from 'choerodon-front-boot';
import { Table } from 'choerodon-ui';
import './PermissionInfo.scss';
import MouseOverWrapper from '../../../components/mouseOverWrapper';

const intlPrefix = 'user.permissioninfo';

@injectIntl
@observer
export default class PermissionInfo extends Component {
  handlePageChange = (pagination, filters, sort, params) => {
    const { store } = this.props;
    store.loadData(pagination, params);
  };

  getTableColumns() {
    return [{
      title: <FormattedMessage id={`${intlPrefix}.table.permission`} />,
      width: '50%',
      dataIndex: 'code',
      key: 'code',
      className: 'c7n-permission-info-code',
      render: text => (
        <MouseOverWrapper text={text} width={0.45}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.description`} />,
      width: '50%',
      dataIndex: 'description',
      key: 'description',
      className: 'c7n-permission-info-description',
      render: text => (
        <MouseOverWrapper text={text} width={0.45}>
          {text}
        </MouseOverWrapper>
      ),
    }];
  }

  render() {
    const {
      intl,
      store: {
        loading, params, pagination, permissionData,
        pagination: { total }, role: { name, projectName, organizationName },
      },
      type,
    } = this.props;
    const description = intl.formatMessage({ id: `${type}.permission.description` }, {
      proName: projectName,
      orgName: organizationName,
      roleName: name,
    });
    const link = intl.formatMessage({ id: `${type}.link` });
    return (
      <Content
        className="sidebar-content"
        code={intlPrefix}
        values={{
          roleName: name,
          description,
          link,
        }}
      >
        <p style={{ fontSize: 18, marginBottom: 8 }}>{total}个已分配权限</p>
        <Table
          loading={loading}
          columns={this.getTableColumns()}
          pagination={pagination}
          filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          dataSource={permissionData}
          filters={params}
          rowKey="code"
          onChange={this.handlePageChange}
          fixed
          className="c7n-permission-info-table"
        />
      </Content>
    );
  }
}
