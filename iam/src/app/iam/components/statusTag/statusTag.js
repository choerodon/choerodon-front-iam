import React, { Component } from 'react';
import './statusTag.scss';

const Color = {
  RUNNING: '#4d90fe',
  FAILED: '#f44336',
  COMPLETED: '#1BC123',
};

export default class StatusTag extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !(nextProps.name === this.props.name
      && nextProps.color === this.props.color &&
    nextProps.colorCode === this.props.colorCode);
  }

  render() {
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
}
