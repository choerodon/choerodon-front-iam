import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Select, Table, Tooltip, Modal, Form, Input, Popover, Icon, Tabs } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, Action } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import TaskClassNameStore from '../../../stores/global/task-classname';
import jsonFormat from '../../../common/json-format';

const { Sidebar } = Modal;
const { TabPane } = Tabs;
const intlPrefix = 'global.task.classname';
const dataSource = {
  totalPages: 1,
  totalElements: 3,
  numberOfElements: 3,
  number: 0,
  size: 20,
  content: [
    {
      id: 705,
      code: 'iam-disable-project',
      serviceName: 'iam-service',
      classname: 'loginName.email.memberType',
      description: '描述1',
      onlineInstanceCount: '5',
      paramsName: 'disabled',
      paramsDes: '是否禁用状态，默认为 false',
      paramsType: 'boolean',
      defaultValue: false,
    },
    {
      id: 704,
      code: 'iam-disable-project',
      serviceName: 'iam-service',
      classname: 'loginName.email.memberType',
      description: '描述1',
      onlineInstanceCount: '5',
      paramsName: 'disabled',
      paramsDes: '是否禁用状态，默认为 false',
      paramsType: 'boolean',
      defaultValue: false,
    },
    {
      id: 703,
      code: 'iam-disable-project',
      serviceName: 'iam-service',
      classname: 'loginName.email.memberType',
      description: '描述1',
      onlineInstanceCount: '5',
      paramsName: 'disabled',
      paramsDes: '是否禁用状态，默认为 false',
      paramsType: 'boolean',
      defaultValue: false,
    },
  ],
  empty: false,
};

@withRouter
@injectIntl
@inject('AppState')

export default class TaskDetail extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      isShowSidebar: false,
      loading: true,
      classLoading: true,
      showJson: false,
      pagination: {
        current: dataSource.number + 1,
        pageSize: dataSource.size,
        total: dataSource.totalElements,
      },
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
      filters: {},
      params: [],
      classPagination: {
        current: dataSource.number + 1,
        pageSize: dataSource.size,
        total: dataSource.totalElements,
      },
      classSort: {
        columnKey: 'id',
        order: 'descend',
      },
      classFilters: {},
      classParams: [],
    };
  }

  // componentWillMount() {
  //   this.loadTaskClassName();
  // }
  //
  // loadTaskClassName(paginationIn, sortIn, filtersIn, paramsIn) {
  //   const {
  //     pagination: paginationState,
  //     sort: sortState,
  //     filters: filtersState,
  //     params: paramsState,
  //   } = this.state;
  //   const pagination = paginationIn || paginationState;
  //   const sort = sortIn || sortState;
  //   const filters = filtersIn || filtersState;
  //   const params = paramsIn || paramsState;
  //   // 防止标签闪烁
  //   this.setState({ filters, loading: true });
  //   TaskClassNameStore.loadData(pagination, filters, sort, params).then((data) => {
  //     TaskClassNameStore.setData(data.content);
  //     this.setState({
  //       pagination: {
  //         current: data.number + 1,
  //         pageSize: data.size,
  //         total: data.totalElements,
  //       },
  //       loading: false,
  //       sort,
  //       filters,
  //       params,
  //     });
  //   }).catch((error) => {
  //     Choerodon.handleResponseError(error);
  //     this.setState({
  //       loading: false,
  //     });
  //   });
  // }

  // 开启侧边栏
  openSidebar = (id) => {
    this.setState({
      isShowSidebar: true,
    });
  }

  // 关闭侧边栏
  handleOk = () => {
    this.setState({
      isShowSidebar: false,
    }, () => {
      this.setState({
        showJson: false,
      });
    });
  }

  /**
   * 侧边栏选项卡切换
   * @param showJson 选项卡的key
   */
  handleTabChange = (showJson) => {
    this.setState({
      showJson: showJson === 'json',
    });
  }

  // 渲染侧边栏参数列表
  renderParamsTable() {
    const { intl } = this.props;
    const { classSort: { columnKey, order }, classFilters, classParams, classPagination, classLoading } = this.state;
    const classColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.params.name`} />,
      dataIndex: 'paramsName',
      key: 'paramsName',
      filters: [],
      filteredValue: classFilters.paramsName || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.description`} />,
      dataIndex: 'paramsDes',
      key: 'paramsDes',
      filters: [],
      filteredValue: classFilters.paramsDes || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.type`} />,
      dataIndex: 'paramsType',
      key: 'paramsType',
      filters: [],
      filteredValue: classFilters.paramsType || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.default`} />,
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      filters: [],
      filteredValue: classFilters.defaultValue || [],
      render: text => <span>{`${text}`}</span>,
    }];
    return (
      <Table
        columns={classColumns}
        dataSource={dataSource.content}
        pagination={classPagination}
        filters={classParams}
        rowKey="id"
        filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
      />
    );
  }

  render() {
    const { intl } = this.props;
    const { sort: { columnKey, order }, filters, params, pagination, loading, isShowSidebar, showJson } = this.state;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.code`} />,
      dataIndex: 'code',
      key: 'code',
      filters: [],
      filteredValue: filters.code || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.belong.service`} />,
      dataIndex: 'serviceName',
      key: 'serviceName',
      filters: [],
      filteredValue: filters.serviceName || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.classname`} />,
      dataIndex: 'classname',
      key: 'classname',
      filters: [],
      filteredValue: filters.classname || [],
    }, {
      title: <FormattedMessage id="description" />,
      dataIndex: 'description',
      key: 'description',
      filters: [],
      filteredValue: filters.description || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.online.instance.count`} />,
      dataIndex: 'onlineInstanceCount',
      key: 'onlineInstanceCount',
    }, {
      title: '',
      width: 56,
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <Button
          shape="circle"
          icon="find_in_page"
          size="small"
          onClick={this.openSidebar.bind(this, record.id)}
        />
      ),
    }];
    return (
      <Page>
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
        >
          <Table
            columns={columns}
            dataSource={dataSource.content}
            pagination={pagination}
            filters={params}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.class.header.title`} />}
            visible={isShowSidebar}
            onOk={this.handleOk}
            okText={<FormattedMessage id="close" />}
            okCancel={false}
          >
            <Content
              className="sidebar-content"
              code={`${intlPrefix}.class`}
              values={{ name: 'iam-disable-project' }}
            >
              <Tabs activeKey={showJson ? 'json' : 'table'} onChange={this.handleTabChange}>
                <TabPane tab={<FormattedMessage id={`${intlPrefix}.params.list`} />} key="table" />
                <TabPane tab={<FormattedMessage id={`${intlPrefix}.params.json`} />} key="json" />
              </Tabs>
              {showJson
                ? (<div style={{ margin: 0 }}>json</div>)
                : (this.renderParamsTable())
              }
            </Content>
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
