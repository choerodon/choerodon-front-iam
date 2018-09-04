/**
 * Created by chenbinjie on 2018/8/6.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import {
  Button, Table, Modal, Form,
} from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import {
  Content, Header, Page, Action,
} from 'choerodon-front-boot';
import InMailTemplateStore from '../../../stores/global/inmail-template';
import './MailTemplate.scss';
import MouseOverWrapper from '../../../components/mouseOverWrapper';

@Form.create()
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class InMailTemplate extends Component {
  state = this.getInitState();

  init() {
    const { AppState } = this.props;
    this.data = AppState.currentMenuType;
    const { type, id, name } = this.data;
    InMailTemplateStore.setCurrentCode(`${type}.inmailtemplate`);
  }

  componentDidMount() {
    InMailTemplateStore.setCurrentCode('global.inmailtemplate');
    this.init();
  }

  getInitState() {
    return {
      isShowSidebar: false,
      selectType: 'create',
      isSubmitting: false,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
      filters: {},
      params: [],
    };
  }


  formatMessage = (id, values = {}) => {
    const { intl } = this.props;
    return intl.formatMessage({
      id,
    }, values);
  };
  // 删除
  handleDelete(record) {
    const { intl } = this.props;
    Modal.confirm({
      title: intl.formatMessage({ id: 'mailtemplate.delete.owntitle' }),
      content: intl.formatMessage({ id: 'mailtemplate.delete.owncontent' }, {
        name: record.name,
      }),
      onOk: () => {
        InMailTemplateStore.deleteMailTemplate(record.id, this.mail.type, this.mail.orgId).then((data) => {
          if (data.failed) {
            Choerodon.prompt(data.message);
          } else {
            Choerodon.prompt(intl.formatMessage({ id: 'delete.success' }));
            this.reload();
          }
        }).catch((error) => {
          if (error) {
            Choerodon.prompt(intl.formatMessage({ id: 'delete.error' }));
          }
        });
      },
    });
  }

  handleRefresh = () => {
    this.loadTemplate();
  };

  handlePageChange = (pagination, filters, sort, params) => {
    this.loadTemplate(pagination, filters, sort, params);
  };

  reload = () => {
    this.setState(this.getInitState(), () => {
      this.loadTemplate();
    });
  };

  render() {
    const { intl } = this.props;
    const {
      sort: { columnKey, order },
      filters, pagination,
    } = this.state;
    const columns = [{
      title: <FormattedMessage id="inmailtemplate.table.name" />,
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      filters: [],
      sortOrder: columnKey === 'name' && order,
      filteredValue: filters.name || [],
      render: text => (
        <MouseOverWrapper text={text} width={0.1}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="inmailtemplate.table.code" />,
      dataIndex: 'code',
      key: 'code',
      width: '25%',
      filters: [],
      filteredValue: filters.code || [],
      render: text => (
        <MouseOverWrapper text={text} width={0.1}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="inmailtemplate.table.mailtype" />,
      dataIndex: 'type',
      key: 'type',
      width: '30%',
      // filters: MailTemplateStore.getTemplateType.map(({ name }) => ({ text: name, value: name })),
      // sorter: true,
      // sortOrder: columnKey === 'type' && order,
      // filteredValue: filters.type || [],
      render: text => (
        <MouseOverWrapper text={text} width={0.1}>
          {text}
        </MouseOverWrapper>
      ),
    },
    {
      title: <FormattedMessage id="inmailtemplate.table.fromtype" />,
      dataIndex: 'isPredefined',
      key: 'isPredefined',
      width: '30%',
      // render: isPredefined => this.renderBuiltIn(isPredefined),
      // filteredValue: filters.isPredefined || [],
      // filters: [{
      //   text: intl.formatMessage({ id: 'mailtemplate.predefined' }),
      //   value: true,
      // }, {
      //   text: intl.formatMessage({ id: 'mailtemplate.selfdefined' }),
      //   value: false,
      // }],
    },
    {
      title: '',
      width: '100px',
      key: 'action',
      align: 'right',
      render: (text, record) => {
        const actionsDatas = [{
          icon: '',
          text: intl.formatMessage({ id: 'baseon' }),
          // action: this.handleOpen.bind(this, 'baseon', record),
        }, {
          icon: '',
          text: intl.formatMessage({ id: 'modify' }),
          // action: this.handleOpen.bind(this, 'modify', record),
        }];
          // 根据来源类型判断
        if (!record.isPredefined) {
          actionsDatas.push({
            icon: '',
            text: intl.formatMessage({ id: 'delete' }),
            // action: this.handleDelete.bind(this, record),
          });
        }
        return <Action data={actionsDatas} />;
      },
    }];

    return (
      <Page
        service={[
          'notify-service.email-template-site.pageSite',
        ]}
      >
        <Header
          title={<FormattedMessage id="inmailtemplate.header.title" />}
        >

          <Button
            icon="playlist_add"
            // onClick={this.handleOpen.bind(this, 'create')}
          >
            <FormattedMessage id="mailtemplate.create" />
          </Button>

          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code={InMailTemplateStore.getCurrentCode}
          values={{ name: 'Choerodon' }}
        >

          <Table
            // loading={InMailTemplateStore.loading}
            columns={columns}
            // dataSource={mailTemplateData}
            pagination={pagination}
            // filters={params}
            onChange={this.handlePageChange}
            rowKey="id"
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
          />

        </Content>

      </Page>
    );
  }
}
