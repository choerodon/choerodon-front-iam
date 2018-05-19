import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, Checkbox, message, Spin } from 'antd';
import { withRouter } from 'react-router-dom';
import RePagination from 'RePagination';
import ClientSearch from 'ClientSearch';
import _ from 'lodash';
import PageHeader, { PageHeadStyle, UnderPageHeadStyle } from 'PageHeader';
import './AddUser.scss';
import LoadingBar from '../../../../components/loadingBar';

@inject('AppState')
@observer
class CreateUserGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.match.params.id,
      page: 1,
      size: 10,
      selectedRowKeys: [],
      already: [],
      spinning: true,
      state: {
        code: '',
        input: '',
      },
      totalPage: '',
    };
  }
  componentWillMount() {
    const { UserGroupStore, AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    const currentUser = UserGroupStore.getGroup;
    for (let a = 0; a < currentUser.length; a += 1) {
      if (parseInt(currentUser[a].id, 10) === parseInt(this.state.id, 10)) {
        UserGroupStore.setCurrentChosenUser(currentUser[a].users);
        UserGroupStore.getUserByPagination(orgId, 0).then((data) => {
          this.setState({
            totalPage: data.totalElements,
            spinning: false,
          });
          const user = data.content;
          for (let b = 0; b < user.length; b += 1) {
            let flag = 0;
            for (let c = 0; c < currentUser[a].users.length; c += 1) {
              if (parseInt(currentUser[a].users[c].id, 10) === parseInt(user[b].id, 10)) {
                flag = 1;
                user[b].check = true;
              }
            }
            if (flag === 0) {
              user[b].check = false;
            }
          }
          UserGroupStore.setUserByPagination(user);
        }).catch((error) => {
          Choerodon.prompt(`获取用户列表失败 ${error}`);
        });
      }
    }
  }
  componentWillUnmount() {
    const { UserGroupStore } = this.props;
    UserGroupStore.setUserByPagination([]);
    UserGroupStore.setCurrentChosenUser([]);
  }
  onChangePagination = (value) => {
    const { UserGroupStore, AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    this.setState({
      page: value,
    });
    UserGroupStore.getUserByPagination(orgId, value - 1).then((data) => {
      this.setState({
        totalPage: data.totalElements,
        spinning: false,
      });
      const currentUser = UserGroupStore.getCurrentChosenUser;
      const user = data.content;
      for (let b = 0; b < user.length; b += 1) {
        let flag = 0;
        for (let c = 0; c < currentUser.length; c += 1) {
          if (parseInt(currentUser[c].id, 10) === parseInt(user[b].id, 10)) {
            flag = 1;
            user[b].check = true;
          }
        }
        if (flag === 0) {
          user[b].check = false;
        }
      }
      UserGroupStore.setUserByPagination(user);
    }).catch((error) => {
      Choerodon.prompt(`获取用户列表失败 ${error}`);
    });
  }
  linkToChange = (url) => {
    const { AppState, history } = this.props;
    const type = sessionStorage.type;
    const id = AppState.currentMenuType.id;
    const name = AppState.currentMenuType.name;
    if (type === 'global') {
      history.push(`${url}`);
    } else if (type === 'organization') {
      history.push(`${url}?type=${type}&id=${id}&name=${name}`);
    } else {
      const organizationId = AppState.currentMenuType.organizationId;
      history.push(`${url}?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`);
    }
  }
  handleAdd = () => {
    this.setState({
      spinning: true,
    });
    const { UserGroupStore } = this.props;
    const chosenUser = UserGroupStore.getCurrentChosenUser;
    const chosen = [];
    for (let a = 0; a < chosenUser.length; a += 1) {
      chosen.push(chosenUser[a].id);
    }
    UserGroupStore.AddGroupUsers(this.state.id, chosen).then(() => {
      Choerodon.prompt('添加成功');
      this.linkToChange('/iam/userGroup');
      this.setState({
        spinning: false,
      });
    }).catch((error) => {
      this.setState({
        spinning: false,
      });
      Choerodon.prompt(`添加失败${error}`);
    });
  }
  handleChangeCheck = (item) => {
    const { UserGroupStore } = this.props;
    const chosenUser = UserGroupStore.getCurrentChosenUser;
    if (item.check) {
      // 删除已选中的用户
      UserGroupStore.spliceCurrentChosenUser(item.id);
    } else {
      // 增加已选中的用户
      UserGroupStore.pushCurrentChosenUser(item);
    }
    // 改变用户的选中状态
    UserGroupStore.changeUserByCheck(item.id);
  }
  handleSearch = (state2) => {
    this.setState({
      state: state2,
    });
  }
  render() {
    const that = this;
    const { UserGroupStore } = this.props;
    let data = [];
    let data2 = [];
    if (UserGroupStore.getAllUsers.length > 0) {
      data2 = UserGroupStore.getAllUsers
        .filter((item) => {
          if (_.isNull(item[that.state.state.code])) {
            return true;
          } else if (that.state.state.code !== '') {
            return item[that.state.state.code].indexOf(that.state.state.input) !== -1;
          } else {
            return true;
          }
        });
      data = data2.slice((that.state.page - 1) * 10, that.state.page * 10);
    }
    return (
      this.state.spinning ? <LoadingBar /> : <div>
        <PageHeader title="添加用户组用户" backPath="/iam/userGroup">
          <Button
            className="header-btn headLeftBtn"
            ghost
            style={PageHeadStyle.leftBtn}
          >
            <span className="icon-autorenew" />
            {Choerodon.getMessage('刷新', 'flush')}
          </Button>
          <Button
            className="header-btn headRightBtn"
            ghost
            style={PageHeadStyle.leftBtn2}
            onClick={this.handleAdd}
          >
            <span className="icon-playlist_add" />
            <span className="icon-space">{Choerodon.getMessage('添加', 'create')}</span>
          </Button>
        </PageHeader>
        {
          <div style={UnderPageHeadStyle}>
            <ClientSearch
              options={[{
                name: '名称',
                code: 'name',
              }, {
                name: '认证来源',
                code: 'source',
              }, {
                name: '语言',
                code: 'languageName',
              }, {
                name: '状态',
                code: 'status',
              }, {
                name: '是否锁住',
                code: 'locked',
              }]}
              onSearch={this.handleSearch.bind(this)}
            />
            <div className="header-wrapper">
              <div className="header-title" />
              <div className="header-text">
                <p>名称</p>
              </div>
              <div className="header-text">
                <p>认证来源</p>
              </div>
              <div className="header-text">
                <p>语言</p>
              </div>
              <div className="header-text">
                <p>状态</p>
              </div>
              <div className="header-title">
                <p>是否锁住</p>
              </div>
            </div>
            {
              UserGroupStore.getUserByPagination2.map(item => (
                <div
                  className="userItem header-wrapper"
                  key={item.id}
                >
                  <div className="header-title">
                    <Checkbox
                      onChange={this.handleChangeCheck.bind(this, item)}
                      defaultChecked={item.check}
                    />
                  </div>
                  <div className="header-text">
                    <p>{item.name}</p>
                  </div>
                  <div className="header-text">
                    <p>{item.source === 'Y' ? 'LDAP用户' : '非LDAP用户'}</p>
                  </div>
                  <div className="header-text">
                    <p>{item.languageName}</p>
                  </div>
                  <div className="header-text">
                    <p>{item.status === 'Y' ? '启用' : '未启用'}</p>
                  </div>
                  <div className="header-title">
                    <p>{item.locked === 'Y' ? '锁住' : '未锁住'}</p>
                  </div>
                </div>
              ))
            }
            <div className="pagenation">
              <RePagination
                current={this.state.page}
                total={this.state.totalPage}
                onChange={this.onChangePagination.bind(this)}
              />
            </div>
          </div>
        }
      </div>
    );
  }
}
export default withRouter(CreateUserGroup);
