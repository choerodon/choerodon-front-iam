import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { DashBoardNavBar, DashboardToolBar } from 'choerodon-front-boot';
import './index.scss';

export default class FailedSaga extends Component {
  render() {
    return (
      <div>
      test
        <DashBoardNavBar>
          <Link to="/iam/saga-instance">转至事务实例</Link>
        </DashBoardNavBar>
      </div>
    );
  }
}
