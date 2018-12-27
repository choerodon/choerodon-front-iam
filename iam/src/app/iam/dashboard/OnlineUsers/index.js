import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { inject, observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import moment from 'moment';
import { Button, Icon, Select, Spin } from 'choerodon-ui';
import FailedSagaStore from '../../stores/dashboard/failedSaga';

const intlPrefix = 'dashboard.failedsaga';

@withRouter
@inject('AppState')
@observer
export default class OnlineUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateType: 'seven',
    };
  }

  componentWillMount() {
    this.loadChart();
  }

  componentDidMount() {
    this.setShowSize();
  }

  componentWillReceiveProps(nextProps) {
    this.setShowSize();
  }


  componentWillUnmount() {
    FailedSagaStore.setStartTime(moment().subtract(6, 'days'));
    FailedSagaStore.setEndTime(moment());
  }

  setShowSize() {
    const { showSize } = FailedSagaStore;
    const newSize = this.chartRef.parentElement.parentElement.parentElement.clientHeight - 51 - 10;
    if (newSize !== showSize) {
      FailedSagaStore.setShowSize(newSize);
    }
  }


  loadChart = () => {
    FailedSagaStore.setLoading(true);
    const startDate = FailedSagaStore.getStartTime.format().split('T')[0];
    const endDate = FailedSagaStore.getEndTime.format().split('T')[0];
    FailedSagaStore.loadData(startDate, endDate);
  }

  handleDateChoose = (type) => {
    this.setState({ dateType: type });
  };

  getOption() {
    const chartData = FailedSagaStore.getChartData;
    return {
      color: ['#F44336'],
      tooltip: {
        trigger: 'axis',
        confine: true,
        borderWidth: 1,
        backgroundColor: '#fff',
        borderColor: '#DDDDDD',
        extraCssText: 'box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20)',
        textStyle: {
          fontSize: 13,
          color: '#000000',
        },
      },
      grid: {
        top: '30px',
        left: '3%',
        right: '4%',
        bottom: '0px',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: chartData ? chartData.date : [],
          axisLine: {
            lineStyle: {
              color: '#eee',
              type: 'solid',
              width: 2,
            },
            onZero: true,
          },
          axisLabel: {
            margin: 11, // X轴文字和坐标线之间的间距
            textStyle: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 12,
            },
            formatter(value) {
              const month = value.split('-')[1];
              const day = value.split('-')[2];
              return `${month}/${day}`;
            },
          },
          axisTick: {
            alignWithLabel: true,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#eee'],
              width: 1,
              type: 'solid',
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          minInterval: 1,
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
      series: [
        {
          name: '失败次数',
          type: 'bar',
          barWidth: '60%',
          data: chartData ? chartData.data : [],
        },
      ],
    };
  }

  render() {
    const { dateType } = this.state;
    return (
      <React.Fragment>
        <Spin spinning={FailedSagaStore.loading}>
          <div id="c7n-iam-dashboard-failedsaga-chart" ref={(e) => { this.chartRef = e; }} style={{ height: `${FailedSagaStore.showSize}px` }}>
            <ReactEcharts
              style={{ height: '100%' }}
              option={this.getOption()}
            />

          </div>
        </Spin>
      </React.Fragment>
    );
  }
}
