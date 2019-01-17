import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Button, Table, Modal, Tooltip, Form, DatePicker, Input, Radio } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import './Announcement.scss';
import StatusTag from '../../../components/statusTag';
import Editor from '../../../components/editor';
import MouseOverWrapper from '../../../components/mouseOverWrapper';

// 匹配html界面为空白的正则。
const patternHTMLEmpty = /^(((<[^>]+>)*\s*)|&nbsp;|\s)*$/g;
const inputWidth = '512px';
const iconType = {
  COMPLETED: 'COMPLETED',
  SENDING: 'RUNNING',
  WAITING: 'UN_START',
  // FAILED: 'FAILED',
};
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
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
    this.apiPrefix = '/notify/v1/system_notice';
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

  handleTableChange = (pagination, filters, sort, params) => {
    this.fetchData(pagination, filters, sort, params);
  };

  handleOk = () => {
    const { AnnouncementStore: { editorContent, currentRecord, selectType }, AnnouncementStore, form, intl } = this.props;
    if (selectType !== 'detail') {
      form.validateFields((err, values) => {
        if (!err) {
          AnnouncementStore.setSubmitting(true);
          if (editorContent === null || patternHTMLEmpty.test(editorContent)) {
            AnnouncementStore.setSubmitting(false);
            Choerodon.prompt(intl.formatMessage({ id: 'announcement.content.required' }));
          } else if (editorContent && !patternHTMLEmpty.test(editorContent)) {
            if (selectType === 'create') {
              AnnouncementStore.createAnnouncement({
                ...values,
                content: editorContent,
                sendDate: values.sendDate.format('YYYY-MM-DD HH:mm:ss'),
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
              AnnouncementStore.modifyAnnouncement({
                ...values,
                id: currentRecord.id,
                objectVersionNumber: currentRecord.objectVersionNumber,
                scheduleTaskId: currentRecord.scheduleTaskId,
                status: currentRecord.status,
                content: editorContent,
                sendDate: values.sendDate.format('YYYY-MM-DD HH:mm:ss'),
              }).then((data) => {
                AnnouncementStore.setSubmitting(false);
                if (!data.failed) {
                  Choerodon.prompt(intl.formatMessage({ id: 'modify.success' }));
                  this.handleRefresh();
                  AnnouncementStore.hideSideBar();
                } else {
                  Choerodon.prompt(data.message);
                }
              });
            }
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
      title: intl.formatMessage({ id: 'announcement.delete.title' }, { name: record.title }),
      content: intl.formatMessage({ id: `announcement.delete.content${record.status === 'COMPLETED' ? '.send' : ''}` }),
      onOk: () => AnnouncementStore.deleteAnnouncementById(record.id).then(({ failed, message }) => {
        if (failed) {
          Choerodon.prompt(message);
        } else {
          Choerodon.prompt(intl.formatMessage({ id: 'delete.success' }));
          this.handleRefresh();
        }
      }),
    });
  };

  handleOpen = (selectType, record = {}) => {
    const { AnnouncementStore, form } = this.props;
    form.resetFields();
    AnnouncementStore.setEditorContent(selectType === 'create' ? null : record.content);
    AnnouncementStore.setCurrentRecord(record);
    AnnouncementStore.setSelectType(selectType);
    AnnouncementStore.showSideBar();
  }

  fetchData(pagination, filters, sort, params) {
    this.props.AnnouncementStore.loadData(pagination, filters, { columnKey: 'id', order: 'descend' }, params);
  }

  getTableColumns() {
    const { intl, AnnouncementStore: { filters } } = this.props;
    const { intlPrefix } = this.announcementType;
    return [
      {
        title: <FormattedMessage id={`${intlPrefix}.table.title`} />,
        dataIndex: 'title',
        key: 'title',
        filters: [],
        filteredValue: filters.title || [],
        width: '10%',
        render: text => (
          <MouseOverWrapper text={text} width={0.1}>
            {text}
          </MouseOverWrapper>
        ),
      },
      {
        title: <FormattedMessage id={`${intlPrefix}.content`} />,
        dataIndex: 'textContent',
        key: 'textContent',
        width: '15%',
        className: 'nowarp',
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
            name={intl.formatMessage({ id: status ? `announcement.${status.toLowerCase()}` : 'announcement.completed' })}
            colorCode={status ? iconType[status] : iconType.COMPLETED}
          />),
      }, {
        title: <FormattedMessage id={`${intlPrefix}.send-time`} />,
        dataIndex: 'sendDate',
        key: 'sendDate',
      }, {
        title: '',
        width: 150,
        key: 'action',
        align: 'right',
        render: this.renderAction,
      },
    ];
  }

  renderAction = (text, record) => (
    <React.Fragment>
      {
          record.status === 'WAITING' && (
            <Permission service={['notify-service.system-announcement.update']}>
              <Tooltip
                title={<FormattedMessage id="modify" />}
                placement="bottom"
              >
                <Button
                  size="small"
                  icon="mode_edit"
                  shape="circle"
                  onClick={() => this.handleOpen('modify', record)}
                />
              </Tooltip>
            </Permission>
          )
        }
      <Tooltip
        title={<FormattedMessage id="announcement.detail" />}
        placement="bottom"
      >
        <Button
          shape="circle"
          icon="find_in_page"
          size="small"
          onClick={() => this.handleOpen('detail', record)}
        />
      </Tooltip>
      <Permission service={['notify-service.system-announcement.delete']}>
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

  renderSidebarOkText() {
    const { AnnouncementStore: { selectType } } = this.props;
    let text;
    switch (selectType) {
      case 'create':
        text = 'create';
        break;
      case 'modify':
        text = 'save';
        break;
      case 'detail':
        text = 'close';
        break;
      default:
        break;
    }
    return <FormattedMessage id={`${text}`} />;
  }

  disabledDate(current) {
    return current < moment().subtract(1, 'days');
  }

  renderForm() {
    const {
      AnnouncementStore: { editorContent, selectType, currentRecord }, AnnouncementStore, intl,
      form: { getFieldDecorator },
    } = this.props;
    const isModify = selectType === 'modify';
    return (
      <div className="c7n-iam-announcement-siderbar-content">
        <Form>
          <FormItem {...formItemLayout}>
            {getFieldDecorator('sendDate', {
              rules: [{
                required: true,
                message: '请输入发送时间',
              }],
              initialValue: isModify ? moment(currentRecord.sendDate) : undefined,
            })(
              <DatePicker
                className="c7n-iam-announcement-siderbar-content-datepicker"
                label={<FormattedMessage id="announcement.send.date" />}
                style={{ width: inputWidth }}
                format="YYYY-MM-DD HH:mm:ss"
                disabledDate={this.disabledDate}
                showTime
                getCalendarContainer={that => that}
              />,
            )
              }
          </FormItem>
          <FormItem {...formItemLayout}>
            {getFieldDecorator('sendNotices', {
              rules: [],
              initialValue: isModify ? currentRecord.sendNotices : true,
            })(
              <RadioGroup
                label={<FormattedMessage id="announcement.send.letter" />}
                className="radioGroup"
              >
                <Radio value>{intl.formatMessage({ id: 'yes' })}</Radio>
                <Radio value={false}>{intl.formatMessage({ id: 'no' })}</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem {...formItemLayout}>
            {getFieldDecorator('title', {
              rules: [{
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: 'announcement.title.required' }),
              }],
              initialValue: isModify ? currentRecord.title : undefined,
            })(
              <Input autoComplete="off" style={{ width: inputWidth }} label={<FormattedMessage id="announcement.title" />} />,
            )}
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
      </div>
    );
  }

  renderDetail({ content, status, sendDate }) {
    const { intl } = this.props;
    return (
      <div className="c7n-iam-announcement-detail">
        <div><span>状态：</span>
          <div className="inline">
            <StatusTag
              style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)' }}
              mode="icon"
              name={intl.formatMessage({ id: status ? `announcement.${status.toLowerCase()}` : 'announcement.completed' })}
              colorCode={iconType[status]}
            />
          </div>
        </div>
        <div><span>发送时间：</span><span className="send-time">{sendDate}</span></div>
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
    const { AnnouncementStore: { selectType } } = this.props;
    return (
      <Page
        service={[
          'notify-service.system-announcement.pagingQuery',
          'notify-service.system-announcement.create',
          'notify-service.system-announcement.update',
          'notify-service.system-announcement.delete',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Permission service={['notify-service.system-announcement.create']}>
            <Button
              onClick={() => this.handleOpen('create')}
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
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />
          <Sidebar
            title={<FormattedMessage id={`${intlPrefix}.sidebar.title.${selectType}`} />}
            onOk={this.handleOk}
            okText={this.renderSidebarOkText()}
            cancelText={<FormattedMessage id="cancel" />}
            okCancel={selectType !== 'detail'}
            onCancel={this.handleCancel}
            confirmLoading={submitting}
            visible={sidebarVisible}
          >
            {(selectType === 'create' || selectType === 'modify') && this.renderForm()}
            {selectType === 'detail' && this.renderDetail(currentRecord)}

          </Sidebar>
        </Content>
      </Page>
    );
  }
}
