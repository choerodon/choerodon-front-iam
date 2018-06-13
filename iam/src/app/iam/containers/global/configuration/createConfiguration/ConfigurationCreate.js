/**
 * Created by hulingfangzi on 2018/6/11.
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, axios } from 'choerodon-front-boot';
import { Button, Form, Icon, Steps, Select, Table, Tooltip } from 'choerodon-ui';
import querystring from 'query-string';
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
    }
  }

  handleChange(serviceId) {
    ConfigurationStore.loadCurrentServiceConfig(serviceId);
  }

  /* 渲染第一步 */
  handleRenderService = () => {
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
                style={{ width: 300 }}
                label="微服务"
                filterOption={
                  (input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filter
                onChange={this.handleChange.bind(this)}
              >
                {
                  ConfigurationStore.service.map(({ name, id }) => (
                    <Option value={id} key={name}>{name}</Option>
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
              <Select
                style={{ width: 300 }}
                label="配置模板"
                filterOption={
                  (input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filter
              />
            )}
          </FormItem>
        </Form>
      </div>
    )
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
            <Steps>
              <Step
                title={<span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>选择微服务及填写配置基本信息</span>}
              />
              <Step
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>修改配置信息</span>}
              />
              <Step
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>确认信息并创建</span>}
              />
            </Steps>
            <div className="createConfigContent">
              {this.state.current === 1 && this.handleRenderService()}
            </div>
          </div>
        </Content>
      </Page>
    )
  }
}

export default Form.create({})(withRouter(CreateConfig));
