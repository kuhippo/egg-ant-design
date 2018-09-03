/*
 * @Author: mubin
 * @Date: 2018-08-23 14:23:06
 * @Last Modified by: mubin
 * @Last Modified time: 2018-08-23 15:12:27
 */
'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
  returnFormat(success = true, data = null, msg = '', code = 200) {
    this.ctx.body = {
      success,
      data,
      msg,
      code,
    };
  }

  returnFormatSuccess(data = null) {
    this.ctx.body = {
      success: true,
      data,
      msg: '请求成功',
      code: 200,
    };
  }
  returnFormatFail(msg, code = 0) {
    this.ctx.body = {
      success: true,
      data: null,
      msg,
      code,
    };
  }
}

module.exports = BaseController;
