import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Modal, Table, Tooltip } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';

const { Sidebar } = Modal;
const intlPrefix = 'global.rolelabel';

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
class RoleLabel extends Component {
  render() {
    return (<div />);
  }
}
