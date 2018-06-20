/**
 * Created by hulingfangzi on 2018/6/20.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button,  Form, Modal, Progress, Select, Table } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { Action, axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import querystring from 'query-string';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;

@inject('AppState')
@observer

class Instance extends Component {
  // state = this.getInitState();
  //
  // getInitState() {
  //   return {
  //
  //   }
  // }

  render() {
    return (
      <Page>
        <Header
          title="实例管理"
        >
          <Button
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content />
      </Page>
    )
  }
}

export default Form.create({})(withRouter(Instance));
