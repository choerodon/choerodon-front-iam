import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Select, Table, Tooltip, Modal, Form, Input, Popover, Icon, Tabs } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, Action } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import ExecutableProgramStore from '../../../stores/global/executable-program';
import jsonFormat from '../../../common/json-format';
import MouseOverWrapper from '../../../components/mouseOverWrapper';
import './ExecutableProgram.scss';

const { Sidebar } = Modal;
const { TabPane } = Tabs;
const intlPrefix = 'executable.program';

// 公用方法类
class ExecutableProgramType {
  constructor(context) {
    this.context = context;
    const { AppState } = this.context.props;
    this.data = AppState.currentMenuType;
    const { type, id, name } = this.data;
    let codePrefix;
    switch (type) {
      case 'organization':
        codePrefix = 'organization';
        break;
      case 'project':
        codePrefix = 'project';
        break;
      case 'site':
        codePrefix = 'global';
        break;
      default:
        break;
    }
    this.code = `${codePrefix}.executable.program`;
    this.values = { name: name || AppState.getSiteInfo.systemName || 'Choerodon' };
    this.type = type;
    this.id = id; // 项目或组织id
    this.name = name; // 项目或组织名称
  }
}

@withRouter
@injectIntl
@inject('AppState')
@observer

export default class ExecutableProgram extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      isShowSidebar: false,
      loading: true,
      classLoading: true,
      showJson: false,
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
      programName: null,
    };
  }

  componentWillMount() {
    this.initExecutableProgram();
    this.loadTaskClassName();
  }

  initExecutableProgram() {
    this.executableProgram = new ExecutableProgramType(this);
  }

  loadTaskClassName(paginationIn, filtersIn, sortIn, paramsIn) {
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
    this.setState({ filters, loading: true });
    ExecutableProgramStore.loadData(pagination, filters, sort, params).then((data) => {
      ExecutableProgramStore.setData(data.content);
      this.setState({
        pagination: {
          current: data.number + 1,
          pageSize: data.size,
          total: data.totalElements,
        },
        loading: false,
        sort,
        filters,
        params,
      });
    }).catch((error) => {
      Choerodon.handleResponseError(error);
      this.setState({
        loading: false,
      });
    });
  }

  handlePageChange = (pagination, filters, sort, params) => {
    this.loadTaskClassName(pagination, filters, sort, params);
  };

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadTaskClassName();
    });
  };


  // 开启侧边栏
  openSidebar = (record) => {
    this.setState({
      classLoading: true,
    });
    ExecutableProgramStore.loadProgramDetail(record.id).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
        this.setState({
          classLoading: false,
        });
      } else {
        ExecutableProgramStore.setDetail(data);
        this.setState({
          isShowSidebar: true,
          programName: record.code,
          classLoading: false,
        });
      }
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
    const classColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.params.name`} />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.description`} />,
      dataIndex: 'description',
      key: 'description',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.type`} />,
      dataIndex: 'type',
      key: 'type',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.default`} />,
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: text => <span>{`${text}`}</span>,
    }];
    return (
      <Table
        loading={this.state.classLoading}
        columns={classColumns}
        dataSource={ExecutableProgramStore.getDetail.paramsList}
        pagination={false}
        filterBar={false}
        rowKey="name"

      />
    );
  }

  render() {
    const { intl, AppState } = this.props;
    const { sort: { columnKey, order }, filters, params, pagination, loading, isShowSidebar, showJson, programName } = this.state;
    const { code, values } = this.executableProgram;
    const data = ExecutableProgramStore.getData.slice();
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.code`} />,
      dataIndex: 'code',
      key: 'code',
      filters: [],
      filteredValue: filters.code || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.belong.service`} />,
      dataIndex: 'service',
      key: 'service',
      filters: [],
      filteredValue: filters.service || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.name`} />,
      dataIndex: 'method',
      key: 'method',
      width: '30%',
      filters: [],
      filteredValue: filters.method || [],
      render: text => (
        <MouseOverWrapper text={text} width={0.3}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="description" />,
      dataIndex: 'description',
      key: 'description',
      filters: [],
      filteredValue: filters.description || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.online.instance.count`} />,
      dataIndex: 'onlineInstanceNum',
      key: 'onlineInstanceNum',
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
          onClick={this.openSidebar.bind(this, record)}
        />
      ),
    }];
    return (
      <Page
        service={[
          'asgard-service.schedule-method.getParams',
          'asgard-service.schedule-method.pagingQuery',
        ]}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            icon="refresh"
            onClick={this.handleRefresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={code}
          values={{ name: `${values.name || 'Choerodon'}` }}
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={pagination}
            filters={params}
            rowKey="id"
            onChange={this.handlePageChange}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.program.header.title`} />}
            visible={isShowSidebar}
            onOk={this.handleOk}
            okText={<FormattedMessage id="close" />}
            okCancel={false}
            className="c7n-executable-program-sidebar"
          >
            <Content
              className="sidebar-content"
              code={`${code}.class`}
              values={{ name: programName }}
            >
              <Tabs activeKey={showJson ? 'json' : 'table'} onChange={this.handleTabChange}>
                <TabPane tab={<FormattedMessage id={`${intlPrefix}.params.list`} />} key="table" />
                <TabPane tab={<FormattedMessage id={`${intlPrefix}.params.json`} />} key="json" />
              </Tabs>
              {showJson
                ? (<div className="c7n-executable-program-json" style={{ margin: 0 }}><pre><code id="json">{jsonFormat(ExecutableProgramStore.getDetail.paramsList)}</code></pre></div>)
                : (this.renderParamsTable())
              }
            </Content>
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
