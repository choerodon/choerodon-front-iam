import React, { Component } from 'react';
import { Icon, Tabs } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import './style/saga-img.scss';
import './style/saga.scss';

const intlPrefix = 'global.saga';
const { TabPane } = Tabs;

@injectIntl
export default class SagaImg extends Component {
  state = this.getInitState();
  getInitState() {
    return {
      showDetail: false,
      task: {},
      json: '',
      lineData: {},
      activeCode: '',
      activeTab: 'run',
      jsonTitle: false, // 是否展示input output
    };
  }
  componentWillMount() {
    this.getLineData();
  }

  componentWillReceiveProps() {
    this.setState(this.getInitState());
    this.getLineData();
  }

  getLineData = () => {
    const { data: { tasks } } = this.props;
    const lineData = {};
    tasks.forEach(items => items.forEach(
      (task) => { lineData[task.code || task.taskCode] = task; }));
    this.setState({
      lineData,
    });
  }

  circleWrapper = (code) => {
    const { activeCode } = this.state;
    const clsNames = classnames('c7n-saga-img-circle', {
      'c7n-saga-task-active': code.toLowerCase() === activeCode,
    });
    return (
      <div
        className={clsNames}
        onClick={this.showDetail.bind(this, code.toLowerCase())}
        key={code}
      >
        {code}
      </div>
    );
  };

  squareWrapper = (node, status = '') => {
    if (typeof node === 'string') {
      const { instance } = this.props;
      const { activeCode } = this.state;
      const clsNames = classnames('c7n-saga-img-square', {
        'c7n-saga-task-active': node === activeCode,
        [status.toLowerCase()]: !!instance,
      });
      return (
        <div
          className={clsNames}
          onClick={this.showDetail.bind(this, node)}
          key={node}
        >
          {node}
        </div>
      );
    }
    return (
      <div className="c7n-saga-img-squares">
        {node}
      </div>
    );
  }

  line = () => {
    return (
      <div className="c7n-saga-img-line" />
    );
  };

  showDetail = (code) => {
    const { instance } = this.props;
    if (!instance && code === 'output') {
      return;
    }
    if (code === 'input' || code === 'output') {
      const { intl: { formatMessage } } = this.props;
      const { data } = this.props;
      this.setState({
        showDetail: false,
        jsonTitle: formatMessage({ id: `${intlPrefix}.task.${code}.title` }),
        json: data[code],
        activeCode: code,
      });
      return;
    }
    const { lineData } = this.state;
    const task = { ...lineData[code] };
    this.setState({
      showDetail: true,
      jsonTitle: false,
      task,
      activeCode: code,
    });

  }

  handleTabChange = (activeTab) => {
    this.setState({
      activeTab,
    });
  }

  renderContent = () => {
    const { data: { tasks } } = this.props;
    const line = this.line();
    const content = [];
    if (tasks.length) {
      content.push(line);
      tasks.forEach((items, index) => {
        const node = items.map((
          { code, taskCode, status }) => this.squareWrapper(code || taskCode, status));
        if (node.length === 1) {
          content.push(node);
        } else {
          content.push(this.squareWrapper(node));
        }
        content.push(line);
      });
      return content;
    }
    return line;
  }

  renderStatus(status) {
    let obj = {};
    switch (status) {
      case 'RUNNING':
        obj = {
          key: 'running',
          value: '运行中',
        };
        break;
      case 'FAILED':
        obj = {
          key: 'failed',
          value: '失败',
        };
        break;
      case 'QUEUE':
        obj = {
          key: 'queue',
          value: '等待中',
        };
        break;
      case 'COMPLETED':
        obj = {
          key: 'completed',
          value: '完成',
        };
        break;
      default:
        break;
    }
    return (
      <span className={`c7n-saga-status ${obj.key}`}>
        {obj.value}
      </span>
    );
  }

