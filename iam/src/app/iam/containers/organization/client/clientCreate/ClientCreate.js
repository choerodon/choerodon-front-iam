import React, { Component } from 'react';
import { Form, Input, Select } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content } from 'Page';
import ClientStore from '../../../../stores/organization/client/ClientStore';
import './ClientCreate.scss';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

@inject('AppState')
@observer

class CreateClient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      buttonClicked: false,
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 跳转函数
   * @param url
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  /**
   * 校验客户端名称
   * @param rule
   * @param value
   * @param callback
   */
  checkName = (rule, value, callback) => {
    const name = value;
    if (name) {
      if (/\s/.test(name)) {
        callback(Choerodon.getMessage('输入存在空格,请检查', 'input Spaces, please check'));
        return;
      }
      ClientStore.checkName(name).then(() => {
        callback();
      }).catch((error) => {
        if (error.response && error.response.status === 400) {
          callback(Choerodon.getMessage('该名称已存在', 'This name already exists'));
        }
      });
    } else {
      callback(Choerodon.getMessage('该字段是必填项', 'The field is required'));
    }
  };

  isJson = (string) => {
    if (typeof string === 'string') {
      const str = string.trim();
      if (str.substr(0, 1) === '{' && str.substr(-1, 1) === '}') {
        try {
          JSON.parse(str);
          return true;
        } catch (e) {
          return false;
        }
      }
    }
    return false;
  }

  /**
   * 校验秘钥
   * @param rule
   * @param value
   * @param callback
   */
  checkSecret = (rule, value, callback) => {
    if (/\s/.test(value)) {
      callback(Choerodon.getMessage('输入存在空格,请检查', 'input Spaces, please check'));
    } else {
      callback();
    }
  };

  resetForm = () => {
    const { resetFields } = this.props.form;
    resetFields();
  }
  /**
   * 创建客户端提交form
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const { AppState } = this.props;
        const menuType = AppState.currentMenuType;
        const organizationId = menuType.id;
        const dataType = data;
        if (dataType.authorizedGrantTypes) {
          dataType.authorizedGrantTypes = dataType.authorizedGrantTypes.join(',');
          this.setState({ submitting: true, buttonClicked: true });
        }
        dataType.organizationId = organizationId;
        ClientStore.createClient(organizationId, { ...dataType })
          .then((value) => {
            if (value) {
              this.props.onSubmit();
            }
          }).catch((error) => {
            Choerodon.handleResponseError(error);
            this.setState({
              submitting: false,
              buttonClicked: false,
            });
          });
      }
    });
  };

  /**
   * 返回主页
   */
  handleReset = () => {
    this.linkToChange('/iam/client');
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const menuType = this.props.AppState.currentMenuType;
    const organizationName = menuType.name;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 100 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };
    const formItemNumLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 100 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };

    const mainContent = (<div>
      <Form layout="vertical" style={{ width: 512 }}>
        <FormItem
          {...formItemLayout}
          label={Choerodon.languageChange('client.name')}
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('客户端名称必填', 'Client name is required'),
              // validator: this.checkName,
            }],
            validateTrigger: 'onBlur',
          })(
            <Input
              label={Choerodon.languageChange('client.name')}
              placeholder={Choerodon.languageChange('client.name')}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={Choerodon.languageChange('client.secret')}
        >
          {getFieldDecorator('secret', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('密钥必填', 'Secret is required'),
            }],
            validateTrigger: 'onBlur',
          })(
            <Input
              label={Choerodon.languageChange('client.secret')}
              placeholder={Choerodon.languageChange('client.secret')}
            />,
          )}
        </FormItem>

        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('authorizedGrantTypes', {
            rules: [
              {
                type: 'array',
                required: true,
                message: Choerodon.getMessage('授权类型必填', 'AuthorizedGrantTypes is required'),
              },
            ],
          })(
            <Select
              mode="multiple"
              label={Choerodon.languageChange('client.authorizedGrantTypes')}
              placeholder={Choerodon.getMessage('请选择授权类型', 'Please choose authorization type')}
              size="default"
            >
              <Option value="password" key="password">password</Option>
              <Option value="implicit" key="implicit">implicit</Option>
              <Option value="client_credentials" key="client_credentials">client_credentials</Option>
              <Option value="authorization_code" key="authorization_code">authorization_code</Option>
              <Option value="refresh_token" key="refresh_token">refresh_token</Option>
            </Select>,
          )}
        </FormItem>
        <FormItem
          {...formItemNumLayout}
        >
          {getFieldDecorator('accessTokenValidity', { initialValue: 60 })(
            <Input
              style={{ width: 300 }}
              type="number"
              label={Choerodon.languageChange('client.accessTokenValidity')}
              size="default"
              min={60}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemNumLayout}
        >
          {getFieldDecorator('refreshTokenValidity', { initialValue: 60 })(
            <Input
              style={{ width: 300 }}
              type="number"
              label={Choerodon.languageChange('client.refreshTokenValidity')}
              size="default"
              min={60}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('webServerRedirectUri')(
            <Input
              label={Choerodon.languageChange('client.webServerRedirectUri')}
              placeholder={Choerodon.languageChange('client.webServerRedirectUri')}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('additionalInformation', {
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (!value || this.isJson(value)) {
                    callback();
                  } else {
                    callback('请输入正确的json字符串');
                  }
                },
              },
            ],
            validateTrigger: 'onBlur',
          })(
            <TextArea 
              rows={3} 
              label={Choerodon.languageChange('client.additionalInformation')}
            />,
          )}
        </FormItem>
      </Form>
    </div>);

    return (
      <div>
        <Content
          style={{ padding: 0 }}
          title={`在组织“${organizationName}”中创建客户端`}
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/client/"
          description="请在下面输入客户端ID、密钥，选择授权类型。您可以选择性输入访问授权超时、授权超时、重定向地址、附加信息。"
        >
          {mainContent}
        </Content>
      </div>
    );
  }
}

export default Form.create({})(withRouter(CreateClient));
