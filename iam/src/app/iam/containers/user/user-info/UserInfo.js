/**
 * Created by YANG on 2017/6/27.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, Input, Select } from 'choerodon-ui';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import UserInfoStore from '../../../stores/user/user-info/UserInfoStore';
import AvatarUploader from './AvatarUploader';
import './Userinfo.scss';

const FormItem = Form.Item;
const Option = Select.Option;
const inputWidth = 480;
const intlPrefix = 'user.userinfo';
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

@Form.create({})
@injectIntl
@inject('AppState')
@observer
export default class UserInfo extends Component {
  constructor(props) {
    super(props);
    this.editFocusInput = React.createRef();
  }
  state = {
    submitting: false,
    visible: false,
  };

  componentWillMount() {
    this.loadUserInfo();
  }

  loadUserInfo = () => {
    UserInfoStore.setUserInfo(this.props.AppState.getUserInfo);
  };

  refresh = () => {
    this.props.form.resetFields();
    this.loadUserInfo();
  };

  checkEmailAddress = (rule, value, callback) => {
    const { edit, intl } = this.props;
    if (!edit || value !== this.state.userInfo.email) {
      UserInfoStore.checkEmailAddress(value).then(({ failed }) => {
        if (failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.email.used.msg` }));
        } else {
          callback();
        }
      }).catch(Choerodon.handleResponseError);
    } else {
      callback();
    }
  };

  openAvatorUploader = () => {
    this.setState({
      visible: true,
    });
  };

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  };

  handleSubmit = (e) => {
    const { AppState, intl } = this.props;
    const originUser = UserInfoStore.getUserInfo;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values, modify) => {
      Object.keys(values).forEach((key) => {
        // 去除form提交的数据中的全部前后空格
        if (typeof values[key] === 'string') values[key] = values[key].trim();
      });
      if (!err) {
        this.setState({
          submitting: true,
        });
        const user = {
          ...originUser,
          ...values,
          imageUrl: UserInfoStore.getAvatar,
        };
        UserInfoStore.updateUserInfo(user).then((data) => {
          if (data) {
            this.props.form.resetFields();
            UserInfoStore.setUserInfo(data);
            Choerodon.prompt(intl.formatMessage({ id: 'modify.success' }));
            this.setState({ submitting: false });
            AppState.setUserInfo(data);
          }
        }).catch((error) => {
          Choerodon.handleResponseError(error);
          this.setState({ submitting: false });
        });
      }
    });
  };

  getLanguageOptions() {
    let language;
    if (language) {
      return language.content.map(({ code, name }) => (<Option key={code} value={code}>{name}</Option>));
    } else {
      return [
        <Option key="zh_CN" value="zh_CN"><FormattedMessage id={`${intlPrefix}.language.zhcn`} /></Option>,
        // <Option key="en_US" value="en_US"><FormattedMessage id={`${intlPrefix}.language.enus`}/></Option>,
      ];
    }
  }

  getTimeZoneOptions() {
    const timeZone = [];
    if (timeZone.length > 0) {
      return timeZone.map(({ code, description }) => (<Option key={code} value={code}>{description}</Option>));
    } else {
      return [
        <Option key="CTT" value="CTT"><FormattedMessage id={`${intlPrefix}.timezone.ctt`} /></Option>,
        // <Option key="EST" value="EST"><FormattedMessage id={`${intlPrefix}.timezone.est`}/></Option>,
      ];
    }
  }

  getAvatar({ id, realName }) {
    const { visible } = this.state;
    const { intl } = this.props;
    const avatar = UserInfoStore.getAvatar;
    return (
      <div className="user-info-avatar-wrap" style={{ width: inputWidth }}>
        <div
          className="user-info-avatar"
          style={
            avatar && {
              backgroundImage: `url(${Choerodon.fileServer(avatar)})`,
            }
          }
        >
          {!avatar && realName && realName.charAt(0)}
          <Permission
            service={['iam-service.user.uploadPhoto']}
            type="site"
          >
            <Button className="user-info-avatar-button" onClick={this.openAvatorUploader}>
              <div className="user-info-avatar-button-icon">
                <Icon type="photo_camera" />
              </div>
            </Button>
            <AvatarUploader id={id} visible={visible} onVisibleChange={this.handleVisibleChange} />
          </Permission>
        </div>
        <span className="user-info-avatar-title">{realName}</span>
      </div>
    );
  }

  renderForm(user) {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { submitting } = this.state;
    const { loginName, realName, email, language, timeZone, phone } = user;
    return (
      <Form onSubmit={this.handleSubmit} layout="vertical" className="user-info">
        {this.getAvatar(user)}
        <FormItem
          {...formItemLayout}
        >
          <Icon type="assignment_ind" className="form-icon" />
          {getFieldDecorator('loginName', {
            initialValue: loginName,
          })(
            <Input
              disabled
              autoComplete="off"
              label={<FormattedMessage id={`${intlPrefix}.loginname`} />}
              style={{ width: inputWidth }}
              maxLength={32}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          <Icon type="person" className="form-icon" />
          {getFieldDecorator('realName', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.name.require.msg` }),
              },
            ],
            validateTrigger: 'onBlur',
            initialValue: realName,
          })(
            <Input
              autoComplete="off"
              label={<FormattedMessage id={`${intlPrefix}.name`} />}
              style={{ width: inputWidth }}
              ref={(e) => { this.editFocusInput = e; }}
              maxLength={32}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          <Icon type="markunread" className="form-icon" />
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
            initialValue: email,
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={<FormattedMessage id={`${intlPrefix}.email`} />}
              style={{ width: inputWidth }}
              maxLength={64}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          <Icon type="phone_iphone" className="form-icon" />
          {getFieldDecorator('phone', {
            initialValue: phone,
            rules: [
              {
                pattern: /^1[3-9]\d{9}$/,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.phone.pattern.msg` }),
              },
            ],
          })(
            <Input
              autoComplete="off"
              label={<FormattedMessage id={`${intlPrefix}.phone`} />}
              style={{ width: inputWidth }}
              maxLength={11}
              showLengthInfo={false}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          <Icon type="language" className="form-icon" />
          {getFieldDecorator('language', {
            rules: [
              {
                required: true,
                message: intl.formatMessage({ id: `${intlPrefix}.language.require.msg` }),
              },
            ],
            initialValue: language || 'zh_CN',
          })(
            <Select
              label={<FormattedMessage id={`${intlPrefix}.language`} />}
              style={{ width: inputWidth }}
              getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
            >
              {this.getLanguageOptions()}
            </Select>,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          <Icon type="location_city" className="form-icon" />
          {getFieldDecorator('timeZone', {
            rules: [
              {
                required: true,
                message: intl.formatMessage({ id: `${intlPrefix}.timezone.require.msg` }),
              }],
            initialValue: timeZone || 'CTT',
          })(
            <Select
              label={<FormattedMessage id={`${intlPrefix}.timezone`} />}
              style={{ width: inputWidth }}
              getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
            >
              {this.getTimeZoneOptions()}
            </Select>,
          )}
        </FormItem>
        <Permission
          service={['iam-service.user.queryInfo', 'iam-service.user.updateInfo', 'iam-service.user.querySelf']}
          type="site"
          onAccess={() => {
            setTimeout(() => {
              this.editFocusInput.input.focus();
            }, 10);
          }}
        >
          <FormItem>
            <hr className="user-info-divider" />
            <Button
              htmlType="submit"
              funcType="raised"
              type="primary"
              loading={submitting}
            ><FormattedMessage id="save" /></Button>
            <Button
              funcType="raised"
              onClick={this.refresh}
              style={{ marginLeft: 16 }}
              disabled={submitting}
            ><FormattedMessage id="cancel" /></Button>
          </FormItem>
        </Permission>
      </Form>
    );
  }

  render() {
    const user = UserInfoStore.getUserInfo;
    return (
      <Page
        service={[
          'iam-service.user.query',
          'iam-service.user.check',
          'iam-service.user.querySelf',
          'iam-service.user.queryInfo',
          'iam-service.user.updateInfo',
          'iam-service.user.uploadPhoto',
          'iam-service.user.queryProjects',
        ]}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button onClick={this.refresh} icon="refresh">
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          {this.renderForm(user)}
        </Content>
      </Page>
    );
  }
}
