/**
 * Created by hulingfangzi on 2018/6/6.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import './syncLoading.scss';

const intlPrefix = 'organization.ldap';

@observer
export default class SyncLoading extends Component {
  render() {
    return (
      <div className="loadingContainer">
        <div className="connectLoader">
          <svg className="connectCircular" viewBox="25 25 50 50">
            <circle className="connectPath" cx="50" cy="50" r="22" fill="none" strokeWidth="3" strokeMiterlimit="10" />
          </svg>
        </div>
        <p className="loadingText"><FormattedMessage id={`${intlPrefix}.sync.loading`}/></p>
        <p className="tipText"><FormattedMessage id={`${intlPrefix}.sync.loading.tip`}/></p>
      </div>
    );
  }
}
