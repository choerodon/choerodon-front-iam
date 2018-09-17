import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Button, Select, Table, DatePicker, Radio, Tooltip, Modal, Form, Input, Popover, Icon, Tabs, Col, Row, Spin, InputNumber } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios, Content, Header, Page, Permission, Action } from 'choerodon-front-boot';
import classnames from 'classnames';
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

@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class TaskDetail extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      cronTime: [],
      currentCron: undefined,
      tempTaskId: null,
      startTime: null,
      endTime: null,
      isShowSidebar: false,
      isSubmitting: false,
      selectType: 'create', // 当前侧边栏为创建or详情
      triggerType: 'easy', // 创建任务默认触发类型
      loading: true,
      logLoading: true,
      showLog: false,
      currentRecord: {},
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
        current: 1,
        pageSize: 10,
        total: 0,
      },
      logSort: {
        columnKey: 'id',
        order: 'descend',
      },
      logFilters: {},
      logParams: [],
      paramsData: [], // 参数列表的数据
      paramsLoading: false, // 创建任务参数列表Loading
      cronLoading: 'empty', // cron popover的状态
    };
  }

  componentWillMount() {
    this.loadTaskDetail();
  }

  loadTaskDetail(paginationIn, filtersIn, sortIn, paramsIn) {
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
    this.loadTaskDetail(pagination, filters, sort, params);
  };

  /**
   * 任务信息
   * @param id 任务ID
   */
  loadInfo = (id) => {
    TaskDetailStore.loadInfo(id).then((data) => {
      if (data.faield) {
        Choerodon.prompt(data.message);
      } else {
        TaskDetailStore.setInfo(data);
        this.setState({
          isShowSidebar: true,
        });
      }
    });
  }

  // 任务日志列表
  loadLog(paginationIn, filtersIn, sortIn, paramsIn) {
    const {
      logPagination: paginationState,
      logSort: sortState,
      logFilters: filtersState,
      logParams: paramsState,
    } = this.state;
    const logPagination = paginationIn || paginationState;
    const logSort = sortIn || sortState;
    const logFilters = filtersIn || filtersState;
    const logParams = paramsIn || paramsState;
    // 防止标签闪烁
    this.setState({ logFilters, logLoading: true });
    TaskDetailStore.loadLogData(logPagination, logFilters, logSort, logParams, TaskDetailStore.currentTask.id).then((data) => {
      TaskDetailStore.setLog(data.content);
      this.setState({
        logPagination: {
          current: data.number + 1,
          pageSize: data.size,
          total: data.totalElements,
        },
        logLoading: false,
        logSort,
        logFilters,
        logParams,
        tempTaskId: TaskDetailStore.currentTask.id,
      });
    }).catch((error) => {
      Choerodon.handleResponseError(error);
      this.setState({
        logLoading: false,
      });
    });
  }

  handleLogPageChange = (pagination, filters, sort, params) => {
    this.loadLog(pagination, filters, sort, params);
  }


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
      TaskDetailStore.setCurrentService({});
      TaskDetailStore.setClassNames([]);
      TaskDetailStore.setCurrentClassNames({});
      this.setState({
        paramsData: [],
      })
      if (!TaskDetailStore.service.length) {
        this.loadService();
      } else {
        this.setState({
          isShowSidebar: true,
        }, () => {
          setTimeout(() => {
            this.creatTaskFocusInput.input.focus();
          }, 10);
        });
      }
    } else {
      this.setState({
        logPagination: {
          current: 1,
          pageSize: 10,
          total: 0,
        },
        logSort: {
          columnKey: 'id',
          order: 'descend',
        },
        logFilters: {},
        logParams: [],
      });
      this.loadInfo(record.id);
      TaskDetailStore.setCurrentTask(record);
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

  /**
   * 类名变换时
   * @param id
   */
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
        this.setState({
          isShowSidebar: true,
        }, () => {
          setTimeout(() => {
            this.creatTaskFocusInput.input.focus();
          }, 10);
        });
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
        if (data.length) {
          const classNames = [];
          data.map(({ method, code, id }) => classNames.push({ method, code, id }));
          TaskDetailStore.setClassNames(classNames);
          TaskDetailStore.setCurrentClassNames(classNames[0]);
          this.loadParamsTable();
        } else {
          TaskDetailStore.setClassNames([]);
        }
      }
    });
  }

  // 获取参数列表
  loadParamsTable = () => {
    this.setState({
      paramsLoading: true,
    });
    const { currentClassNames } = TaskDetailStore;
    if (currentClassNames.id) {
      TaskDetailStore.loadParams(currentClassNames.id).then((data) => {
        if (data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setState({
            paramsData: data.paramsList,
          });
        }
        this.setState({
          paramsLoading: false,
        });
      });
    } else {
      this.setState({
        paramsData: [],
        paramsLoading: false,
      });
    }
  }


  /**
   * 侧边栏tab切换
   * @param showLog
   */
  handleTabChange = (showLog) => {
    if (showLog === 'log') {
      if (!this.state.tempTaskId) {
        this.loadLog();
      }
    }
    this.setState({
      showLog: showLog === 'log',
    });
  }


  /**
   * 任务名称唯一性校验
   * @param rule 表单校验规则
   * @param value 任务名称
   * @param callback 回调函数
   */
  checkName = (rule, value, callback) => {
    const { intl } = this.props;
    TaskDetailStore.checkName(value).then(({ failed }) => {
      if (failed) {
        callback(intl.formatMessage({ id: `${intlPrefix}.task.name.exist` }));
      } else {
        callback();
      }
    });
  };

  checkcurrentCron = (rule, value, callback) => {
    TaskDetailStore.checkCron(value).then((data) => {
      if (data.failed) {
        callback('cron表达式错误，请重新输入');
      } else {
        callback();
      }
    });
  }

  checkCron = () => {
    const { getFieldValue, setFields } = this.props.form;
    const cron = getFieldValue('cronExpression');
    if (this.state.currentCron === cron) {
      return;
    } else {
      this.setState({
        currentCron: cron,
      })
      if (!cron) {
        this.setState({
          cronLoading: 'empty',
        });
      } else {
        this.setState({
          cronLoading: true,
        });

        TaskDetailStore.checkCron(cron).then((data) => {
          if (data.failed) {
            this.setState({
              cronLoading: false,
            });
            // setFields({
            //   cronExpression: {
            //     value: cron,
            //     errors: [new Error('cron表达式错误，请重新输入')],
            //   },
            // });
          } else {
            this.setState({
              cronLoading: 'right',
              cronTime: data,
            });
          }
        });
      }
    }
  }


  checkIsNumber = (rule, value, callback) => {
    const { intl } = this.props;
    const pattern = /^[0-9]*$/;
    if (pattern.test(value)) {
      callback();
    } else {
      callback('请输入数字');
    }
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
      triggerType: e.target.value === 'simple-trigger' ? 'easy' : 'cron',
    });
  }

  // 创建任务提交
  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.selectType === 'create') {
      const { intl } = this.props;
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (values.methodId === 'empty') {
          Choerodon.prompt(intl.formatMessage({ id: `${intlPrefix}.noprogram` }));
          return;
        }

        if (!err) {
          this.setState({
            isSubmitting: true,
          });
          const flag = values.triggerType === 'simple-trigger';
          delete values.serviceName;
          const { startTime, endTime, cronExpression, simpleRepeatInterval,
            simpleRepeatIntervalUnit, simpleRepeatCount } = values;
          const body = {
            ...values,
            startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
            endTime: endTime ? endTime.format('YYYY-MM-DD HH:mm:ss') : null,
            cronExpression: flag ? null : cronExpression,
            simpleRepeatInterval: flag ? Number(simpleRepeatInterval) : null,
            simpleRepeatIntervalUnit: flag ? simpleRepeatIntervalUnit : null,
            simpleRepeatCount: flag ? Number(simpleRepeatCount) : null,
          };
          TaskDetailStore.createTask(body).then(({ failed, message }) => {
            if (failed) {
              Choerodon.prompt(message);
              this.setState({
                isSubmitting: false,
              });
            } else {
              Choerodon.prompt(intl.formatMessage({ id: 'create.success' }));
              this.setState({
                isSubmitting: false,
              }, () => {
                this.handleRefresh();
              });
            }
          }).catch(() => {
            Choerodon.prompt(intl.formatMessage({ id: 'create.error' }));
            this.setState({
              isSubmitting: false,
            });
          });
        }
      });
    } else {
      this.setState({
        isShowSidebar: false,
        tempTaskId: null,
      }, () => {
        TaskDetailStore.setLog([]);
      });
    }
  }

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

  getCronContent = () => {
    const { cronLoading, cronTime } = this.state;
    let content;
    if (cronLoading === 'empty') {
      content = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          请填写cron表达式
        </div>
      );
    } else if (cronLoading === true) {
      content = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>);
    } else if (cronLoading === 'right') {
      content = (
        <div className="c7n-task-deatil-cron-container">
          <span>示例</span>
          {
            cronTime.map((value, key) => (
              <li><span>第{key + 1}次执行时间:</span><span>{value}</span></li>
            ))
          }
        </div>
      );
    } else {
      content = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          cron表达式错误，请重新输入
        </div>
      );
    }
    return content;
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
      render: (text, record) => {
        let editableNode;
        if (record.type === 'Boolean') {
          editableNode = (
            <FormItem style={{ marginBottom: 0 }}>
              {
              getFieldDecorator(`params.${record.name}`, {
                rules: [],
                initialValue: text,
              })(
                <Select>
                  <Option value={true}>true</Option>
                  <Option value={false}>false</Option>
                  <Option value={null} style={{ display: text === null ? 'none' : 'block' }}> </Option>
                </Select>,
              )
            }
            </FormItem>);
        } else if (record.type === 'Integer' || record.type === 'Long' || record.type === 'Double' || record.type === 'Float') {
          editableNode = (
            <FormItem style={{ marginBottom: 0 }}>
              {
                getFieldDecorator(`params.${record.name}`, {
                  rules: [{
                    required: text === null,
                    message: '请输入数字',
                  }, {
                    validator: this.checkIsNumber,
                  }],
                  validateFirst: true,
                  initialValue: text === null ? undefined : text,
                })(
                  <InputNumber
                    autoComplete="off"
                  />,
                )
              }
            </FormItem>);
        } else {
          editableNode = (
            <FormItem style={{ marginBottom: 0 }}>
              {
                getFieldDecorator(`params.${record.name}`, {
                  rules: [{
                    required: text === null,
                    whitespace: true,
                    message: '无默认值时必填',
                  }],
                  initialValue: text === null ? '' : text,
                })(
                  <Input
                    autoComplete="off"
                  />,
                )
              }
            </FormItem>);
        }
        return editableNode;
      },
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.type`} />,
      dataIndex: 'type',
      key: 'type',
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
                }, {
                  validator: this.checkName,
                }],
                // validateTrigger: 'onBlur',
                validateFirst: true,
              })(
                <Input
                  ref={(e) => { this.creatTaskFocusInput = e; }}
                  maxLength={15}
                  autoComplete="off"
                  style={{ width: inputWidth }}
                  label={<FormattedMessage id={`${intlPrefix}.task.name`} />}
                />,
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
              className="c7n-create-task-inline-formitem"
            >
              {getFieldDecorator('startTime', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.task.start.time.required` }),
                }],
              })(
                <DatePicker
                  label={<FormattedMessage id={`${intlPrefix}.task.start.time`} />}
                  style={{ width: '248px' }}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={this.disabledStartDate}
                  onChange={this.onStartChange}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              className="c7n-create-task-inline-formitem"
            >
              {getFieldDecorator('endTime', {
                rules: [],
              })(
                <DatePicker
                  label={<FormattedMessage id={`${intlPrefix}.task.end.time`} />}
                  style={{ width: '248px' }}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={this.disabledEndDate}
                  onChange={this.onEndChange}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('triggerType', {
                initialValue: 'simple-trigger',
              })(
                <RadioGroup
                  className="c7n-create-task-radio-container"
                  label={intl.formatMessage({ id: `${intlPrefix}.trigger.type` })}
                  onChange={this.changeValue.bind(this)}
                >
                  <Radio value={'simple-trigger'}><FormattedMessage id={`${intlPrefix}.easy.task`} /></Radio>
                  <Radio value={'cron-trigger'}><FormattedMessage id={`${intlPrefix}.cron.task`} /></Radio>
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
                  initialValue: 'SECONDS',
                })(
                  <Select
                    style={{ width: '176px' }}
                    getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
                  >
                    <Option value="SECONDS">秒</Option>
                    <Option value="MINUTES">分</Option>
                    <Option value="HOURS">时</Option>
                    <Option value="DAYS">天</Option>
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
            <div>
              <FormItem
                {...formItemLayout}
                style={{ position: 'relative', display: triggerType === 'cron' ? 'inline-block' : 'none' }}
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
              <Popover content={this.getCronContent()} trigger="click" placement="bottom" overlayClassName="c7n-task-detail-popover">
                <Icon
                  onClick={this.checkCron}
                  style={{ position: 'absolute', left: '491px', marginTop: '16px', cursor: 'pointer', display: triggerType === 'cron' ? 'inline-block' : 'none'  }}
                  type="find_in_page"
                />
              </Popover>
            </div>
            <FormItem
              {...formItemLayout}
              className="c7n-create-task-inline-formitem"
            >
              {getFieldDecorator('serviceName', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.service.required` }),
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
              {getFieldDecorator('methodId', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: `${intlPrefix}.task.class.required` }),
                }],
                initialValue: TaskDetailStore.classNames.length ? TaskDetailStore.currentClassNames.id : 'empty',
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
                    )) : <Option key="empty" value="empty">无任务程序</Option>
                  }
                </Select>,
              )}
            </FormItem>
            <Table
              loading={this.state.paramsLoading}
              pagination={false}
              filterBar={false}
              columns={columns}
              rowKey="name"
              dataSource={this.state.paramsData}
              style={{ width: inputWidth }}
            />
          </Form>
        </div>
      </Content>
    );
  }

  // 渲染任务详情
  renderDetailContent() {
    const { intl: { formatMessage } } = this.props;
    const { selectType, showLog } = this.state;
    const { logFilters, logParams, logPagination, logLoading } = this.state;
    const info = TaskDetailStore.info;
    let unit;
    switch (info.simpleRepeatIntervalUnit) {
      case 'SECONDS':
        unit = '秒';
        break;
      case 'MINUTES':
        unit = '分钟';
        break;
      case 'HOURS':
        unit = '小时';
        break;
      case 'DAYS':
        unit = '天';
        break;
      default:
        break;
    }
    const infoList = [{
      key: formatMessage({ id: `${intlPrefix}.task.name` }),
      value: info.name,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.description` }),
      value: info.description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.start.time` }),
      value: info.startTime,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.end.time` }),
      value: info.endTime,
    }, {
      key: formatMessage({ id: `${intlPrefix}.trigger.type` }),
      value: info.triggerType === 'simple-trigger' ? '简单任务' : 'Cron任务',
    }, {
      key: formatMessage({ id: `${intlPrefix}.repeat.interval` }),
      value: `${info.simpleRepeatInterval}${unit}`,
    }, {
      key: formatMessage({ id: `${intlPrefix}.repeat.time` }),
      value: info.simpleRepeatCount,
    }, {
      key: formatMessage({ id: `${intlPrefix}.last.execution.time` }),
      value: info.lastExecTime,
    }, {
      key: formatMessage({ id: `${intlPrefix}.next.execution.time` }),
      value: info.nextExecTime,
    }, {
      key: formatMessage({ id: `${intlPrefix}.service.name` }),
      value: info.serviceName,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.class.name` }),
      value: info.methodCode,
    }, {
      key: formatMessage({ id: `${intlPrefix}.params.data` }),
      value: '',
    }];

    const paramColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.params.name`} />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.params.value`} />,
      dataIndex: 'value',
      key: 'value',
      render: text => `${text}`,
    }];

    const logColumns = [{
      title: <FormattedMessage id="status" />,
      dataIndex: 'status',
      key: 'status',
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
      filteredValue: logFilters.status || [],
      render: status => this.renderTaskStatus(status),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.instance.id`} />,
      dataIndex: 'serviceInstanceId',
      key: 'serviceInstanceId',
      filters: [],
      filteredValue: logFilters.serviceInstanceId || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.plan.execution.time`} />,
      dataIndex: 'plannedStartTime',
      key: 'plannedStartTime',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.actual.execution.time`} />,
      dataIndex: 'actualStartTime',
      key: 'actualStartTime',
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
                <Row key={key} className={classnames('c7n-task-detail-row', { 'c7n-task-detail-row-hide': value === null })}>
                  <Col span={3}>{key}:</Col>
                  <Col span={21}>{value}</Col>
                </Row>,
              )
            }
            <Table
              columns={paramColumns}
              style={{ width: '512px' }}
              pagination={false}
              filterBar={false}
              dataSource={info.params}
              rowKey="name"
            />
          </div>)
          : (<Table
            loading={logLoading}
            columns={logColumns}
            filters={logParams}
            pagination={logPagination}
            dataSource={TaskDetailStore.getLog.slice()}
            onChange={this.handleLogPageChange}
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
      <Page
        service={[
          'asgard-service.schedule-task.pagingQuery',
          'asgard-service.schedule-task.create',
          'asgard-service.schedule-task.check',
          'asgard-service.schedule-task.cron',
          'asgard-service.schedule-task.getTaskDetail',
          'asgard-service.schedule-task.delete',
          'asgard-service.schedule-task.disable',
          'asgard-service.schedule-task.enable',
          'asgard-service.schedule-task-instance.pagingQueryByTaskId',
          'asgard-service.schedule-method.getMethodByService',
          'asgard-service.schedule-method.pagingQuery',
          'manager-service.service.pageAll',
        ]}
      >
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
