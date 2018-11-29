
import React, { Component } from 'react';
import { Button, Form, Input, Modal, Table, Tooltip, Select } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import './Project.scss';
import MouseOverWrapper from '../../../components/mouseOverWrapper';
import StatusTag from '../../../components/statusTag';
import { handleFiltersParams } from '../../../common/util';

const { HeaderStore } = stores;
const FormItem = Form.Item;
const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';
const { Sidebar } = Modal;
const Option = Select.Option;
const intlPrefix = 'organization.project';

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class Project extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebar: false,
      page: 0,
      id: '',
      open: false,
      projectDatas: [],
      visible: false,
      visibleCreate: false,
      checkName: false,
      buttonClicked: false,
      state: {},
      filters: {
        params: [],
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: '',
      },
      sort: {
        columnKey: null,
        order: null,
      },
      submitting: false,
    };
    this.editFocusInput = React.createRef();
    this.createFocusInput = React.createRef();
  }


  componentWillMount() {
    this.setState({
      isLoading: true,
    });
  }

  componentDidMount() {
    this.loadProjects();
    this.loadProjectTypes();
  }

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  loadProjectTypes = () => {
    const { ProjectStore } = this.props;
    ProjectStore.loadProjectTypes().then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        ProjectStore.setProjectTypes(data);
      }
    }).catch((error) => {
      Choerodon.handleResponseError(error);
    });
  }

  loadProjects = (paginationIn, sortIn, filtersIn) => {
    const {
      pagination: paginationState,
      sort: sortState,
      filters: filtersState,
    } = this.state;
    const pagination = paginationIn || paginationState;
    const sort = sortIn || sortState;
    const filters = filtersIn || filtersState;
    const { AppState, ProjectStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    ProjectStore.changeLoading(true);
    // 防止标签闪烁
    this.setState({ filters });
    // 若params或filters含特殊字符表格数据置空
    const currentParams = filters.params;
    const currentFilters = {
      name: filters.name,
      code: filters.code,
      enabled: filters.enabled,
    };
    const isIncludeSpecialCode = handleFiltersParams(currentParams, currentFilters);
    if (isIncludeSpecialCode) {
      ProjectStore.changeLoading(false);
      ProjectStore.setProjectData([]);
      this.setState({
        sort,
        pagination: {
          total: 0,
        },
      });
      return;
    }

    ProjectStore.loadProject(organizationId, pagination, sort, filters)
      .then((data) => {
        ProjectStore.changeLoading(false);
        ProjectStore.setProjectData(data.content);
        this.setState({
          sort,
          pagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
        });
      })
      .catch(error =>
        Choerodon.handleResponseError(error),
      );
  };

  handleopenTab = (data, operation) => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      errorMeg: '',
      successMeg: '',
      sidebar: true,
      projectDatas: data,
      operation,
    });
    if (operation === 'edit') {
      setTimeout(() => {
        this.editFocusInput.input.focus();
      }, 10);
    } else {
      setTimeout(() => {
        this.createFocusInput.input.focus();
      }, 10);
    }
  };

  handleTabClose = () => {
    this.setState({
      sidebar: false,
      submitting: false,
    });
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const { AppState, ProjectStore } = this.props;
    const { projectDatas } = this.state;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    const id = this.state.id;
    let data;
    if (this.state.operation === 'create') {
      const { validateFields } = this.props.form;
      validateFields((err, { code, name, type }) => {
        if (!err) {
          data = {
            code,
            name: name.trim(),
            organizationId,
            type: type === 'no' || undefined ? null : type,
          };

          this.setState({ submitting: true });
          ProjectStore.createProject(organizationId, data)
            .then((value) => {
              this.setState({ submitting: false });
              if (value) {
                Choerodon.prompt(this.props.intl.formatMessage({ id: 'create.success' }));
                this.handleTabClose();
                this.loadProjects();
                const targetType = (ProjectStore.getProjectTypes.find(item => item.code === value.type));
                value.typeName = targetType ? targetType.name : null;
                value.type = 'project';
                HeaderStore.addProject(value);
              }
            }).catch((error) => {
              Choerodon.handleResponseError(error);
              this.setState({
                submitting: false,
                visibleCreate: false,
              });
            });
        }
      });
    } else {
      const { validateFields } = this.props.form;
      validateFields((err, { name, type }, modify) => {
        if (!err) {
          if (!modify) {
            Choerodon.prompt(this.props.intl.formatMessage({ id: 'modify.success' }));
            this.handleTabClose();
            return;
          }
          data = {
            name: name.trim(),
            type: type === 'no' || undefined ? null : type,
          };
          this.setState({ submitting: true, buttonClicked: true });
          ProjectStore.updateProject(organizationId,
            {
              ...data,
              objectVersionNumber: projectDatas.objectVersionNumber,
              code: projectDatas.code,
            },
            this.state.projectDatas.id).then((value) => {
            this.setState({ submitting: false, buttonClicked: false });
            if (value) {
              Choerodon.prompt(this.props.intl.formatMessage({ id: 'modify.success' }));
              this.handleTabClose();
              this.loadProjects();
              value.type = 'project';
              HeaderStore.updateProject(value);
            }
          }).catch((error) => {
            Choerodon.handleResponseError(error);
          });
        }
      });
    }
  };

  /* 停用启用 */
  handleEnable = (record) => {
    const { ProjectStore, AppState, intl } = this.props;
    const userId = AppState.getUserId;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    ProjectStore.enableProject(orgId, record.id, record.enabled).then((value) => {
      Choerodon.prompt(intl.formatMessage({ id: record.enabled ? 'disable.success' : 'enable.success' }));
      this.loadProjects();
      HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
        org[0].forEach((item) => {
          item.type = ORGANIZATION_TYPE;
        });
        org[1].forEach((item) => {
          item.type = PROJECT_TYPE;
        });
        HeaderStore.setProData(org[0]);
        HeaderStore.setProData(org[1]);
      });
    }).catch((error) => {
      Choerodon.prompt(intl.formatMessage({ id: 'operation.error' }));
    });
  };

  /* 分页处理 */
  handlePageChange(pagination, filters, sorter, params) {
    filters.params = params;
    this.loadProjects(pagination, sorter, filters);
  }

  /**
   * 校验项目编码唯一性
   * @param value 项目编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    const { AppState, ProjectStore, intl } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    const params = { code: value };
    ProjectStore.checkProjectCode(organizationId, params)
      .then((mes) => {
        if (mes.failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.code.exist.msg` }));
        } else {
          callback();
        }
      });
  };


  renderSideTitle() {
    if (this.state.operation === 'create') {
      return <FormattedMessage id={`${intlPrefix}.create`} />;
    } else {
      return <FormattedMessage id={`${intlPrefix}.modify`} />;
    }
  }

  getSidebarContentInfo(operation) {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgname = menuType.name;
    switch (operation) {
      case 'create':
        return {
          code: `${intlPrefix}.create`,
          values: {
            name: orgname,
          },
        };
      case 'edit':
        return {
          code: `${intlPrefix}.modify`,
          values: {
            name: this.state.projectDatas.code,
          },
        };
      default:
        return {};
    }
  }

  renderSidebarContent() {
    const { intl, ProjectStore, form } = this.props;
    const { getFieldDecorator } = form;
    const { operation, projectDatas } = this.state;
    const types = ProjectStore.getProjectTypes;
    const inputWidth = 512;
    const contentInfo = this.getSidebarContentInfo(operation);
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
        {...contentInfo}
        className="sidebar-content"
      >
        <Form layout="vertical" className="rightForm">
          {operation === 'create' ? (<FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('code', {
              rules: [{
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.code.require.msg` }),
              }, {
                max: 14,
                message: intl.formatMessage({ id: `${intlPrefix}.code.length.msg` }),
              }, {
                pattern: /^[a-z](([a-z0-9]|-(?!-))*[a-z0-9])*$/,
                message: intl.formatMessage({ id: `${intlPrefix}.code.pattern.msg` }),
              }, {
                validator: this.checkCode,
              }],
              validateTrigger: 'onBlur',
              validateFirst: true,
            })(
              <Input
                autoComplete="off"
                label={<FormattedMessage id={`${intlPrefix}.code`} />}
                style={{ width: inputWidth }}
                ref={(e) => { this.createFocusInput = e; }}
                maxLength={14}
                showLengthInfo={false}
              />,
            )}
          </FormItem>) : null}
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.name.require.msg` }),
              }],
              initialValue: operation === 'create' ? undefined : projectDatas.name,
            })(
              <Input
                autoComplete="off"
                label={<FormattedMessage id={`${intlPrefix}.name`} />}
                style={{ width: inputWidth }}
                ref={(e) => { this.editFocusInput = e; }}
                maxLength={32}
                showLengthInfo={false}
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('type', {
              initialValue: operation === 'create' ? undefined : projectDatas.type ? projectDatas.type : undefined,
            })(
              <Select
                style={{ width: '300px' }}
                label={<FormattedMessage id={`${intlPrefix}.type`} />}
                getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                filter
              >
                {
                  types && types.length ? [<Option key="no" value="no">{intl.formatMessage({ id: `${intlPrefix}.empty` })}</Option>].concat(
                    types.map(({ name, code }) => (
                      <Option key={code} value={code}>{name}</Option>
                    )),
                  ) : <Option key="empty">{intl.formatMessage({ id: `${intlPrefix}.type.empty` })}</Option>
                }
              </Select>,
            )}
          </FormItem>
        </Form>
      </Content>
    );
  }

  render() {
    const { ProjectStore, AppState, intl } = this.props;
    const projectData = ProjectStore.getProjectData;
    const projectTypes = ProjectStore.getProjectTypes;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    const orgname = menuType.name;
    const { filters, operation } = this.state;
    const type = menuType.type;
    const filtersType = projectTypes && projectTypes.map(({ name }) => ({
      value: name,
      text: name,
    }));
    const columns = [{
      title: <FormattedMessage id="name" />,
      dataIndex: 'name',
      key: 'name',
      filters: [],
      filteredValue: filters.name || [],
      width: '25%',
      render: text => (
        <MouseOverWrapper text={text} width={0.2}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="code" />,
      dataIndex: 'code',
      filters: [],
      filteredValue: filters.code || [],
      key: 'code',
      width: '25%',
      render: text => (
        <MouseOverWrapper text={text} width={0.2}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.type`} />,
      dataIndex: 'typeName',
      key: 'typeName',
      width: '25%',
      filters: filtersType,
      filteredValue: filters.typeName || [],
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'enabled',
      filters: [{
        text: intl.formatMessage({ id: 'enable' }),
        value: 'true',
      }, {
        text: intl.formatMessage({ id: 'disable' }),
        value: 'false',
      }],
      filteredValue: filters.enabled || [],
      key: 'enabled',
      render: enabled => (<StatusTag mode="icon" name={intl.formatMessage({ id: enabled ? 'enable' : 'disable' })} colorCode={enabled ? 'COMPLETED' : 'DISABLE'} />),
    }, {
      title: '',
      key: 'action',
      width: '100px',
      align: 'right',
      render: (text, record) => (
        <div>
          <Permission service={['iam-service.organization-project.update']} type={type} organizationId={orgId}>
            <Tooltip
              title={<FormattedMessage id="modify" />}
              placement="bottom"
            >
              <Button
                shape="circle"
                size="small"
                onClick={this.handleopenTab.bind(this, record, 'edit')}
                icon="mode_edit"
              />
            </Tooltip>
          </Permission>
          <Permission
            service={['iam-service.organization-project.disableProject', 'iam-service.organization-project.enableProject']}
            type={type}
            organizationId={orgId}
          >
            <Tooltip
              title={<FormattedMessage id={record.enabled ? 'disable' : 'enable'} />}
              placement="bottom"
            >
              <Button
                shape="circle"
                size="small"
                onClick={this.handleEnable.bind(this, record)}
                icon={record.enabled ? 'remove_circle_outline' : 'finished'}
              />
            </Tooltip>
          </Permission>
        </div>
      ),
    }];


    return (
      <Page
        service={[
          'iam-service.organization-project.list',
          'iam-service.organization-project.create',
          'iam-service.organization-project.check',
          'iam-service.organization-project.update',
          'iam-service.organization-project.disableProject',
          'iam-service.organization-project.enableProject',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Permission service={['iam-service.organization-project.create']} type={type} organizationId={orgId}>
            <Button
              onClick={this.handleopenTab.bind(this, null, 'create')}
              icon="playlist_add"
            >
              <FormattedMessage id={`${intlPrefix}.create`} />
            </Button>
          </Permission>
          <Button
            icon="refresh"
            onClick={() => {
              ProjectStore.changeLoading(true);
              this.setState({
                filters: {
                  params: [],
                },
                pagination: {
                  current: 1,
                  pageSize: 10,
                  total: '',
                },
                sort: {
                  columnKey: null,
                  order: null,
                },
              }, () => {
                this.loadProjects();
              });
            }}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
        >
          <Table
            pagination={this.state.pagination}
            columns={columns}
            dataSource={projectData}
            rowKey={record => record.id}
            filters={this.state.filters.params}
            onChange={this.handlePageChange.bind(this)}
            loading={ProjectStore.isLoading}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={this.renderSideTitle()}
            visible={this.state.sidebar}
            onCancel={this.handleTabClose.bind(this)}
            onOk={this.handleSubmit.bind(this)}
            okText={<FormattedMessage id={operation === 'create' ? 'create' : 'save'} />}
            cancelText={<FormattedMessage id="cancel" />}
            confirmLoading={this.state.submitting}
            className="c7n-iam-project-sidebar"
          >
            {operation && this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
