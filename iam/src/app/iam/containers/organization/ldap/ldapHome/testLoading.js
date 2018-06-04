/**
 * Created by hulingfangzi on 2018/6/4.
 */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import './testLoading.scss';

@observer
export default class TestLoading extends Component {
  render() {
    return (
      <div className="connectLoader">
        <svg className="connectCircular" viewBox="25 25 50 50">
          <circle className="connectPath" cx="50" cy="50" r="22" fill="none" strokeWidth="3" strokeMiterlimit="10" />
        </svg>
        <span className="loadingText">测试中</span>
      </div>
    );
  }
}
