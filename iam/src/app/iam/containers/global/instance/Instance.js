/**
 * Created by hulingfangzi on 2018/6/20.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button,  Form, Modal, Progress, Select, Table } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { Action, axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import querystring from 'query-string';
import InstanceStore from '../../../stores/globalStores/instance'

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;

@inject('AppState')
@observer

class Instance extends Component {
  state = this.getInitState();

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
      params: '',
    }
  }

  componentDidMount() {
    this.loadInitData();
  }

  loadInitData = () => {
    InstanceStore.setLoading(true);
    InstanceStore.loadService().then((res) => {
      if (res.failed) {
        Choerodon.prompt(res.message);
      } else {
        InstanceStore.setService(res || []);
        if (res.length) {
          let defaultService;
          defaultService = res[0];
          InstanceStore.setCurrentService(defaultService);
          this.loadInstanceData();
        } else {
          InstanceStore.setLoading(false);
        }
      }
    })
  }

  loadInstanceData(paginationIn, sortIn, filtersIn, paramsIn) {
    InstanceStore.setLoading(true);
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
    this.fetch(InstanceStore.getCurrentService.name, pagination, sort, filters, params)
      .then((data) => {
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
        InstanceStore.setInstanceData(data.content.slice()),
        InstanceStore.setLoading(false);
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  fetch(serviceName, { current, pageSize }, { columnKey = 'id', order = 'descend' }) {
    InstanceStore.setLoading(true);
    const queryObj = {
      page: current - 1,
      size: pageSize,
    };
    if (columnKey) {
      const sorter = [];
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
      queryObj.sort = sorter.join(',');
    }
    return axios.get(`/manager/v1/services/${serviceName}/instances?${querystring.stringify(queryObj)}`);
  }

  /**
   * 微服务下拉框改变事件
   * @param serviceName 服务名称
   */
  handleChange(serviceName) {
    const currentService = InstanceStore.service.find(service => service.name === serviceName);
    InstanceStore.setCurrentService(currentService);
    this.setState(this.getInitState(), () => {
      this.loadInstanceData();
    });
  }



  /* 微服务下拉框 */
  get filterBar() {
    return (
      <div>
        <Select
          style={{ width: '512px', marginBottom: '32px' }}
          value={InstanceStore.currentService.name}
          label="请选择微服务"
          filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filter
          onChange={this.handleChange.bind(this)}
        >
          {
            InstanceStore.service.map(({ name }) => (
              <Option key={name}>{name}</Option>
            ))
          }
        </Select>
      </div>
    )
  }

  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadConfig(pagination, sorter, filters, params);
  };


  render() {
    const { sort: { columnKey, order }, filters, pagination } = this.state;
    const columns = [{
      title: 'ID',
      dataIndex: 'name',
      key: 'name',
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: '版本',
      dataIndex: 'configVersion',
      key: 'configVersion',
      filters: [],
      filteredValue: filters.configVersion || [],
    }, {
      title: '端口号',
      dataIndex: 'publicTime',
      key: 'publicTime',
    }, {
      title: '注册时间',
      dataIndex: 'isDefault',
      key: 'isDefault',
      filters: [],
      filteredValue: filters.isDefault || [],
    }];
    return (
      <Page>
        <Header
          title="实例管理"
        >
          <Button
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"的实例管理`}
          description="实例属于一个微服务。请先选择一个微服务，查看该微服务下的实例信息。"
          link="http://v0-6.choerodon.io/zh/docs/user-guide/system-configuration/microservice-management/route/"
        >
        {this.filterBar}
        <Table
          loading={InstanceStore.loading}
          columns={columns}
          pagination={pagination}
          filters={this.state.filters.params}
          onChange={this.handlePageChange}
          rowkey="id"
          filterBarPlaceholder="过滤表"
        />
        </Content>
      </Page>
    )
  }
}

export default Form.create({})(withRouter(Instance));
