import React, { Component } from 'react';
import { Button, Form, Modal, Table, Tooltip, Radio, Select, Input } from 'choerodon-ui';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import './Application.scss';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const FormItem = Form.Item;
const intlPrefix = 'organization.application';
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const isNum = /^\d+$/;

@Form.create({})
@withRouter
@injectIntl
@inject('AppState')
@observer
export default class Application extends Component {
  componentDidMount() {
    this.refresh();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { ApplicationStore: { operation, editData }, ApplicationStore } = this.props;
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;
    const orgName = menuType.name;
    let data;
    if (operation === 'create') {
      const { validateFields } = this.props.form;
      validateFields((err, { applicationCategory, applicationType, code, name, projectId }) => {
        if (!err) {
          data = {
            applicationCategory,
            applicationType,
            code,
            name: name.trim(),
            projectId,
            enabled: true,
          };
          ApplicationStore.setSubmitting(true);
          ApplicationStore.createApplication(data)
            .then((value) => {
              ApplicationStore.setSubmitting(false);
              if (value) {
                this.props.history.push(`/iam/application?type=organization&id=${orgId}&name=${encodeURIComponent(orgName)}`);
                Choerodon.prompt(this.props.intl.formatMessage({ id: 'create.success' }));
                this.handleTabClose();
                ApplicationStore.loadData();
              }
            }).catch((error) => {
              this.handleTabClose();
              Choerodon.handleResponseError(error);
            });
        }
      });
    } else if (operation === 'edit') {
      const { validateFields } = this.props.form;
      validateFields((err, validated) => {
        if (!err) {
          if (this.shouldShowProjectsSelect()) {
            data = {
              ...editData,
              name: validated.name.trim(),
              projectId: validated.projectId || null,
            };
          } else {
            data = {
              ...editData,
              name: validated.name.trim(),
            };
          }
          ApplicationStore.updateApplication(data, editData.id)
            .then((value) => {
              ApplicationStore.setSubmitting(false);
              if (value) {
                this.props.history.push(`/iam/application?type=organization&id=${orgId}&name=${encodeURIComponent(orgName)}`);
                Choerodon.prompt(this.props.intl.formatMessage({ id: 'save.success' }));
                this.handleTabClose();
                ApplicationStore.loadData();
              }
            }).catch((error) => {
              this.handleTabClose();
              Choerodon.handleResponseError(error);
            });
        }
      });
    }
  };

  refresh = () => {
    const { ApplicationStore } = this.props;
    ApplicationStore.refresh();
  }

  renderSideTitle() {
    switch (this.props.ApplicationStore.operation) {
      case 'create': return <FormattedMessage id={`${intlPrefix}.create`} />;
      case 'edit': return <FormattedMessage id={`${intlPrefix}.modify`} />;
      default: return <FormattedMessage id={`${intlPrefix}.create`} />;
    }
  }

