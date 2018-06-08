/*eslint-disable*/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import querystring from 'query-string';
import { Button, Col, Form, Icon, Input, Modal, Row, Select, Spin, Table, Tooltip } from 'choerodon-ui';
import { axios, Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import './OrganizationHome.scss';
//import '../../../../assets/css/main.scss';

const { HeaderStore } = stores;
const { Sidebar } = Modal;
const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';
const FormItem = Form.Item;

@inject('AppState')
@observer
class OrganizationHome extends Component {
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
    this.fetch(pagination, sort, filters, params).then(data => {
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

  //创建组织侧边
  createOrg = () => {
    this.props.form.resetFields();
    this.setState({
      visible: true,
      show: 'create',
    });
  };

  handleEdit = (data) => {
    this.props.form.resetFields();
    this.setState({
      visible: true,
      show: 'edit',
      editData: data,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { code, name }) => {
      if (!err) {
        const { show, editData: { id, code: originCode, objectVersionNumber } } = this.state;
        const isCreate = show === 'create';
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
          message = '创建成功';
          method = 'post';
        } else {
          url = `/iam/v1/organizations/${id}`;
          body = {
            name,
            objectVersionNumber,
            code: originCode,
          };
          message = '修改成功';
          method = 'put';
        }
        this.setState({ submitting: true });
        axios[method](url, JSON.stringify(body))
          .then(data => {
            this.setState({
              submitting: false,
              visible: false,
            });
            Choerodon.prompt(message);
            this.loadOrganizations();
            if (isCreate) {
              HeaderStore.addOrg(data);
            } else {
              HeaderStore.updateOrg(data);
            }
          })
          .catch(error => {
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

  handleDisable({ enabled, id }) {
    axios.put(`/iam/v1/organizations/${id}/${enabled ? 'disable' : 'enable'}`).then((data) => {
      Choerodon.prompt(Choerodon.getMessage(enabled ? '停用成功' : '启用成功', 'Success'));
      this.loadOrganizations();
    }).catch(Choerodon.handleResponseError);
  }

  /**
   * 组织编码校验
   * @param rule 表单校验规则
   * @param value 组织编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    axios.post(`/iam/v1/organizations/check`, JSON.stringify({ code: value }))
      .then((mes) => {
        if (mes.failed) {
          callback(Choerodon.getMessage('组织编码已存在，请输入其他组织编码', 'code existed, please try another'));
        } else {
          callback();
        }
      });
  };

  renderSidebarContent() {
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
    let title;
    let description;
    if (show === 'create') {
      title = `在平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”中创建组织`;
      description = '请在下面输入组织编码、组织名称创建组织。组织编码在全平台是唯一的，组织创建后，不能修改组织编码。';
    } else {
      title = `对组织“${editData.code}”进行修改`;
      description = '您可以在此修改组织名称。';
    }

    return (
      <Content style={{ padding: 0 }}
        title={title}
        description={description}
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
                    message: Choerodon.getMessage('请输入组织编码', 'please input organization code'),
                  }, {
                    maxLength: 15,
                    message: Choerodon.getMessage('组织编码不能超过15个字符', 'code should less than 15 characters'),
                  }, {
                    pattern: /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
                    message: Choerodon.getMessage('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾', 'Code can contain only lowercase letters, digits,"-", must start with lowercase letters and will not end with "-"'),
                  }, {
                    validator: this.checkCode,
                  }],
                  validateTrigger: 'onBlur',
                  validateFirst: true,
                })(
                  <Input label="组织编码" autocomplete="off" style={{ width: inputWidth }} />,
                )}
              </FormItem>
            )
          }
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入组织名称', whitespace: true }],
              validateTrigger: 'onBlur',
              initialValue: show === 'create' ? undefined : editData.name,
            })(
              <Input label="组织名称" autocomplete="off" style={{ width: inputWidth }} />,
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
    const { AppState } = this.props;
    const {
      sort: { columnKey, order }, filters, pagination,
      params, content, loading, visible, show, submitting,
    } = this.state;
    const { type } = AppState.currentMenuType;
    const columns = [{
      title: '组织名称',
      dataIndex: 'name',
      key: 'name',
      filters: [],
      sorter: true,
      render: (text, record) => <span>{text}</span>,
      sortOrder: columnKey === 'name' && order,
      filteredValue: filters.name || [],
    }, {
      title: '组织编码',
      dataIndex: 'code',
      key: 'code',
      filters: [],
      sorter: true,
      sortOrder: columnKey === 'code' && order,
      filteredValue: filters.code || [],
    }, {
      title: '启用状态',
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [{
        text: '启用',
        value: 'true',
      }, {
        text: '停用',
        value: 'false',
      }],
      filteredValue: filters.enabled || [],
      render: (text) => {
        return text ? '启用' : '停用';
      },
    }, {
      title: '',
      width: '100px',
      key: 'action',
      render: (text, record) => (
        <div className="operation">
          <Permission service={['iam-service.organization.update']}>
            <Tooltip
              title="修改"
              placement="bottom"
            >
              <Button
                icon="mode_edit"
                shape="circle"
                onClick={this.handleEdit.bind(this, record)}
              />
            </Tooltip>
          </Permission>
          <Permission service={['iam-service.organization.disableOrganization', 'iam-service.organization.enableOrganization']}>
            <Tooltip
              title={record.enabled ? '停用' : '启用'}
              placement="bottom"
            >
              <Button
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
      <Permission
        service={[
          'organization-service.organization.create',
          'iam-service.organization.update',
          'iam-service.organization.disableOrganization',
          'iam-service.organization.enableOrganization',
        ]}
        type={type}
      >
        <Page>
          <Header title={Choerodon.languageChange('organization.title')}>
            <Permission service={['organization-service.organization.create']}>
              <Button
                onClick={this.createOrg}
                icon="playlist_add"
              >
                {Choerodon.getMessage('创建组织', 'createOrganization')}
              </Button>
            </Permission>
            <Button
              onClick={this.handleRefresh}
              icon="refresh"
            >
              {Choerodon.languageChange('refresh')}
            </Button>
          </Header>
          <Content
            title={`平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”的组织管理`}
            description="组织是项目的上一级。通过组织您可以管理项目、用户。您可以创建组织，创建后平台默认您是这个组织的组织管理员。"
          >
            <Table
              columns={columns}
              dataSource={content}
              pagination={pagination}
              onChange={this.handlePageChange}
              filters={params}
              loading={loading}
              filterBarPlaceholder="过滤表"
            />
            <Sidebar
              title={show === 'create' ? '创建组织' : '修改组织'}
              visible={visible}
              onOk={this.handleSubmit}
              onCancel={this.handleCancelFun}
              okText={show === 'create' ? '创建' : '保存'}
              cancelText="取消"
              confirmLoading={submitting}
            >
              {this.renderSidebarContent()}
            </Sidebar>
          </Content>
        </Page>
      </Permission>
    );
  }
}

export default Form.create()(withRouter(OrganizationHome));
