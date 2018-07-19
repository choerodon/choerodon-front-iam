import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, Table } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Action, Content, Header, Page, Permission } from 'choerodon-front-boot';
import RoleStore from '../../../../stores/globalStores/role/RoleStore';
import './Role.scss';

const intlPrefix = 'global.role';
@inject('AppState')
@observer
class Role extends Component {
  state = this.getInitState();

  componentDidMount() {
    this.loadRole();
  }

  getInitState() {
    return {
      id: '',
      selectedRoleIds: {},
      params: [],
      filters: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
      selectedData: '',
    };
  }

  getSelectedRowKeys() {
    return Object.keys(this.state.selectedRoleIds).map(id => Number(id));
  }

  showModal(ids) {
    this.props.history.push(`role/edit/${ids}`);
  }

  goCreate = () => {
    RoleStore.setSelectedRolesPermission([]);
    this.props.history.push('role/create');
  };

  loadRole(paginationIn, sortIn, filtersIn, paramsIn) {
    const {
      pagination: paginationState,
      sort: sortState,
      filters: filtersState,
      params: paramsState,
    } = this.state;
    const pagination = paginationIn || paginationState;
    const sort = sortIn || sortState;
    const filters = filtersIn || filtersState;
    const params = paramsIn || paramsState;
    RoleStore.loadRole(pagination, sort, filters, params)
      .then((data) => {
        RoleStore.setIsLoading(false);
        RoleStore.setRoles(data.content);
        this.setState({
          sort,
          filters,
          params,
          pagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
        });
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  linkToChange = (url) => {
    this.props.history.push(`${url}`);
  };

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadRole();
    });
  };

  handleEnable = (record) => {
    const { intl } = this.props;
    if (record.enabled) {
      RoleStore.disableRole(record.id).then(() => {
        Choerodon.prompt(intl.formatMessage({id: 'disable.success'}));
        this.loadRole();
      });
    } else {
      RoleStore.enableRole(record.id).then(() => {
        Choerodon.prompt(intl.formatMessage({id: 'enable.success'}));
        this.loadRole();
      });
    }
  };
  changeSelects = (selectedRowKeys, selectedRows) => {
    const { selectedRoleIds } = this.state;
    Object.keys(selectedRoleIds).forEach((id) => {
      if (selectedRowKeys.indexOf(Number(id)) === -1) {
        delete selectedRoleIds[id];
      }
    });
    selectedRows.forEach(({ id, level }) => {
      selectedRoleIds[id] = level;
    });
    this.setState({
      selectedRoleIds,
    });
  };

  handlePageChange = (pagination, filters, sort, params) => {
    this.loadRole(pagination, sort, filters, params);
  };

  createByThis(record) {
    RoleStore.getRoleById(record.id).then((data) => {
      RoleStore.setChosenLevel(data.level);
      RoleStore.setSelectedRolesPermission(data.permissions);
      this.linkToChange('role/create');
    }).catch((err) => {
    });
  }

  createByMultiple = () => {
    const { intl } = this.props;
    const levels = Object.values(this.state.selectedRoleIds);
    if (levels.some((level, index) => levels[index + 1] && levels[index + 1] !== level)) {
      Choerodon.prompt(intl.formatMessage({id: `${intlPrefix}.create.byselect.level`}));
    } else {
      this.createBased();
    }
  };

  createBased = () => {
    const ids = this.getSelectedRowKeys();
    RoleStore.getSelectedRolePermissions(ids).then((datas) => {
      RoleStore.setChosenLevel(datas[0].level);
      RoleStore.setSelectedRolesPermission(datas);
      RoleStore.setInitSelectedPermission(datas);
      this.linkToChange('role/create');
    }).catch((error) => {
      Choerodon.prompt(error);
    });
  };

  renderBuiltIn(record) {
    if (record.builtIn) {
      return (
        <div>
          <Icon type="settings" style={{verticalAlign: 'text-bottom'}} />
          <FormattedMessage id={`${intlPrefix}.builtin.predefined`}/>
        </div>
      );
    } else {
      return (
        <div>
          <Icon type="av_timer" style={{verticalAlign: 'text-bottom'}} />
          <FormattedMessage id={`${intlPrefix}.builtin.custom`}/>
        </div>
      );
    }
  }

  renderLevel(text) {
    if (text === 'organization') {
      return  <FormattedMessage id="organization" />;
    } else if (text === 'project') {
      return <FormattedMessage id="project" />;
    } else {
      return <FormattedMessage id="global" />;
    }
  }

