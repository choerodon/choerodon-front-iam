import React, { Component } from 'react';
import { Checkbox, Form, Input, Button, Select, Radio, Tooltip, Popover, Icon, Modal } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import Permission from 'PerComponent';
import { observer, inject } from 'mobx-react';
import Page, { Content, Header } from 'Page';
import LoadingBar from '../../../../components/loadingBar';
import './LDAP.scss';
import TestLoading from './testLoading';

const { TextArea } = Input;
const Sidebar = Modal.Sidebar;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

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

@inject('AppState')
@observer
class LDAP extends Component {
  constructor(props) {
    super(props);
    this.loadLDAP = this.loadLDAP.bind(this);
    this.state = this.getInitState();
  }

  componentDidMount() {
    this.loadLDAP();
  }

  getInitState() {
    return {
      sidebar: false,
      open: false,
      saving: false,
      organizationId: this.props.AppState.currentMenuType.id,
      value: '',
      showServer: true,
      showUser: true,
      showAdminPwd: false,
      enabled: true,
    };
  }

  /**
   * Input后缀提示
   * @param text
   */
  getSuffix(text) {
    return (
      <Popover
        overlayStyle={{ maxWidth: '180px' }}
        className="routePop"
        placement="right"
        trigger="hover"
        content={text}
      >
        <Icon type="help" />
      </Popover>
    );
  }


  openSidebar = () => {
    this.setState({
      sidebar: true,
    });
  };

  closeSidebar = () => {
    this.setState({
      sidebar: false,
    });
  };

  /**
   * 刷新函数
   */
  reload = () => {
    this.loadLDAP();
  };

  /**
   * 加载LDAP
   */
  loadLDAP = () => {
    const { LDAPStore } = this.props;
    const { organizationId } = this.state;
    LDAPStore.loadLDAP(organizationId).catch((error) => {
      LDAPStore.cleanData();
      const response = error.response;
      if (response) {
        const status = response.status;
        const mess = response.data.message;
        switch (status) {
          case 400:
            Choerodon.prompt(mess);
            break;
          case 404:
            Choerodon.prompt('Not Found!');
            break;
          default:
            break;
        }
        LDAPStore.setIsLoading(false);
      }
    });
    this.setState({
      saving: false,
    });
  };

  /**
   * label后缀提示
   * @param label label文字
   * @param tip 提示文字
   */

  labelSuffix(label, tip) {
    return (
      <div className="labelSuffix">
        <span>
          {label}
        </span>
        <Popover
          overlayStyle={{ maxWidth: '180px' }}
          placement="right"
          trigger="hover"
          content={tip}
        >
          <Icon type="help" />
        </Popover>
      </div>
    );
  }

  isShowServerSetting = () => {
    this.setState({
      showServer: !this.state.showServer,
    });
  }

  isShowUserSetting = () => {
    this.setState({
      showUser: !this.state.showUser,
    });
  }

  changeSsl() {
    const { getFieldValue, setFieldsValue } = this.props.form;
    setFieldsValue({
      port: getFieldValue('port') === 636 ? 398 : 636,
    });
  }


  adminSuffix() {
    return (
      <Icon type={!this.state.showAdminPwd ? 'visibility' : 'visibility_off'} onClick={this.changeAdminSuffixState} />
    );
  }

  changeAdminSuffixState = () => {
    this.setState({
      showAdminPwd: !this.state.showAdminPwd,
    });
  }

