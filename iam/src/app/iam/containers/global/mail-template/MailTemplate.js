/**
 * Created by chenbinjie on 2018/8/6.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Button, Select, Table, Tooltip, Modal,
} from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import {
  axios, Content, Header, Page, Permission, Action,
} from 'choerodon-front-boot';
import MailTemplateStore from '../../../stores/global/mail-template';

const intlPrefix = 'global.mailtemplate';


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

  handleModify = (record) => {
    // TODO 修改
  };

  createByThis = (record) => {
    // TODO 基于此创建
  };

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

  handleCreate = () => {
    // TODO 创建
  };

  handleModify = (record) => {
    // TODO 修改
  }

  createByThis = (record) => {
    // TODO 基于此创建
  }


  render() {
    const { intl } = this.props;
    const {
      sort: { columnKey, order }, filters, pagination, loading, params,
    } = this.state;

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
          text: intl.formatMessage({ id: `${intlPrefix}.create.baseon` }),
          action: this.createByThis.bind(this, record),
        }, {
          service: ['manager-service.service.pageManager'],
          type: 'site',
          icon: '',
          text: intl.formatMessage({ id: 'modify' }),
          action: this.handleModify.bind(this, record.realName),
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
            onClick={this.handleCreate}
          >
            <FormattedMessage id={`${intlPrefix}.create.template`} />
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
        </Content>

      </Page>
    );
  }
}
