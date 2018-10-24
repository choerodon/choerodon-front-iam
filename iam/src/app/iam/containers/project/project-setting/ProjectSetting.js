
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Form, Input, Modal } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import './ProjectSetting.scss';
import ProjectSettingStore from '../../../stores/project/project-setting/ProjectSettingStore';
import '../../../common/ConfirmModal.scss';

const { HeaderStore } = stores;
const FormItem = Form.Item;
const intlPrefix = 'project.info';
const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class ProjectSetting extends Component {
  state = {
    stopping: false,
    submitting: false,
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
    form.validateFields((err, value, modify) => {
      if (!err) {
        if (!modify) {
          Choerodon.prompt(this.props.intl.formatMessage({ id: 'save.success' }));
          return;
        }
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
            Choerodon.prompt(this.props.intl.formatMessage({ id: 'save.success' }));
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

  handleEnabled = (name) => {
    const { AppState, intl } = this.props;
    const userId = AppState.getUserId;
    this.setState({ stopping: true });
    Modal.confirm({
      className: 'c7n-iam-confirm-modal',
      title: intl.formatMessage({ id: `${intlPrefix}.disable.title` }),
      content: intl.formatMessage({ id: `${intlPrefix}.disable.content` }, { name }),
      onOk: () => ProjectSettingStore.disableProject(AppState.currentMenuType.id)
        .then((data) => {
          this.setState({
            stopping: false,
          });
          Choerodon.prompt(this.props.intl.formatMessage({ id: 'disable.success' }));
          ProjectSettingStore.setProjectInfo(data);
          HeaderStore.updateProject(data);
          this.props.history.push('/');
          HeaderStore.axiosGetOrgAndPro(sessionStorage.userId || userId).then((org) => {
            org[0].forEach((value) => {
              value.type = ORGANIZATION_TYPE;
            });
            org[1].forEach((value) => {
              value.type = PROJECT_TYPE;
            });
            HeaderStore.setProData(org[0]);
            HeaderStore.setProData(org[1]);
          });
        })
        .catch((error) => {
          this.setState({
            stopping: false,
          });
          Choerodon.handleResponseError(error);
        }),
    });
  }

  cancelValue = () => {
    const { resetFields } = this.props.form;
    resetFields('name');
  };

  render() {
    const { submitting } = this.state;
    const { intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { enabled, name, code } = ProjectSettingStore.getProjectInfo;
    return (
      <Page
        service={[
          'iam-service.project.query',
          'iam-service.project.update',
          'iam-service.project.disableProject',
          'iam-service.project.list',
        ]}
      >
        <Header title={<FormattedMessage id={`${intlPrefix}.header.title`} />}>
          <Permission service={['iam-service.project.disableProject']}>
            <div>
              <Button
                icon="remove_circle_outline"
                onClick={this.handleEnabled.bind(this, name)}
                disabled={!enabled}
              >
                <FormattedMessage id="disable" />
              </Button>
            </div>
          </Permission>
        </Header>
        <Content
          code={enabled ? intlPrefix : `${intlPrefix}.disabled`}
          values={{ name: enabled ? name : code }}
        >
          <div className="proSettingStyle">
            <Form onSubmit={this.handleSave.bind(this)}>
              <FormItem>
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: intl.formatMessage({ id: 'project.info.namerequiredmsg' }),
                  }],
                  initialValue: name,
                })(
                  <Input autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.name`} />} disabled={!enabled} style={{ width: 512 }} />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('code', {
                  initialValue: code,
                })(
                  <Input autoComplete="off" label={<FormattedMessage id={`${intlPrefix}.code`} />} disabled style={{ width: 512 }} />,
                )}
              </FormItem>
              <div className="divider" />
              <Permission service={['iam-service.project.update']}>
                <div className="btnGroup">
                  <Button
                    funcType="raised"
                    htmlType="submit"
                    type="primary"
                    loading={submitting}
                    disabled={!enabled}
                  ><FormattedMessage id="save" /></Button>
                  <Button
                    funcType="raised"
                    onClick={this.cancelValue}
                    disabled={!enabled}
                  >
                    <FormattedMessage id="cancel" />
                  </Button>
                </div>
              </Permission>
            </Form>
          </div>
        </Content>
      </Page>
    );
  }
}
