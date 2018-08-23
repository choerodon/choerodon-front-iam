import React, { Component } from 'react';
import { runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Input, Modal, Table, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { FormattedMessage, injectIntl } from 'react-intl';

const { Sidebar } = Modal;
const FormItem = Form.Item;
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
const inputWidth = 512;

@Form.create()
@withRouter
@injectIntl
@inject('AppState', 'HeaderStore')
@observer
export default class Organization extends Component {
  constructor(props) {
    super(props);
    this.editOrgFocusInput = React.createRef();
    this.creatOrgFocusInput = React.createRef();
  }

  componentWillMount() {
    this.loadOrganizations();
  }

  handleRefresh = () => {
    const { OrganizationStore } = this.props;
    OrganizationStore.refresh();
  };

  loadOrganizations(pagination, filters, sort, params) {
    const { OrganizationStore } = this.props;
    OrganizationStore.loadData(pagination, filters, sort, params);
  }

  // 创建组织侧边
  createOrg = () => {
    const { form, OrganizationStore } = this.props;
    form.resetFields();
    runInAction(() => {
      OrganizationStore.show = 'create';
      OrganizationStore.showSideBar();
    });
    setTimeout(() => {
      this.creatOrgFocusInput.input.focus();
    }, 10);
  };

  handleEdit = (data) => {
    const { form, OrganizationStore } = this.props;
    form.resetFields();
    runInAction(() => {
      OrganizationStore.show = 'edit';
      OrganizationStore.setEditData(data);
      OrganizationStore.showSideBar();
    });
    setTimeout(() => {
      this.editOrgFocusInput.input.focus();
    }, 10);
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { form, intl, OrganizationStore, HeaderStore } = this.props;
    form.validateFields((err, values, modify) => {
      if (!err) {
        OrganizationStore.createOrUpdateOrg(values, modify, HeaderStore)
          .then((message) => {
            OrganizationStore.hideSideBar();
            Choerodon.prompt(intl.formatMessage({ id: message }));
          });
      }
    });
  };

  handleCancelFun = () => {
    const { OrganizationStore } = this.props;
    OrganizationStore.hideSideBar();
  };

  handleDisable = ({ enabled, id }) => {
    const { intl, OrganizationStore } = this.props;
    OrganizationStore.toggleDisable(id, enabled)
      .then(() => {
        Choerodon.prompt(intl.formatMessage({ id: enabled ? 'disable.success' : 'enable.success' }));
      })
      .catch(Choerodon.handleResponseError);
  };

  /**
   * 组织编码校验
   * @param rule 表单校验规则
   * @param value 组织编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    const { intl, OrganizationStore } = this.props;
    OrganizationStore.checkCode(value)
      .then(({ failed }) => {
        if (failed) {
          callback(intl.formatMessage({ id: 'global.organization.onlymsg' }));
        } else {
          callback();
        }
      });
  };

  renderSidebarContent() {
    const { intl, form: { getFieldDecorator }, OrganizationStore: { show, editData } } = this.props;
    return (
      <Content
        className="sidebar-content"
        code={show === 'create' ? 'global.organization.create' : 'global.organization.modify'}
        values={{ name: show === 'create' ? `${process.env.HEADER_TITLE_NAME || 'Choerodon'}` : `${editData.code}` }}
      >
        <Form>
          {
            show === 'create' && (
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('code', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: intl.formatMessage({ id: 'global.organization.coderequiredmsg' }),
                  }, {
                    max: 15,
                    message: intl.formatMessage({ id: 'global.organization.codemaxmsg' }),
                  }, {
                    pattern: /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
                    message: intl.formatMessage({ id: 'global.organization.codepatternmsg' }),
                  }, {
                    validator: this.checkCode,
                  }],
                  validateTrigger: 'onBlur',
                  validateFirst: true,
                })(
                  <Input
                    ref={(e) => {
                      this.creatOrgFocusInput = e;
                    }}
                    label={<FormattedMessage id="global.organization.code" />}
                    autoComplete="off"
                    style={{ width: inputWidth }}
                  />,
                )}
              </FormItem>
            )
          }
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [{ required: true, message: intl.formatMessage({ id: 'global.organization.namerequiredmsg' }), whitespace: true }],
              validateTrigger: 'onBlur',
              initialValue: show === 'create' ? undefined : editData.name,
            })(
              <Input
                ref={(e) => {
                  this.editOrgFocusInput = e;
                }}
                label={<FormattedMessage id="global.organization.name" />}
                autoComplete="off"
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
        </Form>
      </Content>
    );
  }

  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadOrganizations(pagination, filters, sorter, params);
  };

  getTableColumns() {
    const { intl, OrganizationStore: { sort: { columnKey, order }, filters } } = this.props;
    return [{
      title: <FormattedMessage id="name" />,
      dataIndex: 'name',
      key: 'name',
      filters: [],
      sorter: true,
      render: text => <span>{text}</span>,
      sortOrder: columnKey === 'name' && order,
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="code" />,
      dataIndex: 'code',
      key: 'code',
      filters: [],
      sorter: true,
      sortOrder: columnKey === 'code' && order,
      filteredValue: filters.code || [],
    }, {
      title: <FormattedMessage id="global.organization.project.count" />,
      dataIndex: 'projectCount',
      key: 'projectCount',
      align: 'center',
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [{
        text: intl.formatMessage({ id: 'enable' }),
        value: 'true',
      }, {
        text: intl.formatMessage({ id: 'disable' }),
        value: 'false',
      }],
      filteredValue: filters.enabled || [],
      render: enable => intl.formatMessage({ id: enable ? 'enable' : 'disable' }),
    }, {
      title: '',
      width: 100,
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <div className="operation">
          <Permission service={['iam-service.organization.update']}>
            <Tooltip
              title={<FormattedMessage id="modify" />}
              placement="bottom"
            >
              <Button
                size="small"
                icon="mode_edit"
                shape="circle"
                onClick={this.handleEdit.bind(this, record)}
              />
            </Tooltip>
          </Permission>
          <Permission service={['iam-service.organization.disableOrganization', 'iam-service.organization.enableOrganization']}>
            <Tooltip
              title={<FormattedMessage id={record.enabled ? 'disable' : 'enable'} />}
              placement="bottom"
            >
              <Button
                size="small"
                icon={record.enabled ? 'remove_circle_outline' : 'finished'}
                shape="circle"
                onClick={() => this.handleDisable(record)}
              />
            </Tooltip>
          </Permission>
        </div>
      ),
    }];
  }

  render() {
    const {
      intl, OrganizationStore: {
        params, loading, pagination, sidebarVisible, submitting, show, orgData,
      },
    } = this.props;

    return (
      <Page
        service={[
          'iam-service.organization.list',
          'iam-service.organization.check',
          'iam-service.organization.query',
          'organization-service.organization.create',
          'iam-service.organization.update',
          'iam-service.organization.disableOrganization',
          'iam-service.organization.enableOrganization',
        ]}
      >
        <Header title={<FormattedMessage id="global.organization.header.title" />}>
          <Permission service={['organization-service.organization.create']}>
            <Button
              onClick={this.createOrg}
              icon="playlist_add"
            >
              <FormattedMessage id="global.organization.create" />
            </Button>
          </Permission>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code="global.organization"
        >
          <Table
            columns={this.getTableColumns()}
            dataSource={orgData}
            pagination={pagination}
            onChange={this.handlePageChange}
            filters={params}
            loading={loading}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={show === 'create' ? 'global.organization.create' : 'global.organization.modify'} />}
            visible={sidebarVisible}
            onOk={this.handleSubmit}
            onCancel={this.handleCancelFun}
            okText={<FormattedMessage id={show === 'create' ? 'create' : 'save'} />}
            cancelText={<FormattedMessage id="cancel" />}
            confirmLoading={submitting}
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
