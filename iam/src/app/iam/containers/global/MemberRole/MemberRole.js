/*eslint-disable*/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, Input, Modal, Popconfirm, Progress, Select, Table, Tooltip } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import Page, { Content, Header } from 'Page';
import Permission from 'PerComponent';
import axios from 'Axios';
import classnames from 'classnames';
import querystring from 'query-string';
import _ from 'lodash';
import './MemberRole.scss';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const pageSize = 10;
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

//公用方法类
class memberRoleType {
  constructor(context, data) {
    this.context = context;
    this.data = data;
    this.urlDeleteMember = `/iam/v1/role_members/${data.type}_level/delete`;
    switch (sessionStorage.type) {
      case 'organization':
        this.title = '组织';
        this.urlRoleMember = `/iam/v1/role_members/${data.type}_level?source_id=${data.id}&`;
        this.roleId = data.id;
        break;
      case 'project':
        this.title = '项目';
        this.urlRoleMember = `/iam/v1/role_members/${data.type}_level?source_id=${data.id}&`;
        this.roleId = data.id;
        break;
      case 'site':
        this.title = '平台';
        this.urlRoleMember = `/iam/v1/role_members/${data.type}_level?`;
        this.roleId = 0;
        break;
    }
  }

  //上面头部title
  drawPage() {
    return `${this.title}“${this.data.name || 'Choerodon'}”的角色分配`;
  };

  drawPageLink () {
    const { type } = this.data;
    let link = '';
    switch (type) {
      case 'organization':
        link = 'http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/tenant/role-assignment/';
        break;
      case 'project':
        link = 'http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/project/role-assignment/';
        break;
      case 'site':
        link = 'http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/platform/role-assignment/';
        break;
    }
    return link;
  }
  //fetch分配角色（post）
  // body  array
  // {
  //   "memberId": 0, 成员id
  //   "roleId": 0, 角色id
  //   "sourceId": 0, 层级id 平台为0
  // }
  fetchRoleMember(memberIds, body, isEdit) {
    let str = memberIds.map((value) => {
      return `member_ids=${value}`;
    }).join('&');
    if (isEdit === true) {
      str += `&is_edit=true`;
    }
    return axios.post(`${this.urlRoleMember}${str}`, JSON.stringify(body));
  }

  //delete分配角色（delete)
  deleteRoleMember(body) {
    const { id } = this.data;
    body['sourceId'] = id || 0;
    return axios.post(`${this.urlDeleteMember}`, JSON.stringify(body));
  }

  //根据用户名查询memberId
  searchMemberId(loginName) {
    if (loginName) {
      return axios.get(`/iam/v1/users?login_name=${loginName}`);
    }
  }

  searchMemberIds(loginNames) {
    const promises = loginNames.map((index, value) => {
      return this.searchMemberId(index);
    });
    return axios.all(promises);
  }

  loadRoleMemberData(roleData, { current }, { loginName, realName }) {
    const { type, id = 0 } = this.data;
    const { id: roleId, users, name } = roleData;
    roleData.loading = true;
    return axios.post(`/iam/v1/roles/${roleId}/${type}_level/users`, JSON.stringify(Object.assign({
      loginName: loginName && loginName[0],
      realName: realName && realName[0],
    }, {
      page: current - 1,
      size: pageSize,
      source_id: id,
    })))
      .then(({ content }) => {
        roleData.users = users.concat(content.map(member => {
          member.roleId = roleId;
          member.roleName = name;
          return member;
        }));
        delete roleData.loading;
        this.context.forceUpdate();
      });
  }

