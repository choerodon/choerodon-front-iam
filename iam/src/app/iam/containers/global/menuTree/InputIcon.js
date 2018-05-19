/*eslint-disable*/
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { Row, Col, Input, Form, Modal, message, Alert, Pagination, Tooltip, Select } from 'choerodon-ui';
import cx from 'classnames';
import { Observable } from 'rxjs';
import axios from 'Axios';
import _ from 'lodash';
import { observer, inject } from 'mobx-react';
import './menuTree.scss';

const Option = Select.Option;
const FormItem = Form.Item;
const Search = Input.Search;


@inject('AppState')
@observer
class InputIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      iconData: [],
      selectedKey: [],
      searchCode: null,
      totalPages: 0,
      totalElements: 0,
      page: 0,
      pageSize: 20,
      selectIcon: null,
      flag: true,
      active: true,
    }
  }

  componentWillMount() {
    this.initIcon(this.state.page, this.state.pageSize);
  }
  initIcon = (page, pageSize, code) => {
    let url;
    if (code) {
      url = `/iam/v1/icons?code=${code}&page=${page}&size=${pageSize}`
    } else {
      url = `/iam/v1/icons?page=${page}&size=${pageSize}`
    }
    axios.get(url)
      .then(value => {
        this.setState({
          iconData: value.content,
          totalPages: value.totalPages,
          totalElements: value.totalElements
        })
      })
  }

  iconDom() {
    this.initIcon(this.state.page, this.state.pageSize)
    const { IconTrasitationActive } = this.props;
    IconTrasitationActive(true);
  }

  onBlurDom() {
    const { IconTrasitationActive } = this.props;
    IconTrasitationActive(false);
  }
  onSearchIcon = (value) => {
    this.initIcon(this.state.page, this.state.pageSize, value)
    this.setState({
      searchCode: value,
    })
  }

  changePageSize = (current, pageSize) => {
    this.initIcon(this.state.page, pageSize);
    this.setState({
      pageSize: pageSize
    })
  }
  //显示多少字符
  showString = (name, number) => {
    return number < name.length ? name.slice(0, number) + '...' : name;
  };

  iconCol = (value) => {
    const row = _.chunk(value, 4);
    return row.map(rowData => {
      return (<Row type="flex" className={cx('rowMargin')}>
        {rowData.map(colData => {
          return (<Col span={6} order={1} className={cx('iconbody', {
            blackGround: this.state.selectIcon === colData.code,
          })} onDoubleClick={this.selectDoubleIcon.bind(this, colData.code)} onClick={this.selectIcon.bind(this, colData.code)}>
            <Tooltip placement="right" title={colData.code}>
              <span className={`icon-${colData.code}`} /> <span>{this.showString(colData.code, 6)}</span>
            </Tooltip>
          </Col>)
        })}
      </Row>)
    });
  }
  selectDoubleIcon = (code) => {
    const { IconTrasitationActive } = this.props;
    IconTrasitationActive(false);
    this.setState({
      selectIcon: code,
      // active: false,
    });
  }

  selectIcon = (code) => {
    const { IconTrasitation } = this.props;
    IconTrasitation(code);
    this.setState({
      selectIcon: code,
    });
  }

  changePage = (page, pageSize) => {
    if (this.state.searchCode) {
      this.initIcon(page, pageSize, this.state.searchCode);
    } else {
      this.initIcon(page, pageSize);
    }
  }

  enterIconType = () => {
    this.setState({
      flag: false,
    });
  }

  leaveIconType = () => {
    this.setState({
      flag: true,
    });
  }

  render() {
    const { icon, iconActive } = this.props;
    const prefixIcon = (<span className={`icon-${icon}`} style={{ color: "black" }} />);
    return (
      <div style={{ width: "512px" }}>
        <Input placeholder="请选择一个图标"
          label="图标"
          prefix={prefixIcon}
          style={{ width: "512px" }} onClick={this.iconDom.bind(this)} value={icon} />
        <div className={cx('iconBody', {
          "c7n-active": this.state.flag ? iconActive : this.state.active,
        })} onMouseEnter={this.enterIconType.bind(this)} onMouseLeave={this.leaveIconType.bind(this)}>
          <div>
            <Row>
              <Col span={4} className="searchtitle">
                <span>搜索:</span>
              </Col>
              <Col span={16} style={{ margin: "20px 5px 10px" }}>
                <Search
                  placeholder={Choerodon.getMessage('输入查询ICON名称', 'please input search Icon Name')}
                  onSearch={this.onSearchIcon.bind(this)}
                  style={{ width: 380 }}
                />
              </Col>
            </Row>
          </div>
          <div>
            {this.state.iconData ? this.iconCol(this.state.iconData): null}
          </div>
          <div>
            <Pagination
              total={this.state.totalElements}
              // showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              onChange={this.changePage.bind(this)}
              pageSizeOptions={['20', '40', '80']}
              pageSize={this.state.pageSize}
              onShowSizeChange={this.changePageSize.bind(this)}
              defaultCurrent={this.state.page}
            />
          </div>
        </div>
      </div>
    )
  }
}
export default withRouter(InputIcon);
