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
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      id: '',
      page: 0,
      size: 10,
      visible: false,
      role: [],
      selectedRoleIds: [],
      params: {},
      flagRole: false,
      centerSelectedRows: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: '',
      },
      sort: {
        order: 'desc',
        name: 'id',
      },
      createVisible: false,
      detailVisible: false,
      editVisible: false,
      selectedData: '',
    };
  }

  componentDidMount() {
    this.loadRole(this.state.pagination, this.state.sort);
  }

  showModal = (ids) => {
    this.props.history.push(`role/edit/${ids}`);
  };
  goDetail = (ids) => {
    this.setState({
      detailVisible: true,
      selectedData: ids,
    });
  };
  goCreate = () => {
    RoleStore.setSelectedRolesPermission([]);
    // this.setState({
    //   createVisible: true,
    // });
    this.props.history.push('role/create');
  };
  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const role = { ...values, objectVersionNumber: this.state.role.objectVersionNumber };
        RoleStore.updateRoleById(this.state.id, role)
          .then((data) => {
            if (data) {
              Choerodon.prompt(Choerodon.getMessage('保存成功', 'Success'));
              this.loadRole(this.state.page, this.state.size, {
                code: '',
                input: '',
              });
              this.setState({
                visible: false,
              });
            }
          })
          .catch((error) => {
            Choerodon.handleResponseError(error);
            this.setState({
              visible: false,
            });
          });
      }
    });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };
  loadRole = (pagination, sort, body) => {
    RoleStore.loadRole(pagination, sort, body)
      .then((data) => {
        RoleStore.setIsLoading(false);
        RoleStore.setRoles(data.content);
        this.setState({
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
  };
  linkToChange = (url) => {
    const { AppState, history } = this.props;
    const type = sessionStorage.type;
    // const id = AppState.currentMenuType.id;
    // const name = AppState.currentMenuType.name;
    // if (type === 'global') {
    //   history.push(`${url}`);
    // } else if (type === 'organization') {
    //   history.push(`${url}?type=${type}&id=${id}&name=${name}`);
    // } else {
    //   const organizationId = AppState.currentMenuType.organizationId;
    //   history.push(`${url}?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`);
    // }
    history.push(`${url}`);
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
        this.loadRole(this.state.pagination, this.state.sort);
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
        this.loadRole(this.state.pagination, this.state.sort);
      });
    } else {
      RoleStore.enableRole(record.id).then(() => {
        Choerodon.prompt('已启用');
        this.loadRole(this.state.pagination, this.state.sort);
      });
    }
  };
  handleSearch = (state) => {
    // const { RoleStore } = this.props;
    this.setState({
      params: state,
      page: 0,
    });
    this.loadRole(0, this.state.size, this.state.params);
    // RoleStore.queryRole(state);
  };
  changeSelects = (selectedRowKeys, selectedRows) => {
    const centerSelectedZip = {
      page: this.state.page + 1,
      selectedRows,
    };
    _.remove(this.state.centerSelectedRows, n => n.page === centerSelectedZip.page);
    this.state.centerSelectedRows.push(centerSelectedZip);
    const selectArray = [];
    this.state.centerSelectedRows.map(value => selectArray.push(...value.selectedRows));
    const selectArrayId = [];
    selectArray.map(value => selectArrayId.push({
      id: value.id,
      level: value.level,
    }));
    this.setState({
      selectedRoleIds: selectArrayId,
    });
    if (selectedRowKeys.length > 0) {
      this.setState({
        flagRole: true,
      });
    } else {
      this.setState({
        flagRole: false,
      });
    }
  };

  handlePageChange(pagination, filters, sorter, params) {
    const newSorter = {
      name: sorter.columnKey || 'id',
      order: 'desc',
    };
    const body = {
      name: (filters.name && filters.name[0]) || '',
      code: (filters.code && filters.code[0]) || '',
      level: (filters.level && filters.level[0]) || '',
      params: params || {},
    };
    const enabled = filters.enabled;
    const builtIn = filters.builtIn;
    if (enabled && enabled.length) {
      body.enabled = enabled[0] === '启用';
    }
    if (builtIn && builtIn.length) {
      body.builtIn = builtIn[0] === '预定义';
    }
    this.loadRole(pagination, newSorter, body);
  }

  createByThis(record) {
    RoleStore.getRoleById(record.id).then((data) => {
      RoleStore.setChosenLevel(data.level);
      RoleStore.setSelectedRolesPermission(data.permissions);
      this.linkToChange('role/create');
    }).catch((err) => {
    });
  }

  createByMultiple = () => {
    const selects = this.state.selectedRoleIds;
    const levels = [];
    _.forEach(selects, (item) => {
      if (_.indexOf(levels, item.level) === -1) {
        levels.push(item.level);
      }
    });
    if (levels.length > 1) {
      Choerodon.prompt('选择的角色具有不同层级的权限!');
    } else {
      this.createBased();
    }
  };

  createBased = () => {
    const { selectedRoleIds } = this.state;
    const ids = selectedRoleIds.map(role => role.id);
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
    if (this.state.createVisible) {
      return (
        <CreateRole
          onRef={(ref) => {
            this.createRole = ref;
          }}
          onSubmit={() => {
            this.setState({
              createVisible: false,
            });
            this.loadRole(this.state.pagination, this.state.sort);
          }}
        />
      );
    } else if (this.state.detailVisible) {
      return (
        <DetailRole
          id={this.state.selectedData}
        />
      );
    } else if (this.state.editVisible) {
      return (
        <EditRole
          id={this.state.selectedData}
          onRef={(ref) => {
            this.editRole = ref;
          }}
          onSubmit={() => {
            this.setState({
              editVisible: false,
            });
            this.loadRole(this.state.pagination, this.state.sort);
          }}
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
    if (this.state.createVisible) {
      return '创建角色';
    } else if (this.state.detailVisible) {
      return '角色详情';
    } else if (this.state.editVisible) {
      return '角色编辑';
    } else {
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
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    const leftBtnBan = classNames({
      'header-btn headRightBtn leftBtnBan2': !this.state.flagRole,
      'header-btn headRightBtn leftBtn2': this.state.flagRole,
    });
    const columns = [{
      title: Choerodon.getMessage('角色名称', 'role name'),
      dataIndex: 'name',
      key: 'name',
      filters: [],
      sorter: (a, b) => (a.description > b.description ? 1 : 0),
    }, {
      title: Choerodon.getMessage('角色编码', 'role code'),
      dataIndex: 'code',
      key: 'code',
      filters: [],
      sorter: (a, b) => (a.name > b.name ? 1 : 0),
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
      sorter: (a, b) => (a.roleLevel > b.roleLevel ? 1 : 0),
    }, {
      title: Choerodon.getMessage('角色来源', 'is built-in'),
      dataIndex: 'builtIn',
      key: 'builtIn',
      filters: [{
        text: '预定义',
        value: '预定义',
      }, {
        text: '自定义',
        value: '自定义',
      }],
      render: (text, record) => this.renderBuiltIn(record),
      sorter: (a, b) => a.builtIn - b.builtIn,
    }, {
      title: Choerodon.getMessage('启用状态', 'enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [{
        text: '启用',
        value: '启用',
      }, {
        text: '停用',
        value: '停用',
      }],
      render: text => (
        text ? '启用' : '停用'
      ),
      sorter: (a, b) => a.enabled - b.enabled,
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
    const ids = [];
    if (this.state.selectedRoleIds.length > 0) {
      _.forEach(this.state.selectedRoleIds, (item) => {
        ids.push(item.id);
      });
    }
    const rowSelection = {
      selectedRowKeys: ids,
      onChange: this.changeSelects.bind(this),
    };
    return (
      <Page className="choerodon-role">
        <Remove
          open={this.state.open}
          handleCancel={this.handleClose}
          handleConfirm={this.handleDelete.bind(this)}
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
              onClick={() => {
                this.goCreate();
              }}
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
              disabled={!this.state.flagRole}
            >
              {Choerodon.getMessage('基于所选角色创建', 'create role based on chosen roles')}
            </Button>
          </Permission>
          <Button
            onClick={() => {
              this.loadRole(this.state.pagination, this.state.sort);
            }}
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
            pagination={this.state.pagination}
            rowSelection={rowSelection}
            rowKey={record => record.id}
            onChange={this.handlePageChange.bind(this)}
            loading={RoleStore.getIsLoading}
            filterBarPlaceholder="过滤表"
          />
          <SideBar
            title={this.renderSideTitle()}
            onClose={() => {
              this.setState({
                createVisible: false,
                detailVisible: false,
                editVisible: false,
                selectedData: '',
              });
            }}
            visible={this.state.createVisible ||
            this.state.detailVisible ||
            this.state.editVisible}
            onOk={() => {
              if (this.state.createVisible) {
                this.createRole.handleCreate(event);
              }
              if (this.state.editVisible) {
                this.editRole.handleEdit(event);
              }
            }}
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

