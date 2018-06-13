import React, { Component } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, Table } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Observable } from 'rxjs';
import Page, { Header, Content } from 'Page';
import _ from 'lodash';
import '../../../../assets/css/main.scss';
import RoleStore from '../../../../stores/globalStores/role/RoleStore';
import './RoleEdit.scss';

const Option = Select.Option;
const FormItem = Form.Item;
const { Sidebar } = Modal;

@inject('AppState')
@observer
class EditRole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleData: {},
      visible: false,
      selectedLevel: 'site',
      buttonClicked: false,
      id: this.props.match.params.id,
      currentPermission: [],
      selectPermission: [],
    };
  }

  componentWillMount() {
    RoleStore.getRoleById(this.state.id).then((data) => {
      this.setState({
        roleData: data,
        currentPermission: data.permissions.map(item => item.id),
      });
      RoleStore.setSelectedRolesPermission(data.permissions);
      this.setCanPermissionCanSee(data.level);
    }).catch((error) => {
      Choerodon.prompt(`${Choerodon.getMessage('获取角色信息失败', 'getInfoError')}: ${error}`);
    });
    RoleStore.getAllRoleLabel();
  }

  componentWillUnmount() {
    RoleStore.setCanChosePermission('site', []);
    RoleStore.setCanChosePermission('organization', []);
    RoleStore.setCanChosePermission('project', []);
    RoleStore.setSelectedRolesPermission([]);
  }

  // 获取权限管理数据
  setCanPermissionCanSee(level) {
    RoleStore.getWholePermission(level,
      RoleStore.getPermissionPage[level]).subscribe((data) => {
      RoleStore.handleCanChosePermission(level, data);
    });
  }

  getCurrentLabelValue() {
    const { roleData } = this.state;
    return roleData.labels.map(value => `${value.id}`);
  }

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  handleOk = () => {
    const selected = RoleStore.getInitSelectedPermission;
    const selectedIds = selected.map(item => item.id);
    RoleStore.setSelectedRolesPermission(_.uniqBy(selected));
    this.setState({
      visible: false,
      currentPermission: selectedIds,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
    const { currentPermission } = this.state;
    const selected = RoleStore.getSelectedRolesPermission
      .filter(item => currentPermission.indexOf(item.id) !== -1);
    RoleStore.setInitSelectedPermission(selected);
  };

  handleEdit = () => {
    this.props.form.validateFieldsAndScroll((err) => {
      if (!err) {
        const { currentPermission } = this.state;
        const rolePermissionss = [];
        currentPermission.forEach(id =>
          rolePermissionss.push({ id }));
        if (rolePermissionss.length) {
          const labelValues = this.props.form.getFieldValue('label');
          const labelIds = labelValues && labelValues.map(labelId => ({ id: labelId }));
          const role = {
            name: this.props.form.getFieldValue('name'),
            editable: this.props.form.getFieldValue('isEdit'),
            enabled: this.props.form.getFieldValue('isEnable'),
            code: this.props.form.getFieldValue('code'),
            level: this.state.roleData.level,
            permissions: rolePermissionss,
            labels: labelIds,
            objectVersionNumber: this.state.roleData.objectVersionNumber,
          };
          this.setState({ submitting: true, buttonClicked: true });
          RoleStore.editRoleByid(this.state.id, role).then((data) => {
            if (data) {
              Choerodon.prompt(Choerodon.getMessage('成功', 'Success'));
              this.linkToChange('/iam/role');
            }
          }).catch((errors) => {
            Choerodon.prompt(`${Choerodon.getMessage('失败', 'Fail')}:${errors}`);
            this.setState({ buttonClicked: false });
          });
        }
      }
    });
  };

  handleReset = () => {
    this.linkToChange('/iam/role');
  };

  handlePageChange = (pagination, filters, sorter, params) => {
    const { roleData } = this.state;
    const newFilters = {
      params: (params && params.join(',')) || '',
    };
    RoleStore.getWholePermission(roleData.level, pagination, newFilters).subscribe((data) => {
      RoleStore.handleCanChosePermission(roleData.level, data);
    });
  }

  handleAlreadyPageChange = (page) => {
    const updatePage = page;
    this.setState({
      alreadyPage: updatePage,
    });
  };

  handlehandleReset = () => {
    this.props.history.goBack();
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
  }

  handlestopPropagation = (event) => {
    event.stopPropagation();
  }

  renderCanChoseService = () => {
    const data = RoleStore.getCanChosePermission[this.state.selectedLevel];
    const data2 = [];
    for (let a = 0; a < data.length; a += 1) {
      data2.push({
        name: data[a].code.split('.')[0],
        code: data[a].code.split('.')[0],
      });
    }
    data2.splice(0, 0, {
      name: '所有服务',
      code: '所有服务',
    });
    const data3 = _.uniqBy(data2, 'name');
    return data3;
  };

  renderRoleLabel = () => {
    const labels = RoleStore.getLabel;
    const result = labels.map(item =>
      <Option key={item.id} value={`${item.id}`}>{item.name}</Option>);
    return result;
  };

  renderLevel() {
    if (this.state.roleData.level === 'site') {
      return '全局层';
    } else if (this.state.roleData.level === 'organization') {
      return '组织层';
    } else {
      return '项目层';
    }
  }

  render() {
    const {
      roleData = {},
      chosenLevel,
      visible,
      currentPermission,
    } = this.state;
    const { level, name, code, labels, builtIn } = roleData;
    const origin = RoleStore.getCanChosePermission;
    const data = level ? origin[level].slice() : [];
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
    const pagination = RoleStore.getPermissionPage[level];
    const selectedPermission = _.uniqBy(RoleStore.getSelectedRolesPermission, 'code') || [];
    const changePermission = RoleStore.getInitSelectedPermission || [];
    return (
      <div>
        <Page>
          <Header
            title={Choerodon.getMessage('修改角色', 'create')}
            backPath="/iam/role"
          />
          <Content
            title={`对角色“${name}”进行修改`}
            description="您可以在此修改角色名称、标签、权限。"
            link="http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/platform/role/"
          >
            <Form layout="vertical">
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('level', {
                  initialValue: this.renderLevel(),
                })(
                  <Input
                    size="default"
                    label="角色层级"
                    style={{
                      width: '512px',
                    }}
                    disabled
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('code', {
                  rules: [{
                    required: true,
                    whitespace: true,
                  }],
                  initialValue: code,
                })(
                  <Input
                    placeholder={Choerodon.getMessage('请输入角色编码', 'Please input role code')}
                    size="default"
                    label={Choerodon.getMessage('角色编码', 'code')}
                    style={{
                      width: '512px',
                    }}
                    disabled
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: Choerodon.getMessage('请输入角色名称', 'Please input role name'),
                    whitespace: true,
                  }],
                  initialValue: name,
                })(
                  <Input
                    placeholder={Choerodon.getMessage('请输入角色名称', 'Please input role name')}
                    rows={1}
                    label={Choerodon.getMessage('角色名称', 'name')}
                    style={{
                      width: '512px',
                    }}
                    disabled={builtIn}
                  />,
                )}
              </FormItem>
              {labels ? (
                <FormItem
                  {...formItemLayout}
                >
                  {getFieldDecorator('label', {
                    valuePropName: 'value',
                    initialValue: this.getCurrentLabelValue(),
                  })(
                    <Select
                      mode="tags"
                      placeholder="请选择角色标签"
                      size="default"
                      label={Choerodon.getMessage('角色标签', 'label')}
                      style={{
                        width: '512px',
                      }}
                    >
                      {this.renderRoleLabel()}
                    </Select>,
                  )}
                </FormItem>
              ) : null}
              <FormItem
                {...formItemLayout}
              >
                <Button
                  funcType="raised"
                  onClick={this.showModal.bind(this)}
                  disabled={chosenLevel === '' || builtIn}
                  className="addPermission"
                >
                  <div>
                    <span className="icon-add" />
                    <span>添加权限</span>
                  </div>
                </Button>
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
                  rowKey="id"
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
                />
                {currentPermission.length === 0 ? (
                  <div style={{ color: '#d50000' }} className="ant-form-explain">
                    必须至少分配一个权限
                  </div>
                ) : ''}
              </FormItem>
              <FormItem>
                <Row style={{ marginTop: '2rem' }}>
                  <Col style={{ float: 'left', marginRight: '10px' }}>
                    <Button
                      funcType="raised"
                      type="primary"
                      onClick={this.handleEdit}
                    >
                      {Choerodon.getMessage('保存', 'save')}
                    </Button>
                  </Col>
                  <Col span={5}>
                    <Button
                      funcType="raised"
                      onClick={this.handlehandleReset}
                    >
                      {Choerodon.getMessage('取消', 'cancel')}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </Form>
          </Content>
        </Page>
        <Sidebar
          title={Choerodon.getMessage('添加权限', 'addPermission')}
          visible={visible}
          onOk={this.handleOk.bind(this)}
          onCancel={this.handleCancel.bind(this)}
          okText="添加"
          cancelText="取消"
        >
          <Content
            style={{ padding: 0 }}
            title={`向角色“${name}”添加权限`}
            description="您可以在此为角色添加一个或多个权限。"
            link="http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/iam/site4_role/"
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
              filterBarPlaceholder="过滤表"
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
    );
  }
}

export default Form.create({})(withRouter(EditRole));

