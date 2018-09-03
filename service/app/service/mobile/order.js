/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:52
 * @Last Modified by: mubin
 * @Last Modified time: 2018-09-01 16:45:08
 */
'use strict';

const Service = require('./base');
const { generateOrderNumber } = require('./../../utils/tools');

class OrderService extends Service {
  // 提交订单
  async addOrder(user_id, address_id) {
    const {
      cart_acount,
      original_price,
      prom_acount,
      prom_type,
      prom_id,
    } = await this.service.mobile.cart.cartCount();
    if (cart_acount === 0) {
      return this.returnFormatFail('订单金额为0');
    }
    let addressResult = await this.app
      .knex('user_address')
      .where({ address_id, user_id });
    if (addressResult.length === 0) {
      return this.returnFormatFail('选择地址有误', 201);
    }
    addressResult = addressResult[0];
    const order_sn = generateOrderNumber();
    const data = {
      order_sn,
      user_id,
      order_status: 0,
      shipping_status: 0,
      pay_status: 0,
      consignee: addressResult.consignee,
      country: addressResult.country,
      province: addressResult.province,
      city: addressResult.city,
      district: addressResult.district,
      twon: addressResult.twon,
      address: addressResult.address,
      zipcode: addressResult.zipcode,
      mobile: addressResult.mobile,
      email: addressResult.email,
      order_amount: cart_acount,
      total_amount: cart_acount,
      order_prom_amount: prom_acount,
      order_prom_type: prom_type,
      prom_id,
      add_time: new Date(),
    };
    const orderResult = await this.app.knex('order').insert(data);
    if (orderResult === 0) {
      return this.app.knex('插入订单失败');
    }
    // 记录订单操作日记;
    const action_info = {
      order_id: orderResult,
      action_user: user_id,
      action_note: '您提交了订单，请等待系统确认',
      status_desc: '提交订单',
      log_time: new Date(),
    };
    // 插入记录表;
    await this.app.knex('order_action').insert(action_info);
    const cartList = await this.app
      .knex('cart')
      .where({ selected: 1, user_id });
    const goodsIds = [];
    for (const item of cartList) {
      goodsIds.push(item.goods_id);
    }
    const goodsResult = await this.app
      .knex('goods')
      .whereIn('goods_id', goodsIds);
    const goodsResultDatas = [];
    for (const item of goodsResult) {
      const dic = {
        order_id: orderResult,
        goods_id: item.goods_id,
        goods_name: item.goods_name,
        goods_sn: item.goods_sn,
        goods_num: item.goods_num,
        market_price: item.market_price,
        goods_price: item.goods_price,
        spec_key: item.spec_key,
        spec_key_name: item.spec_key_name,
        member_goods_price: item.member_goods_price,
        cost_price: item.cost_price,
        give_integral: item.give_integral,
        prom_type: item.prom_type,
        prom_id: item.prom_id,
        is_send: 0,
        is_comment: 0,
      };
      goodsResultDatas.push(dic);
    }
    await this.app.knex('order_goods').insert(goodsResultDatas);
    return this.returnFormatSuccess('提交订单成功');
  }
}

module.exports = OrderService;
