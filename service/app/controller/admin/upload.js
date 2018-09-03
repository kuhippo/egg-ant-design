/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:20
 * @Last Modified by:   mubin
 * @Last Modified time: 2018-08-30 09:44:20
 */
'use strict';

const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const uuidv1 = require('uuid/v1');
const fileUtils = require('../../utils/fileUtils.js');
const pump = require('mz-modules/pump');

class UploadController extends Controller {
  async upload() {
    const fileLocation = 'app/public/user';
    fileUtils.createFolderByDirname(fileLocation);
    const stream = await this.ctx.getFileStream();
    const filename1 = stream.filename;

    const serviceFileName = uuidv1() + '_' + filename1;
    const target = path.join(
      this.config.baseDir,
      fileLocation,
      serviceFileName
    );
    const writeStream = fs.createWriteStream(target);
    await pump(stream, writeStream);
    const fileUrl = fileLocation + '/' + serviceFileName;
    this.ctx.body = { success: true, fileUrl };
  }

  async multi_upload() {
    const fileLocation = 'app/public/user';
    fileUtils.createFolderByDirname(fileLocation);
    const parts = this.ctx.multipart({ autoFields: true });
    const files = [];
    let stream;
    while ((stream = await parts()) != null) {
      const filename = stream.filename.toLowerCase();
      const target = path.join(
        this.config.baseDir,
        fileLocation,
        filename
      );
      const writeStream = fs.createWriteStream(target);
      await pump(stream, writeStream);
      files.push(filename);
    }

    this.ctx.body = { success: 'muti upload success' };
  }
}

module.exports = UploadController;
