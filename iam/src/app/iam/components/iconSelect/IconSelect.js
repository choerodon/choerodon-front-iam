/*eslint-disable*/
import React, { Component } from 'react';
import { Icon, Input, Pagination, Dropdown, Spin, Tooltip } from 'choerodon-ui';
import axios from 'Axios';
import cx from 'classnames';
import omit from 'object.omit';
import './IconSelect.scss';

function noop() {
}

class IconSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      visible: false,
      iconData: [],
      totalPages: 0,
      totalElements: 0,
      page: props.page,
      pageSize: props.pageSize,
      filterText: props.filterText,
      value: props.value,
    };
  }

  componentWillMount() {
    this.initIcon();
  }

  componentWillReceiveProps(nextProps) {
    const { filterText, page, pageSize, value } = this.props;
    const { filterText: newFilterText, page: newPage, pageSize: newPageSize, value: newValue } = nextProps;
    const newState = {};
    if (newValue !== value) {
      newState.value = newValue;
    }
    if (filterText !== newFilterText || page !== newPage || pageSize !== newPageSize) {
      this.initIcon(newFilterText, newPage, newPageSize);
    }
    this.setState(newState);
  }

  initIcon = (code = this.state.filterText, page = this.state.page, pageSize = this.state.pageSize) => {
    let url = `/iam/v1/icons?page=${page - 1}&size=${pageSize}`;
    if (code) {
      url += `&code=${code}`;
    }
    this.setState({
      filterText: code,
      loading: true,
    });
    axios.get(url)
      .then(({ content, totalElements, size, number }) => {
        this.setState({
          loading: false,
          iconData: content,
          totalElements,
          pageSize: size,
          page: number + 1,
        });
      });
  };

  handleFilterInput = ({ target: { value } }) => {
    this.setState({
      filterText: value,
    });
  };

  handleFilterChange = ({ target: { value } }) => {
    const { onFilter = noop } = this.props;
    this.initIcon(value);
    onFilter(value);
  };

  iconCol = (value) => {
    return value.map(({ code }) => (
      <Tooltip key={code} placement="right" title={code}>
        <div
          className={cx('input-icon-cell', { 'input-icon-cell-active': code === this.state.value })}
          onClick={this.handleSelectIcon.bind(this, code)}
        >
          <span className={`icon-${code}`} /> {code}
        </div>
      </Tooltip>
    ));
  };

  handleSelectIcon(value) {
    const { onChange = noop } = this.props;
    onChange(value);
    this.setState({
      value,
      visible: false,
    });
  };

  handlePageChange = (page, pageSize) => {
    const { onPageChange = noop } = this.props;
    this.initIcon(this.state.filterText, page, pageSize);
    onPageChange(page, pageSize);
  };

  handlePopoverVisibleChange = (visible) => {
    this.setState({
      visible,
    });
  };

  getIconList() {
    const { loading, iconData, totalElements, pageSize, page, filterText } = this.state;
    return (
      <Spin spinning={loading}>
        <div className="ant-dropdown-menu">
          <div className="input-icon-header">
            <Input
              placeholder={Choerodon.getMessage('输入查询ICON名称', 'please input search Icon Name')}
              size="default"
              prefix={<Icon type="search" />}
              onPressEnter={this.handleFilterChange}
              onBlur={this.handleFilterChange}
              onChange={this.handleFilterInput}
              value={filterText}
            />
          </div>
          <div className="input-icon-content">
            {iconData ? this.iconCol(iconData) : null}
          </div>
          <div className="input-icon-footer">
            <Pagination
              total={totalElements}
              onChange={this.handlePageChange}
              pageSizeOptions={['20', '40', '80']}
              pageSize={pageSize}
              onShowSizeChange={this.handlePageChange}
              current={page}
            />
          </div>
        </div>
      </Spin>
    );
  }

  render() {
    const { props } = this;
    const prefixIcon = (<span className={`icon-${props.value}`} style={{ color: 'black' }} />);
    return (
      <Dropdown
        overlayClassName="input-icon-popover"
        overlay={this.getIconList()}
        onVisibleChange={this.handlePopoverVisibleChange}
        placement="bottomLeft"
        trigger={['click']}
        visible={this.state.visible}
      >
        <Input
          prefix={prefixIcon}
          {...omit(props, ['onFilter', 'pageSize', 'filterText', 'onPageChange'])}
        />
      </Dropdown>
    );
  }
}

export default IconSelect;
