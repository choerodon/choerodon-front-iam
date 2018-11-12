import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Content, Header, Page } from 'choerodon-front-boot';
import { Table, Button, Checkbox } from 'choerodon-ui';
import './ReceiveSetting.scss';
import UserInfoStore from '../../../stores/user/user-info/UserInfoStore';
import ReceiveSettingStore from '../../../stores/user/receive-setting/ReceiveSettingStore';

const intlPrefix = 'user.receive-setting';

@inject('AppState')
@injectIntl
@observer
export default class ReceiveSetting extends Component {
  componentWillMount() {
    this.refresh();
  }

  refresh = () => {
    const { AppState } = this.props;

    ReceiveSettingStore.setLoading(true);
    Promise.all([
      ReceiveSettingStore.loadReceiveTypeData(AppState.getUserInfo.id),
      ReceiveSettingStore.loadReceiveSettingData(),
      ReceiveSettingStore.loadAllowConfigData(),
    ]).then(() => {
      ReceiveSettingStore.setLoading(false);
    });
  };

  handleCheckChange = (e, id, type) => {
    ReceiveSettingStore.check(id, type);
    this.forceUpdate();
  };

  saveSettings = () => {
    ReceiveSettingStore.saveData().then((data) => {
      if (!data.fail) {
        Choerodon.prompt('保存成功');
      }
    });
  };

  render() {
    const user = UserInfoStore.getUserInfo;
    const columns = [{
      title: '信息类型',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => text,
    }, {
      title: (
        <Checkbox
          key="pm"
          indeterminate={false}
          // onChange={e => this.handleCheckChange(e, record.id, 'pm')}
          // checked={record.pmChecked}
        >
          站内信
        </Checkbox>
      ),
      dataIndex: 'age',
      key: 'age',
      width: '20%',
      render: (text, record) => (
        <Checkbox
          key={record.id ? record.id : `${record.id}-${record.sendSettingId}`}
          indeterminate={record.id ? record.pmIndeterminate : false}
          onChange={e => this.handleCheckChange(e, record.id, 'pm')}
          checked={record.pmChecked}
        >
          {record.id}
        </Checkbox>
      ),
    }, {
      title: (
        <Checkbox
          key="pm"
          // indeterminate
          // onChange={e => this.handleCheckChange(e, record.id, 'pm')}
          // checked={false}
        >
          邮件
        </Checkbox>
      ),
      dataIndex: 'address',
      width: '20%',
      key: 'address',
      render: (text, record) => (
        <Checkbox
          key={record.id ? record.id : `${record.id}-${record.sendSettingId}`}
          indeterminate={false}
          onChange={e => this.handleCheckChange(e, record.id, 'email')}
          checked={record.mailChecked}
        >
          {record.id}
        </Checkbox>
      ),
    }];

    return (
      <Page
        service={[]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Button onClick={this.refresh} icon="refresh">
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          className="c7n-iam-receive-setting"
          code={intlPrefix}
          values={{ name: user.realName }}
        >
          <Table
            loading={ReceiveSettingStore.getLoading}
            filterBar={false}
            columns={columns}
            pagination={false}
            dataSource={ReceiveSettingStore.getDataSource}
            childrenColumnName="settings"
            rowKey="id"
            fixed
            className="c7n-permission-info-table"
          />
          <div style={{ marginTop: 25 }}>
            <Button
              funcType="raised"
              type="primary"
              onClick={this.saveSettings}
              // loading={submitting}
            ><FormattedMessage id="save" /></Button>
            <Button
              funcType="raised"
              onClick={this.refresh}
              style={{ marginLeft: 16, color: '#3F51B5' }}
              // disabled={submitting}
            ><FormattedMessage id="cancel" /></Button>
          </div>
        </Content>
      </Page>
    );
  }
}
