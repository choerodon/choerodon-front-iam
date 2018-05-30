import React, { Component } from 'react';
import Permission from 'PerComponent';
import { Button, Modal, Popconfirm, Popover, Table, Tag } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Page, { Content, Header } from 'Page';
import ClientCreate from '../clientCreate';
import ClientEdit from '../clientEdit';
import './Client.scss';

const { Sidebar } = Modal;
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

  getSidebarInfo() {
    const { status } = this.state;
    let title = '';
    let content = null;
    switch (status) {
      case 'create':
        title = '创建客户端';
        content = (
          <ClientCreate
            onRef={(ref) => {
              this.clientCreate = ref;
            }}
            onSubmit={this.closeSidebar}
          />
        );
        break;
      case 'edit':
        title = '修改客户端';
        content = (
          <ClientEdit
            onRef={(ref) => {
              this.clientEdit = ref;
            }}
            organizationId={this.state.selectData.organizationId}
            id={this.state.selectData.id}
            onSubmit={this.closeSidebar}
          />
        );
        break;
      default: 
        break;
    }
    return {
      title,
      content,
    };
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
    const { AppState, ClientStore } = this.props;
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
  }

  /**
   * 删除客户端
   */
  handleDelete = (record) => {
    const { ClientStore } = this.props;
    ClientStore.deleteClientById(record.organizationId, record.id).then((status) => {
      if (status) {
        Choerodon.prompt(Choerodon.getMessage('删除成功', 'Success'));
        this.reload();
      } else {
        Choerodon.prompt(Choerodon.getMessage('删除失败', 'Failed'));
      }
    }).catch(() => {
      Choerodon.prompt(Choerodon.getMessage('删除失败', 'Failed'));
    });
  };

  openSidebar = (status, record) => {
    const { ClientStore } = this.props;
    this.setState({
      status,
      visible: true,
    });
    if (record) {
      this.setState({
        selectData: record,
      });
      ClientStore.setClientById(record);
    }
  }

  handleOk = (event) => {
    const { status } = this.state;
    let closeSidebar;
    if (status === 'create') {
      closeSidebar = this.clientCreate.handleSubmit(event);
    }
    if (status === 'edit') {
      closeSidebar = this.clientEdit.handleSubmit(event);
    }
    if (closeSidebar) {
      this.closeSidebar();
    }
  }

  closeSidebar = () => {
    const clientCreate = this.clientCreate;
    const clientEdit = this.clientEdit;
    this.setState({
      visible: false,
    }, () => {
      if (clientCreate) {
        clientCreate.resetForm();
      }
      if (clientEdit) {
        clientEdit.resetForm();
      }
    });
    this.reload();
  }

  render() {
    const { AppState, ClientStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    const organizationName = menuType.name;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    const clientData = ClientStore.getClients;
    const sidebarInfo = this.getSidebarInfo();
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
              type={type}
              organizationId={organizationId}
            >
              <Button
                onClick={() => {
                  this.openSidebar('edit', record);
                }}
                shape="circle"
                icon="mode_edit"
              />
            </Permission>
            <Permission
              service={['iam-service.client.delete']}
              type={type}
              organizationId={organizationId}
            >
              <Popconfirm
                title={`确认删除客户端${record.name}吗?`}
                onConfirm={() => this.handleDelete(record)}
              >
                <Button shape="circle" icon="delete_forever" />
              </Popconfirm>
            </Permission>
          </div>),
      },
    ];

    return (
      <Page>
        <Header title={Choerodon.languageChange('client.title')}>
          <Permission
            service={['iam-service.client.create']}
            type={type}
            organizationId={organizationId}
          >
            <Button
              onClick={() => this.openSidebar('create')}
              icon="playlist_add"
            >
              {Choerodon.languageChange('create')}
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
            pagination={this.state.pagination}
            columns={columns}
            dataSource={clientData}
            rowKey="id"
            onChange={this.handlePageChange}
            loading={ClientStore.isLoading}
            filterBarPlaceholder="过滤表"
          />
          <Sidebar
            title={sidebarInfo.title}
            onOk={this.handleOk}
            onCancel={this.closeSidebar}
            visible={this.state.visible}
            okText={this.state.status === 'create' ? '创建' : '保存'}
            cancelText="取消"
          >
            {sidebarInfo.content}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default withRouter(Client);
