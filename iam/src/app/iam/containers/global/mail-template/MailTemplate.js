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
  axios, Content, Header, Page, Permission,
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
        columnKey: 'name',
        order: 'descend',
      },
      filters: {},
      params: [],
    };
  }

  handleAdd = (e) => {
    // TODO:点击添加的时候调用
  };

  handlePageChange = (pagination, filters, sort, params) => {
    this.loadTemplate(pagination, sort, filters, params);
  };

  initMailTemplate() {
    this.roles = new MailTemplateType(this);
  }

  loadTemplate(paginationIn, sortIn, filtersIn, paramsIn) {
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
    console.log(paramsIn);
    MailTemplateStore.loadMailTemplate(pagination, sort, filters, params)
      .then((data) => {
        console.log(`data${data}`);
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
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }


  render() {
    const { intl } = this.props;
    const { filters, loading, params } = this.state;

    const mailTemplateData = MailTemplateStore.getMailTemplate();
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      dataIndex: 'realName',
      key: 'realName',
      width: 350,
      filters: [],
      filteredValue: filters.name || [],
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
      render: (text, record) => (
        <Button
          shape="circle"
          icon="more_vert"
          size="small"
        />
      ),
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
            onClick={this.handleAdd}
          >
            <FormattedMessage id="add" />
          </Button>
        </Header>
        <Content
          code={this.roles.code}
          values={{ name: `${this.roles.values.name || 'Choerodon'}` }}
        >

          <Table
            loading={loading}
            columns={columns}
            dataSource={mailTemplateData}
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
