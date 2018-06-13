/**
 * Created by hulingfangzi on 2018/6/11.
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, axios } from 'choerodon-front-boot';
import { Input, Button, Form, Icon, Steps, Select, Table, Tooltip } from 'choerodon-ui';
import querystring from 'query-string';
import ReactAce from 'react-ace-editor';
import './ConfigurationCreate.scss';
import ConfigurationStore from '../../../../stores/globalStores/configuration';

const Step = Steps.Step;
const FormItem = Form.Item;
const Option = Select.Option;

@inject('AppState')
@observer

class CreateConfig extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      current: 1,
      templateDisable: true,
      currentServiceConfig: [],
      templateLabel: '配置模板',
      initVersion: undefined,
      configId: null,
      yamlData: null,
    }
  }

  componentDidMount() {
    this.loadInitData();
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

  handleChange(serviceName) {
    const {setFieldsValue } = this.props.form;
    setFieldsValue({template: undefined, version: undefined});
    this.loadCurrentServiceConfig(serviceName);
  }

  generateVersion(configId) {
    const {setFieldsValue } = this.props.form;
    const time = new Date().getTime();
    setFieldsValue({version: time.toString()});
    this.setState({configId});
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
          templateDisable: false,
          currentServiceConfig: data.content,
          templateLabel: '请选择配置模板'
        });
      }
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { service, template, version}) => {
      if (!err) {
        this.setState({ current: 2 });
      }
    })
  }

  getSelect() {
    const { templateDisable } = this.state;
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
      return (
        <Select
          disabled={templateDisable}
          style={{ width: '512px' }}
          label={this.state.templateLabel}
          filterOption={
            (input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filter
          onChange={this.generateVersion.bind(this)}
        >
          {
            this.state.currentServiceConfig.map(({ name, id }) => (
              <Option value={id} key={name}>{name}</Option>
            ))
          }
        </Select>
      )
    }
  }

  /* 渲染第一步 */
  handleRenderService = () => {
    const { templateDisable } = this.state;
    const { getFieldDecorator } = this.props.form;
    const template = ConfigurationStore.getCurrentServiceConfig;
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
      <div className="">
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
            })(
              <Select
                style={{ width: inputWidth }}
                label="微服务"
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
              message: '请选择配置模板',
            }],
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
              }],
            })(
              <Input
                label="配置版本"
                autoComplete="off"
                style={{ width: inputWidth }}
                disabled
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

  /* 渲染第二步 */
  handleRenderInfo = () => {
    this.getConfigYaml();
    return (
      <div>
        <p>
          您可以通过yml文件编辑配置的详细信息。
        </p>
        <ReactAce
          value={this.state.yamlData}
          showGutter={false}
        />
      </div>
    )
  }

  getConfigYaml = () => {
    axios.get(`manager/v1/configs/${this.state.configId}`).then((data) => {
      if(data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setState({
          yamlData: data.txt,
        })
      }
    })
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
    const { current } = this.state;
    return (
      <Page>
        <Header
          title="创建配置"
          backPath="/iam/configuration"
        />
        <Content
          title={`平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"的配置管理`}
          description="配置管理用来集中管理应用的当前环境的配置，配置修改后能够实时推送到应用端。"
          link="http://v0-6.choerodon.io/zh/docs/user-guide/system-configuration/platform/role/"
        >
          <div className="createConfigContainer">
            <Steps current={current}>
              <Step
                title={<span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>选择微服务及填写配置基本信息</span>}
                status={this.getStatus(1)}
              />
              <Step
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>修改配置信息</span>}
                status={this.getStatus(2)}
              />
              <Step
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>确认信息并创建</span>}
                status={this.getStatus(3)}
              />
            </Steps>
            <div className="createConfigContent">
              {current === 1 && this.handleRenderService()}
              {current === 2 && this.handleRenderInfo()}
            </div>
          </div>
        </Content>
      </Page>
    )
  }
}

export default Form.create({})(withRouter(CreateConfig));
