import React, { Component } from 'react';
import { Tree, Input, Icon } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { axios } from 'choerodon-front-boot';
import _ from 'lodash';
import querystring from 'query-string';
import classnames from 'classnames';
import './apiTree.scss';
import APITestStore from '../../../../stores/global/api-test';

const TreeNode = Tree.TreeNode;

@injectIntl
@inject('AppState')
@observer
export default class ApiTree extends Component {
  state = {
    searchValue: '',
    treeData: [],
    dataList: [],
    pagination: {
      current: 1,
      pageSize: 200,
      total: 0,
    },
    expandedKeys: [],
    autoExpandParent: false,
    eventKey: null, // 当前点击节点的key
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
        this.generateList(res.service);
        this.setState({
          treeData: res.service,
        });
      }
    });
  };

  generateList = (data) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const key = node.key;
      const title = node.title;
      this.state.dataList.push({ key, title });
      if (node.children) {
        this.generateList(node.children, node.key);
      }
    }
  };

  // 展开或关闭树节点
  onExpand = (expandedKeys) => {
    APITestStore.setExpandedKeys(expandedKeys);
    this.setState({ expandedKeys, autoExpandParent: false });
  }


  loadDetail = (selectedKeys, {
    selected, selectedNodes, node, event,
  } = {}) => {
    const { eventKey } = this.state;
    if (eventKey !== node.props.eventKey) {
      this.setState({
        eventKey: node.props.eventKey,
      });
      if (selectedNodes[0].props.method) {
        APITestStore.setCurrentNode(selectedNodes);
        this.props.getDetail(selectedNodes);
      } else {
        APITestStore.setDetailFlag('empty');
        APITestStore.setCurrentNode(null);
      }
    }
  }

  getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  filterApi = _.debounce((value) => {
    const expandedKeys = this.state.dataList.map((item) => {
      if (item.title.indexOf(value) > -1) {
        return this.getParentKey(item.key, this.state.treeData);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    // APITestStore.setExpandedKeys(expandedKeys);
    this.setState({
      expandedKeys: value.length ? expandedKeys : [],
      searchValue: value,
      autoExpandParent: true,
    });
  }, 1000);

  renderTreeNodes = (data) => {
    const expandedKeys = this.state.expandedKeys;
    const { searchValue } = this.state;
    let icon = <Icon
      style={{ color: '#3F51B5' }}
      type="folder_open"
    />;

    return data.map((item) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.title}</span>;
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
          <TreeNode title={title} key={item.key} dataRef={item} icon={icon2}>
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
    return (
      <div className="c7n-iam-apitest-tree-content">
        <div className="c7n-iam-apitest-tree-top">
          <Input
            prefix={<Icon type="filter_list" style={{ color: 'black' }} />}
            placeholder={intl.formatMessage({ id: 'global.apitest.filter' })}
            onChange={e => this.filterApi.call(null, e.target.value)}
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
            expandedKeys={this.state.expandedKeys}
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
