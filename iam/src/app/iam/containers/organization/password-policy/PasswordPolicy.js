import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Input, Radio, InputNumber } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import PasswordPolicyStore from '../../../stores/organization/password-policy/index';
import LoadingBar from '../../../components/loadingBar/index';
import './PasswordPolicy.scss';

const inputPrefix = 'organization.pwdpolicy';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const formItemNumLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 9 },
  },
};

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class PasswordPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showPwd: true, // 是否显示密码安全策略
      showLogin: true, // 是否显示登录安全策略
      lockStatus: false, // 登录安全策略是否开启锁定
      codeStatus: false, // 登录安全策略是否开启验证码
      submitting: false,
      organizationId: this.props.AppState.currentMenuType.id,
    };
  }

  componentDidMount() {
    this.loadData();
  }


  /**
   * 显示面板
   * @param policy showPwd/showLogin
   */
  isShowPanel = (policy) => {
    this.setState((prevState, props) => ({
      [policy]: !prevState[policy],
    }));
  }

  /**
   * 验证码和锁定的切换事件
   * @param status codeStatus/lockStatus
   * @param e
   */
  changeStatus = (status, e) => {
    const { setFieldsValue } = this.props.form;
    this.setState({
      [status]: e.target.value,
    }, () => {
      if (status === 'codeStatus' && e.target.value === 'disableCode') {
        setFieldsValue({ maxCheckCaptcha: 0 });
      }

      if (status === 'enableLock' && e.target.value === 'disableLock') {
        setFieldsValue({ lockedExpireTime: 0, maxErrorTime: 0 });
      }
    });
  }

  /**
   * inputNumber失焦事件
   * @param fieldName form控件名称
   * @param e
   */
  inputNumBlur = (fieldName, e) => {
    const { setFieldsValue } = this.props.form;
    if (!e.target.value) {
      setFieldsValue({
        [fieldName]: 0,
      });
    }
  }

  /**
   * 刷新函数
   */
  reload = () => {
    this.loadData();
  };

  /**
   * 加载当前组织密码策略
   */
  loadData() {
    const { organizationId } = this.state;
    const { setFieldsValue } = this.props.form;
    this.setState({
      loading: true,
    });
    PasswordPolicyStore.loadData(organizationId)
      .then((data) => {
        if (data.failed) {
          Choerodon.prompt(data.message);
        } else {
          PasswordPolicyStore.setPasswordPolicy(data);
          const codeStatus = data.enableCaptcha ? 'enableCode' : 'disableCode'; // 登录安全策略是否开启验证码
          const lockStatus = data.enableLock ? 'enableLock' : 'disableLock'; // 登录安全策略是否开启锁定
          this.setState({
            loading: false,
            codeStatus,
            lockStatus,
          });
        }
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
        this.setState({
          loading: false,
        });
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { AppState, intl } = this.props;
    this.props.form.validateFieldsAndScroll((err, datas, modify) => {
      if (!err) {
        // if(!modify) {
        //   Choerodon.prompt(intl.formatMessage({id: 'save.success'}));
        //   return;
        // }
        const value = Object.assign({}, PasswordPolicyStore.getPasswordPolicy, datas);
        const newValue = {
          ...value,
          id: PasswordPolicyStore.getPasswordPolicy.id,
          objectVersionNumber: PasswordPolicyStore.getPasswordPolicy.objectVersionNumber,
          enablePassword: value.enablePassword === 'enablePwd',
          notUsername: value.notUsername === 'different',
          enableSecurity: value.enableSecurity === true || value.enableSecurity === 'enabled',
          enableCaptcha: value.enableCaptcha === true || value.enableCaptcha === 'enableCode',
          enableLock: value.enableLock === true || value.enableLock === 'enableLock',
        };
        this.setState({
          submitting: true,
          showPwd: true,
          showLogin: true,
        });
        PasswordPolicyStore.updatePasswordPolicy(
          AppState.currentMenuType.id, newValue.id, newValue)
          .then((data) => {
            this.setState({ submitting: false });
            Choerodon.prompt(intl.formatMessage({ id: 'save.success' }));
            PasswordPolicyStore.setPasswordPolicy(data);
            this.loadData();
          })
          .catch((error) => {
            this.setState({ submitting: false });
            Choerodon.handleResponseError(error);
          });
      }
    });
  };

  render() {
    const { AppState, form: { getFieldDecorator }, intl } = this.props;
    const { loading, submitting, showPwd, showLogin } = this.state;
    const inputWidth = '512px';
    const passwordPolicy = PasswordPolicyStore.passwordPolicy;
    const pwdStatus = passwordPolicy && passwordPolicy.enablePassword ? 'enablePwd' : 'disablePwd'; // 密码安全策略是否启用
    const sameStatus = passwordPolicy && passwordPolicy.notUsername ? 'different' : 'same'; // 密码安全策略是否允许与登录名相同
    const ableStatus = passwordPolicy && passwordPolicy.enableSecurity ? 'enabled' : 'disabled'; // 登录安全策略是否启用
    const mainContent = loading ? <LoadingBar /> : (<div>
      <div className="foldTitle">
        <Button
          shape="circle"
          funcType="raised"
          icon={showPwd ? 'expand_more' : 'expand_less'}
          size="small"
          style={{ float: 'left' }}
          onClick={this.isShowPanel.bind(this, 'showPwd')}
        />
        <FormattedMessage id={`${inputPrefix}.password`} />
      </div>
      <Form onSubmit={this.handleSubmit} layout="vertical" className="PwdPolicyForm">
        <div style={{ display: showPwd ? 'block' : 'none' }}>
          <FormItem
            {...formItemNumLayout}
          >
            {getFieldDecorator('enablePassword', {
              initialValue: pwdStatus,
            })(
              <RadioGroup label={<FormattedMessage id={`${inputPrefix}.enabled.password`} />} className="radioGroup">
                <Radio value={'enablePwd'}><FormattedMessage id="yes" /></Radio>
                <Radio value={'disablePwd'}><FormattedMessage id="no" /></Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem
            {...formItemNumLayout}
          >
            {getFieldDecorator('notUsername', {
              initialValue: sameStatus,
            })(
              <RadioGroup label={<FormattedMessage id={`${inputPrefix}.notusername`} />} className="radioGroup">
                <Radio value={'same'}><FormattedMessage id="yes" /></Radio>
                <Radio value={'different'}><FormattedMessage id="no" /></Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('originalPassword', {
                rules: [{}],
                initialValue: passwordPolicy ? passwordPolicy.originalPassword : '',
              })(
                <Input
                  autoComplete="off"
                  label={<FormattedMessage id={`${inputPrefix}.originalpassword`} />}
                  style={{ width: inputWidth }}
                />,
              )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('minLength', {
              rules: [
                {
                  pattern: /^([1-9]\d*|[0]{1,1})$/,
                  type: 'number',
                  message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
                },
              ],
              initialValue: passwordPolicy ? passwordPolicy.minLength : '',
            })(
              <InputNumber
                onBlur={this.inputNumBlur.bind(this, 'minLength')}
                autoComplete="off"
                min={0}
                label={<FormattedMessage id={`${inputPrefix}.minlength`} />}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('maxLength', {
              rules: [{
                pattern: /^([1-9]\d*|[0]{1,1})$/,
                type: 'number',
                message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
              }],
              initialValue: passwordPolicy ? passwordPolicy.maxLength : '',
            })(
              <InputNumber
                onBlur={this.inputNumBlur.bind(this, 'maxLength')}
                autoComplete="off"
                min={0}
                label={<FormattedMessage id={`${inputPrefix}.maxlength`} />}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('digitsCount', {
              rules: [{
                pattern: /^([1-9]\d*|[0]{1,1})$/,
                type: 'number',
                message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
              }],
              initialValue: passwordPolicy ? passwordPolicy.digitsCount : '',
            })(
              <InputNumber
                onBlur={this.inputNumBlur.bind(this, 'digitsCount')}
                autoComplete="off"
                min={0}
                label={<FormattedMessage id={`${inputPrefix}.digitscount`} />}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('lowercaseCount', {
              rules: [{
                pattern: /^([1-9]\d*|[0]{1,1})$/,
                type: 'number',
                message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
              }],
              initialValue: passwordPolicy ? passwordPolicy.lowercaseCount : '',
            })(
              <InputNumber
                onBlur={this.inputNumBlur.bind(this, 'lowercaseCount')}
                autoComplete="off"
                min={0}
                label={<FormattedMessage id={`${inputPrefix}.lowercasecount`} />}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('uppercaseCount', {
              rules: [{
                pattern: /^([1-9]\d*|[0]{1,1})$/,
                type: 'number',
                message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
              }],
              initialValue: passwordPolicy ? passwordPolicy.uppercaseCount : '',
            })(
              <InputNumber
                onBlur={this.inputNumBlur.bind(this, 'uppercaseCount')}
                autoComplete="off"
                min={0}
                label={<FormattedMessage id={`${inputPrefix}.uppercasecount`} />}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('specialCharCount', {
              rules: [{
                pattern: /^([1-9]\d*|[0]{1,1})$/,
                type: 'number',
                message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
              }],
              initialValue: passwordPolicy ? passwordPolicy.specialCharCount : '',
            })(
              <InputNumber
                onBlur={this.inputNumBlur.bind(this, 'specialCharCount')}
                autoComplete="off"
                min={0}
                label={<FormattedMessage id={`${inputPrefix}.specialcharcount`} />}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('notRecentCount', {
              rules: [{
                pattern: /^([1-9]\d*|[0]{1,1})$/,
                type: 'number',
                message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
              }],
              initialValue: passwordPolicy ? passwordPolicy.notRecentCount : '',
            })(
              <InputNumber
                onBlur={this.inputNumBlur.bind(this, 'notRecentCount')}
                autoComplete="off"
                min={0}
                label={<FormattedMessage id={`${inputPrefix}.notrecentcount`} />}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem style={{ width: inputWidth }}>
            {getFieldDecorator('regularExpression', {
              initialValue: passwordPolicy ? passwordPolicy.regularExpression : '',
            })(
              <TextArea
                autoComplete="off"
                rows={2}
                label={<FormattedMessage id={`${inputPrefix}.regularexpression`} />}
              />,
            )}
          </FormItem>
        </div>
        <div className="foldTitle">
          <Button
            shape="circle"
            funcType="raised"
            icon={showLogin ? 'expand_more' : 'expand_less'}
            size="small"
            style={{ float: 'left' }}
            onClick={this.isShowPanel.bind(this, 'showLogin')}
          />
          <FormattedMessage id={`${inputPrefix}.login`} />
        </div>
        <div style={{ display: showLogin ? 'block' : 'none' }}>
          <FormItem
            {...formItemNumLayout}
          >
            {getFieldDecorator('enableSecurity', {
              initialValue: ableStatus,
            })(
              <RadioGroup label={<FormattedMessage id={`${inputPrefix}.enabled.security`} />} className="radioGroup">
                <Radio value={'enabled'}><FormattedMessage id="yes" /></Radio>
                <Radio value={'disabled'}><FormattedMessage id="no" /></Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem
            {...formItemNumLayout}
          >
            {getFieldDecorator('enableCaptcha', {
              initialValue: this.state.codeStatus,
            })(
              <RadioGroup
                label={<FormattedMessage id={`${inputPrefix}.enabled.captcha`} />}
                className="radioGroup"
                onChange={this.changeStatus.bind(this, 'codeStatus')}
              >
                <Radio value={'enableCode'}><FormattedMessage id="yes" /></Radio>
                <Radio value={'disableCode'}><FormattedMessage id="no" /></Radio>
              </RadioGroup>,
            )}
          </FormItem>
          {
            this.state.codeStatus === 'enableCode' ? (
              <FormItem>
                {getFieldDecorator('maxCheckCaptcha', {
                  rules: [{
                    pattern: /^([1-9]\d*|[0]{1,1})$/,
                    type: 'number',
                    message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
                  }],
                  initialValue: passwordPolicy && passwordPolicy.enableCaptcha ?
                    passwordPolicy.maxCheckCaptcha : 3,
                })(
                  <InputNumber
                    onBlur={this.inputNumBlur.bind(this, 'maxCheckCaptcha')}
                    autoComplete="off"
                    min={0}
                    label={<FormattedMessage id={`${inputPrefix}.maxerror.count`} />}
                    style={{ width: inputWidth }}
                  />,
                )}
              </FormItem>
            ) : ''
          }
          <FormItem
            {...formItemNumLayout}
          >
            {getFieldDecorator('enableLock', {
              initialValue: this.state.lockStatus,
            })(
              <RadioGroup
                label={<FormattedMessage id={`${inputPrefix}.enabled.lock`} />}
                className="radioGroup"
                onChange={this.changeStatus.bind(this, 'lockStatus')}
              >
                <Radio value={'enableLock'}><FormattedMessage id="yes" /></Radio>
                <Radio value={'disableLock'}><FormattedMessage id="no" /></Radio>
              </RadioGroup>,
            )}
          </FormItem>
          {this.state.lockStatus === 'enableLock' ? (
            <div>
              <FormItem>
                {getFieldDecorator('maxErrorTime', {
                  rules: [{
                    pattern: /^[1-9]\d*|0$/,
                    type: 'number',
                    message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
                  }],
                  initialValue: passwordPolicy && passwordPolicy.enableLock ?
                    passwordPolicy.maxErrorTime : 5,
                })(
                  <InputNumber
                    onBlur={this.inputNumBlur.bind(this, 'maxErrorTime')}
                    autoComplete="off"
                    min={0}
                    label={<FormattedMessage id={`${inputPrefix}.maxerror.count`} />}
                    style={{ width: inputWidth }}
                  />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('lockedExpireTime', {
                  rules: [{
                    pattern: /^[1-9]\d*|0$/,
                    type: 'number',
                    message: intl.formatMessage({ id: `${inputPrefix}.number.pattern.msg` }),
                  }],
                  initialValue: passwordPolicy && passwordPolicy.enableLock ?
                    passwordPolicy.lockedExpireTime : 3600,
                })(
                  <InputNumber
                    onBlur={this.inputNumBlur.bind(this, 'lockedExpireTime')}
                    autoComplete="off"
                    min={0}
                    label={<FormattedMessage id={`${inputPrefix}.locktime`} />}
                    style={{ width: '490px' }}
                  />,
                )}
                <span style={{ position: 'absolute', bottom: '-10px', right: '-20px' }}>
                  {intl.formatMessage({ id: 'second' })}
                </span>
              </FormItem>
            </div>
          ) : ''}
        </div>
        <div className="btnGroup">
          <hr className="divider" />
          <Permission service={['iam-service.password-policy.update']}>
            <Button
              funcType="raised"
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              <FormattedMessage id="save" />
            </Button>
          </Permission>
          <Button
            funcType="raised"
            onClick={() => {
              const { resetFields } = this.props.form;
              resetFields();
            }}
            disabled={submitting}
            style={{ color: '#3F51B5' }}
          >
            <FormattedMessage id="cancel" />
          </Button>
        </div>
      </Form>
    </div>)
    return (
      <Page
        className="PasswordPolicy"
        service={[
          'iam-service.password-policy.update',
          'iam-service.password-policy.queryByOrganizationId',
        ]}
      >
        <Header title={<FormattedMessage id={`${inputPrefix}.header.title`} />}>
          <Button
            onClick={this.reload}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={inputPrefix}
          values={{ name: AppState.currentMenuType.name }}
        >
          <div className="policyContainer">
            {mainContent}
          </div>
        </Content>
      </Page>
    );
  }
}
