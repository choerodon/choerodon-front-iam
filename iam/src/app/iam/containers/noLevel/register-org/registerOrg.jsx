import React, { Component } from 'react';
import { Button, Select, Table, Tooltip, Modal, Form, Input, Icon, Steps } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import './registerOrg.scss';
import OrganizationStore from '../../../stores/global/organization';

const { Step } = Steps;
const FormItem = Form.Item;
const intlPrefix = 'register.organization';
const inputWidth = '512px';
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class registerOrg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 1,
      name: null,
      code: null,
      address: null,
      loginName: null,
      realName: null,
      email: null,
      phone: null,
      password: null,
      rePassword: null,
    };
  }


  componentDidMount() {
    if (document.getElementsByClassName('common-menu')[0]) {
      document.getElementsByClassName('common-menu')[0].style.display = 'none';
    }

    if (document.getElementsByClassName('page-header')[0]) {
      document.getElementsByClassName('page-header')[0].style.display = 'none';
    }
  }

  /**
   * 获取步骤条状态
   * @param index
   * @returns {string}
   */
  getStatus = (index) => {
    const { current } = this.state;
    let status = 'process';
    if (index === current) {
      status = 'process';
    } else if (index > current) {
      status = 'wait';
    } else {
      status = 'finish';
    }
    return status;
  };

  handleSubmitFirstStep = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === 'string') values[key] = values[key].trim();
      });
      if (!err) {
        this.setState({
          ...values,
          current: 2,
        });
      }
    });
  }

  handleSubmitSecStep = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === 'string') values[key] = values[key].trim();
      });
      if (!err) {
        this.setState({
          ...values,
          current: 3,
        });
      }
    });
  }

  handleSubmitThirdStep = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === 'string') values[key] = values[key].trim();
      });
      if (!err) {
        this.setState({
          ...values,
          current: 4,
        });
      }
    });
  }


  /**
   * 组织编码校验
   * @param rule 表单校验规则
   * @param value 组织编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    const { intl } = this.props;
    OrganizationStore.checkCode(value)
      .then(({ failed }) => {
        if (failed) {
          callback(intl.formatMessage({ id: 'global.organization.onlymsg' }));
        } else {
          callback();
        }
      });
  };


  // 渲染第一步
  handleRenderFirstStep = () => {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form className="c7n-registerorg-content">
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('code', {
            rules: [{
              required: true,
              whitespace: true,
              message: intl.formatMessage({ id: 'global.organization.coderequiredmsg' }),
            }, {
              max: 15,
              message: intl.formatMessage({ id: 'global.organization.codemaxmsg' }),
            }, {
              pattern: /^[a-z](([a-z0-9]|-(?!-))*[a-z0-9])*$/,
              message: intl.formatMessage({ id: 'global.organization.codepatternmsg' }),
            }, {
              validator: this.checkCode,
            }],
            validateTrigger: 'onBlur',
            validateFirst: true,
          })(
            <Input
              label={<FormattedMessage id="global.organization.code" />}
              autoComplete="off"
              style={{ width: inputWidth }}
              maxLength={15}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: 'global.organization.namerequiredmsg' }),
              whitespace: true,
            }],
            validateTrigger: 'onBlur',
          })(
            <Input
              label={<FormattedMessage id="global.organization.name" />}
              autoComplete="off"
              style={{ width: inputWidth }}
              maxLength={32}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {
            getFieldDecorator('address', {
              rules: [],
            })(
              <Input
                label={<FormattedMessage id="global.organization.region" />}
                autoComplete="off"
                style={{ width: inputWidth }}
              />,
            )}
        </FormItem>
        <div className="c7n-registerorg-btn-group">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.handleSubmitFirstStep}
          >
            <FormattedMessage id={`${intlPrefix}.step.next`} />
          </Button>
        </div>
      </Form>
    );
  }

  // 渲染第二步
  handleRenderSecStep = () => {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const userPrefix = 'organization.user';
    return (
      <Form className="c7n-registerorg-content">
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('loginName', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${userPrefix}.loginname.require.msg` }),
              }, {
                pattern: /^[0-9a-zA-Z]+$/,
                message: intl.formatMessage({ id: `${userPrefix}.loginname.pattern.msg` }),
              }, {
                validator: this.checkUsername,
              },
            ],
            validateTrigger: 'onBlur',
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${userPrefix}.loginname` })}
              style={{ width: inputWidth }}
              maxLength={32}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {
            getFieldDecorator('realName', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage({ id: `${userPrefix}.realname.require.msg` }),
                },
              ],
            })(
              <Input
                autoComplete="off"
                label={intl.formatMessage({ id: `${userPrefix}.realname` })}
                type="text"
                rows={1}
                style={{ width: inputWidth }}
                maxLength={32}
                showLengthInfo={false}
              />,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('email', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${userPrefix}.email.require.msg` }),
              },
              {
                type: 'email',
                message: intl.formatMessage({ id: `${userPrefix}.email.pattern.msg` }),
              },
              {
                validator: this.checkEmailAddress,
              },
            ],
            validateTrigger: 'onBlur',
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${userPrefix}.email` })}
              style={{ width: inputWidth }}
              maxLength={64}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('phone', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.phone.require.msg` }),
              },
            ],
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.phone` })}
              style={{ width: inputWidth }}
              maxLength={64}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          className="c7n-registerorg-form-item c7n-registerorg-form-item-left"
        >
          {getFieldDecorator('password', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${userPrefix}.password.require.msg` }),
              }, {
                validator: this.checkPassword,
              }, {
                validator: this.validateToNextPassword,
              },
            ],
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${userPrefix}.password` })}
              type="password"
              style={{ width: '247px' }}
              showPasswordEye
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          className="c7n-registerorg-form-item"
        >
          {getFieldDecorator('rePassword', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${userPrefix}.repassword.require.msg` }),
              }, {
                validator: this.checkRepassword,
              }],
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${userPrefix}.repassword` })}
              type="password"
              style={{ width: '247px' }}
              onBlur={this.handleRePasswordBlur}
              showPasswordEye
            />,
          )}
        </FormItem>
        <div className="c7n-registerorg-btn-group">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.handleSubmitSecStep}
          >
            <FormattedMessage id={`${intlPrefix}.step.next`} />
          </Button>
          <Button
            funcType="raised"
          >
            <FormattedMessage id={`${intlPrefix}.step.prev`} />
          </Button>
        </div>
      </Form>
    );
  }

  // 渲染第三步
  handleRenderThirdStep = () => {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form className="c7n-registerorg-content">
        <FormItem
          {...formItemLayout}
        >
          {
             getFieldDecorator('email', {
               rules: [
                 {
                   required: true,
                   whitespace: true,
                   message: intl.formatMessage({ id: `${intlPrefix}.email` }),
                 },
               ],
               initialValue: this.state.email,
             })(
               <Input
                 label={intl.formatMessage({ id: `${intlPrefix}.email` })}
                 disabled
               />,
             )
           }
        </FormItem>
        <FormItem
          {...formItemLayout}
          className="c7n-registerorg-form-item"
        >
          {
            getFieldDecorator('captcha', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.captcha.require.msg` }),
                },
              ],
            })(
              <Input
                autoComplete="off"
                label={intl.formatMessage({ id: `${intlPrefix}.captcha` })}
                style={{ width: '400px' }}
              />,
            )
          }
        </FormItem>
        <Button
          funcType="raised"
          className="c7n-registerorg-captcha-btn"
        >
          发送验证码
        </Button>
        <div className="c7n-registerorg-btn-group">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.handleSubmitThirdStep}
          >
            <FormattedMessage id={`${intlPrefix}.step.next`} />
          </Button>
          <Button
            funcType="raised"
          >
            <FormattedMessage id={`${intlPrefix}.step.prev`} />
          </Button>
        </div>
      </Form>
    );
  }

  // 渲染第四步
  handleRenderFourthStep = () => {
    const { intl } = this.props;
    return (
      <div className="c7n-registerorg-content-fourth">
        <div className="c7n-registerorg-content-fourth-title">
          <Icon type="finished" className="c7n-registerorg-success-icon" />
          <span>恭喜</span>
        </div>
        <div className="c7n-registerorg-content-fourth-msg">
          您的组织{this.state.name}注册成功
        </div>
        <Button
          type="primary"
          funcType="raised"
        >
          直接登录
        </Button>
      </div>
    );
  }


  render() {
    const { current } = this.state;
    return (
      <div className="c7n-registerorg-bg">
        <div className="c7n-registerorg-container">
          <div className="c7n-registerorg-container-icon" />
          <div className="c7n-registerorg-container-title">注册组织</div>
          <div className="c7n-registerorg-container-steps">
            <Steps current={current}>
              <Step
                title={
                  <span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>
                    <FormattedMessage id={`${intlPrefix}.step1.title`} />
                  </span>}
                status={this.getStatus(1)}
              />
              <Step
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>
                  <FormattedMessage id={`${intlPrefix}.step2.title`} />
                </span>}
                status={this.getStatus(2)}
              />
              <Step
                title={<span style={{
                  color: current === 3 ? '#3F51B5' : '',
                  fontSize: 14,
                }}
                >
                  <FormattedMessage id={`${intlPrefix}.step3.title`} />
                </span>}
                status={this.getStatus(3)}
              />
              <Step
                title={<span style={{
                  color: current === 4 ? '#3F51B5' : '',
                  fontSize: 14,
                }}
                >
                  <FormattedMessage id={`${intlPrefix}.step4.title`} />
                </span>}
                status={this.getStatus(4)}
              />
            </Steps>
            {current === 1 && this.handleRenderFirstStep()}
            {current === 2 && this.handleRenderSecStep()}
            {current === 3 && this.handleRenderThirdStep()}
            {current === 4 && this.handleRenderFourthStep()}
          </div>
        </div>
      </div>
    );
  }
}
