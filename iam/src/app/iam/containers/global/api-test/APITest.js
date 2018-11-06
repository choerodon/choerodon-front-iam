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
import MouseOverWrapper from '../../../components/mouseOverWrapper';

const intlPrefix = 'global.apitest';
const { Option } = Select;

@withRouter
@injectIntl
@inject('AppState')
@observer
export default class APITest extends Component {
  state = this.getInitState();

  componentDidMount() {
    if (APITestStore.getInitData === null || APITestStore.getNeedReload) {
      this.loadInitData();
      this.setState(this.getInitState());
      APITestStore.clearIsExpand();
    } else if (!APITestStore.getNeedReload) {
      this.setState(APITestStore.getInitData);
    }
    APITestStore.setNeedReload(true);
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
      expandedRow: [],
    };
  }

  /* 微服务下拉框 */
  getOptionList() {
    const { service } = APITestStore;
    return service && service.length > 0 ? (
      APITestStore.service.map(({ name, value }) => (
        <Option key={value}>{name}</Option>
      ))
    ) : <Option value="empty">无服务</Option>;
  }

  /* 微服务版本下拉框 */
  getVersionList() {
    const { versions } = APITestStore;
    return versions && versions.length > 0 ? (
      APITestStore.versions.map((version, index) => (
        <Option key={index}><Tooltip title={version} placement="right" align={{ offset: [20, 0] }}>
          <span style={{ display: 'inline-block', width: '100%' }}>{version}</span>
        </Tooltip></Option>),
      )
    ) : <Option value="empty">无版本</Option>;
  }

  loadInitData = () => {
    APITestStore.setLoading(true);
    APITestStore.loadService().then((res) => {
      if (res.failed) {
        Choerodon.prompt(res.message);
        APITestStore.setLoading(false);
      } else if (res.length) {
        const services = res.map(({ location, name }) => ({
          name: name.split(':')[1],
          value: `${name.split(':')[0]}/${location.split('=')[1]}`,
          version: location.split('=')[1],
        }));
        APITestStore.setService(services);
        // 判断是否从详情页面跳转
        if (!APITestStore.detailFlag) {
          APITestStore.setApiToken(null);
          APITestStore.setUserInfo(null);
          APITestStore.setCurrentService(services[0]);
          APITestStore.setCurrentVersion(services[0].version);
        } else {
          APITestStore.setDetailFlag(false);
        }
        this.loadApi();
      }
    });
  };

  loadVersions = () => {
    const { service, currentService } = APITestStore;
    APITestStore.setFilters([]);
    const newVersions = [];
    if (service && service.length > 0) {
      APITestStore.service.forEach(({ name, value, version }, index) => {
        if (currentService.name === name) {
          newVersions.push(version);
        }
      },
      );
      APITestStore.setCurrentVersion(newVersions[0]);
      APITestStore.setVersions(newVersions);
    }
  }

  loadApi = (paginationIn, filtersIn, paramsIn) => {
    this.loadVersions(); // 在加载前根据store里的currentVerison加载版本
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
    const version = APITestStore.getCurrentVersion; // 修改为获取当前版本号的api
    this.fetch(serviceName, version, pagination, params)
      .then((data) => {
        APITestStore.setApiData(data.content);
        APITestStore.setLoading(false);
        this.setState({
          pagination: {
            current: data.number + 1,
            pageSize: 10,
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
      size: pageSize + 999,
      version,
      params,
    };
    return axios.get(`/manager/v1/swaggers/${serviceName}/controllers?${querystring.stringify(queryObj)}`);
  }

  handlePageChange = (pagination, filters, sorter = {}, params) => {
    if (params.length > 1) APITestStore.setFilters(params.slice(1));
    else APITestStore.setFilters(params);
    const data = APITestStore.getFilteredData;
    const newPagination = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: data.length,
    };
    if (params.length > 1) {
      this.setState({
        pagination: newPagination,
        params: params.slice(1),
      });
    } else {
      this.setState({
        pagination: newPagination,
        params,
      });
    }
  };

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      APITestStore.setCurrentService(APITestStore.service[0]);
      APITestStore.setFilters([]);
      this.loadApi();
      APITestStore.clearIsExpand();
    });
  };

  /**
   * 微服务下拉框改变事件
   * @param serviceName 服务名称
   */
  handleChange(serviceName) {
    const currentService = APITestStore.service.find(service => service.value === serviceName);
    APITestStore.clearIsExpand();
    APITestStore.setFilters([]);
    this.loadVersions();
    APITestStore.setCurrentService(currentService);
    this.setState(this.getInitState(), () => {
      this.loadApi();
    });
  }

  /**
   * 微服务版本下拉框改变事件
   * @param serviceName 服务名称
   */
  handleVersionChange(serviceVersion) {
    const currentVersion = APITestStore.versions.find(version => version === serviceVersion);
    APITestStore.clearIsExpand();
    APITestStore.setFilters([]);
    APITestStore.setCurrentVersion(currentVersion);
    this.setState(this.getInitState(), () => {
      this.loadApi();
    });
  }

  goDetail(record) {
    APITestStore.setApiDetail(record);
    APITestStore.setDetailFlag(true);
    APITestStore.setInitData(this.state); // 用来记录当前的分页状况当前页数等
    APITestStore.setNeedReload(false);
    const version = APITestStore.getCurrentService.value.split('/')[1];
    const service = APITestStore.getCurrentService.value.split('/')[0];
    const { refController, operationId } = record;
    this.props.history.push(`/iam/api-test/detail/${refController}/${service}/${operationId}/${version}`);
  }

  render() {
    const { intl, AppState } = this.props;
    const { pagination, params } = this.state;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text, data) => {
        const { name, method } = data;
        if (name) {
          // 控制展开的箭头
          return (
            <MouseOverWrapper text={name} width={0.18}>
              <span className={classnames('ant-table-row-expand-icon', `ant-table-row-${(APITestStore.getIsExpand.has(name)) ? 'expanded' : 'collapsed'}`)} />
              <span>{name}</span>
            </MouseOverWrapper>
          );
        } else {
          return (
            <span className={classnames('methodTag', `c7n-apitest-${method}`)}>{method}</span>
          );
        }
      },
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.path`} />,
      dataIndex: 'url',
      width: '35%',
      key: 'url',
      render: (text, record) => (
        <MouseOverWrapper text={text} width={0.3}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.description`} />,
      dataIndex: 'remark',
      width: '28%',
      key: 'remark',
      render: (text, data) => {
        const { description, remark } = data;
        if (remark) {
          return (<MouseOverWrapper text={remark} width={0.26}>
            {remark}
          </MouseOverWrapper>);
        } else {
          return description;
        }
      },
    }, {
      width: 160,
      title: <FormattedMessage id={`${intlPrefix}.available.range`} />,
      dataIndex: 'innerInterface',
      key: 'innerInterface',
      render: text => intl.formatMessage({ id: text === true ? `${intlPrefix}.inner` : `${intlPrefix}.outer` }),
    }, {
      title: '',
      width: 56,
      key: 'action',
      align: 'right',
      render: (text, record) => {
        if ('method' in record) {
          return (
            <Permission service={['manager-service.api.queryPathDetail']}>
              <Button
                shape="circle"
                icon="find_in_page"
                size="small"
                onClick={this.goDetail.bind(this, record)}
              />
            </Permission>
          );
        }
      },
    }];
    return (
      <Page
        service={[
          'manager-service.service.pageManager',
          'manager-service.api.queryPathDetail',
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
          <Select
            style={{ width: '247px', marginBottom: '32px' }}
            value={APITestStore.currentService.value}
            getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
            onChange={this.handleChange.bind(this)}
            label={<FormattedMessage id={`${intlPrefix}.service`} />}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {this.getOptionList()}
          </Select>
          <Select
            readOnly
            style={{ width: '247px', marginBottom: '32px', marginLeft: '18px' }}
            value={APITestStore.currentVersion}
            getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
            onChange={this.handleVersionChange.bind(this)}
            label={<FormattedMessage id={`${intlPrefix}.version`} />}
          >
            {this.getVersionList()}
          </Select>
          <Table
            className="c7n-api-table"
            loading={APITestStore.loading}
            indentSize={0}
            columns={columns}
            dataSource={APITestStore.getFilteredData}
            pagination={pagination}
            childrenColumnName="paths"
            filters={params}
            noFilter
            onChange={this.handlePageChange}
            rowKey={record => ('paths' in record ? record.name : record.operationId)}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
            onRow={record =>
              ({ onClick: () => {
                APITestStore.setIsExpand(record.name);
                this.setState({
                  expandedRow: APITestStore.getExpandKeys,
                });
              } })
            }
            expandRowByClick
            expandedRowKeys={this.state.expandedRow}
          />
        </Content>
      </Page>
    );
  }
}
