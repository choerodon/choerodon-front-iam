import React, { Component } from 'react';
import { Button, Checkbox, Col, Form, Input, Modal, Row, Table, Tag } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { withRouter } from 'react-router-dom';
import { Observable } from 'rxjs';
import axios from 'Axios';
import PageHeader from 'PageHeader';
import _ from 'lodash';
import '../../../../assets/css/main.scss';
import RoleStore from '../../../../stores/globalStores/role/RoleStore';
import './RoleDetail.scss';

const FormItem = Form.Item;
const confirm = Modal.confirm;

@inject('AppState')
@observer
class EditRole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleData: {},
      visible: false,
      selectedLevel: 'site',
      filterPermisson: '',
      filterService: '所有服务',
      filterType: '所有类型',
      selectedRowKeyss: [],
      page: 1,
      pageSize: 10,
      alreadyPage: 1,
      allRows: [],
      buttonClicked: false,
      id: this.props.match.params.id,
    };
    this.closeModal = this.closeModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeFilter = this.handleChangeFilter.bind(this);
    this.renderCanChoseService = this.renderCanChoseService.bind(this);
    this.handleChangeService = this.handleChangeService.bind(this);
    this.renderCanChoseType = this.renderCanChoseType.bind(this);
    this.handleChangeType = this.handleChangeType.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.linkToChange = this.linkToChange.bind(this);
  }

  componentWillMount() {
    RoleStore.getRoleById(this.state.id).then((data) => {
      this.setState({
        roleData: data,
      });
    }).catch((error) => {
      Choerodon.prompt(`${Choerodon.getMessage('获取角色信息失败', 'getInfoError')}: ${error}`);
    });
  }

  componentWillUnmount() {
    RoleStore.setCanChosePermission('site', []);
    RoleStore.setCanChosePermission('organization', []);
    RoleStore.setCanChosePermission('project', []);
  }

  onChangeChoseAll = (data, chosen, e) => {
    let flag = 0;
    if (data[0].permissionLevel === 'site') {
      for (let a = 0; a < chosen.length; a += 1) {
        if (chosen[a].permissionLevel !== 'site') {
          flag = 1;
          confirm({
            title: '提醒',
            content: '你选择了site层权限,会删除掉已选择的组织和项目层权限!',
            onOk() {
              RoleStore.changePermissionCheckAllFalse2(data[0].permissionLevel, data);
            },
            onCancel() {
            },
          });
          break;
        }
      }
    } else {
      for (let a = 0; a < chosen.length; a += 1) {
        if (chosen[a].permissionLevel === 'site') {
          flag = 1;
          confirm({
            title: '提醒',
            content: '你选择了组织或项目层权限,会删除掉已选择的site层权限!',
            onOk() {
              RoleStore.changePermissionCheckAllFalse2(data[0].permissionLevel, data);
            },
            onCancel() {
            },
          });
          break;
        }
      }
    }
    if (flag === 0) {
      const datas = RoleStore.getCanChosePermission[this.state.selectedLevel];
      for (let a = 0; a < datas.length; a += 1) {
        for (let b = 0; b < data.length; b += 1) {
          if (datas[a].name === data[b].name) {
            if (e.target.checked === true) {
              RoleStore.changePermissionCheckByValue(this.state.selectedLevel, datas[a], true);
            } else {
              RoleStore.changePermissionCheckByValue(this.state.selectedLevel, datas[a], false);
            }
          }
        }
      }
    }
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    RoleStore.setSelectedRolesPermission(this.state.selectedLevel, selectedRows);
    this.setState({
      selectedRowKeys,
    });
  }

  onChange = (item, chosen) => {
    const level = this.state.selectedLevel;
    // let flag = 0;
    // if (item.permissionLevel === 'site') {
    //   for (let a = 0; a < chosen.length; a += 1) {
    //     if (chosen[a].permissionLevel !== 'site') {
    //       flag = 1;
    //       confirm({
    //         title: '提醒',
    //         content: '你选择了site层权限,会删除掉已选择的组织和项目层权限!',
    //         onOk() {
    //           RoleStore.changePermissionCheckAllFalse(level, item);
    //         },
    //         onCancel() {
    //           window.console.log('cancel');
    //         },
    //       });
    //       break;
    //     }
    //   }
    // } else {
    //   for (let a = 0; a < chosen.length; a += 1) {
    //     if (chosen[a].permissionLevel === 'site') {
    //       flag = 1;
    //       confirm({
    //         title: '提醒',
    //         content: '你选择了组织或项目层权限,会删除掉已选择的site层权限!',
    //         onOk() {
    //           RoleStore.changePermissionCheckAllFalse(level, item);
    //         },
    //         onCancel() {
    //           window.console.log('cancel');
    //         },
    //       });
    //       break;
    //     }
    //   }
    // }
    // if (flag === 0) {
    RoleStore.changePermissionCheck(this.state.selectedLevel, item);
    // }
  }

  onChangePage2 = (data) => {
    this.setState({
      alreadyPage: data,
    });
  }

  onChangePage = (data) => {
    this.setState({
      page: data,
    });
  }

  getCanPermissionCanSee(level) {
    const that = this;
    // RoleStore.getWholePermission(
    //   this.state.selectedLevel,
    // ).subscribe((data1) => {
    //   RoleStore.setWholeService(data1);
    Observable.fromPromise(axios.get(`uaa/v1/permissions?level=${level}`))
      .subscribe((data) => {
        const datas = data.content;
        for (let a = 0; a < datas.length; a += 1) {
          datas[a].key = a;
          datas[a].check = false;
        }
        if (RoleStore.getCanChosePermission[level].length === 0) {
          RoleStore.setCanChosePermission(level, datas);
        }
        const temp = data.content.slice(0, this.state.pageSize);
        that.setState({
          tableShowData: temp,
        });
      });
    // });
  }

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  }

  handleChangeType = (e) => {
    this.setState({
      filterType: e,
      page: 1,
    });
  }

  handleChange = (value) => {
    this.setState({
      selectedLevel: value,
      page: 1,
    });
    RoleStore.changePermissionCheckAllFalse(value);
    // this.getCanPermissionCanSee(value);
  }

  handleChangeService = (e) => {
    this.setState({
      filterService: e,
      page: 1,
    });
  }

  closeModal = () => {
    this.setState({
      visible: false,
      alreadyPage: 1,
    });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleChangeFilter = (e) => {
    this.setState({
      filterPermisson: e.target.value,
      page: 1,
    });
  }

  handleEdit = () => {
    this.props.form.validateFieldsAndScroll((err) => {
      if (!err) {
        const rolePermissionss = [];
        const rolePermissions = RoleStore.getCanChosePermission;
        for (let b = 0; b < ['site', 'organization', 'project'].length; b += 1) {
          for (let a = 0; a < rolePermissions[['site', 'organization', 'project'][b]].length; a += 1) {
            if (rolePermissions[['site', 'organization', 'project'][b]][a].check === true) {
              rolePermissionss.push({
                permissionId: rolePermissions[['site', 'organization', 'project'][b]][a].id,
              });
            }
          }
        }
        const role = {
          description: this.props.form.getFieldValue('instruction'),
          editable: this.props.form.getFieldValue('isEdit'),
          enabled: this.props.form.getFieldValue('isEnable'),
          name: this.props.form.getFieldValue('name'),
          level: this.state.selectedLevel,
          permissions: rolePermissionss,
        };
        this.setState({ submitting: true, buttonClicked: true });
        RoleStore.editRoleByid(this.props.id, role).then((data) => {
          if (data) {
            Choerodon.prompt(Choerodon.getMessage('成功', 'Success'));
            this.linkToChange('/iam/role');
          }
        }).catch((errors) => {
          Choerodon.prompt(`${Choerodon.getMessage('失败', 'Fail')}:${errors}`);
          this.setState({ buttonClicked: false });
        });
      }
    });
  }

  handleReset = () => {
    this.linkToChange('/iam/role');
  }

  handlePageChange = (pages) => {
    this.setState({
      page: pages,
    });
  }

  handleAlreadyPageChange = (page) => {
    const updatePage = page;
    this.setState({
      alreadyPage: updatePage,
    });
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
  }

  renderCanChoseType = () => {
    const data4 = RoleStore.getCanChosePermission[this.state.selectedLevel];
    let data = [];
    if (this.state.filterService !== '所有服务') {
      for (let b = 0; b < data4.length; b += 1) {
        if (data4[b].service === this.state.filterService) {
          data.push(data4[b]);
        }
      }
    } else {
      data = data4;
    }
    const data2 = [];
    for (let a = 0; a < data.length; a += 1) {
      data2.push({
        name: data[a].code.split('.')[1],
        code: data[a].code.split('.')[1],
      });
    }
    data2.splice(0, 0, {
      name: '所有类型',
      code: '所有类型',
    });
    const data3 = _.uniqBy(data2, 'name');
    return data3;
  }

  renderLevel() {
    if (this.state.roleData.level === 'site') {
      return '全局层';
    } else if (this.state.roleData.level === 'organization') {
      return '组织层';
    } else {
      return '项目层';
    }
  }

  renderLabel = () => (<p style={{ paddingLeft: 7 }}>无</p>);
  // if (JSON.stringify(this.state.roleData) !== '{}') {
  //   window.console.log(this.state.roleData.roleLabels);
  //   if (_.isNull(this.state.roleData.roleLabels)) {
  //     return <p style={{ paddingLeft: 7 }}>无</p>;
  //   } else if (this.state.roleData.roleLabels.length === 0) {
  //     return <p style={{ paddingLeft: 7 }}>无</p>;
  //   } else {
  //     return this.state.roleData.roleLabels.map(item => <Tag>{item.name}</Tag>);
  //   }
  // } else {
  // return <p style={{ paddingLeft: 7 }}>无</p>;
  // }

  renderPermissionTitle() {
    if (this.state.roleData.permissions) {
      if (this.state.roleData.permissions.length > 0) {
        return (
          <p className="alreadyDes">
            {this.state.roleData.permissions.length}个已分配权限
          </p>
        );
      } else {
        return (
          <p className="alreadyDes">没有已分配权限</p>
        );
      }
    } else {
      return (
        <p className="alreadyDes">没有已分配权限</p>
      );
    }
  }

  render() {
    const enable = this.state.roleData.enabled;
    const origin = RoleStore.getCanChosePermission;
    const data = toJS(origin[this.state.selectedLevel]);
    const data2 = _.unionBy(origin.site, origin.organization, origin.project, 'name');
    const filters = this.state.filterPermisson;
    let services = '';
    let types = '';
    if (this.state.filterService !== '所有服务') {
      services = this.state.filterService;
    }
    if (this.state.filterType !== '所有类型') {
      types = this.state.filterType;
    }
    let choseAll = false;
    const datas = data.length > 0 ? data.filter(item =>
      item.code.indexOf(filters) !== -1
      && item.code.indexOf(services) !== -1
      && item.code.indexOf(types) !== -1).slice((this.state.page - 1) * 10,
      this.state.page * 10) : [];

    const datas2 = data.length > 0 ? data.filter(item =>
      item.code.indexOf(filters) !== -1
      && item.code.indexOf(services) !== -1
      && item.code.indexOf(types) !== -1) : [];
    let flag = 0;
    if (datas.length > 0) {
      for (let a = 0; a < datas.length; a += 1) {
        if (datas[a].check === false) {
          flag = 1;
        }
      }
      if (flag === 0) {
        choseAll = true;
      }
    }
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
    const codePrefix = `role/${this.state.roleData.level || '层级'}/custom/`;
    return (
      <div className="choerodon-roleDetail">
        <div className="UnderPageHeadStyle page-container">
          <PageHeader
            title={Choerodon.getMessage('角色详情', 'create')}
            backPath="/iam/role"
          >
            <Button
              className="header-btn headLeftBtn leftBtn"
            >
              <span className="icon-autorenew" />
              <span className="icon-space">{Choerodon.getMessage('刷新', 'Refresh')}</span>
            </Button>
          </PageHeader>
          <div className="page-content">
            <div className="pageFirstLine">
              <p className="pageFirstLine_title">查看角色“{this.state.roleData.name}”详情</p>
              <p className="pageFirstLine_content">查看预定义角色的详情。
                <span className="firstSpan">了解详情</span>
                <span className="icon-open_in_new" />
              </p>
            </div>
            <Form onSubmit={this.handleEdit} layout="vertical">
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('level', {
                  rules: [{
                    required: true,
                    message: '层级是必须的',
                  }],
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
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: Choerodon.getMessage('角色名是必须的', 'instruction name is required'),
                  }],
                  initialValue: this.state.roleData.name,
                })(
                  <Input
                    disabled
                    placeholder={Choerodon.getMessage('请输入角色名', 'Please input your instruction')}
                    type="textarea"
                    label={Choerodon.getMessage('角色名称', 'instruction')}
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
                {getFieldDecorator('code', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: Choerodon.getMessage('角色编码是必须的', 'Role name is required'),
                  }],
                  validateTrigger: 'onBlur',
                  initialValue: this.state.roleData.name,
                })(
                  <Input
                    disabled 
                    placeholder={Choerodon.getMessage('请输入角色编码', 'Please input your name')}
                    size="default"
                    label={Choerodon.getMessage('角色编码', 'name')}
                    prefix={codePrefix}
                    style={{
                      width: '512px',
                    }}
                  />,
                )}
              </FormItem>
              {/* <FormItem
                {...formItemLayout}
                hasFeedback
              >
                {getFieldDecorator('label')(
                  <div>
                    {this.renderLabel()}
                  </div>,
                )}
              </FormItem> */}
              {/* <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('isEdit', {
                  valuePropName: 'checked',
                  initialValue: this.state.roleData.builtIn,
                })(
                  <Checkbox disabled>{Choerodon.getMessage('是否可编辑', 'if edit')}</Checkbox>,
                )}

              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('isEnable', {
                  valuePropName: 'checked',
                  initialValue: enable,
                })(
                  <Checkbox disabled={!this.state.roleData.enableModify}>
                  {Choerodon.getMessage('是否启用', 'if enable')}</Checkbox>,
                )}
              </FormItem> */}
              <FormItem>
                {this.renderPermissionTitle()}
                {/* {this.state.roleData.permissions.length > 0 ? (
                  <p className="alreadyDes">
                    {this.state.roleData.permissions.length.length}个已分配权限
                  </p>
                ) : (
                  <p className="alreadyDes">没有已分配权限</p>
                )} */}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                <Table
                  style={{
                    width: '512px',
                  }}
                  rowKey="code"
                  columns={[{
                    title: '权限',
                    dataIndex: 'code',
                    key: 'code',
                  }, {
                    title: '描述',
                    dataIndex: 'description',
                    key: 'description',
                  }]}
                  dataSource={this.state.roleData.permissions}
                />
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

export default Form.create({})(withRouter(EditRole));

