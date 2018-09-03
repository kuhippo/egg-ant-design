/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:52
 * @Last Modified by:   mubin
 * @Last Modified time: 2018-08-30 09:44:52
 */
'use strict';

// app/service/user.js
const Service = require('egg').Service;

class HomeService extends Service {
  async find() {
    const user = await this.app.mysql.get('admin', { admin_id: 11 });
    return { user };
  }

}

module.exports = HomeService;
