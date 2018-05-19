/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Popover, Modal, Button, Input, Select, Icon, Table, Tooltip, Form, Row, Col, Spin } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import Permission from 'PerComponent';
import Page, { Content, Header } from 'Page';
import ClientSearch from 'ClientSearch';
import classNames from 'classnames';
import axios from 'Axios';
import Action from 'Action';
import HeaderStore from '@/stores/HeaderStore';
import _ from 'lodash';
import './OrganizationHome.scss';
import '../../../../assets/css/main.scss';

const { Sidebar } = Modal
const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';
const Search = Input.Search;
const Option = Select.Option;
const FormItem = Form.Item;

@inject('AppState')
@observer
class OrganizationHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalPages: 0,
      totalElements: 0,
      content: null,
      show: '',
      loading: false,
      editData: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: '',
      },
      sort: '',
    };
  }

  componentWillMount() {
    const { pagination, sort } = this.state;
    this.refresh(pagination, sort);
  }

  refresh(pagination, sort, filters = {
            name: '',
            code: '',
            enabled: '',
          }) {
    this.setState({
      loading: true,
    });
    axios.get(`/iam/v1/organizations?page=${pagination.current - 1}&size=${pagination.pageSize}&sort=${sort}&name=${filters.name}&code=${filters.code}&enabled=${filters.enabled}`)
      .then(data => {
        this.setState({
          pagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
          content: data.content,
          loading: false,
        })
        const { AppState } = this.props;
        const userId = AppState.getUserId;
        HeaderStore.axiosGetOrgAndPro(userId).then((org1) => {
          const org = org1;
          _.forEach(org[0], (item, index) => {
            org[0][index].type = ORGANIZATION_TYPE;
          });
          _.forEach(org[1], (item1, index1) => {
            org[1][index1].type = PROJECT_TYPE;
          });
          HeaderStore.setOrgData(org[0]);
          HeaderStore.setProData(org[1]);
        });
      })
  }
  //创建组织侧边
  createOrg = () => {
    this.setState({
      show: 'create',
    })
  };

  handleEdit = (data) => {
    this.setState({
      show: 'edit',
      editData: data,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { AppState } = this.props;
    const userId = AppState.getUserId;
    if (this.state.show === 'create') {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          axios.post('/org/v1/organizations', JSON.stringify({
            name: values.createName,
            code: values.createCode,
          })).then(() => {
            Choerodon.prompt(Choerodon.getMessage('创建成功', 'Success'));
            const { pagination, sort } = this.state;
            this.refresh(pagination, sort);
            HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
              org[0].map(value => {
                value.type = ORGANIZATION_TYPE;
              })
              org[1].map(value => {
                value.type = PROJECT_TYPE;
              })
              HeaderStore.setOrgData(org[0]);
              HeaderStore.setProData(org[1]);
            })
            this.setState({
              show: '',
            });
          }).catch(err => {
            console.log(err);
          })
        }
      });
    } else {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          axios.put(`/iam/v1/organizations/${this.state.editData.id}`, JSON.stringify({
            name: values.editName,
            objectVersionNumber: this.state.editData.objectVersionNumber,
            code: this.state.editData.code
          })).then(() => {
            Choerodon.prompt(Choerodon.getMessage('修改成功', 'Success'));
            const { pagination, sort } = this.state;
            this.refresh(pagination, sort);
            HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
              org[0].map(value => {
                value.type = ORGANIZATION_TYPE;
              })
              org[1].map(value => {
                value.type = PROJECT_TYPE;
              })
              HeaderStore.setOrgData(org[0]);
              HeaderStore.setProData(org[1]);
            })
            this.setState({
              show: '',
            });
          }).catch(err => {
            console.log(err);
          })
        }
      })
    }
  }

  handleCancelFun = () => {
    this.setState({
      show: '',
    })
  }

  //表格数据整理
  tableFilterData(content, stringName) {
    const obj = [];
    if (content) {
      content.map(value => {
        obj.push({
          text: value[stringName],
          value: typeof value[stringName] == "string" ? value[stringName] : value[stringName].toString(),
        })
      })
    }
    return obj;
  }

  handleSearch(state) {
    const that = this;
    if (state.code === '') {
      axios.get(`/iam/v1/organizations?param=${state.input}`).then((data) => {
        that.setState({
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          content: data.content,
        })
      }).catch((err) => {
        window.console.log(err);
      });
    } else {
      axios.get(`/iam/v1/organizations?${state.code}=${state.input}`).then((data) => {
        that.setState({
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          content: data.content,
        })
      }).catch((err) => {
        window.console.log(err);
      });
    }
  }

  handleDisable(state, id) {
    const { AppState } = this.props;
    const userId = AppState.getUserId;
    if (state) {
      axios.put(`/iam/v1/organizations/${id}/disable`).then((data) => {
        Choerodon.prompt(Choerodon.getMessage('停用成功', 'Success'));
        const { pagination, sort } = this.state;
        this.refresh(pagination, sort);
        HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
          org[0].map(value => {
            value.type = ORGANIZATION_TYPE;
          })
          org[1].map(value => {
            value.type = PROJECT_TYPE;
          })
          HeaderStore.setOrgData(org[0]);
          HeaderStore.setProData(org[1]);
        })
      }).catch((err) => {
        Choerodon.prompt(`操作失败 ${error}`);
      });
    } else {
      axios.put(`/iam/v1/organizations/${id}/enable`).then((data) => {
        Choerodon.prompt(Choerodon.getMessage('启用成功', 'Success'));
        const { pagination, sort } = this.state;
        this.refresh(pagination, sort);
        HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
          org[0].map(value => {
            value.type = ORGANIZATION_TYPE;
          })
          org[1].map(value => {
            value.type = PROJECT_TYPE;
          })
          HeaderStore.setOrgData(org[0]);
          HeaderStore.setProData(org[1]);
        })
      }).catch((err) => {
        Choerodon.prompt(`操作失败 ${error}`);
      });
    }
  }

  renderSidebarTitle() {
    if (this.state.show !== '') {
      if (this.state.show === 'create') {
        return '创建组织'
      } else {
        return '修改组织'
      }
    }
    return '';
  }

  /**
   * 组织编码校验
   * @param rule 表单校验规则
   * @param value 组织编码
   * @param callback 回调函数
   */
  checkcode(rule, value, callback) {
    if (!value) {
      callback(Choerodon.getMessage('请输入组织编码','please input organization code'));
      return;
    }
    if (value.length <= 15) {
      // eslint-disable-next-line no-useless-escape
      const pa =  /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
      if (pa.test(value)) {
        this.checkCodeOnly(value, callback);
      } else {
        callback(Choerodon.getMessage('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾', 'Code can contain only lowercase letters, digits,"-", must start with lowercase letters and will not end with "-"'));
      }
    } else {
      callback(Choerodon.getMessage('组织编码不能超过15个字符','code should less than 15 characters'));
    }
  }

  /**
   * 校验组织编码唯一性
   * @param value 组织编码
   * @param callback 回调函数
   */
  checkCodeOnly = _.debounce((value, callback) => {
    const params = { code: value };
    axios.post(`/iam/v1/organizations/check`, JSON.stringify(params))
      .then((mes) => {
        if (mes.failed) {
          callback(Choerodon.getMessage('组织编码已存在，请输入其他组织编码', 'code existed, please try another'));
        } else {
          callback();
        }
      });
  }, 1000);

  renderSidebarContent() {
    const { getFieldDecorator } = this.props.form;
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
    const inputWidth = 512;
    if (this.state.show !== '') {
      if (this.state.show === 'create') {
        return (
          <Content style={{padding: 0}}
                   title={`在平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”中创建组织`}
                   description="请在下面输入组织编码、组织名称创建组织。组织编码在全平台是唯一的，组织创建后，不能修改组织编码。"
          >
            <Form>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('createCode', {
                  rules: [{
                    required: true,
                    validator: this.checkcode.bind(this),}
                  ],
                })(
                  <Input placeholder="组织编码" label="组织编码" style={{ width: inputWidth }} />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('createName', {
                  rules: [{ required: true, message: '请输入组织名称', whitespace: true }],
                })(
                  <Input placeholder="组织名称" label="组织名称" style={{ width: inputWidth }} />,
                )}
              </FormItem>
            </Form>
          </Content>
        )
      } else {
        return (
          <Content style={{padding: 0}}
            title={`对组织“${this.state.editData.code}”进行修改`}
            description="您可以在此修改组织名称。"
          >
            <Form>
              <FormItem
                {...formItemLayout}
                label="组织名称"
              >
                {getFieldDecorator('editName', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入组织名称'
                  }],
                  initialValue: this.state.editData.name,
                })(
                  <Input label="组织名称" placeholder="组织名称" style={{ width:512 }} />
                )}
              </FormItem>
            </Form>
          </Content>
        )
      }
    }
    return '';
  }
  handlePageChange(pagination, filters, sorter) {
    const newSorter = sorter.columnKey ? sorter.columnKey : '';
    const _filters = {
      name: (filters.name && filters.name[0]) || '',
      code: (filters.code && filters.code[0]) || '',
      enabled: '',
    };
    const enabled = filters.enabled;
    if (enabled && enabled.length) {
      _filters.enabled = enabled[0] === '启用';
    }
    this.refresh(pagination, newSorter, _filters);
  }
  render() {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    const columns = [{
      title: '组织名称',
      dataIndex: 'name',
      key: 'name',
      filters: [],
      sorter: (a, b) => a.name - b.name,
      render: (text, record) => <span>{text}</span>
    }, {
      title: '组织编码',
      dataIndex: 'code',
      filters: [],
      sorter: (a, b) => a.code - b.code,
      key: 'code',
    },{
      title: '启用状态',
      dataIndex: 'enabled',
      filters: [{
        text: '启用',
        value: '启用',
      }, {
        text: '停用',
        value: '停用',
      }],
      key: 'enabled',
      render: (text, record) => {
        return text ? '启用' : '停用'
      }
    },{
      title: "",
      width: '100px',
      key: 'action',
      render: (text, record) => (
        <div className="operation">
          <Permission service={['iam-service.organization.update']} type={type}>
            <Popover
              trigger="hover"
              content="修改"
              placement="bottom"
            >
              <Button
                shape="circle"
                onClick={this.handleEdit.bind(this, record)}
              >
              <span
                className="icon-mode_edit"
              />
              </Button>
            </Popover>
          </Permission>
          {(record.enabled ?
            <Permission service={['iam-service.organization.disableOrganization']} type={type}>
              <Popover
                trigger="hover"
                content='停用'
                placement="bottom"
              >
                <Button
                  shape="circle"
                  onClick={this.handleDisable.bind(this, record.enabled, record.id)}
                >
                <span
                  className={record.enabled ? 'icon-remove_circle_outline' : 'icon-finished'}
                />
                </Button>
              </Popover>
            </Permission> :
            <Permission service={['iam-service.organization.enableOrganization']} type={type}>
              <Popover
                trigger="hover"
                content='启用'
                placement="bottom"
              >
                <Button
                  shape="circle"
                  onClick={this.handleDisable.bind(this, record.enabled, record.id)}
                >
                <span
                  className={record.enabled ? 'icon-remove_circle_outline' : 'icon-finished'}
                />
                </Button>
              </Popover>
            </Permission>)}
        </div>
      )
    }];
    return (
      <Page>
        <Header title={Choerodon.languageChange('organization.title')}>
          <Permission service={['organization-service.organization.create']} type={type}>
            <Button
              onClick={this.createOrg}
              icon="playlist_add"
            >
              {Choerodon.getMessage('创建组织', 'create')}
            </Button>
          </Permission>
          <Permission service={['iam-service.organization.list']} type={type}>
            <Button
              onClick={this.refresh.bind(this, this.state.pagination, this.state.sort, undefined)}
              icon="refresh"
            >
              {Choerodon.languageChange('refresh')}
            </Button>
          </Permission>
        </Header>
        <Content
          title={`平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”的组织管理`}
          description="组织是项目的上一级。通过组织您可以管理项目、用户。您可以创建组织，创建后平台默认您是这个组织的组织管理员。"
        >
          <Table
            columns={columns}
            dataSource={this.state.content}
            pagination={this.state.pagination}
            onChange={this.handlePageChange.bind(this)}
            loading={this.state.loading}
            filterBarPlaceholder="过滤表"
          />
          <Sidebar
            title={this.renderSidebarTitle()}
            visible={this.state.show !== ''}
            onOk={this.handleSubmit.bind(this)}
            onCancel={this.handleCancelFun.bind(this)}
            okText={this.state.show === 'create' ? '创建' : '保存'}
            cancelText="取消"
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
export default Form.create()(withRouter(OrganizationHome));
