import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Select, Table, DatePicker, Radio, Tooltip, Modal, Form, Input, Popover, Icon, Tabs, Col, Row } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, Action } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import TaskDetailStore from '../../../stores/global/task-detail';
import './TaskDetail.scss';

const intlPrefix = 'global.taskdetail';
const { Sidebar } = Modal;
const { TextArea } = Input;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { TabPane } = Tabs;
const dataSource = {
  totalPages: 1,
  totalElements: 3,
  numberOfElements: 3,
  number: 0,
  size: 20,
  content: [
    {
      id: 705,
      name: '名称1',
      description: '描述1',
      lastExecutionTime: '2018-08-05 14:22',
      nextExecutionTime: '2018-08-10 14:22',
      status: 'enabled',
      taskStatus: 'RUNNING',
      planExecutionTime: '2018-08-10 14:22',
      actualExecutionTime: '2018-08-10 14:22',
    },
    {
      id: 704,
      name: '名称2',
      description: '描述2',
      lastExecutionTime: '2018-08-05 14:22',
      nextExecutionTime: '2018-08-10 14:22',
      status: 'disabled',
      taskStatus: 'FAILED',
      planExecutionTime: '2018-08-10 14:22',
      actualExecutionTime: '2018-08-10 14:22',
    },
    {
      id: 703,
      name: '名称3',
      description: '描述3',
      lastExecutionTime: '2018-08-05 14:22',
      nextExecutionTime: '2018-08-10 14:22',
      status: 'end',
      taskStatus: 'COMPLETED',
      planExecutionTime: '2018-08-10 14:22',
      actualExecutionTime: '2018-08-10 14:22',
    },
  ],
  empty: false,
};

// 时间间隔组件
class TimeInterval extends Component {
  constructor(props) {
    super(props);
    const value = this.props.value || {};
    this.state = {
      number: value.number,
      time: value.time || 'second',
    };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState(value);
    }
  }

  handleNumberChange = (e) => {
    const number = parseInt(e.target.value || 0, 10);
    if (!('value' in this.props)) {
      this.setState({ number });
    }
    this.triggerChange({ number });
  }

  handleTimeChange = (time) => {
    if (!('value' in this.props)) {
      this.setState({ time });
    }
    this.triggerChange({ time });
  }

  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  }

  render() {
    const { size } = this.props;
    const state = this.state;
    return (
      <span>
        <Input
          label={<FormattedMessage id={`${intlPrefix}.repeat.interval`} />}
          size={size}
          value={state.number}
          onChange={this.handleNumberChange}
          style={{ width: '100px', marginRight: '18px' }}
        />
        <Select
          value={state.time}
          size={size}
          style={{ width: '124px' }}
          className="c7n-create-task-select"
          onChange={this.handleTimeChange}
        >
          <Option value="second">秒</Option>
          <Option value="minute">分</Option>
          <Option value="hour">时</Option>
          <Option value="week">周</Option>
          <Option value="month">月</Option>
        </Select>
      </span>
    );
  }
}

@Form.create()
@withRouter
@injectIntl
@inject('AppState')

