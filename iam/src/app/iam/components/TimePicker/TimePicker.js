/* eslint-disable */
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Button, DatePicker } from 'choerodon-ui';
import classnames from 'classnames';
import moment from 'moment';
import './TimePicker.scss';

const intlPrefix = 'dashboard.failedsaga';
const ButtonGroup = Button.Group;

export default class TimePicker extends Component {
  handleClick = (val) => {
    const { store, func, type, onChange, unlimit, showDatePicker, sort } = props;
    store.setStartTime(moment());
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

  render() {
    return (
      <div className="c7n-iam-apioverview-date-wrap">
        <div className="c7n-report-time-btn">
          <ButtonGroup>
            <Button
              style={{ backgroundColor: type === 'seven' ? 'rgba(0,0,0,.08)' : '' }}
              funcType="flat"
              onClick={this.handleClick('seven')}
            >
              <FormattedMessage id={`${intlPrefix}.seven`} />
            </Button>
            <Button
              style={{ backgroundColor: type === 'fifteen' ? 'rgba(0,0,0,.08)' : '' }}
              funcType="flat"
              onClick={this.handleClick('fifteen')}
            >
              <FormattedMessage id={`${intlPrefix}.fifteen`} />
            </Button>
            <Button
              style={{ backgroundColor: type === 'thirty' ? 'rgba(0,0,0,.08)' : '' }}
              funcType="flat"
              onClick={this.handleClick('thirty')}
            >
              <FormattedMessage id={`${intlPrefix}.thirty`} />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
