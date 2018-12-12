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
import TimePicker from './TimePicker';

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
    this.loadSecChart();
  }

  getInitState() {
    return {
      dateType: 'seven',
    };
  }

  handleDateChoose = (type) => {
    this.setState({ dateType: type });
  };

  loadFirstChart = () => {
    APIOverviewStore.setFirstLoading(true);
    APIOverviewStore.loadFirstChart();
  }

  loadSecChart = () => {
    const startDate = APIOverviewStore.getSecStartTime.format().split('T')[0];
    const endDate = APIOverviewStore.getSecEndTime.format().split('T')[0];
    APIOverviewStore.loadSecChart(startDate, endDate);
  };


  getFirstChart = () => (
    <div className="c7n-iam-api-overview-top-container-first-container">
      {
          APIOverviewStore.firstLoading ? (
            <Spin spinning={APIOverviewStore.firstLoading} />
          ) : (
            <ReactEcharts
              style={{ width: '100%', height: 380 }}
              option={this.getFirstChartOption()}
            />
          )
        }
    </div>
  )

  getSecChart = () => {
    const { dateType } = this.state;
    return (
      <div className="c7n-iam-api-overview-top-container-sec-container">
        <Spin spinning={APIOverviewStore.secLoading}>
          <div className="c7n-iam-api-overview-top-container-sec-container-timewrapper">
            <TimePicker
              showDatePicker={false}
              startTime={APIOverviewStore.getSecStartTime}
              endTime={APIOverviewStore.getSecEndTime}
              func={this.loadSecChart}
              type={dateType}
              onChange={this.handleDateChoose}
              store={APIOverviewStore}
              sort={2}
            />
          </div>
          <ReactEcharts
            style={{ width: '100%', height: 380 }}
            option={this.getSecChartOption()}
          />
        </Spin>
      </div>
    );
  }

  getThirdChart = () => (
    <div className="c7n-iam-api-overview-third-container">
      {
          APIOverviewStore.thirdLoaidng ? (
            <Spin spinning={APIOverviewStore.thirdLoaidng} />
          ) : (
            <ReactEcharts
              style={{ width: '100%', height: 400 }}
              option={this.getFirstChartOption()}
            />
          )
        }
    </div>
  )


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
        right: 15,
        y: 'center',
        type: 'plain',
        data: firstChartData ? firstChartData.services : [],
        orient: 'vertical', // 图例纵向排列
        icon: 'circle',
      },
      // calculable: true,
      series: [
        {
          type: 'pie',
          radius: [20, 110],
          center: ['31%', '50%'],
          roseType: 'radius',
          // minAngle: 30,
          label: {
            normal: {
              show: false,
            },
          },
          data: handledFirstChartData || {},
        },
      ],
      color: ['#FDB34E', '#5266D4', '#FD717C', '#53B9FC', '#F44336', '#6B83FC', '#B5D7FD', '#00BFA5'],
    };
  }

  // 获取第二个图表的配置参数
  getSecChartOption() {
    const secChartData = APIOverviewStore.getSecChartData;
    const { intl: { formatMessage } } = this.props;
    let handleSeriesData = [];
    const color = ['#FDB34E', '#5266D4', '#FD717C', '#53B9FC', '#F44336', '#6B83FC', '#B5D7FD', '#00BFA5'];
    if (secChartData) {
      handleSeriesData = secChartData.details.map(item => ({
        type: 'line',
        name: item.service,
        data: item.data,
        smooth: 0.5,
        smoothMonotone: 'x',
        symbol: 'circle',
        areaStyle: {
          opacity: '0.5',
        },
      }));
    }
    return {
      title: {
        text: '各服务API调用总数',
        textStyle: {
          color: 'rgba(0,0,0,0.87)',
          fontWeight: '400',
        },
        top: 20,
        left: 16,
      },
      tooltip: {
        trigger: 'axis',
        confine: true,
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
      },
      legend: {
        top: 60,
        right: 16,
        type: 'plain',
        orient: 'vertical', // 图例纵向排列
        icon: 'circle',
        data: secChartData ? secChartData.services : [],
      },
      grid: {
        left: '3%',
        top: 110,
        containLabel: true,
        width: '65%',
        height: '55%',
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: '#eee',
              type: 'solid',
              width: 2,
            },
            onZero: true,
          },
          axisLabel: {
            margin: 7, // X轴文字和坐标线之间的间距
            textStyle: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 12,
            },
            formatter(value) {
              const month = value.split('-')[1];
              const day = value.split('-')[2];
              return `${month}-${day}`;
            },
          },
          splitLine: {
            lineStyle: {
              color: ['#eee'],
              width: 1,
              type: 'solid',
            },
          },
          data: secChartData ? secChartData.date : [],
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: '次数',
          nameLocation: 'end',
          nameTextStyle: {
            color: '#000',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#eee',
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#eee'],
            },
          },
          axisLabel: {
            color: 'rgba(0,0,0,0.65)',
          },
        },
      ],
      series: handleSeriesData,
      color: ['#FDB34E', '#5266D4', '#FD717C', '#53B9FC', '#F44336', '#6B83FC', '#B5D7FD', '#00BFA5'],
    };
  }


  render() {
    return (
      <Page
        service={[
          'manager-service.api.queryInstancesAndApiCount',
          'manager-service.api.queryApiInvoke',
          'manager-service.api.queryServiceInvoke',
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
          <div className="c7n-iam-api-overview-top-container">
            {this.getFirstChart()}
            {this.getSecChart()}
          </div>
          {/* {this.getThirdChart()} */}
        </Content>
      </Page>
    );
  }
}