  loadMemberDatas({ pageSize: size, current }, { loginName, realName, roles }) {
    const { type, id = 0 } = this.data;
    const body = {
      loginName: loginName && loginName[0],
      roleName: roles && roles[0],
      realName: realName && realName[0],
    };
    const queryObj = Object.assign(
      { size, page: current - 1 },
      { sort: 'id' },
    );
    let url = `/iam/v1/users/${type}_level/roles`;
    switch (type) {
      case 'organization':
      case 'project':
        queryObj.source_id = id;
        break;
    }
    return axios.post(`/iam/v1/users/${type}_level/roles?${querystring.stringify(queryObj)}`, JSON.stringify(body));
  }

  loadRoleMemberDatas({ loginName, realName, name }) {
    const { type, id = 0 } = this.data;
    const body = {
      roleName: name && name[0],
      loginName: loginName && loginName[0],
      realName: realName && realName[0],
    };
    let url = `/iam/v1/roles/${this.data.type}_level/user_count`;
    switch (type) {
      case 'organization':
      case 'project':
        url += `?source_id=${id}`;
        break;
    }
    return axios.post(url, JSON.stringify(body));
  }

  //多路请求
  fetch() {
    const { memberRolePageInfo, memberRoleFilters, roleMemberFilters, expandedKeys } = this.context.state;
    this.context.setState({
      loading: true,
    });
    return axios.all([
      this.loadMemberDatas(memberRolePageInfo, memberRoleFilters),
      this.loadRoleMemberDatas(roleMemberFilters),
    ]).then(([{ content, totalElements, number }, roleData]) => {
      this.context.setState({
        memberDatas: content,
        expandedKeys,
        roleMemberDatas: roleData.filter(role => {
          role.users = role.users || [];
          if (role.userCount > 0) {
            if (expandedKeys.find(expandedKey => expandedKey.split('-')[1] === String(role.id))) {
              this.context.roles.loadRoleMemberData(role, {
                current: 1,
                pageSize,
              }, roleMemberFilters);
            }
            return true;
          }
          return false;
        }),
        roleData,
        loading: false,
        memberRolePageInfo: {
          total: totalElements,
          current: number + 1,
          pageSize,
        },
      });
    });
  }
}

