import React, { Component } from 'react';
import { observable, action, configure } from 'mobx';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Button, Select, Table, DatePicker, Radio, Tooltip, Modal, Form, Input, Popover, Icon, Tabs, Col, Row, Spin, InputNumber } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';
import TaskDetailStore from '../../../stores/global/task-detail';
import StatusTag from '../../../components/statusTag';
import './TaskDetail.scss';
import '../../../common/ConfirmModal.scss';
import MouseOverWrapper from '../../../components/mouseOverWrapper';

const intlPrefix = 'taskdetail';
const { Sidebar } = Modal;
const { TextArea } = Input;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { TabPane } = Tabs;

configure({ enforceActions: false });

// 公用方法类
class TaskDetailType {
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
    this.code = `${codePrefix}.taskdetail`;
    this.values = { name: name || AppState.getSiteInfo.systemName || 'Choerodon' };
    this.type = type;
    this.id = id; // 项目或组织id
    this.name = name; // 项目或组织名称
  }
}

@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class TaskDetail extends Component {
  @observable startTimes = null;

  @observable endTimes = null;

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
    this.initTaskDetail();
    this.loadTaskDetail();
  }

  componentWillUnmount() {
    TaskDetailStore.setData([]);
  }

  initTaskDetail() {
    this.taskdetail = new TaskDetailType(this);
  }

  loadTaskDetail(paginationIn, filtersIn, sortIn, paramsIn) {
    const { type, id } = this.taskdetail;
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
    TaskDetailStore.loadData(pagination, filters, sort, params, type, id).then((data) => {
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
  loadInfo = (taskId) => {
    const { type, id } = this.taskdetail;
    TaskDetailStore.loadInfo(taskId, type, id).then((data) => {
      if (data.failed) {
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
    const { type, id } = this.taskdetail;
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
    TaskDetailStore.loadLogData(logPagination, logFilters, logSort, logParams, TaskDetailStore.currentTask.id, type, id).then((data) => {
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
   * 渲染任务明细列表启停用按钮
   * @param record 表格行数据
   * @returns {*}
   */
  showActionButton(record) {
    const { enableService, disableService } = this.getPermission();
    if (record.status === 'ENABLE') {
      return (
        <Permission service={disableService}>
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
        </Permission>
      );
    } else if (record.status === 'DISABLE') {
      return (
        <Permission service={disableService}>
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
        </Permission>
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
    TaskDetailStore.ableTask(id, objectVersionNumber, status, this.taskdetail.type, this.taskdetail.id).then((data) => {
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
    const { type, id } = this.taskdetail;
    Modal.confirm({
      className: 'c7n-iam-confirm-modal',
      title: intl.formatMessage({ id: `${intlPrefix}.delete.title` }),
      content: intl.formatMessage({ id: `${intlPrefix}.delete.content` }, { name: record.name }),
      onOk: () => TaskDetailStore.deleteTask(record.id, type, id).then(({ failed, message }) => {
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
  @action
  handleOpen = (selectType, record = {}) => {
    this.props.form.resetFields();
    this.startTimes = null;
    this.endTimes = null;
    this.setState({
      selectType,
      showLog: false,
      triggerType: 'easy',
      startTime: null,
      endTime: null,
    });
    if (selectType === 'create') {
      TaskDetailStore.setCurrentService({});
      TaskDetailStore.setClassNames([]);
      TaskDetailStore.setCurrentClassNames({});
      this.setState({
        paramsData: [],
      });
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
    TaskDetailStore.loadClass(currentService.name, this.taskdetail.type, this.taskdetail.id).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else if (data.length) {
        const classNames = [];
        data.map(({ method, code, id }) => classNames.push({ method, code, id }));
        TaskDetailStore.setClassNames(classNames);
        TaskDetailStore.setCurrentClassNames(classNames[0]);
        this.loadParamsTable();
      } else {
        TaskDetailStore.setClassNames([]);
        this.setState({
          paramsData: [],
        });
      }
    });
  }

  // 获取参数列表
  loadParamsTable = () => {
    this.setState({
      paramsLoading: true,
    });
    const { currentClassNames } = TaskDetailStore;
    const { type, id } = this.taskdetail;
    if (currentClassNames.id) {
      TaskDetailStore.loadParams(currentClassNames.id, type, id).then((data) => {
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
    const { type, id } = this.taskdetail;
    TaskDetailStore.checkName(value, type, id).then(({ failed }) => {
      if (failed) {
        callback(intl.formatMessage({ id: `${intlPrefix}.task.name.exist` }));
      } else {
        callback();
      }
    });
  };

  checkCron = () => {
    const { getFieldValue } = this.props.form;
    const { type, id } = this.taskdetail;
    const cron = getFieldValue('cronExpression');
    if (this.state.currentCron === cron) return;
    this.setState({
      currentCron: cron,
    });
    if (!cron) {
      this.setState({
        cronLoading: 'empty',
      });
    } else {
      this.setState({
        cronLoading: true,
      });

      TaskDetailStore.checkCron(cron, type, id).then((data) => {
        if (data.failed) {
          this.setState({
            cronLoading: false,
          });
        } else {
          this.setState({
            cronLoading: 'right',
            cronTime: data,
          });
        }
      });
    }
  }


  checkIsNumber = (rule, value, callback) => {
    const { intl } = this.props;
    const pattern = /^[0-9]*$/;
    if (pattern.test(value)) {
      callback();
    } else {
      callback(intl.formatMessage({ id: `${intlPrefix}.num.required` }));
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
      const { type, id } = this.taskdetail;
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
          TaskDetailStore.createTask(body, type, id).then(({ failed, message }) => {
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

  // 时间选择器处理
  disabledStartDate = (startTime) => {
    const endTime = this.state.endTime;
    if (!startTime || !endTime) {
      return false;
    }
    if (endTime.format().split('T')[1] === '00:00:00+08:00') {
      return startTime.format().split('T')[0] >= endTime.format().split('T')[0];
    } else {
      return startTime.format().split('T')[0] > endTime.format().split('T')[0];
    }
  }

  disabledEndDate = (endTime) => {
    const startTime = this.state.startTime;
    if (!endTime || !startTime) {
      return false;
    }
    return endTime.valueOf() <= startTime.valueOf();
  }

  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i += 1) {
      result.push(i);
    }
    return result;
  }

  @action
  disabledDateStartTime = (date) => {
    this.startTimes = date;
    if (date && this.endTimes && this.endTimes.day() === date.day()) {
      if (this.endTimes.hour() === date.hour() && this.endTimes.minute() === date.minute()) {
        return {
          disabledHours: () => this.range(this.endTimes.hour() + 1, 24),
          disabledMinutes: () => this.range(this.endTimes.minute() + 1, 60),
          disabledSeconds: () => this.range(this.endTimes.second(), 60),
        };
      } else if (this.endTimes.hour() === date.hour()) {
        return {
          disabledHours: () => this.range(this.endTimes.hour() + 1, 24),
          disabledMinutes: () => this.range(this.endTimes.minute() + 1, 60),
        };
      } else {
        return {
          disabledHours: () => this.range(this.endTimes.hour() + 1, 24),
        };
      }
    }
  }

  @action
  clearStartTimes = (status) => {
    if (!status) {
      this.endTimes = null;
    }
  }

  @action
  clearEndTimes = (status) => {
    if (!status) {
      this.startTimes = null;
    }
  }

  @action
  disabledDateEndTime = (date) => {
    this.endTimes = date;
    if (date && this.startTimes && this.startTimes.day() === date.day()) {
      if (this.startTimes.hour() === date.hour() && this.startTimes.minute() === date.minute()) {
        return {
          disabledHours: () => this.range(0, this.startTimes.hour()),
          disabledMinutes: () => this.range(0, this.startTimes.minute()),
          disabledSeconds: () => this.range(0, this.startTimes.second() + 1),
        };
      } else if (this.startTimes.hour() === date.hour()) {
        return {
          disabledHours: () => this.range(0, this.startTimes.hour()),
          disabledMinutes: () => this.range(0, this.startTimes.minute()),
        };
      } else {
        return {
          disabledHours: () => this.range(0, this.startTimes.hour()),
        };
      }
    }
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

  getCronContent = () => {
    const { cronLoading, cronTime } = this.state;
    const { intl } = this.props;
    let content;
    if (cronLoading === 'empty') {
      content = (
        <div className="c7n-task-deatil-cron-container-empty">
          <FormattedMessage id={`${intlPrefix}.cron.tip`} />
          <a href={intl.formatMessage({ id: `${intlPrefix}.cron.tip.link` })} target="_blank">
            <span>{intl.formatMessage({ id: 'learnmore' })}</span>
            <Icon type="open_in_new" style={{ fontSize: '13px' }} />
          </a>
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
          <FormattedMessage id={`${intlPrefix}.cron.example`} />
          {
            cronTime.map((value, key) => (
              <li><FormattedMessage id={`${intlPrefix}.cron.runtime`} values={{ time: key + 1 }} /><span>{value}</span></li>
            ))
          }
        </div>
      );
    } else {
      content = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FormattedMessage id={`${intlPrefix}.cron.wrong`} />
        </div>
      );
    }
    return content;
  }

  // 渲染创建任务
  renderCreateContent() {
    const { triggerType } = this.state;
    const { intl, AppState } = this.props;
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
                  <Option value>true</Option>
                  <Option value={false}>false</Option>
                  <Option value={null} style={{ display: text === null ? 'none' : 'block' }} />
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
                    message: intl.formatMessage({ id: `${intlPrefix}.num.required` }),
                  }, {
                    validator: this.checkIsNumber,
                  }],
                  validateFirst: true,
                  initialValue: text === null ? undefined : text,
                })(
                  <div className="c7n-taskdetail-text">
                    <InputNumber
                      onFocus={this.inputOnFocus}
                      autoComplete="off"
                    />
                    <Icon type="mode_edit" className="c7n-taskdetail-text-icon" />
                  </div>,
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
                    message: intl.formatMessage({ id: `${intlPrefix}.default.required` }),
                  }],
                  initialValue: text,
                })(
                  <Input
                    onFocus={this.inputOnFocus}
                    autoComplete="off"
                  />,
                )
              }
            </FormItem>);
        }

        if (record.type !== 'Boolean') {
          editableNode = (
            <div className="c7n-taskdetail-text">
              {editableNode}
              <Icon type="mode_edit" className="c7n-taskdetail-text-icon" />
            </div>
          );
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
        code={`${this.taskdetail.code}.create`}
        values={{ name: `${this.taskdetail.values.name || 'Choerodon'}` }}
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
                  showLengthInfo={false}
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
                  format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={this.disabledStartDate}
                  disabledTime={this.disabledDateStartTime}
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                  getCalendarContainer={() => document.getElementsByClassName('ant-modal-body')[document.getElementsByClassName('ant-modal-body').length - 1]}
                  onChange={this.onStartChange}
                  onOpenChange={this.clearStartTimes}
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
                  format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={this.disabledEndDate.bind(this)}
                  disabledTime={this.disabledDateEndTime.bind(this)}
                  showTime={{ defaultValue: moment() }}
                  getCalendarContainer={() => document.getElementsByClassName('ant-modal-body')[document.getElementsByClassName('ant-modal-body').length - 1]}
                  onChange={this.onEndChange}
                  onOpenChange={this.clearEndTimes}
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
              <div className="c7n-create-task-set-task">
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
                    <Input style={{ width: '100px' }} autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.repeat.interval`} />} />,
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
                      style={{ width: '124px' }}
                      getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
                    >
                      <Option value="SECONDS">秒</Option>
                      <Option value="MINUTES">分</Option>
                      <Option value="HOURS">时</Option>
                      <Option value="DAYS">天</Option>
                    </Select>,
                  )}
                </FormItem>
              </div>
              <FormItem 
                className="c7n-create-task-inline-formitem"
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
                  <Input style={{ width: '100px' }} autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.repeat.time`} />} />,
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
              <Popover
                content={this.getCronContent()}
                trigger="click"
                placement="bottom"
                overlayClassName="c7n-task-detail-popover"
                getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
              >
                <Icon
                  onClick={this.checkCron}
                  style={{ display: triggerType === 'cron' ? 'inline-block' : 'none' }}
                  className="c7n-task-detail-popover-icon"
                  type="find_in_page"
                />
              </Popover>
            </div>
            <div className="c7n-task-deatil-params-container">
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
                style={{ marginRight: '0' }}
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
                    style={{ width: '292px' }}
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
                style={{ width: '488px', marginRight: '0' }}
              />
            </div>
          </Form>
        </div>
      </Content>
    );
  }

  // 渲染任务详情
  renderDetailContent() {
    const { intl: { formatMessage } } = this.props;
    const { selectType, showLog, logFilters, logParams, logPagination, logLoading } = this.state;
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
      key: formatMessage({ id: `${intlPrefix}.cron.expression` }),
      value: info.cronExpression,
    }, {
      key: formatMessage({ id: `${intlPrefix}.repeat.interval` }),
      value: info.triggerType === 'simple-trigger' ? `${info.simpleRepeatInterval}${unit}` : null,
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
      render: text => (<StatusTag name={formatMessage({ id: text.toLowerCase() })} colorCode={text} />),
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
        code={`${this.taskdetail.code}.detail`}
        values={{ name: info.name }}
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

  // 页面权限
  getPermission() {
    const { AppState } = this.props;
    const { type } = AppState.currentMenuType;
    let createService = ['asgard-service.schedule-task-site.create'];
    let enableService = ['asgard-service.schedule-task-site.enable'];
    let disableService = ['asgard-service.schedule-task-site.disable'];
    let deleteService = ['asgard-service.schedule-task-site.delete'];
    let detailService = ['asgard-service.schedule-task-site.getTaskDetail'];
    if (type === 'organization') {
      createService = ['asgard-service.schedule-task-org.create'];
      enableService = ['asgard-service.schedule-task-org.enable'];
      disableService = ['asgard-service.schedule-task-org.disable'];
      deleteService = ['asgard-service.schedule-task-org.delete'];
      detailService = ['asgard-service.schedule-task-org.getTaskDetail'];
    } else if (type === 'project') {
      createService = ['asgard-service.schedule-task-project.create'];
      enableService = ['asgard-service.schedule-task-project.enable'];
      disableService = ['asgard-service.schedule-task-project.disable'];
      deleteService = ['asgard-service.schedule-task-project.delete'];
      detailService = ['asgard-service.schedule-task-project.getTaskDetail'];
    }
    return {
      createService,
      enableService,
      disableService,
      deleteService,
      detailService,
    };
  }

  render() {
    const { intl, AppState } = this.props;
    const { deleteService, detailService } = this.getPermission();
    const { filters, params, pagination, loading, isShowSidebar, selectType, isSubmitting } = this.state;
    const { createService } = this.getPermission();
    const TaskData = TaskDetailStore.getData.slice();
    const columns = [{
      title: <FormattedMessage id="name" />,
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      filters: [],
      filteredValue: filters.name || [],
      render: text => (
        <MouseOverWrapper text={text} width={0.2}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="description" />,
      width: '20%',
      dataIndex: 'description',
      key: 'description',
      filters: [],
      filteredValue: filters.description || [],
      render: text => (
        <MouseOverWrapper text={text} width={0.2}>
          {text}
        </MouseOverWrapper>
      ),
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
        text: intl.formatMessage({ id: 'enable' }),
      }, {
        value: 'DISABLE',
        text: intl.formatMessage({ id: 'disable' }),
      }, {
        value: 'FINISHED',
        text: intl.formatMessage({ id: 'finished' }),
      }],
      filteredValue: filters.status || [],
      render: status => (<StatusTag mode="icon" name={intl.formatMessage({ id: status.toLowerCase() })} colorCode={status} />),
    }, {
      title: '',
      key: 'action',
      align: 'right',
      width: '130px',
      render: (text, record) => (
        <div>
          <Permission service={detailService}>
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
          </Permission>
          {this.showActionButton(record)}
          <Permission service={deleteService}>
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
          </Permission>
        </div>
      ),
    }];
    return (
      <Page
        service={[
          'asgard-service.schedule-task-site.pagingQuery',
          'asgard-service.schedule-task-org.pagingQuery',
          'asgard-service.schedule-task-project.pagingQuery',
          'asgard-service.schedule-task-site.create',
          'asgard-service.schedule-task-org.create',
          'asgard-service.schedule-task-project.create',
          'asgard-service.schedule-task-site.enable',
          'asgard-service.schedule-task-org.enable',
          'asgard-service.schedule-task-project.enable',
          'asgard-service.schedule-task-site.disable',
          'asgard-service.schedule-task-org.disable',
          'asgard-service.schedule-task-project.disable',
          'asgard-service.schedule-task-site.delete',
          'asgard-service.schedule-task-org.delete',
          'asgard-service.schedule-task-project.delete',
          'asgard-service.schedule-task-site.getTaskDetail',
          'asgard-service.schedule-task-org.getTaskDetail',
          'asgard-service.schedule-task-project.getTaskDetail',
          'asgard-service.schedule-task-site.check',
          'asgard-service.schedule-task-org.check',
          'asgard-service.schedule-task-project.check',
          'asgard-service.schedule-task-site.cron',
          'asgard-service.schedule-task-org.cron',
          'asgard-service.schedule-task-project.cron',
          'asgard-service.schedule-task-instance-site.pagingQueryByTaskId',
          'asgard-service.schedule-task-instance-org.pagingQueryByTaskId',
          'asgard-service.schedule-task-instance-project.pagingQueryByTaskId',
          'asgard-service.schedule-method-site.getMethodByService',
          'asgard-service.schedule-method-org.getMethodByService',
          'asgard-service.schedule-method-project.getMethodByService',
          'asgard-service.schedule-method-site.pagingQuery',
          'asgard-service.schedule-method-org.pagingQuery',
          'asgard-service.schedule-method-project.pagingQuery',
          'manager-service.service.pageAll',
        ]}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Permission service={createService}>
            <Button
              icon="playlist_add"
              onClick={this.handleOpen.bind(this, 'create')}
            >
              <FormattedMessage id={`${intlPrefix}.create`} />
            </Button>
          </Permission>
          <Button
            icon="refresh"
            onClick={this.handleRefresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={this.taskdetail.code}
          values={{ name: `${this.taskdetail.values.name || 'Choerodon'}` }}
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
