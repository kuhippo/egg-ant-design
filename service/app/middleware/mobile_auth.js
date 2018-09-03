/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:43
 * @Last Modified by: mubin
 * @Last Modified time: 2018-09-03 12:06:12
 */
'use strict';

const urls = {
  getAdress: {},
  editAddress: {},
  deleteAddress: {},
  register: { userType: 0 },
  login: { userType: 0 },
  addCart: {},
  deleteCart: {},
  goodsList: { userType: 0 },
  cartList: {},
  cartCount: {},
  selectAll: {},
  submitOrder: {},
  cancelOrder: {},
  receipt: {},
  orderList: {},
  ordersDetail: {},
};

module.exports = (options, app) => {
  return async function auth(ctx, next) {
    const arr = /mobile\/(v[(1-2)])\/([a-zA-Z]+)/.exec(ctx.url);
    const key = arr ? arr[2] : '';
    const obj = urls[key];
    if (!obj) {
      ctx.body = {
        message: '非法请求',
      };
      return;
    }
    const userType = obj.userType;
    if (userType === 0) {
      await next();
      return;
    }
    let result;
    let err;
    try {
      result = app.jwt.verify(
        ctx.request.header.token,
        app.config.jwt.secret
      );
    } catch (err) {
      err = err;
    }

    if (typeof result === 'object' && !err) {
      ctx.state.userInfo = result;
      await next();
      return;
    }
    ctx.body = {
      success: false,
      data: {},
      message: '权限验证错误',
    };
  };
};
