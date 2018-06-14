/**
 * Created by hulingfangzi on 2018/6/14.
 */
import React, { Component } from 'react';
import { Checkbox, Table } from 'choerodon-ui';
import { axios, Content } from 'choerodon-front-boot';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import querystring from 'query-string';
import  './ApplyConfig.scss';
import ConfigurationStore from '../../../../stores/globalStores/configuration';

@inject('AppState')
@observer
class ApplyConfig extends Component {
  state = this.getInitState();

  getInitState() {
    return {
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
      params: '',
    };
  }

  componentWillMount() {
    this.props.onRef(this);
    this.loadInstance();
  }

  loadInstance(paginationIn, sortIn, paramsIn) {
    ConfigurationStore.setInstanceLoading(true);
    const {
      pagination: paginationState,
      sort: sortState,
      params: paramsState,
    } = this.state;
    const pagination = paginationIn || paginationState;
    const sort = sortIn || sortState;
    const params = paramsIn || paramsState;
    this.fetch(this.props.service, pagination, sort, params)
      .then((data) => {
      window.console.log(data);
        this.setState({
          sort,
          params,
          pagination: {
            current: data.number + 1,
            pageSize: data.size,
            total: data.totalElements,
          },
        });
        ConfigurationStore.setInstanceData(data.content.slice()),
        ConfigurationStore.setInstanceLoading(false);
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  }

  fetch(serviceName, { current, pageSize }, { columnKey = 'id', order = 'descend' }, params) {
    ConfigurationStore.setInstanceLoading(true);
    const queryObj = {
      page: current - 1,
      size: pageSize,
      params,
    };
    if (columnKey) {
      const sorter = [];
      sorter.push(columnKey);
      if (order === 'descend') {
        sorter.push('desc');
      }
      queryObj.sort = sorter.join(',');
    }
    return axios.get(`/manager/v1/instances/${serviceName}?${querystring.stringify(queryObj)}`);
  }

  render() {
    return (
      <Content
        className="sidebar-content"
        title="将配置应用到实例"
        description="一个实例只能应用一个配置，但一个配置可以被多个实例应用。你可以选择个多个实例进行批量应用。勾选要应用该配置的实例后，点击保存，使配置的应用生效。"
        link="http://v0-6.choerodon.io/zh/docs/user-guide/system-configuration/microservice-management/route/"
      >
        <Table
          style={{
            width: '512px',
          }}
          columns={[{
            title: '实例ID',
            dataIndex: 'code',
            key: 'code'
          }]}
        />
      </Content>
    );
  }
}

export default withRouter(ApplyConfig);
