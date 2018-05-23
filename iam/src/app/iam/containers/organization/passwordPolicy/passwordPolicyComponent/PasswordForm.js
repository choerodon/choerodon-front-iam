import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Checkbox, Form, Input, InputNumber, Row, Col, Button, Icon, Radio } from 'choerodon-ui';
import passwordPolicyStore from '../../../../stores/organization/passwordPolicy';

import './PasswordForm.scss';

const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;

@inject('AppState')
@observer
class PasswordForm extends Component {
  // checkMaxLength = (rule, value, callback) => {
  //   if (!value) {
  //     callback();
  //     return;
  //   }
  //   if (value) {
  //     let msg = '';
  //     const pa = /^[0-9]\d*$/;
  //     if (pa.test(value)) {
  //       const formInfo = this.props.form;
  //       const minLength = formInfo.getFieldValue('minLength');
  //       const minLenthError = formInfo.getFieldError('minLength');
  //       if (minLength && !minLenthError) {
  //         msg = value >= minLength ? undefined : Choerodon.getMessage('请输入大于或等于最小密码长度的整数',
  //           'Please input integer greater than or equal to the minlength');
  //       } else {
  //         msg = undefined;
  //       }
  //     } else {
  //       msg = Choerodon.getMessage('请输入大于或等于0的整数',
  //         'Please input integer greater than or equal to 0');
  //     }
  //     callback(msg);
  //   }
  // };

  render() {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const { getFieldDecorator } = this.props.form;
    const passwordPolicy = passwordPolicyStore.getPasswordPolicy;
    const inputWidth = 300; // 输入框长度
    const pwdStatus = passwordPolicy && passwordPolicy.enablePassword ? 'enablePwd' : 'disablePwd';
    const sameStatus = passwordPolicy && passwordPolicy.notUsername ? 'different' : 'same';
    const organizationId = menuType.id;
    const type = menuType.type;
    const formItemNumLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 12 },
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
          {getFieldDecorator('enablePassword', {
            initialValue: pwdStatus,
          })(
            <RadioGroup label="是否启用" className="radioGroup">
              <Radio value={'enablePwd'}>是</Radio>
              <Radio value={'disablePwd'}>否</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem
          {...formItemNumLayout}
        >
          {getFieldDecorator('notUsername', {
            initialValue: sameStatus,
          })(
            <RadioGroup label="是否允许与登录名相同" className="radioGroup">
              <Radio value={'same'}>是</Radio>
              <Radio value={'different'}>否</Radio>
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
                label="新用户默认密码"
                style={{ width: 512 }}
              />,
            )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('minLength', {
            rules: [
              {
                pattern: /^([1-9]\d*|[0]{1,1})$/,
                message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
              },
            ],
            initialValue: passwordPolicy ? passwordPolicy.minLength : '',
          })(
            <Input
              type="number"
              label="最小密码长度"
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('maxLength', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
            }],
            initialValue: passwordPolicy ? passwordPolicy.maxLength : '',
          })(
            <Input type="number" label="最大密码长度" style={{ width: inputWidth }} />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('digitsCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
            }],
            initialValue: passwordPolicy ? passwordPolicy.digitsCount : '',
          })(
            <Input type="number" label="最少数字数" style={{ width: inputWidth }} />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('lowercaseCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
            }],
            initialValue: passwordPolicy ? passwordPolicy.lowercaseCount : '',
          })(
            <Input type="number" label="最少小写字母数" style={{ width: inputWidth }} />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('uppercaseCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
            }],
            initialValue: passwordPolicy ? passwordPolicy.uppercaseCount : '',
          })(
            <Input type="number" label="最少大写字母数" style={{ width: inputWidth }} />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('specialCharCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
            }],
            initialValue: passwordPolicy ? passwordPolicy.specialCharCount : '',
          })(
            <Input type="number" label="最少特殊字符数" style={{ width: inputWidth }} />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('notRecentCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: Choerodon.getMessage('请输入大于或等于0的整数', 'Please input integer greater than or equal to 0'),
            }],
            initialValue: passwordPolicy ? passwordPolicy.notRecentCount : '',
          })(
            <Input type="number" label="最大近期密码数" style={{ width: inputWidth }} />,
          )}
        </FormItem>
        <FormItem style={{ width: 512 }}>
          {getFieldDecorator('regularExpression', {
            initialValue: passwordPolicy ? passwordPolicy.regularExpression : '',
          })(
            <TextArea rows={2} label="密码正则" />,
          )}
        </FormItem>
      </div>
    );
  }
}

export default PasswordForm;
