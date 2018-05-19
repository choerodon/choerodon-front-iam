import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Collapse, message, Tooltip, Table, Button, Spin, Input, Modal, Row, Col, Icon } from 'che';
import { withRouter } from 'react-router-dom';
import Permission from 'PerComponent';
import PageHeader, { PageHeadStyle, UnderPageHeadStyle } from 'PageHeader';
import Action from 'Action';
import Remove from 'Remove';
import _ from 'lodash';
import Select from 'Select';
import ClientSearch from 'ClientSearch';
import RePagination from 'RePagination';
import ReRoleCas from '../../../components/memberRole/globalRoleCas';
// import Remove from '../../../components/Remove';
import './GlobalMemberRole.css';

const confirm = Modal.confirm;
const Panel = Collapse.Panel;

@inject('AppState')
@observer
class GlobalMemberRole extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      // 添加角色弹框
      addModelVisible: false,
      // 添加角色弹框确定按钮的loading
      confirmLoading: false,
      // 添加角色的用户名
      userName: '',
      // 当前添加成员的权限列表
      addModalRoleData: [],
      // 当前选择的行下表
      selectedRowKeys: [],
      // 当前选择行数据
      selectedRows: [],
      // 批量刪除彈框
      batchDeleteOpen: false,
      singleDeleteOpen: false,
      record: {},
      // 当前点击table的行的数据
      nowClickRow: '',
      // 点击其他地方关闭rerole
      clickBody: true,
      buttonClicked: false,
      currentPage: 1,
      currentPage2: 1,
      name: '',
      addUserError: false,
    };
    this.handleAddModalShow = this.handleAddModalShow.bind(this);
    this.handleAddCancel = this.handleAddCancel.bind(this);
    this.onChangeUserName = this.onChangeUserName.bind(this);
    this.emitEmpty = this.emitEmpty.bind(this);
    this.loadMemberRoles = this.loadMemberRoles.bind(this);
    this.loadRoles = this.loadRoles.bind(this);
    this.loadUserData = this.loadUserData.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    // this.handleRemoveOpen = this.handleRemoveOpen.bind(this);
    this.handleAddOk = this.handleAddOk.bind(this);
    this.onChangeAddModalRoleData = this.onChangeAddModalRoleData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleBatchRemoveOpen = this.handleBatchRemoveOpen.bind(this);
    this.handleSingleRemoveOpen = this.handleSingleRemoveOpen.bind(this);
    this.handleBatchRemoveClose = this.handleBatchRemoveClose.bind(this);
    this.handleSingleRemoveClose = this.handleSingleRemoveClose.bind(this);
    this.handleBatchDelete = this.handleBatchDelete.bind(this);
    this.handleSingleDelete = this.handleSingleDelete.bind(this);
    this.listRoleMember = this.listRoleMember.bind(this);
    this.clickRow = this.clickRow.bind(this);
    this.handleClickBody = this.handleClickBody.bind(this);
    this.orderByOrder = this.orderByOrder.bind(this);
  }

  componentWillMount() {
    this.loadMemberRoles(1);
    this.loadRoles();
    // this.loadUserData();
  }

  onChangeUserName = (e) => {
    this.setState({ userName: e.target.value });
  }

  onBlurUserName = (e) => {
    const { GlobalMemberRoleStore } = this.props;
    GlobalMemberRoleStore.checkAddUserName(e.target.value).then(() => {
      this.setState({
        addUserError: true,
      });
    }).catch(() => {
      this.setState({
        addUserError: false,
      });
    });
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows });
  }

  onChangeAddModalRoleData = (state) => {
    this.setState(state);
  }

  onChangePagination2 = (id, page) => {
    this.setState({
      currentPage2: page,
    });
    const { AppState, GlobalMemberRoleStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    GlobalMemberRoleStore.axiosGetRoleSearchTable(organizationId, id, page);
  }

  
  onChangePagination = (page) => {
    this.setState({
      currentPage: page,
    });
    this.loadMemberRoles(page);
  }


  loadMemberRoles = (page) => {
    const { AppState, GlobalMemberRoleStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    GlobalMemberRoleStore.loadMemberRoles(organizationId, page, this.state.name);
  }

  loadRoles = () => {
    const { AppState, GlobalMemberRoleStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    GlobalMemberRoleStore.loadRoles(organizationId);
  };

  loadUserData = () => {
    const { AppState, GlobalMemberRoleStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    GlobalMemberRoleStore.loadUserData(organizationId);
  };

  handleAddModalShow = () => {
    this.setState({
      // valueMention: toContentState(' '),
      addModelVisible: true,
    });
  }

  handleAddCancel = () => {
    this.setState({
      // valueMention: toContentState(' '),
      addModelVisible: false,
      userName: '',
      buttonClicked: false,
    });
  }

  emitEmpty = () => {
    this.setState({ userName: '' });
  }

  handleRemoveOpen = (record) => {
    const { GlobalMemberRoleStore } = this.props;
    const that = this;
    confirm({
      title: Choerodon.getMessage('确认删除？', 'Sure to Delete?'),
      content: Choerodon.getMessage('当你点击删除后，该条数据将被永久删除，不可恢复！',
        'When you click delete, this data will be deleted forever, can\'t be recover'),
      onOk() {
        GlobalMemberRoleStore.reHandleDelete(record.memberId).then(() => {
          Choerodon.prompt(Choerodon.getMessage('删除成功', 'Delete Success'));
          that.loadMemberRoles(1);
        }).catch((err) => {
          Choerodon.prompt(`${Choerodon.getMessage('删除失败', 'Delete Failed')} ${err}`);
        });
      },
      onCancel() {
        window.console.log('Cancel');
      },
    });
  }

  handleAddOk = () => {
    this.setState({
      buttonClicked: true,
    });
    const that = this;
    // let memberName = this.refs.memberName.refs.input.value;
    const { AppState, GlobalMemberRoleStore } = this.props;
    // this.state.confirmLoading = true;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    if (!this.state.userName) {
      Choerodon.prompt(Choerodon.getMessage('请输入成员名称', 'Please input name of member'));
      return;
    }
    const addModalRoleData = GlobalMemberRoleStore.getAddChosenRoles;
    GlobalMemberRoleStore.loadUserAllData(this.state.userName)
      .then((data) => {
        if (data) {
          const memberIds = data.id;
          const datas = {
            memberId: memberIds,
            memberType: 'user',
            resourceType: 'global',
            roles: [],
          };
          for (let a = 0; a < addModalRoleData.length; a += 1) {
            datas.roles.push(
              addModalRoleData[a].id);
          }
          GlobalMemberRoleStore.handleAddOk(
            organizationId, datas).then(() => {
            Choerodon.prompt('添加成功');
            that.loadMemberRoles(1);
            this.handleAddCancel();
          }).catch((error) => {
            Choerodon.prompt(`${Choerodon.getMessage('添加失败', 'failAdd')} ${error.response.data.message}`);
          });
          this.setState({ buttonClicked: false });
        }
      }).catch((err) => {
        Choerodon.prompt(`${Choerodon.getMessage('添加失败', 'failAdd')} ${err.message}`);
        this.setState({ buttonClicked: false });
      });
  }

  handleChange = (value) => {
    const { GlobalMemberRoleStore } = this.props;
    if (value === 'user') {
      GlobalMemberRoleStore.setIsUser(true);
      GlobalMemberRoleStore.setShow(false);
    } else if (value === 'role') {
      const { AppState } = this.props;
      const menuType = AppState.currentMenuType;
      const organizationId = menuType.id;
      GlobalMemberRoleStore.setIsUser(false);
      GlobalMemberRoleStore.setShow(false);
      GlobalMemberRoleStore.loadRolesByRoles(organizationId, 1, {});
    } else {
      GlobalMemberRoleStore.setIsUser(true);
      GlobalMemberRoleStore.setShow(false);
    }
  }

  handleSearch = (value) => {
    this.setState({
      name: value,
      currentPage: 1,
    });
    const { AppState, GlobalMemberRoleStore } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    GlobalMemberRoleStore.loadMemberRoles(organizationId, 1, value);
  }

  handleBatchRemoveOpen = () => {
    if (this.state.selectedRows.length === 0) {
      Choerodon.prompt(Choerodon.getMessage('未选择任何项', 'Not select anything'));
    } else {
      this.setState({
        batchDeleteOpen: true,
      });
    }
  }

  handleSingleRemoveOpen = (records) => {
    this.setState({
      singleDeleteOpen: true,
      record: records,
    });
  }

  handleBatchRemoveClose = () => {
    this.setState({
      batchDeleteOpen: false,
    });
  }

  handleSingleRemoveClose = () => {
    this.setState({
      singleDeleteOpen: false,
    });
  }

  handleBatchDelete = () => {
    const { GlobalMemberRoleStore } = this.props;
    const success = 0;
    const total = this.state.selectedRows.length;
    for (let a = 0; a < this.state.selectedRows.length; a += 1) {
      GlobalMemberRoleStore.handleBatchDelete(
        this.state.selectedRows[a].id, success, total, this.loadMemberRoles.bind(this));
    }
  }

  handleSingleDelete = () => {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    const { GlobalMemberRoleStore } = this.props;
    const { record } = this.state;
    const that = this;
    GlobalMemberRoleStore.reHandleDelete(organizationId, record.userId).then(() => {
      that.loadMemberRoles(1);
      that.handleSingleRemoveClose();
    }).catch((err) => {
      Choerodon.prompt(`${Choerodon.getMessage('删除失败', 'fail Delete')} ${err}`);
    });
  }

  listRoleMember = () => {
    const { GlobalMemberRoleStore } = this.props;
    
    const columns = [{
      title: Choerodon.getMessage('类型', 'type'),
      dataIndex: 'memberType',
      key: 'memberType',
      className: 'memberType',
      render: text => (
        <div>
          <Tooltip
            placement="right"
            title={text === 'user' ? Choerodon.getMessage('用户', 'user') : Choerodon.getMessage('组织', 'organization')}
          >
            {text === 'user' ? <Icon type="user" /> : <Icon type="database" />}
          </Tooltip>
        </div>
      ),
      sorter: (a, b) => (a.memberType > b.memberType ? 1 : 0),
    }, {
      title: Choerodon.getMessage('成员', 'member'),
      dataIndex: 'userName',
      key: 'userName',
      className: 'userName',
      render: (text, record) => {
        const textNode = text ? (
          <div>
            <span className="titleNameStyle">{text}</span>
          </div>
        ) : (
          <div>
            <span className="titleNameStyle">{record.userEmail}</span>
          </div>
        );
        return textNode;
      },
      sorter: (a, b) => (a.userName > b.userName ? 1 : 0),
    }, {
      title: Choerodon.getMessage('昵称', 'nickName'),
      dataIndex: 'realName',
      key: 'realName',
      render: (text, record) => <span>{text}</span>,
    }, {
      title: Choerodon.getMessage('角色', 'role'),
      className: 'roleStyles',
      render: (text, record) => (
        // 按角色查询
        <ReRoleCas
          data={record}
          clickId={this.state.nowClickRow}
        />
      ),
    }, {
      title: Choerodon.getMessage('操作', 'operation'),
      className: 'operateIcons',
      key: 'action',
      // render: (text, record) => (
      //   <div>
      //     <Tooltip
      //       title={Choerodon.getMessage('取消', 'cancel')}
      //       placement="bottom"
      //     >
      //       <a
      //         role="none"
      //         className="operateIcon small-tooltip"
      //         onClick={this.handleRemoveOpen.bind(this, record)}
      //       >
      //         <Icon type="delete" />
      //       </a>
      //     </Tooltip>
      //   </div>
      // ),
      render: (text, record) => (
        <Action
          data={[{
            service: 'hap-user-service.member-role-global.delete',
            icon: 'delete_forever',
            text: '删除',
            action: this.handleSingleRemoveOpen.bind(this, record),
          }]}
        />
      ),
    }];
    const rolesList2 = GlobalMemberRoleStore.getRoleSearch;
    const memberData = GlobalMemberRoleStore.getRoleSearchTable;
    const rolesList = [];
    _.forOwn(memberData, (value, key) => {
      _.forEach(rolesList2, (name, index) => {
        if (parseInt(name.id, 0) === parseInt(key, 10)) {
          rolesList.push(rolesList2[index]);
        }
      });
    });
    const renderRole = (
      <div>
        <Collapse>
          {
            rolesList.map(item => (
              <Panel key={item.id} header={`${item.description} (${memberData[item.id].totalSouce} 成员)`}>
                {
                  JSON.stringify(memberData) !== '{}' ?
                    <div>
                      {
                        GlobalMemberRoleStore.getSpinRole ? 
                          <Spin size="small" />
                          :
                          <div>
                            <Table
                              size="small"
                              pagination={false}
                              columns={columns}
                              onRowClick={this.clickRow.bind(this)}
                              dataSource={memberData[item.id].dataSource}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                              <RePagination
                                current={this.state.currentPage2}
                                total={memberData[item.id].totalSouce}
                                onChange={this.onChangePagination2.bind(this, item.id)}
                              />
                            </div>
                          </div>
                      }
                    </div> : 
                    <Table
                      size="small"
                      pagination={false}
                      columns={columns}
                      dataSource={[]}
                    />
                }
                
              </Panel>
            ))
          }
        </Collapse>
      </div>
    );
    return renderRole;
  }

  clickRow = (record) => {
    this.state.nowClickRow = record.userId;
    this.setState({
      nowClickRow: this.state.nowClickRow,
    });
  }

  handleClickBody = () => {
    this.setState({
      clickBody: !this.state.clickBody,
    });
  }

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

  goFresh = () => {
    this.setState({
      currentPage: 1,
    });
    this.loadMemberRoles(1);
  }

  render() {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const organizationId = menuType.id;
    let type;
    if (AppState.getType) {
      type = AppState.getType;
    } else if (sessionStorage.type) {
      type = sessionStorage.type;
    } else {
      type = menuType.type;
    }
    // 拿到关联的store
    const { GlobalMemberRoleStore } = this.props;
    // 拿到是否为用户
    const isUser = GlobalMemberRoleStore.getIsUser;
    const isLoading = GlobalMemberRoleStore.getIsLoading;
    // 定义页面所用样式
    const style = {
      container: {
        display: 'flex',
        flex: '1 1 auto',
        backgroundColor: 'white',
        flexDirection: 'column',
        height: '100%',
      },
      top: {
        top: 0,
        flexDirection: 'row',
      },
      bottom: {
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 24,
        marginRight: 24,
      },
      left: {
        flex: '1 1 0',
        order: 1,
        width: '60%',
        flexDirection: 'row',
        flexGrow: '3',
      },
      right: {
        flex: '1 1 0',
        order: 2,
        flexDirection: 'row',
        borderLeft: '1px solid #F4F4F4',
        flexGrow: '1',
      },
      tip: {
        backgroundColor: '#fafafa',
      },
    };

    const loading = (
      <div>
        <Spin size="default" style={{ position: 'fixed', bottom: '50%', left: '50%' }} />
      </div>
    );
    const suffix = this.state.userName ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;
    const loadingBar = (
      <div style={{ display: 'inherit', margin: '200px auto', textAlign: 'center' }}>
        <Spin />
      </div>
    );
    const memberDataSource = GlobalMemberRoleStore.getMemberRole;
    const columns = [{
      title: Choerodon.getMessage('类型', 'type'),
      dataIndex: 'memberType',
      key: 'memberType',
      className: 'memberType',
      render: text => (
        <div>
          <Tooltip
            placement="right"
            title={text === 'user' ? Choerodon.getMessage('用户', 'user') : Choerodon.getMessage('组织', 'organization')}
          >
            {text === 'user' ? <Icon type="user" /> : <Icon type="database" />}
          </Tooltip>
        </div>
      ),
      sorter: (a, b) => (a.memberType - b.memberType ? 1 : -1),
    }, {
      title: Choerodon.getMessage('成员', 'member'),
      dataIndex: 'userName',
      key: 'userName',
      className: 'userName',
      render: (text, record) => {
        const textNode = text ? (
          <div>
            <span className="titleNameStyle">{text}</span>
          </div>
        ) : (
          <div>
            <span className="titleNameStyle">{record.userEmail}</span>
          </div>
        );
        return textNode;
      },
      sorter: (a, b) => (a.userName > b.userName ? 1 : -1),
    }, {
      title: Choerodon.getMessage('昵称', 'nickName'),
      dataIndex: 'realName',
      key: 'realName',
      render: (text, record) => <span>{text}</span>,
    }, {
      title: Choerodon.getMessage('角色', 'role'),
      className: 'roleStyles',
      render: (text, record) => (
        // 底部table
        <ReRoleCas
          data={record}
          loadmemberRole={this.loadMemberRoles.bind(this, 1)}
          clickId={this.state.nowClickRow}
          OpenAdd={this.state.addModelVisible}
        />
      ),
    }, {
      title: '',
      className: 'operateIcons',
      key: 'action',
      render: (text, record) => (
        <Action
          data={[{
            service: 'hap-user-service.member-role-global.delete',
            icon: 'delete_forever',
            text: '删除',
            action: this.handleSingleRemoveOpen.bind(this, record),
          }]}
        />
      ),
    }];

    const rowSelection = {
      onChange: this.onSelectChange.bind(this),
    };

    const total = GlobalMemberRoleStore.getTotalElement;
    

    return (
      <div
        className="organMember"
        role="none"
        style={style.container}
        onClick={this.handleClickBody.bind(this)}
      >
        <div
          style={style.top}
        >
          {/* 这里是顶部三个按钮和title */}
          <PageHeader
            title={Choerodon.getMessage('成员角色管理', 'Member Role Organization')}
          >
            <Permission service={'hap-user-service.member-role-global.create'} type={type} organizationId={organizationId}>
              <Button
                className="header-btn"
                ghost="true"
                style={PageHeadStyle.leftBtn}
                // 添加按钮点击事件
                onClick={this.handleAddModalShow}
              >
                <span className="icon-person_add" />
                <span className="icon-space">{Choerodon.getMessage('添加', 'add')}</span>
              </Button>
            </Permission>
            {/* 添加按钮的弹窗 */}
            <Modal
              title={Choerodon.getMessage('添加成员', 'Add member')}
              visible={this.state.addModelVisible}
              onCancel={this.handleAddCancel}
              maskClosable={false}
              onOk={this.handleAddOk}
              confirmLoading={this.state.confirmLoading}
              footer={[
                <Button
                  onClick={this.handleAddOk}
                  funcType="raised"
                  type="primary"
                  loading={this.state.buttonClicked}
                  style={{ marginLeft: '8px' }}
                  text={Choerodon.getMessage('确定', 'confirm')}
                />,
                <Button
                  onClick={this.handleAddCancel}
                  funcType="raised"
                  text={Choerodon.getMessage('取消', 'cancel')}
                />,
              ]}
            >
              <Row>
                <Col>
                  <p>
                    {Choerodon.getMessage(
                      '请在下面输入一个成员，然后为这些成员选择角色，以便授予他们访问您资源的权限。您可以分配多个角色。',
                      'Please enter a member below and then select roles for these members in order to grant them access to your resources. You can assign multiple roles.')}
                  </p>
                </Col>
              </Row>
              <br />
              <div className="memberCol">
                <Row
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Col span={2}>
                    <p>
                      {Choerodon.getMessage('用户', 'user')}:
                    </p>
                  </Col>
                  <Col
                    span={8}
                    style={{
                      border: this.state.addUserError ? '1px solid red' : '1px solid #d3d3d3',
                    }}
                  >
                    <Input
                      placeholder="请输入用户账号"
                      // 后缀图标 如果input有值 后面添加一个点击删除图标
                      suffix={suffix}
                      value={this.state.userName}
                      onChange={this.onChangeUserName}
                      onBlur={this.onBlurUserName}
                    />
                  </Col>
                  <Col span={4} offset={2}>
                    <p>
                      {Choerodon.getMessage('角色', 'role')}:
                    </p>
                  </Col>
                  <Col span={7}>
                    {/* 添加成员 */}
                    <ReRoleCas
                      addModelVisible={this.state.addModelVisible}
                      add
                    />
                  </Col>
                </Row>
              </div>
              <div 
                style={{
                  display: this.state.addUserError ? 'block' : 'none',
                  color: 'red',
                  position: 'relative',
                  left: '2.5rem',
                  top: '10px',
                }}
              >
                用户名不存在  
              </div>
            </Modal>
            {/* <Permission 
            service={'hap-user-service.member-role-global.delete'} 
            type={type} organizationId={organizationId}>
              <Button
                className="header-btn"
                ghost="true"
                style={PageHeadStyle.leftBtn2}
                onClick={this.handleBatchRemoveOpen}
              >
                <span className="icon-delete_forever" />
                <span className="icon-space">{Choerodon.getMessage('删除', 'cancel')}</span>
              </Button>
            </Permission> */}
            <Permission service={'hap-user-service.member-role-global.select'} type={type} organizationId={organizationId}>
              <Button
                className="header-btn"
                ghost="true"
                style={PageHeadStyle.leftBtn2}
                onClick={this.goFresh.bind(this)}
              >
                <span className="icon-autorenew" />
                <span className="icon-space">{Choerodon.getMessage('刷新', 'refresh')}</span>
              </Button>
            </Permission>
          </PageHeader>
        </div>
        {/* 如果在loading加载spin 否则加载列表 */}
        {this.props.isLoading ? loading : (
          <div style={Object.assign({}, style.bottom, UnderPageHeadStyle)}>
            <div style={style.left}>
              <Remove
                open={this.state.batchDeleteOpen}
                handleCancel={this.handleBatchRemoveClose}
                handleConfirm={this.handleBatchDelete}
              />
              <Remove
                open={this.state.singleDeleteOpen}
                handleCancel={this.handleSingleRemoveClose}
                handleConfirm={this.handleSingleDelete}
              />
              {/* 搜索框和查看方式 */}
              <div style={{ display: 'flex' }}>
                <ClientSearch
                  options={[{
                    name: '类型',
                    code: 'memberType',
                  }, {
                    name: '成员名',
                    code: 'userName',
                  }, {
                    name: '昵称',
                    code: 'realName',
                  }]}
                  onSearch={this.handleSearch.bind(this)}
                />
                {/* <Search
                  placeholder={Choerodon.getMessage('按名称或角色过滤', 'Filter by Name or Role')}
                  style={{ width: 200 }}
                  onSearch={this.handleSearch.bind(this)}
                /> */}
                <span style={{ marginLeft: 15, fontSize: 12, marginRight: 15 }}>
                  {Choerodon.getMessage('查看方式', 'look Method')}
                </span>
                <Select
                  data={[{
                    code: 'user',
                    name: '成员',
                  }, {
                    code: 'role',
                    name: '角色',
                  }]}
                  type2
                  onChange={this.handleChange}
                />
                {/* <Select
                  defaultValue="user"
                  style={{ width: 120, marginLeft: 16 }}
                  onChange={this.handleChange}
                >
                  <Option value="user">
                    {Choerodon.getMessage('成员', 'member')}
                  </Option>
                  <Option value="role">
                    {Choerodon.getMessage('角色', 'role')}
                  </Option>
                </Select> */}
              </div>
              {/* 如果当前是用户则显示table 不是显示loading */}
              {isUser ?
                (<div>
                  {isLoading ? loadingBar : (
                    <div>
                      <Table
                        size="small"
                        onRowClick={this.clickRow.bind(this)}
                        pagination={false}
                        columns={columns}
                        dataSource={memberDataSource}
                        rowSelection={rowSelection}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <RePagination
                          current={this.state.currentPage}
                          total={total}
                          onChange={this.onChangePagination.bind(this)}
                        />
                      </div>
                    </div>
                  )}
                </div>)
                :
                (<div style={{ margin: 20 }}>
                  {isLoading ? loadingBar : this.listRoleMember()
                  }
                </div>)
              }
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(GlobalMemberRole);
