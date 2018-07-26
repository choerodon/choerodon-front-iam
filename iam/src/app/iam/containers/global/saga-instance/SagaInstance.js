import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Table, Tooltip, Modal } from 'choerodon-ui';
import { Content, Header, Page } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import SagaImg from './../saga/SagaImg';
import SagaInstanceStore from '../../../stores/global/saga-instance/SagaInstanceStore';
import './style/saga-instance.scss';
import SagaStore from "../../../stores/global/saga/SagaStore";

const intlPrefix = 'global.saga-instance';
const { Sidebar } = Modal;

@injectIntl
@inject('AppState')
@observer
export default class SagaInstance extends Component {
  state = this.getInitState();

  componentWillMount() {
    this.reload();
  }

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
      params: [],
      data: {},
      activeTab: 'all',
    };
  }

  reload = (paginationIn, filtersIn, sortIn, paramsIn) => {
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
    this.setState({
      loading: true,
    });
    SagaInstanceStore.loadData(pagination, filters, sort, params).then((data) => {
      SagaInstanceStore.setData(data.content);
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
    });
  }

  tableChange = (pagination, filters, sort, params) => {
    this.reload(pagination, filters, sort, params);
  }

  loadFailedData = () => {
    const { activeTab } = this.state;
    if (activeTab === 'failed') {
      return;
    }
    this.setState({
      activeTab: 'failed',
      filters: { status: ['FAILED'] },
    }, () => {
      this.reload();
    });
  }

  loadAllData = () => {
    const { activeTab } = this.state;
    if (activeTab === 'all') {
      return;
    }
    this.refresh();
  }

  openSidebar = (id) => {
    SagaInstanceStore.loadDetailData(id).then((data) => {
      this.setState({
        data,
      }, () => {
        this.setState({
          visible: true,
        });
      });
    });
  }

  handleOk = () => {
    this.setState({
      visible: false,
    });
  }

  refresh = () => {
    this.setState(this.getInitState(), () => {
      this.reload();
    });
  }

  renderStatus(status) {
    let obj = {};
    switch (status) {
      case 'RUNNING':
        obj = {
          key: 'running',
          value: '运行中',
        };
        break;
      case 'FAILED':
        obj = {
          key: 'failed',
          value: '失败',
        };
        break;
      case 'NON_CONSUMER':
      case 'COMPLETED':
        obj = {
          key: 'completed',
          value: '完成',
        };
        break;
      default:
        break;
    }
    return (
      <span className={`c7n-saga-instance-status ${obj.key}`}>
        {obj.value}
      </span>
    );
  }

  renderTable() {
    const { intl } = this.props;
    const { filters, activeTab } = this.state;
    const dataSource = SagaInstanceStore.getData.slice();
    const columns = [
      {
        title: <FormattedMessage id={`${intlPrefix}.id`} />,
        key: 'id',
        dataIndex: 'id',
        filters: [],
        filteredValue: filters.id || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.status`} />,
        key: 'status',
        dataIndex: 'status',
        render: status => this.renderStatus(status),
        filters: [{
          value: 'RUNNING',
          text: '运行中',
        }, {
          value: 'FAILED',
          text: '失败',
        }, {
          value: 'COMPLETED',
          text: '完成',
        }],
        filteredValue: (activeTab === 'all' && filters.status) || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.start.time`} />,
        key: 'startTime',
        dataIndex: 'startTime',
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.end.time`} />,
        key: 'endTime',
        dataIndex: 'endTime',
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.saga`} />,
        key: 'sagaCode',
        dataIndex: 'sagaCode',
        filters: [],
        filteredValue: filters.sagaCode || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.reftype`} />,
        key: 'refType',
        dataIndex: 'refType',
        filters: [],
        filteredValue: filters.refType || [],
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.refid`} />,
        key: 'refId',
        dataIndex: 'refId',
        filters: [],
        filteredValue: filters.refId || [],
      },
      {
        title: '',
        width: '100px',
        key: 'action',
        align: 'right',
        render: (text, record) => (
          <div>
            <Tooltip
              title={<FormattedMessage id="detail" />}
              placement="bottom"
            >
              <Button
                icon="find_in_page"
                size="small"
                shape="circle"
                onClick={this.openSidebar.bind(this, record.id)}
              />
            </Tooltip>
          </div>
        ),
      },
    ];
    return (
      <Table
        loading={this.state.loading}
        pagination={this.state.pagination}
        columns={columns}
        indentSize={0}
        dataSource={dataSource}
        filters={this.state.params}
        rowKey="id"
        onChange={this.tableChange}
        filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
      />
    );
  }

  render() {
    const { data, activeTab } = this.state;
    return (
      <Page
        className="c7n-saga"
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Button
            icon="refresh"
            onClick={this.refresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
        >
          <div className="c7n-saga-instance-btns">
            <span className="text">
              <FormattedMessage id={`${intlPrefix}.view`} />：
            </span>
            <Button
              onClick={this.loadAllData}
              className={activeTab === 'all' && 'active'}
              type="primary"
            ><FormattedMessage id={`${intlPrefix}.all`} /></Button>
            <Button
              className={activeTab === 'failed' && 'active'}
              onClick={this.loadFailedData}
              type="primary"
            ><FormattedMessage id={`${intlPrefix}.failed`} /></Button>
          </div>
          {this.renderTable()}
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.detail`} />}
            onOk={this.handleOk}
            okText={<FormattedMessage id="close" />}
            okCancel={false}
            visible={this.state.visible}
          >
            <Content
              className="sidebar-content"
              code={`${intlPrefix}.detail`}
            >
              <SagaImg data={data} instance />
            </Content>
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
