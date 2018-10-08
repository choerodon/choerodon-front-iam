import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, Modal, Progress, Select, Table, Tooltip, Upload, Spin } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { FormattedMessage, injectIntl } from 'react-intl';
import classnames from 'classnames';
import MemberRoleType, { pageSize } from './MemberRoleType';
import MemberLabel from '../../../components/memberLabel/MemberLabel';
import './MemberRole.scss';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const FormItemNumLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};
const intlPrefix = 'memberrole';

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class MemberRole extends Component {
  state = this.getInitState();

  getInitState() {
    const { MemberRoleStore, AppState } = this.props;
    MemberRoleStore.loadCurrentMenuType(AppState.currentMenuType, AppState.getUserId);
    return {
      submitting: false,
      sidebar: false,
      roleData: MemberRoleStore.getRoleData, // 当前情况下的所有角色
      selectType: 'create',
      currentMemberData: [], // 当前成员的角色分配信息
      loading: true,
      showMember: true,
      selectMemberRoles: {},
      selectRoleMembers: [],
      selectRoleMemberKeys: [],
      expandedKeys: [],
      validedMembers: {},
      roleMemberDatas: MemberRoleStore.getRoleMemberDatas,
      roleMemberFilters: {},
      roleMemberParams: [],
      memberRoleFilters: {},
      memberRolePageInfo: {
        current: 1,
        total: 0,
        pageSize,
      },
      roleMemberFilterRole: [],
      roleIds: [],
      params: [],
      overflow: false,
      fileLoading: false,
    };
  }

  init() {
    this.initMemberRole();
    this.roles.fetch();
  }

  // 第一次渲染前获得数据
  componentWillMount() {
    this.init();
  }

  componentDidMount() {
    this.updateSelectContainer();
  }

  componentDidUpdate() {
    this.updateSelectContainer();
    this.props.MemberRoleStore.setRoleMemberDatas(this.state.roleMemberDatas);
    this.props.MemberRoleStore.setRoleData(this.state.roleData);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.props.MemberRoleStore.setRoleMemberDatas(this.state.roleMemberDatas);
    this.props.MemberRoleStore.setRoleData(this.state.roleData);
  }

  saveSideBarRef = (node) => {
    if (node) {
      this.sidebarBody = findDOMNode(node).parentNode;
    }
  };

  updateSelectContainer() {
    const body = this.sidebarBody;
    if (body) {
      const { overflow } = this.state;
      const bodyOverflow = body.clientHeight < body.scrollHeight;
      if (bodyOverflow !== overflow) {
        this.setState({
          overflow: bodyOverflow,
        });
      }
    }
  }

  reload = () => {
    this.setState(this.getInitState(), () => {
      this.init();
    });
  };

  formatMessage = (id, values = {}) => {
    const { intl } = this.props;
    return intl.formatMessage({
      id,
    }, values);
  };

  // 创建编辑角色 状态
  getOption = (current) => {
    const { roleData = [], roleIds } = this.state;
    return roleData.reduce((options, { id, name, enabled, code }) => {
      if (roleIds.indexOf(id) === -1 || id === current) {
        if (enabled === false) {
          options.push(<Option style={{ display: 'none' }} disabled value={id} key={id}>{name}</Option>);
        } else {
          options.push(
            <Option value={id} key={id} title={name}>
              <Tooltip title={code} placement="right" align={{ offset: [20, 0] }}>
                <span style={{ display: 'inline-block', width: '100%' }}>{name}</span>
              </Tooltip>
            </Option>,
          );
        }
      }
      return options;
    }, []);
  };

  closeSidebar = () => {
    this.setState({
      sidebar: false,
    });
  };

  openSidebar = () => {
    this.props.form.resetFields();
    this.setState({
      roleIds: this.initFormRoleIds(),
      sidebar: true,
    });
  };

  initFormRoleIds() {
    const { selectType, currentMemberData } = this.state;
    let roleIds = [undefined];
    if (selectType === 'edit') {
      roleIds = currentMemberData.roles.map(({ id }) => id);
    }
    return roleIds;
  }

  getProjectNameDom() {
    const { selectType, currentMemberData } = this.state;
    const member = [];
    const style = {
      marginTop: '-15px',
    };
    if (selectType === 'edit') {
      member.push(currentMemberData.loginName);
      style.display = 'none';
    }
    return (
      <MemberLabel label={<FormattedMessage id="memberrole.member" />} style={style} value={member} form={this.props.form} />
    );
  }

  getRoleFormItems = () => {
    const { selectType, roleIds, overflow } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItems = roleIds.map((id, index) => {
      const key = id === undefined ? `role-index-${index}` : String(id);
      return (<FormItem
        {...FormItemNumLayout}
        key={key}
      >
        {getFieldDecorator(key, {
          rules: [
            {
              required: roleIds.length === 1 && selectType === 'create',
              message: this.formatMessage('memberrole.role.require.msg'),
            },
          ],
          initialValue: id,
        })(
          <Select
            className="member-role-select"
            style={{ width: 300 }}
            label={<FormattedMessage id="memberrole.role.label" />}
            getPopupContainer={() => (overflow ? this.sidebarBody : document.body)}
            filterOption={(input, option) => {
              const childNode = option.props.children;
              if (childNode && React.isValidElement(childNode)) {
                return childNode.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
            onChange={(value) => {
              roleIds[index] = value;
            }}
            filter
          >
            {this.getOption(id)}
          </Select>,
        )}
        <Button
          size="small"
          icon="delete"
          shape="circle"
          onClick={() => this.removeRole(index)}
          disabled={roleIds.length === 1 && selectType === 'create'}
          className={'delete-role'}
        />
      </FormItem>);
    });
    return formItems;
  };

  addRoleList = () => {
    const { roleIds } = this.state;
    roleIds.push(undefined);
    this.setState({ roleIds });
  };
  // sidebar
  removeRole = (index) => {
    const { roleIds } = this.state;
    roleIds.splice(index, 1);
    this.setState({ roleIds });
  };

  deleteRoleByMultiple = () => {
    const { selectMemberRoles, showMember, selectRoleMembers } = this.state;
    const content = showMember ? 'memberrole.remove.select.all.content' : 'memberrole.remove.select.content';
    Modal.confirm({
      title: this.formatMessage('memberrole.remove.title'),
      content: this.formatMessage(content),
      onOk: () => {
        if (showMember) {
          return this.deleteRolesByIds(selectMemberRoles);
        } else {
          const data = {};
          selectRoleMembers.forEach(({ id, roleId }) => {
            if (!data[roleId]) {
              data[roleId] = [];
            }
            data[roleId].push(id);
          });
          return this.deleteRolesByIds(data);
        }
      },
    });
  };

  deleteRoleByRole = (record) => {
    Modal.confirm({
      title: this.formatMessage('memberrole.remove.title'),
      content: this.formatMessage('memberrole.remove.content', {
        member: record.loginName,
        role: record.roleName,
      }),
      onOk: () => this.deleteRolesByIds({ [record.roleId]: [record.id] }),
    });
  };

  deleteRolesByIds = (data) => {
    const { showMember } = this.state;
    let body = {};
    if (showMember) {
      body = {
        view: 'userView',
        memberType: 'user',
        data,
      };
    } else {
      body = {
        view: 'roleView',
        memberType: 'user',
        data,
      };
    }

    return this.roles.deleteRoleMember(body).then(({ failed, message }) => {
      if (failed) {
        Choerodon.prompt(message);
      } else {
        Choerodon.prompt(this.formatMessage('remove.success'));
        this.setState({
          selectRoleMemberKeys: [],
          selectMemberRoles: {},
        });
        this.roles.fetch();
      }
    });
  };

  initMemberRole() {
    this.roles = new MemberRoleType(this);
  }

  getSidebarTitle() {
    const { selectType } = this.state;
    if (selectType === 'create') {
      return <FormattedMessage id="memberrole.add" />;
    } else if (selectType === 'edit') {
      return <FormattedMessage id="memberrole.modify" />;
    } else if (selectType === 'upload') {
      return <FormattedMessage id="memberrole.upload" />;
    }
  }

  getUploadOkText = () => {
    const { fileLoading } = this.state;
    const { MemberRoleStore } = this.props;
    const uploading = MemberRoleStore.getUploading;
    if (fileLoading === true) {
      return '上传中...';
    } else if (uploading) {
      return '导入中...';
    } else {
      return '上传';
    }
  }


  getHeader() {
    const { selectType, currentMemberData } = this.state;
    const { code, values } = this.roles;
    const modify = selectType === 'edit';
    return {
      className: 'sidebar-content',
      ref: this.saveSideBarRef,
      code: this.getHeaderCode(),
      values: modify ? { name: currentMemberData.loginName } : values,
    };
  }

  getHeaderCode = () => {
    const { selectType } = this.state;
    const { code } = this.roles;
    let codeType = '';
    switch (selectType) {
      case 'edit':
        codeType = 'modify';
        break;
      case 'create':
        codeType = 'add';
        break;
      default:
        codeType = 'upload';
        break;
    }
    return `${code}.${codeType}`;
  };

  getAddOtherBtn(disabled) {
    return (
      <Button type="primary" disabled={disabled} className="add-other-role" icon="add" onClick={this.addRoleList}>
        <FormattedMessage id="memberrole.add.other" />
      </Button>
    );
  }

  renderForm = () => (
    <Form layout="vertical">
      {this.getProjectNameDom()}
      {this.getRoleFormItems()}
    </Form>
  );

  renderUpload = () => (
    <Content
      {...this.getHeader()}
    >
      <div>
        <div style={{ width: '512px' }}>
          {this.getUploadInfo()}
        </div>
        <div style={{ display: 'none' }}>
          <Upload {...this.getUploadProps()}>
            <Button className="c7n-user-upload-hidden" />
          </Upload>
        </div>
      </div>
    </Content>
  );

  getSidebarContent() {
    const { roleData = [], roleIds, selectType } = this.state;
    const disabled = roleIds.findIndex((id, index) => id === undefined) !== -1
      || !roleData.filter(({ enabled, id }) => enabled && roleIds.indexOf(id) === -1).length;
    return (
      <Content
        {...this.getHeader()}
      >
        {this.renderForm()}
        {this.getAddOtherBtn(disabled)}
      </Content>);
  }

  getSpentTime = (startTime, endTime) => {
    const { intl } = this.props;
    const timeUnit = {
      day: intl.formatMessage({ id: 'day' }),
      hour: intl.formatMessage({ id: 'hour' }),
      minute: intl.formatMessage({ id: 'minute' }),
      second: intl.formatMessage({ id: 'second' }),
    };
    const spentTime = new Date(endTime).getTime() - new Date(startTime).getTime(); // 时间差的毫秒数
    // 天数
    const days = Math.floor(spentTime / (24 * 3600 * 1000));
    // 小时
    const leave1 = spentTime % (24 * 3600 * 1000); //  计算天数后剩余的毫秒数
    const hours = Math.floor(leave1 / (3600 * 1000));
    // 分钟
    const leave2 = leave1 % (3600 * 1000); //  计算小时数后剩余的毫秒数
    const minutes = Math.floor(leave2 / (60 * 1000));
    // 秒数
    const leave3 = leave2 % (60 * 1000); //  计算分钟数后剩余的毫秒数
    const seconds = Math.round(leave3 / 1000);
    const resultDays = days ? (days + timeUnit.day) : '';
    const resultHours = hours ? (hours + timeUnit.hour) : '';
    const resultMinutes = minutes ? (minutes + timeUnit.minute) : '';
    const resultSeconds = seconds ? (seconds + timeUnit.second) : '';
    return resultDays + resultHours + resultMinutes + resultSeconds;
  };


  getUploadInfo = () => {
    const { MemberRoleStore } = this.props;
    const { fileLoading } = this.state;
    const uploadInfo = MemberRoleStore.getUploadInfo || {};
    const uploading = MemberRoleStore.getUploading;
    const container = [];

    if (uploading) { // 如果正在导入
      container.push(this.renderLoading());
      this.handleUploadInfo();
      if (fileLoading) {
        this.setState({
          fileLoading: false,
        });
      }
    } else if (fileLoading) { // 如果还在上传
      container.push(this.renderLoading());
    } else if (!uploadInfo.noData) {
      const failedStatus = uploadInfo.finished ? 'detail' : 'error';
      container.push(
        <p key={'upload.lasttime'}>
          <FormattedMessage id={'upload.lasttime'} />
          {uploadInfo.beginTime}
          （<FormattedMessage id={'upload.spendtime'} />
          {this.getSpentTime(uploadInfo.beginTime, uploadInfo.endTime)}）
        </p>,
        <p key={'upload.time'}>
          <FormattedMessage
            id={'upload.time'}
            values={{
              successCount: <span className="success-count">{uploadInfo.successfulCount || 0}</span>,
              failedCount: <span className="failed-count">{uploadInfo.failedCount || 0}</span>,
            }}
          />
          {uploadInfo.url && (
            <span className={`download-failed-${failedStatus}`}>
              <a href={uploadInfo.url}>
                <FormattedMessage id={`download.failed.${failedStatus}`} />
              </a>
            </span>
          )}
        </p>,
      );
    } else {
      container.push(<p key={'upload.norecord'}><FormattedMessage id={'upload.norecord'} /></p>);
    }
    return (
      <div className="c7n-user-upload-container">
        {container}
      </div>
    );
  };

  /**
   *  application/vnd.ms-excel 2003-2007
   *  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 2010
   */
  getUploadProps = () => {
    const { intl, MemberRoleStore } = this.props;
    return {
      multiple: false,
      name: 'file',
      accept: 'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      action: `${process.env.API_HOST}${MemberRoleStore.urlRoleMember}/batch_import`,
      headers: {
        Authorization: `bearer ${Choerodon.getCookie('access_token')}`,
      },
      showUploadList: false,
      onChange: ({ file }) => {
        const { status, response } = file;
        const { fileLoading } = this.state;
        if (status === 'done') {
          this.handleUploadInfo(true);
        } else if (status === 'error') {
          Choerodon.prompt(`${response.message}`);
          this.setState({
            fileLoading: false,
          });
        }
        if (response && response.failed === true) {
          Choerodon.prompt(`${response.message}`);
          this.setState({
            fileLoading: false,
          });
        }
        if (!fileLoading) {
          this.setState({
            fileLoading: status === 'uploading',
          });
        }
      },
    };
  }

  isModify = () => {
    const { roleIds, currentMemberData } = this.state;
    const roles = currentMemberData.roles;
    if (roles.length !== roleIds.length) {
      return true;
    }
    for (let i = 0; i < roles.length; i += 1) {
      if (!roleIds.includes(roles[i].id)) {
        return true;
      }
    }
    return false;
  };

  handleDownLoad = () => {
    const { MemberRoleStore } = this.props;
    MemberRoleStore.downloadTemplate().then((result) => {
      const blob = new Blob([result], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const linkElement = document.getElementById('c7n-user-download-template');
      linkElement.setAttribute('href', url);
      linkElement.click();
    });
  };

  // ok 按钮保存
  handleOk = (e) => {
    const { selectType, roleIds } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const memberNames = values.member;
        const body = roleIds.filter(roleId => roleId).map((roleId, index) => ({
          memberType: 'user',
          roleId,
          sourceId: sessionStorage.selectData.id || 0,
          sourceType: sessionStorage.type,
        }));
        this.setState({ submitting: true });
        if (selectType === 'create') {
          this.roles.searchMemberIds(memberNames).then((data) => {
            if (data) {
              const memberIds = data.map(info => info.id);
              this.roles.fetchRoleMember(memberIds, body)
                .then(({ failed, message }) => {
                  this.setState({ submitting: false });
                  if (failed) {
                    Choerodon.prompt(message);
                  } else {
                    Choerodon.prompt(this.formatMessage('add.success'));
                    this.closeSidebar();
                    this.roles.fetch();
                  }
                })
                .catch((error) => {
                  this.setState({ submitting: false });
                  Choerodon.handleResponseError(error);
                });
            }
          });
        } else if (selectType === 'edit') {
          if (!this.isModify()) {
            this.setState({ submitting: false });
            Choerodon.prompt(this.formatMessage('modify.success'));
            this.closeSidebar();
            return;
          }
          const { currentMemberData } = this.state;
          const memberIds = [currentMemberData.id];
          this.roles.fetchRoleMember(memberIds, body, true)
            .then(({ failed, message }) => {
              this.setState({ submitting: false });
              if (failed) {
                Choerodon.prompt(message);
              } else {
                Choerodon.prompt(this.formatMessage('modify.success'));
                this.closeSidebar();
                this.roles.fetch();
              }
            })
            .catch((error) => {
              this.setState({ submitting: false });
              Choerodon.handleResponseError(error);
            });
        }
      }
    });
  };

  createRole = () => {
    this.setState({
      selectType: 'create',
    }, () => {
      this.openSidebar();
    });
  };

  editRole = (memberData) => {
    this.setState({
      selectType: 'edit',
      currentMemberData: memberData,
    }, () => {
      this.openSidebar();
    });
  };

  handleDelete = (record) => {
    Modal.confirm({
      title: this.formatMessage('memberrole.remove.title'),
      content: this.formatMessage('memberrole.remove.all.content', { name: record.loginName }),
      onOk: () => this.deleteRolesByIds({
        [record.id]: record.roles.map(({ id }) => id),
      }),
    });
  };
  handleEditRole = ({ id: memberId, loginName }) => {
    const member = this.state.memberDatas.find(({ id }) => id === memberId);
    if (!member) {
      this.roles.loadMemberDatas({
        current: 1,
        pageSize,
      }, {
        loginName: [loginName],
      }).then(({ content }) => {
        this.editRole(content.find(memberData => memberData.loginName === loginName));
      });
    } else {
      this.editRole(member);
    }
  };

  showMemberTable(show) {
    this.reload();
    this.setState({
      showMember: show,
    });
  }

  memberRoleTableChange = (memberRolePageInfo, memberRoleFilters, sort, params) => {
    this.setState({
      memberRolePageInfo,
      memberRoleFilters,
      params,
      loading: true,
    });
    this.roles.loadMemberDatas(memberRolePageInfo, memberRoleFilters, params).then(({ content, totalElements, number, size }) => {
      this.setState({
        loading: false,
        memberDatas: content,
        memberRolePageInfo: {
          current: number + 1,
          total: totalElements,
          pageSize: size,
        },
        params,
        memberRoleFilters,
      });
    });
  };

  roleMemberTableChange = (pageInfo, { name, ...roleMemberFilters }, sort, params) => {
    const newState = {
      roleMemberFilterRole: name,
      roleMemberFilters,
      roleMemberParams: params,
    };
    newState.loading = true;
    const { expandedKeys } = this.state;
    this.roles.loadRoleMemberDatas({ name, ...roleMemberFilters })
      .then((roleData) => {
        const roleMemberDatas = roleData.filter((role) => {
          role.users = role.users || [];
          if (role.userCount > 0) {
            if (expandedKeys.find(expandedKey => expandedKey.split('-')[1] === String(role.id))) {
              this.roles.loadRoleMemberData(role, {
                current: 1,
                pageSize,
              }, roleMemberFilters, params);
            }
            return true;
          }
          return false;
        });
        this.setState({
          loading: false,
          expandedKeys,
          roleMemberDatas,
        });
      });
    this.setState(newState);
  };

  renderMemberTable() {
    const { selectMemberRoles, roleMemberDatas, memberRolePageInfo, memberDatas, memberRoleFilters, loading } = this.state;
    const filtersRoleObj = {};
    let filtersRole = roleMemberDatas.map(({ name }) => ({
      value: name,
      text: name,
    }));

    filtersRole = filtersRole.reduce((item, next) => {
      filtersRoleObj[next.value] ? '' : filtersRoleObj[next.value] = true && item.push(next);
      return item;
    }, []);

    const { organizationId, projectId, createService, deleteService, type } = this.getPermission();
    const columns = [
      {
        title: <FormattedMessage id="memberrole.member" />,
        dataIndex: 'loginName',
        key: 'loginName',
        filters: [],
        filteredValue: memberRoleFilters.loginName || [],
        render: (text, { enabled }) => {
          if (enabled === false) {
            return (
              <Tooltip title={<FormattedMessage id="memberrole.member.disabled.tip" />}>
                <span className="text-disabled">
                  {text}
                </span>
              </Tooltip>
            );
          }
          return text;
        },
      },
      {
        title: <FormattedMessage id="memberrole.name" />,
        dataIndex: 'realName',
        key: 'realName',
        filters: [],
        filteredValue: memberRoleFilters.realName || [],
        render: (text, { enabled }) => {
          if (enabled === false) {
            return (
              <Tooltip title={<FormattedMessage id="memberrole.member.disabled.tip" />}>
                <span className="text-disabled">
                  {text}
                </span>
              </Tooltip>
            );
          }
          return text;
        },
      },
      {
        title: <FormattedMessage id="memberrole.member.type" />,
        dataIndex: 'organizationId',
        key: 'organizationId',
        render: (record, text) => <div><Icon type="person" style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /><span>用户</span></div>,
      },
      {
        title: <FormattedMessage id="memberrole.role" />,
        dataIndex: 'roles',
        key: 'roles',
        filters: filtersRole,
        filteredValue: memberRoleFilters.roles || [],
        className: 'memberrole-roles',
        render: text => text.map(({ id, name, enabled }) => {
          const wrapclass = ['role-table'];
          let item = <span className={'role-table-list'}>{name}</span>;
          if (enabled === false) {
            wrapclass.push('text-disabled');
            item = (
              <Tooltip title={<FormattedMessage id="memberrole.role.disabled.tip" />}>
                {item}
              </Tooltip>
            );
          }
          return (
            <div key={id} className={wrapclass.join(' ')}>
              {item}
            </div>
          );
        }),
      },
      {
        title: '',
        width: 100,
        align: 'right',
        render: (text, record) => (
          <div>
            <Permission
              service={createService}
            >
              <Tooltip
                title={<FormattedMessage id="modify" />}
                placement="bottom"
              >
                <Button
                  onClick={() => {
                    this.editRole(record);
                  }}
                  size="small"
                  shape="circle"
                  icon="mode_edit"
                />
              </Tooltip>
            </Permission>
            <Permission
              service={deleteService}
              type={type}
              organizationId={organizationId}
              projectId={projectId}
            >
              <Tooltip
                title={<FormattedMessage id="remove" />}
                placement="bottom"
              >
                <Button size="small" shape="circle" onClick={this.handleDelete.bind(this, record)} icon="delete" />
              </Tooltip>
            </Permission>
          </div>
        ),
      },
    ];
    const rowSelection = {
      selectedRowKeys: Object.keys(selectMemberRoles).map(key => Number(key)),
      onChange: (selectedRowkeys, selectedRecords) => {
        this.setState({
          selectMemberRoles: selectedRowkeys.reduce((data, key, index) => {
            data[key] = selectedRecords[index].roles.map(({ id }) => id);
            return data;
          }, {}),
        });
      },
    };
    return (
      <Table
        key="member-role"
        className="member-role-table"
        loading={loading}
        rowSelection={rowSelection}
        pagination={memberRolePageInfo}
        columns={columns}
        filters={this.state.params}
        onChange={this.memberRoleTableChange}
        dataSource={memberDatas}
        filterBarPlaceholder={this.formatMessage('filtertable')}
        rowKey={({ id }) => id}
      />
    );
  }

  renderRoleTable() {
    const { roleMemberDatas, roleMemberFilterRole, selectRoleMemberKeys, expandedKeys, roleMemberParams, roleMemberFilters, loading } = this.state;
    const { organizationId, projectId, createService, deleteService, type } = this.getPermission();
    let filtersData = roleMemberDatas.map(({ name }) => ({
      value: name,
      text: name,
    }));
    const filtersDataObj = {};
    filtersData = filtersData.reduce((item, next) => {
      filtersDataObj[next.value] ? '' : filtersDataObj[next.value] = true && item.push(next);
      return item;
    }, []);
    let dataSource = roleMemberDatas;
    if (roleMemberFilterRole && roleMemberFilterRole.length) {
      dataSource = roleMemberDatas.filter(({ name }) => roleMemberFilterRole.some(role => name.indexOf(role) !== -1));
    }
    const columns = [
      {
        title: <FormattedMessage id="memberrole.member" />,
        key: 'loginName',
        hidden: true,
        filters: [],
        filteredValue: roleMemberFilters.loginName || [],
      },
      {
        title: <FormattedMessage id="memberrole.rolemember" />,
        filterTitle: <FormattedMessage id="memberrole.role" />,
        key: 'name',
        dataIndex: 'name',
        filters: filtersData,
        filteredValue: roleMemberFilterRole || [],
        render: (text, data) => {
          const { loginName, name } = data;
          if (loginName) {
            return loginName;
          } else if (name) {
            const { userCount, users: { length }, loading: isLoading, enabled } = data;
            const more = isLoading ? (
              <Progress type="loading" width={12} />
            ) : (length > 0 && userCount > length && (
              <a onClick={() => {
                this.roles.loadRoleMemberData(data, {
                  current: (length / pageSize) + 1,
                  pageSize,
                }, roleMemberFilters);
                this.forceUpdate();
              }}
              >更多</a>
            ));
            const item = <span className={classnames({ 'text-disabled': !enabled })}>{name} ({userCount}) {more}</span>;
            if (enabled === false) {
              return (
                <Tooltip title={<FormattedMessage id="memberrole.role.disabled.tip" />}>
                  {item}
                </Tooltip>
              );
            } else {
              return item;
            }
          }
        },
      },
      {
        title: <FormattedMessage id="memberrole.name" />,
        key: 'realName',
        dataIndex: 'realName',
        filteredValue: roleMemberFilters.realName || [],
        filters: [],
      },
      {
        title: '',
        width: 100,
        align: 'right',
        render: (text, record) => {
          if ('roleId' in record) {
            return (
              <div>
                <Permission
                  service={createService}
                >
                  <Tooltip title={<FormattedMessage id="modify" />}>
                    <Button
                      onClick={() => {
                        this.handleEditRole(record);
                      }}
                      size="small"
                      shape="circle"
                      icon="mode_edit"
                    />
                  </Tooltip>
                </Permission>
                <Permission
                  service={deleteService}
                >
                  <Tooltip title={<FormattedMessage id="remove" />}>
                    <Button size="small" onClick={this.deleteRoleByRole.bind(this, record)} shape="circle" icon="delete" />
                  </Tooltip>
                </Permission>
              </div>
            );
          }
        },
      },
    ];
    const rowSelection = {
      type: 'checkbox',
      selectedRowKeys: selectRoleMemberKeys,
      getCheckboxProps: ({ loginName }) => ({
        disabled: !loginName,
      }),
      onChange: (newSelectRoleMemberKeys, newSelectRoleMembers) => {
        this.setState({
          selectRoleMemberKeys: newSelectRoleMemberKeys,
          selectRoleMembers: newSelectRoleMembers,
        });
      },
    };
    return (
      <Table
        key="role-member"
        loading={loading}
        rowSelection={rowSelection}
        expandedRowKeys={expandedKeys}
        className="role-member-table"
        pagination={false}
        columns={columns}
        filters={roleMemberParams}
        indentSize={0}
        dataSource={dataSource}
        rowKey={({ roleId = '', id }) => [roleId, id].join('-')}
        childrenColumnName="users"
        onChange={this.roleMemberTableChange}
        onExpand={this.handleExpand}
        onExpandedRowsChange={this.handleExpandedRowsChange}
        filterBarPlaceholder={this.formatMessage('filtertable')}
      />
    );
  }

  handleExpandedRowsChange = (expandedKeys) => {
    this.setState({
      expandedKeys,
    });
  };

  handleExpand = (expand, data) => {
    const { users = [], id } = data;
    if (expand && !users.length) {
      this.roles.loadRoleMemberData(data, {
        current: 1,
        pageSize,
      }, this.state.roleMemberFilters, this.state.roleMemberParams);
    }
  };


  /**
   * 上传按钮点击时触发
   */
  handleUpload = () => {
    this.handleUploadInfo(true);
    this.setState({
      sidebar: true,
      selectType: 'upload',
    });
  };

  /**
   * immediately为false时设置2秒查询一次接口，若有更新删除定时器并更新列表
   * @param immediately
   */
  handleUploadInfo = (immediately) => {
    const { MemberRoleStore } = this.props;
    const { fileLoading } = this.state;
    const uploadInfo = MemberRoleStore.getUploadInfo || {};
    if (uploadInfo.finished !== null && fileLoading) {
      this.setState({
        fileLoading: false,
      });
    }
    if (immediately) {
      MemberRoleStore.handleUploadInfo();
      return;
    }
    if (uploadInfo.finished !== null) {
      clearInterval(this.timer);
      return;
    }
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      MemberRoleStore.handleUploadInfo();
      this.init();
    }, 2000);
  };

  upload = (e) => {
    e.stopPropagation();
    const { MemberRoleStore } = this.props;
    const uploading = MemberRoleStore.getUploading;
    const { fileLoading } = this.state;
    if (uploading || fileLoading) {
      return;
    }
    const uploadElement = document.getElementsByClassName('c7n-user-upload-hidden')[0];
    uploadElement.click();
  };

  renderLoading() {
    const { intl: { formatMessage } } = this.props;
    const { fileLoading } = this.state;
    return (
      <div className="c7n-user-uploading-container" key="c7n-user-uploading-container">
        <div className="loading">
          <Spin size="large" />
        </div>
        <p className="text">{formatMessage({
          id: `${intlPrefix}.${fileLoading ? 'fileloading' : 'uploading'}.text` })}
        </p>
        {!fileLoading && (<p className="tip">{formatMessage({ id: `${intlPrefix}.uploading.tip` })}</p>)}
      </div>
    );
  }

  getMemberRoleClass(name) {
    const { showMember } = this.state;
    if (name === 'member') {
      return classnames({
        active: showMember,
      });
    } else if (name === 'role') {
      return classnames({
        active: !showMember,
      });
    }
  }

  getPermission() {
    const { AppState } = this.props;
    const { type } = AppState.currentMenuType;
    let createService = ['iam-service.role-member.createOrUpdateOnSiteLevel'];
    let deleteService = ['iam-service.role-member.deleteOnSiteLevel'];
    let importService = ['iam-service.role-member.import2MemberRoleOnSite'];
    if (type === 'organization') {
      createService = ['iam-service.role-member.createOrUpdateOnOrganizationLevel'];
      deleteService = ['iam-service.role-member.deleteOnOrganizationLevel'];
      importService = ['iam-service.role-member.import2MemberRoleOnOrganization'];
    } else if (type === 'project') {
      createService = ['iam-service.role-member.createOrUpdateOnProjectLevel'];
      deleteService = ['iam-service.role-member.deleteOnProjectLevel'];
      importService = ['iam-service.role-member.import2MemberRoleOnProject'];
    }
    return {
      createService,
      deleteService,
      importService,
    };
  }

  render() {
    const { MemberRoleStore } = this.props;
    const { sidebar, selectType, roleData, showMember, selectMemberRoles, selectRoleMemberKeys, submitting, fileLoading } = this.state;
    const uploading = MemberRoleStore.getUploading;
    const okText = selectType === 'create' ? this.formatMessage('add') : this.formatMessage('save');
    const { createService, deleteService, importService } = this.getPermission();
    return (
      <Page
        service={[
          'iam-service.role-member.createOrUpdateOnSiteLevel',
          'iam-service.role-member.deleteOnSiteLevel',
          'iam-service.role-member.createOrUpdateOnOrganizationLevel',
          'iam-service.role-member.deleteOnOrganizationLevel',
          'iam-service.role-member.createOrUpdateOnProjectLevel',
          'iam-service.role-member.deleteOnProjectLevel',
          'iam-service.role-member.createOrUpdateOnOrganizationLevel1',
          'iam-service.role-member.deleteOnOrganizationLevel1',
          'iam-service.role-member.pagingQueryUsersByRoleIdOnOrganizationLevel',
          'iam-service.role-member.listRolesWithUserCountOnOrganizationLevel',
          'iam-service.role-member.pagingQueryUsersWithOrganizationLevelRoles',
          'iam-service.role-member.pagingQueryUsersByRoleIdOnProjectLevel',
          'iam-service.role-member.listRolesWithUserCountOnProjectLevel',
          'iam-service.role-member.pagingQueryUsersWithProjectLevelRoles',
          'iam-service.role-member.createOrUpdateOnSiteLevel1',
          'iam-service.role-member.deleteOnSiteLevel1',
          'iam-service.role-member.pagingQueryUsersByRoleIdOnSiteLevel',
          'iam-service.role-member.listRolesWithUserCountOnSiteLevel',
          'iam-service.role-member.pagingQueryUsersWithSiteLevelRoles',
        ]}
      >
        <Header title={<FormattedMessage id={`${this.roles.code}.header.title`} />}>
          <Permission
            service={createService}
          >
            <Button
              onClick={this.createRole}
              icon="playlist_add"
            >
              <FormattedMessage id="add" />
            </Button>
          </Permission>
          <Permission
            service={importService}
          >
            <Button
              onClick={this.handleDownLoad}
              icon="get_app"
            >
              <FormattedMessage id={'download.template'} />
              <a id="c7n-user-download-template" href="" onClick={(event) => { event.stopPropagation(); }} download="userTemplate.xlsx" />
            </Button>
            <Button
              icon="file_upload"
              onClick={this.handleUpload}
            >
              <FormattedMessage id={'upload.file'} />
            </Button>
          </Permission>
          <Permission
            service={deleteService}
          >
            <Button
              onClick={this.deleteRoleByMultiple}
              icon="delete"
              disabled={!(showMember ? Object.keys(selectMemberRoles) : selectRoleMemberKeys).length}
            >
              <FormattedMessage id="remove" />
            </Button>
          </Permission>
          <Button
            onClick={this.reload}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={this.roles.code}
          values={this.roles.values}
        >
          <div className="member-role-btns">
            <span className="text">
              <FormattedMessage id="memberrole.view" />：
            </span>
            <Button
              className={this.getMemberRoleClass('member')}
              onClick={() => {
                this.showMemberTable(true);
              }}
              type="primary"
            ><FormattedMessage id="memberrole.member" /></Button>
            <Button
              className={this.getMemberRoleClass('role')}
              onClick={() => {
                this.showMemberTable(false);
              }}
              type="primary"
            ><FormattedMessage id="memberrole.role" /></Button>
          </div>
          {showMember ? this.renderMemberTable() : this.renderRoleTable()}
          <Sidebar
            title={this.getSidebarTitle()}
            visible={sidebar}
            okText={selectType === 'upload' ? this.getUploadOkText() : okText}
            confirmLoading={uploading && fileLoading && submitting}
            cancelText={<FormattedMessage id={selectType === 'upload' ? 'close' : 'cancel'} />}
            onOk={selectType === 'upload' ? this.upload : this.handleOk}
            onCancel={this.closeSidebar}
          >
            {roleData.length && this.state.selectType !== 'upload' ? this.getSidebarContent() : null}
            {this.state.selectType === 'upload' ? this.renderUpload() : null}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
