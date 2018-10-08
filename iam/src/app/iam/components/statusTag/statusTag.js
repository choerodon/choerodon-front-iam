import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import PropTypes from 'prop-types';
import './statusTag.scss';

const Color = {
  RUNNING: '#4d90fe',
  FAILED: '#f44336',
  COMPLETED: '#00BF96',
  DEFAULT: '#b8b8b8',
};

const IconType = {
  COMPLETED: 'check_circle',
  FAILED: 'remove_circle',
  ENABLE: 'check_circle',
  DISABLE: 'remove_circle',
  FINISHED: 'state_over',
};

export default class StatusTag extends Component {
  static propTypes = {
    name: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
    ]),
    color: PropTypes.string,
    colorCode: PropTypes.string,
  }

  static defaultProps = {
    colorCode: 'DEFAULT',
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextProps.name === this.props.name
      && nextProps.color === this.props.color &&
    nextProps.colorCode === this.props.colorCode);
  }

  renderIconMode() {
    const { name, colorCode } = this.props;

    return (
      <span
        className="c7n-iam-status-tag-with-icon"
        style={{
          ...this.props.style,
        }}
      >
        <Icon type={[IconType[colorCode]]} />
        <span>{ name || '' }</span>
      </span>
    );
  }

  renderDefaultMode() {
    const { name, color, colorCode } = this.props;
    return (
      <div
        className="c7n-iam-status-tag"
        style={{
          background: color || Color[colorCode],
          ...this.props.style,
        }}
      >
        <div>{name}</div>
      </div>
    );
  }

  render() {
    const { mode } = this.props;
    switch (mode) {
      case 'icon':
        return this.renderIconMode();
      default:
        return this.renderDefaultMode();
    }
  }
}
