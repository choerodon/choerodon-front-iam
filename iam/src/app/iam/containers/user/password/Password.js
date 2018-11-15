
import React, { Component } from 'react';
import { Button, Col, Form, Input, Row } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import UserInfoStore from '../../../stores/user/user-info/UserInfoStore';
import './Password.scss';

const FormItem = Form.Item;
const intlPrefix = 'user.changepwd';
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 9 },
  },
};

const inputWidth = 512;

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class Password extends Component {
  constructor(props) {
    super(props);
    this.editFocusInput = React.createRef();
  }
  state = {
    submitting: false,
    confirmDirty: null,
  };

  componentWillMount() {
    this.loadUserInfo();
  }

  loadUserInfo = () => {
    UserInfoStore.setUserInfo(this.props.AppState.getUserInfo);
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { intl, form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(intl.formatMessage({ id: `${intlPrefix}.twopwd.pattern.msg` }));
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    } if (value.indexOf(' ') !== -1) {
      callback('密码不能包含空格');
    }
    callback();
  };

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  handleSubmit = (e) => {
    const { getFieldValue } = this.props.form;
    const user = UserInfoStore.getUserInfo;
    const body = {
      originalPassword: getFieldValue('oldpassword'),
      password: getFieldValue('confirm'),
    };
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ submitting: true });
        UserInfoStore.updatePassword(user.id, body)
          .then(({ failed, message }) => {
            this.setState({ submitting: false });
            if (failed) {
              Choerodon.prompt(message);
            } else {
              Choerodon.logout();
            }
          })
          .catch((error) => {
            this.setState({ submitting: false });
            Choerodon.handleResponseError(error);
          });
      }
    });
  };

  reload = () => {
    const { resetFields } = this.props.form;
    resetFields();
  };

  render() {
    const { intl, form } = this.props;
    const { getFieldDecorator } = form;
    const { submitting } = this.state;
    const user = UserInfoStore.getUserInfo;
    return (
      <Page
        service={[
          'iam-service.user.selfUpdatePassword',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Button onClick={this.reload} icon="refresh">
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{ name: user.realName }}
        >
          <div className="ldapContainer">
            <Form onSubmit={this.handleSubmit} layout="vertical">
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('oldpassword', {
                  rules: [{
                    required: true,
                    message: intl.formatMessage({ id: `${intlPrefix}.oldpassword.require.msg` }),
                  }, {
                    validator: this.validateToNextPassword,
                  }],
                  validateTrigger: 'onBlur',
                })(
                  <Input
                    autoComplete="off"
                    label={<FormattedMessage id={`${intlPrefix}.oldpassword`} />}
                    type="password"
                    style={{ width: inputWidth }}
                    ref={(e) => { this.editFocusInput = e; }}
                    disabled={user.ldap}
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('password', {
                  rules: [{
                    required: true,
                    message: intl.formatMessage({ id: `${intlPrefix}.newpassword.require.msg` }),
                  }, {
                    validator: this.validateToNextPassword,
                  }],
                  validateTrigger: 'onBlur',
                  validateFirst: true,
                })(
                  <Input
                    autoComplete="off"
                    label={<FormattedMessage id={`${intlPrefix}.newpassword`} />}
                    type="password"
                    style={{ width: inputWidth }}
                    showPasswordEye
                    disabled={user.ldap}
                  />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('confirm', {
                  rules: [{
                    required: true,
                    message: intl.formatMessage({ id: `${intlPrefix}.confirmpassword.require.msg` }),
                  }, {
                    validator: this.compareToFirstPassword,
                  }],
                  validateTrigger: 'onBlur',
                  validateFirst: true,
                })(
                  <Input
                    autoComplete="off"
                    label={<FormattedMessage id={`${intlPrefix}.confirmpassword`} />}
                    type="password"
                    style={{ width: inputWidth }}
                    onBlur={this.handleConfirmBlur}
                    showPasswordEye
                    disabled={user.ldap}
                  />,
                )}
              </FormItem>
              <FormItem>
                <Permission
                  service={['iam-service.user.selfUpdatePassword']}
                  type={'site'}
                  onAccess={() => {
                    setTimeout(() => {
                      this.editFocusInput.input.focus();
                    }, 10);
                  }}
                >
                  <Row>
                    <hr className="hrLine" />
                    <Col span={5} style={{ marginRight: 16 }}>
                      <Button
                        funcType="raised"
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        disabled={user.ldap}
                      ><FormattedMessage id="save" /></Button>
                      <Button
                        funcType="raised"
                        onClick={this.reload}
                        style={{ marginLeft: 16 }}
                        disabled={submitting || user.ldap}
                      ><FormattedMessage id="cancel" /></Button>
                    </Col>
                  </Row>
                </Permission>
              </FormItem>
            </Form>
          </div>
        </Content>
      </Page>
    );
  }
}
