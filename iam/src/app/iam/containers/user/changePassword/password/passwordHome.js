/*eslint-disable*/
import React, { Component } from 'react';
import { Button, Checkbox, Col, Form, Input, Radio, Row, Select } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import UserInfoStore from '../../../../stores/user/userInfo/UserInfoStore';
import './password.scss';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 9 },
  },
};

const inputWidth = 512;

@inject('AppState')
@observer
class ChangePassword extends Component {
  state = {
    submitting: false,
    confirmDirty: null,
  };

  componentWillMount() {
    this.loadUserInfo();
  }

  loadUserInfo = () => {
    UserInfoStore.setUserInfo(this.props.AppState.getUserInfo);
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(Choerodon.getMessage('两次密码输入不一致', 'Two passwords that you enter is inconsistent'));
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  handleSubmit = (e) => {
    const { getFieldValue, setFields } = this.props.form;
    const user = UserInfoStore.getUserInfo;
    const body = {
      'originalPassword': getFieldValue('oldpassword'),
      'password': getFieldValue('confirm'),
    };
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ submitting: true });
        UserInfoStore.updatePassword(user.id, body)
          .then(({ failed, message }) => {
            this.setState({ submitting: false });
            if (failed) {
              Choerodon.prompt(message);
            } else {
              Choerodon.logout();
            }
          })
          .catch((error) => {
            this.setState({ submitting: false });
            Choerodon.handleResponseError(error);
          });
      }
    });
  };

  reload = () => {
    const { resetFields } = this.props.form;
    resetFields();
  };

  render() {
    const { AppState } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { submitting } = this.state;
    const user = UserInfoStore.getUserInfo;
    return (
      <Page
        service={[
          'iam-service.user.selfUpdatePassword',
        ]}
      >
        <Header title={'修改密码'}>
          <Button onClick={this.reload} icon="refresh">
            {Choerodon.getMessage('刷新', 'flush')}
          </Button>
        </Header>
        <Content
          title={`对用户“${user.realName}”密码进行修改`}
          description="非LDAP用户可以修改自己的登录密码。"
          link="http://v0-6.choerodon.io/zh/docs/user-guide/system-configuration/person/secret_change/"
        >
          <div className="ldapContainer">
            <Form onSubmit={this.handleSubmit} layout="vertical">
              <FormItem
                {...formItemLayout}
                label="原密码"
              >
                {getFieldDecorator('oldpassword', {
                  rules: [{
                    required: true, message: Choerodon.getMessage('请输入原密码', 'Please input your old password!'),
                  }, {
                    validator: this.validateToNextPassword,
                  }],
                  validateTrigger: 'onBlur',
                })(
                  <Input autocomplete="off" label="原密码" type="password" style={{ width: inputWidth }} />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="新密码"
              >
                {getFieldDecorator('password', {
                  rules: [{
                    required: true, message: Choerodon.getMessage('请输入新密码', 'Please input your new password!'),
                  }, {
                    validator: this.validateToNextPassword,
                  }],
                  validateTrigger: 'onBlur',
                  validateFirst: true,
                })(
                  <Input autocomplete="off" label="新密码" type="password" style={{ width: inputWidth }} />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="确认新密码"
              >
                {getFieldDecorator('confirm', {
                  rules: [{
                    required: true, message: Choerodon.getMessage('请确认密码', 'Please confirm your password!'),
                  }, {
                    validator: this.compareToFirstPassword,
                  }],
                  validateTrigger: 'onBlur',
                  validateFirst: true,
                })(
                  <Input autocomplete="off" label="确认密码" type="password" style={{ width: inputWidth }} onBlur={this.handleConfirmBlur} />,
                )}
              </FormItem>
              <FormItem>
                <Permission service={['iam-service.user.selfUpdatePassword']} type={'site'}>
                  <Row>
                    <hr className='hrLine' />
                    <Col span={5} style={{ marginRight: 16 }}>
                      <Button
                        text={Choerodon.languageChange('save')}
                        funcType="raised"
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                      >保存</Button>
                      <Button
                        text={Choerodon.languageChange('save')}
                        funcType="raised"
                        onClick={this.reload}
                        style={{ marginLeft: 16 }}
                        disabled={submitting}
                      >取消</Button>
                    </Col>
                  </Row>
                </Permission>
              </FormItem>
            </Form>
          </div>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(ChangePassword));
