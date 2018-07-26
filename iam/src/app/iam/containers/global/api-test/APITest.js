/**
 * Created by hulingfangzi on 2018/7/3.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Select, Table, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import querystring from 'query-string';
import classnames from 'classnames';
import APITestStore from '../../../stores/global/api-test';
import './APITest.scss';

const intlPrefix = 'global.apitest';
const urlPrefix = '' + process.env.API_HOST;
const Option = Select.Option;

@withRouter
@injectIntl
@inject('AppState')
@observer
export default class APITest extends Component {
  state = this.getInitState();

  componentDidMount() {
    this.loadInitData();
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

  /* 微服务下拉框 */
  getOptionList() {
    const service = APITestStore.service;
    return service && service.length > 0 ? (
      APITestStore.service.map(({ name, value }) => (
        <Option key={value}>{name}</Option>
      ))
    ) : <Option value="empty">无服务</Option>;
  }

  loadInitData = () => {
    APITestStore.setLoading(true);
    APITestStore.loadService().then((res) => {
      if (res.failed) {
        Choerodon.prompt(res.message);
        APITestStore.setLoading(false);
      } else if (res.length) {
        const services = res.map(({ location, name }) => {
          return {
            name: name.split(':')[1],
            value: `${name.split(':')[0]}/${location.split('=')[1]}`,
          };
        });
        APITestStore.setService(services);
        APITestStore.setCurrentService(services[0]);
        this.loadApi();
      }
    });
  }

  loadApi = (paginationIn, filtersIn, paramsIn) => {
    APITestStore.setLoading(true);
    const {
      pagination: paginationState,
      filters: filtersState,
      params: paramsState,
    } = this.state;
    const pagination = paginationIn || paginationState;
    const params = paramsIn || paramsState;
    const filters = filtersIn || filtersState;
    const serviceName = APITestStore.getCurrentService.value.split('/')[0];
    const version = APITestStore.getCurrentService.value.split('/')[1];
    this.fetch(serviceName, version, pagination, params)
      .then((data) => {
        APITestStore.setApiData(data.content);
        APITestStore.setLoading(false);
        this.setState({
          pagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
          params,
        });
      })
      .catch((error) => {
        Choerodon.prompt(error.message);
        this.setState(this.getInitState(), () => {
          APITestStore.setApiData([]);
          APITestStore.setLoading(false);
        });
      });
  }

  fetch(serviceName, version, { current, pageSize }, params) {
    APITestStore.setLoading(true);
    const queryObj = {
      page: current - 1,
      size: pageSize,
      version,
      params,
    };
    return axios.get(`/manager/v1/swaggers/${serviceName}/controllers?${querystring.stringify(queryObj)}`);
  }

  handlePageChange = (pagination, filters, sorter = {}, params) => {
    this.loadApi(pagination, filters, params);
  };

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      APITestStore.setCurrentService(APITestStore.service[0]);
      this.loadApi();
    });
  };


  /**
   * 微服务下拉框改变事件
   * @param serviceName 服务名称
   */
  handleChange(serviceName) {
    const currentService = APITestStore.service.find(service => service.value === serviceName);
    APITestStore.setCurrentService(currentService);
    this.setState(this.getInitState(), () => {
      this.loadApi();
    });
  }


  // 跳转至swagger
  goSwagger(record) {
    const { refController, operationId } = record;
    const openUrl = `${urlPrefix}/manager/swagger-ui.html#!${APITestStore.currentService.value.split('/')[0]}/${refController}/${operationId}`;
    window.open(openUrl);
  }


  goDetail(record) {
    APITestStore.setApiDetail(record);
    const version = APITestStore.getCurrentService.value.split('/')[1];
    const url = record.url.slice(1);
    const { refController, method } = record;
    this.props.history.push(`/iam/api-test/detail/${refController}/${method}/${version}/${url}`);
  }

  render() {
    const { intl } = this.props;
    const { pagination, params } = this.state;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      dataIndex: 'name',
      key: 'name',
      width: 350,
      render: (text, data) => {
        const { name, method } = data;
        if (name) {
          return <span>{name}</span>;
        } else {
          return (
            <span className={classnames('methodTag', method)}>{method}</span>
          );
        }
      },
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.path`} />,
      dataIndex: 'url',
      key: 'url',
      width: 438,
      render: (text, record) => (<Tooltip
        title={text}
        placement="bottomLeft"
        overlayStyle={{ wordBreak: 'break-all' }}
      ><div className="urlContainer">{text}</div></Tooltip>),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.description`} />,
      dataIndex: 'remark',
      key: 'remark',
      width: 475,
      render: (text, data) => {
        const { description, remark } = data;
        if (remark) {
          return remark;
        } else {
          return description;
        }
      },
    }, {
      title: '',
      width: '100px',
      key: 'action',
      align: 'right',
      render: (text, record) => {
        if ('method' in record) {
          return (
            <Button
              shape="circle"
              icon="find_in_page"
              size="small"
              onClick={this.goDetail.bind(this, record)}
            />
          );
        }
      },
    }];
    return (
      <Page
        service={['manager-service.service.pageManager']}
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
          values={{ name: `${process.env.HEADER_TITLE_NAME || 'Choerodon'}` }}
        >
          <Select
            style={{ width: '512px', marginBottom: '32px' }}
            value={APITestStore.currentService.value}
            getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
            onChange={this.handleChange.bind(this)}
            label={<FormattedMessage id={`${intlPrefix}.service`} />}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {this.getOptionList()}
          </Select>
          <Table
            loading={APITestStore.loading}
            indentSize={0}
            columns={columns}
            dataSource={APITestStore.getApiData.slice()}
            pagination={pagination}
            childrenColumnName="paths"
            filters={params}
            onChange={this.handlePageChange}
            rowKey={(record) => 'paths' in record ? record.name : record.operationId}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
        </Content>
      </Page>
    );
  }
}

