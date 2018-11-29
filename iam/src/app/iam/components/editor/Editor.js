import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Editor.scss';
import { Modal, Input, Button, Form } from 'choerodon-ui';
import { FormattedMessage, injectIntl } from 'react-intl';

const FormItem = Form.Item;
const Align = Quill.import('attributors/style/align');
Align.whitelist = ['right', 'center', 'justify'];
Quill.register(Align, true);

const Size = Quill.import('attributors/style/size');
Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px'];
Quill.register(Size, true);

const Font = Quill.import('attributors/style/font');
Font.whitelist = ['STSong', 'STKaiti', 'STHeiti', 'STFangsong', 'SimSun', 'KaiTi', 'SimHei', 'FangSong', 'Microsoft-YaHei'];
Quill.register(Font, true);

let system;

const CustomToolbar = () => (
  <div id="toolbar">
    <span className="ql-formats">
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
    </span>
    <span className="ql-formats">
      <select className="ql-align" />
      <select className="ql-color" />
    </span>
    <span className="ql-formats">
      <select className="ql-header">
        <option selected />
        <option value="1">H1</option>
        <option value="2">H2</option>
        <option value="3">H3</option>
        <option value="4">H4</option>
        <option value="5">H5</option>
        <option value="6">H6</option>
      </select>
      {
        navigator.platform.indexOf('Mac') > -1 ? (
          <select className="ql-font">
            <option selected />
            <option value="STSong">华文宋体</option>
            <option value="STKaiti">华文楷体</option>
            <option value="STHeiti">华文黑体</option>
            <option value="STFangsong">华文仿宋</option>
          </select>
        ) : (
          <select className="ql-font">
            <option selected />
            <option value="SimSun">宋体</option>
            <option value="KaiTi">楷体</option>
            <option value="SimHei">黑体</option>
            <option value="FangSong">仿宋</option>
            <option value="Microsoft-YaHei">微软雅黑</option>
          </select>
        )
      }
      <select className="ql-size">
        <option value="10px" />
        <option value="12px" />
        <option value="14px" />
        <option value="16px" />
        <option value="18px" />
        <option value="20px" />
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-link" />
      <button className="ql-image" />
      <button className="ql-code-block" />
    </span>
  </div>
);

