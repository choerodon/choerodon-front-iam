/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, Form, Input, Modal } from 'choerodon-ui';
import Page, { Header, Content } from 'Page';
import _ from 'lodash';
import Permission from 'PerComponent';
import HeaderStore from '@/stores/HeaderStore';
import './ProjectSettingHome.scss';
import ProjectSettingStore from '../../../../stores/project/projectSetting/ProjectSettingStore';

const FormItem = Form.Item;
const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

@inject('AppState')
@observer
class ProjectSettingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowModal: false,
    };
  }
  componentWillMount() {
    const { AppState } = this.props;
    const id = AppState.currentMenuType.id;
    ProjectSettingStore.axiosGetProjectInfo(id).then((data) => {
      ProjectSettingStore.setProjectInfo(data);
    }).catch((err) => {
      window.console.log(err);
    });
  }

  handleSave(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        const menuType = this.props.AppState.currentMenuType;
        const newValue = _.clone(value);
        newValue.id = ProjectSettingStore.getProjectInfo.id;
        newValue.organizationId = ProjectSettingStore.getProjectInfo.organizationId;
        newValue.objectVersionNumber = ProjectSettingStore.getProjectInfo.objectVersionNumber;
        ProjectSettingStore.axiosSaveProjectInfo(menuType.organizationId, menuType.id, newValue)
          .then((data) => {
            Choerodon.prompt('保存成功');
            ProjectSettingStore.setProjectInfo(data);
            const { AppState } = this.props;
            data.type = 'project';
            AppState.changeMenuType(data);
            HeaderStore.updateProject(data);
            const userId = AppState.getUserId;
            HeaderStore.axiosGetOrgAndPro(userId).then((org1) => {
              const org = org1;
              _.forEach(org[0], (item, index) => {
                org[0][index].type = ORGANIZATION_TYPE;
              });
              _.forEach(org[1], (item1, index1) => {
                org[1][index1].type = PROJECT_TYPE;
              });
              HeaderStore.setOrgData(org[0]);
              HeaderStore.setProData(org[1]);
            });
          }).catch((error) => {
            Choerodon.prompt(`${error}`);
          });
      }
    });
  }

  /*
  * 显示模态框
  * */
  showModal = () => {
    this.setState({
      isShowModal: true,
    });
  }

  /*
  * 确认停用
  * */
  handleOk = (projectInfo) => {
    const { AppState } = this.props;
    const userId = AppState.getUserId;
    if (projectInfo.enabled) {
      ProjectSettingStore.disableProject(
        AppState.currentMenuType.id).then((data) => {
        Choerodon.prompt('停用成功');
        ProjectSettingStore.setProjectInfo(data);
        HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
          org[0].map(value => {
            value.type = ORGANIZATION_TYPE;
          })
          org[1].map(value => {
            value.type = PROJECT_TYPE;
          })
          HeaderStore.setProData(org[0]);
          HeaderStore.setProData(org[1]);
        })
        this.props.history.push("/");
      }).catch((error) => {
        window.console.log(error);
      });
    }
  }

  /*
  * 取消停用
  * */
  handleCancel = () => {
    this.setState({
      isShowModal: false,
    });
  }

  cancelValue = () => {
    const { resetFields } = this.props.form;
    resetFields('name');
  }

  render() {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const menuTypeName = menuType.name;
    const proId = menuType.id;
    const orgId = menuType.organizationId;
    const type = menuType.type;
    const { getFieldDecorator } = this.props.form;
    const projectInfo = ProjectSettingStore.getProjectInfo;
    return (
      <Page>
        <Permission
          service={['iam-service.project.query']}
          organizationId={AppState.currentMenuType.organizationId}
          type={AppState.currentMenuType.type}
          projectId={AppState.currentMenuType.id}
        >
          <Header title="项目信息">
            {projectInfo.enabled ? (
              <div>
                <Button
                  icon="remove_circle_outline"
                  onClick={this.showModal}
                >
                  停用
                </Button>
                <Modal
                  title="停用项目"
                  visible={this.state.isShowModal}
                  onCancel={this.handleCancel}
                  onOk={this.handleOk.bind(this, projectInfo)}
                >
                  <p>确定要停用项目“{JSON.parse(sessionStorage.menType).name}”吗？停用后，您和项目下其他成员将无法进入此项目。</p>
                </Modal>
              </div>
            ) : (
              <Permission service={['iam-service.project.disableProject']} organizationId={orgId} type={type} projectId={proId}>
                <Button
                  icon="remove_circle_outline"
                  disabled
                >
                  停用
                </Button>
              </Permission>
            )}
          </Header>
        </Permission>
        <Content
          title={projectInfo.enabled ? `对项目“${JSON.parse(sessionStorage.menType).name}”进行项目设置` : `项目“${projectInfo.code}”已被停用`}
          description="您可以在此修改项目名称、停用项目。"
          link="http://choerodon.io/zh/docs/user-guide/system-configuration/project/pro_info/"
        >
          <div className="proSettingStyle">
            <Form onSubmit={this.handleSave.bind(this)}>
              <FormItem>
                {getFieldDecorator('name', {
                  initialValue: menuTypeName,
                })(
                  <Input label="项目名" disabled={!projectInfo.enabled} style={{ width: 512 }} />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('code', {
                  initialValue: JSON.stringify(projectInfo) !== '{}' ? projectInfo.code : '',
                })(
                  <Input label="项目编码" disabled style={{ width: 512 }} />,
                )}
              </FormItem>
              {projectInfo.enabled ? (
                <Permission service={['iam-service.project.update']} type={type} organizationId={orgId} projectId={proId}>
                  <div className="btnGroup">
                    <Button
                      funcType="raised"
                      htmlType="submit"
                      type="primary"
                    >{Choerodon.languageChange('save')}</Button>
                    <Button
                      funcType="raised"
                      className={'cancel'}
                      onClick={this.cancelValue}
                    >
                      {Choerodon.languageChange('cancel')}
                    </Button>
                  </div>
                </Permission>
              ) : (
                <Permission service={['iam-service.project.update']} type={type} organizationId={orgId} projectId={proId}>
                  <div className="btnGroup">
                    <Button
                      disabled
                      funcType="raised"
                      type="primary"
                    >{Choerodon.languageChange('save')}</Button>
                    <Button funcType="raised" disabled>{Choerodon.languageChange('cancel')}</Button>
                  </div>
                </Permission>
              )}
            </Form>
          </div>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(ProjectSettingHome);

