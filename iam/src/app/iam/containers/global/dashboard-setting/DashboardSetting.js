import React, { Component } from 'react';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, IconSelect, Input, Modal, Select, Table, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { FormattedMessage, injectIntl } from 'react-intl';
import './DashboardSetting.scss';
import MouseOverWrapper from '../../../components/mouseOverWrapper';
import RoleStore from '../../../stores/global/role/RoleStore';

const { Sidebar } = Modal;
const { Option } = Select;

const intlPrefix = 'global.dashboard-setting';
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};
const inputWidth = 512;

@Form.create({})
@injectIntl
@inject('AppState')
@observer
class DashboardSetting extends Component {
  constructor(props) {
    super(props);
    this.editFocusInput = React.createRef();
  }

  componentWillMount() {
    this.fetchData();
  }

  handleRoleClick = () => {
    const { DashboardSettingStore } = this.props;
    DashboardSettingStore.setNeedUpdateRoles(true);
    DashboardSettingStore.setNeedRoles(!DashboardSettingStore.needRoles);
  };

  handleRefresh = () => {
    this.props.DashboardSettingStore.refresh();
  };

  handleOk = () => {
    const { form, intl, DashboardStore, DashboardSettingStore } = this.props;
    form.validateFields((error, values, modify) => {
      if (!error) {
        if (modify || DashboardSettingStore.needUpdateRoles) {
          DashboardSettingStore.updateData(values).then((data) => {
            if (DashboardStore) {
              DashboardStore.updateCachedData(data);
            }
            Choerodon.prompt(intl.formatMessage({ id: 'modify.success' }));
          });
        } else {
          Choerodon.prompt(intl.formatMessage({ id: 'modify.success' }));
        }
      }
    });
  };

  handleCancel = () => {
    this.props.DashboardSettingStore.hideSideBar();
  };

  handleTableChange = (pagination, filters, sort, params) => {
    this.fetchData(pagination, filters, sort, params);
  };

  fetchData(pagination, filters, sort, params) {
    const { DashboardSettingStore } = this.props;
    this.props.DashboardSettingStore.loadData(pagination, filters, sort, params);
    RoleStore.loadRole({ pageSize: 999 }, {}, {}).then((data) => {
      data.content.forEach((v) => {
        DashboardSettingStore.roleMap.set(v.id, v);
      });
    });
  }

  editCard(record) {
    const { DashboardSettingStore, form } = this.props;
    DashboardSettingStore.setNeedRoles(record.needRoles);
    RoleStore.loadRole({ pageSize: 999 }, {}, { level: record.level }).then((data) => {
      RoleStore.setRoles(data.content);
    });
    DashboardSettingStore.setEditData(record);
    DashboardSettingStore.showSideBar();
    form.resetFields();
    setTimeout(() => {
      this.editFocusInput.input.focus();
    }, 10);
  }

