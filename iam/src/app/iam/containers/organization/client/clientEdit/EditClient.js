import React, { Component } from 'react';
import { Form, Input, Select } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Content } from 'Page';
import ClientStore from '../../../../stores/organization/client/ClientStore';
import LoadingBar from '../../../../components/loadingBar';


const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

@inject('AppState')
@observer
class EditClient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      buttonClicked: false,
    };
  }

  componentWillMount() {
    ClientStore.getClientById(this.props.organizationId, this.props.id)
      .subscribe((data) => {
        ClientStore.setClientById(data);
      });
  }

  componentDidMount() {
    this.props.onRef(this);
  }


  resetForm = () => {
    const { resetFields } = this.props.form;
    resetFields();
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
   * 编辑客户端form表单提交
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();
    let closeSidebar = true;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const { AppState } = this.props;
        const menuType = AppState.currentMenuType;
        const organizationId2 = menuType.id;
        const client = ClientStore.getClient;
        const dataType = data;
        if (dataType.authorizedGrantTypes) {
          dataType.authorizedGrantTypes = dataType.authorizedGrantTypes.join(',');
        }
        if (dataType.additionalInformation === '') {
          dataType.additionalInformation = undefined;
        }
        this.setState({ submitting: true, buttonClicked: true });
        ClientStore.updateClient(this.props.organizationId,
          {
            ...data,
            authorizedGrantTypes: dataType.authorizedGrantTypes,
            objectVersionNumber: client.objectVersionNumber,
            organizationId: organizationId2,
          },
          this.props.id)
          .then((value) => {
            if (value) {
              Choerodon.prompt(Choerodon.getMessage('修改成功', 'Success'));
              this.props.onSubmit();
            }
          }).catch((error) => {
            Choerodon.handleResponseError(error);
            this.setState({
              submitting: false,
            });
          });
      } else {
        closeSidebar = false;
      }
    });
    return closeSidebar;
  };


  /**
   * 返回客户端主页
   */
  handleReset = () => {
    this.linkToChange('/iam/client');
  };

  render() {
    const client = ClientStore.getClient;
    const { getFieldDecorator } = this.props.form;
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

    const mainContent = client ? (<div className="client-detail">
      <Form layout="vertical" style={{ width: 512 }}>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('name', {
            initialValue: client.name,
            rules: [{
              required: true,
              message: Choerodon.getMessage('客户端名称必填', 'Client name is required'),
            }, {
              validator: this.checkUsername,
            }],
          })(
            <Input
              label={Choerodon.languageChange('client.name')} 
              disabled
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={Choerodon.languageChange('client.secret')}
        >
          {getFieldDecorator('secret', {
            initialValue: client.secret,
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('密钥必填', 'Secret is required'),
            }],
          })(
            <Input label={Choerodon.languageChange('client.secret')} />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('authorizedGrantTypes', {
            initialValue: client.authorizedGrantTypes ? client.authorizedGrantTypes.split(',') : [],
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
              size="default"
            >
              <Option value="password">password</Option>
              <Option value="implicit">implicit</Option>
              <Option value="client_credentials">client_credentials</Option>
              <Option value="authorization_code">authorization_code</Option>
              <Option value="refresh_token">refresh_token</Option>
            </Select>,
          )}
        </FormItem>
        <FormItem
          {...formItemNumLayout}
        >
          {getFieldDecorator('accessTokenValidity', {
            initialValue: client.accessTokenValidity ?
              parseInt(client.accessTokenValidity, 10) : undefined,
          })(
            <Input
              label={Choerodon.languageChange('client.accessTokenValidity')}
              style={{ width: 300 }}
              type="number"
              size="default"
              min={60}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemNumLayout}
        >
          {getFieldDecorator('refreshTokenValidity', {
            initialValue: client.refreshTokenValidity ?
              parseInt(client.refreshTokenValidity, 10) : undefined,
          })(
            <Input
              label={Choerodon.languageChange('client.refreshTokenValidity')}
              style={{ width: 300 }}
              type="number"
              size="default"
              min={60}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('webServerRedirectUri', {
            initialValue: client.webServerRedirectUri || undefined,
          })(
            <Input label={Choerodon.languageChange('client.webServerRedirectUri')} />,
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
            initialValue: client.additionalInformation || undefined,
          })(
            <TextArea label={Choerodon.languageChange('client.additionalInformation')} rows={3} />,
          )}
        </FormItem>
      </Form>
    </div>) : <LoadingBar />;
    return (
      <div>
        <Content
          style={{ padding: 0 }}
          title={`对客户端“${client && client.name}”进行修改`}
          description="您可以在此修改客户端密钥、授权类型、访问授权超时、授权超时、重定向地址、附加信息。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/client/"
        >
          {mainContent}
        </Content>
      </div>
    );
  }
}

export default Form.create({})(withRouter(EditClient));
