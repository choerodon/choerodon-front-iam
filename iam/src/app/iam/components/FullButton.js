import React from 'react';
import { Button } from 'antd';
// import PropTypes from 'prop-types';
// import screenfull from 'screenfull';
import { observer, inject } from 'mobx-react';
import { PageHeadStyle } from 'PageHeader';

@inject('AppState')
@observer
class FullButtion extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    const { AppState } = this.props;
    const button = AppState.fullscreen ? (<Button
      className="header-btn headRightBtn"
      ghost
      onClick={Choerodon.fullscreen}
      style={PageHeadStyle.leftBtn2}
      icon="reload"
    >{Choerodon.getMessage('全屏', 'FullScreen')} </Button>) : (<Button
      className="header-btn headRightBtn"
      ghost
      onClick={Choerodon.fullscreen}
      style={PageHeadStyle.leftBtn2}
      icon="reload"
    >{Choerodon.getMessage('退出全屏全屏', 'exit')} </Button>);
    return (
      <div>
        {button}
      </div>
    );
  }
}

export default FullButtion;