  instanceLock
    :
    null
  maxRetryCount
    :
    0
  output
    :
    null
  refId
    :
    "324"
  refType
    :
    "project"
  retriedCount
    :
    0
  sagaCode
    :
    "iam-create-project"
  sagaInstanceId
    :
    1
  seq
    :
    0
  status
    :
    "RUNNING"
  taskCode
    :
    "123"
  timeoutPolicy
    :
    "123"
  timeoutSeconds
    :
    3434
  renderTaskRunDetail = () => {
    const { intl: { formatMessage } } = this.props;
    const { task: {
      code,
      taskCode,
      status,
      seq,
      maxRetryCount,
      retriedCount,
      instanceLock,
      exceptionMessage,
      output } } = this.state;
    const list = [{
      key: formatMessage({ id: `${intlPrefix}.task.code` }),
      value: code || taskCode,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.run.status` }),
      value: this.renderStatus(status),
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.seq` }),
      value: seq,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.run.service-instance` }),
      value: instanceLock,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.max-retry` }),
      value: maxRetryCount,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.run.retried` }),
      value: retriedCount,
    }];
    const failed = {
      key: formatMessage({ id: `${intlPrefix}.task.run.exception.msg` }),
      value: exceptionMessage,
    };
    const completed = {
      key: formatMessage({ id: `${intlPrefix}.task.run.result.msg` }),
      value: output,
    };
    return (
      <div className="c7n-saga-task-run">
        <div className="c7n-saga-task-detail">
          <div className="c7n-saga-task-detail-content">
            {list.map(({ key, value }, index) => <div key={`task-run-${index}`}>{key}: {value}</div>)}
            {status === 'FAILED' && (<div>{failed.key}: {failed.value}</div>) }
            {status === 'COMPLETED' && (
              <div>{completed.key}:
                <div className="c7n-saga-detail-json">
                  <pre><code>{completed.value}</code></pre>
                </div>
              </div>)}
          </div>
        </div>
        <div className="c7n-saga-task-btns">
          <span>
            <Icon type="lock_open" />
            {formatMessage({ id: `${intlPrefix}.task.unlock` })}
          </span>
          <span>
            <Icon type="sync" />
            {formatMessage({ id: `${intlPrefix}.task.retry` })}
          </span>
        </div>
      </div>
    );
  }

  renderTaskDetail = () => {
    const { intl: { formatMessage } } = this.props;
    const { task: {
      code,
      taskCode,
      description,
      seq,
      maxRetryCount,
      timeoutSeconds,
      timeoutPolicy,
      service } } = this.state;
    const list = [{
      key: formatMessage({ id: `${intlPrefix}.task.code` }),
      value: code || taskCode,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.desc` }),
      value: description,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.seq` }),
      value: seq,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.max-retry` }),
      value: maxRetryCount,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.timeout.time` }),
      value: timeoutSeconds,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.timeout.policy` }),
      value: timeoutPolicy,
    }, {
      key: formatMessage({ id: `${intlPrefix}.task.service` }),
      value: service,
    }];
    return (
      <div className="c7n-saga-task-detail">
        <div className="c7n-saga-task-detail-content">
          {list.map(({ key, value }, index) => <div key={`task-detail-${index}`}>{key}: {value}</div>)}
        </div>
      </div>
    );
  }

  renderJson() {
    const { jsonTitle, json } = this.state;
    return (
      <div className="c7n-saga-task-detail">
        <div className="c7n-saga-task-detail-title">
          {jsonTitle}
        </div>
        <div className="c7n-saga-task-detail-content">
          <div className="c7n-saga-detail-json">
            <pre>
              <code id="json">
                {json}
              </code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { instance } = this.props;
    const { showDetail, jsonTitle, activeTab } = this.state;
    const input = this.circleWrapper('Input');
    const output = this.circleWrapper('Output');
    const clsNames = classnames('c7n-saga-img-detail-wrapper', {
      'c7n-saga-instance': !!instance,
    });
    return (
      <div className={clsNames}>
        <div className="c7n-saga-img">
          {input}
          {this.renderContent()}
          {output}
        </div>
        {showDetail && (
          <div className="c7n-saga-img-detail">
            <Tabs defaultActiveKey={instance ? 'run' : 'detail'} onChange={this.handleTabChange}>
              {instance && (<TabPane tab={<FormattedMessage id={`${intlPrefix}.task.run.title`} />} key="run" />)}
              <TabPane tab={<FormattedMessage id={`${intlPrefix}.task.detail.title`} />} key="detail" />
            </Tabs>
            {instance && activeTab === 'run' ? this.renderTaskRunDetail() : this.renderTaskDetail()}
          </div>
        )}
        {jsonTitle && (
          <div className="c7n-saga-img-detail">
            {this.renderJson()}
          </div>
        )}
      </div>
    );
  }
}
