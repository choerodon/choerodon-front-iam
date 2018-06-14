/*eslint-disable*/
import React, { Component } from 'react';
import { Form, Select } from 'choerodon-ui';
import { axios } from 'choerodon-front-boot';
import { injectIntl } from 'react-intl';
import classnames from 'classnames';
import './MemberLabel.scss';

const FormItem = Form.Item;
const FormItemNumLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};

class MemberLabel extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      validedMembers: {},
    };
  }

  saveSelectRef = (node) => {
    if (node) {
      this.rcSelect = node.rcSelect;
    }
  };

  searchMemberId(loginName) {
    return axios.get(`/iam/v1/users?login_name=${loginName}`);
  }

  validateMember = (rule, value, callback) => {
    const { intl } = this.props;
    if (value && value.length) {
      const { validedMembers } = this.state;
      let errorMsg;
      Promise.all(value.map((item) => {
        if (item in validedMembers) {
          return Promise.resolve(validedMembers[item]);
        } else {
          return new Promise((resolve) => {
            this.searchMemberId(item)
              .then(({ failed, enabled }) => {
                let success = true;
                if (enabled === false) {
                  errorMsg = intl.formatMessage({id: 'memberlabel.member.disabled.msg'});
                  success = false;
                } else if (failed) {
                  errorMsg = intl.formatMessage({id: 'memberlabel.member.notexist.msg'});
                  success = false;
                }
                resolve(success);
              })
              .catch((error) => {
                errorMsg = error;
                resolve(false);
              });
          }).then((valid) => {
            validedMembers[item] = valid;
            return valid;
          });
        }
      })).then(all => callback(
        all.every(item => item) ? undefined :
          errorMsg,
      ));
    } else {
      callback(intl.formatMessage({id: 'memberlabel.member.require.msg'}));
    }
  };

  setMembersInSelect(member) {
    const { getFieldValue, setFieldsValue, validateFields } = this.props.form;
    const members = getFieldValue('member') || [];
    if (members.indexOf(member) === -1) {
      members.push(member);
      setFieldsValue({
        'member': members,
      });
      validateFields(['member']);
    }
    if (this.rcSelect) {
      this.rcSelect.setState({
        inputValue: '',
      });
    }
  }

  handleInputKeyDown = (e) => {
    const { value } = e.target;
    if (e.keyCode === 13 && !e.isDefaultPrevented() && value) {
      this.setMembersInSelect(value);
    }
  };

  handeChoiceRender = (liNode, value) => {
    const { validedMembers } = this.state;
    return React.cloneElement(liNode, {
      className: classnames(liNode.props.className, {
        'choice-has-error': value in validedMembers && !validedMembers[value],
      }),
    });
  };

  render() {
    const { style, className, form, value, label } = this.props;
    const { getFieldDecorator } = form;
    return (
      <FormItem
        {...FormItemNumLayout}
        className={className}
        style={style}
      >
        {getFieldDecorator('member', {
          rules: [{
            required: true,
            validator: this.validateMember,
          }],
          validateTrigger: 'onChange',
          initialValue: value,
        })(
          <Select
            mode="tags"
            ref={this.saveSelectRef}
            style={{ width: 512 }}
            filterOption={false}
            label={label}
            onInputKeyDown={this.handleInputKeyDown}
            notFoundContent={false}
            showNotFindSelectedItem={false}
            showNotFindInputItem={false}
            choiceRender={this.handeChoiceRender}
            allowClear
          />,
        )}
      </FormItem>);
  }
}

export default injectIntl(MemberLabel);