  getTableColumns() {
    const { intl, DashboardSettingStore: { sort: { columnKey, order }, filters } } = this.props;
    return [
      {
        title: <FormattedMessage id={`${intlPrefix}.name`} />,
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        filters: [],
        filteredValue: filters.name || [],
        sorter: true,
        sortOrder: columnKey === 'name' && order,
        render: text => (
          <MouseOverWrapper text={text} width={0.1}>
            {text}
          </MouseOverWrapper>
        ),
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.code`} />,
        dataIndex: 'code',
        key: 'code',
        width: '20%',
        filters: [],
        filteredValue: filters.code || [],
        sorter: true,
        sortOrder: columnKey === 'code' && order,
        render: (text, { namespace }) => `${namespace}-${text}`,
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.card.title`} />,
        dataIndex: 'title',
        key: 'title',
        filters: [],
        filteredValue: filters.title || [],
        sorter: true,
        sortOrder: columnKey === 'title' && order,
        render: text => (
          <MouseOverWrapper text={text} width={0.1}>
            {text}
          </MouseOverWrapper>
        ),
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.icon`} />,
        dataIndex: 'icon',
        key: 'icon',
        render: text => (
          <Icon type={text} style={{ fontSize: 20 }} />
        ),
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.level`} />,
        dataIndex: 'level',
        key: 'level',
        filters: [
          {
            text: intl.formatMessage({ id: `${intlPrefix}.level.site` }),
            value: 'site',
          }, {
            text: intl.formatMessage({ id: `${intlPrefix}.level.organization` }),
            value: 'organization',
          }, {
            text: intl.formatMessage({ id: `${intlPrefix}.level.project` }),
            value: 'project',
          },
        ],
        filteredValue: filters.level || [],
        sorter: true,
        sortOrder: columnKey === 'level' && order,
        render: text => (
          <FormattedMessage id={`${intlPrefix}.level.${text}`} />
        ),
      },
      {
        title: '',
        width: 100,
        key: 'action',
        align: 'right',
        render: (text, record) => (
          <Permission service={['iam-service.dashboard.update']}>
            <Tooltip
              title={<FormattedMessage id="edit" />}
              placement="bottom"
            >
              <Button
                shape="circle"
                icon="mode_edit"
                size="small"
                onClick={() => this.editCard(record)}
              />
            </Tooltip>
          </Permission>
        ),
      },
    ];
  }

  renderRoleSelect = () => {
    const roles = RoleStore.getRoles;
    return roles.map(item =>
      <Option key={item.id} value={item.id}>{item.name}</Option>);
  };

  renderForm() {
    const roles = RoleStore.getRoles;
    const {
      form: { getFieldDecorator }, intl,
      DashboardSettingStore: { editData: { code, name, level, icon, title, namespace, roleIds }, needRoles },
    } = this.props;
    return (
      <Content
        className="dashboard-setting-siderbar-content"
        code={`${intlPrefix}.modify`}
        values={{ name }}
      >
        <Form>
          {
            getFieldDecorator('code', {
              rules: [
                {
                  required: true,
                },
              ],
              initialValue: code,
            })(
              <input type="hidden" />,
            )
          }
          <FormItem {...formItemLayout} className="is-required">
            <Input
              autoComplete="off"
              label={<FormattedMessage id={`${intlPrefix}.code`} />}
              style={{ width: inputWidth }}
              value={`${namespace}-${code}`}
              disabled
            />
          </FormItem>
          <FormItem {...formItemLayout}>
            {
              getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: intl.formatMessage({ id: `${intlPrefix}.name.required` }),
                  },
                ],
                initialValue: name,
              })(
                <Input
                  autoComplete="off"
                  label={<FormattedMessage id={`${intlPrefix}.name`} />}
                  style={{ width: inputWidth }}
                  ref={(e) => {
                    this.editFocusInput = e;
                  }}
                  maxLength={32}
                  showLengthInfo={false}
                />,
              )
            }
          </FormItem>
          <FormItem {...formItemLayout}>
            {
              getFieldDecorator('title', {
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: intl.formatMessage({ id: `${intlPrefix}.card.title.required` }),
                  },
                ],
                initialValue: title,
              })(
                <Input
                  autoComplete="off"
                  label={<FormattedMessage id={`${intlPrefix}.card.title`} />}
                  style={{ width: inputWidth }}
                  maxLength={32}
                  showLengthInfo={false}
                />,
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('roleIds', {
              valuePropName: 'value',
              initialValue: roleIds && roleIds.slice(),
            })(
              <Select
                mode="multiple"
                label={<FormattedMessage id={`${intlPrefix}.role`} />}
                size="default"
                getPopupContainer={() => document.getElementsByClassName('page-content')[0]}
                style={{
                  width: '512px',
                  display: needRoles ? 'inline-block' : 'none',
                }}
              >
                {this.renderRoleSelect()}
              </Select>,
            )}
            <Button
              size="small"
              icon="delete"
              shape="circle"
              onClick={this.handleRoleClick}
              className={'delete-role'}
              style={{
                display: needRoles ? 'inline-block' : 'none',
              }}
            />
            <Button
              type="primary"
              funcType="raised"
              onClick={this.handleRoleClick}
              style={{
                display: !needRoles ? 'inline-block' : 'none',
              }}
            ><FormattedMessage id={`${intlPrefix}.open-role`} /></Button>
          </FormItem>
          <FormItem {...formItemLayout}>
            {
              getFieldDecorator('icon', {
                initialValue: icon,
              })(
                <IconSelect
                  label={<FormattedMessage id={`${intlPrefix}.icon`} />}
                  style={{ width: inputWidth }}
                  showArrow
                />,
              )
            }
          </FormItem>
        </Form>
      </Content>
    );
  }

  render() {
    const { DashboardSettingStore, intl } = this.props;
    const { pagination, params, loading, dashboardData, sidebarVisible } = DashboardSettingStore;
    return (
      <Page
        service={[
          'iam-service.dashboard.list',
          'iam-service.dashboard.query',
          'iam-service.dashboard.update',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code={intlPrefix}>
          <Table
            loading={loading}
            className="dashboard-table"
            columns={this.getTableColumns()}
            dataSource={dashboardData.slice()}
            pagination={pagination}
            filters={params}
            onChange={this.handleTableChange}
            rowKey={({ code, namespace }) => `${namespace}-${code}`}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.sidebar.title`} />}
            onOk={this.handleOk}
            okText={<FormattedMessage id="save" />}
            cancelText={<FormattedMessage id="cancel" />}
            onCancel={this.handleCancel}
            visible={sidebarVisible}
          >
            {this.renderForm()}
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Choerodon.dashboard ? inject('DashboardStore')(DashboardSetting) : DashboardSetting;
