/*
 * @Author: mubin
 * @Date: 2018-08-29 18:00:09
 * @Last Modified by: mubin
 * @Last Modified time: 2018-09-03 14:13:30
 */

'use strict';

const Controller = require('./base');

class OrderController extends Controller {
  // 提交订单
  async submitOrder() {
    const prams = this.ctx.request.body;
    const user = this.ctx.state.userInfo;
    if (!prams.address_id) {
      return this.returnFormatFail('请选择地址');
    }
    if (!prams.pay_id) {
      return this.returnFormatFail('请选择支付方式');
    }
    return await this.service.mobile.order.addOrder(
      user.user_id,
      prams.address_id
    );
  }
  // 取消订单
  async cancelOrder() {
    const prams = this.ctx.request.body;
    const user = this.ctx.state.userInfo;

    if (!prams.order_id) {
      this.returnFormatFail('获取order_id失败');
      return;
    }
    const result = await this.app.knex('order').where({
      order_id: prams.order_id,
    });
    if (result.length === 0) {
      return this.returnFormatFail('获取订单失败');
    }
    const order = result[0];
    if (order.order_status !== 0) {
      return this.returnFormatFail('该订单不能取消');
    }
    // 更新订单状态
    const updateOrderResult = await this.app
      .knex('order')
      .where({ order_id: prams.order_id })
      .update({ order_status: 6 });
    if (!updateOrderResult) {
      return this.returnFormatFail('取消订单失败');
    }
    if (updateOrderResult) {
      const dic = {
        order_id: prams.order_id,
        action_user: user.user_id,
        action_note: '取消订单',
        order_status: 6,
        pay_status: order.pay_status,
        shipping_status: order.shipping_status,
        log_time: new Date(),
        status_desc: '用户取消订单',
      };
      await this.app.knex('order_action').insert(dic);
    }
    return this.returnFormatSuccess('取消订单成功');
  }
  // 确认收货
  async receipt() {
    const user = this.ctx.state.userInfo;
    const prams = this.ctx.request.body;
    const rule = { order_id: 'id' };
    this.ctx.validate(rule, prams);
    const order = await this.app
      .knex('order')
      .where({ order_id: prams.order_id, user_id: user.user_id });
    if (order.order_status !== 1) {
      return this.returnFormatFail('该订单不能收货确认', 201);
    }
    const data = {
      order_status: 2,
      pay_status: 1,
      confirm_time: new Date(),
    };
    const result = await this.app
      .knex('order')
      .where({ order_id: prams.order_id })
      .update(data);
    if (!result) {
      return this.returnFormatFail('操作失败');
    }
    return this.returnFormatSuccess('操作成功');
  }
  // 我的订单 (订单状态：0所有订单；1待付款；2待发货；3待收货；4待评价；5已评价；6已取消)
  async orderList() {
    let status = 0;
    const prams = this.ctx.query;
    const user = this.ctx.state.userInfo;
    const pageSize = Math.abs(prams.pageSize >> 0) || 10; // 分页率
    const page = Math.abs(prams.page >> 0) || 1; // 当前页码
    const offset = (page - 1) * pageSize;
    if (prams.status) {
      status = prams.status;
    }
    // 获取所有查询数量
    const allcount = await this.app
      .knex('order')
      .where({
        user_id: user.user_id,
      })
      .count({ count: 'order_id' });
    // 获取订单
    const orders = await this.app
      .knex('order')
      .where({
        user_id: user.user_id,
      })
      .limit(pageSize)
      .offset(offset);

    const data = {
      count: allcount[0].count,
      data: orders,
    };
    return this.returnFormatSuccess(data);
  }
  // 订单详情
  async ordersDetail() {
    const prams = await this.ctx.query;
    const orderDetail = await this.app.knex('order').where({
      order_sn: prams.order_sn,
    });
    if (orderDetail.length > 0) {
      return this.returnFormatSuccess(orderDetail[0]);
    }
    return this.returnFormatFail('查询订单失败请输入正确单号');
  }
}

module.exports = OrderController;
