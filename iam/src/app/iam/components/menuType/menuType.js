/**
 * Created by jaywoods on 2017/6/24.
 */
import React, {Component} from 'react';
import {Icon, Dropdown, Tooltip} from 'antd';
import {observer, inject} from 'mobx-react';
import Icons from 'Icons';
import axios from 'Axios';
import menuPermissions from 'Permission';
import {withRouter} from 'react-router-dom';
import menuStore from '../../stores/globalStores/MenuStore';
import HeaderOrg from './headerOrg';

const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

@inject('AppState')
@observer
class MenuType extends Component {
  constructor(props) {
    super(props);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.state = {
      modalVisible: false,
      datas: [],
      visible: false,
    };
  }

  componentWillMount() {
    const {AppState} = this.props;
    axios.get('/uaa/v1/menus/select').then((res) => {
      const data = res.organizations;
      const projects = res.projects;
      data.map((item) => {
        const it = item;
        it.key = `organization${item.id}`;
        it.type = ORGANIZATION_TYPE;
        it.children = [];
        projects.map((project) => {
          const p = project;
          if (item.id === project.organizationId) {
            p.type = PROJECT_TYPE;
            p.key = `project${project.id}`;
            item.children.push(project);
          }
          return project;
        });
        return data;
      });
      this.setState({
        datas: data,
      });
      // 如果有组织
      if (data && data.length !== 0) {
        // 如果只有一个组织 并且只有一个项目
        if (data.length === 1 && data[0].children.length === 1) {
          const defaultOrganization1 = data[0].children[0];
          const menuType1 = {
            id: defaultOrganization1.id,
            type: ORGANIZATION_TYPE,
            name: defaultOrganization1.name,
          };
          const urlObject1 = AppState.getHashStringArgs(AppState.analysisUrl(location.href));
          if (urlObject1 !== null) {
            AppState.changeMenuType(urlObject1);
            sessionStorage.menuType = JSON.stringify(urlObject1);
            sessionStorage.type = urlObject1.type;
            if (AppState.getType !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${urlObject1.type}/new?domain=true`);
              sessionStorage.user = '';
              // menuStore.loadMenuData(`/uaa/v1/menus/${urlObject1.type}/${urlObject1.id}`);
            }
          } else if (sessionStorage.menuType === '' || sessionStorage.menuType === undefined) {
            AppState.changeMenuType(menuType1);
            sessionStorage.menuType = JSON.stringify(menuType1);
            sessionStorage.type = menuType1.type;
            if (AppState.getType !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${menuType1.type}/new?domain=true`);
              sessionStorage.user = '';
              // menuStore.loadMenuData(`
              // /uaa/v1/menus/${menuType1.type}/${defaultOrganization1.id}`);
            }
          } else {
            AppState.changeMenuType(JSON.parse(sessionStorage.menuType));
            if (sessionStorage.type !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${JSON.parse(sessionStorage.menuType).type}/new?domain=true`);
              sessionStorage.user = '';
              // menuStore.loadMenuData(`
              // uaa/v1/menus/${JSON.parse(
              // sessionStorage.headerMenuType).type}/
              // ${JSON.parse(sessionStorage.headerMenuType).id}`);
            }
          }
        } else {
          const defaultOrganization = data[0];
          const menuType = {
            id: defaultOrganization.id,
            type: ORGANIZATION_TYPE,
            name: defaultOrganization.name,
          };
          const urlObject = AppState.getHashStringArgs(AppState.analysisUrl(location.href));
          if (urlObject !== null) {
            AppState.changeMenuType(urlObject);
            sessionStorage.menuType = JSON.stringify(urlObject);
            sessionStorage.type = urlObject.type;
            if (AppState.getType !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${urlObject.type}/new?domain=true`);
              sessionStorage.user = '';
              // menuStore.loadMenuData(`/uaa/v1/menus/${urlObject.type}/${urlObject.id}`);
            }
          } else if (sessionStorage.menuType === '' || sessionStorage.menuType === undefined) {
            AppState.changeMenuType(menuType);
            sessionStorage.menuType = JSON.stringify(menuType);
            sessionStorage.type = menuType.type;
            if (AppState.getType !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${menuType.type}/new?domain=true`);
              sessionStorage.user = '';
              // menuStore.loadMenuData(`/uaa/v1/menus/
              // ${headerMenuType.type}/${defaultOrganization.id}`);
            }
          } else {
            AppState.changeMenuType(JSON.parse(sessionStorage.menuType));
            if (sessionStorage.type !== 'global') {
              menuStore.loadMenuData(`/uaa/v1/menus/${JSON.parse(sessionStorage.menuType).type}/new?domain=true`);
              sessionStorage.user = '';
              // menuStore.loadMenuData(`
              // /uaa/v1/menus/${
              // JSON.parse(
              // sessionStorage.headerMenuType).type}
              // /${JSON.parse(sessionStorage.headerMenuType).id}`);
            } else if (sessionStorage.user === 'user') {
              menuStore.loadMenuData('/uaa/v1/menus/user?domain=true');
              sessionStorage.user = 'user';
            } else {
              menuStore.loadMenuData('/uaa/v1/menus/global/new?domain=true');
            }
          }
        }
      } else if (projects && projects.length !== 0) {
        // 如果没有组织
        const defaultProject = projects[0];
        const menuType = {
          id: defaultProject.id,
          type: PROJECT_TYPE,
          organizationId: defaultProject.organizationId,
          name: defaultProject.name,
        };
        const urlObject = AppState.getHashStringArgs(AppState.analysisUrl(location.href));
        if (urlObject !== null) {
          AppState.changeMenuType(urlObject);
          sessionStorage.menuType = JSON.stringify(urlObject);
          sessionStorage.type = urlObject.type;
          if (AppState.getType !== 'global') {
            menuStore.loadMenuData('/uaa/v1/menus/project/new?domain=true');
            sessionStorage.user = '';
            // menuStore.loadMenuData(`/uaa/v1/menus/project/${urlObject.id}`);
          }
        } else if (sessionStorage.menuType === '' || sessionStorage.menuType === undefined) {
          AppState.changeMenuType(menuType);
          sessionStorage.menuType = JSON.stringify(menuType);
          sessionStorage.type = menuType.type;
          if (AppState.getType !== 'global') {
            menuStore.loadMenuData('/uaa/v1/menus/project/new?domain=true');
            sessionStorage.user = '';
            // menuStore.loadMenuData(`/uaa/v1/menus/project/${defaultProject.id}`);
          }
        } else {
          AppState.changeMenuType(JSON.parse(sessionStorage.menuType));
          if (sessionStorage.type !== 'global') {
            menuStore.loadMenuData('/uaa/v1/menus/project/new?domain=true');
            sessionStorage.user = '';
            // menuStore.loadMenuData(`
            // /uaa/v1/menus/project/${JSON.parse(sessionStorage.headerMenuType).id}`);
          }
        }
      }
    });
  }

  showModal = () => {
    // this.loadData();
    this.setState({
      modalVisible: true,
    });
  };

  // 加载有权限的组织和项目
  // loadData = () => {
  // axios.get('/uaa/v1/menus/select').then((res) => {
  //   const datas = res.organizations;
  //   const projects = res.projects;
  //   datas.map((item) => {
  //     const it = item;
  //     it.key = `organization${item.id}`;
  //     it.type = ORGANIZATION_TYPE;
  //     it.children = [];
  //     projects.map((project) => {
  //       const p = project;
  //       if (item.id === project.organizationId) {
  //         p.type = PROJECT_TYPE;
  //         p.key = `project${project.id}`;
  //         item.children.push(project);
  //       }
  //       return project;
  //     });
  //     return datas;
  //   });
  //   this.setState({
  //     data: datas,
  //   });
  // });
  // if (this.state.data.length === 1) {
  //   if (this.state.data[0].children.length === 1) {
  //     if (Choerodon.getConfig('headerOrganzation')) {
  //       this.setState({
  //         projectFlag: true,
  //         organizationFlag: false,
  //       });
  //     } else {
  //       this.setState({
  //         projectFlag: false,
  //         organizationFlag: false,
  //       });
  //     }
  //   }
  // } else {
  //   this.setState({
  //     organizationFlag: true,
  //   });
  // }
  // };

  handleRowClick = (row) => {
    Choerodon.permissonGet(menuPermissions);
    const {AppState, history} = this.props;
    history.push('/');
    let tmp = {
      id: row.id,
      type: row.type,
      name: row.name,
    };
    let url;

    if (row.type === ORGANIZATION_TYPE) {
      url = '/uaa/v1/menus/organization/new?domain=true';
    } else {
      url = '/uaa/v1/menus/project/new?domain=true';
      tmp = {...tmp, organizationId: row.organizationId};
    }
    // 更新菜单类型
    AppState.changeMenuType(tmp);
    sessionStorage.menuType = JSON.stringify(tmp);
    sessionStorage.type = tmp.type;
    this.setState({
      modalVisible: false,
    });
    // menuStore.changeMainVisible(true);
    menuStore.setMenuData([]);
    menuStore.loadMenuData(`${url}`);
    // menuStore.loadMenuData(`${url}/${row.id}`);
    // 跳转到首页
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false,
      data: [],
    });
  };

  handleVisibleChange = (flag) => {
    this.setState({
      visible: flag,
    });
  }


  render() {
    const {AppState, organizationFlag, projectFlag} = this.props;
    const menuType = AppState.currentMenuType;
    if (menuType) {
      Choerodon.permissonGet(menuPermissions);
    }
    const name = menuType ? menuType.name : Choerodon.getMessage('选择', 'choose');
    const type = menuType ? menuType.type : 'select';
    const menu = (
      <HeaderOrg data={this.state.datas} name={name}/>
    );
    let content;
    if (organizationFlag) {
      content = (<span>
        <Dropdown
          overlay={menu}
          onVisibleChange={this.handleVisibleChange}
          visible={this.state.visible}
        >
          <a
            role="none"
            style={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {
              name.length > 6 ? (
                <Tooltip placement="right" title={name}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{marginRight: 2}}>{name.substring(0, 6)}...</span><Icon style={{color: 'white'}}
                                                                                         type={this.state.visible ? 'caret-up' : 'caret-down'}/>
                  </span>
                </Tooltip>
              ) : (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{marginRight: 2}}>{name}</span><Icon style={{color: 'white'}}
                                                                    type={this.state.visible ? 'caret-up' : 'caret-down'}/>
                </span>
              )
            }
          </a>
        </Dropdown>
      </span>);
    } else if (organizationFlag === false && projectFlag) {
      content = (
        <span>
          <a role="none" style={{color: 'white', textDecoration: 'none', cursor: 'default'}}>
            <Icon type={Icons[type]}/>
            <span style={{marginRight: 2}}>{name}</span>
          </a>
        </span>
      );
    }
    return (
      <span>
        {content}
      </span>
    );
  }
}

export default withRouter(MenuType);
