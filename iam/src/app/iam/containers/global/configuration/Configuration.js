/**
 * Created by hand on 2018/6/11.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button,  Form, Icon, Modal, Progress, Select, Table } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { Action, axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import classnames from 'classnames';
import querystring from 'query-string';
import './Configuration.scss';
import ConfigurationStore from '../../../stores/globalStores/configuration';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const pageSize = 10;
const FormItemNumLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};

@inject('AppState')
@observer

class Configuration extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      viseble: false,
      loading: false,
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
    }
  }

  componentDidMount() {
    this.loadInitData();
  }

  loadInitData = () => {
    ConfigurationStore.setLoading(true);
    ConfigurationStore.loadService().then((res) => {
      ConfigurationStore.setService(res.content || []);
      const response = this.handleProptError(res);
      if (response) {
        const { content } = res;
        if (content.length) {
          const defaultService = content[0];
          ConfigurationStore.setCurrentService(defaultService);
          this.loadConfig();
        } else {
          ConfigurationStore.setLoading(false);
        }
      }
    })
  }

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadInitData();
    });
  }

  loadConfig(paginationIn, sortIn, filtersIn, paramsIn) {
    ConfigurationStore.setLoading(true);
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
    this.fetch(ConfigurationStore.getCurrentService.id, pagination, sort, filters, params)
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
        ConfigurationStore.setConfigData(data.content),
        ConfigurationStore.setLoading(false);
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  fetch(serviceId, { current, pageSize }, { columnKey = 'id', order = 'descend' }, { id, configVersion, publicTime, isDefault}, params) {
    ConfigurationStore.setLoading(true);
    const queryObj = {
      serviceId,
      page: current - 1,
      size: pageSize,
      id,
      configVersion,
      publicTime,
      params,
      default: isDefault,
    };
    if (columnKey) {
      const sorter = [];
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
      queryObj.sort = sorter.join(',');
    }
    return axios.get(`/manager/v1/configs?${querystring.stringify(queryObj)}`);
  }




  handleProptError = (error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }

  goCreate = () => {
    this.props.history.push('configuration/create');
  }

  handleChange(serviceId) {
    const currentService = ConfigurationStore.service.find(service => service.id === serviceId);
    ConfigurationStore.setCurrentService(currentService);
    this.setState({
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
      params: {},
    }, () => this.loadConfig());
  }

  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadConfig(pagination, sorter, filters, params);
  };

  get filterBar() {
    return (
      <div>
        <Select
          style={{ width: '512px', marginBottom: '16px' }}
          value={ConfigurationStore.currentService.id}
          label="请选择微服务"
          filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filter
          onChange={this.handleChange.bind(this)}
        >
          {
            ConfigurationStore.service.map(({ name, id }) => (
              <Option value={id} key={name}>{name}</Option>
            ))
          }
        </Select>
      </div>
    )
  }

  render() {
    const { sort: { columnKey, order }, filters, pagination } = this.state;
    const columns = [{
      title: '配置ID',
      dataIndex: 'name',
      key: 'name',
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: '配置版本',
      dataIndex: 'configVersion',
      key: 'configVersion',
      filters: [],
      filteredValue: filters.configVersion || [],
    }, {
      title: '配置创建时间',
      dataIndex: 'publicTime',
      key: 'publicTime',
      filters: [],
      filteredValue: filters.publicTime || [],
    }, {
      title: '是否为默认',
      dataIndex: 'default',
      key: 'default',
      filters: [],
      filteredValue: filters.default || [],
      render: (text) => {
      return text ? '是' : '否';
    }
    }, {
      title: '',
      width: '100px',
      key: 'action',
      render: (text, record) => {
        const actionsDatas = [{
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '基于此配置创建',
          action: ''
        }, {
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '设为默认配置',
          action: ''
        }, {
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '应用配置',
          action: ''
        }, {
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '修改',
          action: ''
        }, {
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '删除',
          action: ''
        }]
        return <Action data={actionsDatas} />
      },
    }];
    return (
      <Page>
        <Header
          title="配置管理"
        >
          <Button
            icon="playlist_add"
            onClick={this.goCreate}
          >
            创建配置
          </Button>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"的配置管理`}
          description="配置管理用来集中管理应用的当前环境的配置，配置修改后能够实时推送到应用端。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/microservice-management/route/"
        >
          {this.filterBar}
          <Table
            loading={ConfigurationStore.loading}
            columns={columns}
            dataSource={ConfigurationStore.configData.slice()}
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

export default Form.create({})(withRouter(Configuration));
