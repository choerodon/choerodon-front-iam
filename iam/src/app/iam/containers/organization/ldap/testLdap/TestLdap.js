import React, { Component } from 'react';
import { Checkbox, Form, Input, Select, Icon } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content } from 'choerodon-front-boot';
import TestLoading from '../ldapHome/testLoading';
import SyncLoading from '../ldapHome/syncLoading';
import './TestLdap.scss';
import LDAPStore from '../../../../stores/organization/ldap/LDAPStore';

const FormItem = Form.Item;
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

@inject('AppState')
@observer
class TestConnect extends Component {
  state = this.getInitState();

  componentWillMount() {
    this.props.onRef(this);
  }

  getInitState() {
    return {
      organizationId: this.props.AppState.currentMenuType.id,
    };
  }

  getTestResult() {
    const { showWhich } = this.props;
    const testData = LDAPStore.getTestData;
    const ldapData = LDAPStore.getLDAPData;
    const adminAccount = LDAPStore.getLDAPData.account;
    const adminPassword = LDAPStore.getLDAPData.password;
    const adminStatus = adminAccount && adminPassword;
    return (
      <div>
        <p className="testTitle">测试结果</p>
        <div className="resultContainer">
          <div className="resultInfo">
            <div>
              <Icon type={testData.canLogin ? 'check_circle' : 'cancel'} className={testData.canLogin ? 'successIcon' : 'failedIcon'} />
              <span>LDAP登录：</span><span>{testData.canLogin ? '成功' : '失败'}</span>
            </div>
            <div>
              <Icon type={testData.canConnectServer ? 'check_circle' : 'cancel'} className={testData.canConnectServer ? 'successIcon' : 'failedIcon'} />
              <span>基础连接：</span><span>{testData.canConnectServer ? '成功' : '失败'}</span>
            </div>
            <div>
              <Icon type={testData.matchAttribute ? 'check_circle' : 'cancel'} className={testData.matchAttribute ? 'successIcon' : 'failedIcon'} />
              <span>用户属性连接：</span><span>{testData.matchAttribute ? '成功' : '失败'}</span>
            </div>
            <ul className="info">
              <li style={{ display: ldapData.loginNameField ? 'inline' : 'none' }} className={ldapData.loginNameField === testData.loginNameField ? 'toRed' : ''}><span>登录名属性：</span><span>{ldapData.loginNameField}</span></li>
              <li style={{ display: ldapData.realNameField && adminStatus ? 'inline' : 'none' }} className={ldapData.realNameField === testData.realNameField ? 'toRed' : ''}><span>用户名属性：</span><span>{ldapData.realNameField}</span></li>
              <li style={{ display: ldapData.passwordField && adminStatus ? 'inline' : 'none' }} className={ldapData.passwordField === testData.passwordField ? 'toRed' : ''}><span>密码属性：</span><span>{ldapData.passwordField}</span></li>
              <li style={{ display: ldapData.phoneField && adminStatus ? 'inline' : 'none' }} className={ldapData.phoneField === testData.phoneField ? 'toRed' : ''}><span>手机号属性：</span><span>{ldapData.phoneField}</span></li>
              <li style={{ display: ldapData.emailField ? 'inline' : 'none' }} className={ldapData.emailField === testData.emailField ? 'toRed' : ''}><span>邮箱属性：</span><span>{ldapData.emailField}</span></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  getSidebarContent() {
    const { showWhich } = this.props;
    const { getFieldDecorator } = this.props.form;
    const testData = LDAPStore.getTestData;
    const ldapData = LDAPStore.getLDAPData;
    if (showWhich === 'connect') {
      return (
        <div>
          <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('ldapname', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请输入LDAP登录名',
                }],
              })(
                <Input
                  label="LDAP登录名"
                  style={{ width: inputWidth }}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('ldappwd', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请输入LDAP密码',
                }],
              })(
                <Input
                  type="password"
                  label="LDAP密码"
                  style={{ width: inputWidth }}
                />,
              )}
            </FormItem>
          </Form>
          <div style={{ width: '512px', display: LDAPStore.getIsShowResult ? 'block' : 'none' }}>
            {LDAPStore.getIsConnectLoading ? <TestLoading /> : this.getTestResult()}
          </div>
        </div>
      );
    } else if (showWhich === 'adminConnect') {
      return (
        <div style={{ width: '512px' }}>
          {LDAPStore.getIsConnectLoading ? <TestLoading /> : this.getTestResult()}
        </div>

      );
    } else {
      return (
        <div style={{ width: '512px' }}>
          <SyncLoading />
        </div>
      );
    }
  }

  handleSubmit = (e) => {
    const { AppState, showWhich } = this.props;
    e.preventDefault();
    if (showWhich === 'connect') {
      this.props.form.validateFieldsAndScroll((err, value) => {
        if (!err) {
          LDAPStore.setIsShowResult(true);
          LDAPStore.setIsConnectLoading(true);
          const ldapData = Object.assign({}, LDAPStore.getLDAPData);
          ldapData.account = value.ldapname;
          ldapData.password = value.ldappwd;
          LDAPStore.setIsConfirmLoading(true);
          LDAPStore.testConnect(this.state.organizationId, LDAPStore.getLDAPData.id, ldapData)
            .then((res) => {
              if (res) {
                LDAPStore.setTestData(res);
              }
              LDAPStore.setIsConnectLoading(false);
              LDAPStore.setIsConfirmLoading(false);
            });
        }
      });
    } else if (showWhich === 'adminConnect') {
      LDAPStore.setIsConnectLoading(true);
      LDAPStore.setIsConfirmLoading(true);
      const ldapData = LDAPStore.getLDAPData;
      LDAPStore.testConnect(this.state.organizationId, LDAPStore.getLDAPData.id, ldapData)
        .then((res) => {
          if (res) {
            LDAPStore.setTestData(res);
          }
          LDAPStore.setIsConnectLoading(false);
          LDAPStore.setIsConfirmLoading(false);
        });
    }
  }


  render() {
    const { AppState, showWhich, sidebar } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationName = menuType.name;
    const { getFieldDecorator } = this.props.form;
    let title;
    let description;
    if (showWhich === 'connect') {
      title = '测试LDAP连接';
      description = '登录您的LDAP服务器需要对您的身份进行验证。请在下面输入您在LDAP服务器中的登录名和密码。';
    } else if (showWhich === 'adminConnect') {
      title = '测试LDAP连接';
      description = '对您输入的LDAP信息进行测试。';
    } else if (showWhich === 'sync') {
      title = '同步用户';
      description = '您可以在此将LDAP服务器中的用户信息同步到平台中。';
    }
    return (
      <Content
        style={{ padding: 0 }}
        title={title}
        description={description}
        link="http://choerodon.io/zh/docs/user-guide/system-configuration/microservice-management/route/"
      >
        {this.getSidebarContent()}
      </Content>
    );
  }
}

export default Form.create({})(withRouter(TestConnect));
