/**
 * Created by lty on 2017/6/27.
 */
import React, { Component, PropTypes } from 'react';
import { Button, Tree } from 'antd';

const TreeNode = Tree.TreeNode;

class RoleList extends Component {
  static propTypes = {
    treeData: PropTypes.arrayOf.isRequired,
    defaultSelectKey: PropTypes.arrayOf.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      checkedKeys: [],
    };
  }


  onCheck = (checkedKeys) => {
    this.setState({
      checkedKeys: checkedKeys.checked,
    });
  };

  render() {
    const { treeData, handleClose, defaultSelectKey, handleSubmit, showClose } = this.props;
    const treeNodes = [];
    treeData.map((item) => {
      const childNodes = [];
      item.children.map((child) => {
        childNodes.push(<TreeNode title={child.label} key={child.value} isLeaf="true" />);
        return child;
      });
      treeNodes.push(<TreeNode title={item.label} key={item.key} disableCheckbox="true" >
        {childNodes}
      </TreeNode>);
      return item;
    });

    const style = {
      btnContent: {
        // flex: '1 1 0',
        display: 'flex',
        justifyContent: 'flex-end',
      },
    };
    return (
      <div style={{ height: '100%' }}>
        <Tree
          checkable
          onCheck={this.onCheck}
          checkStrictly="true"
          defaultExpandAll="true"
          autoExpandParent="true"
          defaultCheckedKeys={defaultSelectKey}
        >
          {treeNodes}
        </Tree>
        <div style={style.btnContent}>
          <Button
            type="primary"
            onClick={handleSubmit.bind(this, this.state.checkedKeys)}
          >{Choerodon.getMessage('保存', 'save')}</Button>
          &nbsp;
          {showClose ? <Button onClick={handleClose}>{Choerodon.getMessage('关闭', 'close')}</Button> : ''}
        </div>
      </div>
    );
  }
}

export default RoleList;
