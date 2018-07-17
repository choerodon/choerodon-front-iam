/**
 * Created by hulingfangzi on 2018/7/3.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Select, Table, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import querystring from 'query-string';
import classnames from 'classnames';
import ApitestStore from '../../../stores/globalStores/apitest';
import './Apitest.scss';

const intlPrefix = 'global.apitest';
const urlPrefix = 'http://api.staging.saas.hand-china.com/manager/swagger-ui.html#!';
const Option = Select.Option;
@inject('AppState')
@observer

class Apitest extends Component {
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
    const service = ApitestStore.service;
    return service && service.length > 0 ? (
      ApitestStore.service.map(({ name, value }) => (
        <Option key={value}>{name}</Option>
      ))
    ) : <Option value="empty">无服务</Option>;
  }

  loadInitData = () => {
    ApitestStore.setLoading(true);
    ApitestStore.loadService().then((res) => {
      if (res.failed) {
        Choerodon.prompt(res.message);
        ApitestStore.setLoading(false);
      } else if (res.length) {
        const services = res.map(({ location, name }) => {
          return {
            name: name.split(':')[1],
            value: `${location.split('?')[0].split('/')[2]}/${location.split('=')[1]}`,
          };
        });
        ApitestStore.setService(services);
        ApitestStore.setCurrentService(services[0]);
        this.loadApi();
      }
    });
  }

  loadApi = (paginationIn, filtersIn, paramsIn) => {
    ApitestStore.setLoading(true);
    const {
      pagination: paginationState,
      filters: filtersState,
      params: paramsState,
    } = this.state;
    const pagination = paginationIn || paginationState;
    const params = paramsIn || paramsState;
    const filters = filtersIn || filtersState;
    const serviceName = ApitestStore.getCurrentService.value.split('/')[0];
    const version = ApitestStore.getCurrentService.value.split('/')[1];
    this.fetch(serviceName, version, pagination, params)
      .then((data) => {
        ApitestStore.setApiData(data.content);
        ApitestStore.setLoading(false);
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
          ApitestStore.setApiData([]);
          ApitestStore.setLoading(false);
        });
      });
  }

  fetch(serviceName, version, { current, pageSize }, params) {
    ApitestStore.setLoading(true);
    const queryObj = {
      page: current - 1,
      size: pageSize,
      version,
      params,
    };
    return axios.get(`/manager/v1/swaggers/controllers/${serviceName}?${querystring.stringify(queryObj)}`);
  }

  handlePageChange = (pagination, filters, sorter = {}, params) => {
    this.loadApi(pagination, filters, params);
  };

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadInitData();
    });
  };


  /**
   * 微服务下拉框改变事件
   * @param serviceName 服务名称
   */
  handleChange(serviceName) {
    const currentService = ApitestStore.service.find(service => service.value === serviceName);
    ApitestStore.setCurrentService(currentService);
    this.setState(this.getInitState(), () => {
      this.loadApi();
    });
  }


  // 跳转至swagger
  goSwagger(record) {
    const { refController, operationId } = record;
    const openUrl = `${urlPrefix}${ApitestStore.currentService.value.split('/')[0]}/${refController}/${operationId}`;
    window.open(openUrl);
  }

  render() {
    const { intl } = this.props;
    const { pagination, params } = this.state;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      dataIndex: 'name',
      key: 'name',
      width: '322px',
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
      width: '438px',
      render: (text, record) => (<Tooltip
        title={text}
        placement="bottomLeft"
        overlayStyle={{ wordBreak: 'break-all' }}
      ><div className="urlContainer">{text}</div></Tooltip>),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.description`} />,
      dataIndex: 'remark',
      key: 'remark',
      width: '475px',
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
              onClick={this.goSwagger.bind(this, record)}
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
            value={ApitestStore.currentService.value}
            onChange={this.handleChange.bind(this)}
            label={<FormattedMessage id={`${intlPrefix}.service`} />}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {this.getOptionList()}
          </Select>
          <Table
            loading={ApitestStore.loading}
            indentSize={0}
            columns={columns}
            dataSource={ApitestStore.getApiData.slice()}
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

export default withRouter(injectIntl(Apitest));
