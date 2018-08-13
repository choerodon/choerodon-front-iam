/**
 * Created by chenbinjie on 2018/8/6.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Button, Select, Table, Tooltip, Modal, Form, Input,
} from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import {
  axios, Content, Header, Page, Permission, Action,
} from 'choerodon-front-boot';
import MailTemplateStore from '../../../stores/global/mail-template';
import Editor from '../../../components/editor';

const intlPrefix = 'global.mailtemplate';
const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;

// 公用方法类
class MailTemplateType {
  constructor(context) {
    this.context = context;
    const { AppState } = this.context.props;
    this.data = AppState.currentMenuType;
    const { type, id, name } = this.data;
    let codePrefix;
    switch (type) {
      case 'organization':
        codePrefix = 'organization';
        break;
      case 'project':
        codePrefix = 'project';
        break;
      default:
        codePrefix = 'global';
    }
    this.code = `${codePrefix}.mailtemplate`;
    this.values = { name: name || 'Choerodon' };
  }
}

@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class MailTemplate extends Component {
  state = this.getInitState();


  componentWillMount() {
    this.initMailTemplate();
    this.loadTemplate();
  }

  getInitState() {
    return {
      editorContent: null,
      initValue: '',
      isShowSidebar: false,
      selectType: 'create',
      isSubmitting: false,
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
    };
  }

  handlePageChange = (pagination, filters, sort, params) => {
    this.loadTemplate(pagination, filters, sort, params);
  };

  formatMessage = (id, values = {}) => {
    const { intl } = this.props;
    return intl.formatMessage({
      id,
    }, values);
  }

  /**
   * 开启侧边栏
   * @param selectType selectType create/modify/baseon
   * @param record 当前行记录
   */
  handleOpen = (selectType, record = {}) => {
    this.props.form.resetFields();
    this.setState({
      isShowSidebar: true,
      selectType,
    });
    if (selectType === 'create') {
      this.setState({
        editorContent: null,
      });
    }
  }

  // 关闭侧边栏
  handleCancel = () => {
    this.setState({
      isShowSidebar: false,
    });
  }

  // 删除
  handleDelete(record) {
    MailTemplateStore.deleteMailTemplate(record.id);
  }

  initMailTemplate() {
    this.roles = new MailTemplateType(this);
  }

  loadTemplate(paginationIn, filtersIn, sortIn, paramsIn) {
    MailTemplateStore.setLoading(true);
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
    // 防止标签闪烁
    this.setState({ filters });
    MailTemplateStore.loadMailTemplate(pagination, filters, sort, params)
      .then((data) => {
        MailTemplateStore.setLoading(false);
        MailTemplateStore.setMailTemplate(data.content);
        this.setState({
          sort,
          filters,
          params,
          pagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
        });
        MailTemplateStore.setLoading(false);
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
        MailTemplateStore.setLoading(false);
      });
  }

  // 侧边栏顶部标题
  getSidebarTitle() {
    const { selectType } = this.state;
    if (selectType === 'modify') {
      return <FormattedMessage id="mailtemplate.modify" />;
    } else {
      return <FormattedMessage id="mailtemplate.create" />;
    }
  }

  // 侧边栏描述
  getHeader() {
    const { selectType } = this.state;
    const { code, values } = this.roles;
    const selectCode = `${code}.${selectType}`;
    return {
      code: selectCode,
      values,
    };
  }

  renderSidebarContent() {
    const { intl } = this.props;
    const { selectType } = this.state;
    const { getFieldDecorator } = this.props.form;
    const header = this.getHeader();
    const inputWidth = 512;
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
    return (
      <Content
        className="sidebar-content"
        {...header}
      >
        <Form>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('code', {
              rules: [{
                required: true,
                whitespace: true,
                message: this.formatMessage('mailtemplate.code.required'),
              }],
              initialValue: selectType === 'modify' ? 'codedemo' : undefined,
            })(
              <Input autoComplete="off" style={{ width: inputWidth }} label={<FormattedMessage id="mailtemplate.code" />} disabled={selectType === 'modify'} />,
            )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true,
                whitespace: true,
                message: this.formatMessage('mailtemplate.name.required'),
              }],
              initialValue: selectType === 'modify' ? 'namedemo' : undefined,
            })(
              <Input autoComplete="off" style={{ width: inputWidth }} label={<FormattedMessage id="mailtemplate.name" />} disabled={selectType === 'modify'} />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('type', {
              rules: [{
                required: true,
                message: this.formatMessage('mailtemplate.type.required'),
              }],
              initialValue: '1',
            })(
              <Select
                getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
                label={<FormattedMessage id="mailtemplate.type" />}
                style={{ width: inputWidth }}
                disabled={selectType !== 'create'}
              >
                <Option value="SMTP">1</Option>
                <Option value="POP3">2</Option>
                <Option value="IMAP">3</Option>

              </Select>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {
              getFieldDecorator('title', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: this.formatMessage('mailtemplate.title.required'),
                }],
                initialValue: selectType === 'create' ? undefined : 'titledemo',
              })(
                <Input autoComplete="off" style={{ width: inputWidth }} maxLength={241} label={<FormattedMessage id="mailtemplate.title" />} />,
              )
            }

          </FormItem>
          <div style={{ marginBottom: '8px' }}>
            <Editor
              style={{ height: 320, width: '100%' }}
              value={selectType === 'create' ? '' : this.state.editorContent}
              onChange={(value) => {
                this.setState({ editorContent: value });
              }}
            />
          </div>
        </Form>
      </Content>
    );
  }

  render() {
    const { intl } = this.props;
    const {
      sort: { columnKey, order }, filters, pagination, loading,
      params, isShowSidebar, isSubmitting, selectType,
    } = this.state;
    const okText = selectType === 'modify' ? this.formatMessage('save') : this.formatMessage('create');
    const mailTemplateData = MailTemplateStore.getMailTemplate();
    const columns = [{
      dataIndex: 'id',
      key: 'id',
      hidden: true,
      sortOrder: columnKey === 'id' && order,
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      dataIndex: 'realName',
      key: 'realName',
      width: 350,
      filters: [],
      sorter: true,
      sortOrder: columnKey === 'realName' && order,
      filteredValue: filters.realName || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.code`} />,
      dataIndex: 'enabled',
      key: 'enabled',
      render: enabled => intl.formatMessage({ id: enabled ? 'enable' : 'disable' }),
      width: 438,
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.mailtype`} />,
      dataIndex: 'email',
      key: 'email',
      width: 475,
      filters: [],
      sorter: true,
      sortOrder: columnKey === 'email' && order,
      filteredValue: filters.email || [],
    },
    {
      title: <FormattedMessage id={`${intlPrefix}.table.fromtype`} />,
      dataIndex: 'locked',
      key: 'locked',
      width: 475,
    },
    {
      title: '',
      width: '100px',
      key: 'action',
      align: 'right',
      render: (text, record) => {
        const actionsDatas = [{
          service: ['manager-service.service.pageManager'],
          type: 'site',
          icon: '',
          text: intl.formatMessage({ id: 'baseon' }),
          action: this.handleOpen.bind(this, 'baseon', record),
        }, {
          service: ['manager-service.service.pageManager'],
          type: 'site',
          icon: '',
          text: intl.formatMessage({ id: 'modify' }),
          action: this.handleOpen.bind(this, 'modify', record),
        },
        {
          service: ['manager-service.service.pageManager'],
          type: 'site',
          icon: '',
          text: intl.formatMessage({ id: 'delete' }),
          action: this.handleDelete.bind(this, record),
        }];
        // 根据来源类型判断
        if (!record.realName) {
          actionsDatas.push({
            service: ['manager-service.service.pageManager'],
            type: 'site',
            icon: '',
            text: intl.formatMessage({ id: 'delete' }),
            action: '',
          });
        }
        return <Action data={actionsDatas} />;
      },
    }];

    return (
      <Page
        className="root-user-setting"
        service={['manager-service.service.pageManager']}
      >
        <Header
          title={<FormattedMessage id={`${this.roles.code}.header.title`} />}
        >
          <Button
            icon="playlist_add"
            onClick={this.handleOpen.bind(this, 'create')}
          >
            <FormattedMessage id="mailtemplate.create" />
          </Button>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={this.roles.code}
          values={{ name: `${this.roles.values.name || 'Choerodon'}` }}
        >

          <Table
            loading={MailTemplateStore.loading}
            columns={columns}
            dataSource={mailTemplateData}
            pagination={pagination}
            filters={params}
            onChange={this.handlePageChange}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={this.getSidebarTitle()}
            visible={isShowSidebar}
            onOk={this.handleSubmit}
            onCancel={this.handleCancel}
            okText={okText}
            cancelText={<FormattedMessage id="cancel" />}
            confirmLoading={isSubmitting}
          >
            {this.renderSidebarContent()}
          </Sidebar>

        </Content>

      </Page>
    );
  }
}
