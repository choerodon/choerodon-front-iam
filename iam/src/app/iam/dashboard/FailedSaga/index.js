import React, { Component } from 'react';
import { DashBoardNavBar, DashBoardToolBar } from 'choerodon-front-boot';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { inject, observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import moment from 'moment';
import { Button, Icon, Select, Spin } from 'choerodon-ui';
import './index.scss';
import FailedSagaStore from '../../stores/dashboard/failedSaga';
import TimePicker from './TimePicker';

const intlPrefix = 'dashboard.failedsaga';

@withRouter
@inject('AppState')
@observer
export default class FailedSaga extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateType: 'seven',
    };
  }

  componentDidMount() {
    this.loadChart();
  }

  componentWillUnmount() {
    FailedSagaStore.setStartTime(moment().subtract(6, 'days'));
    FailedSagaStore.setEndTime(moment());
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
        bottom: '1%',
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
        <DashBoardToolBar>
          <TimePicker
            startTime={FailedSagaStore.getStartTime}
            endTime={FailedSagaStore.getEndTime}
            func={this.loadChart}
            type={dateType}
            onChange={this.handleDateChoose}
            store={FailedSagaStore}
          />
        </DashBoardToolBar>
        <div id="c7n-iam-dashboard-failedsaga-chart">
          <Spin spinning={FailedSagaStore.loading}>
            <ReactEcharts
              style={{ height: '220px' }}
              option={this.getOption()}
            />
          </Spin>
        </div>
        <DashBoardNavBar>
          <Link to="/iam/saga-instance">转至事务实例</Link>
        </DashBoardNavBar>
      </React.Fragment>
    );
  }
}
