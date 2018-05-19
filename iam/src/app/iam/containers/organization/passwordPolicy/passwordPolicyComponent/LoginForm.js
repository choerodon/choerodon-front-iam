import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Checkbox, Form, Input, InputNumber, Row, Col, Button, Select, Radio } from 'choerodon-ui';
import passwordPolicyStore from '../../../../stores/organization/passwordPolicy';
import './PasswordForm.scss';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

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
    const { AppState } = this.props;
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
            <RadioGroup label="是否启用" className="radioGroup">
              <Radio value={'enabled'}>是</Radio>
              <Radio value={'disabled'}>否</Radio>
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
              label="是否开启验证码"
              className="radioGroup"
              onChange={this.changeCodeStatus.bind(this)}
            >
              <Radio value={'enableCode'}>是</Radio>
              <Radio value={'disableCode'}>否</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        {
          this.state.codeStatus === 'enableCode' ? (
            <FormItem
              label="输错次数"
            >
              {getFieldDecorator('maxCheckCaptcha', {
                rules: [{
                  pattern: /^([1-9]\d*|[0]{1,1})$/,
                  message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
                }],
                initialValue: passwordPolicy ? passwordPolicy.maxCheckCaptcha : undefined,
              })(
                <Input
                  type="number"
                  label="输错次数"
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
              label="是否开启锁定"
              className="radioGroup"
              onChange={this.changeLockStatus.bind(this)}
            >
              <Radio value={'enableLock'}>是</Radio>
              <Radio value={'disableLock'}>否</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        {this.state.lockStatus === 'enableLock' ? (
          <div>
            <FormItem
              label="输错次数"
            >
              {getFieldDecorator('maxErrorTime', {
                rules: [{
                  pattern: /^([1-9]\d*|[0]{1,1})$/,
                  message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
                }],
                initialValue: passwordPolicy ? passwordPolicy.maxErrorTime : undefined,
              })(
                <Input type="number" label="输错次数" style={{ width: 300 }} />,
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

export default LoginForm;
