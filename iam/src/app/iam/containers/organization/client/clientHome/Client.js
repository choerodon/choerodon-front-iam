import React, { Component } from 'react';
import { Button, Form, Input, Modal, Select, Table, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import LoadingBar from '../../../../components/loadingBar';
import ClientStore from '../../../../stores/organization/client/ClientStore';
import './Client.scss';


const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
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
/**
 * 分页加载条数
 * @type {number}
 */

@inject('AppState')
@observer
class Client extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      page: 0,
      open: false,
      params: null,
      id: null,
      pagination: {
        current: 1,
        pageSize: 10,
        total: '',
      },
      sort: 'id,desc',
      visible: false,
      status: '',
      selectData: {},
    };
  }

  componentDidMount() {
    const { pagination, sort } = this.state;
    this.loadClient(pagination, sort);
  }

  getSidebarContentInfo = () => {
    const menuType = this.props.AppState.currentMenuType;
    const organizationName = menuType.name;
    const client = ClientStore.getClient;
    const { status } = this.state;
    switch (status) {
      case 'create':
        return {
          title: `在组织“${organizationName}”中创建客户端`,
          link: 'http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/client/',
          description: '请在下面输入客户端ID、密钥，选择授权类型。您可以选择性输入访问授权超时、授权超时、重定向地址、附加信息。',
        };
      case 'edit':
        return {
          title: `对客户端“${client && client.name}”进行修改`,
          link: 'http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/client/',
          description: '您可以在此修改客户端密钥、授权类型、访问授权超时、授权超时、重定向地址、附加信息。',
        };
      default:
        return {};
    }
  }
  /**
   * 刷新
   */
  reload = () => {
    const { pagination, sort } = this.state;
    this.loadClient(pagination, sort);
  };

  /**
   * 加载客户端数据
   * @param pages 分页参数
   * @param state 当前search参数
   */
  loadClient = (pagination, sort, filters) => {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    ClientStore.loadClients(organizationId, pagination, sort, filters)
      .then((data) => {
        ClientStore.changeLoading(false);
        ClientStore.setClients(data.content);
        this.setState({
          pagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
        });
      });
  };

  /**
   * 跳转函数
   * @param url
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  /**
   * 分页加载数据
   * @param page
   * @returns {*}
   */
  handlePageChange = (pagination, filters, sorter, params) => {
    const newSorter = sorter.columnKey ? sorter.columnKey : '';
    const newFilters = {
      name: (filters.name && filters.name[0]) || '',
      params: (params && params[0]) || '',
    };
    this.loadClient(pagination, newSorter, newFilters);
  };

  /**
   * 删除客户端
   */
  handleDelete = (record) => {
    Modal.confirm({
      title: '删除客户端',
      content: `确认删除客户端${record.name}吗?`,
      onOk: () => ClientStore.deleteClientById(record.organizationId, record.id).then((status) => {
        if (status) {
          Choerodon.prompt(Choerodon.getMessage('删除成功', 'Success'));
          this.reload();
        } else {
          Choerodon.prompt(Choerodon.getMessage('删除失败', 'Failed'));
        }
      }).catch(() => {
        Choerodon.prompt(Choerodon.getMessage('删除失败', 'Failed'));
      }),
    });
  };

  openSidebar = (status, record = {}) => {
    this.setState({
      status,
      visible: true,
      selectData: record,
    });
    ClientStore.setClientById([]);
    if (record.organizationId && record.id) {
      ClientStore.getClientById(record.organizationId, record.id)
        .subscribe((data) => {
          ClientStore.setClientById(data);
        });
    }
  };

  closeSidebar = () => {
    const { resetFields } = this.props.form;
    resetFields();
    this.setState({
      visible: false,
      submitting: false,
    }, () => {
      this.reload();
    });
  };

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
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    ClientStore.checkName(organizationId, {
      name: value,
    }).then((mes) => {
      if (mes.failed) {
        callback(Choerodon.getMessage('客户端名称已存在，请输入其他客户端名称', 'name existed, please try another'));
      } else {
        callback();
      }
    });
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
  };
  /**
   * 编辑客户端form表单提交
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { form, AppState } = this.props;
    const { status, selectData } = this.state;
    form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const menuType = AppState.currentMenuType;
        const organizationId = menuType.id;
        const dataType = data;
        if (dataType.authorizedGrantTypes) {
          dataType.authorizedGrantTypes = dataType.authorizedGrantTypes.join(',');
        }
        if (status === 'create') {
          dataType.organizationId = organizationId;
          this.setState({
            submitting: true,
          });
          ClientStore.createClient(organizationId, { ...dataType })
            .then((value) => {
              if (value) {
                this.closeSidebar();
                Choerodon.prompt(Choerodon.getMessage('添加成功', 'Success'));
              }
            })
            .catch((error) => {
              Choerodon.handleResponseError(error);
            });
        } else if (status === 'edit') {
          const client = ClientStore.getClient;
          this.setState({
            submitting: true,
          });
          if (dataType.additionalInformation === '') {
            dataType.additionalInformation = undefined;
          }
          ClientStore.updateClient(selectData.organizationId,
            {
              ...data,
              authorizedGrantTypes: dataType.authorizedGrantTypes,
              objectVersionNumber: client.objectVersionNumber,
              organizationId,
            },
            selectData.id)
            .then((value) => {
              if (value) {
                this.closeSidebar();
                Choerodon.prompt(Choerodon.getMessage('修改成功', 'Success'));
              }
            })
            .catch((error) => {
              this.closeSidebar();
              Choerodon.handleResponseError(error);
            });
        }
      }
    });
  };

  renderSidebarContent() {
    const client = ClientStore.getClient || {};
    const { getFieldDecorator } = this.props.form;
    const { status } = this.state;
    const mainContent = client ? (<div className="client-detail">
      <Form layout="vertical" style={{ width: 512 }}>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('name', {
            initialValue: client.name || undefined,
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('客户端名称必填', 'Client name is required'),
            }, {
              validator: status === 'create' && this.checkName,
            }],
            validateTrigger: 'onBlur',
            validateFirst: true,
          })(
            <Input
              label={Choerodon.languageChange('client.name')}
              disabled={status === 'edit'}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={Choerodon.languageChange('client.secret')}
        >
          {getFieldDecorator('secret', {
            initialValue: client.secret || undefined,
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
              getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
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
        <Content className="sidebar-content" {...this.getSidebarContentInfo()}>
          {mainContent}
        </Content>
      </div>
    );
  }

  render() {
    const { AppState } = this.props;
    const { submitting, status, pagination, visible } = this.state;
    const menuType = AppState.currentMenuType;
    const organizationName = menuType.name;
    const clientData = ClientStore.getClients;
    const columns = [
      {
        title: Choerodon.languageChange('client.name'),
        dataIndex: 'name',
        key: 'name',
        filters: [],
        sorter: (a, b) => a.name.localeCompare(b.serviceNamee, 'zh-Hans-CN', { sensitivity: 'accent' }),
      },
      {
        title: '授权类型',
        dataIndex: 'authorizedGrantTypes',
        key: 'authorizedGrantTypes',
        // filters: [
        //   {
        //     value: 'password',
        //     text: 'password',
        //   },
        //   {
        //     value: 'implicit',
        //     text: 'implicit',
        //   },
        //   {
        //     value: 'client_credentials',
        //     text: 'client_credentials',
        //   },
        //   {
        //     value: 'authorization_code',
        //     text: 'authorization_code',
        //   },
        //   {
        //     value: 'refresh_token',
        //     text: 'refresh_token',
        //   },
        // ],
        render: (text) => {
          if (!text) {
            return '';
          }
          const grantTypes = text && text.split(',');
          return grantTypes.map(grantType => (
            <div key={grantType} className="client-granttype-item">
              {grantType}
            </div>
          ));
        },
      },
      {
        title: '',
        width: 100,
        render: (text, record) => (
          <div>
            <Permission
              service={['iam-service.client.update']}
            >
              <Tooltip
                title="修改"
                placement="bottom"
              >
                <Button
                  onClick={() => {
                    this.openSidebar('edit', record);
                  }}
                  shape="circle"
                  icon="mode_edit"
                />
              </Tooltip>
            </Permission>
            <Permission
              service={['iam-service.client.delete']}
            >
              <Tooltip
                title="删除"
                placement="bottom"
              >
                <Button shape="circle" onClick={this.handleDelete.bind(this, record)} icon="delete_forever" />
              </Tooltip>
            </Permission>
          </div>),
      },
    ];
    return (
      <Page>
        <Header title={Choerodon.languageChange('client.title')}>
          <Permission
            service={['iam-service.client.create']}
          >
            <Button
              onClick={() => this.openSidebar('create')}
              icon="playlist_add"
            >
              {Choerodon.getMessage('创建客户端', 'Create Client')}
            </Button>
          </Permission>
          <Button
            onClick={this.reload}
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`组织“${organizationName}”的客户端`}
          description="用户在使用oauth2.0的客户端授权模式认证时需要指定所属的客户端，根据客户端对应的密钥，作用域，认证有效时长和重定向地址等进行认证。客户端还可用于区分微服务环境下的不同模块。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/client/"
        >
          <Table
            size="middle"
            pagination={pagination}
            columns={columns}
            dataSource={clientData}
            rowKey="id"
            onChange={this.handlePageChange}
            loading={ClientStore.isLoading}
            filterBarPlaceholder="过滤表"
          />
          <Sidebar
            title={status === 'create' ? '创建客户端' : '修改客户端'}
            onOk={this.handleSubmit}
            onCancel={this.closeSidebar}
            visible={visible}
            okText={status === 'create' ? '创建' : '保存'}
            cancelText="取消"
            confirmLoading={submitting}
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(Client));
