import React, { Component } from 'react';

/**
 *  思路
 *  字符串转为json对象 或者直接就是个Json对象
 *  递归遍历这个json对象
 *  对key和value做操作
 */
class JsonFormatter extends Component {
  constructor(props) {
    super(props);
  }
  /**
   *  根据count 返回空格数
   */
  getSpace = (count) => {
    return ' '.repeat(count);
  };

  /**
   * 每一行包 span标签
   * @param value
   * @param className
   * @param count 有多少前缀空格
   * @param newLine 是否换行
   * @param quote 是否给打引号
   * @returns {*}
   */
  wrapper = (value, className, count, newLine = false, quote = false) => {
    const space = this.getSpace(count);
    return <span className={className}>{space}{quote && '"'}{value || ''}{newLine && '\n'}{quote && '"'}</span>;
  };

  withArray = (value, count, space) => {
    const { wrapper, process } = this;
    const { tabSize } = this.props;
    const html = [];
    if (value.length) {
      html.push(wrapper('[', 'array', space, true));
      value.forEach((item, index) => {
        const values = [];
        values.push(process(item, count + tabSize));
        if (index !== value.length - 1) {
          values.push(',');
        }
        html.push(wrapper(values, 'items-wrapper', 0, true));
      });
      html.push(wrapper(']', 'array', count));
    } else {
      html.push(wrapper('[]', 'array', 1, true));
    }
    return html;
  };


  withObject = (value, count, space) => {
    const { wrapper, process } = this;
    const { tabSize } = this.props;
    const html = [];
    const arr = Object.keys(value);
    if (arr.length) {
      html.push(wrapper('{', 'object', space, true));
      arr.forEach((item, index) => {
        const values = [];
        values.push(wrapper(item, 'item-key', count + tabSize, false, true));
        values.push(':');
        if (value[item] === null) {
          values.push(wrapper('null', 'null', 1));
        } else {
          values.push(process(value[item], count + 2, 1));
        }
        if (index !== arr.length - 1) {
          values.push(',');
        }
        html.push(wrapper(values, 'items-wrapper', 0, true));
      });
      html.push(wrapper('}', 'object', count));
    } else {
      html.push(wrapper('{}', 'object', 1, true));
    }
    return html;
  };

  process = (value, count = 0, space = count) => {
    const html = [];
    const type = typeof value;
    if (type === 'object' && value instanceof Array) {
      html.push(this.withArray(value, count, space));
    } else if (type === 'object') {
      html.push(this.withObject(value, count, space));
    } else if (type === 'number') {
      html.push(this.wrapper(value, 'number', space));
    } else if (type === 'boolean') {
      html.push(this.wrapper(value ? 'true' : 'false', 'boolean', space));
    } else if (type === 'undefined') {
      html.push(this.wrapper('undefined', 'undefined', space));
    } else {
      html.push(this.wrapper(value, 'string', space, false, true));
    }
    return html;
  }
}

const defaultProps = {
  tabSize: 2,
};

const jsonFormat = new JsonFormatter(defaultProps);
export default jsonFormat.process;
