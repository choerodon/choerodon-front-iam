import React, { Component } from 'react';
import { Button, Form, Modal, Table, Tooltip, Radio, Select, Input } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import './Application.scss';
import MouseOverWrapper from '../../../components/mouseOverWrapper';
import StatusTag from '../../../components/statusTag';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const intlPrefix = 'organization.application';
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
const isNum = /^\d+$/;

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class Application extends Component {
  componentDidMount() {
    this.refresh();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { AppState, ApplicationStore: { operation, editData }, ApplicationStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    let data;
    if (operation === 'create') {
      const { validateFields } = this.props.form;
      validateFields((err, { applicationCategory, applicationType, code, name, projectId }) => {
        if (!err) {
          data = {
            applicationCategory,
            applicationType,
            code,
            name: name.trim(),
            projectId,
            enabled: true,
          };
          ApplicationStore.setSubmitting(true);
          ApplicationStore.createApplication(data)
            .then((value) => {
              ApplicationStore.setSubmitting(false);
              if (value) {
                Choerodon.prompt(this.props.intl.formatMessage({ id: 'create.success' }));
                this.handleTabClose();
                ApplicationStore.loadData();
              }
            }).catch((error) => {
              this.handleTabClose();
              Choerodon.handleResponseError(error);
            });
        }
      });
    } else if (operation === 'edit') {
      const { validateFields } = this.props.form;
      validateFields((err, validated) => {
        if (!err) {
          if (this.shouldShowProjectsSelect()) {
            data = {
              ...editData,
              name: validated.name.trim(),
              projectId: validated.projectId,
            };
          } else {
            data = {
              ...editData,
              name: validated.name.trim(),
            };
          }
          ApplicationStore.updateApplication(data, editData.id)
            .then((value) => {
              ApplicationStore.setSubmitting(false);
              if (value) {
                Choerodon.prompt(this.props.intl.formatMessage({ id: 'save.success' }));
                this.handleTabClose();
                ApplicationStore.loadData();
              }
            }).catch((error) => {
              this.handleTabClose();
              Choerodon.handleResponseError(error);
            });
        }
      });
    }
  };

  refresh = () => {
    const { ApplicationStore } = this.props;
    ApplicationStore.refresh();
  }

  renderSideTitle() {
    switch (this.props.ApplicationStore.operation) {
      case 'create': return <FormattedMessage id={`${intlPrefix}.create`} />;
      case 'edit': return <FormattedMessage id={`${intlPrefix}.modify`} />;
      default: return <FormattedMessage id={`${intlPrefix}.config-sub-project`} />;
    }
  }

  /**
   * 校验应用编码唯一性
   * @param value 应用编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    const { ApplicationStore, intl, ApplicationStore: { editData } } = this.props;
    const params = { code: value };
    if (editData.code === value) callback();
    if (ApplicationStore.operation === 'edit') callback();
    ApplicationStore.checkApplicationCode(params)
      .then((mes) => {
        if (mes.failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.code.exist.msg` }));
        } else {
          callback();
        }
      }).catch((err) => {
        callback('校验超时');
        Choerodon.handleResponseError(err);
      });
  };

  /**
   * 校验应用名称唯一性
   * @param value 应用编码
   * @param callback 回调函数
   */
  checkName = (rule, value, callback) => {
    const { ApplicationStore, intl, ApplicationStore: { editData } } = this.props;
    const params = { name: value };
    if (editData.name === value) callback();
    ApplicationStore.checkApplicationCode(params)
      .then((mes) => {
        if (mes.failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.name.exist.msg` }));
        } else {
          callback();
        }
      }).catch((err) => {
        callback('校验超时');
        Choerodon.handleResponseError(err);
      });
  };

  getSidebarContentInfo(operation) {
    const { AppState, ApplicationStore } = this.props;
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
          code: `${intlPrefix}.edit`,
          values: {
            name: ApplicationStore.editData && ApplicationStore.editData.name,
          },
        };
      default:
        return {
          code: `${intlPrefix}.config-sub-project`,
        };
    }
  }

  shouldShowProjectsSelect() {
    const { ApplicationStore: { operation, editData }, form } = this.props;
    if (operation === 'create') {
      if (form.getFieldValue('applicationCategory') !== 'application-group') return true;
    } else {
      return (editData && editData.applicationCategory !== 'application-group');
    }
  }

  renderSidebarContent() {
    const { intl, ApplicationStore, form } = this.props;
    const { getFieldDecorator } = form;
    const { operation, projectData, editData } = ApplicationStore;
    const inputWidth = 512;
    const contentInfo = this.getSidebarContentInfo(operation);
    return (
      <Content
        {...contentInfo}
        className="sidebar-content"
      >
        {operation === 'edit' && editData &&
        <p>应用类别：{intl.formatMessage({ id: `${intlPrefix}.category.${editData.applicationCategory.toLowerCase()}` })}</p>
        }
        <Form layout="vertical" className="rightForm" style={{ width: 512 }}>
          {operation === 'create' && !editData &&
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('applicationCategory', {
                initialValue: 'application',
              })(
                <RadioGroup label={<FormattedMessage id={`${intlPrefix}.category`} />} className="c7n-iam-application-radiogroup">
                  {
                    ['application', 'application-group'].map(value => <Radio value={value} key={value}>{intl.formatMessage({ id: `${intlPrefix}.category.${value.toLowerCase()}` })}</Radio>)
                  }
                </RadioGroup>,
              )}
            </FormItem>
          }
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('applicationType', {
              initialValue: editData ? editData.applicationType : 'development-application',
            })(
              <Select disabled={operation === 'edit'} getPopupContainer={that => that} label={<FormattedMessage id={`${intlPrefix}.type`} />} className="c7n-iam-application-radiogroup">
                {
                  ['development-application', 'test-application'].map(value => <Option value={value} key={value}>{intl.formatMessage({ id: `${intlPrefix}.type.${value.toLowerCase()}` })}</Option>)
                }
              </Select>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('code', {
              initialValue: editData ? editData.code : null,
              rules: [{
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.code.require.msg` }),
              }, {
                pattern: /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
                message: intl.formatMessage({ id: `${intlPrefix}.code.format.msg` }),
              }, {
                validator: this.checkCode,
              }],
              validateTrigger: 'onBlur',
              validateFirst: true,
            })(
              <Input
                disabled={operation === 'edit'}
                autoComplete="off"
                label={<FormattedMessage id={`${intlPrefix}.code`} />}
                style={{ width: inputWidth }}
                ref={(e) => { this.createFocusInput = e; }}
                maxLength={14}
                showLengthInfo={false}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              initialValue: editData ? editData.name : null,
              rules: [{
                required: true,
                message: intl.formatMessage({ id: `${intlPrefix}.name.require.msg` }),
              }, {
                pattern: /^[^\s]*$/,
                message: intl.formatMessage({ id: `${intlPrefix}.whitespace.msg` }),
              }, {
                validator: this.checkName,
              }],
              validateTrigger: 'onBlur',
              validateFirst: true,
            })(
              <Input
                autoComplete="off"
                label={<FormattedMessage id={`${intlPrefix}.name`} />}
                style={{ width: inputWidth }}
                ref={(e) => { this.editFocusInput = e; }}
                maxLength={14}
                showLengthInfo={false}
              />,
            )}
          </FormItem>
          {this.shouldShowProjectsSelect() && <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('projectId', {
              initialValue: editData && editData.projectId !== 0 && editData.projectId,
            })(
              <Select
                label={<FormattedMessage id={`${intlPrefix}.assignment`} />}
                className="c7n-iam-application-radiogroup"
                getPopupContainer={that => that}
                filterOption={(input, option) => {
                  const childNode = option.props.children;
                  if (childNode && React.isValidElement(childNode)) {
                    return childNode.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  }
                  return false;
                }}
                disabled={(editData && !!editData.projectId)}
                filter
              >
                {
                  projectData.map(({ id, name, code }) => <Option value={id} key={id} title={name}>
                    <Tooltip title={code} placement="right" align={{ offset: [20, 0] }}>
                      <span style={{ display: 'inline-block', width: '100%' }}>{name}</span>
                    </Tooltip>
                  </Option>)
                }
              </Select>,
            )}
          </FormItem>}
        </Form>
      </Content>
    );
  }

  /* 分页处理 */
  handlePageChange = (pagination, filters, sorter, params) => {
    this.props.ApplicationStore.loadData(pagination, filters, sorter, params);
  }

  handleopenTab = (record, operation) => {
    const { ApplicationStore } = this.props;
    ApplicationStore.setEditData(record);
    ApplicationStore.setOperation(operation);
    ApplicationStore.showSidebar();
  };

  handleTabClose = () => {
    this.props.ApplicationStore.closeSidebar();
    this.props.ApplicationStore.setEditData(null);
    this.props.form.resetFields();
  };

  handleEnable = (record) => {
    const { ApplicationStore } = this.props;
    if (record.enabled) {
      ApplicationStore.disableApplication(record.id).then(() => {
        ApplicationStore.loadData();
      });
    } else {
      ApplicationStore.enableApplication(record.id).then(() => {
        ApplicationStore.loadData();
      });
    }
  };

  render() {
    const { ApplicationStore: { filters, operation, pagination, params, sidebarVisible, submitting }, AppState, intl, ApplicationStore, ApplicationStore: { applicationData } } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    const type = menuType.type;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.name`} />,
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.code`} />,
      dataIndex: 'code',
      key: 'code',
      width: '20%',
      filters: [],
      filteredValue: filters.code || [],
      render: text => (
        <MouseOverWrapper text={text} width={0.15}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id={`${intlPrefix}.category`} />,
      dataIndex: 'applicationCategory',
      key: 'applicationCategory',
      // width: '25%',
      render: category => (<StatusTag mode="icon" name={intl.formatMessage({ id: `${intlPrefix}.category.${category.toLowerCase()}` })} iconType={category === 'application' ? '' : ''} />),
      // filters: filtersType,
      // filteredValue: filters.typeName || [],
    }, {
      title: <FormattedMessage id={`${intlPrefix}.application-type`} />,
      dataIndex: 'applicationType',
      // filters: [],
      // filteredValue: filters.name || [],
      key: 'applicationType',
      width: '20%',
      render: text => (
        <MouseOverWrapper text={text} width={0.2}>
          {intl.formatMessage({ id: `${intlPrefix}.type.${text}` })}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'enabled',
      width: '15%',
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
      width: '120px',
      align: 'right',
      render: (text, record) => (
        <div>
          <Permission service={['iam-service.application.update']} type={type} organizationId={orgId}>
            <Tooltip
              title={<FormattedMessage id="modify" />}
              placement="bottom"
            >
              <Button
                shape="circle"
                size="small"
                onClick={e => this.handleopenTab(record, 'edit')}
                icon="mode_edit"
              />
            </Tooltip>
          </Permission>
          <Permission
            service={['iam-service.application.disable', 'iam-service.application.enabled']}
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
                onClick={e => this.handleEnable(record)}
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
          'iam-service.application.pagingQuery',
          'iam-service.application.create',
          'iam-service.application.types',
          'iam-service.application.update',
          'iam-service.application.disable',
          'iam-service.application.enabled',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Permission service={['iam-service.application.create']} type={type} organizationId={orgId}>
            <Button
              onClick={e => this.handleopenTab(null, 'create')}
              icon="playlist_add"
            >
              <FormattedMessage id={`${intlPrefix}.create`} />
            </Button>
          </Permission>
          <Button
            icon="refresh"
            onClick={this.refresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={intlPrefix}
        >
          <Table
            pagination={pagination}
            columns={columns}
            dataSource={applicationData}
            rowKey={record => record.id}
            filters={params}
            onChange={this.handlePageChange}
            loading={ApplicationStore.isLoading}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.sidebar.title.${operation}`} />}
            visible={sidebarVisible}
            onCancel={this.handleTabClose}
            onOk={this.handleSubmit}
            okText={<FormattedMessage id={operation === 'create' ? 'create' : 'save'} />}
            cancelText={<FormattedMessage id="cancel" />}
            confirmLoading={submitting}
            className="c7n-iam-project-sidebar"
          >
            {this.renderSidebarContent()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
