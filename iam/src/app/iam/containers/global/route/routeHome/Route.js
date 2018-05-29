/**
 * Created by hulingfangzi on 2018/5/28.
 */

import React, { Component } from 'react';
import { Button, Col, Form, Icon, Input, Modal, Row, Select, Spin, Table, Tooltip, Popover } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import querystring from 'query-string';
import { observer, inject } from 'mobx-react';
import Page, { Header, Content } from 'Page';
import axios from 'Axios';

const { Sidebar } = Modal;
const Option = Select.Option;
const FormItem = Form.Item;
@inject('AppState')
@observer
class Route extends Component {
  state = this.getInitState();

  componentWillMount() {
    this.loadRouteList();
  }

  /* 初始化state */
  getInitState() {
    return {
      visible: false,
      content: null,
      loading: false,
      sidebarData: {},
      isShow: '',
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

  loadRouteList(paginationIn, sortIn, filtersIn, paramsIn) {
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
    this.fetch(pagination, sort, filters, params)
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
          content: data.content,
          loading: false,
        });
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  fetch({ current, pageSize }, { columnKey = 'id', order = 'descend' }, { name, path, serviceId, builtIn }, params) {
    this.setState({
      loading: true,
    });
    const queryObj = {
      page: current - 1,
      size: pageSize,
      name,
      path,
      serviceId,
      builtIn,
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
    return axios.get(`/manager/v1/routes?${querystring.stringify(queryObj)}`);
  }


  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadRouteList(pagination, sorter, filters, params);
  };


  createRoute = () => {
    this.props.form.resetFields();
    this.setState({
      visible: true,
      show: 'create',
    });
  }

  /* 刷新 */
  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadRouteList();
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }

  renderSidebarTitle() {
    const { show } = this.state;
    if (show === 'create') {
      return '创建路由';
    } else if (show === 'edit') {
      return '修改路由';
    } else {
      return '路由详情';
    }
  }

  renderSidebarContent() {
    const { getFieldDecorator } = this.props.form;
    const { show, sidebarData } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const inputWidth = 512;
    let title;
    let description;
    if (show === 'create') {
      title = `在平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"中创建路由`;
      description = '请在下面输入路由名称、路径、路径对应的微服务创建路由。其中，路由名称时全平台唯一的，路由创建后不能修改路由名称。';
    } else if (show === 'edit') {
      title = `对路由"${sidebarData.name}"进行修改`;
      description = '您可以在此修改路由的路径、路径对应的微服务以及配置路由前缀、重试、敏感头、Helper等信息。';
    } else {
      title = `查看路由${sidebarData.name}的详情`;
      description = '预定义路由为平台初始化设置，您不能修改预定义路由。';
    }

    return (
      <Content
        style={{ padding: 0 }}
        title={title}
        description={description}
      >
        <Form>
          {
            show === 'create' && (
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入路由名称',
                  }],
                })(
                  <Input label="路由名称" style={{ width: inputWidth }} />,
                )}
              </FormItem>
            )
          }
          {
            show === 'create' && (
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('path', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入路径',
                  }],
                })(
                  <Input label="路径" style={{ width: inputWidth }} />,
                )}
              </FormItem>
            )
          }
          {
            show === 'create' && (
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('microservice', {
                  rules: [{
                    required: true,
                    message: Choerodon.getMessage('必须选择一个微服务', 'Please choose one microservice at least'),
                  }],
                })(
                  <Select
                    style={{ width: 300 }}
                    label="请选择一个微服务"
                    filter
                  >
                    <Option value="test" key="test" />
                  </Select>,
                )}
              </FormItem>
            )
          }
        </Form>
      </Content>
    );
  }

  /**
   * 渲染列表路由来源
   * @param record 当前行数据
   */
  renderBuiltIn(record) {
    if (record.builtIn) {
      return (
        <div>
          <span className="icon-settings" />
          {Choerodon.getMessage('预定义', 'Predefined')}
        </div>
      );
    } else {
      return (
        <div>
          <span className="icon-av_timer" />
          {Choerodon.getMessage('自定义', 'Custom')}
        </div>
      );
    }
  }

  /**
   * 渲染列表操作按钮
   * @param record 当前行数据
   */
  renderAction(record) {
    if (record.builtIn) {
      return (
        <div>
          <Popover
            trigger="hover"
            content="路由详情"
            placement="bottom"
          >
            <Button
              icon="find_in_page"
              shape="circle"
            />
          </Popover>
        </div>
      );
    } else {
      return (
        <div>
          <Popover
            trigger="hover"
            content="修改路由"
            placement="bottom"
          >
            <Button
              icon="mode_edit"
              shape="circle"
            />
          </Popover>
          <Popover
            trigger="hover"
            content="删除路由"
            placement="bottom"
          >
            <Button
              icon="delete_forever"
              shape="circle"
            />
          </Popover>
        </div>
      );
    }
  }

  render() {
    const { AppState } = this.props;
    const { sort: { columnKey, order }, filters } = this.state;
    const { content, loading, pagination, visible, show } = this.state;
    const { type } = AppState.currentMenuType;
    const filtersService = content && content.map(({ serviceId }) => ({
      value: serviceId,
      text: serviceId,
    }));
    const columns = [{
      title: '路由名称',
      dataIndex: 'name',
      key: 'name',
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      filters: [],
      filteredValue: filters.path || [],
    }, {
      title: '对应微服务',
      dataIndex: 'serviceId',
      key: 'serviceId',
      filters: filtersService,
      filteredValue: filters.serviceId || [],
    }, {
      title: '路由来源',
      dataIndex: 'builtIn',
      key: 'builtIn',
      filters: [{
        text: '预定义',
        value: 'true',
      }, {
        text: '自定义',
        value: 'false',
      }],
      filteredValue: filters.builtIn || [],
      render: (text, record) => this.renderBuiltIn(record),
    }, {
      title: '',
      width: '100px',
      key: 'action',
      render: (text, record) => this.renderAction(record),
    }];
    return (
      <Page>
        <Header
          title="路由管理"
        >
          <Button
            icon="playlist_add"
            onClick={this.createRoute}
          >
            {Choerodon.getMessage('创建路由', 'create')}
          </Button>
          <Button
            icon="refresh"
            onClick={this.handleRefresh}
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"的路由管理`}
          description="路由发送请求到网关会访问服务。一个服务可以分配多个路径的路由，一个路由路径只指向一个服务。"
        >
          <Table
            columns={columns}
            dataSource={content}
            loading={loading}
            pagination={pagination}
            onChange={this.handlePageChange}
            filterBarPlaceholder="过滤表"
          />
          <Sidebar
            title={this.renderSidebarTitle()}
            visible={visible}
            okText={'保存'}
            cancelText="取消"
            onCancel={this.handleCancel}
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(Route));
