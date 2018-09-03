/*
 * @Author: mubin
 * @Date: 2018-08-29 18:00:09
 * @Last Modified by: mubin
 * @Last Modified time: 2018-09-01 11:32:17
 */

'use strict';

const Controller = require('./base');

class CartController extends Controller {
  //   加入购物车
  async addCart() {
    const prams = this.ctx.request.body;
    prams.num = parseInt(prams.num) || 0;
    const rule = {
      num: { type: 'number', required: true, min: 1 },
      goods_id: { type: 'id', required: true },
    };
    // 判断参数
    this.ctx.validate(rule, prams);
    const user = this.ctx.state.userInfo;
    // 加入购物车数量不能超过商品库存
    const result = await this.app
      .knex('goods')
      .select('store_count')
      .where({ goods_id: prams.goods_id });
    let store_count = 0;
    if (result.length === 0) {
      this.returnFormatFail('获取库存失败');
      return;
    }
    store_count = result[0].store_count;
    if (store_count < prams.num) {
      this.returnFormatFail('库存不足,剩余' + store_count + '件');
      return;
    }
    await this.service.mobile.cart.addCart(
      prams.goods_id,
      prams.num,
      null,
      user.user_id
    );
  }
  // 删除购物车
  async deleteCart() {
    const user = this.ctx.state.userInfo;
    const result = await this.app
      .knex('cart')
      .where({ user_id: user.user_id })
      .del();
    console.log(result);
    if (result === 1) {
      return this.returnFormat(null, '删除成功');
    }
    return this.returnFormatFail('删除失败');
  }
  // 获取购物车列表
  async cartList() {
    const user = this.ctx.state.userInfo;
    const result = await this.app
      .knex('cart')
      .where({ user_id: user.user_id })
      .select('*');
    this.returnFormatSuccess(result);
  }
  // 获取购物车计算价格
  async cartCount() {
    const result = await this.service.mobile.cart.cartCount();
    return this.returnFormatSuccess(result);
  }
  // 勾选全部购物车
  async selectAll() {
    const user = this.ctx.state.userInfo;
    const result = await this.app
      .knex('cart')
      .where({ user_id: user.user_id })
      .andWhere('selected', '!=', 1)
      .update({ selected: 1 });
    if (result || result === 0) {
      this.returnFormatSuccess('更新成功');
    }
  }
}

module.exports = CartController;
