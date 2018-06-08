/*eslint-disable*/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Modal, Table, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import RootUserStore from '../../../stores/globalStores/rootUser/RootUserStore';
import MemberLabel from '../../../components/memberLabel/MemberLabel';

const { Sidebar } = Modal;

@inject('AppState')
@observer
class RootUserSetting extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visible: false,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
      filters: [],
      params: [],
      onlyRootUser: false,
      submitting: false,
    }
  }
  componentWillMount() {
    this.reload();
  }

  isEmptyFilters = ({ loginName, realName, enabled, locked}) => {
    if ((loginName && loginName.length) ||
      (realName && realName.length) ||
      (enabled && enabled.length) ||
      (locked && locked.length)
    ) {
      return false;
    }
    return true;
  }
  reload = (paginationIn, filtersIn, sortIn, paramsIn) => {
    const {
      pagination: paginationState,
      sort: sortState,
      filters: filtersState,
      params: paramsState,
    } = this.state;
    const pagination = paginationIn || paginationState;
    const sort = sortIn || sortState;
    const filters = filtersIn || filtersState;
    const params = paramsIn || paramsState;
    this.setState({
      loading: true,
    });
    RootUserStore.loadRootUserData(pagination, filters, sort, params).then(data => {
      if (this.isEmptyFilters(filters) && !params.length) {
        this.setState({
          onlyRootUser: data.totalElements <= 1,
        });
      }
      RootUserStore.setRootUserData(data.content);
      this.setState({
        pagination: {
          current: data.number + 1,
          pageSize: data.size,
          total: data.totalElements,
        },
        loading: false,
        sort,
        filters,
        params,
      });
    });
  }
  tableChange = (pagination, filters, sort, params) => {
    this.reload(pagination, filters, sort, params);
  }

  openSidebar = () => {
    const { resetFields } = this.props.form;
    resetFields();
    this.setState({
      visible: true,
    });
  }
  closeSidebar = () => {
    this.setState({
      submitting: false,
      visible: false,
    });
  }

  handleDelete = (record) => {
    Modal.confirm({
      title: '移除Root用户',
      content: `确定要移除Root用户"${record.realName}"吗？移除后此用户将不能管理平台及所有组织、项目。`,
      onOk: () => {
        return RootUserStore.deleteRootUser(record.id).then(({ failed, message }) => {
          if (failed) {
            Choerodon.prompt(message);
          } else {
            Choerodon.prompt('移除成功');
            this.reload();
          }
        });
      }
    });
  }

  handleOk = (e) => {
    const { validateFields } = this.props.form;
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const memberNames = values.member;
        this.setState({
          submitting: true,
        });
        RootUserStore.searchMemberIds(memberNames).then((data) => {
          if (data) {
            const memberIds = data.map((info) => {
              return info.id;
            });
            RootUserStore.addRootUser(memberIds).then(({ failed, message }) => {
              if (failed) {
                Choerodon.prompt(message);
              } else {
                Choerodon.prompt('添加成功');
                this.closeSidebar();
                this.reload();
              }
            });
          }
        });
      }
    });
  };

  renderTable() {
    const { AppState } = this.props;
    const { type } = AppState.currentMenuType;
    const { filters, sort: { columnKey, order }, } = this.state;
    const rootUserData = RootUserStore.getRootUserData.slice();
    const columns = [
      {
        title: '登录名',
        key: 'loginName',
        dataIndex: 'loginName',
        filters: [],
        filteredValue: filters.loginName || [],
        sorter: true,
        sortOrder: columnKey === 'loginName' && order,
      },
      {
        title: '用户名',
        key: 'realName',
        dataIndex: 'realName',
        filters: [],
        filteredValue: filters.realName || [],
      },
      {
        title: '启用状态',
        key: 'enabled',
        dataIndex: 'enabled',
        render: enabled => enabled ? '启用' : '禁用',
        filters: [{
          text: '启用',
          value: 'true',
        }, {
          text: '禁用',
          value: 'false',
        }],
        filteredValue: filters.enabled || [],
      },
      {
        title: '安全状态',
        key: 'locked',
        dataIndex: 'locked',
        filters: [{
          text: '正常',
          value: 'false',
        }, {
          text: '锁定',
          value: 'true',
        }],
        filteredValue: filters.locked || [],
        render: lock => lock ? '锁定' : '正常',
      },
      {
        title: '',
        width: 100,
        render: (text, record) => {
          const { onlyRootUser } = this.state;
          return (
            <div>
              <Permission
                service={['iam-service.user.deleteDefaultUser']}
                type={type}
              >
                <Tooltip
                  title={onlyRootUser ? '平台至少需要一个Root用户。要移除当前的Root用户，请先添加另一个Root用户' : '移除'}
                  placement="bottomRight"
                  overlayStyle={{ maxWidth: '300px'}}
                >
                  <Button
                    disabled={onlyRootUser}
                    onClick={this.handleDelete.bind(this, record)}
                    shape="circle"
                    icon="delete_forever"
                  />
                </Tooltip>
              </Permission>
            </div>
          );
        },
      },
    ];
    return (
      <Table
        loading={this.state.loading}
        pagination={this.state.pagination}
        columns={columns}
        indentSize={0}
        dataSource={rootUserData}
        filters={this.state.params}
        rowKey="id"
        onChange={this.tableChange}
        filterBarPlaceholder="过滤表"
      />
    );
  }
  render() {
    const { AppState, form } = this.props;
    const { type } = AppState.currentMenuType;
    return (
      <Page className="root-user-setting">
        <Header title={'Root用户设置'}>
          <Permission
            service={['iam-service.user.addDefaultUsers']}
            type={type}
          >
            <Button
              onClick={this.openSidebar}
              icon="playlist_add"
            >
              添加
            </Button>
          </Permission>
          <Button
            icon="refresh"
            onClick={() => {
              this.setState({
                filters: {},
                loading: true,
                pagination: {
                  current: 1,
                  pageSize: 10,
                  total: '',
                },
                sort: {
                  columnKey: null,
                  order: null,
                },
              }, () => {
                this.reload();
              });
            }}
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”的Root用户设置`}
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/platform/rootuser/"
          description="Root用户能管理平台以及平台中的所有组织和项目。平台中可以有一个或多个Root用户。您可以添加和移除Root用户。"
        >
          {this.renderTable()}
          <Sidebar
            title="添加Root用户"
            onOk={this.handleOk}
            okText="添加"
            cancelText="取消"
            onCancel={this.closeSidebar}
            visible={this.state.visible}
            confirmLoading={this.state.submitting}
          >
            <Content
              style={{ padding: 0 }}
              title={`在平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”中添加Root用户`}
              link="http://choerodon.io/zh/docs/user-guide/system-configuration/platform/rootuser/"
              description="您可以在此添加一个或多个用户，被添加的用户为Root用户"
            >
              <Form>
                <MemberLabel label="用户" style={{ marginTop: '-15px'}} form={form} />
              </Form>
            </Content>
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(RootUserSetting));
