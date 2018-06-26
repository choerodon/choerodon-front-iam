/**
 * Created by hulingfangzi on 2018/6/26.
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, Permission, axios } from 'choerodon-front-boot';
import { Input, Button, Table, Modal, Row, Col, Tabs } from 'choerodon-ui';
import querystring from 'query-string';
import { injectIntl, FormattedMessage } from 'react-intl';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/dawn';
import './InstanceDetail.scss';
import InstanceStore from '../../../../stores/globalStores/instance'

const { TabPane } = Tabs;
const intlPrefix = 'global.instance';


class InstanceDetail extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      // tabKey: '1',
      instanceId: this.props.match.params.id,
      info: null,
      metadata: null,
      loading: true,
    }
  }

  componentWillMount() {
    this.setState({
      loading: true,
    });
    InstanceStore.loadInstanceInfo(this.state.instanceId).then((data) => {
      if (data.failed) {
        this.setState({
          loading: false,
        });
        Choerodon.prompt(data.message);
      } else {
        let metadata = Object.assign({}, data.metadata);
        metadata = Object.entries(metadata).map((item) => {
          return {
            name: item[0],
            value: item[1],
          }
        })
        this.setState({
          info: data,
          metadata: metadata,
          loading: false,
        })
      }
    })
  }

  getInstanceInfo = () => {
    const { info, loading, metadata } = this.state;
    const columns = [{
      title: '名字',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '值',
      dataIndex: 'value',
      key: 'value',
    }];
    return (
      <div className="instanceInfoContainer">
        <div className="instanceInfo">
          <Row>
            <Col span={5}>实例ID：</Col>
            <Col span={19}>{info && info.instanceId}</Col>
          </Row>
          <Row>
            <Col span={5}>主机名：</Col>
            <Col span={19}>{info && info.hostName}</Col>
          </Row>
          <Row>
            <Col span={5}>IP：</Col>
            <Col span={19}>{info && info.ipAddr}</Col>
          </Row>
          <Row>
            <Col span={5}>所属微服务：</Col>
            <Col span={19}>{info && info.app}</Col>
          </Row>
          <Row>
            <Col span={5}>端口号：</Col>
            <Col span={19}>{info && info.port}</Col>
          </Row>
          <Row>
            <Col span={5}>实例版本：</Col>
            <Col span={19}>{info && info.version}</Col>
          </Row>
          <Row>
            <Col span={5}>注册时间：</Col>
            <Col span={19}>{info && info.registrationTime}</Col>
          </Row>
          <Row>
            <Col span={5}>元数据</Col>
          </Row>
        </div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={metadata}
          rowkey="name"
          pagination={false}
        />
      </div>
    )
  }

  getConfigInfo = () => {
    return (
      <div className="configContainer">
        <div>
          <p>配置信息</p>
          <AceEditor
            showPrintMargin={false}
            mode="yaml"
            theme="dawn"
            style={{ height: '500px', width: '100%' }}
          />
        </div>
        <div>
          <p>环境信息</p>
          <AceEditor
            showPrintMargin={false}
            mode="yaml"
            theme="dawn"
            style={{ height: '500px', width: '100%' }}
          />
        </div>
      </div>
    )
  }

  render() {
    let code;
    let values;
    values = { name: `${process.env.HEADER_TITLE_NAME || 'Choerodon'}` };
    code = `${intlPrefix}.detail`
    // const { tabKey } = this.state;
    return (
      <Page>
        <Header
          title="实例详情"
          backPath="/iam/instance"
        />
        <Content
          code={code}
          value={values}
        >
          <Tabs>
            <TabPane tab="实例信息" key="1">{this.getInstanceInfo()}</TabPane>
            <TabPane tab="配置环境信息" key="2">{this.getConfigInfo()}</TabPane>
          </Tabs>
        </Content>
      </Page>
    )
  }
}

export default withRouter(InstanceDetail);