  render() {
    const { intl } = this.props;
    const { sort: { columnKey, order }, pagination, filters, params } = this.state;
    const selectedRowKeys = this.getSelectedRowKeys();
    const columns = [{
      dataIndex: 'id',
      key: 'id',
      hidden: true,
      sortOrder: columnKey === 'id' && order,
    }, {
      title: <FormattedMessage id="name" />,
      dataIndex: 'name',
      key: 'name',
      filters: [],
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="code" />,
      dataIndex: 'code',
      key: 'code',
      filters: [],
      sorter: true,
      sortOrder: columnKey === 'code' && order,
      filteredValue: filters.code || [],
    }, {
      title: <FormattedMessage id="level" />,
      dataIndex: 'level',
      key: 'level',
      filters: [
        {
          text: intl.formatMessage({id: "global"}),
          value: 'site',
        }, {
          text: intl.formatMessage({id: "organization"}),
          value: 'organization',
        }, {
          text: intl.formatMessage({id: "project"}),
          value: 'project',
        }],
      render: text => this.renderLevel(text),
      sorter: true,
      sortOrder: columnKey === 'level' && order,
      filteredValue: filters.level || [],
    }, {
      title: <FormattedMessage id="source" />,
      dataIndex: 'builtIn',
      key: 'builtIn',
      filters: [{
        text: intl.formatMessage({id: `${intlPrefix}.builtin.predefined`}),
        value: 'true',
      }, {
        text: intl.formatMessage({id: `${intlPrefix}.builtin.custom`}),
        value: 'false',
      }],
      render: (text, record) => this.renderBuiltIn(record),
      sorter: true,
      sortOrder: columnKey === 'builtIn' && order,
      filteredValue: filters.builtIn || [],
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [{
        text: intl.formatMessage({id: "enable"}),
        value: 'true',
      }, {
        text: intl.formatMessage({id: "disable"}),
        value: 'false',
      }],
      render: text => intl.formatMessage({id: text ? 'enable' : 'disable'}),
      sorter: true,
      sortOrder: columnKey === 'enabled' && order,
      filteredValue: filters.enabled || [],
    }, {
      title: '',
      key: 'action',
      align: 'right',
      render: (text, record) => {
        const actionDatas = [{
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: intl.formatMessage({id: `${intlPrefix}.create.byone`}),
          action: this.createByThis.bind(this, record),
        }, {
          service: ['iam-service.role.update'],
          icon: '',
          type: 'site',
          text: intl.formatMessage({id: 'modify'}),
          action: this.showModal.bind(this, record.id),
        }];
        if (record.enabled) {
          actionDatas.push({
            service: ['iam-service.role.disableRole'],
            icon: '',
            type: 'site',
            text: intl.formatMessage({id: 'disable'}),
            action: this.handleEnable.bind(this, record),
          });
        } else {
          actionDatas.push({
            service: ['iam-service.role.enableRole'],
            icon: '',
            type: 'site',
            text: intl.formatMessage({id: 'enable'}),
            action: this.handleEnable.bind(this, record),
          });
        }
        return <Action data={actionDatas} />;
      },
    }];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.changeSelects,
    };
    return (
      <Page
        service={[
          'iam-service.role.createBaseOnRoles',
          'iam-service.role.update',
          'iam-service.role.disableRole',
          'iam-service.role.enableRole',
          'iam-service.role.create',
          'iam-service.role.check',
          'iam-service.role.listRolesWithUserCountOnOrganizationLevel',
          'iam-service.role.listRolesWithUserCountOnProjectLevel',
          'iam-service.role.list',
          'iam-service.role.listRolesWithUserCountOnSiteLevel',
          'iam-service.role.queryWithPermissionsAndLabels',
          'iam-service.role.pagingQueryUsersByRoleIdOnOrganizationLevel',
          'iam-service.role.pagingQueryUsersByRoleIdOnProjectLevel',
          'iam-service.role.pagingQueryUsersByRoleIdOnSiteLevel',
        ]}
        className="choerodon-role"
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`}/>}
        >
          <Permission
            service={['iam-service.role.create']}
          >
            <Button
              icon="playlist_add"
              onClick={this.goCreate}
            >
              <FormattedMessage id={`${intlPrefix}.create`}/>
            </Button>
          </Permission>
          <Permission
            service={['iam-service.role.createBaseOnRoles']}
          >
            <Button
              icon="content_copy"
              onClick={this.createByMultiple}
              disabled={!selectedRowKeys.length}
            >
              <FormattedMessage id={`${intlPrefix}.create.byselect`}/>
            </Button>
          </Permission>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id='refresh'/>
          </Button>
        </Header>
        <Content
          code={intlPrefix}
        >
          <Table
            columns={columns}
            dataSource={RoleStore.getRoles}
            pagination={pagination}
            rowSelection={rowSelection}
            rowKey={record => record.id}
            filters={params}
            onChange={this.handlePageChange}
            loading={RoleStore.getIsLoading}
            filterBarPlaceholder={intl.formatMessage({id: 'filtertable'})}
          />
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(Role)));

