/*eslint-disable*/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Icon, Input, Modal, Popconfirm, Table, Tabs, Tooltip } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import Page, { Content, Header } from 'Page';
import axios from 'Axios';
import Permission from 'PerComponent';
import _ from 'lodash';
import MenuStore from '@/stores/MenuStore';
import { adjustSort, canDelete, defineLevel, deleteNode, findParent, hasDirChild, isChild, normalizeMenus } from './util';
import IconSelect from '../../../components/iconSelect/IconSelect';
import './MenuTree.scss';

let currentDropOverItem;
let currentDropSide;

function addDragClass(currentTarget, dropSide) {
  if (dropSide) {
    currentDropOverItem = currentTarget;
    currentDropSide = dropSide;
    currentDropOverItem.classList.add(dropSideClassName(currentDropSide));
  }
}

function removeDragClass() {
  if (currentDropOverItem && currentDropSide) {
    currentDropOverItem.classList.remove(dropSideClassName(currentDropSide));
  }
}

function dropSideClassName(side) {
  return `drop-row-${side}`;
}

const { Sidebar } = Modal;
const FormItem = Form.Item;
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
      menuGroup: {},
      type: 'site',
      selectType: 'create',
      sidebar: false,
      selectMenuDetail: {},
      dragData: null,
      iconFilterText: null,
      iconPage: 1,
      iconPageSize: 20,
    };
  }

  componentWillMount() {
    this.initMenu();
  }

  //初始化类型
  initMenu(type) {
    const { menuGroup, type: typeState } = this.state;
    type = type || typeState;
    axios.get(`/iam/v1/menus/tree?level=${type}`)
      .then(value => {
        menuGroup[type] = normalizeMenus(value);
        this.setState({
          menuGroup,
        });
      });
  }

  //选择菜单类型
  selectMenuType = (type) => {
    if (!this.state.menuGroup[type]) {
      this.initMenu(type);
    }
    this.setState({
      type,
    });
  };
  //关闭sidebar
  closeSidebar = () => {
    this.setState({
      sidebar: false,
      iconPage: 1,
      iconPageSize: 20,
      iconFilterText: null,
    });
  };
  //创建目录，弹出sidebar
  addDir = () => {
    const { resetFields } = this.props.form;
    resetFields();
    this.setState({
      selectType: 'create',
      sidebar: true,
    });
  };
  //查看细节，弹出sidebar,设置选中的菜单或目录
  detailMenu = (record) => {
    this.setState({
      selectType: 'detail',
      sidebar: true,
      selectMenuDetail: record,
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
    });
  };
  //删除菜单
  deleteMenu = (record) => {
    const { menuGroup, type } = this.state;
    deleteNode(menuGroup[type], record);
    this.setState({
      menuGroup,
    });
    Choerodon.prompt(Choerodon.getMessage('删除成功，请点击保存。', 'Success'));
  };

  handleRefresh = () => {
    const { type, menuGroup } = this.state;
    this.setState({
      menuGroup: {
        [type]: menuGroup[type],
      },
    }, () => {
      this.initMenu();
    });
  };

  //创建添加的状态请求
  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, { code, name, icon }) => {
      if (!err) {
        const { selectType, menuGroup, selectMenuDetail, type } = this.state;
        switch (selectType) {
          case 'create':
            const menu = {
              code,
              icon,
              name,
              default: false,
              level: type,
              type: 'dir',
              parentId: 0,
              subMenus: null,
            };
            defineLevel(menu, 0);
            menuGroup[type].push(menu);
            Choerodon.prompt('创建目录成功，请点击保存。');
            break;
          case 'edit':
            selectMenuDetail.name = name;
            selectMenuDetail.icon = icon;
            Choerodon.prompt('修改目录成功，请点击保存。');
            break;
        }
        this.setState({
          sidebar: false,
          menuGroup,
        });
      }
    });
  };
  handleIconPageChange = (iconPage, iconPageSize) => {
    this.setState({
      iconPage,
      iconPageSize,
    });
  };
  handleIconFilter = (iconFilterText) => {
    this.setState({
      iconFilterText,
    });
  };
  // 创建目录的3个状态
  getSidebarTitle = (selectType) => {
    switch (selectType) {
      case 'create':
        return '创建目录';
      case 'edit':
        return '修改目录';
      case 'detail':
        return '查看详情';
    }
  };

  //创建3个状态的sidebar渲染
  getSidebarContent(selectType) {
    const { selectMenuDetail: { name } } = this.state;
    let formDom, pageFirstLineTitle, FirstLineContent;
    switch (selectType) {
      case 'create':
        pageFirstLineTitle = `在平台”${process.env.HEADER_TITLE_NAME || 'Choerodon'}“中创建目录`;
        FirstLineContent = '请在下面输入目录名称、编码，选择目录图标创建目录。您创建的目录为自设目录，自设目录可以修改、删除。而平台内置的目录为预置目录，您不能创建、修改、删除预置目录。';
        formDom = this.getDirNameDom();
        break;
      case 'edit':
        pageFirstLineTitle = `对目录“${name}”进行修改`;
        FirstLineContent = '您可以在此修改目录名称、图标。';
        formDom = this.setDirNameDom();
        break;
      case 'detail':
        pageFirstLineTitle = `查看菜单“${name}”详情`;
        FirstLineContent = '您可以在此查看菜单的名称、编码、层级、所属预置目录、权限。菜单是平台内置的，您不能创建、修改、删除菜单。';
        formDom = this.getDetailDom();
        break;
    }
    return (
      <div>
        <Content
          style={{ padding: 0 }}
          title={pageFirstLineTitle}
          description={FirstLineContent}
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/platform/menu_configuration/"
        >
          {formDom}
        </Content>
      </div>);
  }

  //修改目录详情
  setDirNameDom() {
    const { getFieldDecorator } = this.props.form;
    const { selectMenuDetail: { name, code, icon }, iconFilterText, iconPage, iconPageSize } = this.state;
    return (
      <Form layout="vertical">
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('请输入目录名称', 'This field is required.'),
            }],
            initialValue: name,
          })(
            <Input
              label="目录名称"
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
            initialValue: code,
          })(
            <Input
              label="目录编码"
              disabled={true}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('icon', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('请选择一个图标', 'icon is required'),
            }],
            validateTrigger: 'onChange',
            initialValue: icon,
          })(
            <IconSelect
              label="请选择一个图标"
              onPageChange={this.handleIconPageChange}
              onFilter={this.handleIconFilter}
              filterText={iconFilterText}
              page={iconPage}
              pageSize={iconPageSize}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
      </ Form>);
  }

  //查看详情
  getDetailDom() {
    const { name, code, level, permissions, __parent_name__ } = this.state.selectMenuDetail;
    return (
      <div>
        <Form layout="vertical">
          <FormItem
            {...formItemLayout}
          >
            <Input
              value={name}
              label="菜单名称"
              disabled={true}
              style={{ width: inputWidth }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            <Input
              value={code}
              label="菜单编码"
              disabled={true}
              style={{ width: inputWidth }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            <Input
              value={level}
              label="菜单层级"
              disabled={true}
              style={{ width: inputWidth }}
            />
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            <Input
              value={__parent_name__}
              label="所属根目录"
              disabled={true}
              style={{ width: inputWidth }}
            />
          </FormItem>
        </Form>
        <div className="permission-list" style={{ width: inputWidth }}>
          <p>菜单所具有权限:</p>
          {
            permissions && permissions.length > 0 ? permissions.map(
              ({ code }) => <div key={code}><span>{code}</span></div>,
            ) : '此菜单无对应权限'
          }
        </div>
      </div>
    );
  }

  //created FormDom渲染
  getDirNameDom() {
    const { getFieldDecorator } = this.props.form;
    const { iconFilterText, iconPage, iconPageSize } = this.state;
    return (
      <Form layout="vertical">
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
              autoComplete="off"
              label="目录名称"
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
            }, {
              pattern: /^[a-z]([-.a-z0-9]*[a-z0-9])?$/,
              message: Choerodon.getMessage('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾', 'This field is required.'),
            }],
            validateTrigger: 'onBlur',
            validateFirst: true,
          })(
            <Input
              autoComplete="off"
              label="目录编码"
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('icon', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('请选择一个图标', 'icon is required'),
            }],
            validateTrigger: 'onChange',
          })(
            <IconSelect
              label="请选择一个图标"
              autoComplete="off"
              onPageChange={this.handleIconPageChange}
              onFilter={this.handleIconFilter}
              filterText={iconFilterText}
              page={iconPage}
              pageSize={iconPageSize}
              style={{ width: inputWidth }}
            />,
          )}
        </FormItem>
      </Form>
    );
  }

  getRowKey = (record) => {
    return `${record.parentId} - ${record.code}`;
  };

  //判断是否能拖拽
  checkDraggable(record) {
    const { dragData } = this.state;
    return !dragData || (dragData !== record && !isChild(dragData, record));
  }

  //判断是否能拖放
  checkDroppable(record) {
    const { dragData } = this.state;
    return dragData && dragData !== record &&
      (this.checkDropIn(record) || this.checkDropBesides(record)) && !isChild(dragData, record);
  }

  //判断是否能拖入
  checkDropIn(record) {
    const { dragData } = this.state;
    return dragData && record.type !== 'menu' && dragData.type !== 'root' && !hasDirChild(dragData) &&
      record.__level__ < (dragData.type === 'dir' ? 1 : 2);
  }

  //判断是否能插在前后
  checkDropBesides(record) {
    const { dragData } = this.state;
    return dragData && (
      record.__level__ === 0 ? dragData.type !== 'menu' :
        (dragData.type !== 'root' && !hasDirChild(dragData))
    );
  }

  //拖拽离开目标
  handleDragLeave() {
    removeDragClass();
  }

  //拖拽开始
  handleDragtStart(dragData) {
    this.setState({
      dragData,
    });
  }

  //拖拽结束
  handleDragEnd = () => {
    removeDragClass();
    this.setState({
      dragData: null,
    });
  };

  //拖拽目标位置
  handleDragOver(record, e) {
    e.preventDefault();
    const canAddIn = this.checkDropIn(record);
    const canAddBesides = this.checkDropBesides(record);
    if (canAddIn || canAddBesides) {
      const { currentTarget, pageY, dataTransfer } = e;
      const { top, height } = currentTarget.getBoundingClientRect();
      let before = height / 2;
      let after = before;
      let dropSide;
      if (canAddIn) {
        before = height / 3;
        after = before * 2;
        dropSide = 'in';
        dataTransfer.dropEffect = 'copy';
      }
      if (canAddBesides) {
        const y = pageY - top;
        if (y < before) {
          dropSide = 'before';
          dataTransfer.dropEffect = 'move';
        } else if (y >= after) {
          dropSide = 'after';
          dataTransfer.dropEffect = 'move';
        }
      }
      removeDragClass();
      addDragClass(currentTarget, dropSide);
    }
  }

  //拖放
  handleDrop(record) {
    removeDragClass();
    const { dragData, menuGroup, type } = this.state;
    const menuData = menuGroup[type];
    if (dragData && record) {
      deleteNode(menuData, dragData);
      if (currentDropSide === 'in') {
        dragData.parentId = record.id;
        record.subMenus = record.subMenus || [];
        record.subMenus.unshift(dragData);
        normalizeMenus([dragData], record.__level__, record.name);
      } else {
        const { parent, index, parentData: { id = 0, __level__, name } = {} } = findParent(menuData, record);
        dragData.parentId = id;
        parent.splice(index + (currentDropSide === 'after' ? 1 : 0), 0, dragData);
        normalizeMenus([dragData], __level__, name);
      }
      this.setState({
        menuGroup,
        dragData: null,
      });
    }
  }

  handleRow = (record) => {
    const droppable = this.checkDroppable(record);
    const rowProps = droppable ? {
      draggable: true,
      onDragLeave: this.handleDragLeave,
      onDragOver: this.handleDragOver.bind(this, record),
      onDrop: this.handleDrop.bind(this, record),
    } : {};
    return rowProps;
  };

  handleCell = (record) => {
    const draggable = this.checkDraggable(record);
    const cellProps = {
      onDragEnd: this.handleDragEnd,
    };
    if (draggable) {
      Object.assign(cellProps, {
        draggable: true,
        onDragStart: this.handleDragtStart.bind(this, record),
        className: 'drag-cell',
      });
    }
    return cellProps;
  };

  //储存菜单
  saveMenu = () => {
    const { type, menuGroup } = this.state;
    axios.post(`/iam/v1/menus/tree?level=${type}`, JSON.stringify(adjustSort(menuGroup[type])))
      .then(menus => {
        if (menus.failed) {
          Choerodon.prompt(menus.message);
        } else {
          MenuStore.setMenuData(_.clone(menus), type);
          Choerodon.prompt('保存成功');
          menuGroup[type] = normalizeMenus(menus);
          this.setState({
            menuGroup,
          });
        }
      });
  };

  render() {
    const menuType = this.props.AppState.currentMenuType.type;
    const { menuGroup, type: typeState, selectType, sidebar } = this.state;
    const columns = [{
      title: '目录 / 菜单',
      dataIndex: 'name',
      key: 'name',
      render: (text, { type, default: dft }) => {
        let icon = '';
        if (type === 'menu') {
          icon = 'dehaze';
        } else if (!dft) {
          icon = 'custom_Directory';
        } else {
          icon = 'folder';
        }
        return (
          <span><Icon type={icon} /> {text}</span>
        );
      },
      onCell: this.handleCell,
    }, {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      render: (text) => {
        return <span className={`icon-${text}`} style={{ fontSize: 18 }} />;
      },
    }, {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
    }, {
      title: '所属预设目录',
      dataIndex: '__parent_name__',
      key: '__parent_name__',
    }, {
      title: '类型',
      dataIndex: 'default',
      key: 'default',
      render: (text, { type, default: dft }) => {
        if (type === 'menu') {
          return <span style={{ cursor: 'default' }}>菜单</span>;
        } else if (!dft) {
          return <span style={{ cursor: 'default' }}>自设目录</span>;
        } else {
          return <span style={{ cursor: 'default' }}>预置目录</span>;
        }
      },
    }, {
      title: '',
      width: 100,
      key: 'action',
      render: (text, record) => {
        const { type, default: dft } = record;
        if (type === 'menu') {
          return (
            <Permission service={['iam-service.menu.query']} type={menuType}>
              <Tooltip
                title="详情"
                placement="bottom"
              >
                <Button
                  shape="circle"
                  icon="find_in_page"
                  onClick={this.detailMenu.bind(this, record)}
                />
              </Tooltip>
            </Permission>
          );
        } else if (!dft) {
          const canDel = canDelete(record);
          return (<span>
            <Permission service={['iam-service.menu.update']} type={menuType}>
              <Tooltip
                title="修改"
                placement="bottom"
              >
                <Button
                  shape="circle"
                  onClick={this.changeMenu.bind(this, record)}
                  icon="mode_edit"
                />
              </Tooltip>
            </Permission>
            <Permission service={['iam-service.menu.delete']} type={menuType}>
              {canDel ? (
                <Popconfirm
                  title={`确认删除目录${record.name}吗?`}
                  onConfirm={this.deleteMenu.bind(this, record)}
                >
                  <Tooltip
                    title="删除"
                    placement="bottom"
                  >
                    <Button
                      shape="circle"
                      icon="delete_forever"
                    />
                  </Tooltip>
                </Popconfirm>
              ) : (
                <Tooltip
                  title="该目录下有菜单，将菜单移空后即可删除目录"
                  placement="bottomRight"
                >
                  <Button
                    disabled
                    shape="circle"
                    icon="delete_forever"
                  />
                </Tooltip>
              )}
            </Permission>
          </span>);
        }
      },
    }];
    return (
      <Page>
        <Header title={'菜单配置'}>
          <Permission service={['iam-service.menu.create']} type={menuType}>
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
            onClick={this.handleRefresh}
            icon="refresh"
          >
            {Choerodon.languageChange('refresh')}
          </Button>
        </Header>
        <Content
          title={`平台“${process.env.HEADER_TITLE_NAME || 'Choerodon'}”的菜单配置`}
          description="菜单是左侧导航栏。菜单配置包括您对菜单名称、图标、层级关系、顺序的配置。菜单的类型分目录和菜单两种。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/platform/menu_configuration/"
        >
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
            dataSource={menuGroup[typeState]}
            childrenColumnName="subMenus"
            rowKey={this.getRowKey}
            onRow={this.handleRow}
          />
          <Sidebar
            title={this.getSidebarTitle(selectType)}
            onOk={this.handleOk}
            okText={selectType === 'create' ? '添加' : '确定'}
            cancelText="取消"
            onCancel={this.closeSidebar}
            visible={sidebar}
          >
            {this.getSidebarContent(selectType)}
          </Sidebar>
          <Permission service={['iam-service.menu.saveListTree']} type={menuType}>
            <div style={{ marginTop: 25 }}>
              <Button
                funcType="raised"
                type="primary"
                onClick={this.saveMenu}
              >{Choerodon.languageChange('save')}</Button>
              <Button
                funcType="raised"
                onClick={this.handleRefresh}
                style={{ marginLeft: 16 }}
              >取消</Button>
            </div>
          </Permission>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(MenuTree));
