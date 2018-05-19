import store from 'Store';
import { observable, action, computed } from 'mobx';
import axios from 'Axios';

@store('UserGroupStore')
class UserGroupStore {
  @observable group = [];
  @observable allUsers = [];
  @observable groupTotal;
  @observable userTotal;
  @observable chosenUser = [];
  @observable currentChosenUser = [];
  @observable userByPagination = [];

  @computed get getUserByPagination2() {
    return this.userByPagination;
  }

  @action setUserByPagination(data) {
    this.userByPagination = data;
  }

  @action changeUserByCheck(id) {
    for (let a = 0; a < this.userByPagination.length; a += 1) {
      if (parseInt(this.userByPagination[a].id, 10) === parseInt(id, 10)) {
        this.userByPagination[a].check = !this.userByPagination[a].check;
      }      
    }
  }

  @computed get getCurrentChosenUser() {
    return this.currentChosenUser;
  }

  @action setCurrentChosenUser(data) {
    this.currentChosenUser = data;
  }

  @action spliceCurrentChosenUser(id) {
    for (let a = 0; a < this.currentChosenUser.length; a += 1) {
      if (parseInt(this.currentChosenUser[a].id, 10) === parseInt(id, 10)) {
        this.currentChosenUser.splice(a, 1);
      }
    }
  }

  @action pushCurrentChosenUser(item) {
    this.currentChosenUser.push(item);
  }

  @computed get getChosenUser() {
    return this.chosenUser;
  }

  @action setChosenUser(data) {
    this.chosenUser = data;
  }

  @computed get getUserTotal() {
    return this.userTotal;
  }

  @action setUserTotal(data) {
    this.userTotal = data;
  }
  
  @computed get getGroupTotal() {
    return this.groupTotal;
  }

  @action setGroupTotal(data) {
    this.groupTotal = data;
  }

  @computed get getAllUsers() {
    return this.allUsers;
  }

  @action setAllUsers(data) {
    this.allUsers = data;
  }

  @action changeUserCheck(index) {
    this.allUsers[index].check = !this.allUsers[index].check;
  }

  getUsersByOrgId(id) {
    return axios.get(`/uaa/v1/organization/${id}/users/all`);
  }

  @computed get getGroup() {
    return this.group;
  }

  @action setGroup(data) {
    this.group = data;
  }
  getUserByPagination(orgId, page) {
    return axios.get(`/uaa/v1/organization/${orgId}/users?page=${page}&size=10`);
  }
  getWholeGroup(id, state, page) {
    if (state.code === '') {
      axios.get(`/uaa/v1/groups/${id}?param=${state.input}&page=${page - 1}&size=10`).then((data) => {
        this.setGroup(data.content);
        this.setGroupTotal(data.totalElements);
      });
    } else {
      axios.get(`/uaa/v1/groups/${id}?${state.code}=${state.input}&page=${page - 1}&size=10`).then((data) => {
        this.setGroup(data.content);
        this.setGroupTotal(data.totalElements);
      });
    }
  }
  CreateUserGroup(id, data) {
    return axios.post(`/uaa/v1/groups/${id}`, data);
  }
  CreateUserGroup1(id, data) {
    return axios.post(`/uaa/v1/groups/${id}`, data);
  }
  DeleteUserGroup(orgId, id) {
    return axios.delete(`/uaa/v1/groups/${orgId}/${id}`);
  }
  DeleteUserGroupUser(groupId, userId) {
    return axios.delete(`/uaa/v1/userGroups/groups/${groupId}/user/${userId}`);
  }
  UpdateUserGroup(orgId, id, data) {
    return axios.put(`/uaa/v1/groups/${orgId}/${id}`, data);
  }
  AddGroupUsers(groupId, Ids) {
    return axios.post(`/uaa/v1/userGroups/${groupId}`, Ids);
  }
}

const userGroupStore = new UserGroupStore();

export default userGroupStore;
