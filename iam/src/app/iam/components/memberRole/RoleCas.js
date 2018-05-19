/*eslint-disable*/
/**
 * Created by lty on 2017/6/27.
 */
import React, { Component, PropTypes } from 'react';
import { Button, Icon, Popover, Tooltip } from 'antd';
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
      leftTop: 0,
      selectId: [],
      beginFlag: 0,
      width: 200,
      rightLeft: -319,
      liParentSelectedBackGround: 'white',
      loading: false,
    };
  }

  componentWillMount() {
    const { record } = this.props;
    this.beginSelected(record);
  }
  // 删除项目节点的函数
  cancleSelect(value, cancleValue) {
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
          onClick={this.cancleSelect.bind(this, theValue, cancleValue)}
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
    if (cancleValue.children) {
      const liChild = cancleValue.children.map((vals, akey) => {
        const liChildKey = akey;
        if (this.state.text.indexOf(vals.label) > -1) {
          return (
            <Tooltip placement='left' title={vals.description}>
               <li
              style={{ width: this.state.width, position: 'relative' }}
              id={vals.value}
              onClick={this.showSelected.bind(this, vals, cancleValue)}
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
                {vals.label}
              </li>
            </Tooltip>
           );
        } else {
          return (
            <Tooltip placement='left' title={vals.description}>
              <li
              style={{ width: this.state.width, position: 'relative' }}
              id={vals.value}
              onClick={this.showSelected.bind(this, vals, cancleValue)}
            >
              <span
                style={{
                  marginLeft: '23px',
                }}
              ></span>
              {vals.label}
            </li>
            </Tooltip>
            );
        }
      });
      const theLiChild = liChild;
      this.setState({
        liChild: theLiChild,
      });
    }  
  }

  // 添加选中的项目函数
  showSelected(value, childrenValue) {
    const { text, selectId } = this.state;
    const newText = _.uniq(text);
    const newSelectId = _.uniq(selectId);
    this.state.text = newText;
    this.state.selectId = newSelectId;
    if (this.state.text.indexOf(value.label) > -1) {
      _.remove(text, (removeValue) => {
        return removeValue == value.label;
      });
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
            onClick={this.cancleSelect.bind(this, theValue, childrenValue)}
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
      const liChild = childrenValue.children.map((vals, akey) => {
        const liChildKey = akey;
        if (this.state.text.indexOf(vals.label) > -1) {
          return (
            <Tooltip placement='left' title={vals.description}>
              <li
              style={{ width: this.state.width, position: 'relative' }}
              id={vals.value}
              onClick={this.showSelected.bind(this, vals, childrenValue)}
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
              {vals.label}
            </li>
            </Tooltip>
            );
        } else {
          return (
            <Tooltip placement='left' title={vals.description}>
              <li
              style={{ width: this.state.width, position: 'relative' }}
              id={vals.value}
              onClick={this.showSelected.bind(this, vals, childrenValue)}
            >
              <span
                style={{
                  marginLeft: '23px',
                }}
              ></span>
              {vals.label}
            </li>
            </Tooltip>
            );
        }
      });
      const theLiChild = liChild;
      this.setState({
        liChild: theLiChild,
      });
    } else {
      text.reverse().push(value.label);
      selectId.push(value.value);
      const newText = _.uniq(text.reverse());
      const newSelectId = _.uniq(selectId);
      this.state.text = newText;
      this.state.selectId = newSelectId;
      const liSelectChild = this.state.text.map((values, key) => {
        const theValue = values;
        const theKey = key;
        return (
          <li
            style={{ width: this.state.width, position: 'relative' }}
            onClick={this.cancleSelect.bind(this, theValue, childrenValue)}
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
      const liChild = childrenValue.children.map((vals, akey) => {
        const liChildKey = akey;
        if (this.state.text.indexOf(vals.label) > -1) {
          return (
            <Tooltip placement='left' title={vals.defaultSelectKey}>
              <li
              style={{ width: this.state.width, position: 'relative' }}
              id={vals.value}
              onClick={this.showSelected.bind(this, vals, childrenValue)}
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
              {vals.label}
            </li>
            </Tooltip>
            );
        } else {
          return (
            <Tooltip placement='left' title={vals.description}>
              <li
              style={{ width: this.state.width, position: 'relative' }}
              id={vals.value}
              onClick={this.showSelected.bind(this, vals, childrenValue)}
            >
              <span
                style={{
                  marginLeft: '23px',
                }}
              ></span>
              {vals.label}
            </li>
            </Tooltip>
            );
        }
      });
      const theLiChild = liChild;
      this.setState({
        liChild: theLiChild,
      });
    }
  }

  // 是否关闭菜单
  showCas() {
    const { record } = this.props;
    if (this.state.Leftdisplay === 'none') {
      if (record) {
        this.beginSelected(record);
      }
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
  showCasBtn() {
    const { record, treeData } = this.props;
    if (this.state.Leftdisplay === 'none') {
      if (record) {
        this.beginSelected(record);
      }
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
    const keys = key * 30;
    this.setState({
      leftTop: 0 + keys,
    });
    this.setState({
      selectedBorderBottom: 'none',
    });
    const liChild = value.children.map((vals, akey) => {
      const liChildKey = akey;
      if (this.state.text.indexOf(vals.label) > -1) {
        return (
          <Tooltip placement='left' title={vals.description}>
            <li
            style={{ width: this.state.width, position: 'relative' }}
            id={vals.value}
            onClick={this.showSelected.bind(this, vals, value)}
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
            {vals.label}
          </li>
          </Tooltip>
          );
      } else {
        return (
          <Tooltip placement='left' title={vals.description}>
            <li
            style={{ width: this.state.width, position: 'relative' }}
            id={vals.value}
            onClick={this.showSelected.bind(this, vals, value)}
          >
            <span
              style={{
                marginLeft: '23px',
              }}
            ></span>
            {vals.label}
          </li>
          </Tooltip>
          );
      }
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
  closeLiChild() {
    this.setState({
      Rightdisplay: 'none',
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
  // 页面载入时调用
  beginSelected(role) {
    const { defaultSelectKey, treeData, AppState } = this.props;
    const language = AppState.currentLanguage;
    // if (defaultSelectKey.length == 0) {
    if (role) {
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
              onClick={this.cancleSelect.bind(this, value.roleDescription)}
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
      });
      const newBeginSelectedChild = _.uniq(beginSelectedChild);
      this.setState({
        liSelectChild: newBeginSelectedChild,
      });
    }
    // } else {
    //   // let map;
    //   if (languageOld === 'zh') {
    //     this.state.rightLeft = -348;
    //     this.state.width = 200;
    //   } else if (languageOld === 'en') {
    //     this.state.rightLeft = 75;
    //     this.state.width = 320;
    //   }
    //   let beginSelectedChild = [];
    //   treeData.map((value) => {
    //     value.children.map((value, key) => {
    //       if (defaultSelectKey.indexOf(value.value) > -1) {
    //         this.state.text.push(value.label);
    //         this.state.text = _.uniq(this.state.text);
    //         this.state.selectId.push(value.value.toString());
    //         beginSelectedChild.push(
    //           <li
    //             style={{ width: this.state.width, position: 'relative' }}
    //             onClick={this.cancleSelect.bind(this, value.roleDescription, key)}
    //           >
    //             <Icon
    //               type="check"
    //               style={{
    //                 color: '#3367D6',
    //                 fontWeight: 'bolder',
    //                 marginLeft: '6px',
    //                 marginRight: '5px',
    //               }}
    //             />{value.label}
    //           </li>);
    //       }
    //     })
    //   })
    //   const newBeginSelectedChild = _.uniq(beginSelectedChild);
    //   this.setState({
    //     liSelectChild: newBeginSelectedChild,
    //   });
    // }
  }

  saveBtn() {
    const { handleSubmit } = this.props;
    this.state.loading = true;
    handleSubmit(this.state.selectId);
    this.showCas();
  }
  //移入加载时间 
  loadLiChildEnter(vals, keys) {
    const { record } = this.props
    if (record) {
      const styleSelected = document.getElementById(`${record.userName}${vals.value}`);
      styleSelected.style.background = 'rgba(215, 214, 214, 0.58)';
      setTimeout(() => { this.loadLiChild(vals, keys) }, 500);
    } else {
      const styleSelected = document.getElementById(`li${vals.value}`);
      styleSelected.style.background = 'rgba(215, 214, 214, 0.58)';
      setTimeout(() => { this.loadLiChild(vals, keys) }, 500);
    }
  }
  loadLiChildLeave(vals, keys) {
    const { record } = this.props;
    if (record) {
      const styleSelected = document.getElementById(`${record.userName}${vals.value}`);
      styleSelected.style.background = 'white';
    } else {
      const styleSelected = document.getElementById(`li${vals.value}`);
      styleSelected.style.background = 'white';
    }
  }
  // 多个标签显示
  NameShow() {
    const contentSelect = this.state.text.map(value => {
      return (
        <span>{value} </span>
      )
    });
    const content = (<div>{contentSelect}</div>);
    if (this.state.text.length == 1) {
      return (<span>{this.state.text[0]}</span>)
    } else {
      return (
        <Popover placement={"bottom"} content={content} title={Choerodon.getMessage("已有成员角色", "Member Roles")} trigger="hover" mouseEnterDelay="1">
          <span>多个</span>
        </Popover>
      );
    }
  }
  render() {
    const { AppState, treeData, record, onClicks, open } = this.props;
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
        borderTop: 'none',
        padding: '5px 10px',
        fontWeight: '500',
        cursor: 'pointer',
        maxHeight: 200,
        overflowY: 'auto',
        overflowX: 'hidden'
      },
      selectBackLeft: {
        backgroundColor: 'white',
        width: this.state.width,
        display: this.state.Leftdisplay,
        borderLeft: '1.1px solid lightgrey',
        borderRight: '1.1px solid lightgrey',
        fontWeight: '500',
        cursor: 'pointer',
        maxHeight: 300,
        overflowY: 'auto',
        overflowX: 'hidden'
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
        position: 'relative',
        top: this.state.leftTop,
        right: 400,
        zIndex: 100,
        height: 0,
      },
      selectedName: {
        width: this.state.width,
        position: 'relative',
        padding: '1px 16px',
        background: 'white',
        border: '1.1px solid lightgrey',
        display: this.state.Leftdisplay,
        borderBottom: 'none',
      },
      liParentSelected: {
        width: this.state.width,
        position: 'relative',
        background: this.state.liParentSelectedBackGround,
        padding: '3px 17px',
      }
    };
    let RoleCas;
    this.state.selectId = _.uniq(this.state.selectId);
    const language = AppState.currentLanguage;
    // let map;
    let liParent;
    if (record) {
      if (language === 'zh') {
        liParent = treeData.map((value, key) => {
          const val = value;
          return (
            <Tooltip placement='left' title={val.description}>
              <li
              style={style.liParentSelected}
              onMouseEnter={this.loadLiChildEnter.bind(this, val, key)}
              onClick={this.loadLiChild.bind(this, val, key)}
              onMouseLeave={this.loadLiChildLeave.bind(this, val, key)}
              id={`${record.userName}${val.value}`}
            >
              {val.label}
              <Icon type={'right'} style={{ position: 'absolute', right: 30, margin: 4 }} />
            </li>
            </Tooltip>
            );
        });
        this.state.rightLeft = -351;
        this.state.width = 200;
      } else if (language === 'en') {
        liParent = treeData.map((value, key) => {
          const val = value;
          return (
            <Tooltip placement='left' title={val.description}>
              <li
              style={style.liParentSelected}
              onMouseEnter={this.loadLiChildEnter.bind(this, val, key)}
              onMouseLeave={this.loadLiChildLeave.bind(this, val, key)}
              onClick={this.loadLiChild.bind(this, val, key)}
              id={`${record.userName}${val.value}`}
            >
              <Icon type={'left'} style={{ position: 'absolute', left: 0, margin: 4 }} />
              {val.label}
            </li>
            </Tooltip>
            );
        });
        this.state.rightLeft = 75;
        this.state.width = 320;
      }
      RoleCas = (<div style={{ position: 'relative', display: this.state.Leftdisplay }} id={record.userName}>
        <div>
          <div style={{ boxShadow: 'rgba(153, 153, 153, 0.51) 0px 3px 6pxs', position: 'absolute', zIndex: '100' }}>
            <div style={style.selects}>
              <div style={style.selectedName}>
                {Choerodon.getMessage('选定', 'Select')}
              </div>
              <ul style={style.selectBackLeftTop}>
                {this.state.liSelectChild}
              </ul>
            </div>
            <div style={{ display: 'flex' }}>
              <ul style={style.selectBackLeft}>
                {liParent}
              </ul>
              <div
                style={style.selectBackRightDiv}
                onMouseLeave={this.closeLiChild.bind(this)}
              >
                <ul
                  style={style.selectBackRight}
                  onMouseEnter={this.openLiChild.bind(this)}
                >
                  {this.state.liChild}
                </ul>
              </div>
            </div>
            <div style={style.btnContent}>
              <Button
                type="primary"
                loading={this.state.loading}
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
      </div>)
    }
    // 这边是添加里面的组件
    else {
      if (language === 'zh') {
        liParent = treeData.map((value, key) => {
          const val = value;
          return (
            <Tooltip placement='left' title={val.description}>
              <li
              style={style.liParentSelected}
              onMouseEnter={this.loadLiChildEnter.bind(this, val, key)}
              onClick={this.loadLiChild.bind(this, val, key)}
              onMouseLeave={this.loadLiChildLeave.bind(this, val, key)}
              id={`li${val.value}`}
            >
              {val.label}
              <Icon type={'right'} style={{ position: 'absolute', right: 30, margin: 4 }} />
            </li>
            </Tooltip>
            );
        });
        this.state.rightLeft = -351;
        this.state.width = 200;
      } else if (language === 'en') {
        liParent = treeData.map((value, key) => {
          const val = value;
          return (
            <Tooltip placement='left' title={val.description}>
              <li
              style={style.liParentSelected}
              onMouseEnter={this.loadLiChildEnter.bind(this, val, key)}
              onMouseLeave={this.loadLiChildLeave.bind(this, val, key)}
              onClick={this.loadLiChild.bind(this, val, key)}
              id={`li${val.value}`}
            >
              <Icon type={'left'} style={{ position: 'absolute', left: 0, margin: 4 }} />
              {val.label}
            </li>
            </Tooltip>
            );
        });
        this.state.rightLeft = 75;
        this.state.width = 320;
      }
      RoleCas = (<div style={{ position: 'relative' }}>
        <div>
          <div style={{ boxShadow: '1px 2px 10px #999', position: 'absolute', zIndex: '100' }}>
            <div style={style.selects}>
              <div style={style.selectedName}>
                {Choerodon.getMessage('选定', 'Select')}
              </div>
              <ul style={style.selectBackLeftTop}>
                {this.state.liSelectChild}
              </ul>
            </div>
            <div style={{ display: 'flex' }}>
              <ul style={style.selectBackLeft}>
                {liParent}
              </ul>
              <div style={style.selectBackRightDiv}>
                <ul
                  style={style.selectBackRight}
                  onMouseEnter={this.openLiChild.bind(this)}
                >
                  {this.state.liChild}
                </ul>
              </div>
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
      </div>)
    }
    return (
      <div style={style.allDiv}>
        <span role="none" onClick={this.showCasBtn.bind(this)}>
          <a
            role="a"
            style={{ color: 'black', position: 'relative', zIndex: 10 }}
            onClick={onClicks.bind(this, record)}
          >
            {this.NameShow()}
          </a>
          <Icon type="down" />
        </span>
        {RoleCas}
      </div>
    );
  }
}
export default RoleList;
