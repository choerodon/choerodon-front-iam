/**
 * Created by jaywoods on 2017/6/23.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AutoRouter from 'AutoRouter';
import CommonMenu from 'CommonMenu';
import IsAuthSpin from 'IsAuthSpin';
import MasterHeader from 'MasterHeader';
import { Tooltip } from 'antd';
import MenuType from 'MenuType';
import UserPreferences from 'UserPreferences';
import RightIconButton from 'RightIconButton';
import LeftIconButton from 'LeftIconButton';

@inject('AppState')
@observer
class Masters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectFlag: true,
      organizationFlag: true,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.ChangeContent.bind(this));
    const el = document.getElementById('autoRouter');
    document.addEventListener('keyup', (e) => {
      if (e.which === 27) {
        el.style.position = 'absolute';
        el.style.width = widths;
      }
    })
  }
  // componentDidUpdate() {
  //   const { history, AppState } = this.props;
  //   if (AppState.getfourTofour) {
  //     if (document.getElementById('autoRouter')) {
  //       if (!_.isNull(document.getElementById('autoRouter').childNodes[0].nodeValue)) {
  //         history.push('/404');
  //         AppState.setfourTofour(false);
  //       }
  //     }
  //   }
  // } 
  componentWillUnmount() {
    window.removeEventListener('resize', this.ChangeContent.bind(this));
  }

  getStyles() {
    const { AppState } = this.props;
    const styles = {
      main: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        zIndex: 100,
      },
      body: {
        flex: '1 1 0%',
        display: 'flex',
        // paddingTop: `${config.DEFAULT_THEME.spacing.desktopKeylineIncrement}px`,
      },
      titleStyle: {
        fontSize: '18px',
      },

      listItem: {
        paddingTop: '0',
        paddingBottom: '0',
        paddingRight: '0',
      },
      iconMenu: {
        width: '280px',
      },
      help: {
        marginTop: '12px',
        fontSize: '12px',
      },
      signOut: {
        marginTop: '12px',
        // minWidth: '65px',
        fontSize: '12px',
      },
      personalInfo: {
        marginTop: '12px',
        marginBottom: '8px',
        textAlign: 'center',
      },
      rsButtonDiv: {
        backgroundColor: '#F5F5F5',
        height: '60px',
      },
      labelStyle: {
        fontSize: '12px',
      },
      cascader: {
        width: '95px',
        position: 'absolute',
        top: '10px',
        right: '100px',
        zIndex: 1100,
      },
      content: {
        flex: '1 1 0',
        order: 2,
        flexDirection: 'column',
        height: window.innerHeight - 48,
        backgroundColor: 'white',
        position: 'absolute',
        left: AppState.getSingle ? '231px' : '280px',
        width: AppState.getSingle ? 'calc(100% - 231px)' : 'calc(100% - 280px)',
      },
      resourceMenu: {
        order: 1,
        zIndex: 3,
        backgroundColor: '#fafafa',
        // height: this.state.height
        // marginLeft:'-20em',
      },
      mainMenu: {
        flex: 'none',
        width: '16em',
        height: '100%',
        position: 'absolute',
        left: '0',
        float: 'left',
        zIndex: '6',
      },
      menuIcon: {
        lineHeight: '22px',
        margin: '10px',
        marginLeft: '-12px',
        fontSize: '15px',
        textAlign: 'center',
      },
      container: {
        display: 'flex',
        // flex: '1 1 auto',
        width: '100%',
        backgroundColor: Choerodon.setTheme('backgroundColor') || 'white',
      },
      menuStyle: {
        height: '100%',
      },
    };

    return styles;
  }
  changeServer = (stateName) => {
    this.setState(stateName);
  }
  ChangeContent() {
    if (this.content) {
      this.content.style.height = `${window.innerHeight - 48}px`;
    }
  }
  Content(instance) {
    this.content = instance;
  }

  render() {
    const { AppState } = this.props;
    let imgUrl;
    const data = AppState.getUserInfo;
    if (data) {
      imgUrl = data.imageUrl;
    }
    const styles = this.getStyles();
    const paperStyle = {
      height: '100%',
    };
    // const leftButtonStyle = {
    //   width: 62,
    //   height: 48,
    //   backgroundColor: '#202633',
    // };
    // const MenuTitleStyle = {
    //   minWidth: 248,
    //   height: 48,
    //   backgroundColor: '#E2E4E6',
    // };
    const MenuChildArray = [
      {
        component: <LeftIconButton history={this.props.history} />,
        style: {
          padding: '0',
        },
      },
      // {
      //   component: <MenuTitle history={this.props.history} single={AppState.getSingle} />,
      //   style: MenuTitleStyle,
      // },
      {
        component: (
          <MenuType
            projectFlag={this.state.projectFlag}
            organizationFlag={this.state.organizationFlag}
          />
        ),
        style: {
          marginLeft: '14px',
          padding: '4px 10px 4px 10px',
        },
        hoverIf: true,
      },
      {
        component: <RightIconButton />,
        style: {
          marginLeft: 'calc(2rem - 10px)',
          marginRight: '-20px',
          padding: '4px 10px 4px 10px',
        },
        hoverIf: true,
      },
      {
        component: <div />,
        style: {
          flex: 1,
          display: 'block',
          visibility: 'hidden',
        },
        hoverIf: false,
      },
      {
        component: <Tooltip placement="bottom" title={'全屏'}>
          <span className="icon-zoom_out_map fullbutton" onClick={Choerodon.fullscreen} />
        </Tooltip>,
        hoverIf: false,
      },
      {
        component: <UserPreferences imgUrl={imgUrl} />,
        style: {
          paddingRight: '2rem',
        },
        hoverIf: false,
      },
    ];
    // const MenuChildArraySingle = _.drop(MenuChildArray);
    return (
      <IsAuthSpin>
        <div style={styles.main}>
          <MasterHeader
            menuChild={MenuChildArray}
          />
          <div style={styles.body}>
            <div style={styles.container}>
              <div id="autoRouter" style={styles.content} ref={this.Content.bind(this)}>
                <AutoRouter />
              </div>
              <div style={paperStyle} id="menu">
                <CommonMenu />
                {/* <MainMenu /> */}
              </div>
              {/* <ResourceMenu id="menuItem" /> */}
            </div>
          </div>
        </div>
      </IsAuthSpin>
    );
  }
}

export default Masters;
