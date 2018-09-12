import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
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


@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class TaskDetail extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      startTime: null,
      endTime: null,
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
      paramsData: [], // 参数列表的数据
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
    if (status === 'ENABLE') {
      obj = {
        key: 'enabled',
        value: '启用',
      };
      type = 'check_circle';
    } else if (status === 'DISABLE') {
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
    if (record.status === 'ENABLE') {
      return (
        <Tooltip
          title={<FormattedMessage id="disable" />}
          placement="bottom"
        >
          <Button
            size="small"
            icon="remove_circle_outline"
            shape="circle"
            onClick={this.handleAble.bind(this, record)}
          />
        </Tooltip>
      );
    } else if (record.status === 'DISABLE') {
      return (
        <Tooltip
          title={<FormattedMessage id="enable" />}
          placement="bottom"
        >
          <Button
            size="small"
            icon="finished"
            shape="circle"
            onClick={this.handleAble.bind(this, record)}
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
   * 启停用任务
   * @param record 表格行数据
   */
  handleAble = (record) => {
    const { id, objectVersionNumber } = record;
    const { intl } = this.props;
    const status = record.status === 'ENABLE' ? 'disable' : 'enable';
    TaskDetailStore.ableTask(id, objectVersionNumber, status).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        Choerodon.prompt(intl.formatMessage({ id: `${status}.success` }));
        this.loadTaskDetail();
      }
    }).catch(() => {
      Choerodon.prompt(intl.formatMessage({ id: `${status}.error` }));
    });
  }

  /**
   * 删除任务
   * @param record 表格行数据
   */
  handleDelete = (record) => {
    const { intl } = this.props;
    Modal.confirm({
      title: intl.formatMessage({ id: `${intlPrefix}.delete.title` }),
      content: intl.formatMessage({ id: `${intlPrefix}.delete.content` }, { name: record.name }),
      onOk: () => TaskDetailStore.deleteTask(record.id).then(({ failed, message }) => {
        if (failed) {
          Choerodon.prompt(message);
        } else {
          Choerodon.prompt(intl.formatMessage({ id: 'delete.success' }));
          this.loadTaskDetail();
        }
      }).catch(() => {
        Choerodon.prompt(intl.formatMessage({ id: 'delete.error' }));
      }),
    });
  }

  /**
   * 开启侧边栏
   * @param selectType create/detail
   * @param record 列表行数据
   */
  handleOpen = (selectType, record = {}) => {
    this.props.form.resetFields();
    this.setState({
      selectType,
      showLog: false,
      triggerType: 'easy',
    });
    if (selectType === 'create') {
      if (!TaskDetailStore.service.length) {
        this.loadService();
      } else {
        TaskDetailStore.setCurrentService(TaskDetailStore.service[0]);
        this.loadClass();
      }
    } else {
      this.setState({
        currentRecord: record,
        isShowSidebar: true,
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
   * 服务名变换时
   * @param service 服务名
   */
  handleChangeService(service) {
    const currentService = TaskDetailStore.service.find(item => item.name === service);
    TaskDetailStore.setCurrentService(currentService);
    this.loadClass();
  }

  handleChangeClass(id) {
    const currentClass = TaskDetailStore.service.find(item => item.id === id);
    TaskDetailStore.setCurrentClassNames(currentClass);
    this.loadParamsTable();
  }

  // 获取所有服务名
  loadService = () => {
    TaskDetailStore.loadService().then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        TaskDetailStore.setService(data);
        const defaultService = data[0];
        TaskDetailStore.setCurrentService(defaultService);
        this.loadClass();
      }
    }).catch((error) => {
      Choerodon.handleResponseError(error);
    });
  }

  // 获取对应服务名的类名
  loadClass = () => {
    const { currentService } = TaskDetailStore;
    TaskDetailStore.loadClass('asgard-saga-demo').then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        const classNames = [];
        TaskDetailStore.setClassWithParams(data);
        data.map(({ method, code, id }) => classNames.push({ method, code, id }));
        TaskDetailStore.setClassNames(classNames);
        TaskDetailStore.setCurrentClassNames(classNames[0]);
        this.loadParamsTable();
        this.setState({
          isShowSidebar: true,
        }, () => {
          setTimeout(() => {
            this.creatTaskFocusInput.input.focus();
          }, 10);
        });
      }
    });
  }

  loadParamsTable = () => {
    const { currentClassNames } = TaskDetailStore;
    TaskDetailStore.loadParams(currentClassNames.id).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setState({
          paramsData: data.paramsList,
        });
      }
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
    const { resetFields } = this.props.form;
    resetFields(['simpleRepeatInterval', 'simpleRepeatCount', 'simpleRepeatIntervalUnit', 'cronExpression']);
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
          const flag = values.triggerType === 'easy';
          const body = {
            ...values,
            startTime: values.startTime.format('YYYY-MM-DD HH:mm:ss'),
            endTime: values.endTime.format('YYYY-MM-DD HH:mm:ss'),
            cronExpression: flag ? null : values.cronExpression,
            simpleRepeatInterval: flag ? values.simpleRepeatInterval : null,
            simpleRepeatIntervalUnit: flag ? values.simpleRepeatIntervalUnit : null,
            simpleRepeatCount: flag ? values.simpleRepeatCount : null,
          };
          window.console.log(body);
        }
      });
    } else {
      this.setState({
        isShowSidebar: false,
      });
    }
  }

  // disabledDate = (current) => {
  //   return current && current < moment().endOf('day');
  // }

  disabledStartDate = (startTime) => {
    const endTime = this.state.endTime;
    if (!startTime || !endTime) {
      return false;
    }
    return startTime.valueOf() >= endTime.valueOf();
  }

  disabledEndDate = (endTime) => {
    const startTime = this.state.startTime;
    if (!endTime || !startTime) {
      return false;
    }
    return endTime.valueOf() <= startTime.valueOf();
  }

  onStartChange = (value) => {
    this.onChange('startTime', value);
  }

  onEndChange = (value) => {
    this.onChange('endTime', value);
  }

  onChange = (field, value) => {
    const { setFieldsValue } = this.props.form;
    this.setState({
      [field]: value,
    }, () => {
      setFieldsValue({ [field]: this.state[field] });
    });
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
    const { startTime, endTime, paramsData, selectType, triggerType } = this.state;
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const inputWidth = '512px';
    const service = TaskDetailStore.service;
    const classNames = TaskDetailStore.classNames;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.params.name`} />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.value`} />,
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: text => <span>{`${text}`}</span>,
    }];

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
              style={{ width: inputWidth }}
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
                  message: intl.formatMessage({ id: `${intlPrefix}.task.start.time.required` }),
                }],
              })(
                <DatePicker
                  label={<FormattedMessage id={`${intlPrefix}.task.start.time`} />}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: inputWidth }}
                  disabledDate={this.disabledStartDate}
                  onChange={this.onStartChange}
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
                  disabledDate={this.disabledEndDate}
                  onChange={this.onEndChange}
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
                className="c7n-create-task-inline-formitem"
              >
                {getFieldDecorator('simpleRepeatInterval', {
                  rules: [{
                    required: triggerType === 'easy',
                    message: intl.formatMessage({ id: `${intlPrefix}.repeat.required` }),
                  }, {
                    pattern: /^[1-9]\d*$/,
                    message: intl.formatMessage({ id: `${intlPrefix}.repeat.pattern` }),
                  }],
                  validateFirst: true,
                })(
                  <Input style={{ width: '318px' }} autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.repeat.interval`} />} />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                className="c7n-create-task-inline-formitem c7n-create-task-inline-formitem-select"
              >
                {getFieldDecorator('simpleRepeatIntervalUnit', {
                  rules: [],
                  initialValue: 'second',
                })(
                  <Select
                    style={{ width: '176px' }}
                  >
                    <Option value="second">秒</Option>
                    <Option value="minute">分</Option>
                    <Option value="hour">时</Option>
                    <Option value="day">天</Option>
                    <Option value="month">月</Option>
                  </Select>,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('simpleRepeatCount', {
                  rules: [{
                    required: triggerType === 'easy',
                    message: intl.formatMessage({ id: `${intlPrefix}.repeat.time.required` }),
                  }, {
                    pattern: /^[1-9]\d*$/,
                    message: intl.formatMessage({ id: `${intlPrefix}.repeat.pattern` }),
                  }],
                })(
                  <Input style={{ width: inputWidth }} autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.repeat.time`} />} />,
                )}
              </FormItem>
            </div>
            <FormItem
              {...formItemLayout}
              style={{ display: triggerType === 'cron' ? 'block' : 'none' }}
            >
              {getFieldDecorator('cronExpression', {
                rules: [{
                  required: triggerType === 'cron',
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
                initialValue: TaskDetailStore.getCurrentService.name,
              })(
                <Select
                  style={{ width: '176px' }}
                  getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
                  label={<FormattedMessage id={`${intlPrefix}.service.name`} />}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  filter
                  onChange={this.handleChangeService.bind(this)}
                >
                  {
                    service && service.length ? service.map(({ name }) => (
                      <Option key={name}>{name}</Option>
                    )) : <Option key="empty">无服务</Option>
                  }
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
                initialValue: TaskDetailStore.currentClassNames.method,
              })(
                <Select
                  label={<FormattedMessage id={`${intlPrefix}.task.class.name`} />}
                  style={{ width: '318px' }}
                  getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
                  filterOption={(input, option) => {
                    const childNode = option.props.children;
                    if (childNode && React.isValidElement(childNode)) {
                      return childNode.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }
                    return false;
                  }}
                  filter
                  onChange={this.handleChangeClass.bind(this)}
                >
                  {
                    classNames && classNames.length ? classNames.map(({ method, code, id }) => (
                      <Option key={`${method}-${code}`} value={id}>
                        <Tooltip title={method} placement="right" align={{ offset: [20, 0] }}>
                          <span style={{ display: 'inline-block', width: '100%' }}>{code}</span>
                        </Tooltip>
                      </Option>
                    )) : <Option key="empty">无任务程序</Option>
                  }
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
                    columns={columns}
                    rowKey="name"
                    dataSource={paramsData}
                    rowClassName={() => 'editable-row'}
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
        value: 'ENABLE',
        text: '启用',
      }, {
        value: 'DISABLE',
        text: '停用',
      }, {
        value: 'FINISHED',
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
              onClick={this.handleDelete.bind(this, record)}
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