@Form.create()
@injectIntl
export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.urlFocusInput = React.createRef();
    this.onQuillChange = this.onQuillChange.bind(this);
    this.state = {
      editor: null,
      delta: null,
      originalHtml: null,
      htmlString: null,
      isShowHtmlContainer: false,
      isShowModal: false,
      previewUrl: null,
      loading: false,
      changedHtml: null,
      range: null,
    };
  }

  componentWillMount() {
    this.props.onRef(this);
  }

  // 开启图片模态框
  handleOpenModal = () => {
    const range = this.quillRef.getEditor().getSelection();
    const { resetFields } = this.props.form;
    resetFields();
    this.setState({
      isShowModal: true,
      previewUrl: null,
      range,
    }, () => {
      setTimeout(() => {
        this.urlFocusInput.input.focus();
      }, 10);
    });
  }


  // 点击code按钮
  changeToHtml = () => {
    const { delta, originalHtml } = this.state;
    if (delta) {
      this.setState({
        htmlString: originalHtml,
        isShowHtmlContainer: true,
      });
    } else {
      this.setState({
        htmlString: null,
        isShowHtmlContainer: true,
      });
    }
  }

  modules = {
    toolbar: {
      container: '#toolbar',
      handlers: {
        image: this.handleOpenModal,
        'code-block': this.changeToHtml,
      },
    },
  }

  formats = [
    'bold',
    'italic',
    'underline',
    'header',
    'list',
    'bullet',
    'link',
    'image',
    'color',
    'font',
    'size',
    'align',
    'code-block',
  ];


  /**
   *
   * @param content HTML格式的内容
   * @param delta delta格式的内容
   * @param source change的触发者 user/silent/api
   * @param editor 文本框对象
   */
  onQuillChange = (content, delta, source, editor) => {
    if (this.props.onChange) this.props.onChange(content);
    const currentDelta = editor.getContents();
    const originalHtml = editor.getHTML();
    this.setState({
      delta: currentDelta,
      originalHtml,
      editor,
    });
  }

  defaultStyle = {
    width: '100%',
    height: 320,
  };

  // 返回可视化编辑
  backEdit = () => {
    this.setState({
      isShowHtmlContainer: false,
    });
    this.props.onChange(this.state.htmlString);
  }


  handleChangedHTML = (e) => {
    this.setState({
      htmlString: e.target.value,
    });
  }

  // 关闭图片模态框
  handleCloseModal = () => {
    this.setState({
      isShowModal: false,
    });
  }

  // 预览图片
  previewPic = () => {
    const { getFieldValue } = this.props.form;
    this.setState({
      previewUrl: getFieldValue('imgUrl'),
    });
  }

  // 保存图片
  savePic = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.quillRef.getEditor().insertEmbed(this.state.range.index, 'image', values.imgUrl, Quill.sources.USER); // 在当前光标位置插入图片
        this.quillRef.getEditor().setSelection(this.state.range.index + 1); // 移动光标位置至图片后
        this.setState({
          isShowModal: false,
        });
      }
    });
  }

  getModalContent = () => {
    const { previewUrl } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { intl } = this.props;
    return (
      <div>
        <div className="c7n-iam-editor-modal-preview-top">
          <Form
            style={{ display: 'inline-block' }}
          >
            <FormItem>
              {
                getFieldDecorator('imgUrl', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: intl.formatMessage({ id: 'editor.pic.url.required' }),
                  }],
                })(
                  <Input
                    ref={(e) => {
                      this.urlFocusInput = e;
                    }}
                    style={{ width: '438px', verticalAlign: 'middle' }}
                    label={<FormattedMessage id="editor.pic.url" />}
                    id="c7n-iam-editor-input"
                  />,
                )
              }
            </FormItem>
          </Form>
          <Button
            className="c7n-iam-editor-modal-preview-top-btn"
            funcType="raised"
            onClick={this.previewPic}
          >
            <FormattedMessage id="editor.view" />
          </Button>
        </div>
        <div className="c7n-iam-editor-modal-preview-content">
          <div className="c7n-iam-editor-modal-preview-sentence">
            <FormattedMessage id="editor.preview" />
          </div>
          <div style={{ backgroundImage: `url(${previewUrl})` }} className="c7n-iam-editor-modal-preview-pic" />
        </div>
      </div>
    );
  }

  render() {
    const { value } = this.props;
    const { isShowHtmlContainer, isShowModal, htmlString } = this.state;
    const style = { ...this.defaultStyle, ...this.props.style };
    const editHeight = style.height - 42;
    return (
      <div style={style} className="c7n-iam-react-quill-editor">
        <CustomToolbar />
        <ReactQuill
          id="c7n-iam-editor"
          theme="snow"
          modules={this.modules}
          formats={this.formats}
          style={{ height: editHeight }}
          value={value}
          onChange={this.onQuillChange}
          bounds="#c7n-iam-editor"
          ref={(el) => { this.quillRef = el; }}
        />
        <div className="c7n-editor-changedHTML-container" style={{ display: isShowHtmlContainer ? 'block' : 'none' }}>
          <div className="c7n-editor-changedHTML-container-toolbar">
            <span onClick={this.backEdit}>
              {'<< '}
              <FormattedMessage id="editor.back.gui" />
            </span>
          </div>
          <textarea className="c7n-editor-changedHTML-container-content" onChange={this.handleChangedHTML} value={htmlString} />
        </div>
        <Modal
          width={560}
          visible={isShowModal}
          closable={false}
          title={<FormattedMessage id="editor.add.pic" />}
          okText={<FormattedMessage id="add" />}
          onCancel={this.handleCloseModal}
          onOk={this.savePic}
        >
          {this.getModalContent()}
        </Modal>
      </div>
    );
  }
}
