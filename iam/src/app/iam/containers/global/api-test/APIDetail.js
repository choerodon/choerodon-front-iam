import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { axios as defaultAxios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import { Form, Table, Input, Button, Select, Tabs, Spin, Tooltip } from 'choerodon-ui';
import querystring from 'query-string';
import classnames from 'classnames';
import Hjson from 'hjson';
import { injectIntl, FormattedMessage } from 'react-intl';
import './APITest.scss';
import APITestStore from '../../../stores/global/api-test';

let statusCode;
let responseHeader;
let response;
const intlPrefix = 'global.apitest';
const urlPrefix = process.env.API_HOST;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;
const instance = defaultAxios.create();
// Hjson编译配置
const options = {
  bracesSameLine: true,
  quotes: 'all', // 全部加上引号
  keepWsc: true,
};

instance.interceptors.request.use(
  (config) => {
    const newConfig = config;
    newConfig.headers['Content-Type'] = 'application/json';
    newConfig.headers.Accept = 'application/json';
    const accessToken = Choerodon.getAccessToken();
    if (accessToken) {
      newConfig.headers.Authorization = accessToken;
    }
    return newConfig;
  },
  (err) => {
    const error = err;
    return Promise.reject(error);
  });

instance.interceptors.response.use((res) => {
  statusCode = res.status; // 响应码
  responseHeader = Hjson.stringify(res.headers, options); // 响应头
  response = Hjson.stringify(res.data, options);
}, (error) => {
  statusCode = error.response.status; // 响应码
  responseHeader = Hjson.stringify(error.response.headers, options); // 响应头
  response = Hjson.stringify(error.response.data, options);
})

@Form.create()
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
      requestUrl: null,
      urlPrefix: '',
      isShowResult: null,
      isSending: false,
      urlPathValues: {},
    };
  }


  componentWillMount() {
    if (APITestStore.getApiDetail.description === '[]') {
      const { controller, version, service, operationId } = this.state;
      const queryObj = {
        version,
        operation_id: operationId,
      };
      defaultAxios.get(`${urlPrefix}/manager/v1/swaggers/${service}/controllers/${controller}/paths?${querystring.stringify(queryObj)}`).then((data) => {
        for (const item of data.paths) {
          if (item.operationId === operationId) {
            const { basePath, url } = item;
            APITestStore.setApiDetail(item);
            this.setState({
              loading: false,
              requestUrl: `${urlPrefix}${basePath}${url}`,
            });
            return;
          }
        }
      });
    } else {
      const { basePath, url } = APITestStore.getApiDetail;
      this.setState({
        loading: false,
        requestUrl: `${urlPrefix}${basePath}${url}`,
      });
    }
  }


  getDetail() {
    const { intl } = this.props;
    const { method, url, remark, consumes, produces } = APITestStore.getApiDetail;
    const keyArr = ['请求方式', '路径', '描述', 'Action', '权限层级', '是否为登录可访问', '是否为公开权限', '请求格式', '响应格式'];
    const tableValue = keyArr.map((item) => {
      return {
        name: item,
      };
    })
    const desc = APITestStore.getApiDetail.description || '[]';
    const responseDataExample = APITestStore.getApiDetail &&
      APITestStore.getApiDetail.responses.length ? APITestStore.getApiDetail.responses[0].body || 'false' : '{}';
    let handledDescWithComment = Hjson.parse(responseDataExample, { keepWsc: true });
    window.console.log(handledDescWithComment)
    handledDescWithComment = Hjson.stringify(handledDescWithComment, options);
    const handledDesc = Hjson.parse(desc);
    const { permission = { roles: [] } } = handledDesc;
    const roles = permission.roles.length && permission.roles.map((item) => {
      return {
        name: '默认角色',
        value: item,
      };
    })
    tableValue[0].value = method;
    tableValue[1].value = url;
    tableValue[2].value = remark;
    tableValue[3].value = permission && permission.action;
    tableValue[4].value = permission && permission.permissionLevel;
    tableValue[5].value = permission && permission.permissionLogin ? '是' : '否';
    tableValue[6].value = permission && permission.permissionPublic ? '是' : '否';
    tableValue[7].value = consumes[0];
    tableValue[8].value = produces[0];
    if (roles) {
      tableValue.splice(5, 0, ...roles);
    }


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
        } else if (text === 'array') {
          return 'Array[string]';
        } else if (!text) {
          if ('type' in record.schema) {
            return record.schema.type;
          } else {
            let value;
            if (record.body) {
              value = Hjson.parse(record.body, { keepWsc: true });
              value = Hjson.stringify(value, options);
            } else {
              value = null;
            }
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
          }
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

  handleSelectChange = (name, select) => {
    let {requestUrl} = this.state;
    // console.log(requestUrl);
    // const aaa = requestUrl.search('123') === -1 ? '没有问号' : '有问号';
    // console.log(aaa);

    if (requestUrl.search('?') !== -1) { // 有问号
      //   if (requestUrl.search(name) !== -1) {
      //     requestUrl = '有了';
      //   } else {
      //     requestUrl += `&${name}=${select}`;
      //   }
      // } else {
      //   requestUrl += `?${name}=${select}`;
      // }
      // this.setState({ requestUrl });
    } else {
      requestUrl += `?${name}=${select}`;
    }

    this.setState({ requestUrl });
  }


  changeTextareaValue = (isBody, e) => {
    if (isBody === 'body') {
      let postBody = JSON.stringify(e.target.value);
      postBody = Hjson.parse(postBody);
    }
  }


  getTest = () => {
    const method = APITestStore && APITestStore.apiDetail.method;
    const { getFieldDecorator, getFieldError } = this.props.form;
    const requestColumns = [{
      title: <FormattedMessage id={`${intlPrefix}.param.name`} />,
      dataIndex: 'name',
      key: 'name',
      width: '30%',
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
      render: (text, record) => {
        let editableNode;
        if (!record.type) {
          editableNode = (
            <div style={{ width: '50%' }}>
              <FormItem>
                {getFieldDecorator('bodyData', {
                  rules: [{
                    required: !record.type ? true : false,
                    message: `请输入${record.name}`,
                  }],
                })(
                  <TextArea className="paramTextarea" rows={6} placeholder={getFieldError(`${record.name}`)} onChange={this.changeTextareaValue.bind(this, record.in)} />,
                )}
              </FormItem>
            </div>);
        } else if (record.type === 'boolean') {
          editableNode = (<FormItem>
            {getFieldDecorator(`${record.name}`, {
              rules: [],
            })(
              <div style={{ width: '55px' }}>
                <Select
                  dropdownStyle={{ width: '55px' }}
                  defaultValue=""
                  onChange={this.handleSelectChange.bind(this, record.name)}
                >
                  <Option value="" style={{ height: '22px' }}> </Option>
                  <Option value="true">true</Option>
                  <Option value="false">false</Option>
                </Select>
              </div>
            )}
          </FormItem>);
        } else if (record.type === 'array') {
          editableNode = (
            <div style={{ width: '50%' }}>
              <FormItem>
                {getFieldDecorator(`${record.name}`, {
                  rules: [{
                    required: !record.type ? true : false,
                    message: `请输入${record.name}`,
                  }],
                })(
                  <TextArea className="paramTextarea" rows={6} placeholder={getFieldError(`${record.name}`)} onChange={this.changeTextareaValue.bind(this, record.in)} />,
                )}
              </FormItem>
            </div>);
        } else {
          editableNode = (<FormItem>
            {getFieldDecorator(`${record.name}`, {
              rules: [{
                required: record.required,
                message: `请输入${record.name}`,
              }],
            })(
              <div style={{ width: '50%' }}>
                <Input autoComplete="off" onChange={this.changeNormalValue.bind(this, record.name, record.in)} placeholder={getFieldError(`${record.name}`)} />
              </div>,
            )}
          </FormItem>);
        }
        return editableNode;
      },
    }, {
      title: <FormattedMessage id={`${intlPrefix}.request.data.type`} />,
      dataIndex: 'type',
      key: 'type',
      width: '40%',
      render: (text, record) => {
        if (text === 'integer' && record.format === 'int64') {
          return 'long';
        } else if (text === 'array') {
          return 'Array[string]';
        } else if (!text) {
          if ('type' in record.schema) {
            return record.schema.type;
          } else {
            let value;
            if (record.body) {
              value = Hjson.parse(record.body, { keepWsc: true });
              value = Hjson.stringify(value, options);
            } else {
              value = null;
            }
            return (
              <div>
                Example Value
                <Tooltip placement="left" title="点击复制至左侧">
                  <div className="body-container" onClick={this.copyToLeft.bind(this, value, record.name)}>
                    <pre>
                      <code>
                        {value}
                      </code>
                    </pre>
                  </div>
                </Tooltip>
              </div>
            );
          }
        } else {
          return text;
        }
      },
    }]

    return (
      <div className="c7n-interface-test">
        <div className="c7n-interface-test-response-params">
          <h5><FormattedMessage id={`${intlPrefix}.request.parameter`} /></h5>
          <Form>
            <Table
              pagination={false}
              filterBar={false}
              columns={requestColumns}
              dataSource={APITestStore && APITestStore.apiDetail.parameters}
              rowKey="name"
            />
          </Form>
        </div>
        <div className="c7n-url-container">
          <span className={classnames('method', method)}>{method}</span>
          <input type="text" value={this.state.requestUrl} readOnly />
          {!this.state.isSending ? (
            <Button
              funcType="raised"
              type="primary"
              htmlType="submit"
              onClick={this.handleSubmit}
            >
              发送
            </Button>
          ) : (
            <Button
              funcType="raised"
              type="primary"
            >
              发送中...
            </Button>
          )
          }
        </div>
        <div style={{ textAlign: 'center', paddingTop: '100px', display: this.state.isShowResult === false ? 'block' : 'none' }}><Spin size="large" /></div>
        <div className="c7n-response-container" style={{ display: this.state.isShowResult === true ? 'block' : 'none' }}>
          <div className="c7n-response-code">
            <h5><FormattedMessage id={`${intlPrefix}.response.code`} /></h5>
            <div className="response-code-container">
              {statusCode}
            </div>
          </div>
          <div className="c7n-response-body">
            <h5><FormattedMessage id={`${intlPrefix}.response.body`} /></h5>
            <div className="response-body-container">
              <pre>
                <code>
                  {response}
                </code>
              </pre>
            </div>
          </div>
          <div className="c7n-response-body">
            <h5><FormattedMessage id={`${intlPrefix}.response.headers`} /></h5>
            <div className="response-body-container">
              <pre>
                <code>
                  {responseHeader}
                </code>
              </pre>
            </div>
          </div>
          <div className="c7n-curl">
            <h5>CURL</h5>
            <div className="curl-container" />
          </div>
        </div>
      </div>
    );
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ isSending: true, isShowResult: false });
        if ('bodyData' in values) {
          instance[APITestStore.getApiDetail.method](this.state.requestUrl, JSON.stringify(Hjson.parse(values.bodyData))).then(function (res) {
            this.setState({
              isSending: false,
              isShowResult: true,
            });
          }).catch((error) => {
            this.setState({
              isSending: false,
              isShowResult: true,
            });
          });
        } else {
          instance[APITestStore.getApiDetail.method](this.state.requestUrl).then(function (res) {
            this.setState({
              isSending: false,
              isShowResult: true,
            });
          }).catch((error) => {
            this.setState({
              isSending: false,
              isShowResult: true,
            });
          });
        }
      }
    });
  }

  copyToLeft(value, name) {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ bodyData: value });
  }

  changeNormalValue = (name, paramPosition, e) => {
    if (paramPosition === 'query') {
      let handledQuery = `&${name}=${e.target.value}`;
    } else {
      const { urlPathValues } = this.state;
      let requestUrl = `${urlPrefix}${APITestStore.getApiDetail.basePath}${APITestStore.getApiDetail.url}`;
      urlPathValues[`{${name}}`] = e.target.value;
      Object.entries(urlPathValues).forEach((items) => {
        requestUrl = items[1] ? requestUrl.replace(items[0], items[1]) : requestUrl;
      });
      this.setState({ requestUrl, urlPathValues });
    }
  }

  render() {
    const url = APITestStore && APITestStore.apiDetail.url;
    return (
      <Page>
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
          backPath="/iam/api-test"
        />
        {this.state.loading ? <div style={{ textAlign: 'center', paddingTop: '250px' }}><Spin size="large" /></div> :
          (
            <div>
              <Content
                className="c7n-api-test"
                code={`${intlPrefix}.detail`}
                values={{ name: url }}
              >
                <Tabs>
                  <TabPane tab={<FormattedMessage id={`${intlPrefix}.interface.detail`} />} key="detail">
                    {this.getDetail()}
                  </TabPane>
                  <TabPane tab={<FormattedMessage id={`${intlPrefix}.interface.test`} />} key="test">
                    {this.getTest()}
                  </TabPane>
                </Tabs>
              </Content>
            </div>
          )
        }
      </Page>
    );
  }
}
