import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, Permission, axios } from 'choerodon-front-boot';
import { Table, Input, Button, Form, Select, Tabs } from 'choerodon-ui';
import querystring from 'query-string';
import { injectIntl, FormattedMessage } from 'react-intl';
import './APITest.scss';
import APITestStore from '../../../stores/global/api-test';

const intlPrefix = 'global.apitest';
const { TabPane } = Tabs;
const Hjson = require('hjson');

@withRouter
@injectIntl
export default class APIDetail extends Component {
  state = this.getInitState();

  getInitState() {
    const { params } = this.props.match;
    return {
      method: params.method,
      controller: params.controller,
      version: params.version,
      url: params['0'],
    };
  }


  componentDidMount() {
    if (JSON.stringify(APITestStore.apiDetail) === '{}') {
      window.console.log('刷新了');
    }
  }


  getDetail = () => {
    const { method, url } = this.state;
    const keyArr = ['请求方式', '路径', '描述', 'Action', '权限层级', '是否为登录可访问', '是否为公开权限', '请求格式', '响应格式'];
    const tableValue = keyArr.map((item) => {
      return {
        name: item,
      };
    })

    const desc = APITestStore && APITestStore.apiDetail.description;
    const handledDesc = Hjson.parse(desc);
    const { permission } = handledDesc;
    const roles = permission.roles.length && permission.roles.map((item) => {
      return {
        name: '默认角色',
        value: item,
      };
    })
    tableValue[0].value = method;
    tableValue[1].value = `/${url}`;
    tableValue[2].value = APITestStore && APITestStore.apiDetail.remark;
    tableValue[3].value = permission.action;
    tableValue[4].value = permission.permissionLevel;
    tableValue[5].value = permission.permissionLogin ? '是' : '否';
    tableValue[6].value = permission.permissionPublic ? '是' : '否';
    tableValue[7].value = APITestStore && APITestStore.apiDetail.consumes[0];
    tableValue[8].value = APITestStore && APITestStore.apiDetail.produces[0];
    tableValue.splice(5, 0, ...roles);
    // const hjson = '[\n {\n//controller下的方法集\n\"paths\":[\n{\n\"refController\":\"string\" //接口相关联的controller\n\"method\":\"string\" //请求方法\n\"produces\":[\narray\n]\n\"description\":\"string\" //接口自定义扩展详细信息\n\"operationId\":\"string\"\n//响应集合\n\"responses\":[\n{\n\"phonyJsonWithComment\":\"string\"\n\"requestBody\":\"string\"\n\"httpStatus\":\"string\" //http状态码\n\"description\":\"string\"\n}]\n\"remark\":\"string\" //接口描述\n\"parameters\":[\n{\n\"in\":\"string\"\n\"format\":\"string\"\n\"name\":\"string\"\n\"description\":\"string\"\n\"type\":\"string\"\n\"collectionFormat\":\"string\"\n\"items\":\"{}\"\n\"required\":\"boolean\"\n}]\n\"url\":\"string\" //请求url\n\"consumes\":[\narray\n]\n}]\n\"name\":\"string\" //controller的名字\n\"description\":\"string\" //controller的描述\n}\n]'
    // const options = {
    //   bracesSameLine: true,
    //   quotes: 'all', // 全部加上引号
    //   keepWsc: true,
    // }
    // let jstest = Hjson.parse(hjson, { keepWsc: true });
    // jstest = Hjson.stringify(jstest, options);

    const { intl } = this.props;
    const infoColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.property`} />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.value`} />,
      dataIndex: 'value',
      key: 'value',
    }];

    const paramsColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.param.name`} />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.param.desc`} />,
      dataIndex: 'description',
      key: 'description',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.param.type`} />,
      dataIndex: 'in',
      key: 'in',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.request.data.type`} />,
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => {
        return text === 'integer' && record.format === 'int64' ? 'long' : text;
      },
    }]

    return (
      <div className="c7n-interface-detail">
        <div className="c7n-interface-info">
          <h5><FormattedMessage id={`${intlPrefix}.interface.info`} /></h5>
          <Table
            columns={infoColumns}
            dataSource={tableValue}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
            pagination={false}
          />
        </div>
        <div className="c7n-request-params">
          <h5><FormattedMessage id={`${intlPrefix}.request.parameter`} /></h5>
          <Table
            columns={paramsColumns}
            dataSource={APITestStore && APITestStore.apiDetail.parameters}
            filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
            pagination={false}
          />
        </div>
        <div className="c7n-response-data">
          <h5><FormattedMessage id={`${intlPrefix}.response.data`} /></h5>
          <div className="response-data-container">
            <pre>
              <code />
            </pre>
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
    const { url } = this.state;
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
          values={{ name: `/${url}` }}
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
