import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Table, Button, Menu, Dropdown, Icon, Form, Select, message } from 'choerodon-ui';
import Permission from 'PerComponent';
import Page, { Header, Content } from 'Page';
import Remove from 'Remove';
import _ from 'lodash';
import classNames from 'classnames';
import Action from 'Action';
import SideBar from 'SideBar';
import CreateRole from '../roleCreate';
import DetailRole from '../roleDetail';
import EditRole from '../roleEdit';
import './Role.scss';
import '../../../../assets/css/main.scss';
import RoleStore from '../../../../stores/globalStores/role/RoleStore';

const Option = Select.Option;

@inject('AppState')
@observer
class Role extends Component {
  state = this.getInitState();

  componentDidMount() {
    this.loadRole();
  }

  getInitState() {
    return {
      open: false,
      id: '',
      visible: false,
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

  handleOpen = (ids) => {
    this.setState({ open: true, id: ids });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleDelete = () => {
    const { id } = this.state;
    this.setState({
      open: false,
    });
    RoleStore.deleteRoleById(id).then((data) => {
      const status = data.status;
      if (status === 204) {
        Choerodon.prompt(Choerodon.getMessage('删除成功', 'Success'));
        this.loadRole();
      } else {
        Choerodon.prompt(Choerodon.getMessage('删除失败', 'Failed'));
      }
    }).catch((error) => {
      Choerodon.handleResponseError(error);
    });
  };
  handleEnable = (record) => {
    if (record.enabled) {
      RoleStore.disableRole(record.id).then(() => {
        Choerodon.prompt('已停用');
        this.loadRole();
      });
    } else {
      RoleStore.enableRole(record.id).then(() => {
        Choerodon.prompt('已启用');
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

  handleSideBarClose = () => {
    this.setState({
      visible: false,
      selectedData: '',
    });
  };

  handleSideBarOk = (e) => {
    const { selectType } = this.state;
    if (selectType === 'create') {
      this.createRole.handleCreate(e);
    } else if (selectType === 'edit') {
      this.editRole.handleEdit(e);
    }
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
    const levels = Object.values(this.state.selectedRoleIds);
    if (levels.some((level, index) => levels[index + 1] && levels[index + 1] !== level)) {
      Choerodon.prompt('选择的角色具有不同层级的权限!');
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
          <span className="icon-settings" />
          {Choerodon.getMessage('预定义', 'Yes')}
        </div>
      );
    } else {
      return (
        <div>
          <span className="icon-av_timer" />
          {Choerodon.getMessage('自定义', 'No')}
        </div>
      );
    }
  }

  renderSideBar() {
    const { selectType, selectedData } = this.state;
    if (selectType === 'create') {
      return (
        <CreateRole
          onRef={(ref) => {
            this.createRole = ref;
          }}
          onSubmit={() => {
            this.setState({
              visible: false,
            });
            this.loadRole();
          }}
        />
      );
    } else if (selectType === 'edit') {
      return (
        <EditRole
          id={selectedData}
          onRef={(ref) => {
            this.editRole = ref;
          }}
          onSubmit={() => {
            this.setState({
              visible: false,
            });
            this.loadRole();
          }}
        />
      );
    } else if (selectType === 'detail') {
      return (
        <DetailRole
          id={this.state.selectedData}
        />
      );
    } else {
      return '';
    }
  }

  renderShowOkBtn() {
    if (this.state.detailVisible) {
      return false;
    } else {
      return true;
    }
  }

  renderSideTitle() {
    switch (this.state.selectType) {
      case 'create':
        return '创建角色';
      case 'detail':
        return '角色详情';
      case 'edit':
        return '角色编辑';
      default:
        return '';
    }
  }

  renderLevel(text) {
    if (text === 'organization') {
      return '组织层';
    } else if (text === 'project') {
      return '项目层';
    } else {
      return '全局层';
    }
  }

  render() {
    const { sort: { columnKey, order }, pagination, filters, open, visible } = this.state;
    const selectedRowKeys = this.getSelectedRowKeys();
    const { AppState } = this.props;
    const { type, id: organizationId } = AppState.currentMenuType;
    const columns = [{
      dataIndex: 'id',
      key: 'id',
      hidden: true,
      sortOrder: columnKey === 'id' && order,
    }, {
      title: Choerodon.getMessage('角色名称', 'role name'),
      dataIndex: 'name',
      key: 'name',
      filters: [],
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filteredValue: filters.name || [],
    }, {
      title: Choerodon.getMessage('角色编码', 'role code'),
      dataIndex: 'code',
      key: 'code',
      filters: [],
      sorter: true,
      sortOrder: columnKey === 'code' && order,
      filteredValue: filters.code || [],
    }, {
      title: Choerodon.getMessage('角色层级', 'role level'),
      dataIndex: 'level',
      key: 'level',
      filters: [
        {
          text: '全局',
          value: 'site',
        }, {
          text: '组织',
          value: 'organization',
        }, {
          text: '项目',
          value: 'project',
        }],
      render: text => this.renderLevel(text),
      sorter: true,
      sortOrder: columnKey === 'level' && order,
      filteredValue: filters.level || [],
    }, {
      title: Choerodon.getMessage('角色来源', 'is built-in'),
      dataIndex: 'builtIn',
      key: 'builtIn',
      filters: [{
        text: '预定义',
        value: 'true',
      }, {
        text: '自定义',
        value: 'false',
      }],
      render: (text, record) => this.renderBuiltIn(record),
      sorter: true,
      sortOrder: columnKey === 'builtIn' && order,
      filteredValue: filters.builtIn || [],
    }, {
      title: Choerodon.getMessage('启用状态', 'enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [{
        text: '启用',
        value: 'true',
      }, {
        text: '停用',
        value: 'false',
      }],
      render: text => (
        text ? '启用' : '停用'
      ),
      sorter: true,
      sortOrder: columnKey === 'enabled' && order,
      filteredValue: filters.enabled || [],
    }, {
      title: '',
      className: 'operateIcons',
      key: 'action',
      render: (text, record) => {
        const actionDatas = [{
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '基于该角色创建',
          action: this.createByThis.bind(this, record),
        }, {
          service: ['iam-service.role.update'],
          icon: '',
          type: 'site',
          text: '修改',
          action: this.showModal.bind(this, record.id),
        }];
        if (record.enabled) {
          actionDatas.push({
            service: ['iam-service.role.disableRole'],
            icon: '',
            type: 'site',
            text: '停用',
            action: this.handleEnable.bind(this, record),
          });
        } else {
          actionDatas.push({
            service: ['iam-service.role.enableRole'],
            icon: '',
            type: 'site',
            text: '启用',
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
      <Page className="choerodon-role">
        <Remove
          open={open}
          handleCancel={this.handleClose}
          handleConfirm={this.handleDelete}
        />
        <Header
          title={Choerodon.getMessage('角色管理', 'title')}
        >
          <Permission
            service={['iam-service.role.create']}
            type={type}
            organizationId={organizationId}
          >
            <Button
              icon="playlist_add"
              onClick={this.goCreate}
            >
              {Choerodon.getMessage('创建角色', 'create')}
            </Button>
          </Permission>
          <Permission
            service={['iam-service.role.createBaseOnRoles']}
            type={type}
            organizationId={organizationId}
          >
            <Button
              icon="content_copy"
              onClick={this.createByMultiple}
              disabled={!selectedRowKeys.length}
            >
              {Choerodon.getMessage('基于所选角色创建', 'create role based on chosen roles')}
            </Button>
          </Permission>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            {Choerodon.getMessage('刷新', 'Refresh')}
          </Button>
        </Header>
        <Content
          title={`平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”的角色管理`}
          description="角色是您可分配给成员的一组权限。您可以创建角色并为其添加权限，也可以复制现有角色并调整其权限。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/platform/role/"
        >
          <Table
            columns={columns}
            dataSource={RoleStore.getRoles}
            pagination={pagination}
            rowSelection={rowSelection}
            rowKey={record => record.id}
            onChange={this.handlePageChange}
            loading={RoleStore.getIsLoading}
            filterBarPlaceholder="过滤表"
          />
          <SideBar
            title={this.renderSideTitle()}
            onClose={this.handleSideBarClose}
            visible={visible}
            onOk={this.handleSideBarOk}
            showOkBth={this.renderShowOkBtn()}
          >
            {this.renderSideBar()}
          </SideBar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(Role));

