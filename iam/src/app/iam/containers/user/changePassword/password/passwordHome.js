/*eslint-disable*/
import React, { Component } from 'react';
import { Checkbox, Form, Input, Button, Select, Radio, Row, Col } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import Permission from 'PerComponent';
import { observer, inject } from 'mobx-react';
import PageHeader from 'PageHeader';
import Page, { Header, Content } from 'Page';
import axios from 'Axios';
import UserInfoStore from '../../../../stores/user/userInfo/UserInfoStore';
import './password.scss';

const FormItem = Form.Item;
const Option = Select.Option;

@inject('AppState')
@observer
class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmDirty: null,
    }
  }

  componentWillMount() {
    this.loadUserInfo();
  }

  loadUserInfo = () => {
    const { AppState } = this.props;
    const userId = AppState.getUserId;
    UserInfoStore.setIsLoading(true);
    UserInfoStore.loadUserInfo(userId)
      .then((data) => {
        UserInfoStore.setIsLoading(false);
        UserInfoStore.setUserInfo(data);
      })
      .catch(error => Choerodon.handleResponseError(error));
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback(Choerodon.getMessage('两次密码输入不一致', 'Two passwords that you enter is inconsistent'));
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  handleSubmit = (e) => {
    const { getFieldValue, setFields } = this.props.form;
    const user = UserInfoStore.getUserInfo;
    const body = {
      "originalPassword": getFieldValue("oldpassword"),
      "password": getFieldValue("confirm")
    }
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios.put(`/iam/v1/users/${user.id}/password`, JSON.stringify(body))
          .then((value) => {
            if (value.message !== "原始密码错误") {
              Choerodon.logout();
            } else {
              Choerodon.prompt(value.message);
            }
          }).catch(err => {
            if (err.response) {
              const status = err.response.status;
              const mess = err.response.data.message;
              switch (status) {
                case 400:
                  Choerodon.prompt(mess);
                  break;
                default:
                  break;
              }
            }
          });
      }
    });
  }

  reload = () => {
    const { resetFields } = this.props.form;
    resetFields();
  }

  render() {
    const { AppState } = this.props;
    const { getFieldDecorator } = this.props.form;
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
    const user = UserInfoStore.getUserInfo;
    return (
      <Page>
        <Header title={"修改密码"}>
          <Button onClick={this.reload} icon="refresh">
            {Choerodon.getMessage('刷新', 'flush')}
          </Button>
        </Header>
        <Content
          title={`对用户“${user.realName}”密码进行修改`}
          description={(<div>
            您可以在此修改您的密码
            <a href="http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/person/secret_change/">
              了解详情
            </a>
            <span className="icon-open_in_new" />
          </div>)}>
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
                })(
                  <Input label="原密码" type="password" style={{ width: "512px" }} />
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
                })(
                  <Input label="新密码" type="password" style={{ width: "512px" }} />
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
                })(
                  <Input label="确认密码" type="password" style={{ width: "512px" }} onBlur={this.handleConfirmBlur} />
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
                      >保存</Button>
                      <Button
                        text={Choerodon.languageChange('save')}
                        funcType="raised"
                        onClick={this.reload}
                        style={{ marginLeft: 16 }}
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
