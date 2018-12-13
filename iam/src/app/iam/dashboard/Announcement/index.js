import React, { Component } from 'react';
import { Modal, Timeline, Button } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import AnnouncementInfoStore from '../../stores/user/announcement-info';
import './index.scss';

const Item = Timeline.Item;

@withRouter
@inject('AppState', 'HeaderStore')
@observer
export default class Announcement extends Component {
  componentWillMount() {
    AnnouncementInfoStore.loadData();
  }

  handleCancel = () => {
    AnnouncementInfoStore.closeDetail();
  };

  render() {
    const { visible, title, content, announcementData } = AnnouncementInfoStore;
    return (
      <div className="c7n-iam-dashboard-announcement">
        {announcementData.length === 0 ? (
          <React.Fragment>
            <div className="c7n-iam-dashboard-announcement-empty" />
            <div className="c7n-iam-dashboard-announcement-empty-text">暂无公告</div>
          </React.Fragment>
        ) : (
          <Timeline className="c7n-iam-dashboard-announcement-timeline">
            {announcementData.map(data => (
              <Item className="item">
                <div className="time"><p>{data.sendDate.split(' ')[0]}</p><p>{data.sendDate.split(' ')[1]}</p></div>
                <div className="title"><a onClick={() => AnnouncementInfoStore.showDetail(data)}>{data.title}</a></div>
              </Item>
            ))}
            <Item>null</Item>
          </Timeline>
        )}
        <Modal
          visible={visible}
          width={800}
          title={title}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>返回</Button>,
          ]}
        >
          <div
            className="c7n-iam-dashboard-announcement-detail-content"
            dangerouslySetInnerHTML={{ __html: `${content}` }}
          />
        </Modal>
      </div>
    );
  }
}
