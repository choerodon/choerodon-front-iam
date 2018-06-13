import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Permission from 'PerComponent';
import { Checkbox, Form, Input, InputNumber, Row, Col, Button, Tabs, Modal } from 'choerodon-ui';
import Page, { Header, Content } from 'Page';
import PasswordPolicyStore from '../../../../stores/organization/passwordPolicy';
import LoadingBar from '../../../../components/loadingBar';
import PasswordForm from '../passwordPolicyComponent/PasswordForm';
import LoginForm from '../passwordPolicyComponent/LoginForm';
import passwordPolicyStore from '../../../../stores/organization/passwordPolicy';
import './UpdatePasswordPolicy.scss';


const TabPane = Tabs.TabPane;
@inject('AppState')
@observer
class UpdatePasswordPolicy extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.state = {
      passwordPolicy: '',
      submitting: false,
      buttonClicked: false,
      organizationId: this.props.AppState.currentMenuType.id,
      enableLock: '',
      enableCaptcha: '',
      tabKey: 'pwdpolicy',
    };
  }

  componentDidMount() {
    this.loadData();
  }


  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, datas) => {
      if (!err) {
        const value = Object.assign({}, passwordPolicyStore.getPasswordPolicy, datas);
        const newValue = {
          id: passwordPolicyStore.getPasswordPolicy.id,
          enableCaptcha: value.enableCaptcha === true || value.enableCaptcha === 'enableCode',
          enableLock: value.enableLock === true || value.enableLock === 'enableLock',
          enablePassword: value.enablePassword === 'enablePwd',
          enableSecurity: value.enableSecurity === true || value.enableSecurity === 'enabled',
          lockedExpireTime: parseInt(value.lockedExpireTime, 10),
          lowercaseCount: parseInt(value.lowercaseCount, 10),
          maxCheckCaptcha: parseInt(value.maxCheckCaptcha, 10),
          maxErrorTime: parseInt(value.maxErrorTime, 10),
          maxLength: parseInt(value.maxLength, 10),
          minLength: parseInt(value.minLength, 10),
          name: value.name,
          notRecentCount: parseInt(value.notRecentCount, 10),
          notUsername: value.notUsername === 'same',
          objectVersionNumber: passwordPolicyStore.getPasswordPolicy.objectVersionNumber,
          organizationId: parseInt(value.organizationId, 10),
          originalPassword: value.originalPassword,
          regularExpression: value.regularExpression,
          specialCharCount: parseInt(value.spacing, 10),
          uppercaseCount: parseInt(value.uppercaseCount, 10),
          digitsCount: parseInt(value.digitsCount, 10),
        };
        passwordPolicyStore.updatePasswordPolicy(
          this.props.AppState.currentMenuType.id, newValue.id, newValue).then((data) => {
          Choerodon.prompt('保存成功');
          passwordPolicyStore.setPasswordPolicy(data);
        }).catch((error) => {
          Choerodon.prompt(error);
        });
      }
    });
  }

  /**
   * 刷新函数
   */
  reload = () => {
    this.loadData();
  };

  changeTab = (key) => {
    this.setState({
      tabKey: key,
    });
  };

  /**
   * 加载当前组织密码策略
   */
  loadData = () => {
    const { organizationId } = this.state;
    this.setState({
      submitting: true,
    });
    PasswordPolicyStore.loadData(organizationId)
      .then((data) => {
        PasswordPolicyStore.setPasswordPolicy(data);
        this.setState({
          enableLock: data.enableLock,
          enableCaptcha: data.enableCaptcha,
        });
        this.setState({
          submitting: false,
        });
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
        this.setState({
          submitting: false,
        });
      });
  };

  render() {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    const type = menuType.type;
    const passwordSecurity = this.state.submitting ?
      <LoadingBar /> : <PasswordForm form={this.props.form} />;
    const loginSecurity = this.state.submitting ?
      <LoadingBar /> : <LoginForm form={this.props.form} />;
    return (
      <Page className="PasswordPolicy">
        <Header title={Choerodon.languageChange('policy.title')}>
          <Button
            onClick={this.reload}
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`组织“${AppState.currentMenuType.name}“的密码策略`}
          link="http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/tenant/secret_policy/"
          description="密码策略包括密码安全策略、登录安全策略。密码安全策略是设置密码时的密码规则，登录安全策略是用户登录平台时的认证策略。选择启用并保存，策略将生效。"
        >
          <div className="policyType">
            <Form onSubmit={this.handleSubmit} style={{ width: '512px' }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.changeTab}>
                <TabPane tab="密码安全策略" key="pwdpolicy">{ passwordSecurity }</TabPane>
                <TabPane tab="登录安全策略" key="loginpolicy">{ loginSecurity }</TabPane>
              </Tabs>
              <div className="password-policy-btngroup">
                <Permission service={['iam-service.password-policy.update']} type={type} organizationId={organizationId}>
                  <Button
                    funcType="raised"
                    type="primary"
                    htmlType="submit"
                  >{Choerodon.languageChange('save')}</Button>
                </Permission>
                <Button
                  funcType="raised"
                  onClick={() => {
                    const { resetFields } = this.props.form;
                    resetFields();
                  }}
                >{Choerodon.languageChange('cancel')}
                </Button>
              </div>
            </Form>
          </div>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(UpdatePasswordPolicy));
