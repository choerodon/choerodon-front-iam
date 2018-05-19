/**
 * Created by lty on 2017/6/27.
 */

import React, { Component } from 'react';
import { Table, Collapse, Tooltip, Icon } from 'antd';
import RoleCas from './RoleCas';

const Panel = Collapse.Panel;

class RolePanels extends Component {
  // constructor(props, context) {
  //   super(props, context);
  // }
  render() {
    const {
      role,
      handleDeleteOpen, treeData, handleClose,
      handleSubmit, roleKeys, onClicks,
    } = this.props;
    const columns = [{
      title: Choerodon.getMessage('类型', 'type'),
      dataIndex: 'memberType',
      key: 'memberType',
      render: (text => (
        <div>
          <Tooltip
            placement="right"
            title={text === 'user' ? Choerodon.getMessage('用户', 'user') : Choerodon.getMessage('组织', 'organization')}
          >
            {text === 'user' ? <Icon type="user" /> : <Icon type="database" />}
          </Tooltip>
        </div>
      )),
    }, {
      title: Choerodon.getMessage('成员', 'member'),
      dataIndex: 'userName',
      key: 'userName',
      render: (item, record) => (
        <div>
          <p>{record.userName}</p>
          <p>{record.userEmail}</p>
        </div>
      ),
    }, {
      title: Choerodon.getMessage('角色', 'role'),
      dataIndex: 'roles',
      key: 'roles',
      render: (text, record) => (
        <RoleCas
          treeData={treeData}
          handleClose={handleClose}
          defaultSelectKey={roleKeys}
          handleSubmit={handleSubmit}
          showClose="true"
          inName={Choerodon.getMessage('分配', 'distribute')}
          text={text}
          record={record}
          onClicks={onClicks}
        />
      ),
    }, {
      title: Choerodon.getMessage('操作', 'operation'),
      className: 'operateIcons',
      key: 'action',
      render: (text, record) => (
        <div>
          <Tooltip
            title={Choerodon.getMessage('删除', 'delete')}
            placement="bottom"
            getTooltipContainer={that => that}
          >
            <a
              role="none"
              className="operateIcon small-tooltip"
              onClick={handleDeleteOpen.bind(this, record)}
            >
              <Icon type="delete" />
            </a>
          </Tooltip>
        </div>
      ),
    }];


    const customPanelStyle = {
      background: '#FDFDFD',
      borderRadius: 3,
      marginBottom: 24,
      paddingTop: 0,
      paddingBottom: 12,
      border: -1,
    };
    const panelHead = role.roleName ? (
      <div>
        <p style={{
          height: 8,
          marginBottom: 8,
        }}
        >{role.roleName.split('.')[1] + Choerodon.getMessage('（', '(') + role.member.length + Choerodon.getMessage(' 个成员）', ' Members)')}</p>
        <p style={{ height: 8 }}>{role.roleDescription}</p>
      </div>
    ) : null;
    return (
      <Collapse style={{ border: 0 }}>
        <Panel
          header={panelHead}
          key={role.roleId}
          style={customPanelStyle}
        >
          <Table
            pagination={false}
            columns={columns}
            dataSource={role.member}
            size="small"
            rowKey={
              (record) => {
                const rec = record;
                return rec.memberId;
              }}
          />
        </Panel>
      </Collapse>
    );
  }
}

export default RolePanels;
