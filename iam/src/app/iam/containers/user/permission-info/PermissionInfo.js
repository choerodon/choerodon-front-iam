import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import classnames from 'classnames';
import { Content, Header, Page } from 'choerodon-front-boot';
import { Table, Button, Tooltip } from 'choerodon-ui';
import './PermissionInfo.scss';
import StatusTag from '../../../components/statusTag';
import MouseOverWrapper from '../../../components/mouseOverWrapper';

const intlPrefix = 'user.permissioninfo';

@injectIntl
@inject('AppState', 'PermissionInfoStore', 'HeaderStore')
@observer
export default class PermissionInfo extends Component {
  handlePageChange = (pagination, filters, sort, params) => {
    this.props.PermissionInfoStore.loadData(pagination, params);
  };

  handleRefresh = () => {
    this.loadData();
  };

  loadData = () => {
    this.props.PermissionInfoStore.setRole(this.props.AppState.getUserInfo);
    this.props.PermissionInfoStore.loadData();
  };

  componentDidMount() {
    this.loadData();
  }

  renderRoleColumn = (text) => {
    const roles = text.split('\n');
    return roles.map((value, index) => {
      const item = <span className={'role-wrapper'} key={index}>{value}</span>;
      return item;
    });
  };

  getRedirectURL({ id, name, level, projName }) {
    switch (level) {
      case 'site':
        return { pathname: '/' };
      case 'organization':
        return `/?type=${level}&id=${id}&name=${encodeURIComponent(name)}`;
      case 'project':
        return `/?type=${level}&id=${id}&name=${encodeURIComponent(projName)}`;
      default:
        return { pathname: '/', query: {} };
    }
  }

  getTableColumns() {
    const iconType = { site: 'dvr', project: 'project', organization: 'domain' };
    const siteInfo = this.props.AppState.getSiteInfo;
    return [{
      title: <FormattedMessage id={`${intlPrefix}.table.name`} />,
      width: '20%',
      dataIndex: 'name',
      key: 'name',
      className: 'c7n-permission-info-name',
      render: (text, record) => {
        let result;
        if (record.level !== 'site') {
          result = (
            <Link to={this.getRedirectURL(record)}>
              <div className="c7n-permission-info-name-avatar">
                {
                  record.imageUrl ? <img src={record.imageUrl} alt="avatar" style={{ width: '100%' }} /> :
                  <React.Fragment>{record.projName ? record.projName.split('')[0] : text.split('')[0]}</React.Fragment>
                }
              </div>
              <span>{text}</span>
            </Link>
          );
        } else {
          result = (
            <Link to={this.getRedirectURL(record)}>
              <div className="c7n-permission-info-name-avatar-default" style={siteInfo.favicon ? { backgroundImage: `url(${siteInfo.favicon})` } : {}} />
              <span>{text}</span>
            </Link>
          );
        }
        return result;
      },
    }, {
      title: <FormattedMessage id={`${intlPrefix}.table.code`} />,
      width: '10%',
      dataIndex: 'code',
      key: 'code',
      className: 'c7n-permission-info-code',
      render: text => (
        <MouseOverWrapper text={text} width={0.08}>
          {text}
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="level" />,
      width: '5%',
      dataIndex: 'level',
      key: 'level',
      className: 'c7n-permission-info-level',
      render: text => (
        <MouseOverWrapper text={text} width={0.04}>
          <FormattedMessage id={text} />
        </MouseOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="role" />,
      width: '42%',
      dataIndex: 'roles',
      key: 'roles',
      className: 'c7n-permission-info-description',
      render: this.renderRoleColumn,
    }, {
      title: '',
      width: '5%',
      key: 'action',
      className: 'c7n-permission-info-action',
      align: 'right',
      render: (text, record) => {
        const { name, level } = record;
        return (
          <Tooltip
            title={<FormattedMessage id={`${intlPrefix}.${level}.redirect`} values={{ name }} />}
            placement="bottomRight"
          >
            <Link to={this.getRedirectURL(record)}>
              <Button
                shape="circle"
                icon="exit_to_app"
                size="small"
              />
            </Link>
          </Tooltip>
        );
      },
    }];
  }

  render() {
    const { intl, PermissionInfoStore: { pagination, params }, PermissionInfoStore, AppState: { getUserInfo: { realName } } } = this.props;
    return (
      <Page
        service={[
          'iam-service.user.pagingQueryRole',
        ]}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code={intlPrefix} values={{ name: realName }}>
          <Table
            loading={PermissionInfoStore.getLoading}
            columns={this.getTableColumns()}
            pagination={pagination}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
            dataSource={PermissionInfoStore.getDataSource}
            filters={params}
            rowKey="id"
            onChange={this.handlePageChange}
            fixed
            className="c7n-permission-info-table"
          />
        </Content>
      </Page>
    );
  }
}