  changeStatus = () => {
    this.setState({
      enabled: !this.state.enabled,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { LDAPStore } = this.props;
        const original = LDAPStore.getLDAPData;
        const ldapStatus = values.status;
        const ladp = {
          ...values,
          id: original.id,
          objectVersionNumber: original.objectVersionNumber,
        };
        ladp.status = ldapStatus;
        this.setState({
          saving: true,
        });
        LDAPStore.updateLDAP(this.state.organizationId, LDAPStore.getLDAPData.id, ladp)
          .then((data) => {
            if (data) {
              LDAPStore.setLDAPData(data);
              Choerodon.prompt(Choerodon.getMessage('保存成功！', 'update success!'));
            } else {
              Choerodon.prompt(Choerodon.getMessage('保存失败！', 'update failed!'));
            }
            this.setState({
              saving: false,
            });
          })
          .catch((error) => {
            Choerodon.handleResponseError(error);
            this.setState({
              saving: false,
            });
          });
      }
    });
  };

  renderSidebarContent() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Content
        style={{ padding: 0 }}
        title="测试LDAP连接"
        description="登录您的LDAP服务器需要对您的身份进行验证。请在下面输入您在LDAP服务器中的登录名和密码。"
        link="http://choerodon.io/zh/docs/user-guide/system-configuration/microservice-management/route/"
      >
        <Form>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('ldapname', {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入LDAP登录名',
              }],
            })(
              <Input
                label="LDAP登录名"
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('ldappwd', {
              rules: [{
                required: true,
                whitespace: true,
                message: '请输入LDAP密码',
              }],
            })(
              <Input
                label="LDAP密码"
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
        </Form>
        <div className="resultContainer">
          <TestLoading />
        </div>
      </Content>
    );
  }

  render() {
    const { LDAPStore, AppState, form } = this.props;
    const { saving, enabled } = this.state;
    const menuType = AppState.currentMenuType;
    const organizationName = menuType.name;
    const ldapData = LDAPStore.getLDAPData;
    const { getFieldDecorator } = form;
    const tips = {
      hostname: '运行 LDAP 的服务器主机名。例如ldap.example.com',
      ssl: '默认情况下，请求转发时会将路由规则中的前缀去除',
      basedn: 'LDAP目录树的最顶部的根，从根节点搜索用户。例如: cn=users,dc=example,dc=com',
      loginname: '用户登录到 LDAP。例子: user@domain.name 或 cn =用户, dc =域、dc =名称',
      username: '为空时系统将默认获取登录名的值',
    };
    const mainContent = LDAPStore.getIsLoading ? <LoadingBar /> : (<div>
      <div className="serverContainer">
        <Button shape="circle" funcType="raised" icon={this.state.showServer ? 'expand_more' : 'expand_less'} onClick={this.isShowServerSetting} />
        <span>服务器设置</span>
      </div>
      <Form onSubmit={this.handleSubmit} layout="vertical" className="ldapForm">
        <div style={{ display: this.state.showServer ? 'block' : 'none' }}>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('category', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请选择目录类型', 'Please choose category type'),
              }],
            })(
              <Select
                label={Choerodon.getMessage('目录类型', 'category type')}
                style={{ width: inputWidth }}
              >
                <Option value="Microsoft Active Directory">
                  <Tooltip placement="right" title="微软Windows Server中，负责架构中大型网络环境的集中式目录管理服务" overlayStyle={{ maxWidth: '300px' }}>
                    <span style={{ display: 'inline-block', width: '100%' }}>Microsoft Active Directory</span>
                  </Tooltip>
                </Option>
                <Option value="OpenLDAP">
                  <Tooltip placement="right" title="由OpenLDAP项目开发的轻量级目录访问协议（LDAP）的免费开源实现" overlayStyle={{ maxWidth: '300px' }}>
                    <span style={{ display: 'inline-block', width: '100%' }}>OpenLDAP</span>
                  </Tooltip>
                </Option>
              </Select>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('hostname', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请输入主机名', 'Please input host name'),
              }],
            })(
              <Input label="主机名" style={{ width: inputWidth }} suffix={this.getSuffix(tips.hostname)} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('ssl', {
              initialValue: 'Y',
            })(
              <RadioGroup className="ldapRadioGroup" label={this.labelSuffix('是否使用SSL', tips.ssl)} onChange={this.changeSsl.bind(this)}>
                <Radio value={'Y'}>是</Radio>
                <Radio value={'N'}>否</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('port', {
              initialValue: 636,
            })(
              <Input label="端口号" style={{ width: inputWidth }} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('basedn', {
            })(
              <Input label="基准DN" suffix={this.getSuffix(tips.basedn)} style={{ width: inputWidth }} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('adminname', {
            })(
              <Input label="管理员登录名" suffix={this.getSuffix(tips.loginname)} style={{ width: inputWidth }} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('adminpwd', {
            })(
              <Input label="管理员密码" style={{ width: inputWidth }} suffix={this.adminSuffix()} type={this.state.showAdminPwd ? 'text' : 'password'} />,
            )}
          </FormItem>
        </div>
        <div className="serverContainer">
          <Button shape="circle" funcType="raised" icon={this.state.showUser ? 'expand_more' : 'expand_less'} onClick={this.isShowUserSetting} />
          <span>用户属性设置</span>
        </div>
        <div style={{ display: this.state.showUser ? 'block' : 'none' }}>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('loginname', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请输入登录名', 'Please input login name'),
              }],
            })(
              <Input label="登录名属性" style={{ width: inputWidth }} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('password', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请输入密码', 'Please input password'),
              }],
            })(
              <Input label="密码属性" style={{ width: inputWidth }} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('email', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请输入邮箱', 'Please input email'),
              }],
            })(
              <Input label="邮箱属性" style={{ width: inputWidth }} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('username', {
            })(
              <Input label="用户名属性" style={{ width: inputWidth }} suffix={this.getSuffix(tips.username)} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('phone', {
            })(
              <Input label="手机号属性" style={{ width: inputWidth }} />,
            )}
          </FormItem>
        </div>
        <Permission service={['iam-service.ldap.update']}>
          <div className="btnGroup">
            <Button
              text={Choerodon.languageChange('save')}
              htmlType="submit"
              loading={saving}
              funcType="raised"
              type="primary"
            >{enabled ? '保存并测试' : '保存'}</Button>
            <Button
              funcType="raised"
              disabled={saving}
              onClick={() => {
                const { resetFields } = this.props.form;
                resetFields();
              }}
            >{Choerodon.languageChange('cancel')}
            </Button>
          </div>
        </Permission>
      </Form>
    </div>);

    return (
      <Page>
        <Header title={Choerodon.getMessage('修改LDAP', 'edit LDAP')}>
          <Button
            icon={enabled ? 'remove_circle_outline' : 'finished'}
            onClick={this.changeStatus}
          >
            {enabled ? '停用' : '启用'}
          </Button>
          <Button
            icon="low_priority"
            onClick={this.openSidebar}
            disabled={!enabled}
          >
            {Choerodon.getMessage('测试连接', 'test contact')}
          </Button>
          <Button
            icon="sync"
            disabled={!enabled}
          >
            {Choerodon.getMessage('同步用户', 'update users')}
          </Button>
          <Button
            onClick={this.reload}
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`组织“${organizationName}”的LDAP`}
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/ldap/"
          description="LDAP管理是对组织应用的LDAP信息设置的管理。LDAP只针对LDAP用户，LDAP用户的登录名和密码取自LDAP指向的外部系统中的数据。"
        >
          <div className="ldapContainer">
            {mainContent}
          </div>
          <Sidebar
            className="connectContainer"
            title="测试LDAP连接"
            visible={this.state.sidebar}
            okText="测试"
            cancelText="取消"
            onCancel={this.closeSidebar}
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(LDAP));
