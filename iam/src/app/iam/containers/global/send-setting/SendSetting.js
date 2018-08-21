/**
 * Created by hulingfangzi on 2018/8/20.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Select, Table, Tooltip, Form, Modal, Radio } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import SendSettingStore from '../../../stores/global/send-setting';
import './SendSetting.scss';
import MailTemplateStore from "../../../stores/global/mail-template";

const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const intlPrefix = 'global.sendsetting';

// 公用方法类
class SendSettingType {
  constructor(context) {
    this.context = context;
    const { AppState } = this.context.props;
    this.data = AppState.currentMenuType;
    const { type, id, name } = this.data;
    const codePrefix = type === 'organization' ? 'organization' : 'global';
    this.code = `${codePrefix}.sendsetting`;
    this.values = { name: name || 'Choerodon' };
    this.type = type;
    this.orgId = id;
  }
}


@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class SendSetting extends Component {
  state = this.getInitState();

  componentWillMount() {
    this.initSendSetting();
    this.loadSettingList();
  }

  getInitState() {
    return {
      loading: true,
      visible: false, // 侧边栏是否可见
      submitting: false, // 侧边栏提交按钮状态
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

  initSendSetting() {
    this.setting = new SendSettingType(this);
  }

  loadSettingList(paginationIn, sortIn, filtersIn, paramsIn) {
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
    this.setState({ filters, loading: true });
    SendSettingStore.loadData(pagination, filters, sort, params, this.setting.type, this.setting.orgId).then((data) => {
      SendSettingStore.setData(data.content);
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
    }).catch((error) => {
      Choerodon.handleResponseError(error);
      MailTemplateStore.setLoading(false);
    });
  }

  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadSettingList(pagination, sorter, filters, params);
  };

  // 刷新
  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadSettingList();
    });
  };

  // 打开侧边栏
  handleModify = (record) => {
    this.props.form.resetFields();
    this.setState({ visible: true });
    SendSettingStore.setCurrentRecord(record);
  }

  // 关闭侧边栏
  handleCancelFun = () => {
    this.setState({
      visible: false,
    });
  };

  renderSidebarContent() {
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
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
        code={`${intlPrefix}.modify`}
        values={{ name: SendSettingStore.getCurrentRecord.name }}
      >
        <Form className="c7n-sendsetting-form">
          <FormItem
            {...formItemLayout}
          >
            {
              getFieldDecorator('template', {
                rules: [{}],
              })(
                <Select
                  style={{ width: inputWidth }}
                  label="应用邮箱模板"
                  getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
                />,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {
              getFieldDecorator('resendtime', {
                rules: [{}],
              })(
                <Select
                  style={{ width: 300 }}
                  label="重发次数"
                  getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
                />,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {
              getFieldDecorator('sendnow', {
                rules: [],
                initialValue: 'instant',
              })(
                <RadioGroup
                  label="即时发送"
                  className="radioGroup"
                >
                  <Radio value="instant">{intl.formatMessage({ id: 'yes' })}</Radio>
                  <Radio value="notinstant">{intl.formatMessage({ id: 'no' })}</Radio>
                </RadioGroup>,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {
              getFieldDecorator('manual', {
                rules: [],
                initialValue: 'allow',
              })(
                <RadioGroup
                  label="允许手动重发"
                  className="radioGroup"
                >
                  <Radio value="allow">{intl.formatMessage({ id: 'yes' })}</Radio>
                  <Radio value="notallow">{intl.formatMessage({ id: 'no' })}</Radio>
                </RadioGroup>,
              )
            }
          </FormItem>
        </Form>
      </Content>
    );
  }

  render() {
    const { intl } = this.props;
    const { sort: { columnKey, order }, filters, params, pagination, loading, visible, submitting } = this.state;
    const columns = [{
      title: '触发类型',
      dataIndex: 'name',
      key: 'name',
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      filters: [],
      filteredValue: filters.code || [],
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      filters: [],
      filteredValue: filters.description || [],
    }, {
      title: '应用邮箱模板',
      dataIndex: 'emailTemplateCode',
      key: 'emailTemplateCode',
    }, {
      title: '',
      width: '100px',
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <Tooltip
          title={<FormattedMessage id="modify" />}
          placement="bottom"
        >
          <Button
            size="small"
            icon="mode_edit"
            shape="circle"
            onClick={this.handleModify.bind(this, record)}
          />
        </Tooltip>
      ),
    }]

    return (
      <Page
        service={['manager-service.service.pageManager']}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
        >
          <Table
            columns={columns}
            dataSource={SendSettingStore.getData}
            pagination={pagination}
            onChange={this.handlePageChange}
            filters={params}
            loading={loading}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.modify`} />}
            visible={visible}
            onOk={this.handleSubmit}
            onCancel={this.handleCancelFun}
            okText={<FormattedMessage id="save" />}
            confirmLoading={submitting}
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