  /**
   * 校验应用编码唯一性
   * @param value 应用编码
   * @param callback 回调函数
   */
  checkCode = (rule, value, callback) => {
    const { ApplicationStore, intl, ApplicationStore: { editData } } = this.props;
    const params = { code: value };
    if (editData && editData.code === value) callback();
    if (ApplicationStore.operation === 'edit') callback();
    ApplicationStore.checkApplicationCode(params)
      .then((mes) => {
        if (mes.failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.code.exist.msg` }));
        } else {
          callback();
        }
      }).catch((err) => {
        callback('校验超时');
        Choerodon.handleResponseError(err);
      });
  };

  /**
   * 校验应用名称唯一性
   * @param value 应用编码
   * @param callback 回调函数
   */
  checkName = (rule, value, callback) => {
    const { ApplicationStore, intl, ApplicationStore: { editData } } = this.props;
    const params = { name: value };
    if (editData && editData.name === value) callback();
    ApplicationStore.checkApplicationCode(params)
      .then((mes) => {
        if (mes.failed) {
          callback(intl.formatMessage({ id: `${intlPrefix}.name.exist.msg` }));
        } else {
          callback();
        }
      }).catch((err) => {
        callback('校验超时');
        Choerodon.handleResponseError(err);
      });
  };

  getSidebarContentInfo(operation) {
    const { AppState, ApplicationStore } = this.props;
    const menuType = AppState.currentMenuType;
    const orgname = menuType.name;
    switch (operation) {
      case 'create':
        return {
          code: `${intlPrefix}.create`,
          values: {
            name: orgname,
          },
        };
      case 'edit':
        return {
          code: `${intlPrefix}.edit`,
          values: {
            name: ApplicationStore.editData && ApplicationStore.editData.name,
          },
        };
      default:
        return {
          code: `${intlPrefix}.create`,
        };
    }
  }

  /**
   * 返回是否显示选择分配项目的选择框
   * @returns {boolean}
   */
  shouldShowProjectsSelect() {
    // 历史遗留问题，从前这里是有处理逻辑的，现在无论何时都显示
    return true;
  }

  renderSidebarContent() {
    const { intl, ApplicationStore, form } = this.props;
    const { getFieldDecorator } = form;
    const { operation, projectData, editData, submitting } = ApplicationStore;
    const inputWidth = 512;
    const contentInfo = this.getSidebarContentInfo(operation);
    return (
      <Content
        {...contentInfo}
      >
        {operation === 'edit' && editData &&
        <p>应用类别：{intl.formatMessage({ id: `${intlPrefix}.category.${editData.applicationCategory.toLowerCase()}` })}</p>
        }
        <Form layout="vertical" className="rightForm" style={{ width: 512 }}>
          {operation === 'create' && !editData &&
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('applicationCategory', {
              initialValue: 'application',
            })(
              <RadioGroup label={<FormattedMessage id={`${intlPrefix}.category`} />} className="c7n-iam-application-radiogroup">
                {
                  ['application', 'combination-application'].map(value => <Radio value={value} key={value}>{intl.formatMessage({ id: `${intlPrefix}.category.${value.toLowerCase()}` })}</Radio>)
                }
              </RadioGroup>,
            )}
          </FormItem>
          }
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('applicationType', {
              initialValue: editData ? editData.applicationType : 'development-application',
            })(
              <Select disabled={operation === 'edit'} getPopupContainer={that => that} label={<FormattedMessage id={`${intlPrefix}.type`} />} className="c7n-iam-application-radiogroup">
                {
                  ['development-application', 'test-application'].map(value => <Option value={value} key={value}>{intl.formatMessage({ id: `${intlPrefix}.type.${value.toLowerCase()}` })}</Option>)
                }
              </Select>,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('code', {
              initialValue: editData ? editData.code : null,
              rules: [{
                required: true,
                whitespace: true,
                message: intl.formatMessage({ id: `${intlPrefix}.code.require.msg` }),
              }, {
                pattern: /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
                message: intl.formatMessage({ id: `${intlPrefix}.code.format.msg` }),
              }, {
                validator: this.checkCode,
              }],
              validateTrigger: 'onBlur',
              validateFirst: true,
            })(
              <Input
                disabled={operation === 'edit'}
                autoComplete="off"
                label={<FormattedMessage id={`${intlPrefix}.code`} />}
                style={{ width: inputWidth }}
                ref={(e) => { this.createFocusInput = e; }}
                maxLength={14}
                showLengthInfo={false}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              initialValue: editData ? editData.name : null,
              rules: [{
                required: true,
                message: intl.formatMessage({ id: `${intlPrefix}.name.require.msg` }),
              }, {
                pattern: /^[^\s]*$/,
                message: intl.formatMessage({ id: `${intlPrefix}.whitespace.msg` }),
              }, {
                validator: this.checkName,
              }],
              validateTrigger: 'onBlur',
              validateFirst: true,
            })(
              <Input
                autoComplete="off"
                label={<FormattedMessage id={`${intlPrefix}.name`} />}
                style={{ width: inputWidth }}
                ref={(e) => { this.editFocusInput = e; }}
                maxLength={14}
                showLengthInfo={false}
              />,
            )}
          </FormItem>
          {this.shouldShowProjectsSelect() && <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('projectId', {
              initialValue: editData && editData.projectId !== 0 && editData.projectId,
            })(
              <Select
                label={<FormattedMessage id={`${intlPrefix}.assignment`} />}
                className="c7n-iam-application-radiogroup"
                getPopupContainer={that => that}
                filterOption={(input, option) => {
                  const childNode = option.props.children;
                  if (childNode && React.isValidElement(childNode)) {
                    return childNode.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  }
                  return false;
                }}
                disabled={(editData && !!editData.projectId)}
                filter
              >
                {
                  projectData.map(({ id, name, code }) => <Option value={id} key={id} title={name}>
                    <Tooltip title={code} placement="right" align={{ offset: [20, 0] }}>
                      <span style={{ display: 'inline-block', width: '100%' }}>{name}</span>
                    </Tooltip>
                  </Option>)
                }
              </Select>,
            )}
          </FormItem>}
        </Form>
        <Button loading={submitting} onClick={this.handleSubmit} type="primary" funcType="raised"><FormattedMessage id={operation === 'create' ? 'create' : 'save'} /></Button>
      </Content>
    );
  }

  render() {
    const { AppState } = this.props;
    const menuType = AppState.currentMenuType;
    const orgId = menuType.id;

    return (
      <Page
        service={[
          'iam-service.application.pagingQuery',
          'iam-service.application.create',
          'iam-service.application.types',
          'iam-service.application.update',
          'iam-service.application.disable',
          'iam-service.application.enabled',
        ]}
      >
        <Header
          title={<FormattedMessage id={`${intlPrefix}.header.title`} />}
          backPath={`/iam/application?type=organization&id=${orgId}&name=${encodeURIComponent(menuType.name)}&organizationId=${orgId}`}
        />
        {this.renderSidebarContent()}
      </Page>
    );
  }
}
