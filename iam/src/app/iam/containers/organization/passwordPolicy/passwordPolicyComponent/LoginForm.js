import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Input, Select, Radio } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import passwordPolicyStore from '../../../../stores/organization/passwordPolicy';
import './PasswordForm.scss';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const inputPrefix = 'organization.pwdpolicy';

@inject('AppState')
@observer
class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockStatus: false,
      codeStatus: false,
    };
  }

  componentWillMount() {
    const passwordPolicy = passwordPolicyStore.getPasswordPolicy;
    const codeStatus = passwordPolicy && passwordPolicy.enableCaptcha ? 'enableCode' : 'disableCode';
    const lockStatus = passwordPolicy && passwordPolicy.enableLock ? 'enableLock' : 'disableLock';
    this.setState({
      codeStatus,
      lockStatus,
    });
  }
  changeLockStatus(e) {
    this.setState({
      lockStatus: e.target.value,
    });
  }

  changeCodeStatus(e) {
    this.setState({
      codeStatus: e.target.value,
    });
  }

  render() {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const passwordPolicy = passwordPolicyStore.getPasswordPolicy;
    const ableStatus = passwordPolicy && passwordPolicy.enableSecurity ? 'enabled' : 'disabled';
    const formItemNumLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    };
    return (
      <div>
        <FormItem
          {...formItemNumLayout}
        >
          {getFieldDecorator('enableSecurity', {
            initialValue: ableStatus,
          })(
            <RadioGroup label={<FormattedMessage id={`${inputPrefix}.enabled.security`}/>} className="radioGroup">
              <Radio value={'enabled'}><FormattedMessage id="yes"/></Radio>
              <Radio value={'disabled'}><FormattedMessage id="no"/></Radio>
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
              label={<FormattedMessage id={`${inputPrefix}.enabled.captcha`}/>}
              className="radioGroup"
              onChange={this.changeCodeStatus.bind(this)}
            >
              <Radio value={'enableCode'}><FormattedMessage id="yes"/></Radio>
              <Radio value={'disableCode'}><FormattedMessage id="no"/></Radio>
            </RadioGroup>,
          )}
        </FormItem>
        {
          this.state.codeStatus === 'enableCode' ? (
            <FormItem
            >
              {getFieldDecorator('maxCheckCaptcha', {
                rules: [{
                  pattern: /^([1-9]\d*|[0]{1,1})$/,
                  message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
                }],
                initialValue: passwordPolicy ? passwordPolicy.maxCheckCaptcha : undefined,
              })(
                <Input
                  autocomplete="off"
                  type="number"
                  label={<FormattedMessage id={`${inputPrefix}.maxerror.count`}/>}
                  style={{ width: 300 }}
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
              label={<FormattedMessage id={`${inputPrefix}.enabled.lock`}/>}
              className="radioGroup"
              onChange={this.changeLockStatus.bind(this)}
            >
              <Radio value={'enableLock'}><FormattedMessage id="yes"/></Radio>
              <Radio value={'disableLock'}><FormattedMessage id="no"/></Radio>
            </RadioGroup>,
          )}
        </FormItem>
        {this.state.lockStatus === 'enableLock' ? (
          <div>
            <FormItem
            >
              {getFieldDecorator('maxErrorTime', {
                rules: [{
                  pattern: /^([1-9]\d*|[0]{1,1})$/,
                  message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
                }],
                initialValue: passwordPolicy ? passwordPolicy.maxErrorTime : undefined,
              })(
                <Input
                  autocomplete="off"
                  type="number"
                  label={<FormattedMessage id={`${inputPrefix}.maxerror.count`}/>}
                  style={{ width: 300 }}
                />,
              )}
            </FormItem>
            {/* <FormItem
                label="锁定时长"
              >
                {getFieldDecorator('lockedExpireTime', {
                  initialValue: passwordPolicy ? passwordPolicy.lockedExpireTime : '',
                })(
                  <div>
                    <Input type="number" label="锁定时长" style={{ width: 300 }} />
                    <Select style={{ width: 194, marginLeft: 18 }}>
                      <Option value="second">秒</Option>
                      <Option value="minute">分</Option>
                      <Option value="hour">时</Option>
                      <Option value="month">月</Option>
                      <Option value="year">年</Option>
                    </Select>
                  </div>,
                )}
              </FormItem> */}
          </div>
        ) : ''}
      </div>
    );
  }
}

export default injectIntl(LoginForm);
