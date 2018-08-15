/**
 * Created by hulingfangzi on 2018/6/26.
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page } from 'choerodon-front-boot';
import { Table, Row, Col, Tabs } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import AceEditor from 'react-ace';
import 'brace/mode/yaml';
import 'brace/theme/dawn';
import InstanceStore from '../../../stores/global/instance';
import './Instance.scss';

const { TabPane } = Tabs;
const intlPrefix = 'global.instance';

@withRouter
@injectIntl
export default class InstanceDetail extends Component {
  state = this.getInitState();

  instanceId = null;

  getInitState() {
    return {
      info: null,
      metadata: null,
      loading: true,
    };
  }

  constructor(props) {
    super(props);
    this.instanceId = props.match.params.id;
  }

  componentWillMount() {
    this.setState({
      loading: true,
    });
    InstanceStore.loadInstanceInfo(this.instanceId).then((data) => {
      if (data.failed) {
        this.setState({
          loading: false,
        });
        Choerodon.prompt(data.message);
      } else {
        let metadata = Object.assign({}, data.metadata);
        metadata = Object.entries(metadata).map(item => ({
          name: item[0],
          value: item[1],
        }));
        this.setState({
          info: data,
          metadata,
          loading: false,
        });
      }
    });
  }

  getInstanceInfo = () => {
    const { info, loading, metadata } = this.state;
    const { intl } = this.props;
    const columns = [{
      title: <FormattedMessage id={`${intlPrefix}.name`} />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id={`${intlPrefix}.value`} />,
      dataIndex: 'value',
      key: 'value',
    }];
    return (
      <div className="instanceInfoContainer">
        <div className="instanceInfo">
          <Row>
            <Col span={5}><FormattedMessage id={`${intlPrefix}.instanceid`} />：</Col>
            <Col span={19}>{info && info.instanceId}</Col>
          </Row>
          <Row>
            <Col span={5}><FormattedMessage id={`${intlPrefix}.hostname`} />：</Col>
            <Col span={19}>{info && info.hostName}</Col>
          </Row>
          <Row>
            <Col span={5}><FormattedMessage id={`${intlPrefix}.ip`} />：</Col>
            <Col span={19}>{info && info.ipAddr}</Col>
          </Row>
          <Row>
            <Col span={5}><FormattedMessage id={`${intlPrefix}.service`} />：</Col>
            <Col span={19}>{info && info.app}</Col>
          </Row>
          <Row>
            <Col span={5}><FormattedMessage id={`${intlPrefix}.port`} />：</Col>
            <Col span={19}>{info && info.port}</Col>
          </Row>
          <Row>
            <Col span={5}><FormattedMessage id={`${intlPrefix}.version`} />：</Col>
            <Col span={19}>{info && info.version}</Col>
          </Row>
          <Row>
            <Col span={5}><FormattedMessage id={`${intlPrefix}.registertime`} />：</Col>
            <Col span={19}>{info && info.registrationTime}</Col>
          </Row>
          <Row>
            <Col span={5}><FormattedMessage id={`${intlPrefix}.metadata`} /></Col>
          </Row>
        </div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={metadata}
          rowkey="name"
          pagination={false}
          filterBarPlaceholder={intl.formatMessage({ id: 'filtertable' })}
        />
      </div>
    );
  }

  getConfigInfo = () => {
    let configInfo = '';
    let envinfo = '';
    if (this.state.info && this.state.info.configInfoYml) {
      configInfo = this.state.info.configInfoYml.yaml;
    }

    if (this.state.info && this.state.info.envInfoYml) {
      envinfo = this.state.info.envInfoYml.yaml;
    }

    return (
      <div className="configContainer">
        <div>
          <p><FormattedMessage id={`${intlPrefix}.configinfo`} /></p>
          <AceEditor
            readOnly
            showPrintMargin={false}
            mode="yaml"
            theme="dawn"
            defaultValue=""
            value={configInfo}
            style={{ height: '650px', width: '100%' }}
          />
        </div>
        <div>
          <p><FormattedMessage id={`${intlPrefix}.envinfo`} /></p>
          <AceEditor
            readOnly
            showPrintMargin={false}
            mode="yaml"
            theme="dawn"
            value={envinfo}
            style={{ height: '650px', width: '100%' }}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <Page>
        <Header
          title={<FormattedMessage id={`${intlPrefix}.detail`} />}
          backPath="/iam/instance"
        />
        <Content
          code={`${intlPrefix}.detail`}
          values={{ name: this.instanceId }}
        >
          <Tabs>
            <TabPane tab={<FormattedMessage id={`${intlPrefix}.instanceinfo`} />} key="instanceinfo">{this.getInstanceInfo()}</TabPane>
            <TabPane tab={<FormattedMessage id={`${intlPrefix}.configenvInfo`} />} key="configenvInfo">{this.getConfigInfo()}</TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}
