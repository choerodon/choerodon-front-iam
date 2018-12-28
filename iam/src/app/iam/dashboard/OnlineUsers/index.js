import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { inject, observer } from 'mobx-react';
import ReactEcharts from 'echarts-for-react';
import { WSHandler } from 'choerodon-front-boot';
import { Button, Icon, Select, Spin } from 'choerodon-ui';
import './index.scss';


const intlPrefix = 'dashboard.failedsaga';

@withRouter
@inject('AppState')
@observer
export default class OnlineUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      info: {
        time: [],
        data: [],
      },
    };
  }


  getOption() {
    const { info } = this.state;
    return {
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter: '{b}:00<br/>在线人数: {c}人',
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
        show: false,
      },

      grid: {
        left: '-10',
        bottom: '3%',
        height: '60%',
        width: '100%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          show: false,
          boundaryGap: false,
          data: info ? info.time : [],
        },
      ],
      yAxis: [
        {
          type: 'value',
          show: false,
        },
      ],
      series: [
        {
          name: '在线人数',
          type: 'line',
          areaStyle: {
            color: 'rgba(82,102,212,0.80)',
          },
          smooth: true,
          symbolSize: 0,
          data: info ? info.data : [],
          lineStyle: {
            width: 0,
          },
        },
      ],
    };
  }

  handleMessage = (data) => {
    this.setState({
      info: {
        time: data.time,
        data: data.data,
      },
    });
    // const { currentOnliners } = this.state;
    // if (data.currentOnliners !== currentOnliners) {
    //   this.setState({
    //     currentOnliners: data.currentOnliners,
    //   });
    // }
  }

  getContent = (data) => {
    let content;
    if (data) {
      content = (
        <React.Fragment>
          <div className="c7n-iam-dashboard-onlineuser-main">
            <div className="c7n-iam-dashboard-onlineuser-main-current">
              <span>{data ? data.CurrentOnliners : 0}</span><span>人</span></div>
            <ReactEcharts
              style={{ height: '250px', width: '100%' }}
              option={this.getOption()}
            />
          </div>
          <div className="c7n-iam-dashboard-onlineuser-bottom">
            日总访问量: {data ? data.numberOfVisitorsToday : 0}
          </div>
        </React.Fragment>
      );
    } else {
      content = <Spin spinning />;
    }
    return content;
  }

  render() {
    const { loading } = this.state;
    return (
      <WSHandler
        messageKey="choerodon:msg:online-info"
        onMessage={this.handleMessage}
      >
        {
          data => (
            <div className="c7n-iam-dashboard-onlineuser">
              {this.getContent(data)}
            </div>
          )
        }
      </WSHandler>
    );
  }
}
