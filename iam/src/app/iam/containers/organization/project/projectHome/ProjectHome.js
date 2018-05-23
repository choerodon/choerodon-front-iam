/*eslint-disable*/
import React, { Component } from 'react';
import { Table,
  Button,
  Spin,
  message,
  Input,
  Form,
  notification,
  Row,
  Col,
  Modal,
  Popover } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Page, { Content, Header } from 'Page';
import Permission from 'PerComponent';
import RePagination from 'RePagination';
import ClientSearch from 'ClientSearch';
import menuStore from 'menuStore';
import classNames from 'classnames';
import HeaderStore from '@/stores/HeaderStore';
import _ from 'lodash';
import '../../../../assets/css/main.scss';

import RightTab from '../component/rightTabs';
import LoadingBar from '../../../../components/loadingBar';
import './ProjectHome.scss';


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
      pagination: {
        current: 1,
        pageSize: 10,
        total: '',
      },
      sort: '',
    };
  }


  componentWillMount() {
    this.setState({
      isLoading: true,
    });
  }

  componentDidMount() {
    const { pagination, sort } = this.state;
    this.loadProjects(pagination, sort);
  }

  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  loadProjects = (pagination, sort, filters = {
    name: '',
    code: '',
    enabled: '',
  }) => {
    const { AppState, ProjectStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    // const params = this.state.params || state;
    // this.setState({
    //   page: pages,
    // });
    ProjectStore.loadProject(organizationId, pagination, sort, filters)
      .then((data) => {
        ProjectStore.changeLoading(false);
        ProjectStore.setProjectData(data.content);
        this.setState({
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

  handleSearch = (state) => {
    this.setState({
      page: 0,
      params: state,
    });
    this.loadProjects(0, state);
  }
  handleopenTab = (data, operation) => {
    this.setState({
      errorMeg: '',
      successMeg: '',
      sidebar: true,
      operation,
    });

    if (operation === 'create') {
      this.setState({
        projectDatas: '',
      });
    } else {
      this.setState({
        projectDatas: data,
      });
    }
  };
  handleTabClose = () => {
    this.setState({ sidebar: false });
    const { resetFields } = this.props.form;
    resetFields();
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
      validateFields((err, values) => {
        if (!err) {
          data = {
            code: document.getElementById('code').value,
            name: document.getElementById('name').value,
            organizationId,
          };
          this.setState({ submitting: true });
          ProjectStore.createProject(organizationId, data)
            .then((value) => {
              this.setState({ submitting: false });
              if (value) {
                Choerodon.prompt(Choerodon.getMessage('创建成功', 'Success'));
                this.handleTabClose();
                const { pagination, sort } = this.state;
                this.loadProjects(pagination, sort);
                value.type = 'project';
                HeaderStore.addProject(value);
              }
              menuStore.loadMenuTypeDate().then((res) => {
                const datas = res.organizations;
                const projects = res.projects;
                datas.map((item) => {
                  const it = item;
                  it.key = `organization${item.id}`;
                  it.type = ORGANIZATION_TYPE;
                  it.children = [];
                  projects.map((project) => {
                    const p = project;
                    if (item.id === project.organizationId) {
                      p.type = PROJECT_TYPE;
                      p.key = `project${project.id}`;
                      item.children.push(project);
                    }
                    return project;
                  });
                  return data;
                });
                menuStore.setMenuTypeData(data);
              });
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
      validateFields((err, values) => {
        if (!err) {
          data = {
            name: values.name,
          };
          this.setState({ submitting: true, buttonClicked: true });
          ProjectStore.updateProject(organizationId,
            { ...data,
              objectVersionNumber: projectDatas.objectVersionNumber,
              code: projectDatas.code },
            this.state.projectDatas.id).then((value) => {
            this.setState({ submitting: false, buttonClicked: false });
            if (value) {
              Choerodon.prompt(Choerodon.getMessage('修改成功', 'Success'));
              this.handleTabClose();
              const { pagination, sort } = this.state;
              this.loadProjects(pagination, sort);
              value.type = 'project';
              HeaderStore.updateProject(value);
            }
            //   menuStore.loadMenuTypeDate().then((res) => {
            //     const datass = res.organizations;
            //     const projects = res.projects;
            //     datass.map((item) => {
            //       const it = item;
            //       it.key = `organization${item.id}`;
            //       it.type = ORGANIZATION_TYPE;
            //       it.children = [];
            //       projects.map((project) => {
            //         const p = project;
            //         if (item.id === project.organizationId) {
            //           p.type = PROJECT_TYPE;
            //           p.key = `project${project.id}`;
            //           item.children.push(project);
            //         }
            //         return project;
            //       });
            //       return data;
            //     });
            //     menuStore.setMenuTypeData(data);
            //   });
            // }).catch((error) => {
            //   Choerodon.handleResponseError(error);
            //   this.setState({
            //     visible: false,
            //     submitting: false,
            //     buttonClicked: false,
            //   });
            // });
          }).catch((error) => {
            Choerodon.handleResponseError(error);
          });
        }
      });
    }
  }

  /* 停用启用 */
  handleEnable = (record) => {
    const { ProjectStore, AppState } = this.props;
    const userId = AppState.getUserId;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    ProjectStore.enableProject(orgId, record.id, record.enabled).then((value) => {
      const msg = record.enabled ? '停用成功' : '启用成功';
      Choerodon.prompt(Choerodon.getMessage(msg, 'Success'));
      const { pagination, sort } = this.state;
      this.loadProjects(pagination, sort);
      HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
        org[0].map(value => {
          value.type = ORGANIZATION_TYPE;
        })
        org[1].map(value => {
          value.type = PROJECT_TYPE;
        })
        HeaderStore.setProData(org[0]);
        HeaderStore.setProData(org[1]);
      })
    }).catch((error) => {
      Choerodon.prompt(`操作失败 ${error}`);
    });
  }

  /* 分页处理 */
  handlePageChange(pagination, filters, sorter) {
    const newSorter = sorter.columnKey ? sorter.columnKey : '';
    const tempfilters = {
      name: (filters.name && filters.name[0]) || '',
      code: (filters.code && filters.code[0]) || '',
      enabled: '',
    };
    const enabled = filters.enabled;
    if (enabled && enabled.length) {
      tempfilters.enabled = enabled[0] === '启用';
    }
    this.loadProjects(pagination, newSorter, tempfilters);
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

  renderSidebarContent() {
    const { getFieldDecorator } = this.props.form;
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgname = menuType.name;
    const inputWidth = 512;
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

    if (this.state.operation === 'create') {
      return (
        <Content
          style={{ padding: 0 }}
          title={`在组织“${orgname}”中创建项目`}
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/project/"
          description="请在下面输入项目编码、项目名称创建项目。项目编码在一个组织中是唯一的，项目创建后，不能修改项目编码。"
        >
          <Form layout="vertical" className="rightForm">
            <FormItem
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
                  placeholder={Choerodon.getMessage('项目编码', 'Project Code')}
                  label="项目编码"
                  style={{ width: inputWidth }}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: Choerodon.getMessage('请输入项目名称', 'This field is required.'),
                }],
              })(
                <Input
                  label="项目名称"
                  placeholder={Choerodon.getMessage('项目名称', 'Project Name')}
                  style={{ width: inputWidth }}
                />,
              )}
            </FormItem>
          </Form>
        </Content>
      );
    } else {
      return (
        <Content
          style={{ padding: 0 }}
          title={`对项目“${this.state.projectDatas.code}”进行修改`}
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/tenant/project/"
          description="您可以在此修改项目名称。"
        >
          <Form>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: Choerodon.getMessage('请输入项目名称', 'This field is required.'),
                }],
                initialValue: this.state.projectDatas.name,
              })(
                <Input
                  label="项目名称"
                  placeholder={Choerodon.getMessage('项目名称', 'Project Name')}
                  style={{ width: inputWidth }}
                />,
              )}
            </FormItem>
          </Form>
        </Content>
      );
    }
  }

  render() {
    const { ProjectStore, AppState } = this.props;
    const projectData = ProjectStore.getProjectData;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    const orgname = menuType.name;
    const { checkCode, checkName } = this.state;
    const buttonStyle = checkCode && checkName && this.props.form.getFieldValue('name')
      && this.props.form.getFieldValue('code');
    const type = menuType.type;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 100 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 22 },
      },
    };
    const columns = [{
      title: Choerodon.getMessage('项目名称', 'project code'),
      dataIndex: 'name',
      key: 'name',
      filters: [],
      sorter: (a, b) => (a.name > b.name ? 1 : 0),
      render: (text, record) => <span>{text}</span>,
    }, {
      title: Choerodon.getMessage('项目编码', 'project code'),
      dataIndex: 'code',
      filters: [],
      key: 'code',
      sorter: (a, b) => (a.code > b.code ? 1 : 0),
    }, {
      title: Choerodon.getMessage('启用状态', 'status'),
      dataIndex: 'enabled',
      filters: [{
        text: '启用',
        value: '启用',
      }, {
        text: '停用',
        value: '停用',
      }],
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
            <Popover
              trigger="hover"
              content="修改"
              placement="bottom"
            >
              <Button
                shape="circle"
                onClick={this.handleopenTab.bind(this, record, 'edit')}
              >
                <span className="icon-mode_edit" />
              </Button>
            </Popover>
          </Permission>
          {(record.enabled ?
            <Permission service={['iam-service.organization-project.disableProject']} type={type} organizationId={orgId}>
              <Popover
                trigger="hover"
                content="停用"
                placement="bottom"
              >
                <Button
                  shape="circle"
                  onClick={this.handleEnable.bind(this, record)}
                >
                  <span
                    className={record.enabled ? 'icon-remove_circle_outline' : 'icon-finished'}
                  />
                </Button>
              </Popover>
            </Permission> :
            <Permission service={['iam-service.organization-project.enableProject']} type={type} organizationId={orgId}>
              <Popover
                trigger="hover"
                content="启用"
                placement="bottom"
              >
                <Button
                  shape="circle"
                  onClick={this.handleEnable.bind(this, record)}
                >
                  <span
                    className={record.enabled ? 'icon-remove_circle_outline' : 'icon-finished'}
                  />
                </Button>
              </Popover>
            </Permission>)}
        </div>
      ),
    }];
    // const pageStyle = classNames({
    //   'page-large': !this.state.operation,
    //   'page-small': this.state.operation,
    // });

    return (
      <Page>
        <Header title={Choerodon.getMessage('项目管理', 'project title')}>
          <Permission service={['iam-service.organization-project.create']} type={type} organizationId={orgId}>
            <Button
              onClick={this.handleopenTab.bind(this, null, 'create')}
              icon="playlist_add"
            >
              {Choerodon.getMessage('创建项目', 'create')}
            </Button>
          </Permission>
          <Permission service={['iam-service.organization-project.list']} type={type} organizationId={orgId}>
            <Button
              icon="refresh"
              onClick={() => {
                const { pagination, sort } = this.state;
                this.loadProjects(pagination, sort);
              }}
            >
              {Choerodon.getMessage('刷新', 'flush')}
            </Button>
          </Permission>
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
            onChange={this.handlePageChange.bind(this)}
            loading={ProjectStore.isLoading}
            filterBarPlaceholder="过滤表"
          />
          <Sidebar
            title={this.renderSideTitle()}
            visible={this.state.sidebar}
            onCancel={this.handleTabClose.bind(this)}
            onOk={this.handleSubmit.bind(this)}
            okText={this.state.operation === 'create' ? '创建' : '保存'}
            cancelText="取消"
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
export default Form.create({})(withRouter(ProjectHome));
