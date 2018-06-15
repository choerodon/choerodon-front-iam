/**
 * Created by hand on 2018/6/11.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button,  Form, Icon, Modal, Progress, Select, Table } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { Action, axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import querystring from 'query-string';
import './Configuration.scss';
import ConfigurationStore from '../../../stores/globalStores/configuration';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
@inject('AppState')
@observer

class Configuration extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      visible: false,
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
      instancePagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      instanceSort: {
        columnKey: 'id',
        order: 'descend',
      },
      instanceParams: '',
      selectedRowKeys: [],
    }
  }

  componentDidMount() {
    ConfigurationStore.setCurrentConfigId(null);
    ConfigurationStore.setStatus('create');
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
    this.fetch(ConfigurationStore.getCurrentService.name, pagination, sort, filters, params)
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
        ConfigurationStore.setConfigData(data.content.slice()),
        ConfigurationStore.setLoading(false);
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  fetch(serviceName, { current, pageSize }, { columnKey = 'id', order = 'descend' }, { name, configVersion, isDefault}, params) {
    ConfigurationStore.setLoading(true);
    const queryObj = {
      page: current - 1,
      size: pageSize,
      name,
      configVersion,
      isDefault,
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
    return axios.get(`/manager/v1/services/${serviceName}/configs?${querystring.stringify(queryObj)}`);
  }


  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadConfig(pagination, sorter, filters, params);
  };

  loadInstance(paginationIn, sortIn, paramsIn) {
    ConfigurationStore.setInstanceLoading(true);
    const {
      instancePagination: paginationState,
      instanceSort: sortState,
      instanceParams: paramsState,
    } = this.state;
    const pagination = paginationIn || paginationState;
    const sort = sortIn || sortState;
    const params = paramsIn || paramsState;
    this.fetchInstance(ConfigurationStore.getCurrentService.name, pagination, sort, params)
      .then((data) => {
        this.setState({
          instanceSort: sort,
          instanceParams: params,
          instancePagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
        });
        ConfigurationStore.setInstanceData(data.content.slice());
        ConfigurationStore.setInstanceLoading(false);
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  fetchInstance(serviceName, { current, pageSize }, { columnKey = 'id', order = 'descend' }, params) {
    ConfigurationStore.setInstanceLoading(true);
    const queryObj = {
      page: current - 1,
      size: pageSize,
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
    return axios.get(`/manager/v1/services/${serviceName}/instances?${querystring.stringify(queryObj)}`);
  }

  handleProptError = (error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }

  /* 跳转至配置管理 */
  goCreate = () => {
    this.props.history.push('/iam/configuration/create');
  }

  /* 刷新 */
  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadInitData();
    });
  }

  /* 微服务下拉框 */
  get filterBar() {
    return (
      <div>
        <Select
          style={{ width: '512px', marginBottom: '32px' }}
          value={ConfigurationStore.currentService.name}
          label="请选择微服务"
          filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filter
          onChange={this.handleChange.bind(this)}
        >
          {
            ConfigurationStore.service.map(({ name }) => (
              <Option key={name}>{name}</Option>
            ))
          }
        </Select>
      </div>
    )
  }

  /**
   * 微服务下拉框改变事件
   * @param serviceName 服务名称
   */
  handleChange(serviceName) {
    const currentService = ConfigurationStore.service.find(service => service.name === serviceName);
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
      params: '',
    }, () => this.loadConfig());
  }

  /**
   * 删除配置
   * @param record 当前行数据
   */
  deleteConfig = (record) => {
    Modal.confirm({
      title: "删除配置",
      content: `确定要删除配置${record.name}吗？`,
      onOk: () => {
        ConfigurationStore.deleteConfig(record.id).then(({ failed, message }) => {
          if (failed) {
            Choerodon.prompt(message);
          } else {
            Choerodon.prompt("删除成功");
            this.loadConfig();
          }
        })
      },
    });
  }

  /**
   * 设置默认配置
   * @param configId 配置id
   */
  setDefaultConfig = (configId) => {
    ConfigurationStore.setDefaultConfig(configId). then(({ failed, message }) => {
      if (failed) {
        Choerodon.prompt(message);
      } else {
        Choerodon.prompt("修改成功");
        this.loadConfig();
      }
    })
  }

  /* 开启sidebar */
  handleOpen = (record) => {
    this.setState({visible: true, selectedRowKeys: []});
    this.loadInstance();
  }

  /* 关闭sidebar */
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }


  /**
   * 基于此创建
   * @param record 当前行数据
   */
  createByThis = (record) => {
    ConfigurationStore.setCurrentConfigId(record.id);
    ConfigurationStore.setStatus('baseon');
    this.goCreate();
  }

  /**
   * 修改
   * @param record 当前行数据
   */
  handleEdit = (record) => {
    ConfigurationStore.setEditConfig(record);
    ConfigurationStore.setCurrentConfigId(record.id);
    ConfigurationStore.setStatus('edit');
    this.goCreate();
  }

  onSelectChange = (selectedRowKeys) => {
    window.console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  }

  /* 渲染侧边栏内容 */
  renderSidebarContent() {
    const { instancePagination, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <Content
        className="sidebar-content"
        title="将配置应用到实例"
        description="一个实例只能应用一个配置，但一个配置可以被多个实例应用。你可以选择个多个实例进行批量应用。勾选要应用该配置的实例后，点击保存，使配置的应用生效。"
        link="http://v0-6.choerodon.io/zh/docs/user-guide/system-configuration/microservice-management/route/"
      >
        <Table
          rowSelection={rowSelection}
          loading={ConfigurationStore.instanceLoading}
          dataSource={ConfigurationStore.getInstanceData.slice()}
          pagination={instancePagination}
          rowkey="id"
          filterBarPlaceholder="过滤表"
          style={{
            width: '512px',
          }}
          columns={[{
            title: '实例ID',
            dataIndex: 'instanceId',
            key: 'instanceId'
          }]}
        />
      </Content>
    )
  }

  render() {
    const { sort: { columnKey, order }, filters, pagination, visible } = this.state;
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
    }, {
      title: '是否为默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      filters: [{
        text: '是',
        value: 'true',
      }, {
        text: '否',
        value: 'false',
      }],
      filteredValue: filters.isDefault || [],
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
          action: this.createByThis.bind(this, record),
        }, {
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '设为默认配置',
          action: this.setDefaultConfig.bind(this, record.id)
        }, {
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '应用配置',
          action: this.handleOpen.bind(this, record)
        }, {
          service: ['iam-service.role.createBaseOnRoles'],
          type: 'site',
          icon: '',
          text: '修改',
          action: this.handleEdit.bind(this, record)
        }];
        if (!record.isDefault) {
          actionsDatas.push({
            service: ['iam-service.role.createBaseOnRoles'],
            type: 'site',
            icon: '',
            text: '删除',
            action: this.deleteConfig.bind(this, record),
          })
        }
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
          link="http://v0-6.choerodon.io/zh/docs/user-guide/system-configuration/microservice-management/route/"
        >
          {this.filterBar}
          <Table
            loading={ConfigurationStore.loading}
            columns={columns}
            dataSource={ConfigurationStore.getConfigData.slice()}
            pagination={pagination}
            filters={this.state.filters.params}
            onChange={this.handlePageChange}
            rowkey="id"
            filterBarPlaceholder="过滤表"
          />
          <Sidebar
            title="应用配置"
            visible={visible}
            okText="保存"
            cancelText="取消"
            onCancel={this.handleCancel}
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    )
  }
}

export default Form.create({})(withRouter(Configuration));
