import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Table, Modal, Tooltip, Form, DatePicker } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import './Announcement.scss';
import StatusTag from '../../../components/statusTag';
import Editor from '../../../components/editor';

// 匹配html界面为空白的正则。
const patternHTMLEmpty = /^(((<[^>]+>)*\s*)|&nbsp;|\s)*$/g;

const iconType = {
  COMPLETED: 'COMPLETED',
  SENDING: 'RUNNING',
  WAITING: 'UN_START',
  FAILED: 'FAILED',
};

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
const { Sidebar } = Modal;
// 公用方法类
class AnnouncementType {
  constructor(context) {
    this.context = context;
    const { AppState } = this.context.props;
    this.data = AppState.currentMenuType;
    const { type, id, name } = this.data;
    const codePrefix = type === 'organization' ? 'organization' : 'global';

    this.code = `${codePrefix}.msgrecord`;
    this.values = { name: name || 'Choerodon' };
    this.type = type;
    this.orgId = id;
    this.apiPrefix = type === 'organization' ? `/asgard/v1/system_notice/organization/${this.orgId}` : '/asgard/v1/system_notice';
    this.intlPrefix = `${codePrefix}.announcement`;
    this.intlValue = type === 'organization' ? name : AppState.getSiteInfo.systemName || 'Choerodon';
  }
}


