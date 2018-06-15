/**
 * Created by hulingfangzi on 2018/6/11.
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, axios } from 'choerodon-front-boot';
import { Input, Button, Form, Icon, Steps, Select, Table, Tooltip, Modal, Row, Col } from 'choerodon-ui';
import querystring from 'query-string';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/dawn';
import './ConfigurationCreate.scss';
import ConfigurationStore from '../../../../stores/globalStores/configuration';

const confirm = Modal.confirm;
const Step = Steps.Step;
const FormItem = Form.Item;
const Option = Select.Option;

@inject('AppState')
@observer

class CreateConfig extends Component {
  state = this.getInitState();

  getInitState() {
    if (ConfigurationStore.getStatus === 'baseon') {
      return {
        current: 1,
        templateDisable: false,
        currentServiceConfig: null,
        initVersion: undefined,
        configId: null,
        yamlData: null,
        service: ConfigurationStore.getCurrentService.name,
        template: ConfigurationStore.getCurrentConfigId,
        version: new Date().getTime().toString(),
      }
    } else if (ConfigurationStore.getStatus === 'edit'){
      return {
        current: 1,
        templateDisable: true,
        currentServiceConfig: null,
        initVersion: undefined,
        configId: null,
        yamlData: null,
        service: ConfigurationStore.getCurrentService.name,
        template: ConfigurationStore.getCurrentConfigId,
        version: ConfigurationStore.getEditConfig.configVersion,
      }
    } else {
      return {
        current: 1,
        templateDisable: true,
        currentServiceConfig: null,
        initVersion: undefined,
        configId: null,
        yamlData: null,
        service: '',
        template: '',
        version: ''
      }
    }
  }

  componentDidMount() {
    this.loadInitData();
    if (ConfigurationStore.getStatus !== 'create') {
      this.loadCurrentServiceConfig(ConfigurationStore.getCurrentService.name);
    }
  }

  loadInitData = () => {
    ConfigurationStore.loadService().then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        ConfigurationStore.setService(data.content || []);
      }
    })
  }

  handleChange = (serviceName) => {
    const { setFieldsValue, getFieldValue } = this.props.form;
    const service = getFieldValue('service');
    if (service && this.state.yamlData) {
      confirm({
        title: '修改微服务',
        content: '确认修改微服务吗？更换微服务将重新生成您的配置信息。',
        onOk: () => {
          setFieldsValue({template: undefined, version: undefined});
          this.loadCurrentServiceConfig(serviceName);
        },
        onCancel() {
          setFieldsValue({ service });
        },
      });
    } else {
      setFieldsValue({template: undefined, version: undefined});
      this.loadCurrentServiceConfig(serviceName);
    }
  }

  generateVersion(configId) {
    const {setFieldsValue, getFieldValue } = this.props.form;
    const template = getFieldValue('template');
    if (template && this.state.yamlData) {
      confirm({
        title: '修改配置模板',
        content: '确认修改配置模板吗？更换配置模板将重新生成您的配置信息。',
        onOk: () => {
          const time = new Date().getTime();
          setFieldsValue({version: time.toString()});
          this.setState({configId, yamlData: null});
        },
        onCancel() {
          setFieldsValue({ template });
        },
      });
    } else {
      const time = new Date().getTime();
      setFieldsValue({version: time.toString()});
      this.setState({configId, yamlData: null});
    }
  }

  loadCurrentServiceConfig(serviceName) {
    const queryObj = {
      page: 0,
      size: 200,
    };
    axios.get(`/manager/v1/services/${serviceName}/configs?${querystring.stringify(queryObj)}`).then((data) => {
      if(data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setState({
          yamlData: null,
          templateDisable: false,
          currentServiceConfig: data.content,
        });
      }
    })
  }

  getSelect() {
    const { templateDisable } = this.state;
    debugger;
    if (ConfigurationStore.currentServiceConfig && templateDisable) {
      return (
        <Select
          disabled={templateDisable}
          style={{ width: '512px' }}
          label="配置模板"
          filterOption={
            (input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filter
        />
      )
    } else if (!templateDisable){
      const { currentServiceConfig } = this.state;
      return (
        <Select
          disabled={templateDisable}
          style={{ width: '512px' }}
          label="配置模板"
          filterOption={
            (input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filter
          onChange={this.generateVersion.bind(this)}
          onSelect={this.test}
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

  /* 第一步 */
  handleRenderService = () => {
    const { templateDisable, service, template, version } = this.state;
    const { getFieldDecorator } = this.props.form;
    const inputWidth = 512;
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
          一个配置属于一个微服务。请先选择一个配置对应的微服务，再选择该微服务下的已有配置为配置模版。您可自定义您的配置版本。系统将自动生成您的配置ID。
        </p>
        <Form>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('service', {
              rules: [{
                required: true,
                message: '请选择微服务',
              }],
              initialValue: service || undefined,
            })(
              <Select
                disabled={ConfigurationStore.getStatus==='edit'}
                style={{ width: inputWidth }}
                label="微服务"
                filterOption={
                  (input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filter
                onChange={this.handleChange}
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
                message: '请选择配置模板',
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
                message: '请输入配置版本',
              }, {
                pattern: /^[0-9a-zA-Z\.]+$/,
                message: '版本号只能包含数字，英文，小数点'
              }],
              initialValue: version || undefined,
            })(
              <Input
                disabled={ConfigurationStore.getStatus==='edit'}
                label="配置版本"
                autoComplete="off"
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
        </Form>
        <section className="serviceSection">
          <Button
            type="primary"
            funcType="raised"
            disabled={templateDisable}
            onClick={this.handleSubmit}
          >
            下一步
          </Button>
        </section>
      </div>
    )
  }

  /* 第一步-下一步 */
  handleSubmit = () => {
    this.props.form.validateFields((err, { service, template, version}) => {
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

  /*第二步-下一步*/
  jumpToEnd = () => {
    this.setState({
      current: 3
    });
  }

  changeStep = (index) => {
    const {version, service, template, yamlData, current } = this.state;
    if (current ===1 && index === 2) {
      this.handleSubmit()
    } else if (current === 3 && index === 2) {
      this.setState({ current: index })
    } else if (index === 3 && version && service && template && yamlData) {
      this.setState({ current: index })
    } else if (index === 1) {
      this.setState({ current: index })
    }
  }

  /* 获取配置yaml */
  getConfigYaml() {
    const configId = this.state.configId || ConfigurationStore.getCurrentConfigId;
    axios.get(`manager/v1/configs/${configId}/yaml`).then((data) => {
      if(data.failed) {
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

  handleChangeValue = (value) => {
    this.setState({yamlData : value});
  }

  createConfig = () => {
    const {service, version, yamlData} = this.state;
    const data = {
      serviceName: service,
      version,
      yaml: yamlData,
      name: service + '-' + version
    }
    ConfigurationStore.createConfig(data).then(({ failed, message }) => {
      if (failed) {
        Choerodon.prompt(message);
      } else {
        Choerodon.prompt("创建成功");
        this.props.history.push('/iam/configuration');
      }
    })
  }

  cancelAll = () => {
    if (ConfigurationStore.getCurrentConfigId) {
      this.loadCurrentServiceConfig(ConfigurationStore.getCurrentService.name);
    }
    this.setState(this.getInitState(), () => {
      this.loadInitData();
    });
  }

  /* 第二步 */
  handleRenderInfo = () => {
    const { yamlData, totalLine } = this.state;
    return (
      <div>
        <p>
          您可以通过yaml文件编辑配置的详细信息。
        </p>
        <span className="yamlInfoTitle">配置信息</span>
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
            下一步
          </Button>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 1)}>上一步</Button>
        </section>
      </div>
    )
  }


  /* 第三步 */
  handleRenderConfirm = () => {
    const { yamlData, totalLine } = this.state;
    const {version, service} = this.state;
    return (
      <div className="confirmContainer">
        <div>
          <Row>
            <Col span={3}>配置ID：</Col><Col span={21}>{ConfigurationStore.getStatus !== 'edit' ? service+'-'+version : ConfigurationStore.getEditConfig.name}</Col>
          </Row>
          <Row>
            <Col span={3}>配置版本：</Col><Col span={21}>{version}</Col>
          </Row>
          <Row>
            <Col span={3}>所属微服务：</Col><Col span={13}>{service}</Col>
          </Row>
        </div>
        <span className="finalyamTitle">配置信息</span>
        <AceEditor
          readOnly
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
            onClick={this.createConfig}
          >
            创建
          </Button>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 2)}>上一步</Button>
          <Button funcType="raised" onClick={this.cancelAll}>取消</Button>
        </section>
      </div>
    )
  }
  /* 获取滚动条状态 */
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

  render() {
    const { current, service, template, version } = this.state;
    let title;
    let description;
    if(ConfigurationStore.getStatus !== 'edit') {
      title = `在平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"中创建配置`;
      description = "一个配置属于一个微服务。请先选择一个配置对应的微服务，再选择该微服务下的已有配置为配置模版。您可自定义您的配置版本。系统将自动生成您的配置ID。";
    } else {
      title = `对配置"${ConfigurationStore.getEditConfig.name}"进行修改`;
      description = "配置管理用来集中管理应用的当前环境的配置，配置修改后能够实时推送到应用端。";
    }
    return (
      <Page>
        <Header
          title={ConfigurationStore.getStatus !== 'edit' ? '创建配置' : '修改配置'}
          backPath="/iam/configuration"
        />
        <Content
          title={title}
          description={description}
          link="http://v0-6.choerodon.io/zh/docs/user-guide/system-configuration/platform/role/"
        >
          <div className="createConfigContainer">
            <Steps current={current}>
              <Step
                onClick={this.changeStep.bind(this, 1)}
                title={<span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>选择微服务及填写配置基本信息</span>}
                status={this.getStatus(1)}
              />
              <Step
                onClick={this.changeStep.bind(this, 2)}
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>修改配置信息</span>}
                status={this.getStatus(2)}
              />
              <Step
                onClick={this.changeStep.bind(this, 3)}
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>确认信息并{ConfigurationStore.getStatus !== 'edit' ? '创建' : '修改'}</span>}
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

export default Form.create({})(withRouter(CreateConfig));
