import React, { Component } from 'react';
import { runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Input, Modal, Table, Tooltip, Row, Col } from 'choerodon-ui';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { FormattedMessage, injectIntl } from 'react-intl';
import classnames from 'classnames';
import MouseOverWrapper from '../../../components/mouseOverWrapper';
import StatusTag from '../../../components/statusTag';
import './Organization.scss';

const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';
const { Sidebar } = Modal;
const FormItem = Form.Item;
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
const intlPrefix = 'global.organization';

@Form.create()
@withRouter
@injectIntl
@inject('AppState', 'HeaderStore')
@observer
export default class Organization extends Component {
  constructor(props) {
    super(props);
    this.editOrgFocusInput = React.createRef();
    this.creatOrgFocusInput = React.createRef();
  }

  componentWillMount() {
    this.loadOrganizations();
  }

  handleRefresh = () => {
    const { OrganizationStore } = this.props;
    OrganizationStore.refresh();
  };

  loadOrganizations(pagination, filters, sort, params) {
    const { OrganizationStore } = this.props;
    OrganizationStore.loadData(pagination, filters, sort, params);
  }

  // 创建组织侧边
  createOrg = () => {
    const { form, OrganizationStore } = this.props;
    form.resetFields();
    runInAction(() => {
      OrganizationStore.show = 'create';
      OrganizationStore.showSideBar();
    });
    setTimeout(() => {
      this.creatOrgFocusInput.input.focus();
    }, 10);
  };

  handleEdit = (data) => {
    const { form, OrganizationStore } = this.props;
    form.resetFields();
    runInAction(() => {
      OrganizationStore.show = 'edit';
      OrganizationStore.setEditData(data);
      OrganizationStore.showSideBar();
    });
    setTimeout(() => {
      this.editOrgFocusInput.input.focus();
    }, 10);
  };

  showDetail = (data) => {
    const { OrganizationStore } = this.props;
    runInAction(() => {
      OrganizationStore.setEditData(data);
      OrganizationStore.loadOrgDetail(data.id).then((message) => {
        if (message) {
          Choerodon.prompt(message);
        }
      });
      OrganizationStore.show = 'detail';
    });
  }


  handleSubmit = (e) => {
    e.preventDefault();
    const { form, intl, OrganizationStore, HeaderStore } = this.props;
    if (OrganizationStore.show !== 'detail') {
      form.validateFields((err, values, modify) => {
        Object.keys(values).forEach((key) => {
          // 去除form提交的数据中的全部前后空格
          if (typeof values[key] === 'string') values[key] = values[key].trim();
        });
        if (!err) {
          OrganizationStore.createOrUpdateOrg(values, modify, HeaderStore)
            .then((message) => {
              OrganizationStore.hideSideBar();
              Choerodon.prompt(intl.formatMessage({ id: message }));
            });
        }
      });
    } else {
      OrganizationStore.hideSideBar();
    }
  };

  handleCancelFun = () => {
    const { OrganizationStore } = this.props;
    OrganizationStore.hideSideBar();
  };

