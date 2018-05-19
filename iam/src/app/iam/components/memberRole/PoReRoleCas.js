import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, message, Tooltip } from 'antd';
import Permission from 'PerComponent';
import NewButton from 'NewButton';
import './rolecas.css';
import ProjectMemberRoleStore from '../../stores/project/memberRole/MemberRoleStore';

let enterItem;

@inject('AppState')
@observer
class PoReRoleCas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 弹出层显示与否
      RoleDivIf: 'none',
      // 二级菜单的显示
      secondRoleDivIf: 'none',
      // 当前组件的已选择权限
      recentChosenRole: {},
      // 多个下面一行提示框
      showTitle: 'none',
      // 二级菜单的top
      secondTop: 0,
      returnPBorder: false,
    };
    this.showRoleCas = this.showRoleCas.bind(this);
    this.mouseEnterCanChose = this.mouseEnterCanChose.bind(this);
    this.showDropDown = this.showDropDown.bind(this);
    this.showCanChose = this.showCanChose.bind(this);
    this.mouseLeaveCanChose = this.mouseLeaveCanChose.bind(this);
    this.showAlChosenRole = this.showAlChosenRole.bind(this);
    this.clickSecondRole = this.clickSecondRole.bind(this);
    this.clickChosenRole = this.clickChosenRole.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.showToolTitle = this.showToolTitle.bind(this);
    this.showBlockToolTitle = this.showBlockToolTitle.bind(this);
    this.leaveBlockToolTitle = this.leaveBlockToolTitle.bind(this);
    this.clickDiv = this.clickDiv.bind(this);
    this.judgeSecondLi = this.judgeSecondLi.bind(this);
    this.orderByOrder = this.orderByOrder.bind(this);
  }

  componentWillMount() {
    if (!this.props.add) {
      const data = this.props.data;
      for (let a = 0; a < data.roles.length; a += 1) {
        data.roles[a].check = true;
      }
      this.setState({
        recentChosenRole: data,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.addModelVisible === false) {
      this.state.recentChosenRole = {};
      this.setState({
        RoleDivIf: 'none',
        secondRoleDivIf: 'none',
        recentChosenRole: this.state.recentChosenRole,
      });
    }
    // 解决弹出框重叠问题
    if (this.props.wholeRoleData) {
      if (nextProps.nowClick !== this.props.wholeRoleData.id) {
        if (this.props.roleName) {
          this.state.recentChosenRole = this.props.roleData;
        } else {
          // 如果从添加打开
          this.state.recentChosenRole = [];
        }
        this.setState({
          recentChosenRole: this.state.recentChosenRole,
        });
        // 关闭
        this.setState({
          RoleDivIf: 'none',
          secondRoleDivIf: 'none',
        });
      }
    }
    if (nextProps.clickId) {
      if (nextProps.clickId !== this.props.data.userId) {
        // 关闭
        this.setState({
          RoleDivIf: 'none',
          secondRoleDivIf: 'none',
          returnPBorder: false,
        });
      }
    }
    if (nextProps.OpenAdd) {
      if (nextProps.OpenAdd === true) {
        this.setState({
          RoleDivIf: 'none',
          secondRoleDivIf: 'none',
          returnPBorder: false,
        });
      }
    }
    // 点击其他地方隐藏弹出框
    if (nextProps.clickBody !== this.props.clickBody) {
      if (this.state.RoleDivIf === 'block') {
        if (this.props.roleName) {
          this.state.recentChosenRole = this.props.roleData;
        } else {
          // 如果从添加打开
          this.state.recentChosenRole = [];
        }
        this.setState({
          recentChosenRole: this.state.recentChosenRole,
        });
        // 关闭
        this.setState({
          RoleDivIf: 'none',
          secondRoleDivIf: 'none',
        });
      }
    }
  }

  // 点击出现或隐藏弹出层
  showRoleCas = () => {
    if (this.state.RoleDivIf === 'none') {
      // 打开
      this.setState({
        RoleDivIf: 'block',
        secondRoleDivIf: 'none',
        showTitle: 'none',
        returnPBorder: true,
      });
    } else {
      // 关闭
      // 如果从列表打开
      if (this.props.roleName) {
        this.state.recentChosenRole = this.props.roleData;
      } else {
        // 如果从添加打开
        this.state.recentChosenRole = [];
      }
      this.setState({
        recentChosenRole: this.state.recentChosenRole,
      });
      // 关闭
      this.setState({
        RoleDivIf: 'none',
        secondRoleDivIf: 'none',
      });
    }
  }

  /**
   * 下拉列表的mouseenter事件
   * 
   * @memberof ReRoleCas
   */
  mouseEnterCanChose = (index, name) => {
    // 当前组织可分配的权限
    enterItem = setTimeout(() => {
      const canChoseList = ProjectMemberRoleStore.getRoleData;
      const secondeLi = canChoseList.filter(item => item.serviceName === name)[0].roles;
      ProjectMemberRoleStore.setSecondLi(secondeLi);
      this.setState({
        secondTop: index * 30,
        secondRoleDivIf: 'block',
      });
    }, 500);
  }

  /**
   * 下拉列表的mouseleave事件
   * 
   * @memberof ReRoleCas
   */
  mouseLeaveCanChose = (index) => {
    clearTimeout(enterItem);
  }

  /**
   * 二级菜单的点击事件
   * 
   * @memberof ReRoleCas
   */
  clickSecondRole = (item) => {
    const alChosenRole = this.state.recentChosenRole;
    const roles2 = [];
    if (JSON.stringify(alChosenRole) !== '{}') {
      for (let b = 0; b < this.state.recentChosenRole.roles.length; b += 1) {
        roles2[b] = this.state.recentChosenRole.roles[b];
      }
    }
    let flag = 0;
    if (JSON.stringify(alChosenRole) !== '{}') {
      for (let a = 0; a < alChosenRole.roles.length; a += 1) {
        if (alChosenRole.roles[a].id === item.id && alChosenRole.roles[a].name === item.name) {
          flag = 1;
          
          alChosenRole.roles[a].check = !alChosenRole.roles[a].check;
        }
      }
    }
    if (flag === 0) {
      const items = item;
      items.check = true;
      roles2.push(items);
      const alchosenRole2 = {
        memberType: alChosenRole.memberType,
        roles: roles2,
        userEmail: alChosenRole.userEmail,
        userId: alChosenRole.userId,
        userName: alChosenRole.userName,
      };
      this.setState({
        recentChosenRole: alchosenRole2,
      });
    } else {
      this.setState({
        recentChosenRole: alChosenRole,
      });
    }
  }

  /**
   * 通过当前二级列表
   * 判断二级列表display是否显示
   * @memberof ReRoleCas
   */
  judgeSecondLi = (item) => {
    const recentChosenRole = this.state.recentChosenRole;
    if (JSON.stringify(recentChosenRole) !== '{}') {
      for (let a = 0; a < recentChosenRole.roles.length; a += 1) {
        if (recentChosenRole.roles[a].id === item.id 
          && recentChosenRole.roles[a].name === item.name) {
          // 存在
          if (recentChosenRole.roles[a].check === true) {
            return true;
          }
        }
      }
      return false;
    } else {
      return false;
    }
  }

  /**
   * 定义二级菜单
   * 
   * @memberof ReRoleCas
   */
  showSecondCanChose = () => {
    const secondList = ProjectMemberRoleStore.getSecondLi
      .filter(item => item.name !== null)
      .map(item => (
        <li
          role="none"
          style={{
            marginTop: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // marginLeft: '25%',
          }}
          onClick={this.clickSecondRole.bind(this, item)}
        >
          <div style={{ flexBasis: '10%', marginLeft: '0.5rem' }}>
            <Icon
              type="check"
              style={{
                color: 'rgb(51, 103, 214)',
                // marginRight: '1rem',
                display: this.judgeSecondLi(item) ? 'inline-block' : 'none',
              }}
            />
          </div>
          {
            item.description.length > 9 ? (
              <Tooltip placement="right" title={item.description}>
                <p style={{ flexBasis: '80%', textAlign: 'left' }}>
                  <nobr>{item.description.slice(0, 9)}...</nobr>
                </p>
              </Tooltip>
            ) : (
              <p style={{ flexBasis: '80%', textAlign: 'left' }}>
                <nobr>{item.description}</nobr>
              </p>
            )
          }
        </li>
      ));
    if (this.props.roleName) {
      const secondDiv = (
        <div
          role="none"
          style={{
            // display: this.state.secondRoleDivIf,
            background: 'white',
            position: 'absolute',
            width: '152px',
            right: 200,
            top: this.state.secondTop,
            textAlign: 'center',
            paddingBottom: '10px',
            boxShadow: 'rgb(153, 153, 153) 1px 2px 10px',
          }}
          onClick={this.clickDiv.bind(this)}
        >
          <ul>
            {secondList}
          </ul>
        </div>
      );
      return secondDiv;
    } else {
      const secondDiv = (
        <div
          role="none"
          style={{
            display: this.state.secondRoleDivIf,
            background: 'white',
            position: 'absolute',
            width: '152px',
            right: 200,
            top: this.state.secondTop,
            textAlign: 'center',
            paddingBottom: '10px',
            boxShadow: 'rgb(153, 153, 153) 1px 2px 10px',
          }}
          onClick={this.clickDiv.bind(this)}
        >
          <ul>
            {secondList}
          </ul>
        </div>
      );
      return secondDiv;
    }
  }

  /**
   * 定义可选列表 
   * 
   * @memberof ReRoleCas
   */
  showCanChose = () => {
    const storeFirstLi = ProjectMemberRoleStore.getRoleData;
    const canChoseRole = storeFirstLi.map((item, index) => (
      <li
        className="canchoseLi"
        key={item.key}
        style={{
          backgroundColor: item.backgroundColor,
          cursor: 'pointer',
          paddingTop: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
        onMouseEnter={this.mouseEnterCanChose.bind(this, index, item.serviceName)}
        onMouseLeave={this.mouseLeaveCanChose.bind(this, index, item.servicename)}
      >
        {item.serviceName}
        <Icon type="right" />
      </li>
    ));
    return canChoseRole;
  }

  /**
   * 点击已选择权限
   * 
   * @memberof ReRoleCas
   */
  clickChosenRole = (item) => {
    for (let a = 0; a < this.state.recentChosenRole.roles.length; a += 1) {
      if (this.state.recentChosenRole.roles[a].id === item.id &&
        this.state.recentChosenRole.roles[a].name === item.name
      ) {
        this.state.recentChosenRole.roles[a].check = !this.state.recentChosenRole.roles[a].check;
      }
    }
    this.setState({
      recentChosenRole: this.state.recentChosenRole,
    });
  }

  /**
   * 当前已选择的权限
   * 
   * @memberof ReRoleCas
   */
  showAlChosenRole = () => {
    if (JSON.stringify(this.state.recentChosenRole) !== '{}') {
      const DomAlChosenRole = this.state.recentChosenRole.roles.map(item => (
        <li
          role="none"
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onClick={this.clickChosenRole.bind(this, item)}
        >
          <div style={{ flexBasis: '10%' }}>
            <Icon
              type="check"
              style={{
                marginLeft: '1rem',
                color: 'rgb(51, 103, 214)',
                display: item.check ? 'block' : 'none',
              }}
            />
          </div>
          <p style={{ flexBasis: '80%', textAlign: 'left' }}>
            <nobr>{item.description}</nobr>
          </p>
        </li>
      ));
      return DomAlChosenRole;
    } else {
      return <div />;
    }
  }

  /**
   * 对一个对象数组进行排序 为了对两个对象数组进行比较
   * 
   * @memberof ReRoleCas
   */
  orderByOrder = (arr, propertyName) => {
    function compare(propertyNames) {
      return (object1, object2) => {
        const value1 = object1[propertyNames];
        const value2 = object2[propertyNames];
        if (value1 < value2) {
          return 1;
        } else if (value1 > value2) {
          return -1;
        } else {
          return 0;
        }
      };
    }
    arr.sort(compare(propertyName));
    arr.reverse();
    const newArr = arr;
    return newArr;
  }

  /**
   * 保存按钮事件
   * 
   * @memberof ReRoleCas
   */
  handleSave = () => {
    if (!this.props.add) {
      const { AppState } = this.props;
      const currentMenuType = AppState.currentMenuType;
      // const that = this;
      const role = {
        memberId: parseInt(this.state.recentChosenRole.userId, 10),
        memberType: this.state.recentChosenRole.memberType,
        resourceId: parseInt(currentMenuType.id, 10),
        resourceType: currentMenuType.type,
        // roles: this.state.recentChosenRole,
        roles: [],
      };
      for (let a = 0; a < this.state.recentChosenRole.roles.length; a += 1) {
        if (this.state.recentChosenRole.roles[a].check === true) {
          role.roles.push(this.state.recentChosenRole.roles[a].id);
        }
      }
      ProjectMemberRoleStore.handleRoleSave(currentMenuType.id, role)
        .then(() => {
          Choerodon.prompt('保存成功');
          this.setState({
            RoleDivIf: 'none',
            secondRoleDivIf: 'none',
            returnPBorder: false,
          });
          this.props.loadmemberRole();
        }).catch((err) => {
          Choerodon.prompt(`保存失败 ${err}`);
          this.setState({
            recentChosenRole: this.props.data,
            RoleDivIf: 'none',
            secondRoleDivIf: 'none',
            returnPBorder: false,
          });
          this.props.loadmemberRole();
        });
      this.setState({
        RoleDivIf: 'none',
        secondRoleDivIf: 'none',
        returnPBorder: false,
      });
    } else {
      ProjectMemberRoleStore.setAddChosenRoles(
        this.state.recentChosenRole.roles.filter(item => item.check === true));
      this.setState({
        RoleDivIf: 'none',
        secondRoleDivIf: 'none',
        returnPBorder: false,
      });
    }
    // const that = this;
    // if (this.props.roleName) {
    //   if (JSON.stringify(
    // that.orderByOrder(that.state.recentChosenRole, 'id')) 
    // === JSON.stringify(that.orderByOrder(that.props.roleData, 'id'))) {
    //     message.warning(Choerodon.getMessage('未修改或未选择任何项', 'Not select or fix anything'));
    //   } else {
    //     const role = {
    //       memberId: this.props.wholeRoleData.memberId,
    //       memberType: this.props.wholeRoleData.memberType,
    //       resourceId: this.props.wholeRoleData.resourceId,
    //       resourceType: 'project',
    //       // roles: this.state.recentChosenRole,
    //       roles: [],
    //     };
    //     for (let a = 0; a < this.state.recentChosenRole.length; a += 1) {
    //       if (this.state.recentChosenRole[a].display === 'inline-block') {
    //         if (role.roles.length === 0) {
    //           role.roles.push(this.state.recentChosenRole[a].id);
    //         } else {
    //           let already = 0;
    //           for (let b = 0; b < role.roles.length; b += 1) {
    //             if (role.roles[b] === this.state.recentChosenRole[a].id) {
    //               already = 1;
    //             }
    //           }
    //           if (already === 0) {
    //             role.roles.push(this.state.recentChosenRole[a].id);
    //           }
    //         }
    //       }
    //     }
    //     ProjectMemberRoleStore.handleRoleSave(this.props.wholeRoleData.resourceId, role)
    //       .then(() => {
    //         that.props.loadMemberRoles();
    //       }).catch((err) => {
    //         message.error(`保存失败 ${err}`);
    //       });
    //   }
    // }
    // this.setState({
    //   RoleDivIf: 'none',
    //   secondRoleDivIf: 'none',
    // });
  }

  /**
   * 下拉列表div
   * 
   * @memberof ReRoleCas
   */
  showDropDown = () => {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.organizationId;
    const projectId = menuType.id;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    // 定义下拉列表
    const RoleCas = (
      <div
        role="none"
        style={{
          display: this.state.RoleDivIf,
          width: '200px',
          boxShadow: 'rgb(153, 153, 153) 1px 2px 10px',
          backgroundColor: 'white',
          paddingTop: '5px',
          paddingBottom: '5px',
          zIndex: 100,
          position: 'relative',
        }}
        onClick={this.clickDiv.bind(this)}
      >
        {/* 顶部已选择框 */}
        <div style={{
          borderBottom: '1px solid lightgrey',
        }}
        >
          <p
            style={{
              borderBottom: '1px solid lightgrey',
              paddingLeft: '1rem',
              paddingRight: '1rem',
            }}
          >{Choerodon.getMessage('选定', 'Select')}</p>
          <ul
            style={{
              paddingBottom: '0.5rem',
              overflowX: 'hidden',
              overflowY: 'auto',
              maxHeight: '100px',
            }}
          >
            {
              JSON.stringify(this.state.recentChosenRole) !== '{}' ?
                this.showAlChosenRole()
                : ''
            }
          </ul>
        </div>
        {/* 供选择的多级菜单框 */}
        <div
          style={{
            borderBottom: '1px solid lightgrey',
            position: 'relative',
          }}
        >
          <ul>
            {this.showCanChose()}
          </ul>
          {this.showSecondCanChose()}
        </div>
        {/* 底部的保存和取消按钮 */}
        <Permission service={'hap-user-service.member-role-project.update'} type={type} organizationId={organizationId} projectId={projectId}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: '0.5rem',
            }}
          >
            <NewButton
              onClick={this.handleSave.bind(this)}
              text={Choerodon.getMessage('保存', 'save')}
            />
            &nbsp;
            <NewButton
              style={{ marginLeft: 7 }}
              onClick={this.handleCancel.bind(this)}
              text={Choerodon.getMessage('取消', 'cancel')}
              className="color2"
            />
          </div>
        </Permission>
      </div>
    );
    return RoleCas;
  }

  /**
   * 取消按钮点击事件
   * 
   * @memberof ReRoleCas
   */
  handleCancel = () => {
    const data = this.props.add ? {} : ProjectMemberRoleStore.getOriginMemberRole
      .filter(item => item.userId === this.props.data.userId)[0];
    const data2 = JSON.parse(JSON.stringify(data));
    this.setState({
      recentChosenRole: this.props.add ? {} : data2,
      RoleDivIf: 'none',
      secondRoleDivIf: 'none',
      returnPBorder: false,
    });
  }

  /**
   * 鼠标悬停出现的一行
   * 
   * @memberof ReRoleCas
   */
  showToolTitle = () => {
    if (JSON.stringify(this.state.recentChosenRole) !== '{}') {
      const DomAlChosenRole = (
        <p
          style={{
            marginRight: '5px',
          }}
        >
          {
            this.state.recentChosenRole.roles.map((item, index) => {
              if (index < this.state.recentChosenRole.roles.length - 1) {
                return (
                  <span>
                    {item.description},&nbsp;&nbsp;
                  </span>
                );
              } else {
                return (
                  <span>
                    {item.description}
                  </span>
                );
              }
            })
          }
        </p>
      );
      return DomAlChosenRole;
    } else {
      return <div />;
    }
  }

  /**
   * 多个的hover事件
   * 
   * @memberof ReRoleCas
   */
  showBlockToolTitle = (returnP) => {
    if (returnP === '多个') {
      this.setState({
        showTitle: 'block',
      });
    }
  }

  /**
   * 多个的leave事件
   * 
   * @memberof ReRoleCas
   */
  leaveBlockToolTitle = () => {
    this.setState({
      showTitle: 'none',
    });
  }

  /**
   * 
   * 
   * @memberof ReRoleCas
   */
  clickDiv = (e) => {
    e.stopPropagation();
  }

  render() {
    // 定义全局使用样式
    const style = {
      allDiv: {
        position: 'absolute',
      },
    };

    let returnP = '';
    if (JSON.stringify(this.state.recentChosenRole) !== '{}') {
      if (this.state.recentChosenRole.roles.filter(item => item.check === true).length === 0) {
        returnP = Choerodon.getMessage('请选择', 'please choose');
      } else if (
        this.state.recentChosenRole.roles.filter(item => item.check === true).length === 1) {
        returnP = 
        this.state.recentChosenRole.roles.filter(item => item.check === true)[0].description;
      } else {
        returnP = Choerodon.getMessage('多个', 'many');
      }
    } else {
      returnP = Choerodon.getMessage('请选择', 'please choose');
    }

    return (
      <div
        role="none"
        style={style.allDiv}
      >
        <a
          role="none"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'black',
            position: 'relative',
            zIndex: 10,
            textDecoration: 'none',
            left: '0rem',
            top: -10,
          }}
          onClick={this.showRoleCas}
          onMouseEnter={this.showBlockToolTitle.bind(this, returnP)}
          onMouseLeave={this.leaveBlockToolTitle.bind(this)}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: this.state.returnPBorder ? '1px solid #DDDDDD' : 'unset',
              boxShadow: this.state.returnPBorder ? '0 1px 3px 0 rgba(0,0,0,0.20)' : 'unset',
              borderRadius: this.state.returnPBorder ? '2px' : '',
            }}
          >
            <p>{returnP}</p>
            <Icon type="down" />
          </div>
        </a>
        {this.showDropDown()}
        <div style={{ display: this.state.RoleDivIf === 'none' ? 'block' : 'none' }}>
          <div
            role="none"
            style={{
              position: 'relative',
              paddingLeft: '10px',
              display: this.state.showTitle,
              zIndex: 1000,
              background: '#F8F8F8',
              border: '1px solid #DCDCDC',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.10)',
              borderRadius: '2px',
            }}
            onClick={this.clickDiv.bind(this)}
          >
            {this.showToolTitle()}
          </div>
        </div>
      </div>
    );
  }
}

export default PoReRoleCas;
