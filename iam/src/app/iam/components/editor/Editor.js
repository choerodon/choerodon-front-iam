import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageDrop from './ImageDrop';
import './Editor.scss';

Quill.register('modules/imageDrop', ImageDrop);

const Size = Quill.import('attributors/style/size');
Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px'];
Quill.register(Size, true);

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

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      [{ color: [] }],
      [{ font: [] }],
      [{ size: ['10px', '12px', '14px', '16px', '18px', '20px'] }],
    ],
    imageDrop: true,
  };

  formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
    'color',
    'background',
    'font',
    'size',
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
    this.setState({
      delta: currentDelta,
    });
  }

  defaultStyle = {
    width: '100%',
    height: 320,
  };

  getDelta = () => this.state.delta;

  render() {
    const { value } = this.props;
    const style = { ...this.defaultStyle, ...this.props.style };
    const editHeight = style.height - 42;
    return (
      <div style={style} className="react-quill-editor">
        <ReactQuill
          theme="snow"
          modules={this.modules}
          formats={this.formats}
          style={{ height: editHeight }}
          value={value}
          onChange={this.onQuillChange}
        />
      </div>
    );
  }
}

export default Editor;
