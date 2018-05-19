/**
 * Created by jaywoods on 2017/6/23.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Menu } from 'antd';
import MenuType from 'MenuType';
import AppState from '../stores/globalStores/AppState';
import menuStore from '../stores/MenuStore';
// import LeftIconButton from '../components/menu/LeftIconButton';

@inject('AppState')
@observer
class MasterHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectFlag: true,
      organizationFlag: true,
    };
    this.getMenuChild = this.getMenuChild.bind(this);
  }

  getMenuChild = () => {
    const menuChild = this.props.menuChild.map(item => (
      <Menu.Item style={item.style}>{item.component}</Menu.Item>
    ));
    return menuChild;
  };

  render() {
    const styles = {
      appBar: {
        backgroundColor: Choerodon.setTheme('header') || '#3b78e7',
        // Needed to overlap the examples
        top: 0,
        height: 48,
        display: 'flex',
        alignItems: 'center',
      },
    };
    return (
      <div
        style={{          
          height: '48px',          
        }}
      >
        <Menu mode="horizontal" style={styles.appBar}>
          {this.getMenuChild()}
        </Menu>
      </div>
    );
  }
}

export default MasterHeader;
