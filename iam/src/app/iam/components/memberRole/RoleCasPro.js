/*eslint-disable*/
import React, { Component, PropTypes } from 'react';
import { Button, Icon } from 'antd';
import _ from 'lodash';
import { inject } from 'mobx-react';

// import styles from 'Cascer.css';
@inject('AppState')
class RoleList extends Component {
  static propTypes = {
    treeData: PropTypes.arrayOf.isRequired,
    // defaultSelectKey: PropTypes.arrayOf.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedText: [],
      text: [],
      liSelectChild: [],
      liChild: [],
      Button: 'none',
      Leftdisplay: 'none',
      Rightdisplay: 'none',
      selectedBorderBottom: 'none',
      leftTop: 40,
      selectId: [],
      beginFlag: 0,
      width: 200,
      rightLeft: -319,
    };
  }
  // 删除项目节点的函数
  cancleSelect(value) {
    const { treeData } = this.props;
    let cancelRemoveId;
    const cancelChildId = treeData.map((treeDataValue) => {
      const tdv = treeDataValue;
      return _.filter(tdv.children, { label: value });
    });
    for (let i = 0; i < cancelChildId.length; i += 1) {
      if (cancelChildId[i].length === 1) {
        cancelRemoveId = cancelChildId[i][0].value;
        break;
      }
    }
    const cancelArray = _.pull(this.state.text, value);
    const cancelIdArray = _.pull(this.state.selectId, cancelRemoveId);
    const newcancelArray = _.uniq(cancelIdArray);
    this.setState({
      text: cancelArray,
    });
    const liSelectChild = this.state.text.map((values, key) => {
      const theKey = key;
      const theValue = values;
      return (
        <li
          style={{ width: this.state.width, position: 'relative' }}
          onClick={this.cancleSelect.bind(this, theValue, theKey)}
        >
          <Icon
            type="check"
            style={{
              color: '#3367D6',
              fontWeight: 'bolder',
              marginLeft: '6px',
              marginRight: '5px',
            }}
          />
          {theValue}
        </li>);
    });
    const tempLiSelectChild = liSelectChild;
    this.setState({
      liSelectChild: tempLiSelectChild,
    });
  }

  // 添加选中的项目函数
  showSelected(value) {
    const { text, selectId } = this.state;
    text.push(value.label);
    selectId.push(value.value);
    const newText = _.uniq(text);
    const newSelectId = _.uniq(selectId);
    this.state.text = newText;
    this.state.selectId = newSelectId;
    const liSelectChild = this.state.text.map((values, key) => {
      const theValue = values;
      const theKey = key;
      return (
        <li
          style={{ width: this.state.width, position: 'relative' }}
          onClick={this.cancleSelect.bind(this, theValue, theKey)}
        >
          <Icon
            type="check"
            style={{
              color: '#3367D6',
              fontWeight: 'bolder',
              marginLeft: '6px',
              marginRight: '5px',
            }}
          />
          {theValue}
        </li>);
    });
    const tempLiSelectChild = liSelectChild;
    this.setState({
      liSelectChild: tempLiSelectChild,
    });
  }

  // 是否关闭菜单
  showCas() {
    const { record } = this.props;
    if (this.state.Leftdisplay === 'none') {
      this.beginSelected(record);
      this.setState({
        Leftdisplay: 'block',
        Button: 'block',
        selectedBorderBottom: '1.1px solid lightgrey',
      });
    }
    if (this.state.Leftdisplay === 'block') {
      this.setState({
        Leftdisplay: 'none',
        Button: 'none',
        Rightdisplay: 'none',
        selectedBorderBottom: 'none',
      });
    }
  }

  // 加载二级菜单数据
  loadLiChild(value, key) {
    const len = this.state.liSelectChild.length * 23.3;
    this.state.leftTop = 34 + len;
    const keys = key * 24;
    this.setState({
      leftTop: this.state.leftTop + keys,
    });
    this.setState({
      selectedBorderBottom: 'none',
    });
    const liChild = value.children.map((vals, akey) => {
      const liChildKey = akey;
      return (
        <li
          style={{ width: this.state.width, position: 'relative' }}
          id={vals.value}
          onClick={this.showSelected.bind(this, vals, liChildKey)}
        >
          {vals.label}
        </li>);
    });
    const theLiChild = liChild;
    this.setState({
      liChild: theLiChild,
    });
    this.setState({
      Rightdisplay: 'block',
    });
  }

  colseLiChild() {
    this.setState({
      Rightdisplay: 'none',
    });
  }

  openLiChild() {
    this.setState({
      Rightdisplay: 'block',
    });
  }

  LeaveDiv() {
    this.setState({
      Leftdisplay: 'none',
      Rightdisplay: 'none',
      Button: 'none',
    });
  }

  // 加载已经存在的数据
  beginSelected(role) {
    const { defaultSelectKey, treeData, AppState } = this.props;
    const language = AppState.currentLanguage;
    if (defaultSelectKey.length == 0) {
        const arrayMember = role.roles;
      // let map;
      if (language === 'zh') {
        this.state.rightLeft = -348;
        this.state.width = 200;
      } else if (language === 'en') {
        this.state.rightLeft = 75;
        this.state.width = 320;
      }
      const beginSelectedChild = arrayMember.map((value, key) => {
        if (value.roleName) {
          this.state.text.push(value.roleDescription);
          this.state.text = _.uniq(this.state.text);
          this.state.selectId.push(value.roleId.toString());
          return (
            <li
              style={{ width: this.state.width, position: 'relative' }}
              onClick={this.cancleSelect.bind(this, value.roleDescription, key)}
            >
              <Icon
                type="check"
                style={{
                  color: '#3367D6',
                  fontWeight: 'bolder',
                  marginLeft: '6px',
                  marginRight: '5px',
                }}
              />{value.roleDescription}
            </li>);
        }
        return (value, key);
      });
      const newBeginSelectedChild = _.uniq(beginSelectedChild);
      this.setState({
        liSelectChild: newBeginSelectedChild,
      });
    };
    if (defaultSelectKey.length > 0) {
      // let map;
      if (language === 'zh') {
        this.state.rightLeft = -348;
        this.state.width = 200;
      } else if (language === 'en') {
        this.state.rightLeft = 75;
        this.state.width = 320;
      }
      let beginSelectedChild = [];
      treeData.map((value) => {
        value.children.map((value, key) => {
          if (defaultSelectKey.indexOf(value.value) > -1) {
            this.state.text.push(value.label);
            this.state.text = _.uniq(this.state.text);
            this.state.selectId.push(value.value.toString());
            beginSelectedChild.push(
              <li
                style={{ width: this.state.width, position: 'relative' }}
                onClick={this.cancleSelect.bind(this, value.roleDescription, key)}
              >
                <Icon
                  type="check"
                  style={{
                    color: '#3367D6',
                    fontWeight: 'bolder',
                    marginLeft: '6px',
                    marginRight: '5px',
                  }}
                />{value.label}
              </li>);
          }
        })
      })
      const newBeginSelectedChild = _.uniq(beginSelectedChild);
      this.setState({
        liSelectChild: newBeginSelectedChild,
      });
    }
  }

  saveBtn() {
    const { handleSubmit } = this.props;
    handleSubmit(this.state.selectId);
    this.showCas();
  }

  render() {
    const { AppState, treeData, inName, record, onClicks, open } = this.props;
    this.state.selectId = _.uniq(this.state.selectId);
    const language = AppState.currentLanguage;
    // let map;
    let liParent;
    if (language === 'zh') {
      liParent = treeData.map((value, key) => {
        const val = value;
        return (
          <li
            style={{ width: this.state.width, position: 'relative' }}
            onMouseEnter={this.loadLiChild.bind(this, val, key)}
          >
            {val.label}
            <Icon type={'right'} style={{ position: 'absolute', right: 30, margin: 4 }} />
          </li>);
      });
      this.state.rightLeft = -351;
      this.state.width = 200;
    } else if (language === 'en') {
      liParent = treeData.map((value, key) => {
        const val = value;
        return (
          <li
            style={{ width: 280, position: 'relative', textAlign: 'right' }}
            onMouseEnter={this.loadLiChild.bind(this, val, key)}
          >
            <Icon type={'left'} style={{ position: 'absolute', left: 0, margin: 4 }} />
            {val.label}
          </li>);
      });
      this.state.rightLeft = 75;
      this.state.width = 320;
    }
    const style = {
      selects: {
        width: this.state.width,
      },
      allDiv: {
        position: 'absolute',
      },
      btnContent: {
        display: this.state.Button,
        padding: '9px 5px',
        border: '1.1px solid lightgrey',
        width: this.state.width,
        backgroundColor: 'white',
      },
      spanTitle: {
        display: 'block',
      },
      casa: {
        position: 'absolute',
        top: 0,
      },
      selectBackLeftTop: {
        backgroundColor: 'white',
        width: this.state.width,
        display: this.state.Leftdisplay,
        border: '1.1px solid lightgrey',
        padding: '5px 10px',
        fontWeight: '500',
        cursor: 'pointer',
      },
      selectBackLeft: {
        backgroundColor: 'white',
        width: this.state.width,
        display: this.state.Leftdisplay,
        borderLeft: '1.1px solid lightgrey',
        borderRight: this.state.selectedBorderBottom,
        padding: '12px 18px',
        fontWeight: '500',
        cursor: 'pointer',
      },
      selectBackRight: {
        backgroundColor: 'white',
        width: this.state.width,
        display: this.state.Rightdisplay,
        border: '1.1px solid lightgrey',
        padding: '10px 18px',
        fontWeight: '500',
        cursor: 'pointer',
      },
      selectBackRightDiv: {
        boxShadow: '1px 1px 2px #999',
        position: 'absolute',
        top: this.state.leftTop,
        right: this.state.rightLeft,
        zIndex: 100,
      },
    };
    return (
      <div style={style.allDiv}>
        <span role="none" onClick={this.showCas.bind(this)}>
          <a
            role="none"
            style={{ color: 'black', position: 'relative', zIndex: 10 }}
            onClick={onClicks.bind(this, record)}
          >
            {inName}
          </a>
          <Icon type="down" />
        </span>
        <div style={{ position: 'relative' }}>
          <div>
            <div style={{ boxShadow: '1px 2px 31px #999', position: 'absolute', zIndex: '100' }}>
              <div style={style.selects}>
                <ul style={style.selectBackLeftTop}>
                  <li style={{ width: this.state.width, position: 'relative' }}>
                    {Choerodon.getMessage('选定', 'Select')}
                  </li>
                  {this.state.liSelectChild}
                </ul>
              </div>
              <div style={{ display: 'flex' }}>
                <ul style={style.selectBackLeft}>
                  {liParent}
                </ul>
              </div>
              <div style={style.btnContent}>
                <Button
                  type="primary"
                  onClick={this.saveBtn.bind(this)}
                >{Choerodon.getMessage('保存', 'save')}</Button>
                &nbsp;
                <Button
                  onClick={this.showCas.bind(this)}
                  style={{ marginLeft: 7 }}
                >{Choerodon.getMessage('取消', 'cancel')}</Button>
              </div>
            </div>
          </div>
          <div style={style.selectBackRightDiv}>
            <ul
              style={style.selectBackRight}
              onMouseEnter={this.openLiChild.bind(this)}
            >
              {this.state.liChild}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
export default RoleList;
