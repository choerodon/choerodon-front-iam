import React, { Component } from 'react';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, IconSelect, Input, Modal, Select, Table, Tabs, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { FormattedMessage, injectIntl } from 'react-intl';
import './DashboardSetting.scss';

const { Sidebar } = Modal;

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

  handleRefresh = () => {
    this.props.DashboardSettingStore.refresh();
  };

  handleOk = () => {
    const { form, intl, DashboardStore, DashboardSettingStore } = this.props;
    form.validateFields((error, values, modify) => {
      if (!error) {
        if (modify) {
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
    this.props.DashboardSettingStore.loadData(pagination, filters, sort, params);
  }

  editCard(record) {
    const { DashboardSettingStore, form } = this.props;
    form.resetFields();
    DashboardSettingStore.setEditData(record);
    DashboardSettingStore.showSideBar();
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
        filters: [],
        filteredValue: filters.name || [],
        sorter: true,
        sortOrder: columnKey === 'name' && order,
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.code`} />,
        dataIndex: 'code',
        key: 'code',
        filters: [],
        filteredValue: filters.code || [],
        sorter: true,
        sortOrder: columnKey === 'code' && order,
        render: (text, { namespace }) => `${namespace}-${text}`,
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

  renderForm() {
    const {
      form: { getFieldDecorator }, intl,
      DashboardSettingStore: { editData: { code, name, level, icon, title, namespace } },
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
                  ref={(e) => { this.editFocusInput = e; }}
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
                />,
              )
            }
          </FormItem>
          <FormItem {...formItemLayout}>
            {
              getFieldDecorator('icon', {
                initialValue: icon,
              })(
                <IconSelect
                  label={<FormattedMessage id={`${intlPrefix}.icon`} />}
                  style={{ width: inputWidth }}
                />,
              )
            }
          </FormItem>
        </Form>
      </Content>
    );
  }

  render() {
    const { DashboardSettingStore } = this.props;
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