export default class TaskDetail extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      isShowSidebar: false,
      isSubmitting: false,
      selectType: 'create', // 当前侧边栏为创建or详情
      triggerType: 'easy', // 创建任务默认触发类型
      loading: true,
      logLoading: true,
      showLog: false,
      currentRecord: '',
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
      logPagination: {
        current: dataSource.number + 1,
        pageSize: dataSource.size,
        total: dataSource.totalElements,
      },
      logSort: {
        columnKey: 'id',
        order: 'descend',
      },
      logFilters: {},
      logParams: [],
    };
  }

  componentWillMount() {
    this.loadTaskDetail();
  }

  loadTaskDetail(paginationIn, sortIn, filtersIn, paramsIn) {
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
    TaskDetailStore.loadData(pagination, filters, sort, params).then((data) => {
      TaskDetailStore.setData(data.content);
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
    this.loadTemplate(pagination, filters, sort, params);
  };

  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadTaskDetail();
    });
  };

  /**
   * 渲染任务明细列表状态列
   * @param status
   * @returns {*}
   */
  renderStatus(status) {
    let obj = {};
    let type;
    if (status === 'enabled') {
      obj = {
        key: 'enabled',
        value: '启用',
      };
      type = 'check_circle';
    } else if (status === 'disabled') {
      obj = {
        key: 'disabled',
        value: '停用',
      };
      type = 'remove_circle';
    } else {
      obj = {
        key: 'end',
        value: '结束',
      };
      type = 'state_over';
    }

    return (
      <span className="c7n-task-container-status">
        <Icon type={type} className={`${obj.key}`} />
        <span>{obj.value}</span>
      </span>
    );
  }

  /**
   * 渲染任务明细列表启停用按钮
   * @param record 表格行数据
   * @returns {*}
   */
  showActionButton(record) {
    if (record.status === 'enabled') {
      return (
        <Tooltip
          title={<FormattedMessage id="disable" />}
          placement="bottom"
        >
          <Button
            size="small"
            icon="remove_circle_outline"
            shape="circle"
          />
        </Tooltip>
      );
    } else if (record.status === 'disabled') {
      return (
        <Tooltip
          title={<FormattedMessage id="enable" />}
          placement="bottom"
        >
          <Button
            size="small"
            icon="finished"
            shape="circle"
          />
        </Tooltip>
      );
    } else {
      return (
        <Button
          disabled
          size="small"
          icon="finished"
          shape="circle"
        />
      );
    }
  }

  /**
   * 开启侧边栏
   * @param selectType create/detail
   * @param record 列表行数据
   */
  handleOpen = (selectType, record = {}) => {
    this.props.form.resetFields();
    this.setState({
      isShowSidebar: true,
      selectType,
      showLog: false,
      triggerType: 'easy',
    });
    if (selectType === 'create') {
      setTimeout(() => {
        this.creatTaskFocusInput.input.focus();
      }, 10);
    } else {
      this.setState({
        currentRecord: record,
      });
    }
  }

  // 关闭侧边栏
  handleCancel = () => {
    this.setState({
      isShowSidebar: false,
    });
  }

  /**
   * 侧边栏tab切换
   * @param showLog
   */
  handleTabChange = (showLog) => {
    this.setState({
      showLog: showLog === 'log',
    });
  }


  // 渲染侧边栏成功按钮文字
  renderSidebarOkText() {
    const { selectType } = this.state;
    if (selectType === 'create') {
      return <FormattedMessage id="create" />;
    } else {
      return <FormattedMessage id="close" />;
    }
  }

  // 创建任务切换触发类型
  changeValue(e) {
    this.setState({
      triggerType: e.target.value,
    });
  }

  // 创建任务提交
  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.selectType === 'create') {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          // this.setState({
          //   isSubmitting: true,
          // });
        }
      });
    } else {
      this.setState({
        isShowSidebar: false,
      });
    }
  }

  /**
   * 渲染任务日志列表状态列
   * @param taskStatus
   * @returns {*}
   */
  renderTaskStatus(taskStatus) {
    let obj = {};
    switch (taskStatus) {
      case 'RUNNING':
        obj = {
          key: 'running',
          value: '进行中',
        };
        break;
      case 'FAILED':
        obj = {
          key: 'failed',
          value: '失败',
        };
        break;
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
      <span className={`c7n-task-log-status ${obj.key}`}>
        {obj.value}
      </span>
    );
  }

  // 渲染创建任务
  renderCreateContent() {
    const { intl } = this.props;
    const { selectType, triggerType } = this.state;
    const { getFieldDecorator } = this.props.form;
    const inputWidth = '512px';
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

    return (
      <Content
        className="sidebar-content"
        code={`${intlPrefix}.create`}
        values={{ name: process.env.HEADER_TITLE_NAME || 'Choerodon' }}
      >
        <div>
          <Form
            className="c7n-create-task"
          >
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.task.name.required` }),
                }],
              })(
                <Input ref={(e) => { this.creatTaskFocusInput = e; }} autoComplete="off" style={{ width: inputWidth }} label={<FormattedMessage id={`${intlPrefix}.task.name`} />} />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              style={{ width: '512px' }}
            >
              {getFieldDecorator('description', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.task.description.required` }),
                }],
              })(
                <TextArea autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.task.description`} />} />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('startTime', {
                rules: [{
                  required: true,
                }],
              })(
                <DatePicker
                  label={<FormattedMessage id={`${intlPrefix}.task.start.time`} />}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: inputWidth }}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('endTime', {
                rules: [],
              })(
                <DatePicker
                  label={<FormattedMessage id={`${intlPrefix}.task.end.time`} />}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: inputWidth }}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('triggerType', {
                initialValue: 'easy',
              })(
                <RadioGroup
                  className="c7n-create-task-radio-container"
                  label={intl.formatMessage({ id: `${intlPrefix}.trigger.type` })}
                  onChange={this.changeValue.bind(this)}
                >
                  <Radio value={'easy'}><FormattedMessage id={`${intlPrefix}.easy.task`} /></Radio>
                  <Radio value={'cron'}><FormattedMessage id={`${intlPrefix}.cron.task`} /></Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <div style={{ display: triggerType === 'easy' ? 'block' : 'none' }}>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('repeateInterval', {
                  rules: [{
                    required: true,
                    message: 'dsadsadasdas',
                  }],
                  initialValue: { time: 'second' },
                })(
                  <TimeInterval />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('repeatTime', {
                  rules: [{
                    required: true,
                    message: intl.formatMessage({ id: `${intlPrefix}.repeat.time.required` }),
                  }],
                })(
                  <Input style={{ width: '100px' }} autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.repeat.time`} />} />,
                )}
              </FormItem>
            </div>
            <FormItem
              {...formItemLayout}
              style={{ display: triggerType === 'cron' ? 'block' : 'none' }}
            >
              {getFieldDecorator('cornExpression', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.cron.expression.required` }),
                }],
              })(
                <Input style={{ width: inputWidth }} autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.cron.expression`} />} />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              className="c7n-create-task-inline-formitem"
            >
              {getFieldDecorator('serviceName', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.cron.expression.required` }),
                }],
                initialValue: 'service1',
              })(
                <Select
                  label={<FormattedMessage id={`${intlPrefix}.service.name`} />}
                  style={{ width: '176px' }}
                >
                  <Option value="service1">service1</Option>
                  <Option value="service2">service2</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              className="c7n-create-task-inline-formitem"
            >
              {getFieldDecorator('className', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.cron.expression.required` }),
                }],
                initialValue: 'classname1',
              })(
                <Select
                  label={<FormattedMessage id={`${intlPrefix}.task.class.name`} />}
                  style={{ width: '318px' }}
                >
                  <Option value="classname1">classname1</Option>
                  <Option value="classname2">classname2</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {
                getFieldDecorator('paramsTable', {
                })(
                  <Table
                    pagination={false}
                    filterBar={false}
                    style={{ width: inputWidth }}
                  />,
                )
              }
            </FormItem>
          </Form>
        </div>
      </Content>
    );
  }

  // 渲染任务详情
  renderDetailContent() {
    const { intl: { formatMessage } } = this.props;
    const { selectType, showLog } = this.state;
    const { logSort: { columnKey, order }, logFilters, logParams, logPagination, logLoading } = this.state;
    const {
      currentRecord: {
        name,
        description,
      } } = this.state;
    const infoList = [{
      key: formatMessage({ id: `${intlPrefix}.task.name` }),
      value: name,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.description` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.start.time` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.end.time` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.trigger.type` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.repeat.interval` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.repeat.time` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.last.execution.time` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.next.execution.time` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.service.name` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.class.name` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.params.data` }),
      value: '',
    }];

    const logColumns = [{
      title: <FormattedMessage id="status" />,
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      filters: [{
        value: 'RUNNING',
        text: '进行中',
      }, {
        value: 'FAILED',
        text: '失败',
      }, {
        value: 'COMPLETED',
        text: '完成',
      }],
      filteredValue: logFilters.taskStatus || [],
      render: taskStatus => this.renderTaskStatus(taskStatus),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.instance.id`} />,
      dataIndex: 'id',
      key: 'id',
      filters: [],
      filteredValue: logFilters.id || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.plan.execution.time`} />,
      dataIndex: 'planExecutionTime',
      key: 'planExecutionTime',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.actual.execution.time`} />,
      dataIndex: 'actualExecutionTime',
      key: 'actualExecutionTime',
    }];

    return (
      <Content
        className="sidebar-content"
        code={`${intlPrefix}.detail`}
        values={{ name: '名称测试' }}
      >
        <Tabs activeKey={showLog ? 'log' : 'info'} onChange={this.handleTabChange}>
          <TabPane tab={<FormattedMessage id={`${intlPrefix}.task.info`} />} key="info" />
          <TabPane tab={<FormattedMessage id={`${intlPrefix}.task.log`} />} key="log" />
        </Tabs>
        {!showLog
          ? (<div>
            {
              infoList.map(({ key, value }) =>
                <Row key={key} className="c7n-task-detail-row">
                  <Col span={3}>{key}:</Col>
                  <Col span={21}>{value}</Col>
                </Row>,
              )
            }
            <Table
              style={{ width: '512px' }}
              pagination={false}
              filterBar={false}
            />
          </div>)
          : (<Table
            columns={logColumns}
            filters={logParams}
            pagination={logPagination}
            dataSource={dataSource.content}
            rowKey="id"
            filterBarPlaceholder={formatMessage({ id: 'filtertable' })}
          />)
        }
      </Content>
    );
  }

  render() {
    const { intl } = this.props;
    const { filters, params, pagination, loading, isShowSidebar, selectType, isSubmitting } = this.state;
    const TaskData = TaskDetailStore.getData.slice();
    const columns = [{
      title: <FormattedMessage id="name" />,
      dataIndex: 'name',
      key: 'name',
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="description" />,
      dataIndex: 'description',
      key: 'description',
      filters: [],
      filteredValue: filters.description || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.last.execution.time`} />,
      dataIndex: 'lastExecTime',
      key: 'lastExecTime',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.next.execution.time`} />,
      dataIndex: 'nextExecTime',
      key: 'nextExecTime',
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'status',
      key: 'status',
      filters: [{
        value: 'enabled',
        text: '启用',
      }, {
        value: 'disabled',
        text: '停用',
      }, {
        value: 'end',
        text: '结束',
      }],
      filteredValue: filters.status || [],
      render: status => this.renderStatus(status),
    }, {
      title: '',
      key: 'action',
      align: 'right',
      width: '130px',
      render: (text, record) => (
        <div>
          <Tooltip
            title={<FormattedMessage id="detail" />}
            placement="bottom"
          >
            <Button
              size="small"
              icon="find_in_page"
              shape="circle"
              onClick={this.handleOpen.bind(this, 'detail', record)}
            />
          </Tooltip>
          {this.showActionButton(record)}
          <Tooltip
            title={<FormattedMessage id="delete" />}
            placement="bottom"
          >
            <Button
              size="small"
              icon="delete_forever"
              shape="circle"
            />
          </Tooltip>
        </div>
      ),
    }];
    return (
      <Page>
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            icon="playlist_add"
            onClick={this.handleOpen.bind(this, 'create')}
          >
            <FormattedMessage id={`${intlPrefix}.create.service`} />
          </Button>
          <Button
            icon="refresh"
            onClick={this.handleRefresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={TaskData}
            pagination={pagination}
            filters={params}
            onChange={this.handlePageChange}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.${selectType}.header.title`} />}
            visible={isShowSidebar}
            onOk={this.handleSubmit}
            onCancel={this.handleCancel}
            okText={this.renderSidebarOkText()}
            okCancel={selectType !== 'detail'}
            confirmLoading={isSubmitting}
            className="c7n-task-detail-sidebar"
          >
            {selectType === 'create' ? this.renderCreateContent() : this.renderDetailContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
