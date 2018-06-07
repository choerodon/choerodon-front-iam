import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { Button, Checkbox, Col, Form, Icon, Input, Modal, Row, Select, Table, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, axios } from 'choerodon-front-boot';
import RoleStore from '../../../../stores/globalStores/role/RoleStore';
// import '../../../../assets/css/main.scss';
import './RoleCreate.scss';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const Option = Select.Option;
const { Sidebar } = Modal;

@inject('AppState')
@observer
class CreateRole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      selectedLevel: 'site',
      filterPermisson: '',
      filterService: '所有服务',
      filterType: '所有类型',
      roleName: '',
      description: '',
      whetherEdit: true,
      whetherStart: false,
      showErrorName: false,
      page: 1,
      pageSize: 10,
      alreadyPage: 1,
      errorName: '',
      errorDescription: '',
      submitting: false,
      selectedRowKeys: [],
      selectedSideBar: [],
      currentPermission: [],
      firstLoad: true,
    };
  }

  componentWillMount() {
    this.setCanPermissionCanSee();
    const permissions = RoleStore.getSelectedRolesPermission || [];
    this.setState({
      currentPermission: permissions.map(item => item.id),
    });
    RoleStore.getAllRoleLabel();
  }

  componentWillUnmount() {
    RoleStore.setCanChosePermission('site', []);
    RoleStore.setCanChosePermission('organization', []);
    RoleStore.setCanChosePermission('project', []);
    RoleStore.setChosenLevel('');
    RoleStore.setSelectedRolesPermission([]);
  }

  // 获取权限管理数据
  setCanPermissionCanSee() {
    const levels = ['organization', 'project', 'site'];
    for (let c = 0; c < levels.length; c += 1) {
      Observable.fromPromise(axios.get(`iam/v1/permissions?level=${levels[c]}`))
        .subscribe((data) => {
          RoleStore.handleCanChosePermission(levels[c], data);
        });
    }
  }

  checkCode = (rule, value, callback) => {
    const validValue = `role/${RoleStore.getChosenLevel}/custom/${value}`;
    const params = { code: validValue };
    axios.post('/iam/v1/roles/check', JSON.stringify(params)).then((mes) => {
      if (mes.failed) {
        callback(Choerodon.getMessage('角色编码已存在，请输入其他角色编码', 'code existed, please try another'));
      } else {
        callback();
      }
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
      firstLoad: false,
    });
    const { currentPermission } = this.state;
    const selected = RoleStore.getSelectedRolesPermission
      .filter(item => currentPermission.indexOf(item.id) !== -1);
    RoleStore.setInitSelectedPermission(selected);
  };

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  handleChangePermission = (selected, ids, permissions) => {
    const initPermission = RoleStore.getInitSelectedPermission;
    if (selected) {
      const newPermission = initPermission.concat(permissions);
      RoleStore.setInitSelectedPermission(_.uniqBy(newPermission, 'code'));
    } else {
      const centerPermission = initPermission.slice();
      _.remove(centerPermission, item => ids.indexOf(item.id) !== -1);
      RoleStore.setInitSelectedPermission(centerPermission);
    }
  };

  handleOk = () => {
    const selected = RoleStore.getInitSelectedPermission;
    const selectedIds = selected.map(item => item.id);
    RoleStore.setSelectedRolesPermission(_.uniqBy(selected));
    this.setState({
      currentPermission: selectedIds,
      visible: false,
      alreadyPage: 1,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleCreate = (e) => {
    e.preventDefault();
    this.setState({
      firstLoad: false,
    });
    this.props.form.validateFieldsAndScroll((err) => {
      if (!err) {
        const { currentPermission } = this.state;
        const rolePermissionss = [];
        currentPermission.forEach(id =>
          rolePermissionss.push({ id }));
        if (rolePermissionss.length > 0) {
          const labelValues = this.props.form.getFieldValue('label');
          const labelIds = labelValues && labelValues.map(labelId => ({ id: labelId }));
          const role = {
            name: this.props.form.getFieldValue('name'),
            modified: this.props.form.getFieldValue('modified'),
            enabled: this.props.form.getFieldValue('enabled'),
            code: `role/${RoleStore.getChosenLevel}/custom/${this.props.form.getFieldValue('code').trim()}`,
            level: RoleStore.getChosenLevel,
            permissions: rolePermissionss,
            labels: labelIds,
          };
          this.setState({ submitting: true });
          RoleStore.createRole(role)
            .then((data) => {
              this.setState({ submitting: false });
              if (data) {
                Choerodon.prompt(Choerodon.getMessage('创建成功', 'Create Success'));
                this.linkToChange('/iam/role');
              }
            })
            .catch((errors) => {
              this.setState({ submitting: false });
              if (errors.response.data.message === 'error.role.roleNameExist') {
                Choerodon.prompt('该角色名已创建');
              } else {
                Choerodon.prompt(`${Choerodon.getMessage('创建失败', 'Create Failed')}:${errors}`);
              }
            });
        }
      }
    });
  };

  handleReset = () => {
    this.linkToChange('/iam/role');
  };

  handleModal = (value) => {
    const form = this.props.form;
    const that = this;
    const { getFieldValue, setFieldsValue } = this.props.form;
    if (getFieldValue('code')) {
      form.validateFields(['code'], { force: true });
    }
    const { currentPermission } = this.state;
    const level = getFieldValue('level');
    if (level && currentPermission.length) {
      confirm({
        title: '修改角色层级',
        content: '确定要修改角色的层级吗？更换角色层级将清空您已选的权限。',
        onOk() {
          RoleStore.setChosenLevel(value);
          RoleStore.setSelectedRolesPermission([]);
          that.setState({
            currentPermission: [],
          });
        },
        onCancel() {
          setFieldsValue({ level });
        },
      });
    } else {
      RoleStore.setChosenLevel(value);
      RoleStore.setSelectedRolesPermission([]);
      this.setState({
        currentPermission: [],
      });
    }
  };

  handlePageChange = (pagination, filters, sorter, params) => {
    const level = RoleStore.getChosenLevel;
    const newFilters = {
      params: (params && params.join(',')) || '',
    };
    RoleStore.getWholePermission(level, pagination, newFilters).subscribe((data) => {
      RoleStore.handleCanChosePermission(level, data);
    });
  };

  renderRoleLabel = () => {
    const labels = RoleStore.getLabel;
    return labels.map(item =>
      <Option key={item.id} value={`${item.id}`}>{item.name}</Option>);
  };

  renderLevel() {
    if (RoleStore.getChosenLevel === 'site') {
      return '全局层';
    } else if (RoleStore.getChosenLevel === 'organization') {
      return '组织层';
    } else {
      return '项目层';
    }
  }

  render() {
    const { currentPermission, firstLoad, submitting } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 100 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };
    const origin = RoleStore.getCanChosePermission;
    const data = RoleStore.getChosenLevel !== '' ? origin[RoleStore.getChosenLevel].slice() : [];
    const pagination = RoleStore.getPermissionPage[RoleStore.getChosenLevel];
    const selectedPermission = RoleStore.getSelectedRolesPermission || [];
    const changePermission = RoleStore.getInitSelectedPermission || [];
    const codePrefix = `role/${RoleStore.getChosenLevel || 'level'}/custom/`;
    return (
      <Page className="choerodon-roleCreate">
        <Header
          title={Choerodon.getMessage('创建角色', 'create')}
          backPath="/iam/role"
        />
        <Content
          title={`在平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”中创建角色`}
          description="自定义角色可让您对权限进行分组，并将其分配给您平台、组织或项目的成员。您可以手动选择权限，也可以从其他角色导入权限。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/platform/role/"
        >
          <div>
            <Form layout="vertical">
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('level', {
                  rules: [{
                    required: true,
                    message: '请选择角色层级',
                  }],
                  initialValue: RoleStore.getChosenLevel !== '' ? RoleStore.getChosenLevel : undefined,
                })(
                  <Select
                    label={Choerodon.getMessage('角色层级', 'role label')}
                    ref={this.saveSelectRef}
                    size="default"
                    style={{
                      width: '512px',
                    }}
                    getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
                    onChange={this.handleModal}
                  >
                    <Option value="site">全局</Option>
                    <Option value="organization">组织</Option>
                    <Option value="project">项目</Option>
                  </Select>,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('code', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: Choerodon.getMessage('请输入角色编码', 'please input role code'),
                  }, {
                    pattern: /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
                    message: Choerodon.getMessage('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾', 'Code can contain only lowercase letters, digits,"-", must start with lowercase letters and will not end with "-"'),
                  }, {
                    validator: this.checkCode,
                  }],
                  validateFirst: true,
                  initialValue: this.state.roleName,
                })(
                  <Input
                    label={Choerodon.getMessage('角色编码', 'code')}
                    prefix={codePrefix}
                    size="default"
                    style={{
                      width: '512px',
                    }}
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: Choerodon.getMessage('请输入角色名称', 'Please input role name'),
                  }],
                  initialValue: this.state.name,
                })(
                  <Input
                    label={Choerodon.getMessage('角色名称', 'name')}
                    type="textarea"
                    rows={1}
                    style={{
                      width: '512px',
                    }}
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('label')(
                  <Select
                    mode="tags"
                    label={Choerodon.getMessage('角色标签', 'role label')}
                    size="default"
                    getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
                    style={{
                      width: '512px',
                    }}
                  >
                    {this.renderRoleLabel()}
                  </Select>,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                <Tooltip placement="top" title={RoleStore.getChosenLevel ? '添加权限' : '请先选择角色层级'}>
                  <Button
                    funcType="raised"
                    onClick={this.showModal.bind(this)}
                    disabled={RoleStore.getChosenLevel === ''}
                    className="addPermission"
                    icon="add"
                  >
                    添加权限
                  </Button>
                </Tooltip>
              </FormItem>
              <FormItem>
                {currentPermission.length > 0 ? (
                  <p className="alreadyDes">
                    {currentPermission.length}个已分配权限
                  </p>
                ) : (
                  <p className="alreadyDes">没有已分配权限</p>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                <Table
                  style={{
                    width: '512px',
                  }}
                  columns={[{
                    title: '权限',
                    dataIndex: 'code',
                    key: 'code',
                  }, {
                    title: '描述',
                    dataIndex: 'description',
                    key: 'description',
                  }]}
                  dataSource={selectedPermission || []}
                  filterBarPlaceholder="过滤表"
                  rowSelection={{
                    selectedRowKeys: currentPermission,
                    onChange: (selectedRowKeys, selectedRows) => {
                      this.setState({
                        currentPermission: selectedRowKeys,
                      });
                    },
                  }}
                  rowKey="id"
                />
                {!firstLoad && !currentPermission.length ? (
                  <div style={{ color: '#d50000' }} className="ant-form-explain">
                    必须至少分配一个权限
                  </div>
                ) : null}
              </FormItem>
              <FormItem>
                <Row className="mt-md">
                  <Col className="choerodon-btn-create">
                    <Button
                      funcType="raised"
                      type="primary"
                      onClick={this.handleCreate}
                      loading={submitting}
                    >
                      {Choerodon.getMessage('创建', 'create')}
                    </Button>
                  </Col>
                  <Col span={5}>
                    <Button
                      funcType="raised"
                      onClick={this.handleReset}
                      disabled={submitting}
                    >
                      {Choerodon.getMessage('取消', 'cancel')}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </Form>
            <Sidebar
              title={Choerodon.getMessage('添加权限', 'addPermission')}
              visible={this.state.visible}
              onOk={this.handleOk.bind(this)}
              onCancel={this.handleCancel.bind(this)}
              okText="添加"
              cancelText="取消"
            >
              <Content
                className="sidebar-content"
                title="向当前创建角色添加权限"
                description="您可以在此为当前角色添加一个或多个权限。"
                link="http://choerodon.io/zh/docs/user-guide/system-configuration/platform/role/"
              >
                <Table
                  style={{
                    width: '512px',
                  }}
                  columns={[{
                    title: '权限',
                    dataIndex: 'code',
                    key: 'code',
                  }, {
                    title: '描述',
                    dataIndex: 'description',
                    key: 'description',
                  }]}
                  rowKey="id"
                  dataSource={data}
                  pagination={pagination}
                  onChange={this.handlePageChange}
                  rowSelection={{
                    selectedRowKeys: (changePermission
                      && changePermission.map(item => item.id)) || [],
                    onSelect: (record, selected, selectedRows) => {
                      this.handleChangePermission(selected, [record.id], selectedRows);
                    },
                    onSelectAll: (selected, selectedRows, changeRows) => {
                      const ids = _.map(changeRows, item => item.id);
                      this.handleChangePermission(selected, ids, selectedRows);
                    },
                  }}
                />
              </Content>
            </Sidebar>
          </div>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(CreateRole));

