/**
 * Created by YANG on 2017/6/27.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Button, Input, Select, Upload, Icon } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import UserInfoStore from '../../../../stores/user/userInfo/UserInfoStore';
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

@inject('AppState')
@observer
class UserInfo extends Component {
  state = {
    submitting: false,
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
          callback(intl.formatMessage({id: `${intlPrefix}.email.used.msg`}));
        } else {
          callback();
        }
      }).catch(Choerodon.handleResponseError);
    } else {
      callback();
    }
  };

  handleSubmit = (e) => {
    const { AppState, intl } = this.props;
    const originUser = UserInfoStore.getUserInfo;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values, modify) => {
      if (!err) {
        if (!modify) {
          Choerodon.prompt(intl.formatMessage({id: 'modify.success'}));
          return;
        }
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
            UserInfoStore.setUserInfo(data);
            Choerodon.prompt(intl.formatMessage({id: 'modify.success'}));
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
        <Option key="zh_CN" value="zh_CN"><FormattedMessage id={`${intlPrefix}.language.zhcn`}/></Option>,
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
        <Option key="CTT" value="CTT"><FormattedMessage id={`${intlPrefix}.timezone.ctt`}/></Option>,
        // <Option key="EST" value="EST"><FormattedMessage id={`${intlPrefix}.timezone.est`}/></Option>,
      ];
    }
  }

  getAvatar({ id, realName }) {
    const { intl } = this.props;
    const props = {
      name: 'file',
      accept: 'image/jpeg, image/png, image/jpg',
      action: id && `${process.env.API_HOST}/iam/v1/users/${id}/photo`,
      headers: {
        Authorization: `bearer ${Choerodon.getCookie('access_token')}`,
      },
      showUploadList: false,
      beforeUpload: ({ size }) => {
        if (size > 256 * 1024) {
          Choerodon.prompt(intl.formatMessage({id: `${intlPrefix}.avatar.size.msg`}));
          return false;
        }
      },
      onChange: ({ file }) => {
        const { status, response } = file;
        if (status === 'done') {
          UserInfoStore.setAvatar(response);
          Choerodon.prompt(intl.formatMessage({id: `${intlPrefix}.avatar.success`}));
        } else if (status === 'error') {
          Choerodon.prompt(`${response.message}`);
        }
      },
    };
    const avatar = UserInfoStore.getAvatar;
    return (
      <div className="user-info-avatar-wrap" style={{ width: inputWidth }}>
        <div
          className="user-info-avatar"
          style={
            avatar && {
              backgroundImage: `url(${avatar})`,
            }
          }
        >
          {!avatar && realName && realName.charAt(0)}
          <Permission
            service={['iam-service.user.uploadPhoto']}
            type="site"
          >
            <Upload className="user-info-avatar-upload" {...props}>
              <div className="user-info-avatar-upload-button">
                <Icon type="photo_camera" />
              </div>
            </Upload>
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
    const { realName, email, language, timeZone } = user;
    return (
      <Form onSubmit={this.handleSubmit} layout="vertical" className="user-info">
        {this.getAvatar(user)}
        <FormItem
          {...formItemLayout}
        >
          <Icon type="person" className="form-icon" />
          {getFieldDecorator('realName', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: intl.formatMessage({id: `${intlPrefix}.name.require.msg`}),
              },
            ],
            validateTrigger: 'onBlur',
            initialValue: realName,
          })(
            <Input
              autocomplete="off"
              label={<FormattedMessage id={`${intlPrefix}.name`}/>}
              style={{ width: inputWidth }}
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
                message: intl.formatMessage({id: `${intlPrefix}.email.require.msg`}),
              },
              {
                type: 'email',
                message: intl.formatMessage({id: `${intlPrefix}.email.pattern.msg`}),
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
              autocomplete="off"
              label={<FormattedMessage id={`${intlPrefix}.email`}/>}
              style={{ width: inputWidth }}
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
                message: intl.formatMessage({id: `${intlPrefix}.language.require.msg`}),
              },
            ],
            initialValue: language || 'zh_CN',
          })(
            <Select
              label={<FormattedMessage id={`${intlPrefix}.language`}/>}
              style={{ width: inputWidth }}>
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
                message: intl.formatMessage({id: `${intlPrefix}.timezone.require.msg`}),
              }],
            initialValue: timeZone || 'CTT',
          })(
            <Select
              label={<FormattedMessage id={`${intlPrefix}.timezone`}/>}
              style={{ width: inputWidth }}>
              {this.getTimeZoneOptions()}
            </Select>,
          )}
        </FormItem>
        <Permission
          service={['iam-service.user.queryInfo', 'iam-service.user.updateInfo', 'iam-service.user.querySelf']}
          type="site"
        >
          <FormItem>
            <hr className='user-info-divider' />
            <Button
              htmlType="submit"
              funcType="raised"
              type="primary"
              loading={submitting}
            ><FormattedMessage id="save"/></Button>
            <Button
              funcType="raised"
              onClick={this.refresh}
              style={{ marginLeft: 16 }}
              disabled={submitting}
            ><FormattedMessage id="cancel"/></Button>
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
          title={<FormattedMessage id={`${intlPrefix}.header.title`}/>}
        >
          <Button onClick={this.refresh} icon="refresh">
            <FormattedMessage id="refresh"/>
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{name: user.realName}}
        >
          {this.renderForm(user)}
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(injectIntl(UserInfo));
