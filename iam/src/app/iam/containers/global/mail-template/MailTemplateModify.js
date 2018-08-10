import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Content, Header, Page, Permission, axios } from 'choerodon-front-boot';
import { Input, Button, Form, Steps, Select, Modal, Row, Col } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';

@inject('AppState')
@observer
class ModifyMailTemplate extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      loading: true,
    };
  }


  render() {
    return (
      <Page>
        <Header
          backPath="/iam/mail-template"
        />
        <Content />
      </Page>
    );
  }
}


export default Form.create({})(withRouter(injectIntl(ModifyMailTemplate)));
