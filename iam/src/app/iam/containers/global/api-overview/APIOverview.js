import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { axios, Content, Header, Page, Permission } from 'choerodon-front-boot';
import { Button, Icon, Select, Spin } from 'choerodon-ui';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
import './APIOverview.scss';
import APIOverviewStore from '../../../stores/global/api-overview';

const intlPrefix = 'global.apioverview';
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
const data = { apiCounts: ['106', '134', '177', '53', '23', '6', '83', '78', '197', '4', '29', '63', '168'], services: ['gitlab-service', 'issue-service', 'devops-service', 'notify-service', 'wiki-service', 'organization-service', 'test-manager-service', 'asgard-service', 'agile-service', 'file-service', 'manager-service', 'state-machine-service', 'iam-service'] };


@withRouter
@injectIntl
@inject('AppState')
@observer
export default class APIOverview extends Component {
  state = this.getInitState();

  componentDidMount() {
    this.loadFirstChart();
  }

  getInitState() {
    return {
    };
  }

  loadFirstChart = () => {
    APIOverviewStore.setFirstLoading(true);
    APIOverviewStore.loadFirstChart();
  }

  getFirstChart = () => {
    const { intl } = this.props;
    return (
      <div className="c7n-iam-api-overview-first-container">
        {
          APIOverviewStore.firstLoading ? (
            <Spin spinning={APIOverviewStore.firstLoading} />
          ) : (
            <ReactEcharts
              style={{ width: '100%', height: 380 }}
              className="c7n-buildDuration-echarts"
              option={this.getFirstChartOption()}
            />
          )
        }
      </div>
    );
  }


  // 获取第一个图表的配置参数
  getFirstChartOption() {
    const { firstChartData } = APIOverviewStore;
    let handledFirstChartData;
    if (firstChartData) {
      /* eslint-disable-next-line */
      handledFirstChartData = firstChartData.services.map((item, index) => item = { name: item, value: firstChartData.apiCounts[index] });
    }
    return {
      title: {
        text: '各服务API总数',
        textStyle: {
          color: 'rgba(0,0,0,0.87)',
          fontWeight: '400',
        },
        top: 20,
        left: 16,
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b} <br/>百分比: {d}%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        extraCssText: 'box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20)',
        textStyle: {
          fontSize: 13,
          color: '#000000',
        },
      },
      legend: {
        right: 20,
        y: 'center',
        type: 'plain',
        data: firstChartData ? firstChartData.services : [],
        orient: 'vertical', // 图例纵向排列
        icon: 'circle',
      },
      // calculable: true,
      series: [
        {
          // name: '半径模式',
          type: 'pie',
          radius: [20, 110],
          center: ['35%', '50%'],
          roseType: 'radius',
          // minAngle: 30,
          label: {
            normal: {
              show: false,
            },
            // emphasis: {
            //   show: true,
            // },
          },
          // lableLine: {
          //   length: 2,
          //   length2: 1,
          //   normal: {
          //     show: false,
          //   },
          //   emphasis: {
          //     show: true,
          //   },
          // },
          data: handledFirstChartData || {},
        },
      ],
      color: ['#FDB34E', '#5266D4', '#FD717C', '#53B9FC', '#F44336', '#6B83FC', '#B5D7FD', '#00BFA5'],
    };
  }


  render() {
    return (
      <Page
        service={[
          'manager-service.service.pageManager',
        ]}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          {this.getFirstChart()}
          {/* {this.getSecChart()} */}
          {/* {this.getThirdChart()} */}
        </Content>
      </Page>
    );
  }
}
