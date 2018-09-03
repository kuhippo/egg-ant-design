/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:52
 * @Last Modified by: mubin
 * @Last Modified time: 2018-08-31 09:41:30
 */
'use strict';

// app/service/user.js
const Service = require('egg').Service;

class BaseService extends Service {
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

module.exports = BaseService;
