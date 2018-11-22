import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Content, Header, Page, Permission } from 'choerodon-front-boot';
import { Table, Button, Tooltip, Modal } from 'choerodon-ui';
import './TokenManager.scss';
import { Link, withRouter } from 'react-router-dom';
import MouseOverWrapper from '../../../components/mouseOverWrapper';
import StatusTag from '../../../components/statusTag';

const intlPrefix = 'user.token-manager';

@withRouter
@inject('AppState')
@injectIntl
@observer
export default class TokenManager extends Component {
  componentWillMount() {
    this.loadInitData();
  }

  handlePageChange = (pagination, filters, sort, params) => {
    this.loadInitData(pagination, params);
  };

  handleDelete = (record) => {
    const { TokenManagerStore } = this.props;
    const { intl } = this.props;
    Modal.confirm({
      className: 'c7n-iam-confirm-modal',
      title: intl.formatMessage({ id: `${intlPrefix}.remove.title` }),
      content: intl.formatMessage({ id: `${intlPrefix}.remove.content` }, { name: record.accesstoken }),
      onOk: () => TokenManagerStore.deleteTokenById(record.tokenId).then(({ failed, message }) => {
        if (failed) {
          Choerodon.prompt(message);
        } else {
          Choerodon.prompt(intl.formatMessage({ id: 'remove.success' }));
          this.refresh();
        }
      }),
    });
  };


  refresh = () => {
    const { TokenManagerStore } = this.props;
    TokenManagerStore.refresh(Choerodon.getAccessToken().split(' ')[1]);
  };

  loadInitData(pagination, params) {
    const { TokenManagerStore } = this.props;
    TokenManagerStore.loadData(Choerodon.getAccessToken().split(' ')[1], pagination, params);
  }

  getColumns = () => {
    const {
      intl,
    } = this.props;
    const columns = [{
      title: 'token',
      dataIndex: 'accesstoken',
      key: 'accesstoken',
      width: '30%',
      className: 'c7n-iam-token-manager-token',
      render: (text, record) => (
        <React.Fragment>
          <MouseOverWrapper text={text} width={0.2}>
            {text}
          </MouseOverWrapper>
          {
            record.currentToken ?
              <StatusTag
                mode="tags"
                name={'当前'}
                colorCode={'COMPLETED'}
              /> : null
          }
        </React.Fragment>
      ),
    }, {
      title: intl.formatMessage({ id: `${intlPrefix}.client-id` }),
      dataIndex: 'clientId',
      key: 'clientId',
      width: '10%',
      render: text => (
        <MouseOverWrapper text={text} width={0.1}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: intl.formatMessage({ id: `${intlPrefix}.redirect-uri` }),
      dataIndex: 'redirectUri',
      key: 'redirectUri',
      width: '20%',
      render: text => (
        <MouseOverWrapper text={text} width={0.20}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: intl.formatMessage({ id: `${intlPrefix}.create-time` }),
      dataIndex: 'createTime',
      key: 'createTime',
      width: '10%',
      render: text => (
        <MouseOverWrapper text={text} width={0.1}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: intl.formatMessage({ id: `${intlPrefix}.expiration-time` }),
      dataIndex: 'expirationTime',
      key: 'expirationTime',
      width: '10%',
      render: text => (
        <MouseOverWrapper text={text} width={0.1}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: intl.formatMessage({ id: 'status' }),
      dataIndex: 'expire',
      key: 'expire',
      width: '10%',
      // filters: [
      //   {
      //     text: '正常',
      //     value: false,
      //   }, {
      //     text: '已失效',
      //     value: true,
      //   },
      // ],
      // filteredValue: filters.expire || [],
      render: expire => (
        <StatusTag
          mode="tags"
          name={!expire ? '正常' : '已失效'}
          colorCode={!expire ? 'COMPLETED' : 'DEFAULT'}
        />
      ),
    }, {
      title: '',
      width: '5%',
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <Tooltip
          title={<FormattedMessage id="delete" />}
          placement="top"
        >
          <Button
            shape="circle"
            icon="delete_forever"
            disabled={record.currentToken}
            size="small"
            onClick={() => this.handleDelete(record)}
          />
        </Tooltip>
      ),
    }];
    return columns;
  };

  render() {
    const {
      TokenManagerStore: { loading, tokenData, params },
    } = this.props;

    return (
      <Page
        service={[
          'iam-service.access-token.list',
          'iam-service.access-token.delete',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Button onClick={this.refresh} icon="refresh">
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          className="c7n-iam-token-manager"
          code={intlPrefix}
        >
          <Table
            loading={loading}
            filters={params}
            columns={this.getColumns()}
            dataSource={tokenData}
            rowKey="accesstoken"
            fixed
            onChange={this.handlePageChange}
          />
        </Content>
      </Page>
    );
  }
}
