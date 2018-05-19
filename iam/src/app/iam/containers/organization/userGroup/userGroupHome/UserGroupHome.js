import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input, Table, message, Form } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import Action from 'Action';
import PageHeader from 'PageHeader';
import ClientSearch from 'ClientSearch';
import RePagination from 'RePagination';
import NewButton from 'NewButton';
import classNames from 'classnames';
import './UserGroup.scss';

const FormItem = Form.Item;

@inject('AppState')
@observer
class UserGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible2: false,
      visible: false,
      inputCode: '',
      inputName: '',
      inputDescription: '',
      inputCode2: '',
      inputName2: '',
      inputDescription2: '',
      updateId: '',
      currenPage: 1,
      search: {
        code: '',
        input: '',
      },
      sideDisplay: 'none',
      sideTitle: '',
    };
  }
  componentWillMount() {
    const { UserGroupStore, AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    UserGroupStore.getWholeGroup(orgId, {
      code: '',
      input: '',
    }, 1);
  }
  onChangeInput = (name, e) => {
    this.setState({
      [name]: e.target.value,
    });
  }
  
  onChangePagination = (value) => {
    const { UserGroupStore, AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    this.setState({
      currenPage: value,
    });
    UserGroupStore.getWholeGroup(orgId, this.state.search, value);
  }
  createUserGroup = () => {
    this.setState({
      // visible: true,
      sideDisplay: 'block',
      sideTitle: '创建用户组',
    });
  }
  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const { UserGroupStore, AppState } = this.props;
        const menuType = AppState.currentMenuType;
        const orgId = menuType.id;
        const group = {
          code: data.inputCode,
          description: data.inputDescription,
          name: data.inputName,
        };
        UserGroupStore.CreateUserGroup(orgId, group).then(() => {
          Choerodon.prompt('创建成功');
          this.setState({
            sideDisplay: 'none',
            sideTitle: '',
          });
          UserGroupStore.getWholeGroup(orgId, {
            code: '',
            input: '',
          }, 1);
        }).catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
      }
    });
  }

  handleOk2 = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const { UserGroupStore, AppState } = this.props;
        const menuType = AppState.currentMenuType;
        const orgId = menuType.id;
        const group = {
          code: data.inputCode2,
          description: data.inputDescription2,
          name: data.inputName2,
        };
        UserGroupStore.UpdateUserGroup(orgId, this.state.updateId, group).then(() => {
          Choerodon.prompt('创建成功');
          this.setState({
            sideDisplay: 'none',
            sideTitle: '',
          });
          UserGroupStore.getWholeGroup(orgId, {
            code: '',
            input: '',
          }, 1);
        }).catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
      }
    });
  }
    
  handleDetail = (id) => {
    const { UserGroupStore, AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    UserGroupStore.DeleteUserGroup(orgId, id).then(() => {
      UserGroupStore.getWholeGroup(orgId, {
        code: '',
        input: '',
      }, 1);
    });
  }
  editGroup = (record) => {
    this.setState({
      sideDisplay: 'block',
      sideTitle: '编辑用户组',

      inputCode2: record.code,
      inputName2: record.name,
      inputDescription2: record.description,
      updateId: record.id,
    });
  }

  linkToChange = (url) => {
    const { AppState, history } = this.props;
    const type = sessionStorage.type;
    const id = AppState.currentMenuType.id;
    const name = AppState.currentMenuType.name;
    if (type === 'global') {
      history.push(`${url}`);
    } else if (type === 'organization') {
      history.push(`${url}?type=${type}&id=${id}&name=${name}`);
    } else {
      const organizationId = AppState.currentMenuType.organizationId;
      history.push(`${url}?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`);
    }
  }

  addUser = (id) => {
    this.linkToChange(`userGroup/${id}`);
  }

  handleSearch = (state) => {
    const { UserGroupStore, AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    UserGroupStore.getWholeGroup(orgId, state, 1);
    this.setState({
      search: state,
    });
  }
  
  handleDeleteUser = (record) => {
    const { UserGroupStore, AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    UserGroupStore.DeleteUserGroupUser(record.record.id, record.id).then((data) => {
      Choerodon.prompt(Choerodon.getMessage('删除成功', 'Success'));
      UserGroupStore.getWholeGroup(orgId, {
        code: '',
        input: '',
      }, 1);
    }).catch((error) => {
      Choerodon.prompt(`删除失败${error}`);
    });
  }

  renderTitle = () => {
    const data = (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          role="none"
          onClick={() => this.setState({
            sideDisplay: 'none',
            sideTitle: '',
          })}
          style={{ cursor: 'pointer', color: 'rgb(63, 81, 181)' }}
          className="icon-close"
        />
        <p style={{ marginLeft: '1rem' }}>{this.state.sideTitle}</p>
      </div>
    );
    return data;
  }

  renderRightTab = (userGroupStyle) => {
    const { getFieldDecorator } = this.props.form;
    if (this.state.sideTitle === '创建用户组') {
      return (
        <div>
          <Form onSubmit={this.handleOk.bind(this)}>
            <FormItem
              label="用户组编码"
              hasFeedback
            >
              {getFieldDecorator('inputCode', {
                rules: [{
                  required: true,
                  message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                }, {
                  whitespace: true,
                  message: Choerodon.getMessage('不能为空', 'can not be null'),
                }],
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem
              label="用户组名"
              hasFeedback
            >
              {getFieldDecorator('inputName', {
                rules: [{
                  required: true,
                  message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                }, {
                  whitespace: true,
                  message: Choerodon.getMessage('不能为空', 'can not be null'),
                }],
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem
              label="用户组描述"
              hasFeedback
            >
              {getFieldDecorator('inputDescription', {
                rules: [{
                  required: true,
                  message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                }, {
                  whitespace: true,
                  message: Choerodon.getMessage('不能为空', 'can not be null'),
                }],
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem>
              <NewButton
                htmlType="submit"
                text="创建"
              />
            </FormItem>
          </Form>
        </div>
      );
    } else {
      return (
        <div>
          <Form onSubmit={this.handleOk2.bind(this)}>
            <FormItem
              label="用户组编码"
              hasFeedback
            >
              {getFieldDecorator('inputCode2', {
                rules: [{
                  required: true,
                  message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                }, {
                  whitespace: true,
                  message: Choerodon.getMessage('不能为空', 'can not be null'),
                }],
                initialValue: this.state.inputCode2,
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem
              label="用户组名"
              hasFeedback
            >
              {getFieldDecorator('inputName2', {
                rules: [{
                  required: true,
                  message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                }, {
                  whitespace: true,
                  message: Choerodon.getMessage('不能为空', 'can not be null'),
                }],
                initialValue: this.state.inputName2,
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem
              label="用户组描述"
              hasFeedback
            >
              {getFieldDecorator('inputDescription2', {
                rules: [{
                  required: true,
                  message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                }, {
                  whitespace: true,
                  message: Choerodon.getMessage('不能为空', 'can not be null'),
                }],
                initialValue: this.state.inputDescription2,
              })(
                <Input />,
              )}
            </FormItem>
            <FormItem>
              <NewButton
                htmlType="submit"
                text="编辑"
              />
            </FormItem>
          </Form>
        </div>
      );
    }
  }
  
  render() {
    const userGroupStyle = {
      sideP: {
        marginTop: '0.5rem',
      },
    };
    const { UserGroupStore, AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    const data = UserGroupStore.getGroup;
    for (let a = 0; a < data.length; a += 1) {
      data[a].key = a;
    }
    const columns = [{
      title: '组ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      width: '20%',
    }, {
      title: '组编码',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.length - b.code.length,
      width: '20%',
    }, {
      title: '组名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.length - b.code.length,
      width: '20%',
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => a.description.length - b.description.length,
      width: '20%',
    }, {
      title: '',
      key: 'action',
      className: 'operateIcons',
      width: '20%',
      render: (text, record) => (
        <Action
          data={[{
            service: 'hap-user-service.groups.update',
            icon: '',
            text: '编辑',
            action: this.editGroup.bind(this, record),
          }, {
            service: 'hap-user-service.user-groups.insertUserGroups',
            icon: '',
            text: '添加用户',
            action: this.addUser.bind(this, record.id),
          }, {
            service: 'hap-user-service.groups.delete',
            icon: '',
            text: '删除',
            action: this.handleDetail.bind(this, record.id),
          }]}
        />
      ),
    }];
    const columns2 = [{
      title: Choerodon.getMessage('用户名', 'userName'),
      dataIndex: 'name',
      key: 'name',
      width: '15%',
    }, {
      title: Choerodon.getMessage('昵称', 'nickName'),
      dataIndex: 'realName',
      key: 'realName',
      width: '15%',
    }, {
      title: Choerodon.getMessage('认证来源', 'source'),
      key: 'source',
      render: (text, record) => (
        record.source === 'Y'
          ? <p>{Choerodon.getMessage('LDAP 用户', 'user ldap')}</p>
          : <p>{Choerodon.getMessage('非LDAP用户', 'user noLdap')}</p>
      ),
      width: '15%',
    }, {
      title: Choerodon.getMessage('状态', 'user statue'),
      key: 'status',
      render: (text, record) => (
        record.status === 'Y'
          ? <p>{Choerodon.getMessage('启用', 'enable')}</p>
          : <p>{Choerodon.getMessage('未启用', 'disable')}</p>
      ),
      width: '15%',
    }, {
      title: Choerodon.getMessage('是否锁住', 'locked'),
      key: 'locked',
      render: (text, record) => (
        record.locked === 'Y'
          ? <p>{Choerodon.getMessage('锁住', 'ok')}</p>
          : <p>{Choerodon.getMessage('未锁住', 'no')}</p>
      ),
      width: '15%',
    }, {
      title: '',
      key: 'action',
      className: 'operateIcons',
      render: (text, record) => (
        <Action
          data={[{
            service: '',
            icon: '',
            text: '删除',
            action: this.handleDeleteUser.bind(this, record),
          }]}
        />
      ),
    }];
    const pageStyle = classNames({
      'page-show': this.state.sideDisplay === 'none',
      'page-hidden': this.state.sideDisplay !== 'none',
    });
    return (
      <div className="content-wrapper">
        <div className={pageStyle}>
          <PageHeader title={Choerodon.getMessage('用户组管理', 'UserGroup Manage')}>
            <Button
              className="header-btn headLeftBtn leftBtn"
              ghost
              onClick={() => { this.createUserGroup(); }}
            >
              <span className="icon-playlist_add" />
              {Choerodon.getMessage('创建', 'create')}
            </Button>
            <Modal
              title="创建用户组"
              visible={this.state.visible}
              onOk={this.handleOk}
              onCancel={() => this.setState({ visible: false })}
            >
              <p>用户组Code</p>
              <Input value={this.state.inputCode} onChange={this.onChangeInput.bind(this, 'inputCode')} />
              <p>用户组名</p>
              <Input value={this.state.inputName} onChange={this.onChangeInput.bind(this, 'inputName')} />
              <p>用户组描述</p>
              <Input value={this.state.inputDescription} onChange={this.onChangeInput.bind(this, 'inputDescription')} />
            </Modal>
            <Modal
              title="编辑用户组"
              visible={this.state.visible2}
              onOk={this.handleOk2}
              onCancel={() => this.setState({ visible2: false })}
            >
              <p>用户组Code</p>
              <Input value={this.state.inputCode2} onChange={this.onChangeInput.bind(this, 'inputCode2')} />
              <p>用户组名</p>
              <Input value={this.state.inputName2} onChange={this.onChangeInput.bind(this, 'inputName2')} />
              <p>用户组描述</p>
              <Input value={this.state.inputDescription2} onChange={this.onChangeInput.bind(this, 'inputDescription2')} />
            </Modal>
            <Button
              ghost
              className="header-btn headRightBtn leftBtn2"
              onClick={() => {
                UserGroupStore.getWholeGroup(orgId, {
                  code: '',
                  input: '',
                }, 1); 
              }}
            >
              <span className="icon-autorenew" />
              {Choerodon.getMessage('刷新', 'flush')}
            </Button>
          </PageHeader>
          <div id="userGroupDiv UnderPageHeadStyle">
            <ClientSearch
              options={[{
                name: '组ID',
                code: 'id',
              }, {
                name: '组编码',
                code: 'code',
              }, {
                name: '组名',
                code: 'name',
              }, {
                name: '描述',
                code: 'description',
              }]}
              onSearch={this.handleSearch.bind(this)}
            />
            <Table
              className="components-table-demo-nested"
              size="small"
              pagination={false}
              columns={columns}
              expandedRowRender={(record) => {
                const newRecord = record.users;
                for (let a = 0; a < newRecord.length; a += 1) {
                  newRecord[a].record = record;
                }
                window.console.log(newRecord);
                return <Table size="small" columns={columns2} dataSource={newRecord} pagination={false} />;
              }}
              dataSource={data}
            />
            <div className="pagenation">
              <RePagination
                current={this.state.currenPage}
                total={UserGroupStore.getGroupTotal}
                onChange={this.onChangePagination.bind(this)}
              />
            </div>
          </div>
        </div>
        {this.state.sideDisplay !== 'none' && <div
          id="userGroupRight"
          className="content-show"
        >
          <PageHeader title={this.renderTitle()} />
          <div className="UnderPageHeadStyle">
            {this.renderRightTab(userGroupStyle)}
          </div>
        </div> }

      </div>
    );
  }
}
export default Form.create({})(withRouter(UserGroup));
