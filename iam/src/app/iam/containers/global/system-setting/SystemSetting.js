import React, { Component } from 'react';
import { inject, observer, trace } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Icon, Input, Select, Spin, Upload, Popover, Modal } from 'choerodon-ui';
import { axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import { FormattedMessage, injectIntl } from 'react-intl';
import './SystemSetting.scss';
import '../../../common/ConfirmModal.scss';

const intlPrefix = 'global.system-setting';
const prefixClas = 'c7n-iam-system-setting';
const limitSize = 1024;
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
const cardContentFavicon = (
  <div>
    <p><FormattedMessage id={`${intlPrefix}.favicon.tips`} /></p>
    <div className={`${prefixClas}-tips-favicon`} />
  </div>
);
const cardContentLogo = (
  <div>
    <p><FormattedMessage id={`${intlPrefix}.logo.tips`} /></p>
    <div className={`${prefixClas}-tips-logo`} />
  </div>
);
const cardContentTitle = (
  <div>
    <p><FormattedMessage id={`${intlPrefix}.title.tips`} /></p>
    <div className={`${prefixClas}-tips-title`} />
  </div>
);
const cardContentName = (
  <div>
    <p><FormattedMessage id={`${intlPrefix}.name.tips`} /></p>
    <div className={`${prefixClas}-tips-name`} />
  </div>
);
const cardTitle = (
  <Popover content={cardContentTitle} getPopupContainer={() => document.getElementsByClassName('page-content')[0]}>
    <Icon type="help" style={{ fontSize: 16, color: '#bdbdbd' }} />
  </Popover>
);
const cardName = (
  <Popover content={cardContentName} getPopupContainer={() => document.getElementsByClassName('page-content')[0]}>
    <Icon type="help" style={{ fontSize: 16, color: '#bdbdbd' }} />
  </Popover>
);


@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class SystemSetting extends Component {
  state = {
    loading: false,
    submitting: false,
  };
  componentWillMount() {
    this.init();
  }
  init = () => {
    const { SystemSettingStore } = this.props;
    this.props.form.resetFields();
    axios.get('/iam/v1/system/setting').then((data) => {
      SystemSettingStore.setUserSetting(data);
      SystemSettingStore.setFavicon(data.favicon);
      SystemSettingStore.setLogo(data.systemLogo);
    });
  };
  handleReset = () => {
    const { SystemSettingStore, intl } = this.props;
    SystemSettingStore.resetUserSetting().then(() => {
      window.location.reload(true);
    },
    );
  };
  showDeleteConfirm = () => {
    const that = this;
    const { intl } = this.props;
    confirm({
      className: 'c7n-iam-confirm-modal',
      title: intl.formatMessage({ id: `${intlPrefix}.reset.confirm.title` }),
      content: intl.formatMessage({ id: `${intlPrefix}.reset.confirm.content` }),
      okText: intl.formatMessage({ id: 'yes' }),
      okType: 'danger',
      cancelText: intl.formatMessage({ id: 'no' }),
      onOk() {
        that.handleReset();
      },
      onCancel() {
      },
    });
  };
  faviconContainer() {
    const { SystemSettingStore } = this.props;
    const favicon = SystemSettingStore.getFavicon;
    return (
      <div className={`${prefixClas}-avatar-wrap`}>
        <div className={`${prefixClas}-avatar`} style={favicon ? { backgroundImage: `url(${favicon})` } : {}}>
          <Upload
            className={`${prefixClas}-avatar-button`}
            name="file"
            showUploadList={false}
            accept="image/jpeg, image/png, image/jpg，image/gif"
            beforeUpload={this.beforeUpload}
            action={`${Choerodon.API_HOST}/iam/v1/system/setting/upload/logo`}
            onChange={this.handleFaviconChange}
            headers={{
              Authorization: `bearer ${Choerodon.getCookie('access_token')}`,
            }}
          >
            <div className={`${prefixClas}-avatar-button-icon`}>
              <Icon type="photo_camera" style={{ display: 'block', textAlign: 'center' }} />
            </div>
          </Upload>
        </div>
        <span className={`${prefixClas}-tips`}>
          <FormattedMessage id={`${intlPrefix}.favicon`} />
          <Popover content={cardContentFavicon} getPopupContainer={() => document.getElementsByClassName('page-content')[0]}>
            <Icon type="help" style={{ fontSize: 16, color: '#bdbdbd' }} />
          </Popover>
        </span>
      </div>
    );
  }
  beforeUpload = (file) => {
    const { intl } = this.props;
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      Choerodon.prompt(intl.formatMessage({ id: `${intlPrefix}.file.size.limit` }, { size: `${limitSize / 1024}M` }));
    }
    return isLt1M;
  };
  handleFaviconChange = ({ file }) => {
    const { status, response } = file;
    const { SystemSettingStore } = this.props;
    if (status === 'done') {
      SystemSettingStore.setFavicon(response);
    } else if (status === 'error') {
      Choerodon.prompt(`${response.message}`);
    }
  };
  handleLogoChange = ({ file }) => {
    const { status, response } = file;
    const { SystemSettingStore } = this.props;
    if (status === 'uploading') {
      this.setState({
        loading: true,
      });
    } else if (status === 'done') {
      SystemSettingStore.setLogo(response);
      this.setState({
        loading: false,
      });
    } else if (status === 'error') {
      Choerodon.prompt(`${response.message}`);
      this.setState({
        loading: false,
      });
    }
  };
  getLanguageOptions() {
    return [
      <Option key="zh_CN" value="zh_CN"><FormattedMessage id={`${intlPrefix}.language.zhcn`} /></Option>,
      <Option disabled key="en_US" value="en_US"><FormattedMessage id={`${intlPrefix}.language.enus`} /></Option>,
    ];
  }
  getByteLen = (val) => {
    let len = 0;
    val = val.split('');
    val.forEach((v) => {
      if (v.match(/[^\x00-\xff]/ig) != null) {
        len += 2;
      } else {
        len += 1;
      }
    });
    return len;
  };
  validateToInputName = (rule, value, callback) => {
    if (this.getByteLen(value) > 18) {
      callback('简称需要小于 9 个汉字或 18 个英文字母');
    } else {
      callback();
    }
  };
  validateToPassword = (rule, value, callback) => {
    if (!(/^[a-zA-Z0-9]{6,15}$/.test(value))) {
      callback('密码至少为6位数字或字母组成');
    } else {
      callback();
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const { SystemSettingStore, intl } = this.props;
    this.setState({
      submitting: true,
    });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        this.setState({
          submitting: false,
        });
        return;
      }
      let prevSetting = SystemSettingStore.getUserSetting;
      prevSetting = { ...prevSetting };
      const submitSetting = {
        ...values,
        favicon: SystemSettingStore.getFavicon,
        systemLogo: SystemSettingStore.getLogo,
      };
      const { defaultLanguage, defaultPassword, systemName, systemTitle, favicon, systemLogo } = submitSetting;
      submitSetting.objectVersionNumber = prevSetting.objectVersionNumber;
      if (Object.keys(prevSetting).length) {
        if (Object.keys(prevSetting).some(v => prevSetting[v] !== submitSetting[v])) {
          SystemSettingStore.putUserSetting(submitSetting).then(() => window.location.reload(true));
        } else {
          Choerodon.prompt(intl.formatMessage({ id: `${intlPrefix}.save.conflict` }));
          this.setState({
            submitting: false,
          });
        }
      } else if (defaultLanguage === 'zh_CN' && systemName === 'Choerodon' && systemTitle === 'Choerodon | 企业数字化服务平台' && defaultPassword === 'abcd1234' && !favicon && !systemLogo) {
        Choerodon.prompt(intl.formatMessage({ id: `${intlPrefix}.save.conflict` }));
        this.setState({
          submitting: false,
        });
      } else {
        SystemSettingStore.postUserSetting(submitSetting).then(() => window.location.reload(true));
      }
    });
  };

  render() {
    const { SystemSettingStore, intl, AppState } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { logoLoadingStatus, submitting } = this.state;
    const { defaultLanguage = 'zh_CN', defaultPassword = 'abcd1234', systemName = 'Choerodon', systemTitle = AppState.getSiteInfo.defaultTitle } = SystemSettingStore.getUserSetting;
    const systemLogo = SystemSettingStore.getLogo;
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
    const uploadButton = (
      <div>
        {logoLoadingStatus ? <Spin /> : <div className={'initLogo'} />}
      </div>
    );
    const mainContent = (
      <Form onSubmit={this.handleSubmit} layout="vertical" className={prefixClas}>
        <FormItem>
          {
              this.faviconContainer()
            }
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          <Input style={{ display: 'none' }} />
          {getFieldDecorator('systemName', {
            initialValue: systemName,
            rules: [{
              required: true,
              message: intl.formatMessage({ id: `${intlPrefix}.systemName.error` }),
            }, {
              validator: this.validateToInputName,
            }],
          })(
            <Input
              autoComplete="off"
              label={<FormattedMessage id={`${intlPrefix}.systemName`} />}
              ref={(e) => { this.editFocusInput = e; }}
              maxLength={18}
              showLengthInfo={false}
              suffix={cardTitle}
            />,
          )}
        </FormItem>

        <FormItem
          {...formItemLayout}
        >
          <span className={`${prefixClas}-tips`}>
            <FormattedMessage id={`${intlPrefix}.systemLogo`} />
            <Popover content={cardContentLogo} getPopupContainer={() => document.getElementsByClassName('page-content')[0]}>
              <Icon type="help" style={{ fontSize: 16, color: '#bdbdbd' }} />
            </Popover>
          </span>

          <Upload
            name="file"
            listType="picture-card"
            showUploadList={false}
            accept="image/jpeg, image/png, image/jpg"
            beforeUpload={this.beforeUpload}
            action={`${Choerodon.API_HOST}/iam/v1/system/setting/upload/logo`}
            onChange={this.handleLogoChange}
            headers={{
              Authorization: `bearer ${Choerodon.getCookie('access_token')}`,
            }}
          >
            {systemLogo ? <img src={systemLogo} alt="" style={{ width: '80px', height: '80px' }} /> : uploadButton}
          </Upload>
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          <Input style={{ display: 'none' }} />
          {getFieldDecorator('systemTitle', {
            initialValue: systemTitle,
          })(
            <Input
              autoComplete="off"
              label={<FormattedMessage id={`${intlPrefix}.systemTitle`} />}
              ref={(e) => { this.editFocusInput = e; }}
              maxLength={32}
              showLengthInfo
              suffix={cardName}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          <Input style={{ display: 'none' }} />
          {getFieldDecorator('defaultPassword', {
            initialValue: defaultPassword,
            rules: [{
              required: true,
              message: intl.formatMessage({ id: `${intlPrefix}.defaultPassword.error` }),
            }, {
              validator: this.validateToPassword,
            }],
          })(
            <Input
              autoComplete="off"
              label={<FormattedMessage id={`${intlPrefix}.defaultPassword`} />}
              maxLength={15}
              type="password"
              showPasswordEye
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('defaultLanguage', {
            initialValue: defaultLanguage,
            rules: [{
              required: true,
              message: intl.formatMessage({ id: `${intlPrefix}.defaultLanguage.error` }),
            }],
          })(<Select getPopupContainer={() => document.getElementsByClassName('page-content')[0]} label={<FormattedMessage id={`${intlPrefix}.defaultLanguage`} />}>
            {this.getLanguageOptions()}
          </Select>,
          )}
        </FormItem>
        <div className={`${prefixClas}-divider`} />
        <div>
          <Button
            htmlType="submit"
            funcType="raised"
            type="primary"
            loading={submitting}
          ><FormattedMessage id="save" /></Button>
          <Button
            funcType="raised"
            onClick={this.init}
            style={{ marginLeft: 16 }}
            disabled={submitting}
          ><FormattedMessage id="cancel" /></Button>
        </div>
      </Form>
    );

    return (
      <Page
        service={[
          'iam-service.system-setting.uploadFavicon',
          'iam-service.system-setting.uploadLogo',
          'iam-service.system-setting.addSetting',
          'iam-service.system-setting.updateSetting',
          'iam-service.system-setting.resetSetting',
          'iam-service.system-setting.getSetting',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header`} />}>
          <Button
            onClick={this.init}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
          <Button
            onClick={this.showDeleteConfirm}
            icon="swap_horiz"
          >
            <FormattedMessage id="reset" />
          </Button>
        </Header>
        <Content code={intlPrefix}>
          {mainContent}
        </Content>
      </Page>
    );
  }
}
