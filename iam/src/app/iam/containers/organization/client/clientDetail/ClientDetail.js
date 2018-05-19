import React, { Component } from 'react';
import { Form, Select } from 'antd';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import PageHeader from 'PageHeader';
import NewButton from 'NewButton';
import ClientStore from '../../../../stores/organization/client/ClientStore';
import LoadingBar from '../../../../components/loadingBar';
import './ClientDetail.scss';

const FormItem = Form.Item;
const Option = Select.Option;

@inject('AppState')
@observer
class ClientDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      client: '',
    };
  }

  componentWillMount() {
    this.props.onRef(this);
    ClientStore.getClientById(this.props.organizationId, this.props.id)
      .subscribe((data) => {
        ClientStore.setClientById(data);
      });
  }

  /**
   * 返回客户端主页
   */
  handleReset = () => {
    this.linkToChange('/iam/client');
  };

  /**
   * 跳转至编辑页面
   */
  handleEdit = () => {
    const { id } = this.state;
    this.linkToChange(`/iam/client/edit/${id}`);
  };

  /**
   * 跳转函数
   * @param url
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  render() {
    const client = ClientStore.getClient;

    const mainContent = client ? (<div className="client-detail" >
      <div className="detail-items">
        <p className="detail-title">
          {Choerodon.languageChange('client.id')}
        </p>
        <p className="detail-content">
          {client.id}
        </p>
      </div>
      <div className="detail-items">
        <p className="detailTitle">
          {Choerodon.languageChange('client.name')}
        </p>
        <p className="detailContent">
          {client.name}
        </p>
      </div>
      <div className="detail-items">
        <p className="detailTitle">
          {Choerodon.languageChange('client.secret')}
        </p>
        <p className="detailContent">
          {client.secret}
        </p>
      </div>
      <div className="detail-items">
        <p className="detailTitle">
          {Choerodon.languageChange('client.authorizedGrantTypes')}
        </p>
        <div className="detail-content">
          <Select
            disabled
            mode="multiple"
            className="detail-input"
            value={client.authorizedGrantTypes.split(',')}
          >
            <Option value="password">password</Option>
            <Option value="implicit">implicit</Option>
            <Option value="clientCredentials">clientCredentials</Option>
            <Option value="authorizationCode">authorizationCode</Option>
            <Option value="refreshToken">refreshToken</Option>
          </Select>
        </div>
      </div>
      <div className="detail-items">
        <p className="detail-title">
          {Choerodon.languageChange('client.accessTokenValidity')}
        </p>
        <p className="detail-content">
          {client.accessTokenValidity ? client.accessTokenValidity : 'null'}
        </p>
      </div>
      <div className="detail-items">
        <p className="detail-title">
          {Choerodon.languageChange('client.refreshTokenValidity')}
        </p>
        <p className="detail-content">
          {client.refreshTokenValidity ? client.refreshTokenValidity : 'null'}
        </p>
      </div>
      <div className="detail-items">
        <p className="detail-title">
          {Choerodon.languageChange('client.webServerRedirectUri')}
        </p>
        <p className="detail-content">
          {client.webServerRedirectUri ? client.webServerRedirectUri : 'null'}
        </p>
      </div>
      <div className="detail-items">
        <p className="detail-title">
          {Choerodon.languageChange('client.additionalInformation')}
        </p>
        <p className="detail-content">
          {client.additionalInformation ? client.additionalInformation : 'null'}
        </p>
      </div>
      {/* <div>
        <div className="submit-wrap">
          <NewButton
            onClick={this.handleEdit}
            loading={this.state.submitting}
            className="login-form-button"
            clicked={false}
            text={Choerodon.languageChange('edit')}
          />
          <NewButton
            text={Choerodon.languageChange('cancel')}
            htmltype="reset"
            onClick={this.handleReset}
            className="color2"
          />
        </div>
      </div> */}
    </div>) : <LoadingBar />;

    return (
      <div>
        <div className="UnderPageHeadStyle">
          {mainContent}
        </div>
      </div>
    );
  }
}

export default Form.create({})(withRouter(ClientDetail));
