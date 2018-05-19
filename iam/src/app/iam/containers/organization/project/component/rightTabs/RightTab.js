
/**
 * Created by mading on 2017/12/2.
 */
import React, { Component } from 'react';
import { Tabs } from 'antd';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';

import './RightTab.scss';

const TabPane = Tabs.TabPane;

@inject('AppState')
@observer
export default class RightTab extends Component {
  // static propTypes = {
  //   operation: React.PropTypes.string.isRequired,
  //   onTabClose: React.PropTypes.func.isRequired,
  //   handleEdit: React.PropTypes.func,
  //   id: React.PropTypes.number,
  //   haveEditStatus: React.PropTypes.bool,
  // };
  componentDidUpdate() {
    const tabPane = document.getElementsByClassName('rightTab-tabpane')[0];
    if (tabPane) {
      tabPane.style.height = `${window.innerHeight - 58 - 48}px`;
    }
  }

  render() {
    const { handleEdit, operation, onTabClose, haveEditStatus, id } = this.props;
    const rightTabClass = classnames({
      'rightTab-header': operation,
      'rightTab-hidden': !operation,
    });

    let title = '';
    if (operation) {
      switch (operation) {
        case 'edit':
          title = Choerodon.getMessage('编辑', 'Edit');
          break;
        case 'detail':
          title = Choerodon.getMessage('详情', 'Detail');
          break;
        case 'create':
          title = Choerodon.getMessage('创建', 'Create');
          break;
        default:
          return title;
      }
    }

    const editOpt = haveEditStatus && (
      <a
        role="none"
        onClick={handleEdit.bind(this, id, 'edit')}
        className="tabPane-edit"
      >
        <span className="icon-mode_edit rightTab-icon-edit" />
        <span>{Choerodon.getMessage('编辑', 'edit')}</span>
      </a>);

    const tab = (<div className="rightTab-tabPane-title">
      <span role="none" onClick={onTabClose.bind(this)} className="tabPane-close icon-close" />
      <span className="rightTab-tabPane-text">{title}</span>
    </div>);


    return (
      operation ? <div className={rightTabClass}>
        <Tabs defaultActiveKey="1" size="small" tabBarExtraContent={editOpt}>
          <TabPane
            forceRender
            tab={tab}
            key="1"
            placeholder={this.props.children}
            className="rightTab-tabpane"
          >
            {this.props.children}
          </TabPane>
        </Tabs>
      </div> : null
    );
  }
}
