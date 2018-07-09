/**
 * Created by hulingfangzi on 2018/7/3.
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button,  Form, Select, Table } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import querystring from 'query-string';
import ApitestStore from '../../../stores/globalStores/apitest'
const intlPrefix = 'global.apitest';
const Option = Select.Option;

@inject('AppState')
@observer

class Apitest extends Component {
  state = this.getInitState();

  getInitState() {
    return {
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
    }
  }

  componentDidMount() {
    this.loadInitData();
  }

  loadInitData = () => {
    ApitestStore.setLoading(true);
    ApitestStore.loadService().then((res) => {
      if (res.failed) {
        Choerodon.prompt(res.message);
      } else {
        if (res.length) {
          const services = res.map(({ location }) => {
            return {
              "text": location.split('?')[0].split('/')[2],
              "value": (location.split('?')[0].split('/')[2]) + '/' + (location.split('=')[1]),
            }
          });
          ApitestStore.setService(services);
          ApitestStore.setCurrentService(services[0]);
        } else {
          ApitestStore.setService([]);
          ApitestStore.setLoading(false);
        }
      }
    })
  }


  /* 微服务下拉框 */
  getOptionList() {
    const service = ApitestStore.service;
    return service && service.length > 0 ? (
      ApitestStore.service.map(({ text, value }) => (
        <Option key={value}>{text}</Option>
      ))
    ) : <Option value="empty">无服务</Option>;
  }



  render() {
    return (
      <Page>
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh"/>
          </Button>
        </Header>
        <Content
          code={intlPrefix}
          values={{name: `${process.env.HEADER_TITLE_NAME || 'Choerodon'}`}}
        >
          <Select
            style={{ width: '512px', marginBottom: '32px' }}
            value={ApitestStore.currentService.value}
            label={<FormattedMessage id={`${intlPrefix}.service`}/>}
            filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {this.getOptionList()}
          </Select>
          <Table />
        </Content>
      </Page>
    )
  }
}

export default withRouter(injectIntl(Apitest));
