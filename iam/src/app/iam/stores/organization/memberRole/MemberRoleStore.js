/*eslint-disable*/
/**
 * Created by Lty on 2017/6/25.
 */

import { observable, action, computed } from 'mobx';
import { message } from 'antd';
import axios from 'Axios';
import _ from 'lodash';
import store from 'Store';

@store('OrganizationMemberRoleStore')
class OrganizationMemberRoleStore {
  @observable roleData = [];
  @observable isLoading = true;
  @observable selectedRowKeys = [];
  @observable selectedRow = [];
  @observable userData = [];
  @observable userAllData = [];
  @observable isUser = true;
  @observable isShow = true;
  @observable roleKeys = [];
  @observable memberId = '';
  @observable addModelVisible = false;
  @observable selectRoleModalVisible = false
  ;
  @observable SelectButtonText = '未选择';
  @observable addModalRoleData = [];
  @observable removeMemberId = {};
  @observable memberRole = [];
  @observable open = false;
  @observable firstLi = [];
  @observable secondLi = [];
  @observable addChosenRoles = [];
  @observable roleSearch = [];
  @observable roleSearchTable = {};
  @observable totalElement;
  @observable spinRole = true;
  @observable originMemberRole = [];

  @computed get getOriginMemberRole() {
    return this.originMemberRole;
  }

  @action setOriginMemberRole(data) {
    for(let a = 0; a < data.length; a += 1) {
      for (let b = 0; b < data[a].roles.length; b += 1) {
        data[a].roles[b].check = true;
      }
    }
    this.originMemberRole = data;
  }

  @computed get getSpinRole() {
    return this.spinRole;
  }

  @action setSpinRole(data) {
    this.spinRole = data;
  }

  @computed get getTotalElement() {
    return this.totalElement;
  }

  @action setTotalElement(data) {
    this.totalElement = data;
  }

  @computed get getRoleSearchTable() {
    return this.roleSearchTable;
  }

  @action setRoleSearchTable(id, data, total) {
    this.setSpinRole(true);
    if (parseInt(total, 10) !== 0) {
      let oldData = Object.assign({}, this.roleSearchTable);
      oldData[id] = {
        dataSource: data,
        totalSouce: total,
      }
      this.roleSearchTable = oldData;
      this.setSpinRole(false);
    }
    this.setSpinRole(false);
  }

  axiosGetRoleSearchTable(orgId, id, page) {
    this.setSpinRole(true);
    axios.get(`/uaa/v1/organization/${orgId}/memberRoles?roleId=${id}&page=${page-1}&size=10`).then((data) => {
      this.setRoleSearchTable(id, data.content, data.totalElements);
    })
  }

  @computed get getRoleSearch() {
    return this.roleSearch;
  }

  @action setRoleSearch(data) {
    this.roleSearch = data;
  } 

  @computed get getAddChosenRoles() {
    return this.addChosenRoles.slice();
  }

  @action setAddChosenRoles(flag) {
    this.addChosenRoles = flag;
  }

  @computed get getSecondLi() {
    return this.secondLi.slice();
  }

  @action setSecondLi(flag) {
    this.secondLi = flag;
  }

  @computed get getFirstLi() {
    return this.firstLi.slice();
  }

  @action setFirstLi(flag) {
    this.firstLi = flag;
  }

  @computed get getUserAllData() {
    return this.userAllData;
  }

  @action setUserAllData(flag) {
    this.userAllData = flag;
  }

  @action setOpen(flag) {
    this.open = flag;
  }

  @computed get getOpen() {
    return this.open;
  }
  @action setMemberRole(data) {
    this.memberRole = data;
  }

  @computed get getMemberRole() {
    return this.memberRole.slice();
  }
  @action setIsUser(flag) {
    this.isUser = flag;
  }

  @computed get getIsUser() {
    return this.isUser;
  }
  @action setLoading(flag) {
    this.isLoading = flag;
  }

  @computed get getIsLoading() {
    return this.isLoading;
  }
  @action setShow(flag) {
    this.isShow = flag;
  }
  @computed get getIsShow() {
    return this.isShow;
  }
  @action setRoleData(content) {
    this.roleData = content;
  }

  @computed get getRoleData() {
    return this.roleData;
  }

  @action setuserData(content) {
    this.userData = content;
  }

