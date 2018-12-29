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
  const { store, func, type, onChange } = props;
  const handleClick = (val) => {
      store.setEndTime(moment());
      switch (val) {
        case 'fifteen':
          store.setStartTime(moment().subtract(14, 'days'));
          onChange && onChange('fifteen');
          func();
          break;
        case 'seven':
          store.setStartTime(moment().subtract(6, 'days'));
          onChange && onChange('seven');
          func();
          break;
        case 'thirty':
          store.setStartTime(moment().subtract(29, 'days'));
          onChange && onChange('thirty');
          func();
          break;
        default:
          store.setStartTime(moment().subtract(6, 'days'));
          func();
          break;
      }
  };

  return (
    <div className="c7n-iam-dashboard-failedsaga-date-wrap">
      <div className="c7n-report-time-btn">
        <ButtonGroup>
          <Button
            style={{ backgroundColor: type === 'seven' ? 'rgba(0,0,0,.08)' : '' }}
            funcType="flat"
            onClick={handleClick.bind(this, 'seven')}
          >
           近7天
          </Button>
          <Button
            style={{ backgroundColor: type === 'fifteen' ? 'rgba(0,0,0,.08)' : '' }}
            funcType="flat"
            onClick={handleClick.bind(this, 'fifteen')}
          >
           近15天
          </Button>
          <Button
            style={{ backgroundColor: type === 'thirty' ? 'rgba(0,0,0,.08)' : '' }}
            funcType="flat"
            onClick={handleClick.bind(this, 'thirty')}
          >
            近30天
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

export default withRouter(injectIntl(TimePicker));