@inject('AppState')
@observer
class MemberRole extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = this.getInitState();
  }

  getInitState() {
    return {
      memberDatas: [], //成员下的角色集合
      sidebar: false,
      roleData: [], // 当前情况下的所有角色
      selectType: 'create',
      currentMemberData: [],//当前成员的角色分配信息
      loading: true,
      showMember: true,
      selectMemberRoles: {},
      selectRoleMembers: [],
      selectRoleMemberKeys: [],
      expandedKeys: [],
      validedMembers: {},
      roleMemberDatas: [],
      roleMemberFilters: {},
      memberRoleFilters: {},
      memberRolePageInfo: {
        current: 1,
        total: 0,
        pageSize,
      },
      roleMemberFilterRole: [],
      roleIds: [],
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

  reload = () => {
    this.setState(this.getInitState(), () => {
      this.init();
    });
  };

  //创建编辑角色 状态
  getOption = (current) => {
    const { roleData = [], roleIds } = this.state;
    return roleData.reduce((options, { id, name, enabled }) => {
      if (roleIds.indexOf(id) === -1 || id === current) {
        if (enabled === false) {
          options.push(<Option style={{ display: 'none' }} disabled value={id} key={id}>{name}</Option>);
        } else {
          options.push(<Option value={id} key={id}>{name}</Option>);
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
    this.setState({
      roleIds: this.initFormRoleIds(),
      sidebar: true,
    });
  };

  initFormRoleIds() {
    const { setFieldsValue, resetFields } = this.props.form;
    const { selectType, currentMemberData } = this.state;
    let roleIds = [undefined];
    const member = [];
    const memberId = [];
    if (selectType === 'edit') {
      memberId.push(currentMemberData.id);
      member.push(currentMemberData.loginName);
      roleIds = currentMemberData.roles.map(({ id }) => id);
    }
    resetFields();
    setFieldsValue({
      member,
      memberId,
    });
    return roleIds;
  }

  getProjectNameDom() {
    const { getFieldDecorator } = this.props.form;
    const { selectType } = this.state;

    return (
      <FormItem
        {...FormItemNumLayout}
        label={'添加角色'}
        style={{
          display: selectType === 'edit' ? 'none' : 'block',
          marginTop: '-15px',
        }}
      >
        {getFieldDecorator('member', {
          rules: [{
            required: true,
            validator: this.validateMember,
          }],
          validateTrigger: 'onChange',
        })(
          <Select
            mode="tags"
            ref={this.saveSelectRef}
            style={{ width: 512 }}
            label="成员"
            placeholder="输入一个或多个成员名称"
            filterOption={false}
            onInputKeyDown={this.handleInputKeyDown}
            notFoundContent={false}
            showNotFindSelectedItem={false}
            showNotFindInputItem={false}
            choiceRender={this.handeChoiceRender}
            allowClear
          />,
        )}
      </FormItem>);
  }

  getRoleFormItems = () => {
    const { selectType, roleIds } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formItems = roleIds.map((id, index) => {
      const key = `role_${id === undefined ? index : id}`;
      return (<FormItem
        {...FormItemNumLayout}
        label={'添加角色'}
        key={key}
      >
        {getFieldDecorator(key, {
          rules: [
            {
              required: true,
              message: Choerodon.getMessage('必须至少选择一个角色', 'Please choose one role at least'),
            },
          ],
          initialValue: id,
        })(
          <Select
            style={{ width: 300 }}
            label="请选择一个角色"
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={(value) => roleIds[index] = value}
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
    if (showMember) {
      this.deleteRolesByIds(selectMemberRoles);
    } else {
      const data = {};
      selectRoleMembers.forEach(({ id, roleId }) => {
        if (!data[roleId]) {
          data[roleId] = [];
        }
        data[roleId].push(id);
      });
      this.deleteRolesByIds(data);
    }
  };

  deleteRoleByRole = (roleId, memberId) => {
    this.deleteRolesByIds({ [roleId]: [memberId] });
  };

  deleteRoleByMember = (memberData) => {
    this.deleteRolesByIds({
      [memberData.id]: memberData.roles.map(({ id }) => id),
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
        Choerodon.prompt('移除成功');
        this.roles.fetch();
      }
    });
  };

  setMembersInSelect(member) {
    const { getFieldValue, setFieldsValue, validateFields } = this.props.form;
    const members = getFieldValue('member') || [];
    if (members.indexOf(member) === -1) {
      members.push(member);
      setFieldsValue({
        'member': members,
      });
      validateFields(['member']);
    }
    if (this.rcSelect) {
      this.rcSelect.setState({
        inputValue: '',
      });
    }
  }

  handleInputKeyDown = (e) => {
    const { value } = e.target;
    if (e.keyCode === 13 && !e.isDefaultPrevented() && value) {
      this.setMembersInSelect(value);
    }
  };

  saveSelectRef = (node) => {
    if (node) {
      this.rcSelect = node.rcSelect;
    }
  };

  initMemberRole() {
    this.roles = new memberRoleType(this, JSON.parse(sessionStorage.selectData));
  }

  getSidebarTitle() {
    const { selectType } = this.state;
    if (selectType === 'create') {
      return '添加成员角色';
    } else if (selectType === 'edit') {
      return '修改成员角色';
    }
  }

  getHeader() {
    const { selectType, currentMemberData } = this.state;
    let contentTitle = `在${this.roles.title}“${this.roles.data.name || 'Choerodon'}”中添加成员角色`;
    let contentDescription = '请在下面输入一个或多个成员，然后为这些成员选择角色，以便授予他们访问权限。您可以分配多个角色。';
    let contentLink = 'http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/platform/role-assignment/';
    if (selectType === 'edit') {
      contentTitle = `对成员${currentMemberData.loginName}的角色进行修改`;
      contentDescription = '您可以在此为成员删除、添加角色。';
      contentLink = 'http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/platform/role-assignment/';
    }
    return {
      title: contentTitle,
      link: contentLink,
      description: contentDescription,
    };
  }

  getAddOtherBtn(disabled) {
    return (
      <Button type="primary" disabled={disabled} className="add-other-role" icon="add" onClick={this.addRoleList}>
        添加其他角色
      </Button>
    );
  }

  getSidebarContent() {
    const { roleData = [], roleIds } = this.state;
    const header = this.getHeader();
    const disabled = roleIds.findIndex((id, index) => id === undefined) !== -1
      || !roleData.filter(({ enabled, id }) => enabled && roleIds.indexOf(id) === -1).length;
    return (
      <Content
        style={{ padding: 0 }}
        title={header.title}
        link={header.link}
        description={header.description}
      >
        <Form layout="vertical">
          {this.getProjectNameDom()}
          {this.getRoleFormItems()}
        </Form>
        {this.getAddOtherBtn(disabled)}
      </Content>);
  }

  // ok 按钮保存
  handleOk = (e) => {
    const { selectType, roleIds } = this.state;
    const { validateFields, getFieldValue } = this.props.form;
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const memberNames = values.member;
        const body = roleIds.map((key, index) => {
          return {
            memberType: 'user',
            roleId: getFieldValue(`role_${key || index}`),
            sourceId: sessionStorage.selectData.id || 0,
            sourceType: sessionStorage.type,
          };
        });
        if (selectType === 'create') {
          this.roles.searchMemberIds(memberNames).then((data) => {
            if (data) {
              const memberIds = data.map((info) => {
                return info.id;
              });
              this.roles.fetchRoleMember(memberIds, body).then(({ failed, message }) => {
                if (failed) {
                  Choerodon.prompt(message);
                } else {
                  Choerodon.prompt('添加成功');
                  this.closeSidebar();
                  this.roles.fetch();
                }
              });
            }
          });
        } else if (selectType === 'edit') {
          const { currentMemberData } = this.state;
          const memberIds = [currentMemberData.id];
          this.roles.fetchRoleMember(memberIds, body, true).then(({ failed, message }) => {
            if (failed) {
              Choerodon.prompt(message);
            } else {
              Choerodon.prompt('修改成功');
              this.closeSidebar();
              this.roles.fetch();
            }
          });
        }
      }
    });
  };

  validateMember = (rule, value, callback) => {
    if (value && value.length) {
      const { validedMembers } = this.state;
      let errorMsg;
      Promise.all(value.map((item) => {
        if (item in validedMembers) {
          return Promise.resolve(validedMembers[item]);
        } else {
          return new Promise((resolve) => {
            this.roles.searchMemberId(item)
              .then(({ failed, enabled }) => {
                let success = true;
                if (enabled === false) {
                  errorMsg = '用户已被停用，无法给此用户分配角色，请先启用此用户';
                  success = false;
                } else if (failed) {
                  errorMsg = '不存在此用户，请输入正确的登录名';
                  success = false;
                }
                resolve(success);
              })
              .catch((error) => {
                errorMsg = error;
                resolve(false);
              });
          }).then((valid) => {
            validedMembers[item] = valid;
            return valid;
          });
        }
      })).then(all => callback(
        all.every(item => item) ? undefined :
          errorMsg,
      ));
    } else {
      callback(Choerodon.getMessage('必须至少输入一个成员', 'Please input one member at least'));
    }
  };

  handeChoiceRender = (liNode, value) => {
    const { validedMembers } = this.state;
    return React.cloneElement(liNode, {
      className: classnames(liNode.props.className, {
        'choice-has-error': value in validedMembers && !validedMembers[value],
      }),
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

  handleEditRole = ({ id: memberId, loginName }) => {
    const member = this.state.memberDatas.find(({ id }) => id === memberId);
    if (!member) {
      this.roles.loadMemberDatas({
        current: 1,
        pageSize,
      }, {
        loginName,
      }).then(({ content }) => {
        this.editRole(content.find((memberData) => memberData.loginName === loginName));
      });
    } else {
      this.editRole(member);
    }
  };

  showMemberTable(show) {
    this.setState({
      showMember: show,
    });
  }

  memberRoleTableChange = (memberRolePageInfo, memberRoleFilters) => {
    if (!_.isEqual(memberRoleFilters, this.state.memberRoleFilters)) {
      memberRolePageInfo.current = 1;
    }
    this.setState({
      memberRolePageInfo,
      memberRoleFilters,
      loading: true,
    });
    this.roles.loadMemberDatas(memberRolePageInfo, memberRoleFilters).then(({ content, totalElements, number, size }) => {
      this.setState({
        loading: false,
        memberDatas: content,
        memberRolePageInfo: {
          current: number + 1,
          total: totalElements,
          pageSize: size,
        },
        memberRoleFilters,
      });
    });
  };

  roleMemberTableChange = (pageInfo, { name, ...roleMemberFilters }) => {
    const newState = {
      roleMemberFilterRole: name,
      roleMemberFilters,
    };
    if (!_.isEqual(roleMemberFilters, this.state.roleMemberFilters)) {
      newState.loading = true;
      const { expandedKeys } = this.state;
      this.roles.loadRoleMemberDatas(roleMemberFilters)
        .then((roleData) => {
          this.setState({
            loading: false,
            expandedKeys,
            roleMemberDatas: roleData.filter(role => {
              role.users = role.users || [];
              if (role.userCount > 0) {
                if (expandedKeys.find(expandedKey => expandedKey.split('-')[1] === String(role.id))) {
                  this.roles.loadRoleMemberData(role, {
                    current: 1,
                    pageSize,
                  }, roleMemberFilters);
                }
                return true;
              }
              return false;
            }),
          });
        });
    }
    this.setState(newState);
  };

  renderMemberTable() {
    const { selectMemberRoles, memberRolePageInfo, roleData, memberDatas, memberRoleFilters, loading } = this.state;
    const filtersRole = roleData.map(({ name }) => ({
      value: name,
      text: name,
    }));
    const { organizationId, projectId, createService, deleteService, type } = this.getPermission();
    const columns = [
      {
        title: '成员',
        dataIndex: 'loginName',
        key: 'loginName',
        filters: [],
        filteredValue: memberRoleFilters.loginName || [],
        render: (text, { enabled }) => {
          if (enabled === false) {
            return (
              <Tooltip title="该成员已停用">
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
        title: '名称',
        dataIndex: 'realName',
        key: 'realName',
        filters: [],
        filteredValue: memberRoleFilters.realName || [],
        render: (text, { enabled }) => {
          if (enabled === false) {
            return (
              <Tooltip title="该成员已停用">
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
        title: '成员类型',
        dataIndex: 'organizationId',
        key: 'organizationId',
        render: (record, text) => {
          return <div><Icon type="person" style={{ verticalAlign: 'text-bottom', }} />用户</div>;
        },
      },
      {
        title: '角色',
        dataIndex: 'roles',
        key: 'roles',
        filters: filtersRole,
        filteredValue: memberRoleFilters.roles || [],
        render: (text) => {
          return text.map(({ id, name, enabled }) => {
            const wrapclass = ['role-table'];
            let item = <span className={'role-table-list'}>{name}</span>;
            if (enabled === false) {
              wrapclass.push('text-disabled');
              item = (
                <Tooltip title="该角色已停用">
                  {item}
                </Tooltip>
              );
            }
            return (
              <div key={id} className={wrapclass.join(' ')}>
                {item}
              </div>
            );
          });
        },
      },
      {
        title: '',
        width: 100,
        render: (text, record) => {
          return (
            <div>
              <Permission
                service={createService}
                type={type}
                organizationId={organizationId}
                projectId={projectId}
              >
                <Button onClick={() => {
                  this.editRole(record);
                }} shape="circle" icon="mode_edit" />
              </Permission>
              <Permission
                service={deleteService}
                type={type}
                organizationId={organizationId}
                projectId={projectId}
              >
                <Popconfirm
                  title={`确认删除成员“${record.loginName}”下的所有角色?`}
                  onConfirm={() => this.deleteRoleByMember(record)}
                >
                  <Button shape="circle" icon="delete" />
                </Popconfirm>
              </Permission>
            </div>
          );
        },
      },
    ];
    const rowSelection = {
      selectedRowkeys: Object.keys(selectMemberRoles),
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
        className="member-role-table"
        loading={loading}
        rowSelection={rowSelection}
        pagination={memberRolePageInfo}
        columns={columns}
        onChange={this.memberRoleTableChange}
        dataSource={memberDatas}
        filterBarPlaceholder="过滤表"
        rowKey={({ id }) => id}
      />
    );
  }

  renderRoleTable() {
    const { roleMemberDatas, roleMemberFilterRole, selectRoleMemberKeys, expandedKeys, roleMemberFilters, loading } = this.state;
    const { organizationId, projectId, createService, deleteService, type } = this.getPermission();
    const filtersData = roleMemberDatas.map(({ id, name }) => ({
      value: name,
      text: name,
    }));
    let dataSource = roleMemberDatas;
    if (roleMemberFilterRole && roleMemberFilterRole.length) {
      dataSource = roleMemberDatas.filter(({ name }) => roleMemberFilterRole.some(role => name.indexOf(role) !== -1));
    }
    const columns = [
      {
        title: '成员',
        key: 'loginName',
        hidden: true,
        filters: [],
        filteredValue: roleMemberFilters.loginName || [],
      },
      {
        title: '角色/成员',
        filterTitle: '角色',
        key: 'name',
        dataIndex: 'name',
        filters: filtersData,
        filteredValue: roleMemberFilterRole || [],
        render: (text, data) => {
          const { loginName, name } = data;
          if (loginName) {
            return loginName;
          } else if (name) {
            const { userCount, users: { length }, loading, enabled } = data;
            const more = loading ? (
              <Progress type="loading" width={12} />
            ) : (length > 0 && userCount > length && (
              <a onClick={() => {
                this.roles.loadRoleMemberData(data, {
                  current: length / pageSize + 1,
                  pageSize,
                }, roleMemberFilters);
                this.forceUpdate();
              }}>更多</a>
            ));
            const item = <span className={classnames({ 'text-disabled': !enabled })}>{name} ({userCount}) {more}</span>;
            if (enabled === false) {
              return (
                <Tooltip title="该角色已停用">
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
        title: '名称',
        key: 'realName',
        dataIndex: 'realName',
        filteredValue: roleMemberFilters.realName || [],
        filters: [],
      },
      {
        title: '',
        width: 100,
        render: (text, record) => {
          if ('roleId' in record) {
            return (
              <div>
                <Permission
                  service={createService}
                  type={type}
                  organizationId={organizationId}
                  projectId={projectId}
                >
                  <Button onClick={() => {
                    this.handleEditRole(record);
                  }} size="small" shape="circle" icon="mode_edit" />
                </Permission>
                <Permission
                  service={deleteService}
                  type={type}
                  organizationId={organizationId}
                  projectId={projectId}
                >
                  <Popconfirm
                    title={`确认删除成员“${record.loginName}”的角色“${record.roleName}”?`}
                    onConfirm={() => this.deleteRoleByRole(record.roleId, record.id)}
                  >
                    <Button size="small" shape="circle" icon="delete" />
                  </Popconfirm>
                </Permission>
              </div>
            );
          }
        },
      },
    ];
    const rowSelection = {
      type: 'checkbox',
      selectedRowkeys: selectRoleMemberKeys,
      getCheckboxProps: ({ loginName }) => ({
        disabled: !loginName,
      }),
      onChange: (selectRoleMemberKeys, selectRoleMembers) => {
        this.setState({
          selectRoleMemberKeys,
          selectRoleMembers,
        });
      },
    };
    return (
      <Table
        loading={loading}
        rowSelection={rowSelection}
        expandedRowKeys={expandedKeys}
        className="role-member-table"
        pagination={false}
        columns={columns}
        indentSize={0}
        dataSource={dataSource}
        rowKey={({ roleId = '', id }) => [roleId, id].join('-')}
        childrenColumnName="users"
        onChange={this.roleMemberTableChange}
        onExpand={this.handleExpand}
        onExpandedRowsChange={this.handleExpandedRowsChange}
        filterBarPlaceholder="过滤表"
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
      }, this.state.roleMemberFilters);
    }
  };

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
    const { type, id } = AppState.currentMenuType;
    let organizationId;
    let projectId;
    let createService = ['iam-service.role-member.createOrUpdateOnSiteLevel'];
    let deleteService = ['iam-service.role-member.deleteOnSiteLevel'];
    if (type === 'organization') {
      organizationId = id;
      createService = ['iam-service.role-member.createOrUpdateOnOrganizationLevel'];
      deleteService = ['iam-service.role-member.deleteOnOrganizationLevel'];
    } else if (type === 'project') {
      projectId = id;
      createService = ['iam-service.role-member.createOnProjectLevel'];
      deleteService = ['iam-service.role-member.deleteOnProjectLevel'];
    }
    return {
      type,
      createService,
      deleteService,
      organizationId,
      projectId,
    };
  }

  getLink() {

  }
  render() {
    const { sidebar, selectType, roleData, showMember, selectMemberRoles, selectRoleMemberKeys } = this.state;
    const { AppState } = this.props;
    const okText = selectType === 'create' ? '添加' : '保存';
    const roles = new memberRoleType(this, JSON.parse(sessionStorage.selectData));
    const { organizationId, projectId, createService, deleteService, type } = this.getPermission();
    return (
      <Page>
        <Header title={'角色分配'}>
          <Permission
            service={createService}
            type={type}
            organizationId={organizationId}
            projectId={projectId}
          >
            <Button
              onClick={this.createRole}
              icon="playlist_add"
            >
              添加
            </Button>
          </Permission>
          <Permission
            service={deleteService}
            type={type}
            organizationId={organizationId}
            projectId={projectId}
          >
            <Button
              onClick={this.deleteRoleByMultiple}
              icon="delete"
              disabled={!(showMember ? Object.keys(selectMemberRoles) : selectRoleMemberKeys).length}
            >
              {'移除'}
            </Button>
          </Permission>
          <Button
            onClick={this.reload}
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={roles.drawPage()}
          link={roles.drawPageLink()}
          description="角色分配是给成员分配角色。您可以通过给成员添加角色，赋予成员一组权限。您也可以移除成员的角色来控制成员的访问权限。"
        >
          <div className="member-role-btns">
            <span className="text">查看方式:</span>
            <Button
              className={this.getMemberRoleClass('member')}
              onClick={() => {
                this.showMemberTable(true);
              }}
              type="primary">成员</Button>
            <Button
              className={this.getMemberRoleClass('role')}
              onClick={() => {
                this.showMemberTable(false);
              }}
              type="primary">角色</Button>
          </div>
          {showMember ? this.renderMemberTable() : this.renderRoleTable()}
          <Sidebar
            title={this.getSidebarTitle()}
            onOk={this.handleOk}
            okText={okText}
            cancelText="取消"
            onCancel={this.closeSidebar}
            visible={sidebar}
          >
            {roleData.length ? this.getSidebarContent() : null}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(MemberRole));
