/**
 * Created by hulingfangzi on 2018/5/28.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { Button, Col, Form, Icon, Input, Modal, Row, Select, Spin, Table, Tooltip, Popover, Radio } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import querystring from 'query-string';
import { observer, inject } from 'mobx-react';
import Page, { Header, Content } from 'Page';
import axios from 'Axios';
import './Route.scss';

const { Sidebar } = Modal;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
@inject('AppState')
@observer
class Route extends Component {
  state = this.getInitState();

  componentWillMount() {
    this.loadRouteList();
    this.getService();
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
      isShowModal: false,
      record: {},
      serviceArr: [],
      filterSensitive: false,
    };
  }

  /* 获取sidebar中对应微服务 */
  getOption() {
    const { serviceArr = [] } = this.state;
    const services = serviceArr.map(({ name }) =>
      (
        <Option value={name} key={name}>{name}</Option>
      ),
    );
    return services;
  }

  /* 获取所有微服务 */
  getService() {
    axios.get('manager/v1/services/page').then(({ content }) => {
      this.setState({
        serviceArr: content,
      });
    });
  }

  /**
   * Input后缀提示
   * @param text
   */
  getSuffix(text) {
    return (
      <Popover
        className="routePop"
        placement="right"
        trigger="hover"
        content={text}
      >
        <Icon type="help" />
      </Popover>
    );
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

  editOrDetail = (record, status) => {
    this.props.form.resetFields();
    this.setState({
      visible: true,
      show: status,
      sidebarData: record,
    });

    if (record.helperService && status === 'detail') {
      this.setState({
        helper: true,
      })
    } else {
      this.setState({
        helper: false,
      })
    }

    if (record.customSensitiveHeaders) {
      this.setState({
        filterSensitive: 'filtered'
      })
    } else {
      this.setState({
        filterSensitive: 'noFiltered'
      })
    }
  }

  /* 刷新 */
  handleRefresh = () => {
    this.setState(this.getInitState(), () => {
      this.loadRouteList();
    });
  };

  /* 关闭sidebar */
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }


  /* 显示删除弹窗 */
  showModal(record) {
    this.setState({
      record,
      isShowModal: true,
    });
  }

  /* 关闭删除弹窗  */
  cancelModal = () => {
    this.setState({
      isShowModal: false,
    });
  }

  /* 删除自定义路由 */
  handleDelete = () => {
    const { record } = this.state;
    axios.delete(`/manager/v1/routes/${record.id}`).then(({ failed, message }) => {
      if (failed) {
        Choerodon.prompt(message);
      } else {
        Choerodon.prompt('删除成功');
        this.cancelModal();
        this.loadRouteList();
      }
    });
  }

  /* 表单提交 */
  handleSubmit = (e) => {
    e.preventDefault();
    const { id, objectVersionNumber } = this.state.sidebarData;
    this.props.form.validateFields((err, { name, path, serviceId, preffix, retryable, customSensitiveHeaders, sensitiveHeaders, helperService }) => {
      if (!err) {
        const { show } = this.state;
        if (show === 'create') {
          const body = {
            name,
            path,
            serviceId : serviceId,
          };
          axios.post('/manager/v1/routes', JSON.stringify(body)).then(({ failed, message }) => {
            if (failed) {
              Choerodon.prompt(message);
            } else {
              Choerodon.prompt('创建成功');
              this.loadRouteList();
              this.setState({
                visible: false,
              });
            }
          }).catch(Choerodon.handleResponseError);
        } else if (show === 'detail') {
          this.handleCancel();
        } else {
          let Info;
          if(customSensitiveHeaders === 'filtered') {
            Info = sensitiveHeaders.join(',');
          } else {
            Info = null;
          }
          const body = {
            name,
            path,
            objectVersionNumber,
            helperService,
            serviceId: serviceId,
            preffix: preffix === 'stripPrefix' ? true : false,
            retryable: retryable === 'retry' ? true : false,
            customSensitiveHeaders: customSensitiveHeaders === 'filtered' ? true : false,
            sensitiveHeaders: Info,
          }
          axios.post(`/manager/v1/routes/${id}`, JSON.stringify(body)).then(({ failed, message }) => {
            if (failed) {
              Choerodon.prompt(message);
            } else {
              Choerodon.prompt('修改成功');
              this.loadRouteList();
              this.setState({
                visible: false,
              });
            }
          }).catch(Choerodon.handleResponseError);
        }
      }
    });
  }

  /**
   * 路由名称唯一性校验
   * @param rule 规则
   * @param value 路径
   * @param callback 回调
   */
  checkName = (rule, value, callback) => {
    axios.post('/manager/v1/routes/check', JSON.stringify({ name: value }))
      .then(({ failed }) => {
        if (failed) {
          callback(Choerodon.getMessage('路由名称已存在，请输入其他路由名称', 'name existed, please try another'));
        } else {
          callback();
        }
      });
  }

  /**
   * 路由路径唯一性校验
   * @param rule 规则
   * @param value 路径
   * @param callback 回调
   */
  checkPath = (rule, value, callback) => {
    axios.post('/manager/v1/routes/check', JSON.stringify({ path: value }))
      .then(({ failed }) => {
        if (failed) {
          callback(Choerodon.getMessage('路由路径已存在，请输入其他路由路径', 'path existed, please try another'));
        } else {
          callback();
        }
      });
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
          <Tooltip
            title="详情"
            placement="bottom"
          >
            <Button
              icon="find_in_page"
              shape="circle"
              onClick={this.editOrDetail.bind(this, record, 'detail')}
            />
          </Tooltip>
        </div>
      );
    } else {
      return (
        <div>
          <Tooltip
            title="修改"
            placement="bottom"
          >
            <Button
              icon="mode_edit"
              shape="circle"
              onClick={this.editOrDetail.bind(this, record, 'edit')}
            />
          </Tooltip>
          <Tooltip
            title="删除"
            placement="bottom"
          >
            <Button
              icon="delete_forever"
              shape="circle"
              onClick={this.showModal.bind(this, record)}
            />
          </Tooltip>
        </div>
      );
    }
  }

  /* 渲染侧边栏头部 */
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

  /* 渲染侧边栏成功按钮文字 */
  renderSidebarOkText() {
    const { show } = this.state;
    if (show === 'create') {
      return '创建';
    } else if (show === 'edit') {
      return '保存';
    } else {
      return '返回';
    }
  }

  /* 渲染侧边栏内容 */
  renderSidebarContent() {
    const { getFieldDecorator } = this.props.form;
    const { show, sidebarData, filterSensitive, helper } = this.state;
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
    const valid = show === 'create';
    const inputWidth = 512;
    const stripPrefix = sidebarData && sidebarData.stripPrefix ? 'stripPrefix' : 'withPrefix';
    const retryable = sidebarData && sidebarData.retryable ? 'retry' : 'noRetry';
    const customSensitiveHeaders = sidebarData && sidebarData.customSensitiveHeaders ? 'filtered' : 'noFiltered';
    let title;
    let description;
    if (show === 'create') {
      title = `在平台"${process.env.HEADER_TITLE_NAME || 'Choerodon'}"中创建路由`;
      description = '请在下面输入路由名称、路径、路径对应的微服务创建路由。其中，路由名称时全平台唯一的，路由创建后不能修改路由名称。';
    } else if (show === 'edit') {
      title = `对路由"${sidebarData.name}"进行修改`;
      description = '您可以在此修改路由的路径、路径对应的微服务以及配置路由前缀、重试、敏感头、Helper等信息。';
    } else if (show === 'detail') {
      title = `查看路由"${sidebarData.name}"的详情`;
      description = '预定义路由为平台初始化设置，您不能修改预定义路由。';
    }
    return (
      <Content
        style={{ padding: 0 }}
        title={title}
        description={description}
        className="formContainer"
      >
        <Form>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [{
                required: valid,
                whitespace: valid,
                message: '请输入路由名称',
              }, {
                validator: valid && this.checkName,
              }],
              initialValue: valid ? undefined : sidebarData.name,
              validateTrigger: 'onBlur',
              validateFirst: true,
            })(
              <Input
                label="路由名称"
                suffix={this.getSuffix('路由表中的唯一标识')}
                style={{ width: inputWidth }}
                disabled={!valid}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('path', {
              rules: [{
                required: valid,
                whitespace: valid,
                message: '请输入路径',
              }, {
                validator: valid && this.checkPath,
              }],
              initialValue: valid ? undefined : sidebarData.path,
              validateTrigger: 'onBlur',
              validateFirst: true,
            })(
              <Input
                label="路径"
                style={{ width: inputWidth }}
                suffix={this.getSuffix('路由的跳转路由规则，路由必须配置一个可以被指定为Ant风格表达式的路径')}
                disabled={!valid}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('serviceId', {
              rules: [{
                required: valid,
                message: Choerodon.getMessage('必须选择一个微服务', 'Please choose one microservice at least'),
              }],
              initialValue: valid ? undefined : sidebarData.serviceId,
            })(
              <Select
                disabled={show === 'detail'}
                style={{ width: 300 }}
                label="请选择一个微服务"
                filterOption={
                  (input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filter
              >
                {this.getOption()}
              </Select>,
            )}
          </FormItem>
          {show !== 'create' && (
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('preffix', {
                initialValue: stripPrefix,
              })(
                <RadioGroup label="是否去除前缀" className="radioGroup" disabled={show === 'detail'}>
                  <Radio value={'stripPrefix'}>是</Radio>
                  <Radio value={'withPrefix'}>否</Radio>
                </RadioGroup>,
              )}
            </FormItem>
          )}
          {show !== 'create' && (
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('retryable', {
                initialValue: retryable,
              })(
                <RadioGroup label="是否重试" className="radioGroup" disabled={show === 'detail'}>
                  <Radio value={'retry'}>是</Radio>
                  <Radio value={'noRetry'}>否</Radio>
                </RadioGroup>,
              )}
            </FormItem>
          )}
          {show !== 'create' && (
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('customSensitiveHeaders', {
                initialValue: customSensitiveHeaders,
              })(
                <RadioGroup label="是否过滤敏感头信息" className="radioGroup" disabled={show === 'detail'} onChange={this.changeSensetive.bind(this)}>
                  <Radio value={'filtered'}>是</Radio>
                  <Radio value={'noFiltered'}>否</Radio>
                </RadioGroup>,
              )}
            </FormItem>
          )}
        </Form>
        {
          filterSensitive === 'filtered' && show !== 'create' ? (
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('sensitiveHeaders', {
                // rules: [{
                //   required: true,
                //   whitespace: true,
                //   message: '请输入敏感头信息',
                // }],
                initialValue: sidebarData && sidebarData.sensitiveHeaders,
              })(
                <Select
                  label="敏感头信息"
                  mode="tags"
                  filterOption={false}
                  choiceRender={this.handeChoiceRender}
                  ref={this.saveSelectRef}
                  style={{ width: inputWidth }}
                  notFoundContent={false}
                  allowClear
                />
              )}
            </FormItem>
          ) : ''
        }
        {(show === 'edit' || helper) && (
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('helperService', {
              rules: [{
                whitespace: show === 'edit',
                message: '请输入Helper服务名',
              }],
              initialValue: sidebarData.helperService || undefined,
            })(
              <Input
                disabled={show === 'detail'}
                label="Helper服务名"
                style={{ width: inputWidth }}
                suffix={this.getSuffix('该路由规则对应的自定义网关处理器服务，默认为gateway-helper')}
              />,
            )}
          </FormItem>
        )
        }
      </Content>
    );
  }

  changeSensetive(e) {
    this.setState({
      filterSensitive: e.target.value,
    })
  }

  render() {
    const { AppState } = this.props;
    const { sort: { columnKey, order }, filters } = this.state;
    const { content, loading, pagination, visible, show } = this.state;
    const { type } = AppState.currentMenuType;
    let filtersService = content && content.map(({ serviceId }) => ({
      value: serviceId,
      text: serviceId,
    }));
    const obj = {};
    filtersService = filtersService && filtersService.reduce((cur, next) => {
      obj[next.value] ? '' : obj[next.value] = true && cur.push(next);
      return cur;
    }, []);

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
            {Choerodon.getMessage('创建', 'create')}
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
            filters={this.state.filters.params}
            filterBarPlaceholder="过滤表"
          />
          <Sidebar
            title={this.renderSidebarTitle()}
            visible={visible}
            okText={this.renderSidebarOkText()}
            cancelText="取消"
            onOk={this.handleSubmit}
            onCancel={this.handleCancel}
            okCancel={show !== 'detail'}
          >
            {this.renderSidebarContent()}
          </Sidebar>
          <Modal
            title="删除路由"
            visible={this.state.isShowModal}
            onCancel={this.cancelModal}
            onOk={this.handleDelete}
          >
            <p>确定要删除路由“{this.state.record.name}”吗？</p>
          </Modal>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(Route));
