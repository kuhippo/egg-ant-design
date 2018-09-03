/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:50
 * @Last Modified by: mubin
 * @Last Modified time: 2018-09-01 09:58:08
 */
'use strict';

// app/service/user.js
const Service = require('egg').Service;

class CommomService extends Service {
  //  获取商品库存
  async getGoodNum(goods_id, key) {
    if (key) {
      return await this.app
        .knex('spec_goods_price')
        .select('store_count')
        .where({ goods_id, key });
    }
    return await this.app
      .knex('goods')
      .select('store_count')
      .where({ goods_id, key });
  }

}

module.exports = CommomService;
