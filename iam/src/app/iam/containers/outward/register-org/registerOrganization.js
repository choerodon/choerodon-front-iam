import React, { Component } from 'react';
import { Button, Select, Table, Tooltip, Modal, Form, Input, Icon, Radio, Checkbox, Carousel } from 'choerodon-ui';
import { withRouter, Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import classnames from 'classnames';
import './registerOrganization.scss';
import _ from 'lodash';
import RegsiterOrgStore from '../../../stores/noLevel/register-org';
import bg1 from './icon/choerodon_login_illustrations_1.svg';
import bg2 from './icon/choerodon_login_illustrations_2.svg';
import bg3 from './icon/choerodon_login_illustrations_3.svg';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
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

export default class registerOrganization extends Component {
  constructor(props) {
    super();
    this.state = {
      account: {
        phone: null,
        loginName: null,
        password: null,
        rePassword: null,
        email: null,
        captcha: null,
      },
      currentStep: 1,
      rePasswordDirty: false,
      interval: 0, // 发送验证码冷却时间
      submitLoading: false, // 提交表单时下一步按钮的状态
      // isSend: false, //  是否发送了验证码
      isAgree: false, // 是否同意条款
    };
  }

  /**
   * 组织编码唯一性校验
   * @param rule 表单校验规则
   * @param value 组织编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    const { intl } = this.props;
    RegsiterOrgStore.checkCode(value)
      .then(({ failed }) => {
        if (failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.onlymsg` }));
        } else {
          callback();
        }
      });
  };

  /**
   * 账号唯一性校验
   * @param rule
   * @param loginname
   * @param callback
   */
  checkUsername = (rule, loginname, callback) => {
    const { intl } = this.props;
    RegsiterOrgStore.checkLoginname(loginname)
      .then(({ failed }) => {
        if (failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.name.exist.msg` }));
        } else {
          callback();
        }
      });
  };

  /**
   * 邮箱唯一性检验
   * @param rule
   * @param email
   * @param callback
   */
  checkEmailAddress = (rule, email, callback) => {
    const { intl } = this.props;
    RegsiterOrgStore.checkEmailAddress(email)
      .then(({ failed }) => {
        if (failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.email.used.msg` }));
        } else {
          callback();
        }
      });
  };

  /**
   * 密码和确认密码的关联校验
   * @param rule
   * @param value
   * @param callback
   */
  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.rePasswordDirty) {
      form.validateFields(['rePassword'], { force: true });
    }
    callback();
  };

  /**
   * 确认密码校验
   * @param rule
   * @param value
   * @param callback
   */
  checkRepassword = (rule, value, callback) => {
    const { intl, form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(intl.formatMessage({ id: `${intlPrefix}.password.unrepeat.msg` }));
    } else {
      callback();
    }
  };

  handleRePasswordBlur = (e) => {
    const value = e.target.value;
    this.setState({ rePasswordDirty: this.state.rePasswordDirty || !!value });
  };

  // 直接登录
  getRedirectURL = () => {
    const token = Choerodon.getAccessToken();
    if (token) {
      Choerodon.logout();
    } else {
      Choerodon.authorize();
    }
  }

  /**
   * 提交表单
   * @param step 当前步骤
   */
  handleSubmit = (step, e) => {
    e.preventDefault();
    const { form, intl } = this.props;
    const { isAgree, account } = this.state;
    form.validateFields((err, values) => {
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === 'string') values[key] = values[key].trim();
      });
      if (!err) {
        if (step === 2 && !isAgree) {
          Choerodon.prompt('请阅读并同意使用条款');
          return;
        }
        this.setState({
          submitLoading: true,
        });

        if (step === 1) {
          RegsiterOrgStore.submitAccount(values.email, values.captcha).then((data) => {
            if (data.failed) {
              Choerodon.prompt(data.message);
              this.setState({
                submitLoading: false,
              });
            } else {
              this.setState({
                account: {
                  ...values,
                },
                currentStep: step + 1,
                submitLoading: false,
              }, () => {
                this.slider.next();
              });
            }
          });
        } else {
          let body = {
            ...account,
            ...values,
            realName: account.loginName,
          };
          body = _.omit({ ...body }, ['rule', 'address']);
          body.address = body.address || null;
          RegsiterOrgStore.registerOrg(body).then(({ failed, message }) => {
            if (failed) {
              Choerodon.prompt(message);
              this.setState({
                submitLoading: false,
              });
            } else {
              this.setState({
                currentStep: step + 1,
                submitLoading: false,
              }, () => {
                this.slider.next();
              });
            }
          });
        }
      }
    });
  }

  changeRule = (e) => {
    this.setState({
      isAgree: e.target.checked,
    });
  }

  /**
   * 清除倒计时定时器
   * @param timer
   */
  clearTimer = (timer) => {
    this.setState({
      interval: 0,
    });
    clearInterval(timer);
  }

  // 发送验证码
  handleSendCaptcha = () => {
    const { intl, form: { validateFields } } = this.props;
    validateFields(['email'], (error, values) => {
      if (!error) {
        RegsiterOrgStore.sendCaptcha(values.email).then(({ remainingSecond, successful }) => {
          if (successful) {
            Choerodon.prompt(intl.formatMessage({ id: `${intlPrefix}.send.success` }));
          }

          if (remainingSecond !== null) {
            this.setState({
              interval: remainingSecond,
            }, () => {
              const timer = setInterval(() => {
                this.setState({
                  interval: this.state.interval - 1,
                }, () => {
                  if (this.state.interval <= 0) {
                    this.clearTimer(timer);
                  }
                });
              }, 1000);
            });
          }
        }).catch(() => {
          Choerodon.prompt(intl.formatMessage({ id: `${intlPrefix}.send.failed` }));
        });
      }
    });
  }


  /**
   * 渲染第一步
   * @returns {*}
   */
  handleRenderFirstStep = () => {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { submitLoading, interval } = this.state;
    return (
      <Form className="c7n-registerorg-form" onSubmit={this.handleSubmit.bind(this, 1)}>
        <span className="c7n-registerorg-form-title">{intl.formatMessage({ id: `${intlPrefix}.register.account` })}</span>
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
              {
                pattern: /^1[3-9]\d{9}$/,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.phone.pattern.msg` }),
              },
            ],
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.phone` })}
              maxLength={11}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('loginName', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.loginname.require.msg` }),
              }, {
                pattern: /^[0-9a-zA-Z]+$/,
                message: intl.formatMessage({ id: `${intlPrefix}.loginname.pattern.msg` }),
              }, {
                validator: this.checkUsername,
              },
            ],
            validateTrigger: 'onBlur',
            validateFirst: true,

          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.loginname` })}
              maxLength={32}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('password', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.password.require.msg` }),
              }, {
                min: 6,
                message: intl.formatMessage({ id: `${intlPrefix}.password.min.msg` }),
              }, {
                pattern: /^[0-9a-zA-Z]+$/,
                message: intl.formatMessage({ id: `${intlPrefix}.password.pattern.msg` }),
              }, {
                validator: this.validateToNextPassword,
              },
            ],
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.password` })}
              type="password"
              showPasswordEye
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('rePassword', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.repassword.require.msg` }),
              }, {
                validator: this.checkRepassword,
              }],
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.repassword` })}
              type="password"
              onBlur={this.handleRePasswordBlur}
              showPasswordEye
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('email', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.email.require.msg` }),
              },
              {
                type: 'email',
                message: intl.formatMessage({ id: `${intlPrefix}.email.pattern.msg` }),
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
              label={intl.formatMessage({ id: `${intlPrefix}.email` })}
              maxLength={64}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          className="c7n-registerorg-captcha"
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
              />,
            )
          }
          {
            interval === 0 ? (
              <div className="c7n-registerorg-captcha-btn c7n-registerorg-captcha-btn-default" onClick={this.handleSendCaptcha}> {intl.formatMessage({ id: `${intlPrefix}.send.captcha` })}</div>
            ) : (
              <div className="c7n-registerorg-captcha-btn c7n-registerorg-captcha-btn-send">{intl.formatMessage({ id: `${intlPrefix}.send.retry.seconds` }, { interval })}
              </div>
            )
          }
        </FormItem>
        <Button
          type="primary"
          funcType="raised"
          className="c7n-registerorg-btn"
          loading={submitLoading}
          htmlType="sumbit"
        >
          <FormattedMessage id={`${intlPrefix}.step.next`} />
        </Button>
        <div className="c7n-registerorg-link" onClick={this.getRedirectURL}>{intl.formatMessage({ id: `${intlPrefix}.already.have.account` })}</div>
      </Form>
    );
  }

  /**
   * 渲染第二步
   * @returns {*}
   */
  handleRenderSecStep = () => {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { submitLoading } = this.state;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
      fontSize: '14px',
    };
    return (
      <Form className="c7n-registerorg-form" onSubmit={this.handleSubmit.bind(this, 2)}>
        <span className="c7n-registerorg-form-title">{intl.formatMessage({ id: `${intlPrefix}.register.organization` })}</span>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('organizationName', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: `${intlPrefix}.namerequiredmsg` }),
              whitespace: true,
            }],
            validateTrigger: 'onBlur',
          })(
            <Input
              label={<FormattedMessage id={`${intlPrefix}.name`} />}
              autoComplete="off"
              maxLength={32}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('organizationCode', {
            rules: [{
              required: true,
              whitespace: true,
              message: intl.formatMessage({ id: `${intlPrefix}.coderequiredmsg` }),
            }, {
              max: 15,
              message: intl.formatMessage({ id: `${intlPrefix}.codemaxmsg` }),
            }, {
              pattern: /^[a-z](([a-z0-9]|-(?!-))*[a-z0-9])*$/,
              message: intl.formatMessage({ id: `${intlPrefix}.codepatternmsg` }),
            }, {
              validator: this.checkCode,
            }],
            validateTrigger: 'onBlur',
            validateFirst: true,
          })(
            <Input
              label={<FormattedMessage id={`${intlPrefix}.code`} />}
              autoComplete="off"
              maxLength={15}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {
            getFieldDecorator('scale', {
              rules: [{
                required: true,
                message: intl.formatMessage({ id: `${intlPrefix}.scale.required` }),
              }],
              initialValue: 0,
            })(
              <RadioGroup label={<FormattedMessage id={`${intlPrefix}.scale`} />}>
                <Radio style={radioStyle} value={0} key="small">{intl.formatMessage({ id: `${intlPrefix}.scale.small` })}</Radio>
                <Radio style={radioStyle} value={1} key="middle">{intl.formatMessage({ id: `${intlPrefix}.scale.middle` })}</Radio>
                <Radio style={radioStyle} value={2} key="large">{intl.formatMessage({ id: `${intlPrefix}.scale.large` })}</Radio>
              </RadioGroup>,
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
                label={<FormattedMessage id={`${intlPrefix}.region`} />}
                autoComplete="off"
              />,
            )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {
            getFieldDecorator('rule', {
              rules: [],
            })(
              <Checkbox onChange={this.changeRule} style={{ fontSize: '14px' }}>我已同意<a href="https://www.baidu.com/" target="_blank" rel="noopener noreferrer">使用条款</a></Checkbox>,
            )
          }
        </FormItem>
        <Button
          type="primary"
          funcType="raised"
          className="c7n-registerorg-btn"
          loading={submitLoading}
          htmlType="sumbit"
        >
          <FormattedMessage id={`${intlPrefix}.finish`} />
        </Button>
        <div className="c7n-registerorg-link" onClick={this.getRedirectURL}>{intl.formatMessage({ id: `${intlPrefix}.already.have.account` })}</div>
      </Form>
    );
  }

  /**
   * 渲染第三步
   * @returns {*}
   */
  handleRenderThirdStep = () => {
    const { intl } = this.props;
    return (
      <Form className="c7n-registerorg-form">
        <span className="c7n-registerorg-form-title">{intl.formatMessage({ id: `${intlPrefix}.register.successful` })}</span>
        <div className="c7n-registerorg-form-success-info">
          您的注册信息已提交成功，注册结果将发送至您的注册邮箱，请注意查收。<span style={{ color: '#d50000' }}>（注册成功后，您的账号将会在30天试用期后失效，系统不会保留您的任何信息。）</span>
        </div>
      </Form>
    );
  }

  handleRenderPic = () => {
    const { formatMessage } = this.props.intl;
    const sliders = [{
      firstText: 'bg1.firstText',
      secondText: 'bg1.secondText',
      pic: bg1,
    }, {
      firstText: 'bg2.firstText',
      secondText: 'bg2.secondText',
      pic: bg2,
    }, {
      firstText: 'bg3.firstText',
      secondText: 'bg3.secondText',
      pic: bg3,
    }];

    return (
      <Carousel
        className="c7n-registerorg-right"
        ref={(el) => { this.slider = el; }}
        effect="scrollx"
        dots={false}
      >
        {
          sliders.map(item => (
            <div className="c7n-registerorg-right-bg-container" style={{ backgroundImage: `url(${item.pic})` }}>
              <div className="c7n-registerorg-right-text-container">
                <span>{formatMessage({ id: `${intlPrefix}.${item.firstText}` })}</span>
                <span>{formatMessage({ id: `${intlPrefix}.${item.secondText}` })}</span>
              </div>
            </div>
          ))
        }
      </Carousel>
    );
  }

  render() {
    const { currentStep } = this.state;
    return (
      <div className="c7n-registerorg">
        <div className="c7n-registerorg-left">
          <div className="c7n-registerorg-left-content">
            <div className="c7n-registerorg-left-content-icon" />
            {currentStep === 1 && this.handleRenderFirstStep()}
            {currentStep === 2 && this.handleRenderSecStep()}
            {currentStep === 3 && this.handleRenderThirdStep()}
          </div>
        </div>
        {this.handleRenderPic()}
      </div>
    );
  }
}
