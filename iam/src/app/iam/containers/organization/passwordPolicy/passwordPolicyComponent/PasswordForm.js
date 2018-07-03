import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Input, Radio } from 'choerodon-ui';
import passwordPolicyStore from '../../../../stores/organization/passwordPolicy';
import { injectIntl, FormattedMessage } from 'react-intl';
import './PasswordForm.scss';

const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const inputPrefix = 'organization.pwdpolicy';

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
    const { AppState, intl } = this.props;
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
            <RadioGroup label={<FormattedMessage id={`${inputPrefix}.enabled.password`}/>} className="radioGroup">
              <Radio value={'enablePwd'}><FormattedMessage id="yes"/></Radio>
              <Radio value={'disablePwd'}><FormattedMessage id="no"/></Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem
          {...formItemNumLayout}
        >
          {getFieldDecorator('notUsername', {
            initialValue: sameStatus,
          })(
            <RadioGroup label={<FormattedMessage id={`${inputPrefix}.notusername`}/>} className="radioGroup">
              <Radio value={'same'}><FormattedMessage id="yes"/></Radio>
              <Radio value={'different'}><FormattedMessage id="no"/></Radio>
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
                label={<FormattedMessage id={`${inputPrefix}.originalpassword`}/>}
                style={{ width: 512 }}
              />,
            )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('minLength', {
            rules: [
              {
                pattern: /^([1-9]\d*|[0]{1,1})$/,
                message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
              },
            ],
            initialValue: passwordPolicy ? passwordPolicy.minLength : '',
          })(
            <Input
              autoComplete="off"
              type="number"
              label={<FormattedMessage id={`${inputPrefix}.minlength`}/>}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('maxLength', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
            }],
            initialValue: passwordPolicy ? passwordPolicy.maxLength : '',
          })(
            <Input
              autoComplete="off"
              type="number"
              label={<FormattedMessage id={`${inputPrefix}.maxlength`}/>}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('digitsCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
            }],
            initialValue: passwordPolicy ? passwordPolicy.digitsCount : '',
          })(
            <Input
              autoComplete="off"
              type="number"
              label={<FormattedMessage id={`${inputPrefix}.digitscount`}/>}
              style={{ width: inputWidth }} />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('lowercaseCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
            }],
            initialValue: passwordPolicy ? passwordPolicy.lowercaseCount : '',
          })(
            <Input
              autoComplete="off"
              type="number"
              label={<FormattedMessage id={`${inputPrefix}.lowercasecount`}/>}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('uppercaseCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
            }],
            initialValue: passwordPolicy ? passwordPolicy.uppercaseCount : '',
          })(
            <Input
              autoComplete="off"
              type="number"
              label={<FormattedMessage id={`${inputPrefix}.uppercasecount`}/>}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('specialCharCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
            }],
            initialValue: passwordPolicy ? passwordPolicy.specialCharCount : '',
          })(
            <Input
              autoComplete="off"
              type="number"
              label={<FormattedMessage id={`${inputPrefix}.specialcharcount`}/>}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('notRecentCount', {
            rules: [{
              pattern: /^([1-9]\d*|[0]{1,1})$/,
              message: intl.formatMessage({id: `${inputPrefix}.number.pattern.msg`}),
            }],
            initialValue: passwordPolicy ? passwordPolicy.notRecentCount : '',
          })(
            <Input
              autoComplete="off"
              type="number"
              label={<FormattedMessage id={`${inputPrefix}.notrecentcount`}/>}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem style={{ width: 512 }}>
          {getFieldDecorator('regularExpression', {
            initialValue: passwordPolicy ? passwordPolicy.regularExpression : '',
          })(
            <TextArea
              autoComplete="off"
              rows={2}
              label={<FormattedMessage id={`${inputPrefix}.regularexpression`}/>}
            />,
          )}
        </FormItem>
      </div>
    );
  }
}

export default injectIntl(PasswordForm);
