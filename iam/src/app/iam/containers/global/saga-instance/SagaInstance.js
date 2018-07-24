import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';

const intlPrefix = 'global.saga-instance';

@injectIntl
@inject('AppState')
@observer
export default class SagaInstance extends Component {
  render() {
    return (<div />);
  }
}