  @computed get getuserData() {
    return this.userData.slice();
  }
  loadRoles(id) {
    axios.get(`/uaa/v1/roles/selectOrganizationRole/${id}/service`)
      .then((data) => {
        this.setRoleData(data);
        // 定义下拉列表可选择权限列表
      });
  }

  checkAddUserName(name) {
    return axios.get(`/uaa/v1/public/checkName?name=${name}`);
  }

  loadRolesByRoles(id, page, page2) {
    axios.get(`/uaa/v1/roles/selectOrganizationRole/${id}`)
      .then((data) => {
        this.setRoleSearch(data);
        if (JSON.stringify(page2) === '{}') {
          for (let a = 0; a < data.length; a += 1) {
            this.axiosGetRoleSearchTable(id, data[a].id, page);
          }
        }
      })
  }

  loadMemberRoles(organizationId, page, state) {
    this.setLoading(true);
    let url = '';
    if (!state) {
      url = `/uaa/v1/organization/${organizationId}/memberRoles?page=${page-1}&size=10`;
    } else if (state.code === '') {
      url = `/uaa/v1/organization/${organizationId}/memberRoles?page=${page-1}&size=10&param=${state.input}`;
    } else {
      url = `/uaa/v1/organization/${organizationId}/memberRoles?page=${page-1}&size=10&${state.code}=${state.input}`;
    }
    axios.get(url).then((data) => {
      if (data) {
        this.setShow(false);
      }
      this.setTotalElement(data.totalElements);
      this.setMemberRole(data.content);
      this.setOriginMemberRole(data.content);
    }).then(() => {
      this.setLoading(false);
    }).catch((err) => {
      window.console.log(err);
    })
  }

  loadUserData(organizationId) {
    axios.get(`/uaa/v1/organization/${organizationId}/users?page=0&size=999`)
      .then((data) => {
        if (data) {
          this.setuserData(data.content);
        }
      });
  }
  loadUserAllData(name) {
    return axios.get(`/uaa/v1/users/queryGlobal?name=${name}`);
  }
  // loadUserAllData(name) {
  //   axios.get(`/uaa/v1/users/queryGlobal?name=${name}`)
  //     .then(data => { 
  //        console.log(data);
  //       if (data) 
  //       { 
  //         this.setUserAllData(data);
  //       }});
  // }
  handleDelete(id, success, total, fn) {
    axios.delete(`/uaa/v1/memberRoles/${id}`)
      .then(() => {
        // console.log("handleDelete");
        success += 1;
        if (success === total) {
          fn;
          this.setOpen(false);
        }
      });
  }

  /**
   * 
   * 
   * @param {any} id 
   * @returns {AxiosPromise}
   * @memberof OrganizationMemberRoleStore
   */
  reHandleDelete(orId, id) {
    return Promise.resolve(axios.delete(`/uaa/v1/organization/${orId}/memberRoles/users/${id}`));
  }

  handleBatchDelete(id, success, total, fn) {
    axios.delete(`/uaa/v1/memberRoles/${id}`)
      .then(() => {
        success += 1;
        if (success === total) {
          fn;
        }
      });
  }
  handleRoleSave(id, role) {
    return axios.put(`/uaa/v1/organization/${id}/memberRoles`, JSON.stringify(role));
  }
  // handleRoleSave(role) {
  //   axios.put(`/uaa/v1/memberRoles/setMemberRole`, JSON.stringify(role))
  //     .then(res => {
  //       if (res.ok) {
  //         console.log("handleRoleSave");
  //         this.setShow(false);
  //       }
  //     });
  // }

  handleAddOk(id, data) {
    return axios.post(`/uaa/v1/organization/${id}/memberRoles`, JSON.stringify(data));
  }
  handleSearch(id, value, page) {
    this.setLoading(true);
    axios.get(`/uaa/v1/organization/${id}/memberRoles?page=${page-1}&size=10&name=${value}`).then((data) => {
      if (data) {
        this.setShow(false);
      }
      this.setTotalElement(data.totalElements);
      this.setMemberRole(data.content);
    }).then(() => {
      this.setLoading(false);
    }).catch((err) => {
      window.console.log(err);
    })
  }
}
const organizationMemberRoleStore = new OrganizationMemberRoleStore();

export default organizationMemberRoleStore;
