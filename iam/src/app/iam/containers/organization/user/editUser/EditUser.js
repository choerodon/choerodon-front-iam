import React, { Component } from 'react';
import { Checkbox, Form, Input, Select } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content } from 'Page';
import CreateUserStore from '../../../../stores/organization/user/createUser/CreateUserStore';

const FormItem = Form.Item;
const Option = Select.Option;

function noop() {
}

@inject('AppState')
@observer
class EditUser extends Component {
  state = this.getInitState();

  componentWillMount() {
    this.props.onRef(this);
    this.fetch(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      nextProps.form.resetFields();
      this.setState(this.getInitState());
    } else if (!this.props.visible) {
      this.fetch(nextProps);
    }
  }

  getInitState() {
    return {
      rePasswordDirty: false,
      userInfo: {
        id: '',
        loginName: '',
        realName: '',
        email: '',
        language: 'zh_CN',
        objectVersionNumber: '',
      },
    };
  }

  getUserInfoById(organizationId, id) {
    CreateUserStore.getUserInfoById(organizationId, id)
      .then((data) => {
        this.setState({
          userInfo: data,
        });
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  loadOrganizationById(id) {
    CreateUserStore.loadOrganizationById(id)
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  loadPasswordPolicyById(id) {
    CreateUserStore.loadPasswordPolicyById(id)
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  fetch(props) {
    const { AppState, edit, id } = props;
    const { id: organizationId } = AppState.currentMenuType;
    if (edit) {
      this.getUserInfoById(organizationId, id);
    }
    this.loadOrganizationById(organizationId);
    this.loadPasswordPolicyById(organizationId);
  }

  checkUsername = (rule, username, callback) => {
    const { edit, AppState } = this.props;
    if (!edit || username !== this.state.userInfo.loginName) {
      if (/\s/.test(username)) {
        callback(Choerodon.getMessage('输入存在空格，请检查', 'input Spaces, please check'));
        return;
      }
      const id = AppState.currentMenuType.id;
      CreateUserStore.checkUsername(id, username).then(({ failed }) => {
        if (failed) {
          callback(Choerodon.getMessage('已存在该登录名，请输入其他登录名', 'User name already exists'));
        } else {
          callback();
        }
      });
    } else {
      callback();
    }
  };

  // validateToPassword = (rule, value, callback) => {
  //   const passwordPolicy = CreateUserStore.getPasswordPolicy;
  //   if(value && passwordPolicy && passwordPolicy.not)
  // }

  // 分别验证密码的最小长度，特殊字符和大写字母的情况和密码策略进行比对
  checkPassword = (rule, value, callback) => {
    const passwordPolicy = CreateUserStore.getPasswordPolicy;
    const form = this.props.form;
    if (value && passwordPolicy && passwordPolicy.originalPassword !== value) {
      // const userName = this.state.userInfo.loginName;
      const userName = form.getFieldValue('loginName');
      Choerodon.checkPassword(passwordPolicy, value, callback, userName);
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    const { originalPassword } = CreateUserStore.getPasswordPolicy || {};
    if (value && (this.state.rePasswordDirty || originalPassword)) {
      form.validateFields(['rePassword'], { force: true });
    }
    callback();
  };

  handleRePasswordBlur = (e) => {
    const value = e.target.value;
    this.setState({ rePasswordDirty: this.state.rePasswordDirty || !!value });
  };

  checkRepassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(Choerodon.getMessage('两次密码输入不一致', 'passwords do not match'));
    } else {
      callback();
    }
  };

  checkEmailAddress = (rule, value, callback) => {
    const { edit, AppState } = this.props;
    if (!edit || value !== this.state.userInfo.email) {
      const id = AppState.currentMenuType.id;
      CreateUserStore.checkEmailAddress(id, value).then(({ failed }) => {
        if (failed) {
          callback(Choerodon.getMessage('该邮箱已被使用，请输入其他邮箱', 'Email is already exists'));
        } else {
          callback();
        }
      });
    } else {
      callback();
    }
  };

  // 验证用户的额外信息是json格式的数据
  handleChangeAddInfo = (rule, value, callback) => {
    const data = value;
    let obj = '';
    if (data) {
      try {
        obj = JSON.parse(data);
        this.setState({ addInfoRequired: undefined });
      } catch (err) {
        callback(Choerodon.getMessage('请输入 json 格式的数据', 'input json data'));
      }
      if (typeof obj === 'object' && !(obj instanceof Array)) {
        let hasProp = false;
        const len = Object.keys(obj);
        if (len) {
          hasProp = true;
        }
        if (hasProp) {
          callback();
        } else {
          callback(Choerodon.getMessage('请输入 json 格式的数据', 'input json data'));
        }
      } else if (typeof obj === 'number' && typeof obj === 'string' && obj instanceof Array) {
        callback(Choerodon.getMessage('请输入 json 格式的数据', 'input json data'));
      } else {
        callback(Choerodon.getMessage('请输入 json 格式的数据', 'input json data'));
      }
    } else {
      callback();
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const { AppState, edit, onSubmit = noop } = this.props;
        const menuType = AppState.currentMenuType;
        const organizationId = menuType.id;
        if (edit) {
          const { id, objectVersionNumber } = this.state.userInfo;
          CreateUserStore.updateUser(organizationId, id, {
            ...data,
            objectVersionNumber,
          }).then(({ failed, message }) => {
            if (failed) {
              Choerodon.prompt(message);
            } else {
              Choerodon.prompt(Choerodon.getMessage('修改成功', 'Success'));
              onSubmit();
            }
          }).catch((error) => {
            Choerodon.handleResponseError(error);
          });
        } else {
          CreateUserStore.createUser(data, organizationId).then(({ failed, message }) => {
            if (failed) {
              Choerodon.prompt(message);
            } else {
              Choerodon.prompt(Choerodon.getMessage('创建成功', 'Success'));
              onSubmit();
            }
          }).catch((error) => {
            Choerodon.handleResponseError(error);
          });
        }
      }
    });
  };

  render() {
    const { AppState, edit } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationName = menuType.name;
    const { getFieldDecorator } = this.props.form;
    const { userInfo } = this.state;
    const { originalPassword, enablePassword } = CreateUserStore.getPasswordPolicy || {};
    const inputWidth = 512; // input框的长度
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

    return (
      <Content
        style={{ padding: 0 }}
        title={edit ? `对用户“${userInfo.loginName}”进行修改` : `在组织“${organizationName}”中创建用户`}
        description={
          edit ? '您可以在此修改用户名、邮箱、语言、时区。' : '用户是全平台唯一的。您创建的用户只属于这个组织，但在平台的其他组织中能被分配角色。'
        }
        link="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/user/"
      >
        <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('loginName', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: Choerodon.getMessage('请输入登录名', 'The field is required'),
                },
                {
                  validator: this.checkUsername,
                },
                // {
                //   validator: this.validateToPassword,
                // },
              ],
              validateTrigger: 'onBlur',
              initialValue: userInfo.loginName,
              validateFirst: true,
            })(
              <Input
                label={Choerodon.getMessage('登录名', 'user loginName')}
                placeholder={Choerodon.getMessage('登录名', 'user loginName')}
                disabled={edit}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {
              getFieldDecorator('realName', {
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: Choerodon.getMessage('请输入用户名', 'The field is required'),
                  },
                ],
                initialValue: userInfo.realName,
                validateTrigger: 'onBlur',
              })(
                <Input
                  label={Choerodon.getMessage('用户名', 'user name')}
                  type="text"
                  rows={1}
                  placeholder={Choerodon.getMessage('用户名', 'user name')}
                  style={{ width: inputWidth }}
                />,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('email', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: Choerodon.getMessage('请输入邮箱', 'The field is required'),
                },
                {
                  type: 'email',
                  message: Choerodon.getMessage('请输入正确的邮箱', 'Please enter the correct email format'),
                },
                {
                  validator: this.checkEmailAddress,
                },
              ],
              validateTrigger: 'onBlur',
              initialValue: userInfo.email,
              validateFirst: true,
            })(
              <Input
                label={Choerodon.getMessage('邮箱', 'user email')}
                placeholder={Choerodon.getMessage('邮箱', 'user email')}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          {!edit && (
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: Choerodon.getMessage('请输入密码', 'The field is required'),
                  },
                  {
                    validator: this.checkPassword,
                  },
                  {
                    validator: this.validateToNextPassword,
                  },
                ],
                initialValue: enablePassword ? originalPassword : undefined,
                validateFirst: true,
              })(
                <Input
                  label={Choerodon.getMessage('密码', 'user password')}
                  type="password"
                  placeholder={Choerodon.getMessage('密码', 'user password')}
                  style={{ width: inputWidth }}
                />,
              )}
            </FormItem>
          )}
          {!edit && (
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('rePassword', {
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: Choerodon.getMessage('请确认密码', 'The field is required'),
                  }, {
                    validator: this.checkRepassword,
                  }],
                initialValue: enablePassword ? originalPassword : undefined,
                validateFirst: true,
              })(
                <Input
                  label={Choerodon.getMessage('确认密码', 'password confirm')}
                  type="password"
                  placeholder={Choerodon.getMessage('确认密码', 'password confirm')}
                  style={{ width: inputWidth }}
                  onBlur={this.handleRePasswordBlur}
                />,
              )}
            </FormItem>
          )}
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('language', {
              initialValue: this.state.userInfo.language,
            })(
              <Select label={Choerodon.getMessage('语言', 'user language')} style={{ width: inputWidth }}>
                <Option value="zh_CN">简体中文</Option>
                <Option value="en_US">English</Option>
              </Select>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={Choerodon.getMessage('时区', 'Timezone')}
          >
            {getFieldDecorator('timeZone', {
              initialValue: 'CTT',
            })(
              <Select label={Choerodon.getMessage('时区', 'Timezone')} style={{ width: inputWidth }}>
                <Option value="CTT">中国</Option>
                <Option value="EST">America</Option>
              </Select>,
            )}
          </FormItem>
        </Form>
      </Content>
    );
  }
}

export default Form.create({})(withRouter(EditUser));
