import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Editor.scss';
import QuillDeltaToHtmlConverter from 'quill-delta-to-html';
import ImageDrop from './ImageDrop';


Quill.register('modules/imageDrop', ImageDrop);

const Align = Quill.import('attributors/style/align');
Align.whitelist = ['right', 'center', 'justify'];
Quill.register(Align, true);

const Size = Quill.import('attributors/style/size');
Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px'];
Quill.register(Size, true);


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
      <select className="ql-font" />
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
)

class Editor extends Component {
  constructor(props) {
    super(props);
    this.onQuillChange = this.onQuillChange.bind(this);
    this.state = {
      delta: null,
    };
  }

  componentWillMount() {
    this.props.onRef(this);
  }

  // 点击code按钮
  changeToHtml = () => {
    const { delta } = this.state;
    if (delta) {
      const deltaOps = JSON.parse(JSON.stringify(delta));
      deltaOps.ops.forEach((item, index) => {
        if (item.insert && item.insert.image) {
          if (deltaOps.ops[index].insert.image.indexOf('notify-service') === -1) {
            deltaOps.ops[index].insert.image = `image${index}.png`;
          }
        }
      });
      const converter = new QuillDeltaToHtmlConverter(deltaOps.ops, {});
      const html = converter.convert();
      this.setState({
        htmlString: html,
      });
    } else {
      this.setState({
        htmlString: null,
      });
    }
    const htmlContainer = document.getElementsByClassName('c7n-editor-changedHTML-container')[0];
    htmlContainer.style.display = 'block';
  }

  modules = {
    toolbar: {
      container: '#toolbar',
      handlers: {
        'code-block': this.changeToHtml,
      },
    },
    imageDrop: true,
  };

  formats = [
    'bold',
    'italic',
    'underline',
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
    this.props.onChange(content);
    const currentDelta = editor.getContents();
    const htmlString = editor.getHTML();
    this.setState({
      delta: currentDelta,
      htmlString,
    });
  }

  defaultStyle = {
    width: '100%',
    height: 320,
  };

  getDelta = () => this.state.delta;

  // 返回可视化编辑
  backEdit = () => {
    const htmlContainer = document.getElementsByClassName('c7n-editor-changedHTML-container')[0];
    htmlContainer.style.display = 'none';
    this.props.onChange(this.state.htmlString);
  }

  // HTML形式内容变化时触发
  handleHtmlChange = (e) => {
    this.setState({
      htmlString: e.target.value,
    });
  }

  render() {
    const { value } = this.props;
    const style = { ...this.defaultStyle, ...this.props.style };
    const editHeight = style.height - 42;
    return (
      <div style={style} className="react-quill-editor">
        <CustomToolbar />
        <ReactQuill
          theme="snow"
          modules={this.modules}
          formats={this.formats}
          style={{ height: editHeight }}
          value={value}
          onChange={this.onQuillChange}
        />
        <div className="c7n-editor-changedHTML-container">
          <div className="c7n-editor-changedHTML-container-toolbar">
            <span onClick={this.backEdit}>{'<< 返回可视化编辑'}</span>
          </div>
          <textarea value={this.state.htmlString} onInput={this.handleHtmlChange} />
        </div>
      </div>
    );
  }
}

export default Editor;
