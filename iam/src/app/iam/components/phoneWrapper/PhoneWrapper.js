import React, { Component } from 'react';
import { Form, Icon, Input } from 'choerodon-ui';
import { findDOMNode } from 'react-dom';
import './PhoneWrapper.scss';

const FormItem = Form.Item;

@Form.create({})
export default class PhoneWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      internationalCode: null,
      phone: null,
      submitting: false,
    };
  }

  renderText() {
    const { initialPhone, initialCode } = this.props;
    let textContent;
    if (initialPhone) {
      textContent = (
        <div>
          <span style={{ display: initialCode ? 'inline' : 'none' }}>{initialCode}</span>
          <span>{initialPhone}</span>
        </div>
      );
    } else {
      textContent = (<div>
        <span>无</span>
      </div>);
    }

    return textContent;
  }

  // 进入编辑状态
  enterEditing = () => {
    const { internationalCode, phone } = this.props;
    this.setState({
      editing: true,
      internationalCode,
      phone,
    });
  }

  // 取消编辑
  leaveEditing = () => {
    const { resetFields } = this.props.form;
    this.setState({
      editing: false,
    });
    resetFields();
  }


  onSubmit = () => {
    this.props.form.validateFields((err, values, modify) => {
      if (!err) {
        if (!modify) {
          this.setState({
            editing: false,
          });
        } else {
          this.props.onSubmit(values);
          this.setState({
            editing: false,
          });
        }
      }
    });
  }

  checkCode = (rule, value, callback) => {
    const pattern = /^[0-9]*$/;
    const { validateFields } = this.props.form;
    if (value) {
      if (pattern.test(value)) {
        if (value === '86') {
          validateFields(['phone'], { force: true });
        }
        callback();
      } else {
        callback('请输入数字');
      }
    } else {
      validateFields(['phone'], { force: true });
      callback();
    }
  }

  checkPhone = (rule, value, callback) => {
    const { getFieldValue } = this.props.form;
    const code = getFieldValue('internationalTelCode');
    let pattern = /^[0-9]*$/;
    if (value) {
      if (pattern.test(value)) {
        if (code === '86') {
          pattern = /^1[3-9]\d{9}$/;
          if (pattern.test(value)) {
            callback();
          } else {
            callback('手机号码需符合中国地区规则');
          }
        } else {
          callback();
        }
      } else {
        callback('请输入数字');
      }
    } else if (code) {
      callback('请输入手机号');
    } else {
      callback();
    }
  }


  render() {
    const { editing } = this.state;
    const { initialPhone, initialCode, form } = this.props;
    const { getFieldDecorator } = form;
    return editing ? (
      <Form layout="inline" className="c7n-iam-userinfo-phone-wrapper-edit">
        <FormItem
          style={{ marginRight: '4px' }}
        >
          {getFieldDecorator('internationalTelCode', {
            rules: [
              {
                validator: this.checkCode,
              }],
            initialValue: initialCode ? initialCode.split('+')[1] : '86',
          })(
            <Input
              prefix="+"
              autoComplete="off"
              style={{ width: '65px' }}
              minLength={0}
              maxLength={4}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('phone', {
            rules: [{
              validator: this.checkPhone,
            }],
            initialValue: initialPhone,
          })(
            <Input
              autoComplete="off"
              style={{ width: '220px' }}
            />,
          )}
        </FormItem>
        <div className="c7n-iam-userinfo-phone-wrapper-edit-icon-container">
          <Icon type="done" className="c7n-iam-userinfo-phone-wrapper-edit-icon" onClick={this.onSubmit} />
          <Icon type="close" className="c7n-iam-userinfo-phone-wrapper-edit-icon" onClick={this.leaveEditing} />
        </div>
      </Form>
    ) : (
      <div
        className="c7n-iam-userinfo-phone-wrapper-text c7n-iam-userinfo-phone-wrapper-text-active"
        onClick={this.enterEditing}
      >
        {this.renderText()}
        <Icon type="mode_edit" className="c7n-iam-userinfo-phone-wrapper-text-icon" />
      </div>
    );
  }
}
