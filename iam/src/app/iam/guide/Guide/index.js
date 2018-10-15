import React, { Component } from 'react';
import './index.scss';
import { StepFooter, StepBar } from 'choerodon-front-boot';

export default class Guide extends Component {
  render() {
    return (
      <div>
        <div style={{ width: '90%', margin: '0 auto' }}>
          <StepBar current={1} total={1} />
          guide
        </div>
        <StepFooter total={1} />
      </div>
    );
  }
}
