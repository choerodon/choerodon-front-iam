import React, { Component } from 'react';
import { Button, Form, Input, Modal, Select, Table, Tooltip, InputNumber } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
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
const intlPrefix = 'organization.client';
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
  state = this.getInitState();
  getInitState() {
    return {
      submitting: false,
      page: 0,
      open: false,
      id: null,
      params: [],
      filters: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: '',
      },
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
      visible: false,
      status: '',
      selectData: {},
    };
  }

  componentDidMount() {
    this.loadClient();
  }
  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadClient();
    });
  }
  getSidebarContentInfo = () => {
    const menuType = this.props.AppState.currentMenuType;
    const organizationName = menuType.name;
    const client = ClientStore.getClient;
    const { status } = this.state;
    switch (status) {
      case 'create':
        return {
          code: `${intlPrefix}.create`,
          values: {
            name: organizationName,
          },
        };
      case 'edit':
        return {
          code: `${intlPrefix}.modify`,
          values: {
            name: client && client.name,
          },
        };
      default:
        return {};
    }
  }
  /**
   * 加载客户端数据
   * @param pages 分页参数
   * @param state 当前search参数
   */
  loadClient = (paginationIn, sortIn, filtersIn, paramsIn) => {
    const { AppState } = this.props;
    const { pagination: paginationState, sort: sortState, filters: filtersState, params: paramsState, } = this.state;
    const { id: organizationId } = AppState.currentMenuType;
    const pagination = paginationIn || paginationState;
    const sort = sortIn || sortState;
    const filters = filtersIn || filtersState;
    const params = paramsIn || paramsState;
    ClientStore.loadClients(organizationId, pagination, sort, filters, params)
      .then((data) => {
        ClientStore.changeLoading(false);
        ClientStore.setClients(data.content);
        this.setState({
          pagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
          filters,
          sort,
          params,
        });
      });
  };

  /**
   * 分页加载数据
   * @param page
   * @returns {*}
   */
  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadClient(pagination, filters, sorter, params);
  };

  /**
   * 删除客户端
   */
  handleDelete = (record) => {
    const { intl } = this.props;
    Modal.confirm({
      title: intl.formatMessage({id: `${intlPrefix}.delete.title`}),
      content: intl.formatMessage({id: `${intlPrefix}.delete.content`}, {name: record.name}),
      onOk: () => ClientStore.deleteClientById(record.organizationId, record.id).then((status) => {
        if (status) {
          Choerodon.prompt(intl.formatMessage({id: 'delete.success'}));
          this.loadClient();
        } else {
          Choerodon.prompt(intl.formatMessage({id: 'delete.error'}));
        }
      }).catch(() => {
        Choerodon.prompt(intl.formatMessage({id: 'delete.error'}));
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

  closeSidebar = ( nochange = '' ) => {
    const { resetFields } = this.props.form;
    resetFields();
    this.setState({
      visible: false,
      submitting: false,
    }, () => {
      if (nochange !== 'nochange') {
        this.loadClient();
      }
    });
  };

  /**
   * 校验客户端名称
   * @param rule
   * @param value
   * @param callback
   */
  checkName = (rule, value, callback) => {
    const { AppState, intl } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    ClientStore.checkName(organizationId, {
      name: value,
    }).then((mes) => {
      if (mes.failed) {
        callback(intl.formatMessage({id: `${intlPrefix}.name.exist.msg`}));
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
    const { form, AppState, intl } = this.props;
    const { status, selectData } = this.state;
    form.validateFieldsAndScroll((err, data, modify) => {
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
                Choerodon.prompt(intl.formatMessage({id: 'add.success'}));
              }
            })
            .catch((error) => {
              Choerodon.handleResponseError(error);
            });
        } else if (status === 'edit') {
          if (!modify) {
            Choerodon.prompt(intl.formatMessage({id: 'modify.success'}));
            this.closeSidebar('nochange');
            return;
          }
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
                Choerodon.prompt(intl.formatMessage({id: 'modify.success'}));
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
    const { intl } = this.props;
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
              message: intl.formatMessage({id: `${intlPrefix}.name.require.msg`}),
            }, {
              validator: status === 'create' && this.checkName,
            }],
            validateTrigger: 'onBlur',
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({id: `${intlPrefix}.name`})}
              disabled={status === 'edit'}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('secret', {
            initialValue: client.secret || undefined,
            rules: [{
              required: true,
              whitespace: true,
              message: intl.formatMessage({id: `${intlPrefix}.secret.require.msg`}),
            }],
          })(
            <Input
              autoComplete="off"
              label={intl.formatMessage({id: `${intlPrefix}.secret`})}
            />,
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
                message: intl.formatMessage({id: `${intlPrefix}.granttypes.require.msg`}),
              },
            ],
          })(
            <Select
              mode="multiple"
              getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
              label={intl.formatMessage({id: `${intlPrefix}.granttypes`})}
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
            <InputNumber
              autoComplete="off"
              label={intl.formatMessage({id: `${intlPrefix}.accesstokenvalidity`})}
              style={{ width: 300 }}
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
            <InputNumber
              autoComplete="off"
              label={intl.formatMessage({id: `${intlPrefix}.tokenvalidity`})}
              style={{ width: 300 }}
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
            <Input autoComplete="off" label={intl.formatMessage({id: `${intlPrefix}.redirect`})} />,
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
                    callback(intl.formatMessage({id: `${intlPrefix}.additional.pattern.msg`}));
                  }
                },
              },
            ],
            validateTrigger: 'onBlur',
            initialValue: client.additionalInformation || undefined,
          })(
            <TextArea
              autoComplete="off"
              label={intl.formatMessage({id: `${intlPrefix}.additional`})}
              rows={3}
            />,
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
    const { AppState, intl } = this.props;
    const { submitting, status, pagination, visible, filters, params } = this.state;
    const menuType = AppState.currentMenuType;
    const organizationName = menuType.name;
    const clientData = ClientStore.getClients;
    const columns = [
      {
        title: intl.formatMessage({id: 'name'}),
        dataIndex: 'name',
        key: 'name',
        filters: [],
        filteredValue: filters.name || [],
        sorter: (a, b) => a.name.localeCompare(b.serviceNamee, 'zh-Hans-CN', { sensitivity: 'accent' }),
      },
      {
        title: intl.formatMessage({id: `${intlPrefix}.granttypes`}),
        dataIndex: 'authorizedGrantTypes',
        key: 'authorizedGrantTypes',
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
        align: 'right',
        render: (text, record) => (
          <div>
            <Permission
              service={['iam-service.client.update']}
            >
              <Tooltip
                title={<FormattedMessage id="modify"/>}
                placement="bottom"
              >
                <Button
                  onClick={() => {
                    this.openSidebar('edit', record);
                  }}
                  size="small"
                  shape="circle"
                  icon="mode_edit"
                />
              </Tooltip>
            </Permission>
            <Permission
              service={['iam-service.client.delete']}
            >
              <Tooltip
                title={<FormattedMessage id="delete"/>}
                placement="bottom"
              >
                <Button
                  shape="circle"
                  size="small"
                  onClick={this.handleDelete.bind(this, record)}
                  icon="delete_forever" />
              </Tooltip>
            </Permission>
          </div>),
      },
    ];
    return (
      <Page
        service={[
          'iam-service.client.create',
          'iam-service.client.update',
          'iam-service.client.delete',
          'iam-service.client.list',
          'iam-service.client.check',
          'iam-service.client.queryByName',
          'iam-service.client.query',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`}/>}>
          <Permission
            service={['iam-service.client.create']}
          >
            <Button
              onClick={() => this.openSidebar('create')}
              icon="playlist_add"
            >
              <FormattedMessage id={`${intlPrefix}.create`}/>
            </Button>
          </Permission>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh"/>
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{name: organizationName}}
       >
          <Table
            size="middle"
            pagination={pagination}
            columns={columns}
            filters={params}
            dataSource={clientData}
            rowKey="id"
            onChange={this.handlePageChange}
            loading={ClientStore.isLoading}
            filterBarPlaceholder={intl.formatMessage({id: 'filtertable'})}
          />
          <Sidebar
            title={<FormattedMessage id={status === 'create' ? `${intlPrefix}.create` : `${intlPrefix}.modify`}/>}
            onOk={this.handleSubmit}
            onCancel={this.closeSidebar}
            visible={visible}
            okText={<FormattedMessage id={status === 'create' ? 'create' : 'save'}/>}
            cancelText={<FormattedMessage id="cancel"/>}
            confirmLoading={submitting}
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(Client)));
