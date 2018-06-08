/*eslint-disable*/
import React, { Component } from 'react';
import { Button, Form, Input, Modal, Table, Tooltip } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
// import '../../../../assets/css/main.scss';
import './ProjectHome.scss';

const { HeaderStore } = stores;
const FormItem = Form.Item;
const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';
const { Sidebar } = Modal;


@inject('AppState')
@observer
class ProjectHome extends Component {
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
      checkCode: false,
      checkName: false,
      buttonClicked: false,
      state: {},
      filters: {},
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
  }


  componentWillMount() {
    this.setState({
      isLoading: true,
    });
  }

  componentDidMount() {
    this.loadProjects();
  }

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

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
    ProjectStore.loadProject(organizationId, pagination, sort, filters)
      .then((data) => {
        ProjectStore.changeLoading(false);
        ProjectStore.setProjectData(data.content);
        this.setState({
          filters,
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
    this.props.form.resetFields();
    this.setState({
      errorMeg: '',
      successMeg: '',
      sidebar: true,
      projectDatas: data,
      operation,
    });

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
    // const editData = this.state.resourceData;
    if (this.state.operation === 'create') {
      const { validateFields } = this.props.form;
      validateFields((err, { code, name }) => {
        if (!err) {
          data = {
            code,
            name,
            organizationId,
          };
          this.setState({ submitting: true });
          ProjectStore.createProject(organizationId, data)
            .then((value) => {
              this.setState({ submitting: false });
              if (value) {
                Choerodon.prompt(Choerodon.getMessage('创建成功', 'Success'));
                this.handleTabClose();
                this.loadProjects();
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
      validateFields((err, { name }) => {
        if (!err) {
          data = {
            name,
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
              Choerodon.prompt(Choerodon.getMessage('修改成功', 'Success'));
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
    const { ProjectStore, AppState } = this.props;
    const userId = AppState.getUserId;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    ProjectStore.enableProject(orgId, record.id, record.enabled).then((value) => {
      const msg = record.enabled ? '停用成功' : '启用成功';
      Choerodon.prompt(Choerodon.getMessage(msg, 'Success'));
      this.loadProjects();
      HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
        org[0].map(value => {
          value.type = ORGANIZATION_TYPE;
        });
        org[1].map(value => {
          value.type = PROJECT_TYPE;
        });
        HeaderStore.setProData(org[0]);
        HeaderStore.setProData(org[1]);
      });
    }).catch((error) => {
      Choerodon.prompt(`操作失败 ${error}`);
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
  checkCodeOnly = _.debounce((value, callback) => {
    const { AppState, ProjectStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    const params = { code: value };
    ProjectStore.checkProjectCode(organizationId, params)
      .then((mes) => {
        if (mes.failed) {
          callback(Choerodon.getMessage('项目编码已存在，请输入其他项目编码', 'code existed, please try another'));
        } else {
          callback();
        }
      });
  }, 1000);


  /**
   * 校验编码
   * @param rule 校验规则
   * @param value 项目编码
   * @param callback 回调函数
   */
  checkcode(rule, value, callback) {
    if (!value) {
      callback(Choerodon.getMessage('请输入项目编码', 'please input project code'));
      return;
    }
    if (value.length <= 14) {
      // eslint-disable-next-line no-useless-escape
      const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
      if (pa.test(value)) {
        this.checkCodeOnly(value, callback);
      } else {
        callback(Choerodon.getMessage('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾', 'Code can contain only lowercase letters, digits,"-", must start with lowercase letters and will not end with "-"'));
      }
    } else {
      callback(Choerodon.getMessage('项目编码不能超过14个字符', 'code should less than 14 characters'));
    }
  }

  renderSideTitle() {
    if (this.state.operation === 'create') {
      return '创建项目';
    } else {
      return '修改项目';
    }
  }

  getSidebarContentInfo(operation) {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgname = menuType.name;
    switch (operation) {
      case 'create':
        return {
          title: `在组织“${orgname}”中创建项目`,
          link: 'http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/project/',
          description: '请在下面输入项目编码、项目名称创建项目。项目编码在一个组织中是唯一的，项目创建后，不能修改项目编码。',
        };
      case 'edit':
        return {
          title: `对项目“${this.state.projectDatas.code}”进行修改`,
          link: 'http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/project/',
          description: '您可以在此修改项目名称。',
        };
    }
  }

  renderSidebarContent() {
    const { getFieldDecorator } = this.props.form;
    const { operation, projectDatas } = this.state;
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
        style={{ padding: 0 }}
        {...contentInfo}
      >
        <Form layout="vertical" className="rightForm">
          {operation === 'create' ? (<FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('code', {
              rules: [{
                required: true,
                hasFeedback: false,
                validator: this.checkcode.bind(this),
              }],
            })(
              <Input
                autocomplete="off"
                label="项目编码"
                style={{ width: inputWidth }}
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
                message: Choerodon.getMessage('请输入项目名称', 'This field is required.'),
              }],
              initialValue: operation === 'create' ? undefined : projectDatas.name,
            })(
              <Input
                autocomplete="off"
                label="项目名称"
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
        </Form>
      </Content>
    );
  }

  render() {
    const { ProjectStore, AppState } = this.props;
    const projectData = ProjectStore.getProjectData;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    const orgname = menuType.name;
    const { filters, operation } = this.state;

    const type = menuType.type;
    const columns = [{
      title: Choerodon.getMessage('项目名称', 'project code'),
      dataIndex: 'name',
      key: 'name',
      filters: [],
      filteredValue: filters.name || [],
      sorter: (a, b) => (a.name > b.name ? 1 : 0),
      render: (text, record) => <span>{text}</span>,
    }, {
      title: Choerodon.getMessage('项目编码', 'project code'),
      dataIndex: 'code',
      filters: [],
      filteredValue: filters.code || [],
      key: 'code',
      sorter: (a, b) => (a.code > b.code ? 1 : 0),
    }, {
      title: Choerodon.getMessage('启用状态', 'status'),
      dataIndex: 'enabled',
      filters: [{
        text: '启用',
        value: 'true',
      }, {
        text: '停用',
        value: 'false',
      }],
      filteredValue: filters.enabled || [],
      key: 'enabled',
      render: text => <span className="titleNameStyle">{text ? '启用' : '停用'}</span>,
    }, {
      title: '',
      className: 'operateIcons',
      key: 'action',
      width: '100px',
      render: (text, record) => (
        <div>
          <Permission service={['iam-service.organization-project.update']} type={type} organizationId={orgId}>
            <Tooltip
              title="修改"
              placement="bottom"
            >
              <Button
                shape="circle"
                onClick={this.handleopenTab.bind(this, record, 'edit')}
                icon="mode_edit"
              />
            </Tooltip>
          </Permission>
          <Permission
            service={['iam-service.organization-project.disableProject', 'iam-service.organization-project.enableProject']}
            type={type} organizationId={orgId}>
            <Tooltip
              title={record.enabled ? '停用' : '启用'}
              placement="bottom"
            >
              <Button
                shape="circle"
                onClick={this.handleEnable.bind(this, record)}
                icon={record.enabled ? 'remove_circle_outline' : 'finished'}
              />
            </Tooltip>
          </Permission>
        </div>
      ),
    }];


    return (
      <Page>
        <Header title={Choerodon.getMessage('项目管理', 'project title')}>
          <Permission service={['iam-service.organization-project.create']} type={type} organizationId={orgId}>
            <Button
              onClick={this.handleopenTab.bind(this, null, 'create')}
              icon="playlist_add"
            >
              {Choerodon.getMessage('创建项目', 'createProject')}
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
            {Choerodon.getMessage('刷新', 'flush')}
          </Button>
        </Header>
        <Content
          title={`组织“${orgname}”的项目管理`}
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/project/"
          description="项目是最小粒度的管理层次。您可以在组织下创建项目，则项目属于这个组织。"
        >
          <Table
            pagination={this.state.pagination}
            columns={columns}
            dataSource={projectData}
            rowKey={record => record.id}
            filters={this.state.filters.params}
            onChange={this.handlePageChange.bind(this)}
            loading={ProjectStore.isLoading}
            filterBarPlaceholder="过滤表"
          />
          <Sidebar
            title={this.renderSideTitle()}
            visible={this.state.sidebar}
            onCancel={this.handleTabClose.bind(this)}
            onOk={this.handleSubmit.bind(this)}
            okText={operation === 'create' ? '创建' : '保存'}
            cancelText="取消"
            confirmLoading={this.state.submitting}
          >
            {operation && this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(ProjectHome));
