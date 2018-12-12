import React, { Component } from 'react';
import { Tree, Input, Icon } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios } from 'choerodon-front-boot';
import _ from 'lodash';
import querystring from 'query-string';
import classnames from 'classnames';
import './apiTree.scss';
import APITestStore from '../../stores/global/api-test';

const TreeNode = Tree.TreeNode;

@injectIntl
@inject('AppState')
@observer
export default class ApiTree extends Component {
  state = {
    searchValue: '',
    treeData: [],
    pagination: {
      current: 1,
      pageSize: 200,
      total: 0,
    },
    expandedKeys: [],
    autoExpandParent: false,
  }


  componentDidMount() {
    this.loadInitData();
  }

  loadInitData = () => {
    // APITestStore.setLoading(true);
    APITestStore.loadApis().then((res) => {
      if (res.failed) {
        Choerodon.prompt(res.message);
        // APITestStore.setLoading(false);
      } else if (res.service.length) {
        APITestStore.setService(res.service);
        APITestStore.setPageLoading(false);
        this.setState({
          treeData: res.service,
        });
      }
    });
  };


  // 展开或关闭树节点
  onExpand = (expandedKeys) => {
    APITestStore.setExpandedKeys(expandedKeys);
    this.setState({ expandedKeys, autoExpandParent: false });
  }


  loadDetail = (selectedKeys, {
    selected, selectedNodes, node, event,
  } = {}) => {
    if (selectedNodes[0].props.method) {
      APITestStore.setCurrentNode(selectedNodes);
      this.props.getDetail(selectedNodes);
    } else {
      APITestStore.setDetailFlag('empty');
    }
  }

  // getParentKey = (key, tree) => {
  // debugger;
  // let parentKey;
  // for (let i = 0; i < tree.length; i++) {
  //   const node = tree[i];
  //   if (node.children) {
  //     if (node.children.some(item => item.key === key)) {
  //       parentKey = node.key;
  //     } else if (getParentKey(key, node.children)) {
  //       parentKey = getParentKey(key, node.children);
  //     }
  //   }
  // }
  // return parentKey;
  // };

  filterApi = (value) => {
    // if (value !== '') {
    //   const expandedKeys = this.state.treeData.map((item) => {
    //     if (item.title.indexOf(value) > -1) {
    //       return this.getParentKey(item.key, APITestStore.getTotalData);
    //     }
    //     return null;
    //   }).filter((item, i, self) => item && self.indexOf(item) === i);
    //   APITestStore.setExpandedKeys(expandedKeys);
    // }
    // this.setState({
    //   searchValue: value,
    //   autoExpandParent: true,
    // });
  }

  renderTreeNodes = (data) => {
    const expandedKeys = this.state.expandedKeys;
    let icon = <Icon
      style={{ color: '#3F51B5' }}
      type="folder_open"
    />;

    return data.map((item) => {
      if (item.method) {
        icon = <div className={classnames('c7n-iam-apitest-tree-methodTag', `c7n-iam-apitest-tree-methodTag-${item.method}`)}><div>{item.method}</div></div>;
      }

      if (item.children) {
        const icon2 = (
          <Icon
            style={{ color: '#3F51B5' }}
            type={expandedKeys.includes(item.key) ? 'folder_open2' : 'folder_open'}
          />
        );
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item} icon={icon2}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} icon={icon} className={classnames({ 'c7n-iam-apitest-api-wrapper': item.method })} />;
    });
  }

  render() {
    const { onClose, intl } = this.props;
    const { autoExpandParent } = this.state;
    const expandedKeys = APITestStore.getExpandedKeys;
    return (
      <div className="c7n-iam-apitest-tree-content">
        <div className="c7n-iam-apitest-tree-top">
          <Input
            prefix={<Icon type="filter_list" style={{ color: 'black' }} />}
            placeholder={intl.formatMessage({ id: 'global.apitest.filter' })}
            onChange={e => _.debounce(this.filterApi, 200).call(null, e.target.value)}
          />
          <div
            role="none"
            className="c7n-iam-apitest-tree-top-button"
            onClick={onClose}
          >
            <Icon type="navigate_before" />
          </div>
        </div>
        <div className="c7n-iam-apitest-tree-main">
          <Tree
            // selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            showIcon
            onSelect={this.loadDetail}
            onExpand={this.onExpand}
            autoExpandParent={autoExpandParent}
          >
            {this.renderTreeNodes(this.state.treeData)}
          </Tree>
        </div>
      </div>
    );
  }
}
