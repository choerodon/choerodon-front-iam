import React, { Component } from 'react';
import { Button, Select, Table, Tooltip, Modal, Form, Input, Icon, Steps } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import classnames from 'classnames';
import './registerOrg.scss';
import _ from 'lodash';
import RegsiterOrgStore from '../../../stores/noLevel/register-org';

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
      organizationName: null,
      organizationCode: null,
      address: null,
      loginName: null,
      realName: null,
      email: null,
      phone: null,
      password: null,
      captcha: null,
      rePassword: null,
      rePasswordDirty: false,
      interval: 0, // 发送验证码冷却时间
      submitLoading: false, // 提交表单时下一步按钮的状态
    };
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

  /**
   * 上一步
   * @param index
   */
  changeStep = (index) => {
    this.setState({ current: index });
  };

  /**
   * 提交表单
   * @param step 当前步骤
   */
  handleSubmit = (step, e) => {
    e.preventDefault();
    const { form, intl } = this.props;
    form.validateFields((err, values) => {
      Object.keys(values).forEach((key) => {
        if (typeof values[key] === 'string') values[key] = values[key].trim();
      });
      if (!err) {
        this.setState({
          submitLoading: true,
        });
        if (step === 1 || step === 2) {
          this.setState({
            ...values,
            current: step + 1,
            submitLoading: false,
          });
        } else {
          this.setState({
            captcha: values.captcha,
          }, () => {
            const body = _.omit({ ...this.state }, ['rePassword', 'rePasswordDirty', 'current', 'interval', 'submitLoading']);
            body.address = body.address || null;
            RegsiterOrgStore.registerOrg(body).then(({ failed, message }) => {
              if (failed) {
                Choerodon.prompt(message);
                this.setState({
                  submitLoading: false,
                });
              } else {
                this.setState({
                  current: step + 1,
                  submitLoading: false,
                });
              }
            });
          });
        }
      }
    });
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
   * 登录名唯一性校验
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

  /**
   * 清楚倒计时定时器
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
    const { intl } = this.props;
    RegsiterOrgStore.sendCaptcha(this.state.email).then(({ remainingSecond, successful }) => {
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

  // 直接登录
  login = () => {
    const token = Choerodon.getAccessToken();
    if (token) {
      Choerodon.logout();
    } else {
      Choerodon.authorize();
    }
  }


  // 渲染第一步
  handleRenderFirstStep = () => {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { organizationCode, organizationName, address, submitLoading } = this.state;
    return (
      <Form className="c7n-registerorg-content" onSubmit={this.handleSubmit.bind(this, 1)}>
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
            initialValue: organizationCode,
          })(
            <Input
              label={<FormattedMessage id={`${intlPrefix}.code`} />}
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
          {getFieldDecorator('organizationName', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: `${intlPrefix}.namerequiredmsg` }),
              whitespace: true,
            }],
            validateTrigger: 'onBlur',
            initialValue: organizationName,
          })(
            <Input
              label={<FormattedMessage id={`${intlPrefix}.name`} />}
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
              initialValue: address,
            })(
              <Input
                label={<FormattedMessage id={`${intlPrefix}.region`} />}
                autoComplete="off"
                style={{ width: inputWidth }}
              />,
            )}
        </FormItem>
        <Button
          type="primary"
          funcType="raised"
          className="c7n-registerorg-btn-group"
          loading={submitLoading}
          htmlType="sumbit"
        >
          <FormattedMessage id={`${intlPrefix}.step.next`} />
        </Button>
      </Form>
    );
  }

  // 渲染第二步
  handleRenderSecStep = () => {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { loginName, realName, email, phone, password, rePassword, submitLoading } = this.state;
    return (
      <Form className="c7n-registerorg-content" onSubmit={this.handleSubmit.bind(this, 2)}>
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
            initialValue: loginName,
            validateTrigger: 'onBlur',
            validateFirst: true,

          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.loginname` })}
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
                  message: intl.formatMessage({ id: `${intlPrefix}.realname.require.msg` }),
                },
              ],
              initialValue: realName,
            })(
              <Input
                autoComplete="off"
                label={intl.formatMessage({ id: `${intlPrefix}.realname` })}
                type="text"
                style={{ width: inputWidth }}
                maxLength={32}
                showLengthInfo={false}
              />,
            )
          }
        </FormItem>
        <FormItem
          {...formItemLayout}
          className="c7n-registerorg-form-item c7n-registerorg-form-item-left"
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
            initialValue: email,
          })(
            <Input
              autoComplete="off"
              style={{ width: '247px' }}
              label={intl.formatMessage({ id: `${intlPrefix}.email` })}
              maxLength={64}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          className="c7n-registerorg-form-item"
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
            initialValue: phone,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.phone` })}
              maxLength={11}
              showLengthInfo={false}
              style={{ width: '247px' }}
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
            initialValue: password,
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.password` })}
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
                message: intl.formatMessage({ id: `${intlPrefix}.repassword.require.msg` }),
              }, {
                validator: this.checkRepassword,
              }],
            initialValue: rePassword,
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({ id: `${intlPrefix}.repassword` })}
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
            loading={submitLoading}
            htmlType="submit"
          >
            <FormattedMessage id={`${intlPrefix}.step.next`} />
          </Button>
          <Button
            disabled={submitLoading}
            funcType="raised"
            onClick={this.changeStep.bind(this, 1)}
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
    const { interval, captcha, submitLoading } = this.state;
    return (
      <Form className="c7n-registerorg-content" onSubmit={this.handleSubmit.bind(this, 3)}>
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
              initialValue: captcha,
            })(
              <Input
                autoComplete="off"
                label={intl.formatMessage({ id: `${intlPrefix}.captcha` })}
                style={{ width: '370px' }}
              />,
            )
          }
        </FormItem>
        <Button
          funcType="raised"
          className="c7n-registerorg-captcha-btn"
          onClick={this.handleSendCaptcha}
          loading={interval > 0}
        >
          {interval === 0 ? intl.formatMessage({ id: `${intlPrefix}.send.captcha` }) : intl.formatMessage({ id: `${intlPrefix}.send.retry.seconds` }, { interval })}
        </Button>
        <div className="c7n-registerorg-btn-group">
          <Button
            type="primary"
            funcType="raised"
            htmlType="submit"
            loading={submitLoading}
          >
            <FormattedMessage id={`${intlPrefix}.step.next`} />
          </Button>
          <Button
            funcType="raised"
            disabled={submitLoading}
            onClick={this.changeStep.bind(this, 2)}
          >
            <FormattedMessage id={`${intlPrefix}.step.prev`} />
          </Button>
        </div>
      </Form>
    );
  }

  // 渲染第四步
  handleRenderFourthStep = () => (
    <div className="c7n-registerorg-content-fourth">
      <div className="c7n-registerorg-content-fourth-title">
        <Icon type="finished" className="c7n-registerorg-success-icon" />
        <FormattedMessage id={`${intlPrefix}.congratulations`} />
      </div>
      <div className="c7n-registerorg-content-fourth-msg">
        <FormattedMessage id={`${intlPrefix}.register.success`} values={{ name: this.state.organizationName }} />
      </div>
      <Button
        type="primary"
        funcType="raised"
        onClick={this.login}
      >
        <FormattedMessage id={`${intlPrefix}.login`} />
      </Button>
    </div>
  )

  render() {
    const { current } = this.state;
    const { AppState } = this.props;
    const siteInfo = AppState.getSiteInfo;
    return (
      <div className="c7n-registerorg-bg">
        <div className="c7n-registerorg-container">
          <div className="c7n-registerorg-container-icon-content">
            <div
              className={classnames('c7n-registerorg-container-icon', !siteInfo.favicon ? 'c7n-registerorg-container-default-icon' : null)}
              style={{ backgroundImage: siteInfo.favicon ? `url(${siteInfo.favicon})` : null }}
            />
            <div className="c7n-registerorg-container-icon-title">{siteInfo.systemName ? siteInfo.systemName : 'Choerodon'}</div>
          </div>


          <div className="c7n-registerorg-container-title">
            <FormattedMessage id={`${intlPrefix}.register.organization`} />
          </div>
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
        <div className="c7n-registerorg-copyright">Copyright &copy; The choerodon Author&reg;. All rights reserved.</div>
      </div>
    );
  }
}
