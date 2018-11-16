/**
 * Created by hulingfangzi on 2018/7/3.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Table } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { axios, Content, Header, Page } from 'choerodon-front-boot';
import querystring from 'query-string';
import './MicroService.scss';

const intlPrefix = 'global.microservice';

@withRouter
@injectIntl
@inject('AppState')
@observer
export default class MicroService extends Component {
  state = this.getInitState();

  componentDidMount() {
    this.loadInitData();
  }

  getInitState() {
    return {
      loading: true,
      content: null,
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

  loadInitData(paginationIn, sortIn, filtersIn, paramsIn) {
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

  fetch({ current, pageSize }, { columnKey, order }, { serviceName }, params) {
    this.setState({
      loading: true,
    });
    const queryObj = {
      page: current - 1,
      size: pageSize,
      service_name: serviceName,
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
    return axios.get(`/manager/v1/services/manager?${querystring.stringify(queryObj)}`);
  }

  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadInitData(pagination, sorter, filters, params);
  };

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadInitData();
    });
  };

  render() {
    const { loading, content, sort: { columnKey, order }, filters, pagination, params } = this.state;
    const { intl, AppState } = this.props;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.name`} />,
      dataIndex: 'serviceName',
      key: 'serviceName',
      filters: [],
      filteredValue: filters.serviceName || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.instancenum`} />,
      dataIndex: 'instanceNum',
      key: 'instanceNum',
    }];
    return (
      <Page
        service={[
          'manager-service.service.pageManager',
        ]}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{ name: AppState.getSiteInfo.systemName || 'Choerodon' }}
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={content}
            pagination={pagination}
            filters={params}
            onChange={this.handlePageChange}
            rowKey="serviceName"
            className="c7n-microservice-table"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
        </Content>
      </Page>
    );
  }
}
