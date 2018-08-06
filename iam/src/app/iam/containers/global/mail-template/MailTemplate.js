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

@withRouter
@injectIntl
@inject('AppState')
@observer
export default class APITest extends Component {
  state = this.getInitState();


  componentDidMount() {
    console.log(MailTemplateStore);
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

    const mailTemplateData = MailTemplateStore.getMailTemplate();
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      dataIndex: 'realName',
      key: 'realName',
      width: 350,
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
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            onClick={this.handleAdd}
          >
            <FormattedMessage id="add" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{ name: `${process.env.HEADER_TITLE_NAME || 'Choerodon'}` }}
        >

          <Table
            columns={columns}
            childrenColumnName="paths"
            dataSource={mailTemplateData}
            onChange={this.handlePageChange}
            rowKey={record => ('paths' in record ? record.name : record.operationId)}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
        </Content>

      </Page>
    );
  }
}
