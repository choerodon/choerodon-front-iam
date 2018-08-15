
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import querystring from 'query-string';
import { Button, Form, Input, Modal, Table, Tooltip } from 'choerodon-ui';
import { axios, Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';

const { HeaderStore } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;

@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class Organization extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      visible: false,
      content: null,
      show: '',
      submitting: false,
      loading: false,
      editData: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      sort: {
        columnKey: null,
        order: null,
      },
      filters: {},
      params: [],
    };
  }

  componentWillMount() {
    this.loadOrganizations();
  }

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadOrganizations();
    });
  };

  loadOrganizations(paginationIn, sortIn, filtersIn, paramsIn) {
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
    this.fetch(pagination, sort, filters, params).then((data) => {
      this.setState({
        pagination: {
          current: data.number + 1,
          pageSize: data.size,
          total: data.totalElements,
        },
        content: data.content,
        loading: false,
        sort,
        filters,
        params,
      });
    });
  }

  fetch({ current, pageSize }, { columnKey, order }, { name, code, enabled }, params) {
    this.setState({
      loading: true,
      filters: { name, code, enabled },
    });
    const queryObj = {
      page: current - 1,
      size: pageSize,
      name,
      code,
      enabled,
      params,
    };
    if (columnKey) {
      const sorter = [];
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
      queryObj.sort = sorter.join(',');
    }
    return axios.get(`/iam/v1/organizations?${querystring.stringify(queryObj)}`);
  }

  // 创建组织侧边
  createOrg = () => {
    this.props.form.resetFields();
    this.setState({
      visible: true,
      show: 'create',
    });
    setTimeout(() => {
      this.creatOrgFocusInput.input.focus();
    }, 10);
  };

  handleEdit = (data) => {
    this.props.form.resetFields();
    this.setState({
      visible: true,
      show: 'edit',
      editData: data,
    });
    setTimeout(() => {
      this.editOrgFocusInput.input.focus();
    }, 10);
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { code, name }, modify) => {
      if (!err) {
        const { intl } = this.props;
        const { show, editData: { id, code: originCode, objectVersionNumber } } = this.state;
        const isCreate = show === 'create';
        if (!modify && !isCreate) {
          this.setState({
            visible: false,
          });
          Choerodon.prompt(intl.formatMessage({ id: 'modify.success' }));
          return;
        }
        let url;
        let body;
        let message;
        let method;
        if (isCreate) {
          url = '/org/v1/organizations';
          body = {
            name,
            code,
          };
          message = intl.formatMessage({ id: 'create.success' });
          method = 'post';
        } else {
          url = `/iam/v1/organizations/${id}`;
          body = {
            name,
            objectVersionNumber,
            code: originCode,
          };
          message = intl.formatMessage({ id: 'modify.success' });
          method = 'put';
        }
        this.setState({ submitting: true });
        axios[method](url, JSON.stringify(body))
          .then((data) => {
            this.setState({
              submitting: false,
              visible: false,
            });
            if (data.failed) {
              Choerodon.prompt(data.message);
            } else {
              Choerodon.prompt(message);
              if (isCreate) {
                this.handleRefresh();
                HeaderStore.addOrg(data);
              } else {
                this.loadOrganizations();
                HeaderStore.updateOrg(data);
              }
            }
          })
          .catch((error) => {
            this.setState({ submitting: false });
            Choerodon.handleResponseError(error);
          });
      }
    });
  };

  handleCancelFun = () => {
    this.setState({
      visible: false,
    });
  };

  handleDisable = ({ enabled, id }) => {
    const { intl } = this.props;
    axios.put(`/iam/v1/organizations/${id}/${enabled ? 'disable' : 'enable'}`).then((data) => {
      Choerodon.prompt(intl.formatMessage({ id: enabled ? 'disable.success' : 'enable.success' }));
      this.loadOrganizations();
    }).catch(Choerodon.handleResponseError);
  };

  /**
   * 组织编码校验
   * @param rule 表单校验规则
   * @param value 组织编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    const { intl } = this.props;
    axios.post('/iam/v1/organizations/check', JSON.stringify({ code: value }))
      .then((mes) => {
        if (mes.failed) {
          callback(intl.formatMessage({ id: 'global.organization.onlymsg' }));
        } else {
          callback();
        }
      });
  };

  renderSidebarContent() {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { show, editData } = this.state;
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
                  <Input ref={e => this.creatOrgFocusInput = e} label={<FormattedMessage id="global.organization.code" />} autoComplete="off" style={{ width: inputWidth }} />,
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
              <Input ref={e => this.editOrgFocusInput = e} label={<FormattedMessage id="global.organization.name" />} autoComplete="off" style={{ width: inputWidth }} />,
            )}
          </FormItem>
        </Form>
      </Content>
    );
  }

  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadOrganizations(pagination, sorter, filters, params);
  };

  render() {
    const { intl } = this.props;
    const {
      sort: { columnKey, order }, filters, pagination,
      params, content, loading, visible, show, submitting,
    } = this.state;
    const columns = [{
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
      width: '100px',
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
            columns={columns}
            dataSource={content}
            pagination={pagination}
            onChange={this.handlePageChange}
            filters={params}
            loading={loading}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={show === 'create' ? 'global.organization.create' : 'global.organization.modify'} />}
            visible={visible}
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

