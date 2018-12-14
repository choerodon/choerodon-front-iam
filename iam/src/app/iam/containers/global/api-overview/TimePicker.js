/* eslint-disable */
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Button, DatePicker } from 'choerodon-ui';
import classnames from 'classnames';
import moment from 'moment';
import './TimePicker.scss';

const { RangePicker } = DatePicker;
const ButtonGroup = Button.Group;

function TimePicker(props) {
  const { startTime, endTime, store, func, type, onChange, unlimit, showDatePicker, sort } = props;
  const handleClick = (val) => {
    if (sort === 2) {
      store.setSecEndTime(moment());
      switch (val) {
        case 'fifteen':
          store.setSecStartTime(moment().subtract(14, 'days'));
          onChange && onChange('fifteen');
          func();
          break;
        case 'seven':
          store.setSecStartTime(moment().subtract(6, 'days'));
          onChange && onChange('seven');
          func();
          break;
        case 'thirty':
          store.setSecStartTime(moment().subtract(29, 'days'));
          onChange && onChange('thirty');
          func();
          break;
        default:
          store.setSecStartTime(moment().subtract(6, 'days'));
          func();
          break;
      }
    } else {
      store.setThirdEndTime(moment());
      switch (val) {
        case 'fifteen':
          store.setThirdStartTime(moment().subtract(14, 'days'));
          onChange && onChange('fifteen');
          func();
          break;
        case 'seven':
          store.setThirdStartTime(moment().subtract(6, 'days'));
          onChange && onChange('seven');
          func();
          break;
        case 'thirty':
          store.setThirdStartTime(moment().subtract(29, 'days'));
          onChange && onChange('thirty');
          func();
          break;
        default:
          store.setThirdStartTime(moment().subtract(6, 'days'));
          func();
          break;
      }
    }

  };

  const disabledDate = current => current && current > moment().endOf('day');

  return (
    <div className="c7n-iam-apioverview-date-wrap">
      <div className="c7n-report-time-btn">
        <ButtonGroup>
          <Button
            style={{ backgroundColor: type === 'seven' ? 'rgba(0,0,0,.08)' : '' }}
            funcType="flat"
            onClick={handleClick.bind(this, 'seven')}
          >
            <FormattedMessage id="global.apioverview.seven" />
          </Button>
          <Button
            style={{ backgroundColor: type === 'fifteen' ? 'rgba(0,0,0,.08)' : '' }}
            funcType="flat"
            onClick={handleClick.bind(this, 'fifteen')}
          >
            <FormattedMessage id="global.apioverview.fifteen" />
          </Button>
          <Button
            style={{ backgroundColor: type === 'thirty' ? 'rgba(0,0,0,.08)' : '' }}
            funcType="flat"
            onClick={handleClick.bind(this, 'thirty')}
          >
            <FormattedMessage id="global.apioverview.thirty" />
          </Button>
        </ButtonGroup>
      </div>
      <div
        className={classnames('c7n-iam-apioverview-time-pick', { 'c7n-iam-apioverview-time-pick-selected': type === '' })}
        style={{ display: showDatePicker ? 'inlineBlock' : 'none' }}
      >
        <RangePicker
          disabledDate={disabledDate}
          value={[startTime, endTime]}
          allowClear={false}
          onChange={(date, dateString) => {
            if (moment(dateString[1]).format() > moment(dateString[0]).add(29, 'days').format() && !unlimit) {
              Choerodon.prompt('暂支持最多查看30天，已自动截取开始日期后30天。');
              store.setThirdStartTime(moment(dateString[0]));
              store.setThirdEndTime(moment(dateString[0]).add(29, 'days'));
              store.setThirdStartDate(moment(dateString[0]));
              store.setThirdEndDate(moment(dateString[0]).add(29, 'days'));
            } else {
              store.setThirdStartTime(moment(dateString[0]));
              store.setThirdEndTime(moment(dateString[1]));
              store.setThirdStartDate(moment(dateString[0]));
              store.setThirdEndDate(moment(dateString[1]));
            }
            onChange && onChange('');
            func();
          }}
        />
      </div>
    </div>
  );
}

export default withRouter(injectIntl(TimePicker));
