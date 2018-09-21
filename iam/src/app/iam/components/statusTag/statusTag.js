import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import './statusTag.scss';

const Color = {
  RUNNING: '#4d90fe',
  FAILED: '#f44336',
  COMPLETED: '#1BC123',
};

const IconType = {
  COMPLETED: 'check_circle',
  FAILED: 'remove_circle',
};

export default class StatusTag extends Component {
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
          background: color || Color[colorCode] || 'rgba(0, 0, 0, 0.28)',
          ...this.props.style,
        }}
      >
        <div>{ name || '' }</div>
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
