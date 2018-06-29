import React, { Component } from 'react';
import { Button, Modal, Table, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import EditUser from '../editUser';
import './UserHome.scss';

const { Sidebar } = Modal;
const intlPrefix = 'organization.user';

@inject('AppState')
@observer
class User extends Component {
  constructor(props) {
    super(props);
    this.linkToChange = this.linkToChange.bind(this);
    this.state = {
      submitting: false,
      open: false,
      edit: false,
      id: '',
      page: 0,
      isLoading: true,
      params: {},
      filters: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: '',
      },
      sort: 'id,desc',
      visible: false,
      selectedData: '',
    };
  }

  componentDidMount() {
    this.loadUser();
  }

  onEdit = (id) => {
    this.setState({
      visible: true,
      edit: true,
      selectedData: id,
    });
  };

  loadUser = (paginationIn, sortIn, filtersIn) => {
    const { AppState, UserStore } = this.props;
    const { pagination: paginationState, sort: sortState, filters: filtersState } = this.state;
    const { id } = AppState.currentMenuType;
    const pagination = paginationIn || paginationState;
    const sort = sortIn || sortState;
    const filters = filtersIn || filtersState;
    this.setState({
      pagination,
      filters,
    });
    UserStore.loadUsers(
      id,
      pagination,
      sort,
      filters,
    ).then((data) => {
      UserStore.setUsers(data.content);
      this.setState({
        pagination: {
          current: data.number + 1,
          pageSize: data.size,
          total: data.totalElements,
        },
      });
    })
      .catch(error => Choerodon.handleResponseError(error));
  };

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  openNewPage = () => {
    this.setState({
      visible: true,
      edit: false,
    });
  };

  /*
  * 解锁
  * */
  handleUnLock = (record) => {
    const { AppState, UserStore, intl } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    UserStore.unLockUser(organizationId, record.id).then(() => {
      Choerodon.prompt(intl.formatMessage({id: `${intlPrefix}.unlock.success`}));
      this.loadUser();
    }).catch((error) => {
      window.console.log(error);
    });
  };
  /*
  * 启用停用
  * */
  handleAble = (record) => {
    const { UserStore, AppState, intl } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    if (record.enabled) {
      // 禁用
      // debugger;
      UserStore.UnenableUser(organizationId, record.id, !record.enabled).then(() => {
        Choerodon.prompt(intl.formatMessage({id: 'disable.success'}));
        this.loadUser();
      }).catch((error) => {
        Choerodon.prompt(intl.formatMessage({id: 'disable.error'}));
      });
    } else {
      UserStore.EnableUser(organizationId, record.id, !record.enabled).then(() => {
        Choerodon.prompt(intl.formatMessage({id: 'enable.success'}));
        this.loadUser();
      }).catch((error) => {
        Choerodon.prompt(intl.formatMessage({id: 'enable.error'}));
      });
    }
  };
  changeLanguage = (code) => {
    if (code === 'zh_CN') {
      return '简体中文';
    } else if (code === 'en_US') {
      return 'English';
    }
    return null;
  };

  handlePageChange(pagination, filters, { field, order }, barFilters) {
    const sorter = [];
    if (field) {
      sorter.push(field);
      if (order === 'descend') {
        sorter.push('desc');
      }
    }
    this.loadUser(pagination, sorter.join(','), filters);
  }

  renderSideTitle() {
    if (this.state.edit) {
      return <FormattedMessage id={`${intlPrefix}.modify`}/>;
    } else {
      return <FormattedMessage id={`${intlPrefix}.create`}/>;
    }
  }

  renderSideBar() {
    const { selectedData, edit, visible } = this.state;
    return (
      <EditUser
        id={selectedData}
        visible={visible}
        edit={edit}
        onRef={(node) => {
          this.editUser = node;
        }}
        OnUnchangedSuccess={() => {
          this.setState({
            visible: false,
            submitting: false,
          });
        }}
        onSubmit={() => {
          this.setState({
            submitting: true,
          });
        }}
        onSuccess={() => {
          this.setState({
            visible: false,
            submitting: false,
          });
          this.loadUser();
        }}
        onError={() => {
          this.setState({
            submitting: false,
          });
        }}
      />
    );
  }

  render() {
    const { UserStore, AppState, intl } = this.props;
    const { filters, pagination, visible, edit, submitting } = this.state;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    const orgname = menuType.name;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    let data = [];
    if (UserStore.getUsers) {
      data = UserStore.users.slice();
    }
    const columns = [
      {
        title: <FormattedMessage id={`${intlPrefix}.loginname`}/>,
        dataIndex: 'loginName',
        key: 'loginName',
        filters: [],
        filteredValue: filters.loginName || [],
      }, {
        title: <FormattedMessage id={`${intlPrefix}.realname`}/>,
        key: 'realName',
        dataIndex: 'realName',
        filters: [],
        filteredValue: filters.realName || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.source`}/>,
        key: 'ldap',
        render: (text, record) => (
          record.ldap
            ? <FormattedMessage id={`${intlPrefix}.ldap`}/>
            : <FormattedMessage id={`${intlPrefix}.notldap`}/>
        ),
        filters: [
          {
            text: intl.formatMessage({id: `${intlPrefix}.ldap`}),
            value: 'true',
          }, {
            text: intl.formatMessage({id: `${intlPrefix}.notldap`}),
            value: 'false',
          },
        ],
        filteredValue: filters.ldap || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.language`}/>,
        dataIndex: 'language',
        key: 'language',
        render: (text, record) => (
          this.changeLanguage(record.language)
        ),
        filters: [
          {
            text: '简体中文',
            value: 'zh_CN',
          }, {
            text: 'English',
            value: 'en_US',
          },
        ],
        filteredValue: filters.language || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.enabled`}/>,
        key: 'enabled',
        render: (text, record) => (
          record.enabled
            ? <FormattedMessage id="enable"/>
            : <FormattedMessage id="disable"/>
        ),
        filters: [
          {
            text: intl.formatMessage({id: 'enable'}),
            value: 'true',
          }, {
            text: intl.formatMessage({id: 'disable'}),
            value: 'false',
          },
        ],
        filteredValue: filters.enabled || [],
      }, {
        title: <FormattedMessage id={`${intlPrefix}.locked`}/>,
        key: 'locked',
        render: (text, record) => (
          record.locked
            ? <FormattedMessage id={`${intlPrefix}.lock`}/>
            : <FormattedMessage id={`${intlPrefix}.normal`}/>
        ),
        filters: [
          {
            text: intl.formatMessage({id: `${intlPrefix}.lock`}),
            value: 'true',
          }, {
            text: intl.formatMessage({id: `${intlPrefix}.normal`}),
            value: 'false',
          },
        ],
        filteredValue: filters.locked || [],
      }, {
        title: '',
        key: 'action',
        align: 'right',
        width: '130px',
        render: (text, record) => (
          <div>
            <Permission
              service={['iam-service.organization-user.update']}
              type={type}
              organizationId={organizationId}
            >
              <Tooltip
                title={<FormattedMessage id="modify"/>}
                placement="bottom"
              >
                <Button
                  size="small"
                  icon="mode_edit"
                  shape="circle"
                  onClick={this.onEdit.bind(this, record.id)}
                />
              </Tooltip>
            </Permission>
            {record.enabled ? (
              <Permission
                service={['iam-service.organization-user.disableUser']}
                type={type}
                organizationId={organizationId}
              >
                <Tooltip
                  title={<FormattedMessage id="disable"/>}
                  placement="bottom"
                >
                  <Button
                    icon="remove_circle_outline"
                    shape="circle"
                    size="small"
                    onClick={this.handleAble.bind(this, record)}
                  />
                </Tooltip>
              </Permission>
            ) : (
              <Permission
                service={['iam-service.organization-user.enableUser']}
                type={type}
                organizationId={organizationId}
              >
                <Tooltip
                  title={<FormattedMessage id="enable"/>}
                  placement="bottom"
                >
                  <Button
                    icon="finished"
                    shape="circle"
                    size="small"
                    onClick={this.handleAble.bind(this, record)}
                  />
                </Tooltip>
              </Permission>
            )
            }
            {record.locked ?
              <Permission
                service={['iam-service.organization-user.unlock']}
                type={type}
                organizationId={organizationId}
              >
                <Tooltip
                  title={<FormattedMessage id={`${intlPrefix}.unlock`}/>}
                  placement="bottom"
                >
                  <Button size="small" icon="lock_open" shape="circle" onClick={this.handleUnLock.bind(this, record)} />
                </Tooltip>
              </Permission> :
              <Permission
                service={['iam-service.organization-user.unlock']}
                type={type}
                organizationId={organizationId}
              >
                <Button size="small" icon="lock_open" shape="circle" disabled />
              </Permission>
            }
          </div>
        ),
      }];
    return (
      <Page
        service={[
          'iam-service.organization-user.create',
          'iam-service.organization-user.list',
          'iam-service.organization-user.query',
          'iam-service.organization-user.update',
          'iam-service.organization-user.delete',
          'iam-service.organization-user.disableUser',
          'iam-service.organization-user.enableUser',
          'iam-service.organization-user.unlock',
          'iam-service.organization-user.check',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`}/>}>
          <Permission
            service={['iam-service.organization-user.create']}
            type={type}
            organizationId={organizationId}
          >
            <Button
              onClick={this.openNewPage}
              icon="playlist_add"
            >
              <FormattedMessage id={`${intlPrefix}.create`}/>
            </Button>
          </Permission>
          <Button
            onClick={() => this.loadUser()}
            icon="refresh"
          >
            <FormattedMessage id="refresh"/>
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{name: orgname}}
        >
          <Table
            size="middle"
            pagination={pagination}
            columns={columns}
            dataSource={data}
            rowKey="id"
            onChange={this.handlePageChange.bind(this)}
            loading={UserStore.isLoading}
            filterBarPlaceholder={intl.formatMessage({id: 'filtertable'})}
          />
          <Sidebar
            title={this.renderSideTitle()}
            visible={visible}
            okText={<FormattedMessage id={edit ? 'save' : 'create'}/>}
            cancelText={<FormattedMessage id="cancel"/>}
            onOk={e => this.editUser.handleSubmit(e)}
            onCancel={() => {
              this.setState({
                visible: false,
                selectedData: '',
              });
            }}
            confirmLoading={submitting}
          >
            {
              this.renderSideBar()
            }
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(User));
