/* eslint-disable no-unused-vars */
import { DeltaOperation } from 'react-quill';
// const QuillDeltaToHtmlConverter = require('quill-delta-to-html');

/**
 * 将以base64的图片url数据转换为Blob
 * @param {string} urlData 用url方式表示的base64图片数据
 */
export function convertBase64UrlToBlob(urlData) {
  const bytes = window.atob(urlData.split(',')[1]); // 去掉url的头，并转换为byte

  // 处理异常,将ascii码小于0的转换为大于0
  const buffer = new ArrayBuffer(bytes.length);
  const unit8Array = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) {
    unit8Array[i] = bytes.charCodeAt(i);
  }

  return new Blob([buffer], { type: 'image/png' });
}
/**
 * 从deltaOps中获取图片数据
 * @param {DeltaOperation []} deltaOps
 */
export function getImgInDelta(deltaOps) {
  const imgBase = [];
  const formData = new FormData();
  deltaOps.forEach((item) => {
    if (item.insert && item.insert.image) {
      if (item.insert.image.split(':').length && item.insert.image.split(':')[0] === 'data') {
        imgBase.push(item.insert.image);
        formData.append('file', convertBase64UrlToBlob(item.insert.image));
      }
    }
  });
  return { imgBase, formData };
}

/**
 *
 * 将富文本中的base64图片替换为对应的url
 * @param {{url:string} []} imgUrlList 图标url对应的
 * @param {any []} imgBase base64图片数组
 * @param {*} text 富文本的文本结构
 */
export function replaceBase64ToUrl(imgUrlList, imgBase, text) {
  const deltaOps = text;
  const imgMap = {};
  imgUrlList.forEach((imgUrl, index) => {
    imgMap[imgBase[index]] = imgUrl;
  });
  deltaOps.forEach((item, index) => {
    if (item.insert && item.insert.image && imgBase.indexOf(item.insert.image) != -1) {
      deltaOps[index].insert.image = imgMap[item.insert.image];
    }
  });
}

/**
 * 富文本内容上传前的图片的检测与上传
 * @param {object} text 富文本的文本结构
 * @param {object} data 要发送的数据
 * @param {function} func 回调
 */
export function beforeTextUpload(text, data, callback, htmlcontent) {
  const deltaOps = text;
  const send = data;
  const { imgBase, formData } = getImgInDelta(deltaOps);
  if (imgBase.length) {
    // uploadImage(formData).then((imgUrlList) => {
    //   replaceBase64ToUrl(imgUrlList, imgBase, deltaOps);
    //   const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
    //   const html = converter.convert();
    //   send.gitlabDescription = html;
    //   send.description = JSON.stringify(deltaOps);
    //   func(send);
    // });
    callback(send);
  } else {
    // const converter = new QuillDeltaToHtmlConverter(deltaOps, {});
    // const html = converter.convert();
    send.content = htmlcontent;
    callback(send);
  }
}


export function text2Delta(description) {
  if (
    description &&
    description.indexOf('[') === 0 &&
    description[description.length - 1] === ']'
  ) {
    return JSON.parse(description);
  }
  return description || '';
}

/**
 * 将delta结构转为html
 * @param {*} delta
 */
export function delta2Html(description) {
  const delta = text2Delta(description);
  const converter = new QuillDeltaToHtmlConverter(delta, {});
  const text = converter.convert();
  if (text.substring(0, 3) === '<p>') {
    return text.substring(3, converter.convert().length - 4);
  } else {
    return text;
  }
}
