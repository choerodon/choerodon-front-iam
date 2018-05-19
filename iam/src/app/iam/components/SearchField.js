/**
 * Created by hand on 2017/7/26.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { Icon } from 'antd';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import '../assets/css/search.less';
@inject('AppState')
@observer
class SearchField extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.showMenu = this.showMenu.bind(this);
    this.handleSelectItem = this.handleSelectItem.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addHistoryToInput = this.addHistoryToInput.bind(this);
    this.clearHistory = this.clearHistory.bind(this);
    this.showHistory = this.showHistory.bind(this);
    this.hideHistory = this.hideHistory.bind(this);
    this.handleSearchAll = this.handleSearchAll.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.state = {
      columnss: [], // 搜索的列
      menuVisible: false, // 菜单
      showItem: false, // 子菜单
      inputValue: '', // 输入框的值
      record: [], // 多选项的记录
      recordHis: [], // 选项的记录副本，删除选项的时候不删除记录
      flag: true, // 强制页面刷新
    };
  }

  componentWillMount() {
    // 加载localstory数据
    const { historyName } = this.props;
    const his = [];
    const strStoreDates = localStorage.getItem(historyName);
    if (!strStoreDates) {
      window.localStorage.setItem(historyName, JSON.stringify(his));
    }
    const strStoreDate = window.localStorage.getItem(historyName)
      ? JSON.parse(localStorage.getItem(historyName)) : [];
    this.setState({ historyDom: strStoreDate });
  }
  // 显示要搜索的项
  showMenu = () => {
    const record = this.state.record;
    // 关闭历史记录面板
    const buttonss = document.getElementsByClassName('dropdown filtered-search-history-dropdown-wrapper open');
    if (buttonss.length) {
      buttonss[0].className = 'dropdown filtered-search-history-dropdown-wrapper';
    }
    // 控制不打开多个菜单
    if (record.length) {
      for (let j = 0; j < record.length; j += 1) {
        if (record[j] && !record[j].subItem) {
          // 关闭搜索历史
          this.setState({ menuVisible: false, showItem: false });
        } else {
          // 关闭搜索历史
          this.setState({ menuVisible: true, showItem: false });
        }
      }
    } else {
      // 关闭搜索历史
      this.setState({ menuVisible: true, showItem: false });
    }
  };
  // 选择搜索列
  handleSelect = (e) => {
    const { columns } = this.props;
    const c = this.state.columnss && this.state.columnss.length
      ? this.state.columnss : _.cloneDeep(columns);
    let text;// 值
    let ids;
    let ree = this.state.record;
    const datas = {
      item: '',
      subItem: '',
      id: '',
      value: '',
    };
    if (e.target.tagName === 'BUTTON') {
      text = e.target.firstChild.innerText;
      ids = e.target.firstChild.id;
    } else {
      text = e.target.innerText;
      ids = e.target.id;
    }
    datas.item = text;
    datas.id = ids;
    const input = document.getElementsByClassName('form-control filtered-search')[0];
    input.placeholder = '';
    input.focus();
    // 子菜单弹出来的距离左边的距离
    const offsetLeft = document.getElementsByClassName('form-control filtered-search')[0].offsetLeft;
    // 过滤选择后的列
    c.map((val, index) => {
      if (val.key === ids) {
        c.splice(index, 1);
        if (val.values instanceof Array) {
          // 如果存在多个值
          this.setState({ columnss: c, showItem: true, left: offsetLeft, menuVisible: false, item: 'oauthType', items: val.values, flag: !this.state.flag });
        } else {
          this.setState({ columnss: c, showItem: false, menuVisible: false, items: '', flag: !this.state.flag });
        }
      }
      return columns;
    });
    ree.push(datas);
    // 数组去重
    const r = new Set(ree);
    ree = [...r];
    this.setState({ record: ree, recordHis: ree });
  };
  // 联机选择
  handleSelectItem = (e) => {
    this.setState({ showItem: false });
    const re = this.state.record;
    const input = document.getElementsByClassName('form-control filtered-search')[0];
    input.focus();
    if (re.length) {
      re[re.length-1].subItem=e.target.innerText.replace(/[\r\n]/g, ''); // 去掉回车
      this.setState({ record: re, recordHis: re });
    }
  };
  // 清除选项
  deleteItem = (e) => {
    let column = this.state.columnss;
    const { columns } = this.props;
    let heigh;
    const r = this.state.record;
    for (let m = 0; m < r.length; m += 1) {
      if (r[m].subItem === e.target.parentElement.parentElement.innerText) {
        // 删除是添加cloumn
        columns.map((v, index) => {
          if (v.key === r[m].id) {
            heigh = parseInt(document.getElementsByClassName('filter-dropdown')[0].style.height, 10);
            if (column.length < 4) {
              column.push(v);
            } else {
              column = _.cloneDeep(columns);
              column.splice(index, 1);
            }
          }
          return column;
        });
        r.splice(m, 1);
        const offsetLeft = document.getElementsByClassName('form-control filtered-search')[0].offsetLeft;
        this.setState({ record: r, left: offsetLeft, columnss: column, height: heigh + 40 });
      }
    }
  };
  // 清除搜索框值
  handleSearchAll = () => {
    const { searchFun,  historyName,params } = this.props;
    const args = this.state.record;
    const inputValue = document.getElementsByClassName('form-control filtered-search')[0].value.replace(/[\r\n]/g, '');
    if (inputValue === '') {
        searchFun([...params], args);
    } else if (args.length) {
      args.map((v) => {
        if (v.subItem === '') {
          v.subItem = inputValue;
        }
        return v;
      });
      searchFun([...params], args);
    } else {
      searchFun([...params], inputValue);
    }
    // 添加历史记录
    let records = _.cloneDeep(this.state.record);
    const historyDom = this.state.historyDom;
    const data = {
      value: '',
      item: '',
      subItem: '',
    };
    // 追加历史
    // 全文检索
    // 只是添加input框的值
    if (!records.length) {
      data.value = inputValue;
      if (historyDom.length === 5) {
        historyDom.pop();
        historyDom.unshift(data);
      } else {
        historyDom.unshift(data);
      }
    } else {
      for (let n = 0; n < records.length; n += 1) {
        if (inputValue === '') {
          records[n].value = '';
        } else {
          // 把值绑定在一起
          records[records.length - 1].subItem = inputValue;
          this.setState({ record: records, inputValue: '' });
          records[n].value = '';
        }
      }
      const v = new Set(records);
      records = [...v];
      historyDom.unshift(records);
    }
    // 去重
    let dom = historyDom;
    if (dom.length > 5) {
      const res = [];
      const json = {};
      for (let i = 0; (i < dom.length) && (res.length < 5); i += 1) {
        if (!json[JSON.stringify(dom[i])]) {
          res.push(dom[i]);
          json[JSON.stringify(dom[i])] = 1;
        }
      }
      dom = res;
    }
    this.setState({ historyDom: dom });
    localStorage.setItem(historyName, JSON.stringify(dom));
  };
  // 数据提交和增加搜索历史
  handleSubmit = (e) => {
    const { searchFun, AppState, historyName,params,columns } = this.props;
    const col = this.state.columnss;
    let heigh;
    const values = e.target.value.replace(/[\r\n]/g, '');
    let records = _.cloneDeep(this.state.record);
    // 复制history的副本，不允许直接改变mobx中的值

    // 按下删除键
    this.setState({ menuVisible: false, showClear: true });
    if (e.keyCode === 8 && this.state.record.length && e.target.value === '') {
      this.state.record.map((v, index) => {
        if (v.item && !v.value) {
          columns.map((val) => {
            if (val.key === v.id) {
              heigh = parseInt(document.getElementsByClassName('filter-dropdown')[0].style.height, 10);
              col.unshift(val);
            }
            return col;
          });
          records.splice(index, 1);
          this.setState({ inputValue: `${v.subItem} ` });
        }
        return columns;
      });
      this.setState({ record: records, columnss: col, height: heigh + 40 });
    }
    // 按下回车键
    if (e.keyCode === 13) {
      const historyDom = this.state.historyDom;
      const data = {
        value: '',
        item: '',
        subItem: '',
      };
      // 追加历史
      // 全文检索
      // 只是添加input框的值
      if (!records.length && values) {
        data.value = values;
        historyDom.unshift(data);
        searchFun([...params], values);
      } else {
        for (let n = 0; n < records.length; n += 1) {
          if (values === '') {
            records[n].value = '';
          } else {
            // 把值绑定在一起
            records[records.length - 1].subItem = values;
            this.setState({ record: records, inputValue: '' });
            records[n].value = '';
          }
        }
        const v = new Set(records);
        records = [...v];
        historyDom.unshift(records);
        searchFun([...params], records);
      }
      // 去重
      let dom = historyDom;
      if (dom.length > 5) {
        const res = [];
        const json = {};
        for (let i = 0; (i < dom.length) && (res.length < 5); i += 1) {
          if (!json[JSON.stringify(dom[i])]) {
            res.push(dom[i]);
            json[JSON.stringify(dom[i])] = 1;
          }
        }
        dom = res;
      }
      this.setState({ historyDom: dom });
      localStorage.setItem(historyName, JSON.stringify(dom));
    }
  };
  // 显示搜索历史的面板
  showHistory = () => {
    this.setState({ menuVisible: false, showItem: false });
    const button = document.getElementsByClassName('dropdown filtered-search-history-dropdown-wrapper')[0];
    button.className = 'dropdown filtered-search-history-dropdown-wrapper open';
  };
  // 隐藏搜索历史的面板
  hideHistory = () => {
    const buttons = document.getElementsByClassName('dropdown filtered-search-history-dropdown-wrapper open')[0];
    buttons.className = 'dropdown filtered-search-history-dropdown-wrapper';
  };
  // 清除搜索历史
  clearHistory = () => {
    const { historyName } = this.props;
    const history = this.state.historyDom;
    history.splice(0, history.length);
    localStorage.setItem(historyName, history);
    this.setState({ historyDom: history });
  };
  // 点击搜索历史进行搜索
  addHistoryToInput = (e) => {
    const { columns } = this.props;
    let index;
    let data;
    let heigh;
    const columnsss = this.state.columnss.length ? this.state.columnss : _.cloneDeep(columns);
    const hisDom = this.state.historyDom;
    const inputss = document.getElementsByClassName('form-control filtered-search')[0]; // input框
    const buttons = document.getElementsByClassName('dropdown filtered-search-history-dropdown-wrapper open')[0];// 历史记录面板
    if (e.target.tagName === 'BUTTON') {
      // 只有输入框有值
      if (e.target.firstChild.className === 'filtered-search-history-dropdown-search-token') {
        this.setState({ inputValue: e.target.firstChild.innerText });
        // 隐藏历史面板
        this.setState({ record: '' });
        buttons.className = 'dropdown filtered-search-history-dropdown-wrapper';
        inputss.focus();
      } else {
        index = parseInt(e.target.parentElement.id.split('-')[0], 10);
        data = _.cloneDeep(hisDom[index]);
        if (data && data.length && columnsss.length) {
          data.map((vv) => {
            if (columnsss.length) {
              // 过滤已经选择的项
              columnsss.map((v, i) => {
                if (v.key === vv.id) {
                  columnsss.splice(i, 1);
                }
                return columnsss;
              });
            }
            return data;
          });
        }
        this.setState({ record: data, recordHis: data, columnss: columnsss });
        buttons.className = 'dropdown filtered-search-history-dropdown-wrapper';
        this.setState({ inputValue: '' });
        inputss.placeholder = '';
        inputss.focus();
      }
    } else if (e.target.tagName === 'SPAN') {
      // 输入框的值
      if (e.target.className === 'filtered-search-history-dropdown-search-token') {
        this.setState({ inputValue: e.target.innerText });
        buttons.className = 'dropdown filtered-search-history-dropdown-wrapper';
        this.setState({ record: '' });
        inputss.focus();
      } else {
        // 添加值
        if (e.target.className === 'name') {
          index = parseInt(e.target.parentElement.parentElement.parentElement.id.split('-')[0], 10);
        } else if (e.target.className === 'value') {
          index = parseInt(e.target.parentElement.parentElement.parentElement.id.split('-')[0], 10);
        }
        data = _.cloneDeep(hisDom[index]);
        // 过滤已经选择的项
        if (data && data.length && columnsss.length) {
          data.map((vv) => {
            if (columnsss.length) {
              // 过滤已经选择的项
              columnsss.map((v, i) => {
                if (v.key === vv.id) {
                  columnsss.splice(i, 1);
                }
                return columnsss;
              });
            }
            return data;
          });
        }
        this.setState({ record: data, recordHis: data, columnss: columnsss, height: heigh });
        buttons.className = 'dropdown filtered-search-history-dropdown-wrapper';
        this.setState({ inputValue: '' });
        inputss.placeholder = '';
        inputss.focus();
      }
    }
  };
  handleChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  render() {
    const { columns } = this.props;
    const columnss = this.state.columnss.length ? this.state.columnss : columns;
    const historyDom = this.state.historyDom;
    const items = this.state.items || [];// 选项具有多个值
    const subMenuDom = [];
    const his = []; // 历史记录
    let left = 0;
    const liDom = this.state.record;
    const liRecord = [];// 选项的记录
    const input = document.getElementsByTagName('input')[0];
    if (input) {
      left = input.offsetLeft;
    }
    if (liDom && liDom.length) {
      liDom.map((val) => {
        if (val.item && !val.subItem) {
          liRecord.push(<li className="js-visual-token filtered-search-token" style={{ display: 'inline-block' }}>
            <div className="selectable" role="button" id={val.id}>
              <div className="name">{val.item}</div>
            </div>
          </li>);
        } else if (val.item && val.subItem) {
          liRecord.push(<li className="js-visual-token filtered-search-token" style={{ display: 'inline-block' }}>
            <div className="selectable" role="button" id={val.id}>
              <div className="name">{val.item}</div>
              <div className="value-container">
                <div className="value">{val.subItem}</div>
                <div
                  className="remove-token"
                  role="none"
                  onClick={this.deleteItem}
                >
                  <Icon type="close" />
                </div>
              </div>
            </div>
          </li>);
        }
        return liRecord;
      });
    }
    if (historyDom && historyDom.length) {
      historyDom.map((values, index) => {
        if (values instanceof Array) {
          if (values.length === 1) {
            values.map((v) => {
              if (v.item && !v.value && !v.subItem) {
                his.push(<li key={v.item} id={`${index}-item`}>
                  <button
                    type="button"
                    className="filtered-search-history-dropdown-item"
                    onClick={this.addHistoryToInput}
                  >
                    <span className="filtered-search-history-dropdown-token">
                      <span
                        className="name"
                      >{v.item}:</span>
                    </span>
                  </button>
                </li>);
              } else if (v.subItem && v.item) {
                his.push(<li key={`${v.item}-${v.subItem}`} id={`${index}-item`}>
                  <button
                    type="button"
                    className="filtered-search-history-dropdown-item"
                    onClick={this.addHistoryToInput}
                  >
                    <span className="filtered-search-history-dropdown-token">
                      <span
                        className="name"
                      >{v.item}:</span>
                      <span
                        className="value"
                      >{v.subItem}</span>
                    </span>
                    <span className="filtered-search-history-dropdown-search-token">
                      {v.value}
                    </span>
                  </button>
                </li>);
              } else if (!v.item && !v.subItem) {
                his.push(<li
                  key={v.value}
                  id={`${index}-item`}
                >
                  <button
                    type="button"
                    className="filtered-search-history-dropdown-item"
                    onClick={this.addHistoryToInput}
                  >
                    <span className="filtered-search-history-dropdown-search-token">{v.value}</span>
                  </button>
                </li>);
              }
              return his;
            });
          } else if (values.length > 1) {
            const span = [];
            values.map((va) => {
              span.push(<span key={`${va.item}-${va.subItem}`}>
                <span className="filtered-search-history-dropdown-token" >
                  <span className="name">{va.item}:</span>
                  <span className="value">{va.subItem}</span>
                </span>
              </span>,
              );
              return span;
            });
            if (span.length) {
              his.push(
                <li key={Math.random()} id={`${index}-subItem`}>
                  <button
                    type="button"
                    className="filtered-search-history-dropdown-item"
                    onClick={this.addHistoryToInput}>
                    <span>
                      {span}
                    </span>
                    <span className="filtered-search-history-dropdown-search-token" />
                  </button>
                </li>,
              );
            }
          }
        } else {
          his.push(<li key={values.value} id={`${index}-value`}>
            <button type="button" className="filtered-search-history-dropdown-item" onClick={this.addHistoryToInput}>
              <span className="filtered-search-history-dropdown-search-token">
                {values.value}
              </span>
            </button>
          </li>);
        }
        return historyDom;
      });
    }
    const itemDom = [];
    // 搜索的项
    if (columnss) {
      columnss.map((value) => {
        itemDom.push(
          <li className="filter-dropdown-item" style={{ display: 'block' }} key={value.key}>
            <button className="btn btn-link" onClick={this.handleSelect}>
              <span className="js-filter-hint" id={value.key}>
                {value.title}
              </span>
            </button>
          </li>,
        );
        return itemDom;
      });
    }
    if (items) {
      items.map((v) => {
        subMenuDom.unshift(<li className="filter-dropdown-item">
          <button className="btn btn-link dropdown-user" onClick={this.handleSelectItem}>
            <div className="dropdown-user-details">
              <span>{v}</span>
            </div>
          </button>
        </li>);
        return subMenuDom;
      });
    }
    return (
      <div
        className="issues-other-filters filtered-search-wrapper"
        style={{ height: '29px', borderRadius: 3, marginBottom: 15 }}
      >
        <div className="filtered-search-box">
          {/* 显示搜索历史*/}
          <div className="dropdown filtered-search-history-dropdown-wrapper">
            <button
              className="dropdown-menu-toggle filtered-search-history-dropdown-toggle-button"
              type="button"
              onClick={this.showHistory}
            >
              <span className="dropdown-toggle-text ">
                <Icon type="sync" />
              </span>
              <Icon type="down" />
            </button>
            <div className="dropdown-menu dropdown-select filtered-search-history-dropdown">
              <div className="dropdown-title"><span>最近搜索</span>
                {/* 关闭搜索按钮*/}
                <button
                  className="dropdown-title-button dropdown-menu-close"
                  type="button"
                  onClick={this.hideHistory}
                >
                  <Icon type="close" /></button>
              </div>
              <div className="dropdown-content filtered-search-history-dropdown-content">
                {this.state.historyDom && this.state.historyDom.length ? (<div>
                  <ul>
                    {his}
                    <li className="divider" />
                    <li>
                      <button
                        style={{ textAlign: 'center', fontSize: 13 }}
                        type="button"
                        className="filtered-search-history-clear-button"
                        onClick={this.clearHistory}
                      >
                        清空历史
                      </button>
                    </li>
                  </ul>
                </div>) : (<div>
                  <div className="dropdown-info-note" style={{ textAlign: 'center' }}>
                    最近没有搜索历史
                  </div>
                </div>)}
              </div>
              <div className="dropdown-loading" />
            </div>
          </div>
          <div className="filtered-search-box-input-container">
            <div className="scroll-container">
              <ul className="tokens-container list-unstyled" style={{ height: 27, lineHeight: 1 }}>
                {liRecord}
                {/*  <li className="js-visual-token filtered-search-token"
                 style={{display:'inline-block'}}>
                 <div className="selectable" role="button">
                 <div className="name">Author</div>
                 <div className="value-container">
                 <div className="value">@12456</div>czzwsxxc c 5v66yhnn ujm8ikujm9,ik,l.0p;/-/

                 <div className="remove-token" role="button">
                 <Icon  type="close"/>


                 </div>
                 </div>
                 </li>*/}
                <li className="input-token" style={{ display: 'inline-block' }}>
                  <input
                    className="form-control filtered-search"
                    style={{ height: '100%', boxShadow: 'none' }}
                    placeholder="Search..."
                    onClick={this.showMenu}
                    value={this.state.inputValue}
                    onChange={this.handleChange}
                    onKeyDown={this.handleSubmit}
                  />
                </li>
              </ul>
              <button
                className="clear-search "
                type="button"
                style={{ display: 'inline-block' }}
                onClick={this.handleSearchAll}
              >
                <Icon type="search" style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: 10 }} />
              </button>

            </div>
            {/* 下拉菜单*/}
            <div
              className="filtered-search-input-dropdown-menu dropdown-menu hint-dropdown"
              id="js-dropdown-hint"
              style={{ left: `${left}px`, display: this.state.menuVisible ? 'block' : 'none' }}
            >
              <ul className="filter-dropdown" style={{ overflowY: 'hidden' }}>
                {itemDom}
              </ul>
            </div>
            {/* 授权类型*/}
            <div
              className="filtered-search-input-dropdown-menu dropdown-menu"
              id="js-dropdown-author"
              style={{
                left: `${left}px`,
                display: this.state.showItem ? 'block' : 'none',
              }}
            >
              <ul className="filter-dropdown">
                {subMenuDom}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(SearchField);
