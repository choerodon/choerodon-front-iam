
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Modal, Table, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import RootUserStore from '../../../stores/global/root-user/RootUserStore';
import MemberLabel from '../../../components/memberLabel/MemberLabel';
import StatusTag from '../../../components/statusTag';
import '../../../common/ConfirmModal.scss';

const { Sidebar } = Modal;
const intlPrefix = 'global.rootuser';

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class RootUser extends Component {
  state = this.getInitState();
  getInitState() {
    return {
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
      filters: {},
      params: [],
      onlyRootUser: false,
      submitting: false,
    };
  }
  componentWillMount() {
    this.reload();
  }

  isEmptyFilters = ({ loginName, realName, enabled, locked }) => {
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
      filters,
    });
    RootUserStore.loadRootUserData(pagination, filters, sort, params).then((data) => {
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
    const { intl } = this.props;
    Modal.confirm({
      className: 'c7n-iam-confirm-modal',
      title: intl.formatMessage({ id: `${intlPrefix}.remove.title` }),
      content: intl.formatMessage({ id: `${intlPrefix}.remove.content` }, {
        name: record.realName,
      }),
      onOk: () => RootUserStore.deleteRootUser(record.id).then(({ failed, message }) => {
        if (failed) {
          Choerodon.prompt(message);
        } else {
          Choerodon.prompt(intl.formatMessage({ id: 'remove.success' }));
          this.reload();
        }
      }),
    });
  }

  handleOk = (e) => {
    const { intl } = this.props;
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
            const memberIds = data.map(info => info.id);
            RootUserStore.addRootUser(memberIds).then(({ failed, message }) => {
              if (failed) {
                Choerodon.prompt(message);
              } else {
                Choerodon.prompt(intl.formatMessage({ id: 'add.success' }));
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
    const { AppState, intl } = this.props;
    const { type } = AppState.currentMenuType;
    const { filters, sort: { columnKey, order } } = this.state;
    const rootUserData = RootUserStore.getRootUserData.slice();
    const columns = [
      {
        title: <FormattedMessage id={`${intlPrefix}.loginname`} />,
        key: 'loginName',
        dataIndex: 'loginName',
        filters: [],
        filteredValue: filters.loginName || [],
        sorter: true,
        sortOrder: columnKey === 'loginName' && order,
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.realname`} />,
        key: 'realName',
        dataIndex: 'realName',
        filters: [],
        filteredValue: filters.realName || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.status.enabled`} />,
        key: 'enabled',
        dataIndex: 'enabled',
        render: enabled => (<StatusTag mode="icon" name={intl.formatMessage({ id: enabled ? 'enable' : 'disable' })} colorCode={enabled ? 'COMPLETED' : 'DISABLE'} />),
        filters: [{
          text: intl.formatMessage({ id: 'enable' }),
          value: 'true',
        }, {
          text: intl.formatMessage({ id: 'disable' }),
          value: 'false',
        }],
        filteredValue: filters.enabled || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.status.locked`} />,
        key: 'locked',
        dataIndex: 'locked',
        filters: [{
          text: intl.formatMessage({ id: `${intlPrefix}.normal` }),
          value: 'false',
        }, {
          text: intl.formatMessage({ id: `${intlPrefix}.locked` }),
          value: 'true',
        }],
        filteredValue: filters.locked || [],
        render: lock => intl.formatMessage({ id: lock ? `${intlPrefix}.locked` : `${intlPrefix}.normal` }),
      },
      {
        title: '',
        width: 100,
        align: 'right',
        render: (text, record) => {
          const { onlyRootUser } = this.state;
          return (
            <div>
              <Permission
                service={['iam-service.user.deleteDefaultUser']}
                type={type}
              >
                <Tooltip
                  title={onlyRootUser ? <FormattedMessage id={`${intlPrefix}.remove.disable.tooltip`} /> : <FormattedMessage id="remove" />}
                  placement={onlyRootUser ? 'bottomRight' : 'bottom'}
                  overlayStyle={{ maxWidth: '300px' }}
                >
                  <Button
                    size="small"
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
        filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
      />
    );
  }
  render() {
    const { AppState, form } = this.props;
    const { type } = AppState.currentMenuType;
    return (
      <Page
        className="root-user-setting"
        service={[
          'iam-service.user.pagingQueryAdminUsers',
          'iam-service.user.addDefaultUsers',
          'iam-service.user.deleteDefaultUser',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Permission
            service={['iam-service.user.addDefaultUsers']}
            type={type}
          >
            <Button
              onClick={this.openSidebar}
              icon="playlist_add"
            >
              <FormattedMessage id="add" />
            </Button>
          </Permission>
          <Button
            icon="refresh"
            onClick={() => {
              this.setState(this.getInitState(), () => {
                this.reload();
              });
            }}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{ name: AppState.getSiteInfo.systemName || 'Choerodon' }}
        >
          {this.renderTable()}
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.add`} />}
            onOk={this.handleOk}
            okText={<FormattedMessage id="add" />}
            cancelText={<FormattedMessage id="cancel" />}
            onCancel={this.closeSidebar}
            visible={this.state.visible}
            confirmLoading={this.state.submitting}
          >
            <Content
              className="sidebar-content"
              code={`${intlPrefix}.add`}
              values={{ name: AppState.getSiteInfo.systemName || 'Choerodon' }}
            >
              <Form layout="vertical">
                <MemberLabel label={<FormattedMessage id={`${intlPrefix}.user`} />} style={{ marginTop: '-15px' }} form={form} />
              </Form>
            </Content>
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
