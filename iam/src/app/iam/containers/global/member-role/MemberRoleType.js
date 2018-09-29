import { axios } from 'choerodon-front-boot';
import querystring from 'query-string';

export const pageSize = 10;

/**
 * 公用方法类
 * 当要改写 src/app/iam/containers/global/member-role/MemberRoleType.js中的内容时可以逐步把用到的东西移到store里
 */
export default class MemberRoleType {
  constructor(context) {
    this.context = context;
    const { AppState } = this.context.props;
    this.data = AppState.currentMenuType;
    const { type, id, name } = this.data;
    let apiGetway = `/iam/v1/${type}s/${id}`;
    let codePrefix;
    switch (type) {
      case 'organization':
        codePrefix = 'organization';
        break;
      case 'project':
        codePrefix = 'project';
        break;
      case 'site':
        codePrefix = 'global';
        apiGetway = `/iam/v1/${type}`;
        break;
      default:
        break;
    }
    this.code = `${codePrefix}.memberrole`;
    this.values = { name: name || 'Choerodon' };
    this.urlUsers = `${apiGetway}/role_members/users`;
    this.urlRoles = `${apiGetway}/role_members/users/roles`;
    this.urlRoleMember = `${apiGetway}/role_members`;
    this.urlDeleteMember = `${apiGetway}/role_members/delete`;
    this.urlUserCount = `${apiGetway}/role_members/users/count`;
    this.roleId = id || 0;
  }

  // fetch分配角色（post）
  fetchRoleMember(memberIds, body, isEdit) {
    let str = `member_ids=${memberIds.join(',')}`;
    if (isEdit === true) {
      str += '&is_edit=true';
    }
    return axios.post(`${this.urlRoleMember}?${str}`, JSON.stringify(body));
  }

  // delete分配角色（delete)
  deleteRoleMember(body) {
    const { id } = this.data;
    body.sourceId = id || 0;
    return axios.post(this.urlDeleteMember, JSON.stringify(body));
  }

  // 根据用户名查询memberId
  searchMemberId(loginName) {
    if (loginName) {
      return axios.get(`/iam/v1/users?login_name=${loginName}`);
    }
  }

  searchMemberIds(loginNames) {
    const promises = loginNames.map((index, value) => this.searchMemberId(index));
    return axios.all(promises);
  }

  loadRoleMemberData(roleData, { current }, { loginName, realName }, params) {
    const { id: roleId, users, name } = roleData;
    const body = {
      loginName: loginName && loginName[0],
      realName: realName && realName[0],
      param: params,
    };
    const queryObj = { role_id: roleId, size: pageSize, page: current - 1 };
    roleData.loading = true;
    return axios.post(`${this.urlUsers}?${querystring.stringify(queryObj)}`,
      JSON.stringify(body))
      .then(({ content }) => {
        roleData.users = users.concat(content.map((member) => {
          member.roleId = roleId;
          member.roleName = name;
          return member;
        }));
        delete roleData.loading;
        this.context.forceUpdate();
      });
  }

  loadMemberDatas({ pageSize: size, current }, { loginName, realName, roles }, params) {
    const body = {
      loginName: loginName && loginName[0],
      roleName: roles && roles[0],
      realName: realName && realName[0],
      param: params,
    };
    const queryObj = { size, page: current - 1, sort: 'id' };
    return axios.post(`${this.urlRoles}?${querystring.stringify(queryObj)}`, JSON.stringify(body));
  }

  loadRoleMemberDatas({ loginName, realName, name }) {
    const body = {
      roleName: name && name[0],
      loginName: loginName && loginName[0],
      realName: realName && realName[0],
    };
    return axios.post(this.urlUserCount, JSON.stringify(body));
  }

  // 多路请求
  fetch() {
    const { memberRolePageInfo, memberRoleFilters, roleMemberFilters, expandedKeys, params, roleMemberParams } = this.context.state;
    this.context.setState({
      loading: true,
    });
    return axios.all([
      this.loadMemberDatas(memberRolePageInfo, memberRoleFilters, params),
      this.loadRoleMemberDatas(roleMemberFilters),
    ]).then(([{ content, totalElements, number }, roleData]) => {
      this.context.setState({
        memberDatas: content,
        expandedKeys,
        roleMemberDatas: roleData.filter((role) => {
          role.users = role.users || [];
          if (role.userCount > 0) {
            if (expandedKeys.find(expandedKey => expandedKey.split('-')[1] === String(role.id))) {
              this.loadRoleMemberData(role, {
                current: 1,
                pageSize,
              }, roleMemberFilters, roleMemberParams);
            }
            return true;
          }
          return false;
        }),
        roleData,
        loading: false,
        memberRolePageInfo: {
          total: totalElements,
          current: number + 1,
          pageSize,
        },
      });
    });
  }
}
