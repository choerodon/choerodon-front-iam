import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Content } from 'choerodon-front-boot';
import { Table } from 'choerodon-ui';

const intlPrefix = 'user.proinfo.detail';

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
      dataIndex: 'code',
      key: 'code',
      className: 'c7n-project-info-code',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.description`} />,
      dataIndex: 'description',
      key: 'description',
      className: 'c7n-project-info-description',
    }];
  }

  render() {
    const {
      intl,
      store: {
        loading, params, pagination, permissionData,
        pagination: { total }, role: { id, name, projectName },
      },
    } = this.props;
    const title = intl.formatMessage({ id: `${intlPrefix}.title` }, {
      roleName: name,
    });
    const description = intl.formatMessage({ id: `${intlPrefix}.description` }, {
      proName: projectName,
      roleName: name,
    });
    return (
      <Content
        className="sidebar-content"
        title={title}
        description={description}
        link={intl.formatMessage({ id: `${intlPrefix}.link` })}
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
        />
      </Content>
    );
  }
}
