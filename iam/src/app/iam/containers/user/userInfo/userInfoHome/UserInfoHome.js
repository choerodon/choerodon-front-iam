/**
 * Created by YANG on 2017/6/27.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Button, Input, Select, Row, Col, message, Upload, Icon } from 'choerodon-ui';
import { Action, Content, Header, Page, Permission, Remove } from 'choerodon-front-boot';
import UserInfoStore from '../../../../stores/user/userInfo/UserInfoStore';
import './Userinfo.scss';

const FormItem = Form.Item;
const Option = Select.Option;
const inputWidth = 480;
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
    const { edit } = this.props;
    if (!edit || value !== this.state.userInfo.email) {
      UserInfoStore.checkEmailAddress(value).then(({ failed }) => {
        if (failed) {
          callback(Choerodon.getMessage('该邮箱已被使用，请输入其他邮箱', 'Email is already exists'));
        } else {
          callback();
        }
      }).catch(Choerodon.handleResponseError);
    } else {
      callback();
    }
  };

  handleSubmit = (e) => {
    const { AppState } = this.props;
    const originUser = UserInfoStore.getUserInfo;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
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
            UserInfoStore.setUserInfo(data);
            Choerodon.prompt(Choerodon.getMessage('修改成功', 'Success'));
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
        <Option key="zh_CN" value="zh_CN">简体中文</Option>,
        // <Option key="en_US" value="en_US">English</Option>,
      ];
    }
  }

  getTimeZoneOptions() {
    const timeZone = [];
    if (timeZone.length > 0) {
      return timeZone.map(({ code, description }) => (<Option key={code} value={code}>{description}</Option>));
    } else {
      return [
        <Option key="CTT" value="CTT">中国</Option>,
        // <Option key="EST" value="EST">America</Option>,
      ];
    }
  }

  getAvatar({ id, realName }) {
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
          Choerodon.prompt('图标大小不能大于256KB');
          return false;
        }
      },
      onChange: ({ file }) => {
        const { status, response } = file;
        if (status === 'done') {
          UserInfoStore.setAvatar(response);
          Choerodon.prompt(`头像上传成功，请点击保存。`);
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
                message: Choerodon.getMessage('请输入用户名', 'required'),
              },
            ],
            validateTrigger: 'onBlur',
            initialValue: realName,
          })(
            <Input
              autocomplete="off"
              label="用户名"
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
                message: Choerodon.getMessage('请输入邮箱', 'The field is required'),
              },
              {
                type: 'email',
                message: Choerodon.getMessage('请输入正确的邮箱', 'Please enter the correct email format'),
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
              label="邮箱"
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
                required: true, message: Choerodon.getMessage('请选择语言', 'Language is required'),
              },
            ],
            initialValue: language || 'zh_CN',
          })(
            <Select
              label="语言"
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
                required: true, message: Choerodon.getMessage('请选择时区', 'Timezone is required'),
              }],
            initialValue: timeZone || 'CTT',
          })(
            <Select
              label="时区"
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
              text={Choerodon.languageChange('save')}
              htmlType="submit"
              funcType="raised"
              type="primary"
              loading={submitting}
            >保存</Button>
            <Button
              text={Choerodon.languageChange('save')}
              funcType="raised"
              onClick={this.refresh}
              style={{ marginLeft: 16 }}
              disabled={submitting}
            >取消</Button>
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
          title={Choerodon.getMessage('个人信息', 'userInfo')}
        >
          <Button onClick={this.refresh} icon="refresh">
            {Choerodon.getMessage('刷新', 'flush')}
          </Button>
        </Header>
        <Content
          title={`用户“${user.realName}”的个人信息`}
          description="您可以在此修改您的头像、用户名、邮箱、语言、时区。"
          link="http://v0-6.choerodon.io/zh/docs/user-guide/system-configuration/person/information/"
        >
          {this.renderForm(user)}
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(UserInfo);