@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class Announcement extends Component {
  componentWillMount() {
    this.initAnnouncement();
  }

  initAnnouncement = () => {
    const { AnnouncementStore } = this.props;
    this.announcementType = new AnnouncementType(this);
    AnnouncementStore.setAnnouncementType(this.announcementType);
    AnnouncementStore.loadData();
  };

  getPermission() {
    const { AppState } = this.props;
    const { type } = AppState.currentMenuType;
    let createService = ['asgard-service.system-notification.createNotificationOnSite'];
    let deleteService = ['asgard-service.system-notification.deleteSiteNotification'];
    if (type === 'organization') {
      createService = ['asgard-service.system-notification.createNotificationOnOrg'];
      deleteService = ['asgard-service.system-notification.deleteOrgNotification'];
    }
    return {
      createService,
      deleteService,
    };
  }

  handleTableChange = (pagination, filters, sort, params) => {
    this.fetchData(pagination, filters, sort, params);
  };

  handleOk = () => {
    const { AnnouncementStore: { editorContent, currentRecord }, AnnouncementStore, form, intl } = this.props;
    if (!currentRecord) {
      form.validateFields((err, { date }) => {
        if (!err) {
          AnnouncementStore.setSubmitting(true);
          if (editorContent === null || patternHTMLEmpty.test(editorContent)) {
            AnnouncementStore.setSubmitting(false);
            Choerodon.prompt(intl.formatMessage({ id: 'announcement.content.required' }));
          } else if (editorContent && !patternHTMLEmpty.test(editorContent)) {
            AnnouncementStore.createAnnouncement({
              content: editorContent,
              startTime: date.format('YYYY-MM-DD HH:mm:ss'),
            }).then((data) => {
              AnnouncementStore.setSubmitting(false);
              if (!data.failed) {
                Choerodon.prompt(intl.formatMessage({ id: 'create.success' }));
                this.handleRefresh();
                AnnouncementStore.hideSideBar();
              } else {
                Choerodon.prompt(data.message);
              }
            });
          } else {
            AnnouncementStore.setSubmitting(false);
            Choerodon.prompt(intl.formatMessage({ id: 'announcement.content.required' }));
          }
        } else {
          AnnouncementStore.setSubmitting(false);
        }
      });
    } else {
      AnnouncementStore.hideSideBar();
    }
  };

  handleRefresh = () => {
    this.props.AnnouncementStore.refresh();
  };

  handleCancel = () => {
    this.props.AnnouncementStore.hideSideBar();
  };

  handleDelete = (record) => {
    const { intl, AnnouncementStore } = this.props;
    Modal.confirm({
      className: 'c7n-iam-confirm-modal',
      title: intl.formatMessage({ id: 'announcement.delete.title' }),
      content: intl.formatMessage({ id: 'announcement.delete.content' }, { name: record.name }),
      onOk: () => AnnouncementStore.deleteAnnouncementById(record.taskId).then(({ failed, message }) => {
        if (failed) {
          Choerodon.prompt(message);
        } else {
          Choerodon.prompt(intl.formatMessage({ id: 'delete.success' }));
          this.handleRefresh();
        }
      }),
    });
  };

  showCreate = () => {
    const { AnnouncementStore, form } = this.props;
    AnnouncementStore.setCurrentRecord(false);
    AnnouncementStore.setEditorContent(null);
    form.resetFields();
    AnnouncementStore.showSideBar();
  };

  showDetail(record) {
    this.props.AnnouncementStore.showSideBar();
    this.props.AnnouncementStore.setCurrentRecord(record);
  }

  fetchData(pagination, filters, sort, params) {
    this.props.AnnouncementStore.loadData(pagination, filters, sort, params);
  }

  validateDatePicker = (rule, value, callback) => {
    if (value) {
      callback();
    } else {
      callback('请输入发送时间');
    }
  };

  getTableColumns() {
    const { intl, AnnouncementStore: { filters } } = this.props;
    const { intlPrefix } = this.announcementType;
    return [
      {
        title: <FormattedMessage id={`${intlPrefix}.content`} />,
        dataIndex: 'content',
        key: 'content',
        width: '35%',
        filters: [],
        filteredValue: filters.content || [],
        className: 'nowarp',
        render: text => text.replace(/<img(.*?)>/g, '[图片]').replace(/<[^>]*>/g, ''),
      }, {
        title: <FormattedMessage id={'status'} />,
        dataIndex: 'status',
        key: 'status',
        filters: Object.keys(iconType).map(value => ({
          text: intl.formatMessage({ id: `announcement.${value.toLowerCase()}` }),
          value,
        })),
        filteredValue: filters.status || [],
        render: status => (
          <StatusTag
            mode="icon"
            name={intl.formatMessage({ id: `announcement.${status.toLowerCase()}` })}
            colorCode={iconType[status]}
          />),
      }, {
        title: <FormattedMessage id={`${intlPrefix}.send-time`} />,
        dataIndex: 'sendTime',
        key: 'sendTime',
      }, {
        title: '',
        width: 100,
        key: 'action',
        align: 'right',
        render: this.renderAction,
      },
    ];
  }

  renderAction = (text, record) => {
    const { deleteService } = this.getPermission();

    return (
      <React.Fragment>
        <Tooltip
          title={<FormattedMessage id="announcement.detail" />}
          placement="bottom"
        >
          <Button
            shape="circle"
            icon="find_in_page"
            size="small"
            onClick={() => this.showDetail(record)}
          />
        </Tooltip>

        <Permission
          service={deleteService}
          type={this.announcementType.type}
          organizationId={this.announcementType.orgId}
        >
          <Tooltip
            title={<FormattedMessage id="delete" />}
            placement="bottom"
          >
            <Button
              size="small"
              icon="delete_forever"
              shape="circle"
              onClick={() => this.handleDelete(record)}
            />
          </Tooltip>
        </Permission>
      </React.Fragment>
    );
  };

  renderSidebarOkText() {
    const { AnnouncementStore: { currentRecord } } = this.props;
    if (currentRecord) {
      return <FormattedMessage id="close" />;
    } else {
      return <FormattedMessage id="save" />;
    }
  }

  renderForm() {
    const {
      AnnouncementStore: { editorContent }, AnnouncementStore,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Content
        className="c7n-iam-announcement-siderbar-content"
      >
        <Form>
          <span className="send-time">发送时间：</span>
          <FormItem {...formItemLayout} className="inline">
            {getFieldDecorator('date', {
              rules: [{
                validator: this.validateDatePicker,
              }],
            })(
              <DatePicker
                style={{ width: '180px' }}
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                getCalendarContainer={that => that}
              />,
            )
            }
          </FormItem>
        </Form>
        <p className="content-text">公告内容：</p>
        <Editor
          value={editorContent}
          onRef={(node) => {
            this.editor = node;
          }}
          onChange={(value) => {
            AnnouncementStore.setEditorContent(value);
          }}
        />
      </Content>
    );
  }

  renderDetail({ content, status, sendTime }) {
    const { intl } = this.props;
    return (
      <div className="c7n-iam-announcement-detail">

        <div><span>状态：</span>
          <div className="inline">
            <StatusTag
              style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)' }}
              mode="icon"
              name={intl.formatMessage({ id: `announcement.${status.toLowerCase()}` })}
              colorCode={iconType[status]}
            />
          </div>
        </div>
        <div><span>发送时间：</span><span className="send-time">{sendTime}</span></div>
        <div><span>公告内容：</span></div>
        <div className="c7n-iam-announcement-detail-wrapper">
          <div
            className="c7n-iam-announcement-detail-content"
            dangerouslySetInnerHTML={{ __html: `${content}` }}
          />
        </div>
      </div>
    );
  }

  render() {
    const { intl, AnnouncementStore: { announcementData, loading, pagination, params, sidebarVisible, currentRecord, submitting } } = this.props;
    const { intlPrefix } = this.announcementType;
    const { createService } = this.getPermission();
    return (
      <Page
        service={[
          'asgard-service.system-notification.pagingQuerySiteNotification',
          'asgard-service.system-notification.createNotificationOnSite',
          'asgard-service.system-notification.deleteSiteNotification',
          'asgard-service.system-notification.pagingQueryOrgNotificaton',
          'asgard-service.system-notification.createNotificationOnOrg',
          'asgard-service.system-notification.deleteOrgNotification',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Permission service={createService}>
            <Button
              onClick={this.showCreate}
              icon="playlist_add"
            >
              <FormattedMessage id="announcement.add" />
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
          code={intlPrefix}
          values={{ name: this.announcementType.intlValue }}
        >
          <Table
            loading={loading}
            className="c7n-iam-announcement"
            columns={this.getTableColumns()}
            dataSource={announcementData.slice()}
            pagination={pagination}
            filters={params}
            onChange={this.handleTableChange}
            // rowKey={({ code, namespace }) => `${namespace}-${code}`}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.sidebar.title${currentRecord ? '.detail' : ''}`} />}
            onOk={this.handleOk}
            okText={this.renderSidebarOkText()}
            cancelText={<FormattedMessage id="cancel" />}
            okCancel={!currentRecord}
            onCancel={this.handleCancel}
            confirmLoading={submitting}
            visible={sidebarVisible}
          >
            { currentRecord ? this.renderDetail(currentRecord) : this.renderForm() }
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
