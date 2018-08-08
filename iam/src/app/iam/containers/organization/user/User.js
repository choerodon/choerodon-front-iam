import React, { Component } from 'react';
import { findDOMNode } from 'react-dom'; // ES6
import { Button, Modal, Table, Tooltip, Upload } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import UserEdit from './UserEdit';

import './User.scss';


const { Sidebar } = Modal;
const intlPrefix = 'organization.user';

@withRouter
@injectIntl
@inject('AppState')
@observer
export default class User extends Component {
  state = this.getInitState();
  getInitState() {
    return {
      submitting: false,
      open: false,
      edit: false,
      id: '',
      page: 0,
      isLoading: true,
      params: [],
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
  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadUser();
    });
  };

  onEdit = (id) => {
    this.setState({
      visible: true,
      edit: true,
      selectedData: id,
    });
  };

  loadUser = (paginationIn, sortIn, filtersIn, paramsIn) => {
    const { AppState, UserStore } = this.props;
    const { pagination: paginationState, sort: sortState, filters: filtersState, params: paramsState, } = this.state;
    const { id } = AppState.currentMenuType;
    const pagination = paginationIn || paginationState;
    const sort = sortIn || sortState;
    const filters = filtersIn || filtersState;
    const params = paramsIn || paramsState;
    UserStore.loadUsers(
      id,
      pagination,
      sort,
      filters,
      params
    ).then((data) => {
      UserStore.setUsers(data.content);
      this.setState({
        pagination: {
          current: data.number + 1,
          pageSize: data.size,
          total: data.totalElements,
        },
        filters,
        params,
        sort,
      });
    })
      .catch(error => Choerodon.handleResponseError(error));
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

  handlePageChange(pagination, filters, { field, order }, params) {
    const sorter = [];
    if (field) {
      sorter.push(field);
      if (order === 'descend') {
        sorter.push('desc');
      }
    }
    this.loadUser(pagination, sorter.join(','), filters, params);
  }

  handleDownLoad = (organizationId) => {
    const { UserStore } = this.props;
    UserStore.downloadTemplate(organizationId).then((result) => {
      const blob = new Blob([result], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const linkElement = document.getElementById('c7n-user-download-template');
      linkElement.setAttribute('href', url);
      linkElement.click();
    });
  };

  /**
   *  application/vnd.ms-excel 2003-2007
   *  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 2010
   */
  getUploadProps = (organizationId) => {
    const { intl } = this.props;
    return {
      multiple: false,
      name: 'file',
      accept: 'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      action: organizationId && `${process.env.API_HOST}/iam/v1/organizations/${organizationId}/users/batch_import`,
      headers: {
        Authorization: `bearer ${Choerodon.getCookie('access_token')}`,
      },
      showUploadList: false,
      onChange: ({ file }) => {
        const { status, response } = file;
        if (status === 'done') {
          Choerodon.prompt(intl.formatMessage({id: 'upload.success'}));
        } else if (status === 'error') {
          Choerodon.prompt(`${response.message}`);
        }
      },
    };
  }


  renderUpload() {
    const { processStyle = {} } = this.state;
    return (<div />);
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
      <UserEdit
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
    const { filters, pagination, visible, edit, submitting, params } = this.state;
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
            text: intl.formatMessage({id: `${intlPrefix}.normal`}),
            value: 'false',
          },
          {
            text: intl.formatMessage({id: `${intlPrefix}.lock`}),
            value: 'true',
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
            onClick={this.handleDownLoad.bind(this, organizationId)}
            icon="get_app"
          >
            <FormattedMessage id={`${intlPrefix}.download.template`} />
            <a id="c7n-user-download-template" href="" onClick={(event) => { event.stopPropagation(); }} download="userTemplate.xlsx" />
          </Button>
          {/* <Upload {...this.getUploadProps(organizationId)}>
            <Button
              icon="file_upload"
            >
              <FormattedMessage id={`${intlPrefix}.upload.file`} />
            </Button>
          </Upload> */}
          <Button
            onClick={this.handleRefresh}
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
            filters={params}
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
        {
          this.renderUpload()
        }
      </Page>
    );
  }
}
