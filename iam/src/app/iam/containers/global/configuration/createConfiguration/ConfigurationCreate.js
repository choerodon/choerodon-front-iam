/**
 * Created by hulingfangzi on 2018/6/11.
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, Permission, axios } from 'choerodon-front-boot';
import { Input, Button, Form, Steps, Select, Modal, Row, Col } from 'choerodon-ui';
import querystring from 'query-string';
import { injectIntl, FormattedMessage } from 'react-intl';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/dawn';
import './ConfigurationCreate.scss';
import ConfigurationStore from '../../../../stores/globalStores/configuration';

const confirm = Modal.confirm;
const Step = Steps.Step;
const FormItem = Form.Item;
const Option = Select.Option;
const intlPrefix = 'global.configuration';

@inject('AppState')
@observer

class CreateConfig extends Component {
  state = this.getInitState();

  getInitState() {
    let initData = {};
    const commonInitData = {
      current: 1,
      templateDisable: true,
      currentServiceConfig: null,
      initVersion: undefined,
      configId: null,
      yamlData: null,
    }
    if (ConfigurationStore.getStatus === 'baseon') {
      initData = {
        ...commonInitData,
        service: ConfigurationStore.getCurrentService.name,
        template: ConfigurationStore.getCurrentConfigId,
        version: this.getDate(),
      }
    } else if (ConfigurationStore.getStatus === 'edit') {
      initData = {
        ...commonInitData,
        service: ConfigurationStore.getCurrentService.name,
        template: ConfigurationStore.getCurrentConfigId,
        version: ConfigurationStore.getEditConfig.configVersion,
      }
    } else {
      initData = {
        ...commonInitData,
        service: '',
        template: '',
        version: ''
      }
    }
    return initData;
  }

  componentDidMount() {
    this.loadInitData();
    ConfigurationStore.setRelatedService({});  // 保存时的微服务信息
    if (ConfigurationStore.getStatus !== 'create') {
      this.loadCurrentServiceConfig(ConfigurationStore.getCurrentService.name);
    }
  }

  loadInitData = () => {
    ConfigurationStore.loadService().then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        ConfigurationStore.setService(data || []);
      }
    })
  }

  /**
   * 选择微服务
   * @param serviceName 服务名称
   */
  handleChange = (serviceName) => {
    const { intl } = this.props;
    const { setFieldsValue, getFieldValue } = this.props.form;
    const service = getFieldValue('service');
    if (service && this.state.yamlData) {
      confirm({
        title: intl.formatMessage({id: `${intlPrefix}.service.modify.title`}),
        content: intl.formatMessage({id: `${intlPrefix}.service.modify.content`}),
        onOk: () => {
          setFieldsValue({ template: undefined, version: undefined });
          this.loadCurrentServiceConfig(serviceName);
        },
        onCancel() {
          setFieldsValue({ service });
        },
      });
    } else {
      setFieldsValue({ template: undefined, version: undefined });
      this.loadCurrentServiceConfig(serviceName);
    }
  }

  /**
   * 选择配置模板
   * @param configId 模板id
   */
  generateVersion(configId) {
    const { intl } = this.props;
    const { setFieldsValue, getFieldValue } = this.props.form;
    const template = getFieldValue('template');
    if (template && this.state.yamlData) {
      confirm({
        title: intl.formatMessage({id: `${intlPrefix}.template.modify.title`}),
        content: intl.formatMessage({id: `${intlPrefix}.template.modify.content`}),
        onOk: () => {
          const version = this.getDate();
          setFieldsValue({ version });
          this.setState({ configId, yamlData: null });
        },
        onCancel() {
          setFieldsValue({ template });
        },
      });
    } else {
      const version = this.getDate();
      setFieldsValue({ version });
      this.setState({ configId, yamlData: null });
    }
  }

  /**
   * 根据所选微服务 获取配置模板
   * @param serviceName 微服务名称
   */
  loadCurrentServiceConfig(serviceName) {
    const queryObj = {
      page: 0,
      size: 20,
    };
    axios.get(`/manager/v1/services/${serviceName}/configs?${querystring.stringify(queryObj)}`).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setState({
          yamlData: null,
          templateDisable: ConfigurationStore.getStatus !== 'create',
          currentServiceConfig: data.content,
        });
      }
    })
  }


  /* 渲染配置模板下拉框 */
  getSelect() {
    const { templateDisable, currentServiceConfig } = this.state;
      if (ConfigurationStore.getStatus === 'edit' || ConfigurationStore.getStatus === 'baseon') {
        return (
          <Select
            disabled={templateDisable}
            style={{ width: '512px' }}
            label={<FormattedMessage id={`${intlPrefix}.template`}/>}
            filterOption={
              (input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filter
            onChange={this.generateVersion.bind(this)}
          >
            {
              currentServiceConfig && currentServiceConfig.map(({ name, id }) => (
                <Option value={id} key={name}>{name}</Option>
              ))
            }
          </Select>
        )
      } else {
        const { getFieldValue } = this.props.form;
        const service = getFieldValue('service');
        if (!service) {
          return (
            <Select
              disabled={templateDisable}
              style={{ width: '512px' }}
              label={<FormattedMessage id={`${intlPrefix}.template`}/>}
              filterOption={
                (input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filter
            />
          )
        } else {
          return (
            <Select
              disabled={templateDisable}
              style={{ width: '512px' }}
              label={<FormattedMessage id={`${intlPrefix}.template`}/>}
              filterOption={
                (input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filter
              onChange={this.generateVersion.bind(this)}
            >
              {
                currentServiceConfig && currentServiceConfig.map(({ name, id }) => (
                  <Option value={id} key={name}>{name}</Option>
                ))
              }
            </Select>
          )
        }
      }
  }

  /* 版本时间处理 */
  getDate() {
    const date = new Date();
    const y = String(date.getFullYear());
    const m = this.timeFilter(date.getMonth() + 1);
    const d = this.timeFilter(date.getDate());
    const h = this.timeFilter(date.getHours());
    const min = this.timeFilter(date.getMinutes());
    const s = this.timeFilter(date.getSeconds());
    return y + m + d + h + min + s;
  }

  timeFilter(time) {
    if (time < 10) {
      time = '0' + String(time);
    } else {
      time = String(time);
    }
    return time;
  }

  checkVersion = (rule, value, callback) => {
    const { intl } = this.props;
    const { getFieldValue } = this.props.form;
    const serviceName = getFieldValue('service');
    const name = getFieldValue('template');
    const data = {
      configVersion: value,
      name,
      serviceName,
    };
    ConfigurationStore.versionCheck(data).then((data) => {
      if (data.failed) {
        callback(intl.formatMessage({id: 'global.configuration.version.only.msg'}));
      } else {
        callback();
      }
    })
  }

  /* 获取步骤条状态 */
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
  }


  /**
   * 上一步
   * @param index
   */
  changeStep = (index) => {
    this.setState({ current: index })
  }

  /* 获取配置yaml */
  getConfigYaml() {
    const configId = this.state.configId || ConfigurationStore.getCurrentConfigId;
    axios.get(`manager/v1/configs/${configId}/yaml`).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setState({
          yamlData: data.yaml,
          totalLine: data.totalLine,
          current: 2
        });
      }
    })
  }

  /**
   * 获取编辑器内容
   * @param value 编辑器内容
   */
  handleChangeValue = (value) => {
    this.setState({ yamlData: value });
  }


  /* 第一步 */
  handleRenderService = () => {
    const { intl } = this.props;
    const { templateDisable, service, template, version } = this.state;
    const { getFieldDecorator } = this.props.form;
    const inputWidth = 512;
    let btnStatus;
    if (ConfigurationStore.getStatus !== 'create') {
      btnStatus = false;
    } else {
      btnStatus = templateDisable;
    }

    let versionStatus;
    if (ConfigurationStore.getStatus === 'edit') {
      versionStatus = true;
    } else if (ConfigurationStore.getStatus === 'baseon') {
      versionStatus = false;
    } else {
      versionStatus = templateDisable;
    }

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
    return (
      <div>
        <p>
          <FormattedMessage id={`${intlPrefix}.step1.description`}/>
        </p>
        <Form>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('service', {
              rules: [{
                required: true,
                message: intl.formatMessage({id: `${intlPrefix}.service.require.msg`}),
              }],
              initialValue: service || undefined,
            })(
              <Select
                disabled={ConfigurationStore.getStatus !== 'create'}
                style={{ width: inputWidth }}
                label={<FormattedMessage id={`${intlPrefix}.service`}/>}
                filterOption={
                  (input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filter
                onChange={this.handleChange.bind(this)}
              >
                {
                  ConfigurationStore.service.map(({ name }) => (
                    <Option value={name} key={name}>{name}</Option>
                  ))
                }
              </Select>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('template', {
              rules: [{
                required: true,
                message: intl.formatMessage({id: `${intlPrefix}.template.require.msg`}),
              }],
              initialValue: template || undefined,
            })(
              this.getSelect()
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('version', {
              rules: [{
                required: true,
                whitespace: true,
                message: intl.formatMessage({id: `${intlPrefix}.version.require.msg`}),
              }, {
                pattern: /^[a-z0-9\.-]*$/g,
                message: intl.formatMessage({id: `${intlPrefix}.version.pattern.msg`}),
              }, {
                validator: ConfigurationStore.getStatus !== 'edit' ? this.checkVersion : '',
              }],
              initialValue: version || undefined,
              validateFirst: true,
            })(
              <Input
                disabled={versionStatus}
                label={<FormattedMessage id={`${intlPrefix}.configversion`}/>}
                autoComplete="off"
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
        </Form>
        <section className="serviceSection">
          <Permission service={['manager-service.config.queryYaml']}>
            <Button
              type="primary"
              funcType="raised"
              disabled={btnStatus}
              onClick={this.handleSubmit}
            >
              <FormattedMessage id={`${intlPrefix}.step.next`}/>
            </Button>
          </Permission>
        </section>
      </div>
    )
  }

  /* 第一步-下一步 */
  handleSubmit = () => {
    this.props.form.validateFields((err, { service, template, version }) => {
      if (!err) {
        this.setState({
          service,
          template,
          version,
        }, () => {
          if (!this.state.yamlData) {
            this.getConfigYaml();
          } else {
            this.setState({
              current: 2
            })
          }
        })
      }
    })
  }

  /* 第二步 */
  handleRenderInfo = () => {
    const { yamlData, totalLine } = this.state;
    return (
      <div>
        <p>
          <FormattedMessage id={`${intlPrefix}.step2.description`}/>
        </p>
        <span className="yamlInfoTitle"> <FormattedMessage id={`${intlPrefix}.info`}/></span>
        <AceEditor
          onChange={this.handleChangeValue}
          showPrintMargin={false}
          mode="yaml"
          theme="dawn"
          value={yamlData}
          style={{ height: totalLine ? `${totalLine * 16}px` : '500px', width: '100%' }}
        />
        <section className="serviceSection">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.jumpToEnd}
          >
           <FormattedMessage id={`${intlPrefix}.step.next`}/>
          </Button>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 1)}>
             <FormattedMessage id={`${intlPrefix}.step.prev`}/>
          </Button>
        </section>
      </div>
    )
  }

  /*第二步-下一步*/
  jumpToEnd = () => {
    this.setState({
      current: 3
    });
  }

  /* 第三步 */
  handleRenderConfirm = () => {
    const { yamlData, totalLine } = this.state;
    const { version, service } = this.state;
    return (
      <div className="confirmContainer">
        <div>
          <Row>
            <Col span={3}><FormattedMessage id={`${intlPrefix}.configid`} />：</Col><Col
            span={21}>{ConfigurationStore.getStatus !== 'edit' ? service + '.' + version : ConfigurationStore.getEditConfig.name}</Col>
          </Row>
          <Row>
            <Col span={3}><FormattedMessage id={`${intlPrefix}.configversion`}/>：</Col><Col span={21}>{version}</Col>
          </Row>
          <Row>
            <Col span={3}><FormattedMessage id={`${intlPrefix}.service`}/>：</Col><Col span={13}>{service}</Col>
          </Row>
        </div>
        <span className="finalyamTitle"><FormattedMessage id={`${intlPrefix}.info`}/>：</span>
        <AceEditor
          readOnly
          showPrintMargin={false}
          mode="yaml"
          theme="dawn"
          value={yamlData}
          style={{ height: totalLine ? `${totalLine * 16}px` : '500px', width: '100%' }}
        />
        <section className="serviceSection">
          {ConfigurationStore.getStatus !== 'edit' ? (
            <Button
              type="primary"
              funcType="raised"
              onClick={this.createConfig}
            >
              <FormattedMessage id="create"/>
            </Button>
          ) : (
            <Button
              type="primary"
              funcType="raised"
              onClick={this.editConfig}
            >
              <FormattedMessage id="save"/>
            </Button>
          )}
          <Button funcType="raised" onClick={this.changeStep.bind(this, 2)}>
            <FormattedMessage id={`${intlPrefix}.step.prev`}/>
          </Button>
          <Button funcType="raised" onClick={this.cancelAll}>
            <FormattedMessage id="cancel"/>
          </Button>
        </section>
      </div>
    )
  }

  /* 创建配置 */
  createConfig = () => {
    const { intl } = this.props;
    const { service, version, yamlData } = this.state;
    const data = {
      serviceName: service,
      version,
      yaml: yamlData,
      name: service + '.' + version
    }
    ConfigurationStore.createConfig(data).then(({ failed, message }) => {
      if (failed) {
        Choerodon.prompt(message);
      } else {
        const currentService = ConfigurationStore.service.find(service => service.name === data.serviceName);
        ConfigurationStore.setRelatedService(currentService);
        Choerodon.prompt(intl.formatMessage({id: 'create.success'}));
        this.props.history.push('/iam/configuration');
      }
    })
  }

  /* 修改配置 */
  editConfig = () => {
    const { intl } = this.props;
    const data = JSON.parse(JSON.stringify(ConfigurationStore.getEditConfig));
    data.txt = this.state.yamlData;
    const configId = ConfigurationStore.getEditConfig.id;
    ConfigurationStore.modifyConfig(configId, 'yaml', data).then((res) => {
      if (res.failed) {
        Choerodon.prompt(res.message);
      } else {
        const currentService = ConfigurationStore.service.find(service => service.name === this.state.service);
        ConfigurationStore.setRelatedService(currentService);
        Choerodon.prompt(intl.formatMessage({id: 'modify.success'}));
        this.props.history.push('/iam/configuration');
      }
    })
  }

  /* 取消 */
  cancelAll = () => {
    if (ConfigurationStore.getStatus !== 'create') {
      const currentService = ConfigurationStore.service.find(service => service.name === this.state.service);
      ConfigurationStore.setRelatedService(currentService);
    } else {
      ConfigurationStore.setRelatedService(ConfigurationStore.getCurrentService);
    }
    this.props.history.push('/iam/configuration');
  }


  render() {
    const { current, service, template, version } = this.state;
    let code;
    let values;
    if (ConfigurationStore.getStatus !== 'edit') {
      values = {name: `${process.env.HEADER_TITLE_NAME || 'Choerodon'}`};
      if (ConfigurationStore.getStatus === 'create') {
        code = `${intlPrefix}.create`;
      } else {
        code = `${intlPrefix}.create.base`;
      }
    } else {
      code = `${intlPrefix}.modify`;
      values = {
        name: ConfigurationStore.getEditConfig.name,
      };
    }
    return (
      <Page
        service={[
          'manager-service.config.queryYaml'
        ]}
      >
        <Header
          title={<FormattedMessage id={ConfigurationStore.getStatus !== 'edit' ? `${intlPrefix}.create` : `${intlPrefix}.modify`} />}
          backPath="/iam/configuration"
        />
        <Content
          code={code}
          values={values}
        >
          <div className="createConfigContainer">
            <Steps current={current}>
              <Step
                title={
                  <span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>
                    <FormattedMessage id={`${intlPrefix}.step1.title`}/>
                  </span>}
                status={this.getStatus(1)}
              />
              <Step
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}><FormattedMessage id={`${intlPrefix}.step2.title`}/></span>}
                status={this.getStatus(2)}
              />
              <Step
                title={<span style={{
                  color: current === 3 ? '#3F51B5' : '',
                  fontSize: 14
                }}>
                  <FormattedMessage id={ConfigurationStore.getStatus !== 'edit' ?`${intlPrefix}.step3.create.title` : `${intlPrefix}.step3.modify.title`}/>
                </span>}
                status={this.getStatus(3)}
              />
            </Steps>
            <div className="createConfigContent">
              {current === 1 && this.handleRenderService()}
              {current === 2 && this.handleRenderInfo()}
              {current === 3 && this.handleRenderConfirm()}
            </div>
          </div>
        </Content>
      </Page>
    )
  }
}

export default Form.create({})(withRouter(injectIntl(CreateConfig)));
