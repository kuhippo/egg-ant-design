/*
 * @Author: mubin
 * @Date: 2018-08-23 15:18:37
 * @Last Modified by: mubin
 * @Last Modified time: 2018-09-01 16:27:48
 */

'use strict';

const Controller = require('./base');

class AdressController extends Controller {
  // 地址列表 -GET
  async getAdress() {
    const user = this.ctx.state.userInfo;
    const result = await this.app
      .knex('user_address')
      .where({ user_id: user.user_id });
    return this.returnFormatSuccess(result);
  }

  // 添加,编辑 收货地址 -POST
  async editAddress() {
    const rule = {
      consignee: 'string',
      province: 'string',
      city: 'string',
      mobile: 'string',
    };
    const prams = this.ctx.request.body;
    // 验证body
    this.ctx.validate(rule, prams);
    const address_id = prams.address_id >> 0 || 0;
    const user = this.ctx.state.userInfo;
    // 0是插入
    const address = {
      user_id: user.user_id,
      consignee: prams.consignee,
      email: prams.email,
      province: prams.province,
      city: prams.city,
      district: prams.district,
      twon: prams.twon,
      address: prams.address,
      zipcode: prams.zipcode,
      is_default: prams.is_default,
      is_pickup: prams.is_pickup,
      mobile: prams.mobile,
      extra_adress: prams.extra_adress,
    };
    if (address_id === 0) {
      const result = await this.app.knex('user_address').insert(address);
      if (result.length > 0) {
        return this.returnFormat(true, null, '插入成功');
      }
      return this.returnFormatFail('插入失败');
    }
    const result = await this.app
      .knex('user_address')
      .update(address)
      .where({ address_id });
    if (result === 1) {
      return this.returnFormat(true, null, '更新成功');
    }
    return this.returnFormatFail('插入失败');
  }

  // 删除地址列表
  async deleteAddress() {
    const prams = this.ctx.request.body;
    const rule = { address_id: { type: 'id', required: true } };
    this.ctx.validate(rule, prams);
    const user = this.ctx.state.userInfo;
    const result = await this.app
      .knex('user_address')
      .where({ address_id: prams.address_id, user_id: user.user_id })
      .del();
    if (result === 1) {
      return this.returnFormat(true, null, '删除成功');
    }
    return this.returnFormatFail('删除失败');
  }
}

module.exports = AdressController;
