import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, Permission, axios } from 'choerodon-front-boot';
import { Table, Input, Button, Form, Select, Tabs } from 'choerodon-ui';
import querystring from 'query-string';
import { injectIntl, FormattedMessage } from 'react-intl';
import './APITest.scss';

const intlPrefix = 'global.apitest';
const { TabPane } = Tabs;

@withRouter
@injectIntl
export default class APIDetail extends Component {
  getDetail = () => {
    return (
      <div className="c7n-interface-detail">
        <div className="c7n-interface-info">
          <h5><FormattedMessage id={`${intlPrefix}.interface.info`} /></h5>
          <Table />
        </div>
        <div className="c7n-request-params">
          <h5><FormattedMessage id={`${intlPrefix}.request.parameter`} /></h5>
          <Table />
        </div>
        <div className="c7n-response-data">
          <h5><FormattedMessage id={`${intlPrefix}.response.data`} /></h5>
          <div className="response-data-container">
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
            233<br />
          </div>
        </div>
      </div>
    );
  }

  getTest = () => {
    return (
      <div className="c7n-interface-test">
        <div className="c7n-interface-test-response-params">
          <h5><FormattedMessage id={`${intlPrefix}.request.parameter`} /></h5>
          <Table />
        </div>
        <div className="c7n-url-container">
          <span className="method">POST</span>
          <input type="text" />
          <Button
            funcType="raised"
            type="primary"
            htmlType="submit"
          >
            发送
          </Button>
        </div>
        <div className="c7n-response-container">
          <div className="c7n-response-code">
            <h5><FormattedMessage id={`${intlPrefix}.response.code`} /></h5>
            <div className="response-code-container">200</div>
          </div>
          <div className="c7n-response-body">
            <h5><FormattedMessage id={`${intlPrefix}.response.body`} /></h5>
            <div className="response-body-container">
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
            </div>
          </div>
          <div className="c7n-response-body">
            <h5><FormattedMessage id={`${intlPrefix}.response.headers`} /></h5>
            <div className="response-body-container">
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
              233<br />
            </div>
          </div>
          <div className="c7n-curl">
            <h5>CURL</h5>
            <div className="curl-container">
              白日依山尽黄河入海流白日依山尽黄河入海流白日依山尽黄河入海流白日依山尽黄河入海流白日依山尽黄河入海流白日依山尽
              黄河入海流白日依山尽黄河入海流白日依山尽黄河入海流白日依山尽黄河入海流白日依山尽黄河
              入海流白日依山尽黄河入海流白日依山尽黄河入海流白日依山尽黄河入海流白日依山尽黄河入
            </div>
          </div>
        </div>
      </div>
    );
  }


  render() {
    return (
      <Page>
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
          backPath="/iam/api-test"
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          className="c7n-api-test"
          code={`${intlPrefix}.detail`}
          values={{ name: 'test' }}
        >
          <Tabs>
            <TabPane tab={<FormattedMessage id={`${intlPrefix}.interface.detail`} />} key="detail">{this.getDetail()}</TabPane>
            <TabPane tab={<FormattedMessage id={`${intlPrefix}.interface.test`} />} key="test">{this.getTest()}</TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}
