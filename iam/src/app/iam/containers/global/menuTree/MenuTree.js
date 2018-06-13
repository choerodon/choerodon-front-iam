/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Table, Input, Button, Icon, Select, Form, Modal, Tabs, Popover, Row, Col, Popconfirm } from 'choerodon-ui';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { withRouter } from 'react-router-dom';
import PageHeader, { PageHeadStyle, UnderPageHeadStyle } from 'PageHeader';
import Page, { Header, Content } from 'Page';
import _ from 'lodash';
import axios from 'Axios';
import cx from 'classnames';
import Permission from 'PerComponent';
import MenuStore from '@/stores/MenuStore';
import InputIcon from './InputIcon';
import './menuTree.scss';
const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const inputWidth = 512;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};

@inject('AppState')
@observer
class MenuTree extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      active: null,
      menuData: [],
      dirAllData: [],
      selectIcon: null,
      type: 'site',
      selectType: 'create',
      sidebar: false,
      selectMenuDetail: null,
      dragtStart: null,
      dragEnd: null,
      iconActive: false,
    };
  }

  componentWillMount() {
    this.initMenu(this.state.type);
    this.initAllMenu();
  }

  //初始化类型
  initMenu = (type) => {
    axios.get(`/iam/v1/menus/tree?level=${type}`)
      .then(value => {
        this.setState({
          menuData: value,
        })
      });
  }
  //初始化所有菜单
  initAllMenu = () => {
    axios.get(`/iam/v1/menus?with_permissions=true`)
      .then(value => {
        this.setState({
          dirAllData: value,
        })
      });
  }
  //选择菜单类型
  selectMenuType = (key) => {
    this.initMenu(key);
    this.setState({
      type: key,
    })
  }
  //关闭sidebar
  closeSidebar = () => {
    this.setState({
      sidebar: false,
      iconActive: false,
    });
  }
  //创建目录，弹出sidebar
  addDir = () => {
    const { resetFields } = this.props.form;
    resetFields();
    this.setState({
      selectType: 'create',
      sidebar: true,
      selectIcon: null,
    });
  }
  //查看细节，弹出sidebar,设置选中的菜单或目录
  detailMenu = (record) => {
    this.setState({
      selectType: 'detail',
      sidebar: true,
      selectMenuDetail: record
    });
  };
  //修改菜单,弹出sidebar,设置选中的菜单或目录
  changeMenu = (record) => {
    const { resetFields } = this.props.form;
    resetFields();
    this.setState({
      selectType: 'edit',
      sidebar: true,
      selectMenuDetail: record,
      selectIcon: record.icon
    });
  }
  //删除菜单
  deleteMenu = (record) => {
    const centerMenu = this.state.menuData;
    this.checkoutTreeId(centerMenu, record.id);
    this.setState({
      menuData: centerMenu,
    })
    Choerodon.prompt(Choerodon.getMessage('删除成功', 'Success'))
    // this.hideModal();
  }
  //创建添加的状态请求
  handleOk = () => {
    const { getFieldValue } = this.props.form;
    let centerMenu;
    switch (this.state.selectType) {
      case "create":
        const menuBody = {
          "code": getFieldValue('code'),
          "default": false,
          "icon": this.state.selectIcon,
          "level": this.state.type,
          "name": getFieldValue('name'),
          "type": "dir",
          "parentId": 0,
          "subMenus": null,
        }
        centerMenu = this.state.menuData;
        centerMenu.push(menuBody);
        this.setState({
          menuData: centerMenu,
        })
        Choerodon.prompt('创建目录成功');
        break;
      case "edit":
        this.checkoutTreeIdObj(getFieldValue, this.state.menuData, this.state.selectMenuDetail.code);
        this.setState({
          menuData: this.state.menuData,
        });
        break;
    }
    this.setState({
      sidebar: false,
      iconActive: false,
    });
  }
  // 创建目录的3个状态
  getSidebarTitle = () => {
    switch (this.state.selectType) {
      case "create":
        return "创建目录";
      case "edit":
        return "修改目录"
      case "detail":
        return "查看详情"
    }
  }

  //目录第一位为0，根目录第一位为1，菜单第一位为2;
  //内置第二位为1;
  judgeType = (record) => {
    switch (record.type) {
      case "dir":
        if (record.default) {
          return "01";
        } else {
          return "00";
        }
      case "root":
        if (record.default) {
          return "11";
        } else {
          return "10";
        }
      case "menu":
        return "21";
    }
  }
  //创建3个状态的sidebar渲染
  getSidebarContent() {
    const { selectType } = this.state;
    let formDom, pageFirstLineTitle, FirstLineContent;
    switch (selectType) {
      case "create":
        pageFirstLineTitle = `在平台”${process.env.HEADER_TITLE_NAME || 'Choerodon'}“中创建目录`;
        FirstLineContent = '请在下面输入目录名称、编码，选择目录图标创建目录。您创建的目录为自设目录，自设目录可以修改、删除。而平台内置的目录为预置目录，您不能创建、修改、删除预置目录。';
        formDom = this.getDirNameDom();
        break;
      case "edit":
        pageFirstLineTitle = `对目录“${this.state.selectMenuDetail.name}”进行修改`;
        FirstLineContent = '您可以在此修改目录名称、图标。';
        formDom = this.setDirNameDom();
        break;
      case "detail":
        pageFirstLineTitle = `查看菜单“${this.state.selectMenuDetail.name}”详情`;
        FirstLineContent = '您可以在此查看菜单的名称、编码、层级、所属预置目录、权限。菜单是平台内置的，您不能创建、修改、删除菜单。';
        formDom = this.getDetailDom();
        break;
    }
    return (
      <div onClick={this.toggleIcon.bind(this)}>
        <Content
          style={{ padding: 0 }}
          title={pageFirstLineTitle}
          description={(<div>
            {FirstLineContent}
            <a href="http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/platform/menu_configuration/">
              了解详情
            <span className="icon-open_in_new" />
            </a>
          </div>)}>
          {formDom}
        </Content>
      </div>);
  }
  //修改目录详情
  setDirNameDom() {
    const { getFieldDecorator } = this.props.form;
    const { selectType } = this.state;
    return (
      <Form layout="vertical" >
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('setName', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('请输入目录名称', 'This field is required.'),
            }],
            initialValue: this.state.selectMenuDetail.name,
          })(
            <Input
              size="default"
              placeholder={Choerodon.getMessage('目录名称', 'Dir Name')}
              label="目录名称"
              maxLength={30}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('setCode', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('请输入目录编码', 'This field is required.'),
            }],
            initialValue: this.state.selectMenuDetail.code,
          })(
            <Input
              label="目录编码"
              maxLength={30}
              disabled={true}
              placeholder={Choerodon.getMessage('目录编码', 'Dir Code')}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={"添加Icon"}
        >
          {getFieldDecorator('setIcon', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('Icon必填', 'icon is required'),
            }],
            validateTrigger: 'onBlur',
          })(
            <InputIcon IconTrasitation={this.transitation.bind(this)} IconTrasitationActive={this.transitationActive.bind(this)} icon={this.state.selectIcon} iconActive={this.state.iconActive} />
          )}
        </FormItem>
      </ Form>)
  };
  //查看详情
  getDetailDom() {
    const { getFieldDecorator } = this.props.form;
    const { selectType } = this.state;
    const selectPermissions = _.chunk(_.filter(this.state.dirAllData, (value) => {
      return value.id === this.state.selectMenuDetail.id;
    })[0].permissions, 2);
    const selectParentMenu = _.filter(this.state.dirAllData, (value) => {
      return value.id === this.state.selectMenuDetail.parentId;
    });
    return (
      <div>
        <Form layout="vertical" >
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('menuName', {
              rules: [{
                required: true,
                whitespace: true,
                message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              }],
              initialValue: this.state.selectMenuDetail.name,
            })(
              <Input
                size="default"
                placeholder={Choerodon.getMessage('菜单名称', 'Menu Name')}
                label="菜单名称"
                maxLength={30}
                disabled={true}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('menuCode', {
              rules: [{
                required: true,
                whitespace: true,
                message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              }],
              initialValue: this.state.selectMenuDetail.code,
            })(
              <Input
                size="default"
                placeholder={Choerodon.getMessage('菜单编码', 'Menu code')}
                label="菜单编码"
                maxLength={30}
                disabled={true}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('menuLevel', {
              rules: [{
                required: true,
                whitespace: true,
                message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              }],
              initialValue: this.state.selectMenuDetail.level,
            })(
              <Input
                label="菜单层级"
                maxLength={30}
                disabled={true}
                placeholder={Choerodon.getMessage('菜单层级', 'Menu Level')}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('menuParent', {
              rules: [{
                required: true,
                whitespace: true,
                message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              }],
              initialValue: selectParentMenu[0].name,
            })(
              <Input
                label="所属根目录"
                maxLength={30}
                disabled={true}
                placeholder={Choerodon.getMessage('所属根目录', 'Menu Root')}
                style={{ width: inputWidth }}
              />,
            )}
          </FormItem>
        </ Form>
        <div style={{ width: 512 }}>
          <p style={{ color: "rgba(0, 0, 0, 0.54)", fontSize: 10 }} >菜单所具有权限:</p>
          {selectPermissions && selectPermissions.length > 0 ? selectPermissions.map(value => {
            return (
              <Row>
                {value.map(permissionValue => {
                  return (<Col span={24} style={{ marginTop: 12 }}> <span className={'permissionListTitle'}>{permissionValue.code}</span></Col>)
                })}
              </Row>
            )
          }) : '此菜单无对应权限'}
        </div>
      </div>
    )
  }
  //created FormDom渲染
  getDirNameDom() {
    const { getFieldDecorator } = this.props.form;
    const { selectType } = this.state;
    return (
      <Form layout="vertical" >
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('请输入目录名称', 'This field is required.'),
            }],
            validateTrigger: 'onBlur',
          })(
            <Input
              size="default"
              placeholder={Choerodon.getMessage('目录名称', 'Dir Name')}
              label="目录名称"
              maxLength={30}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('code', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('请输入目录编码', 'This field is required.'),
            }],
            validateTrigger: 'onBlur',
          })(
            <Input
              label="目录编码"
              maxLength={30}
              placeholder={Choerodon.getMessage('目录编码', 'Dir Code')}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={"添加Icon"}
        >
          {getFieldDecorator('icon', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('Icon必填', 'icon is required'),
            }],
            // validateTrigger: 'onBlur',
          })(
            <InputIcon IconTrasitation={this.transitation.bind(this)} IconTrasitationActive={this.transitationActive.bind(this)} icon={this.state.selectIcon} iconActive={this.state.iconActive} />
          )}
        </FormItem>
      </ Form>)
  }
  //展示icon列表
  showIcon = (value) => {
    this.setState({
      iconActive: true,
    });
  }
  //关闭icon列表
  closeIcon = (value) => {
    this.setState({
      iconActive: false,
    });
  }
  //父级传递selectIcon
  transitation = (value) => {
    this.setState({
      selectIcon: value,
    });
  }
  //父级传递iconActive
  transitationActive = (value) => {
    this.setState({
      iconActive: value,
    });
  }

  toggleIcon = () => {
    if (this.state.iconActive == true) {
      this.setState({
        iconActive: false,
      });
    }
  }
  //table展开行
  getRowKey = (record) => {
    return `${record.parentId} - ${record.id}`;
  }
  //拖拽最终目标
  dragEnter = (record, text) => {
    this.setState({
      dragEnd: text,
    })
  }
  //拖拽开始
  dragtStart = (record, text) => {
    this.setState({
      dragtStart: text,
    })
  }
  //移动释放排序
  dropDrag = (start, end) => {
    const centerName = this.state.menuData;
    if (start && end) {
      if (start.type == 'root') {
        return null;
      } else if (start.code !== end.code) {
        this.checkoutTreeId(centerName, start.id);
        if (end.type === 'root' || end.type === 'dir') {
          this.checkoutTreeSubmenus(centerName, end.id, start);
        } else if (end.type === 'menu') {
          this.checkoutTreeContentId(centerName, end.id, start);
        }
        this.setState({
          menuData: centerName,
        })
      }
    }
  }

  //查找id删除obj
  checkoutTreeId = (data, id) => {
    let index = _.findIndex(data, (value) => {
      return value.id == id
    });
    if (index >= 0) {
      _.remove(data, (value) => {
        return value.id == id
      });
    } else {
      data.map(value => {
        if (value.subMenus && !_.isNull(value.subMenus)) {
          this.checkoutTreeId(value.subMenus, id);
        }
      })
    }
  }
  //根据id查找对象
  checkoutTreeIdObj = (getFieldValue, data, code) => {
    let index = _.findIndex(data, (value) => {
      return value.code == code
    });
    if (index >= 0) {
      data[index].name = getFieldValue('setName');
      data[index].icon = this.state.selectIcon;
    } else {
      data.map(value => {
        if (value.subMenus && !_.isNull(value.subMenus)) {
          this.checkoutTreeId(value.subMenus, code);
        }
      })
    }
  }
  //查找id插入到submenus
  checkoutTreeSubmenus = (data, id, conectData) => {
    let index = _.findIndex(data, (value) => {
      return value.id == id
    });
    if (index >= 0) {
      if (_.isNull(data[index].subMenus)) {
        data[index].subMenus = [conectData];
        conectData.parentId = data[index].id;
      } else {
        data[index].subMenus.push(conectData);
        conectData.parentId = data[index].id;
      }
    } else {
      data.map(value => {
        if (value.subMenus && !_.isNull(value.subMenus)) {
          this.checkoutTreeSubmenus(value.subMenus, id, conectData);
        }
      })
    }
  }
  //查找id同类型拼接obj
  checkoutTreeContentId = (data, id, conectData) => {
    let index = _.findIndex(data, (value) => {
      return value.id == id
    });
    if (index >= 0) {
      data.splice(index, 0, conectData);
    } else {
      data.map(value => {
        if (value.subMenus && !_.isNull(value.subMenus)) {
          this.checkoutTreeContentId(value.subMenus, id, conectData);
        }
      })
    }
  }

  onDragover = (event) => {
    event.preventDefault();
  }
  //储存菜单
  saveMenu = (data) => {
    const { AppState, history } = this.props;
    this.adjustSort(data)
    axios.post(`/iam/v1/menus/tree?level=${this.state.type}`, JSON.stringify(data))
      .then(value => {
        if (value.message) {
          Choerodon.prompt(value.message);
        } else {
          MenuStore.loadMenuData(this.state.type).then(menus => {
            MenuStore.setMenuData(menus)
          });
          Choerodon.prompt('保存成功');
          this.initMenu(this.state.type);
        }
      })
  }
  //菜单排序
  adjustSort = (data) => {
    data.map((value, key) => {
      value.sort = key;
      if (value.subMenus && !_.isNull(value.subMenus)) {
        this.adjustSort(value.subMenus);
      }
    });
  }
  //判断子菜单的menu的dir flag为true即为可删除
  judgeDir = (data, flag) => {
    const centerData = data;
    if (centerData.subMenus && centerData.subMenus.length == 0) {
      if (centerData.type == "menu" || centerData.type == "root") {
        flag.push(false);
      } else {
        flag.push(true);
      }
    } else if (centerData.subMenus && centerData.subMenus.length > 0) {
      const flagFilter = _.filter(centerData.subMenus, (value) => {
        return value.type == "menu" || value.type == "root"
      });
      if (flagFilter && flagFilter.length > 0) {
        flag.push(false);
      } else {
        centerData.subMenus.map(value => {
          if (value.type == "menu" || value.type == "root") {
            flag.push(false);
          } else {
            if (value.subMenus && value.subMenus.length > 0) {
              this.judgeDir(value, flag);
            } else {
              flag.push(true);
            }
          }
        })
      }
    } else {
      if (centerData.type == "menu" || centerData.type == "root") {
        flag.push(false);
      } else {
        flag.push(true);
      }
    }
  }

  render() {
    const { AppState } = this.props;
    const okText = this.state.selectType === 'create' ? '添加' : '确定';
    const columns = [{
      title: '目录 / 菜单',
      dataIndex: 'name',
      key: 'name',
      render: (record, text) => {
        // 2:菜单 0：自设目录 1: 预制目录
        if (this.judgeType(text)[0] == '2') {
          return (<span
            draggable={true}
            onDragEnter={this.dragEnter.bind(this, record, text)}
            onDragStart={this.dragtStart.bind(this, record, text)}
            onDragOver={this.onDragover.bind(this)}
            onDrop={this.dropDrag.bind(this, this.state.dragtStart, this.state.dragEnd)}
            className='iconTitleFont'
          > <span className='icon-dehaze iconDirFont' /> {record}</span>)
        } else if (this.judgeType(text)[1] == '0') {
          return (<span
            draggable={true}
            onDragEnter={this.dragEnter.bind(this, record, text)}
            onDragStart={this.dragtStart.bind(this, record, text)}
            onDragOver={this.onDragover.bind(this)}
            onDrop={this.dropDrag.bind(this, this.state.dragtStart, this.state.dragEnd)}
            className='iconTitleFont'
          > <span className='icon-custom_Directory iconDirFont' /> {record}</span>);
        } else {
          return (<span
            draggable={true}
            onDragEnter={this.dragEnter.bind(this, record, text)}
            onDragStart={this.dragtStart.bind(this, record, text)}
            onDragOver={this.onDragover.bind(this)}
            onDrop={this.dropDrag.bind(this, this.state.dragtStart, this.state.dragEnd)}
            className='iconTitleFont'
          > <span className='icon-folder iconDirFont' /> {record}</span>)
        }
      }
    }, {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      render: (record, text) => {
        return <span className={`icon-${record}`} style={{ fontSize: 18 }} />;
      }
    }, {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      render: (record, text) => {
        return <span style={{ cursor: "default" }}>{record}</span>;
      }
    }, {
      title: '所属预设目录',
      dataIndex: 'type',
      key: 'type',
      render: (record, text) => {
        const selectParentMenu = _.filter(this.state.dirAllData, (value) => {
          return value.id === text.parentId;
        });
        if (selectParentMenu.length > 0) {
          return (<span style={{ cursor: "default" }}>{selectParentMenu[0].name}</span>);
        } else {
          return '';
        };
      }
    }, {
      title: '类型',
      dataIndex: 'default',
      key: 'default',
      render: (record, text) => {
        if (this.judgeType(text)[0] == '2') {
          return <span style={{ cursor: "default" }}>菜单</span>;
        } else if (this.judgeType(text)[1] == '0') {
          return <span style={{ cursor: "default" }}>自设目录</span>;
        } else {
          return <span style={{ cursor: "default" }}>预置目录</span>;
        }
      }
    }, {
      title: '',
      width: '100px',
      key: 'action',
      render: (record, text) => {
        if (this.judgeType(text)[0] == '2') {
          return (
            <Popover
              trigger="hover"
              content="详情"
              placement="bottom"
            >
              <Button
                shape="circle"
                icon="find_in_page"
                onClick={this.detailMenu.bind(this, record)}
              />
            </Popover>)
        } else if (this.judgeType(text)[1] == '0') {
          let flag = [];
          this.judgeDir(record, flag);
          const indexFlag = _.indexOf(flag, true);
          return (<span>
            <Popover
              trigger="hover"
              content="编辑"
              placement="bottom"
            >
              <Button
                shape="circle"
                onClick={this.changeMenu.bind(this, record)}
                icon="mode_edit"
              />
            </Popover>
            {indexFlag >= 0 ? (
              <Permission service={['iam-service.menu.delete']} type={AppState.currentMenuType.type}>
                <Popconfirm
                  title={`确认删除目录${record.name}吗?`}
                  onConfirm={this.deleteMenu.bind(this, record)}
                >
                  <Popover
                    trigger="hover"
                    content="删除"
                    placement="bottom"
                  >
                    <Button
                      shape="circle"
                      icon="delete_forever"
                    // onClick={this.showModal.bind(this, record)}
                    />
                  </Popover>
                </Popconfirm>
              </Permission>
            ) : (
                <Permission service={['iam-service.menu.delete']} type={AppState.currentMenuType.type}>
                  <Popover
                    trigger="hover"
                    content="该目录下有菜单，将菜单移空后即可删除目录"
                    placement="bottomRight"
                  >
                    <Button
                      shape="circle"
                    >
                      <span className={cx('icon-delete_forever', 'gray')} />
                    </Button>
                  </Popover>
                </Permission>
              )}
          </span>)
        } else {
          return '';
        }
      }
    }];
    return (
      <Page>
        <Header title={"菜单配置"}>
          <Permission service={['iam-service.menu.create']} type={AppState.currentMenuType.type}>
            <Button
              className="header-btn headLeftBtn leftBtn"
              ghost
              onClick={this.addDir}
              icon="playlist_add"
            >
              {Choerodon.languageChange('menu.createDir')}
            </Button>
          </Permission>
          <Button
            className="header-btn headRightBtn leftBtn2"
            ghost
            onClick={this.initMenu.bind(this, this.state.type)}
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”的菜单配置`}
          description={(<div>
            菜单是左侧导航栏。菜单配置包括您对菜单名称、图标、层级关系、顺序的配置。菜单的类型分目录和菜单两种。
          <a href="http://v0-5.choerodon.io/zh/docs/user-guide/system-configuration/platform/menu_configuration/">
              了解详情
            </a>
            <span className="icon-open_in_new" />
          </div>)}>
          <Tabs defaultActiveKey="site" onChange={this.selectMenuType}>
            <TabPane tab="平台" key="site">
            </TabPane>
            <TabPane tab="组织" key="organization">
            </TabPane>
            <TabPane tab="项目" key="project">
            </TabPane>
            <TabPane tab="个人中心" key="user">
            </TabPane>
          </Tabs>
          <Table
            filterBar={false}
            pagination={false}
            columns={columns}
            defaultExpandAllRows={false}
            dataSource={this.state.menuData}
            childrenColumnName={"subMenus"}
            rowKey={this.getRowKey}
            style={{ maxHeight: 500, overflow: 'auto' }}
          />
          <Sidebar
            title={this.getSidebarTitle()}
            onOk={this.handleOk}
            okText={okText}
            cancelText="取消"
            onCancel={this.closeSidebar}
            visible={this.state.sidebar}
          >
            {this.getSidebarContent()}
          </Sidebar>
          <Permission service={['iam-service.menu.update']} type={AppState.currentMenuType.type}>
            <Row style={{ marginTop: 25 }}>
              <Col span={5} style={{ marginRight: 16 }}>
                <Button
                  text={Choerodon.languageChange('save')}
                  funcType="raised"
                  type="primary"
                  onClick={this.saveMenu.bind(this, this.state.menuData)}
                // htmlType="submit"
                >保存</Button>
                <Button
                  text={Choerodon.languageChange('save')}
                  funcType="raised"
                  onClick={this.initMenu.bind(this, this.state.type)}
                  style={{ marginLeft: 16 }}
                >取消</Button>
              </Col>
            </Row>
          </Permission>
        </Content>
      </Page>
    );
  }
}
export default Form.create({})(withRouter(MenuTree));
