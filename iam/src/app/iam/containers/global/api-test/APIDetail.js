import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, Permission, axios } from 'choerodon-front-boot';
import { Table, Input, Button, Select, Tabs, Spin } from 'choerodon-ui';
import querystring from 'query-string';
import classnames from 'classnames';
import { injectIntl, FormattedMessage } from 'react-intl';
import './APITest.scss';
import APITestStore from '../../../stores/global/api-test';

const intlPrefix = 'global.apitest';
const { TabPane } = Tabs;
const Hjson = require('hjson');
// Hjson编译配置
const options = {
  bracesSameLine: true,
  quotes: 'all', // 全部加上引号
  keepWsc: true,
}

@withRouter
@injectIntl
export default class APIDetail extends Component {
  state = this.getInitState();

  getInitState() {
    const { controller, version, service, operationId } = this.props.match.params;
    return {
      loading: true,
      controller,
      version,
      service,
      operationId,
    };
  }


  componentWillMount() {
    const { description } = APITestStore.getApiDetail;
    if (description === '[]') {
      const { controller, version, service, operationId } = this.state;
      const queryObj = {
        version,
        operation_id: operationId,
      };
      axios.get(`manager/v1/swaggers/${service}/controllers/${controller}/paths?${querystring.stringify(queryObj)}`).then((data) => {
        for (const item of data.paths) {
          if (item.operationId === operationId) {
            APITestStore.setApiDetail(item);
            this.setState({
              loading: false,
            });
            return;
          }
        }
      });
    } else {
      this.setState({
        loading: false,
      });
    }
  }


  getDetail() {
    const { intl } = this.props;
    const keyArr = ['请求方式', '路径', '描述', 'Action', '权限层级', '是否为登录可访问', '是否为公开权限', '请求格式', '响应格式'];
    const tableValue = keyArr.map((item) => {
      return {
        name: item,
      };
    })

    const desc = APITestStore.getApiDetail && APITestStore.getApiDetail.description;
    const responseDataExample = APITestStore.getApiDetail &&
      APITestStore.getApiDetail.responses.length ? APITestStore.getApiDetail.responses[0].body : '{}';
    let handledDescWithComment = Hjson.parse(responseDataExample, { keepWsc: true });
    handledDescWithComment = Hjson.stringify(handledDescWithComment, options);
    const handledDesc = Hjson.parse(desc);
    const { permission } = handledDesc;
    const roles = permission.roles.length && permission.roles.map((item) => {
      return {
        name: '默认角色',
        value: item,
      };
    })
    tableValue[0].value = APITestStore && APITestStore.apiDetail.method;
    tableValue[1].value = APITestStore && APITestStore.apiDetail.url;
    tableValue[2].value = APITestStore && APITestStore.apiDetail.remark;
    tableValue[3].value = permission.action;
    tableValue[4].value = permission.permissionLevel;
    tableValue[5].value = permission.permissionLogin ? '是' : '否';
    tableValue[6].value = permission.permissionPublic ? '是' : '否';
    tableValue[7].value = APITestStore && APITestStore.apiDetail.consumes[0];
    tableValue[8].value = APITestStore && APITestStore.apiDetail.produces[0];
    tableValue.splice(5, 0, ...roles);

    const infoColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.property`} />,
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.value`} />,
      dataIndex: 'value',
      key: 'value',
    }];

    const paramsColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.param.name`} />,
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        if (record.required) {
          return (
            <div>
              <span>{text}</span>
              <span style={{ color: '#d50000' }}>*</span>
            </div>
          );
        } else {
          return text;
        }
      },
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
        if (text === 'integer' && record.format === 'int64') {
          return 'long';
        } else if (!text) {
          let value = Hjson.parse(record.body, { keepWsc: true });
          value = Hjson.stringify(value, options);
          return (
            <div>
              Example Value
              <div className="body-container">
                <pre>
                  <code>
                    {value}
                  </code>
                </pre>
              </div>
            </div>
          );
        } else {
          return text;
        }
      },
    }]

    return (
      <div className="c7n-interface-detail">
        <div className="c7n-interface-info">
          <h5><FormattedMessage id={`${intlPrefix}.interface.info`} /></h5>
          <Table
            columns={infoColumns}
            dataSource={tableValue}
            pagination={false}
            filterBar={false}
            rowKey={(record) => {
              return `${record.name}-${record.value}`;
            }}
          />
        </div>
        <div className="c7n-request-params">
          <h5><FormattedMessage id={`${intlPrefix}.request.parameter`} /></h5>
          <Table
            columns={paramsColumns}
            dataSource={APITestStore && APITestStore.apiDetail.parameters}
            pagination={false}
            filterBar={false}
            rowKey="name"
          />
        </div>
        <div className="c7n-response-data">
          <h5><FormattedMessage id={`${intlPrefix}.response.data`} /></h5>
          <div className="response-data-container">
            <pre>
              <code>
                {handledDescWithComment}
              </code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  getTest = () => {
    const method = APITestStore && APITestStore.apiDetail.method;
    const requestColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.param.name`} />,
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text, record) => {
        if (record.required) {
          return (
            <div>
              <span>{text}</span>
              <span style={{ color: '#d50000' }}>*</span>
            </div>
          );
        } else {
          return text;
        }
      },
    }, {
      title: <FormattedMessage id={`${intlPrefix}.request.data`} />,
      dataIndex: 'in',
      key: 'in',
      width: '40%',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.request.data.type`} />,
      dataIndex: 'type',
      key: 'type',
      width: '40%',
      render: (text, record) => {
        if (text === 'integer' && record.format === 'int64') {
          return 'long';
        } else if (!text) {
          let value = Hjson.parse(record.body, { keepWsc: true });
          value = Hjson.stringify(value, options);
          return (
            <div>
              Example Value
              <div className="body-container">
                <pre>
                  <code>
                    {value}
                  </code>
                </pre>
              </div>
            </div>
          );
        } else {
          return text;
        }
      },
    }]
    return (
      <div className="c7n-interface-test">
        <div className="c7n-interface-test-response-params">
          <h5><FormattedMessage id={`${intlPrefix}.request.parameter`} /></h5>
          <Table
            pagination={false}
            filterBar={false}
            columns={requestColumns}
            dataSource={APITestStore && APITestStore.apiDetail.parameters}
            rowKey="name"
          />

        </div>
        <div className="c7n-url-container">
          <span className={classnames('method', method)}>{method}</span>
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
            <div className="response-body-container" />
          </div>
          <div className="c7n-response-body">
            <h5><FormattedMessage id={`${intlPrefix}.response.headers`} /></h5>
            <div className="response-body-container" />
          </div>
          <div className="c7n-curl">
            <h5>CURL</h5>
            <div className="curl-container" />
          </div>
        </div>
      </div>
    );
  }


  render() {
    const url = APITestStore && APITestStore.apiDetail.url;
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
          values={{ name: url }}
        >
          <Tabs>
            <TabPane tab={<FormattedMessage id={`${intlPrefix}.interface.detail`} />} key="detail">
              {this.state.loading ? <div style={{ textAlign: 'center' }}><Spin size="large" /></div> : this.getDetail()}
            </TabPane>
            <TabPane tab={<FormattedMessage id={`${intlPrefix}.interface.test`} />} key="test">
              {this.state.loading ? <div style={{ textAlign: 'center' }}><Spin size="large" /></div> : this.getTest()}
            </TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}
