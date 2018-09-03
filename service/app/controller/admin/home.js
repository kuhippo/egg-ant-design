/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:14
 * @Last Modified by:   mubin
 * @Last Modified time: 2018-08-30 09:44:14
 */
'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const resutl = await this.service.home.find();
    this.ctx.body = resutl;
  }
}

module.exports = HomeController;
