/**
 * Created by hulingfangzi on 2018/5/28.
 */

import React, { Component } from 'react';
import { Button, Col, Form, Icon, Input, Modal, Row, Select, Spin, Table, Tooltip } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import Page, { Header, Content } from 'Page';

class Route extends Component {
  render() {
    return (
      <Page>
        <Header
          title="路由管理"
        />
        <Content />
      </Page>
    );
  }
}

export default Form.create({})(withRouter(Route));
