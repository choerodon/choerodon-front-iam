/**
 * Created by YANG on 2017/6/27.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Button, Input, Select, Row, Col, message, Spin, Upload } from 'choerodon-ui';
import Permission from 'PerComponent';
import UserInfoStore from '../../../../stores/user/userInfo/UserInfoStore';
import './Userinfo.scss';
import Page, { Header, Content } from 'Page';

const FormItem = Form.Item;
const Option = Select.Option;
const inputWidth = 480;
@inject('AppState')
@observer
class UserInfo extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      submitting: false,
      imgHover: 'none',
    };
    this.checkEmailAddress = this.checkEmailAddress.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadUserInfo = this.loadUserInfo.bind(this);
  }

  componentWillMount() {
    this.loadUserInfo();
    // this.loadLanguage(UserInfoStore);
    // this.loadOrganization(UserInfoStore);
  }

  loadUserInfo = () => {
    const { AppState } = this.props;
    const userId = AppState.getUserId;
    UserInfoStore.setIsLoading(true);
    UserInfoStore.loadUserInfo(userId)
      .then((data) => {
        UserInfoStore.setIsLoading(false);
        UserInfoStore.setUserInfo(data);
      })
      .catch(error => Choerodon.handleResponseError(error));
    this.setState({
      submitting: false,
    });
  };

  checkEmailAddress = (rule, value, callback) => {
    // if (UserInfoStore.userInfo) {
    //   const userInfo = UserInfoStore.userInfo;
    //   const email = userInfo.email;
    //   const organizationId = userInfo.id;

    //   if (value && value !== email) {
    //     UserInfoStore.checkEmails(organizationId, value).then(() => {
    //       callback();
    //     }).catch((err) => {
    //       callback(Choerodon.getMessage(err.response.data.
    // message, 'Invalid email address,please input correct mailbox!'));
    //     });
    //   } else {
    callback();
    // }
    // }
  };

  handleSubmit = (e) => {
    const { AppState } = this.props;
    const originUser = UserInfoStore.userInfo;
    e.preventDefault();
    this.setState({ submitting: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      window.console.log(UserInfoStore.getUserInfo);
      if (!err) {
        this.setState({
          submitting: false,
        });
        const user = {
          ...values,
          objectVersionNumber: originUser.objectVersionNumber,
        };
        delete user.name;
        UserInfoStore.updateUserInfo(user).then((data) => {
          if (data) {
            if (!(originUser.language === user.language)) {
              AppState.setAuthenticated(true);
              if (data.language === 'en_US') {
                AppState.changeLanguageTo('en');
              } else {
                AppState.changeLanguageTo('zh');
              }
            } else {
              UserInfoStore.setUserInfo(data);
              Choerodon.prompt(Choerodon.getMessage('修改成功', 'Success'));
              this.setState({ submitting: false });
            }
            this.loadUserInfo(UserInfoStore);
            this.loadLanguage(UserInfoStore);
            this.loadOrganization(UserInfoStore);
            AppState.loadUserInfo();
          }
        }).catch((error) => {
          Choerodon.handleResponseError(error);
          this.setState({ submitting: false });
          this.loadUserInfo(UserInfoStore);
          this.loadLanguage(UserInfoStore);
          this.loadOrganization(UserInfoStore);
          AppState.loadUserInfo();
        });
      }
      this.setState({
        submitting: false,
      });
    });
  };

  render() {
    const that = this;
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    const loadingBar = (
      <div style={{ display: 'inherit', margin: '200px auto', textAlign: 'center' }}>
        <Spin />
      </div>
    );

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
    const { getFieldDecorator } = this.props.form;
    let language;
    let organization;
    const timeZone = [];
    const user = UserInfoStore.getUserInfo;
    const languageOptions = [];
    if (language) {
      language.content.map((item) => {
        languageOptions.push(<Option key={item.code} value={item.code}>{item.name}</Option>);
        return languageOptions;
      });
    } else {
      languageOptions.push(<Option value="zh_CN">简体中文</Option>);
      languageOptions.push(<Option value="en_US">English</Option>);
    }
    const timeZoneOptions = [];
    if (timeZone.length > 0) {
      timeZone.map((item) => {
        timeZoneOptions.push(<Option key={item.code} value={item.code}>{item.description}</Option>);
        return timeZoneOptions;
      });
    } else {
      timeZoneOptions.push(<Option value="CTT">中国</Option>);
      timeZoneOptions.push(<Option value="EST">America</Option>);
    }
    const props = {
      name: 'file',
      action: user && user.id !== undefined ? `${process.env.API_HOST}/uaa/v1/users/${user.id}/avatar` : '',
      headers: {
        Authorization: `bearer ${Choerodon.getCookie('access_token')}`,
      },
      showUploadList: false,
      beforeUpload: (file) => {
        window.console.log(file.size);
        const size = file.size / 1024;
        if (size > 64) {
          Choerodon.prompt('图标大小不能大于64KB');
        }
        return size < 64;
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          window.console.log(info);
        }
        if (info.file.status === 'done') {
          Choerodon.prompt(`${info.file.name} 更新成功`);
          that.loadUserInfo(UserInfoStore);
          that.loadLanguage(UserInfoStore);
          that.loadOrganization(UserInfoStore);
          AppState.loadUserInfo();
        } else if (info.file.status === 'error') {
          Choerodon.prompt(`${info.file.response.message}`);
        }
      },
    };
    return (
      <Page>
        <Header
          title={Choerodon.getMessage('个人信息', 'userInfo')}
        >
          <Button onClick={() => { this.loadUserInfo(); }} icon="refresh">
            {Choerodon.getMessage('刷新', 'flush')}
          </Button>
        </Header>
        <Content
          title={`用户“${user.realName}”的个人信息`}
          description={(
            <div>
              您可以在此修改您的头像、用户名、邮箱、语言、时区。
              <a target="_blank" href="http://choerodon.io/zh/docs/user-guide/system-configuration/person/information/">了解详情</a>
              <span className="icon-open_in_new" />
            </div>
          )}
        >
          {UserInfoStore.getIsLoading ? loadingBar : (
            <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
              <div style={{ width: inputWidth, textAlign: "center", marginTop: 32 }}>
                {/* <Upload {...props}> */}
                  <div
                    style={{
                      width: '124px',
                      height: '124px',
                      backgroundImage: user && user.avatar ? `url("data:img/jpg;base64,${user.avatar}")` : 'unset',
                      backgroundSize: '100% 100%',
                      cursor: 'default',
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      borderRadius: '50%',
                      backgroundRepeat: 'no-repeat',
                      marginBottom: '1rem',
                      backgroundColor: user && user.avatar ? 'unset' : 'gainsboro',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                    }}
                    onMouseEnter={() => this.setState({ imgHover: 'inline-block' })}
                    onMouseLeave={() => this.setState({ imgHover: 'none' })}
                  >
                    <div style={{ position: 'absolute', whiteSpace: 'nowrap', display: user && user.avatar ? 'none' : 'inline-block' }}>
                      {user.realName}
                    </div>
                    {/* <div
                      style={{
                        width: '100%',
                        height: '100%',
                        opacity: 0.5,
                        background: 'black',
                        position: 'absolute',
                        zIndex: 1,
                        borderRadius: '50%',
                        display: this.state.imgHover,
                      }}
                    />
                    <Button type="primary" style={{ position: 'absolute', zIndex: 2, display: this.state.imgHover }}>
                      更改
                    </Button> */}
                  </div>
                {/* </Upload> */}
                <p className="RealName_title">{user.realName}</p>
              </div>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('realName', {
                  rules: [{
                    required: true,
                    message: Choerodon.getMessage('请输入用户名', 'required'),
                  }],
                  initialValue: user ? user.realName : '',
                })(
                  <span> <span className={'icon-person formIconInfo'} /> <Input disabled value={`${user.realName}`} label="用户名" size="default" style={{ width: inputWidth, marginLeft: 26 }} /> </span>,
                )}
              </FormItem>
              {/* <FormItem
                  {...formItemLayout}
                >
                  {getFieldDecorator('loginName', {
                    rules: [{
                      required: true,
                      message: Choerodon.getMessage('该字段是必输的', 'required'),
                    }],
                    initialValue: user ? user.loginName : '',
                  })(
                    <Input size="default" label="用户名" style={{ width: inputWidth }} disabled />,
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                >
                  {getFieldDecorator('organizationName', {
                    rules: [{
                      required: true,
                      message: Choerodon.getMessage('该字段是必输的', 'required'),
                    }],
                    initialValue: user ? user.organizationId : '',
                  })(
                    <Input size="default" label="组织名称" style={{ width: inputWidth }} disabled />,
                  )}
                </FormItem> */}
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('email', {
                  rules: [
                    {
                      required: true, message: Choerodon.getMessage('请输入邮箱', 'Email is required'),
                    }, {
                      validator: this.checkEmailAddress,
                    }],
                  initialValue: user ? user.email : '',
                })(
                  <span> <span className={'icon-markunread formIconInfo'} /> <Input disabled value={`${user.email}`} label="邮箱" size="default" style={{ width: inputWidth, marginLeft: 26 }} /> </span>,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('language', {
                  rules: [
                    {
                      required: true, message: Choerodon.getMessage('请选择语言', 'Language is required'),
                    }],
                  initialValue: user ? user.language : '',
                })(
                  <span> <span className={'icon-timer formIconInfo'} />
                    <Select disabled label="语言" size="default" defaultValue={`${user.language || 'zh_CN'}`} style={{ width: inputWidth, marginLeft: 26 }}>
                      {languageOptions}
                    </Select> </span>,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('timeZone', {
                  rules: [
                    {
                      required: true, message: Choerodon.getMessage('请选择时区', 'Timezone is required'),
                    }],
                  initialValue: user ? user.timeZone : '',
                })(
                  <span> <span className={'icon-domain formIconInfo'} />
                    <Select disabled label="时区" size="default" defaultValue={`${user.timeZone || 'CTT'}`} style={{ width: inputWidth, marginLeft: 26 }}>
                      {timeZoneOptions}
                    </Select> </span>,
                )}
              </FormItem>
              {/* <FormItem>
                <Permission service={['iam-service.user.queryInfo', 'iam-service.user.updateInfo', 'iam-service.user.querySelf']} type={'site'}>
                  <Row>
                    <hr className='hrLine' />
                    <Col span={5} style={{ marginRight: 16 }}>
                      <Button
                        text={Choerodon.languageChange('save')}
                        htmlType="submit"
                        funcType="raised"
                        type="primary"
                      >保存</Button>
                      <Button
                        text={Choerodon.languageChange('save')}
                        funcType="raised"
                        onClick={this.loadUserInfo}
                        style={{ marginLeft: 16 }}
                      >取消</Button>
                    </Col>
                  </Row>
                </Permission>
              </FormItem> */}
            </Form>
          )}
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(UserInfo);
