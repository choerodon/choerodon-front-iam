/*eslint-disable*/
import { observable, action, computed } from 'mobx';
import { message } from 'antd';
import axios from 'Axios';
import store from 'Store';
import { Observable } from 'rxjs';


@store('MenuTreeStore')
class MenuTreeStore2 {
  @observable wholeOrPr = {};
  @observable currentMenu = [];
  @observable gData = [];
  @observable configMenu = [];

  @action setgData(data) {
    this.gData = data;
  }

  @computed get getgData() {
    return this.gData;
  }

  @action setConfigMenu(data) {
    this.configMenu = data;
  }

  @computed get getConfigMenu() {
    return this.configMenu;
  }

  @action setCurrentMenu(data) {
    this.currentMenu = data;
  }

  @computed get getCurrentMenu() {
    return this.currentMenu;
  }

  @action changeData(info) {
    let dragNode = {};
    let node = {};
    if (info.dragNode.props.dataRef) {
      dragNode = info.dragNode.props.dataRef;
    } else {
      dragNode = {
        key: info.dragNode.props.eventKey,
        title: info.dragNode.props.title,
      };
    }
    if (info.node.props.dataRef) {
      node = info.node.props.dataRef;
    } else {
      node = {
        key: info.node.props.eventKey,
        title: info.node.props.title,
      };
    }
    const gData = this.getgData;
    let already = 0;
    for (let a = 0; a < gData.length; a += 1) {
      if (gData[a].key === node.key) {
        let already1 = 0;
        for (let d = 0; d < gData[a].children.length; d += 1) {
          if (gData[a].children[d].key === dragNode.key) {
            Choerodon.prompt('已存在该层级');
            already1 = 1;
          }
        }
        if (already1 === 0) {
          already = 1;
          for (let g = 0; g < gData.length; g += 1) {
            if (gData[g].key === dragNode.key) {
              gData.splice(g, 1);
            } else {
              for (let h = 0; h < gData[g].children.length; h += 1) {
                if (gData[g].children[h].key === dragNode.key) {
                  gData[g].children.splice(h, 1);
                } else {
                  for (let i = 0; i < gData[g].children[h].children.length; i += 1) {
                    if (gData[g].children[h].children[i].key === dragNode.key) {
                      gData[g].children[h].children.splice(i, 1);
                    } else {
                      for (let j = 0;
                        j < gData[g].children[h].children[i].children.length; j += 1) {
                        if (gData[g].children[h].children[i].children[j].key === dragNode.key) {
                          gData[g].children[h].children[i].children.splice(j, 1);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          gData[a].children.push(dragNode);
        }
      } else {
        for (let b = 0; b < gData[a].children.length; b += 1) {
          if (gData[a].children[b].key === node.key) {
            let already2 = 0;
            for (let e = 0; e < gData[a].children[b].children.length; e += 1) {
              if (gData[a].children[b].children[e].key === dragNode.key) {
                Choerodon.prompt('已存在该层级');
                already2 = 2;
              }
            }
            if (already2 === 0) {
              already = 1;
              for (let g = 0; g < gData.length; g += 1) {
                if (gData[g].key === dragNode.key) {
                  gData.splice(g, 1);
                } else {
                  for (let h = 0; h < gData[g].children.length; h += 1) {
                    if (gData[g].children[h].key === dragNode.key) {
                      gData[g].children.splice(h, 1);
                    } else {
                      for (let i = 0; i < gData[g].children[h].children.length; i += 1) {
                        if (gData[g].children[h].children[i].key === dragNode.key) {
                          gData[g].children[h].children.splice(i, 1);
                        } else {
                          for (let j = 0;
                            j < gData[g].children[h].children[i].children.length; j += 1) {
                            if (gData[g].children[h].children[i].children[j].key === dragNode.key) {
                              gData[g].children[h].children[i].children.splice(j, 1);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              gData[a].children[b].children.push(dragNode);
            }
            // already = 1;
          } else {
            for (let c = 0; c < gData[a].children[b].children.length; c += 1) {
              if (gData[a].children[b].children[c].key === node.key) {
                let already3 = 0;
                for (let f = 0; f < gData[a].children[b].children[c].children.length; f += 1) {
                  if (gData[a].children[b].children[c].children[f].key
                    === dragNode.key) {
                    Choerodon.prompt('已存在该层级');
                    already3 = 1;
                  }
                }
                if (already3 === 0) {
                  already = 1;
                  for (let g = 0; g < gData.length; g += 1) {
                    if (gData[g].key === dragNode.key) {
                      gData.splice(g, 1);
                    } else {
                      for (let h = 0; h < gData[g].children.length; h += 1) {
                        if (gData[g].children[h].key === dragNode.key) {
                          gData[g].children.splice(h, 1);
                        } else {
                          for (let i = 0; i < gData[g].children[h].children.length; i += 1) {
                            if (gData[g].children[h].children[i].key === dragNode.key) {
                              gData[g].children[h].children.splice(i, 1);
                            } else {
                              for (let j = 0;
                                j < gData[g].children[h].children[i].children.length; j += 1) {
                                if (gData[g].children[h].children[i].children[j].key ===
                                  dragNode.key) {
                                  gData[g].children[h].children[i].children.splice(j, 1);
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  gData[a].children[b].children[c].children.push(dragNode);
                }
                // already = 1;
              }
            }
          }
        }
      }
    }
    this.setgData(gData);
  }

  @action setWholeOrPr(data) {
    this.wholeOrPr = data;
  }

  @computed get getWholeOrPr() {
    return this.wholeOrPr;
  }
  changeCurrentToData(gData) {
    const newData = [];
    for (let a = 0; a < gData.length; a += 1) {
      newData.push({
        title: gData[a].name,
        key: `${gData[a].code}${gData[a].id}`,
        children: [],
      });
      if (gData[a].services) {
        for (let b = 0; b < gData[a].services.length; b += 1) {
          newData[newData.length - 1].children.push({
            title: gData[a].services[b].name,
            key: `${gData[a].services[b].code}${gData[a].services[b].id}`,
            children: [],
          });
          if (gData[a].services[b].menus) {
            for (let c = 0; c < gData[a].services[b].menus.length; c += 1) {
              newData[newData.length - 1]
                .children[newData[newData.length - 1]
                  .children.length - 1].children.push({
                  title: gData[a].services[b].menus[c].name,
                  key: `${gData[a].services[b].menus[c].code}${gData[a].services[b].menus[c].id}`,
                  children: [],
                });
            if (gData[a].services[b].menus[c].subMenus) {
              for (let d = 0; d < gData[a].services[b].menus[c].subMenus.length; d += 1) {
                newData[newData.length - 1]
                  .children[newData[newData.length - 1]
                    .children.length - 1].children[newData[newData.length - 1]
                      .children[newData[newData.length - 1]
                        .children.length - 1].children.length - 1].children.push({
                          title: gData[a].services[b].menus[c].subMenus[d].name,
                          key: `${gData[a].services[b].menus[c].subMenus[d].code}${gData[a].services[b].menus[c].subMenus[d].id}`,
                        });
                }
              }
            }
          }
        }
      }
    }
    this.setgData(newData);
  }
  // 获取所有组织和项目
  axiosGetWhole() {
    axios.get('/uaa/v1/menus/select').then((data) => {
      this.setWholeOrPr(data);
    }).catch((err) => {
      Choerodon.prompt(err);
    });
  }
  getOrganizationMenu() {
    axios.get('/uaa/v1/menus/organization?domain=true').then((data) => {
      this.changeCurrentToData(data);
    });
  }
  getAllMenu(type) {
    return Observable.fromPromise(axios.get(`/uaa/v1/menus?level=${type}&domain=true`))
  }
  getProjectMenu() {
    axios.get('/uaa/v1/menus/project').then((data) => {
      this.changeCurrentToData(data);
    });
  }
  getAllConfigMenu(type) {
    return Observable.fromPromise(axios.get(`/uaa/v1/menus/${type}/new?domain=true`))
    // axios.get(`/uaa/v1/menus/${type}/new`).then((data) => {
    //   this.setConfigMenu(data);
    // }).catch((error) => {
    //   message.error(error);
    // });
  }
  addGroup(data) {
    return Observable.fromPromise(axios.post('uaa/v1/menus',JSON.stringify(data)))
    // axios.get(`/uaa/v1/menus/${type}/new`).then((data) => {
    //   this.setConfigMenu(data);
    // }).catch((error) => {
    //   message.error(error);
    // });
  }

  getSettingConfigMenu(type, data) {
    return Observable.fromPromise(axios.post(`/uaa/v1/menus/config?level=${type}&domain=true`, JSON.stringify(data)))
    // axios.post(`/uaa/v1/menus/config?level=${type}`, JSON.stringify(data)).then((datas) => {
    //   this.setConfigMenu(datas);
    // }).catch((error) => {
    //   message.error(error);
    // });
  }

  // getProjectMenu(id) {
  //   axios.get(`/uaa/v1/menus/project/${id}`).then((data) => {
  //     this.setCurrentMenu(data);
  //   }).catch((error) => {
  //     message.error(error);
  //   });
  // }
  getGlobalMenu() {
    axios.get('/uaa/v1/menus/global?domain=true').then((data) => {
      this.changeCurrentToData(data);
    }).catch((error) => {
      Choerodon.prompt(error);
    });
  }
}
const MenuTreeStore = new MenuTreeStore2();
export default MenuTreeStore;