  handleDisable = ({ enabled, id }) => {
    const { intl, OrganizationStore, HeaderStore, AppState } = this.props;
    const userId = AppState.getUserId;
    OrganizationStore.toggleDisable(id, enabled)
      .then(() => {
        Choerodon.prompt(intl.formatMessage({ id: enabled ? 'disable.success' : 'enable.success' }));
        HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId);
      }).catch(Choerodon.handleResponseError);
  };

  /**
   * 组织编码校验
   * @param rule 表单校验规则
   * @param value 组织编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    const { intl, OrganizationStore } = this.props;
    OrganizationStore.checkCode(value)
      .then(({ failed }) => {
        if (failed) {
          callback(intl.formatMessage({ id: 'global.organization.onlymsg' }));
        } else {
          callback();
        }
      });
  };

  renderSidebarTitle() {
    const { show } = this.props.OrganizationStore;
    switch (show) {
      case 'create':
        return 'global.organization.create';
      case 'edit':
        return 'global.organization.modify';
      case 'detail':
        return 'global.organization.detail';
      default:
        return '';
    }
  }

  // 渲染侧边栏成功按钮文字
  renderSidebarOkText() {
    const { OrganizationStore: { show } } = this.props;
    if (show === 'create') {
      return <FormattedMessage id="create" />;
    } else if (show === 'edit') {
      return <FormattedMessage id="save" />;
    } else {
      return <FormattedMessage id="close" />;
    }
  }

  renderSidebarDetail() {
    const { intl: { formatMessage }, OrganizationStore: { editData, partDetail } } = this.props;
    const infoList = [{
      key: formatMessage({ id: `${intlPrefix}.name` }),
      value: editData.name,
    }, {
      key: formatMessage({ id: `${intlPrefix}.code` }),
      value: editData.code,
    }, {
      key: formatMessage({ id: `${intlPrefix}.region` }),
      value: editData.address ? editData.address : '无',
    }, {
      key: formatMessage({ id: `${intlPrefix}.owner.login.name` }),
      value: partDetail.ownerLoginName,
    }, {
      key: formatMessage({ id: `${intlPrefix}.owner.user.name` }),
      value: partDetail.ownerRealName,
    }, {
      key: formatMessage({ id: `${intlPrefix}.phone` }),
      value: partDetail.ownerPhone ? partDetail.ownerPhone : '无',
    }, {
      key: formatMessage({ id: `${intlPrefix}.mailbox` }),
      value: partDetail.ownerEmail,
    }];
    return (
      <Content
        className="sidebar-content"
        code={'global.organization.detail'}
        values={{ name: `${editData.code}` }}
      >
        {
          infoList.map(({ key, value }) =>
            <Row key={key} className={classnames('c7n-organization-detail-row', { 'c7n-organization-detail-row': value === null })}>
              <Col span={3}>{key}:</Col>
              <Col span={21}>{value}</Col>
            </Row>,
          )
        }
      </Content>
    );
  }

  renderSidebarContent() {
    const { intl, form: { getFieldDecorator }, OrganizationStore: { show, editData }, AppState } = this.props;

    return (
      <Content
        className="sidebar-content"
        code={show === 'create' ? 'global.organization.create' : 'global.organization.modify'}
        values={{ name: show === 'create' ? `${AppState.getSiteInfo.systemName || 'Choerodon'}` : `${editData.code}` }}
      >
        <Form>
          {
            show === 'create' && (
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('code', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: intl.formatMessage({ id: 'global.organization.coderequiredmsg' }),
                  }, {
                    max: 15,
                    message: intl.formatMessage({ id: 'global.organization.codemaxmsg' }),
                  }, {
                    pattern: /^[a-z](([a-z0-9]|-(?!-))*[a-z0-9])*$/,
                    message: intl.formatMessage({ id: 'global.organization.codepatternmsg' }),
                  }, {
                    validator: this.checkCode,
                  }],
                  validateTrigger: 'onBlur',
                  validateFirst: true,
                })(
                  <Input
                    ref={(e) => {
                      this.creatOrgFocusInput = e;
                    }}
                    label={<FormattedMessage id="global.organization.code" />}
                    autoComplete="off"
                    style={{ width: inputWidth }}
                    maxLength={15}
                    showLengthInfo={false}
                  />,
                )}
              </FormItem>
            )
          }
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [{ required: true, message: intl.formatMessage({ id: 'global.organization.namerequiredmsg' }), whitespace: true }],
              validateTrigger: 'onBlur',
              initialValue: show === 'create' ? undefined : editData.name,
            })(
              <Input
                ref={(e) => {
                  this.editOrgFocusInput = e;
                }}
                label={<FormattedMessage id="global.organization.name" />}
                autoComplete="off"
                style={{ width: inputWidth }}
                maxLength={32}
                showLengthInfo={false}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {
              getFieldDecorator('address', {
                rules: [],
                initialValue: show === 'create' ? undefined : editData.address,
              })(
                <Input
                  label={<FormattedMessage id="global.organization.region" />}
                  autoComplete="off"
                  style={{ width: inputWidth }}
                />,
              )}
          </FormItem>
        </Form>
      </Content>
    );
  }

  handlePageChange = (pagination, filters, sorter, params) => {
    this.loadOrganizations(pagination, filters, sorter, params);
  };

  getTableColumns() {
    const { intl, OrganizationStore: { sort: { columnKey, order }, filters } } = this.props;
    return [{
      title: <FormattedMessage id="name" />,
      dataIndex: 'name',
      key: 'name',
      filters: [],
      width: '35%',
      render: text => (
        <MouseOverWrapper text={text} width={0.3}>
          {text}
        </MouseOverWrapper>
      ),
      sortOrder: columnKey === 'name' && order,
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="code" />,
      dataIndex: 'code',
      key: 'code',
      filters: [],
      sortOrder: columnKey === 'code' && order,
      filteredValue: filters.code || [],
      width: '20%',
      render: text => (
        <MouseOverWrapper text={text} width={0.3}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="global.organization.project.count" />,
      dataIndex: 'projectCount',
      key: 'projectCount',
      align: 'center',
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [{
        text: intl.formatMessage({ id: 'enable' }),
        value: 'true',
      }, {
        text: intl.formatMessage({ id: 'disable' }),
        value: 'false',
      }],
      filteredValue: filters.enabled || [],
      render: enabled => (<StatusTag mode="icon" name={intl.formatMessage({ id: enabled ? 'enable' : 'disable' })} colorCode={enabled ? 'COMPLETED' : 'FAILED'} />),
    }, {
      title: '',
      width: 150,
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <div className="operation">
          <Permission service={['iam-service.organization.update']}>
            <Tooltip
              title={<FormattedMessage id="modify" />}
              placement="bottom"
            >
              <Button
                size="small"
                icon="mode_edit"
                shape="circle"
                onClick={this.handleEdit.bind(this, record)}
              />
            </Tooltip>
          </Permission>
          <Permission service={['iam-service.organization.disableOrganization', 'iam-service.organization.enableOrganization']}>
            <Tooltip
              title={<FormattedMessage id={record.enabled ? 'disable' : 'enable'} />}
              placement="bottom"
            >
              <Button
                size="small"
                icon={record.enabled ? 'remove_circle_outline' : 'finished'}
                shape="circle"
                onClick={() => this.handleDisable(record)}
              />
            </Tooltip>
          </Permission>
          <Permission service={['iam-service.organization.query']}>
            <Tooltip
              title={<FormattedMessage id="detail" />}
              placement="bottom"
            >
              <Button
                shape="circle"
                icon="find_in_page"
                size="small"
                onClick={this.showDetail.bind(this, record)}
              />
            </Tooltip>
          </Permission>
        </div>
      ),
    }];
  }

  render() {
    const {
      intl, OrganizationStore: {
        params, loading, pagination, sidebarVisible, submitting, show, orgData,
      },
      AppState,
    } = this.props;

    return (
      <Page
        service={[
          'iam-service.organization.list',
          'iam-service.organization.query',
          'organization-service.organization.create',
          'iam-service.organization.update',
          'iam-service.organization.disableOrganization',
          'iam-service.organization.enableOrganization',
        ]}
      >
        <Header title={<FormattedMessage id="global.organization.header.title" />}>
          <Permission service={['organization-service.organization.create']}>
            <Button
              onClick={this.createOrg}
              icon="playlist_add"
            >
              <FormattedMessage id="global.organization.create" />
            </Button>
          </Permission>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code="global.organization"
          values={{ name: AppState.getSiteInfo.systemName || 'Choerodon' }}
        >
          <Table
            columns={this.getTableColumns()}
            dataSource={orgData}
            pagination={pagination}
            onChange={this.handlePageChange}
            filters={params}
            loading={loading}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={this.renderSidebarTitle()} />}
            visible={sidebarVisible}
            onOk={this.handleSubmit}
            onCancel={this.handleCancelFun}
            okCancel={show !== 'detail'}
            okText={this.renderSidebarOkText()}
            cancelText={<FormattedMessage id="cancel" />}
            confirmLoading={submitting}
          >
            {show !== 'detail' ? this.renderSidebarContent() : this.renderSidebarDetail()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
