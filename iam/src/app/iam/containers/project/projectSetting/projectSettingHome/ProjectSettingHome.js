/*eslint-disable*/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Input, Modal } from 'choerodon-ui';
import Page, { Content, Header } from 'Page';
import Permission from 'PerComponent';
import HeaderStore from '@/stores/HeaderStore';
import './ProjectSettingHome.scss';
import ProjectSettingStore from '../../../../stores/project/projectSetting/ProjectSettingStore';

const FormItem = Form.Item;

@inject('AppState')
@observer
class ProjectSettingHome extends Component {
  state = {
    stopping: false,
    submitting: false,
    isShowModal: false,
  };

  componentWillMount() {
    const { AppState } = this.props;
    const id = AppState.currentMenuType.id;
    ProjectSettingStore.axiosGetProjectInfo(id).then((data) => {
      ProjectSettingStore.setProjectInfo(data);
    }).catch(Choerodon.handleResponseError);
  }

  handleSave(e) {
    e.preventDefault();
    const { form, location, history } = this.props;
    form.validateFields((err, value) => {
      if (!err) {
        const { id, organizationId, objectVersionNumber } = ProjectSettingStore.getProjectInfo;
        const body = {
          id,
          organizationId,
          objectVersionNumber,
          ...value,
        };
        this.setState({ submitting: true });
        ProjectSettingStore.axiosSaveProjectInfo(body)
          .then((data) => {
            this.setState({ submitting: false });
            Choerodon.prompt('保存成功');
            ProjectSettingStore.setProjectInfo(data);
            HeaderStore.updateProject(data);
            history.replace(`${location.pathname}?type=project&id=${id}&name=${encodeURIComponent(data.name)}&organizationId=${organizationId}`);
          })
          .catch((error) => {
            this.setState({ submitting: false });
            Choerodon.handleResponseError(error);
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
  };

  /*
   * 确认停用
   * */
  handleOk = () => {
    const { AppState } = this.props;
    this.setState({ stopping: true });
    ProjectSettingStore.disableProject(AppState.currentMenuType.id)
      .then((data) => {
        this.setState({
          stopping: false,
          isShowModal: false,
        });
        Choerodon.prompt('停用成功');
        ProjectSettingStore.setProjectInfo(data);
        HeaderStore.updateProject(data);
        this.props.history.push('/');
      })
      .catch((error) => {
        this.setState({
          stopping: false,
          isShowModal: false,
        });
        Choerodon.handleResponseError(error);
      });
  };

  /*
   * 取消停用
   * */
  handleCancel = () => {
    this.setState({
      isShowModal: false,
    });
  };

  cancelValue = () => {
    const { resetFields } = this.props.form;
    resetFields('name');
  };

  render() {
    const { stopping, submitting } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { enabled, name, code } = ProjectSettingStore.getProjectInfo;
    return (
      <Permission
        service={['iam-service.project.query']}
      >
        <Page>
          <Header title="项目信息">
            <Permission service={['iam-service.project.disableProject']}>
              <div>
                <Button
                  icon="remove_circle_outline"
                  onClick={this.showModal}
                  disabled={!enabled}
                >
                  停用
                </Button>
                <Modal
                  title="停用项目"
                  visible={this.state.isShowModal}
                  closable={false}
                  footer={
                    [
                      <Button
                        key="cancel"
                        funcType="raised"
                        onClick={this.handleCancel}
                        disabled={stopping}
                      >取消</Button>,
                      <Button
                        key="ok"
                        funcType="raised"
                        type="primary"
                        onClick={this.handleOk}
                        loading={stopping}
                      >确定</Button>,
                    ]
                  }
                >
                  <p>确定要停用项目“{name}”吗？停用后，您和项目下其他成员将无法进入此项目。</p>
                </Modal>
              </div>
            </Permission>
          </Header>
          <Content
            title={enabled ? `对项目“${name}”进行项目设置` : `项目“${code}”已被停用`}
            description="您可以在此修改项目名称、停用项目。"
            link="http://choerodon.io/zh/docs/user-guide/system-configuration/project/pro_info/"
          >
            <div className="proSettingStyle">
              <Form onSubmit={this.handleSave.bind(this)}>
                <FormItem>
                  {getFieldDecorator('name', {
                    initialValue: name,
                  })(
                    <Input label="项目名" disabled={!enabled} style={{ width: 512 }} />,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('code', {
                    initialValue: code,
                  })(
                    <Input label="项目编码" disabled style={{ width: 512 }} />,
                  )}
                </FormItem>
                <Permission service={['iam-service.project.update']}>
                  <div className="btnGroup">
                    <Button
                      funcType="raised"
                      htmlType="submit"
                      type="primary"
                      loading={submitting}
                      disabled={!enabled}
                    >{Choerodon.languageChange('save')}</Button>
                    <Button
                      funcType="raised"
                      onClick={this.cancelValue}
                      disabled={!enabled}
                    >
                      {Choerodon.languageChange('cancel')}
                    </Button>
                  </div>
                </Permission>
              </Form>
            </div>
          </Content>
        </Page>
      </Permission>
    );
  }
}

export default Form.create({})(withRouter(ProjectSettingHome));

