import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from 'choerodon-ui';
import ImageDrop from './ImageDrop';
import './Editor.scss';

Quill.register('modules/imageDrop', ImageDrop);

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      msgSaving: null,
      chatError: null,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      [{ 'color': [] }],
      [{ 'font': [] }],
      // ['clean'],
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
  ];

  defaultStyle = {
    width: 498,
    height: 200,
    borderRight: 'none',
  };

  isHasImg = (delta) => {
    let pass = false;
    if (delta && delta.ops) {
      delta.ops.forEach((item) => {
        if (item.insert && item.insert.image) {
          pass = true;
        }
      });
    }
    return pass;
  };


  handleChange = (content, delta, source, editor) => {
    const value = editor.getHTML();
    // window.console.log(value);
    this.props.onChange(value);
    // if (this.props.onChange && value && value.ops) {
    //   window.console.log(value.ops);
    //
    // }
  };

  render() {
    const { placeholder, value } = this.props;
    const style = { ...this.defaultStyle, ...this.props.style };
    const editHeight = style.height - (this.props.toolbarHeight || 42);
    return (
      <div style={{ width: '100%' }}>
        <div style={style} className="react-quill-editor">
          <ReactQuill
            theme="snow"
            modules={this.modules}
            formats={this.formats}
            style={{ height: editHeight }}
            placeholder={placeholder}
            defaultValue={value}
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
}

export default Editor;
