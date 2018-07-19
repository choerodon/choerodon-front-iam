/**
 * Created by hulingfangzi on 2018/6/4.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Spin } from 'choerodon-ui';
import './TestLoading.scss';


@observer
export default class TestLoading extends Component {
  render() {
    return (
      <div className="loadingContainer">
        <div className="connectLoader">
          <Spin size="large" />
        </div>
        <p className="loadingText">{this.props.tip}</p>
        <p className="tipText">{ this.props.syncTip }</p>
      </div>
    );
  }
}
