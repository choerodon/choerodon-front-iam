/*eslint-disable*/
import React, { Component } from 'react';
import { Button, Form, Icon, Input, Modal, Popover, Radio, Select, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import TestLdap from '../testLdap';
import LoadingBar from '../../../../components/loadingBar';
import './LDAP.scss';


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
      showWhich: '',
      ldapAdminData: '',
    };
  }

  /* 获取同步用户信息 */
  getSyncInfo() {
    const { LDAPStore } = this.props;
    const ldapData = LDAPStore.getLDAPData;
    const { organizationId } = this.state;
    LDAPStore.getSyncInfo(organizationId, ldapData.id).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        LDAPStore.setSyncData(data);
      }
    });
  }

  /**
   * Input后缀提示
   * @param text
   */
  getSuffix(text) {
    return (
      <Popover
        overlayStyle={{ maxWidth: '180px', wordBreak: 'break-all' }}
        className="routePop"
        placement="right"
        trigger="hover"
        content={text}
      >
        <Icon type="help" />
      </Popover>
    );
  }

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

  /* 加载LDAP */
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

  /* 刷新 */
  reload = () => {
    this.loadLDAP();
  };

  /* 开启侧边栏 */
  openSidebar(status) {
    const { LDAPStore } = this.props;
    LDAPStore.setIsShowResult(false);
    if (this.TestLdap) {
      const { resetFields } = this.TestLdap.props.form;
      resetFields();
      LDAPStore.setIsSyncLoading(false);
    }

    if (status === 'connect') {
      LDAPStore.setIsConfirmLoading(false);
    }

    this.setState({
      sidebar: true,
      showWhich: status,
    });
    if (status === 'sync') {
      this.getSyncInfo();
    }
  }

  /* 关闭侧边栏 */
  closeSidebar = () => {
    const { showWhich } = this.state;
    const { LDAPStore } = this.props;
    // if (showWhich === 'sync') {
    //
    // }
    this.setState({
      sidebar: false,
    }, () => {
      this.TestLdap.closeSyncSidebar();
    });
  };

  /* 是否显示服务器设置下拉面板 */
  isShowServerSetting = () => {
    this.setState({
      showServer: !this.state.showServer,
    });
  }

  /* 是否显示用户设置属性下拉面板 */
  isShowUserSetting = () => {
    this.setState({
      showUser: !this.state.showUser,
    });
  }

  /* ssl修改状态默认端口号更改 */
  changeSsl() {
    const { getFieldValue, setFieldsValue } = this.props.form;
    setFieldsValue({
      port: getFieldValue('useSSL') === 'Y' ? '389' : '636',
    });
  }

  enableLdap = () => {
    const { LDAPStore, AppState, form } = this.props;
    const {  organizationId } = this.state;
    const ldapData = LDAPStore.getLDAPData;
    if (ldapData.enabled) {
      Modal.confirm({
        title: '停用LDAP',
        content: '确定要停用LDAP吗？停用LDAP后，之前所同步的用户将无法登录平台，且无法使用测试连接和同步用户功能。',
        onOk: () => LDAPStore.disabledLdap(organizationId, ldapData.id).then((data) => {
          if (data.failed) {
            Choerodon.prompt(data.message);
          } else {
            Choerodon.prompt(Choerodon.getMessage('停用成功！', 'disabled success!'));
            LDAPStore.setLDAPData(data);
          }
        })
      });
    } else {
      LDAPStore.enabledLdap(organizationId, ldapData.id).then((data) => {
        if (data.failed) {
          Choerodon.prompt(data.message);
        } else {
          Choerodon.prompt(Choerodon.getMessage('启用成功！', 'enabled success!'));
          LDAPStore.setLDAPData(data);
        }
      })
    }
  }

  /* 表单提交 */
  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({
      showServer: true,
      showUser: true,
    });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { LDAPStore } = this.props;
        const original = LDAPStore.getLDAPData;
        const ldapStatus = values.useSSL === 'Y';
        const ladp = {
          ...values,
          id: original.id,
          objectVersionNumber: original.objectVersionNumber,
        };
        ladp.useSSL = ldapStatus;
        if (!ladp.port) {
          ladp.port = ladp.useSSL ? 636 : 389;
        }
        this.setState({
          saving: true,
        });
        LDAPStore.updateLDAP(this.state.organizationId, LDAPStore.getLDAPData.id, ladp)
          .then((data) => {
            if (data) {
              LDAPStore.setLDAPData(data);
              Choerodon.prompt(Choerodon.getMessage('保存成功！', 'update success!'));
              this.setState({
                saving: false,
              });
              if (LDAPStore.getLDAPData.enabled) {
                LDAPStore.setIsConnectLoading(true);
                LDAPStore.setIsConfirmLoading(true);
                this.openSidebar('adminConnect');
                LDAPStore.testConnect(this.state.organizationId, LDAPStore.getLDAPData.id, ladp)
                  .then((res) => {
                    if (res.failed) {
                      Choerodon.prompt(res.message);
                    } else {
                      LDAPStore.setTestData(res);
                      LDAPStore.setIsConnectLoading(false);
                      LDAPStore.setIsConfirmLoading(false);
                    }
                  });
              }
            } else {
              Choerodon.prompt(Choerodon.getMessage('保存失败！', 'update failed!'));
            }
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

  /* 渲染侧边栏头部 */
  renderSidebarTitle() {
    const { showWhich } = this.state;
    if (showWhich === 'connect' || showWhich === 'adminConnect') {
      return '测试连接';
    } else {
      return '同步用户';
    }
  }

  /* 渲染侧边栏内容 */
  renderSidebarContent() {
    const { sidebar, showWhich } = this.state;
    return (
      <TestLdap
        sidebar={sidebar}
        showWhich={showWhich}
        onRef={(node) => {
          this.TestLdap = node;
        }}
      />
    );
  }

  render() {
    const { LDAPStore, AppState, form } = this.props;
    const { saving, sidebar, showWhich } = this.state;
    const menuType = AppState.currentMenuType;
    const organizationName = menuType.name;
    const ldapData = LDAPStore.getLDAPData;
    const { getFieldDecorator } = form;
    const inputWidth = 512;
    const tips = {
      hostname: '运行 LDAP 的服务器主机名。例如：ldap.example.com',
      ssl: '是否使用SSL会对端口号有影响',
      basedn: 'LDAP目录树的最顶部的根，从根节点搜索用户。例如：cn=users,dc=example,dc=com',
      loginname: '用户登录到 LDAP。例如：user@domain.name 或 cn =用户, dc =域、dc =名称',
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
            {getFieldDecorator('directoryType', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请选择目录类型', 'Please choose category type'),
              }],
              initialValue: ldapData.directoryType ? ldapData.directoryType : undefined,
            })(
              <Select
                getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
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
            {getFieldDecorator('serverAddress', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请输入主机名', 'Please input host name'),
              }],
              initialValue: ldapData.serverAddress ? ldapData.serverAddress : undefined,
            })(
              <Input label="主机名" style={{ width: inputWidth }} suffix={this.getSuffix(tips.hostname)} autocomplete="off" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('useSSL', {
              initialValue: ldapData.useSSL ? 'Y' : 'N',
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
              rules: [{
                pattern: /^[1-9]\d*$/,
                message: Choerodon.getMessage('请输入大于零的整数', 'port must be positive integer'),
              }],
              initialValue: ldapData.port || (ldapData.useSSL ? '636' : '389'),
            })(
              <Input label="端口号" style={{ width: inputWidth }} autocomplete="off" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('baseDn', {
              initialValue: ldapData.baseDn ? ldapData.baseDn : undefined,
            })(
              <Input label="基准DN" suffix={this.getSuffix(tips.basedn)} style={{ width: inputWidth }} autocomplete="off" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('account', {
              initialValue: ldapData.account ? ldapData.account : undefined,
            })(
              <Input label="管理员登录名" suffix={this.getSuffix(tips.loginname)} style={{ width: inputWidth }} autocomplete="off" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('password', {
              initialValue: ldapData.password ? ldapData.password : undefined,
            })(
              <Input label="管理员密码" type="password" style={{ width: inputWidth }} autocomplete="off" />,
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
            {getFieldDecorator('objectClass', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请输入用户对象类', 'Please input user object class'),
              }],
              initialValue: ldapData.objectClass ? ldapData.objectClass : undefined,
            })(
              <Input label="用户对象类" style={{ width: inputWidth }} autocomplete="off" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('loginNameField', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请输入登录名属性', 'Please input login name'),
              }],
              initialValue: ldapData.loginNameField ? ldapData.loginNameField : undefined,
            })(
              <Input label="登录名属性" style={{ width: inputWidth }} autocomplete="off" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('emailField', {
              rules: [{
                required: true,
                message: Choerodon.getMessage('请输入邮箱属性', 'Please input email'),
              }],
              initialValue: ldapData.emailField ? ldapData.emailField : undefined,
            })(
              <Input label="邮箱属性" style={{ width: inputWidth }} autocomplete="off" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('realNameField', {
              initialValue: ldapData.realNameField ? ldapData.realNameField : undefined,
            })(
              <Input label="用户名属性" style={{ width: inputWidth }} suffix={this.getSuffix(tips.username)} autocomplete="off" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('phoneField', {
              initialValue: ldapData.phoneField ? ldapData.phoneField : undefined,
            })(
              <Input label="手机号属性" style={{ width: inputWidth }} autocomplete="off" />,
            )}
          </FormItem>
        </div>
        <Permission service={['iam-service.ldap.update']}>
          <div className="btnGroup">
            <Button
              funcType="raised"
              type="primary"
              htmlType="submit"
              loading={saving}
            >{ldapData.enabled ? '保存并测试' : '保存'}</Button>
            <Button
              funcType="raised"
              onClick={() => {
                const { resetFields } = this.props.form;
                resetFields();
              }}
              disabled={saving}
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
            icon={ldapData && ldapData.enabled ? 'remove_circle_outline' : 'finished'}
            onClick={this.enableLdap}
          >
            {ldapData && ldapData.enabled ? '停用' : '启用'}
          </Button>
          <Button
            icon="low_priority"
            onClick={this.openSidebar.bind(this, 'connect')}
            disabled={!(ldapData && ldapData.enabled)}
          >
            {Choerodon.getMessage('测试连接', 'test contact')}
          </Button>
          <Button
            icon="sync"
            onClick={this.openSidebar.bind(this, 'sync')}
            disabled={!(ldapData && ldapData.enabled)}
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
            title={this.renderSidebarTitle()}
            visible={sidebar}
            okText={showWhich === 'sync' ? '同步' : '测试'}
            cancelText={showWhich === 'sync' ? '返回' : '取消'}
            onOk={e => this.TestLdap.handleSubmit(e)}
            onCancel={this.closeSidebar}
            confirmLoading={showWhich === 'sync' ? false : LDAPStore.confirmLoading}
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(LDAP));
