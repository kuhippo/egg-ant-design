'use strict';

// 获取客户端Ip
function getClientIP(ctx) {
  const req = ctx.request;
  const ip =
        ctx.ip ||
        req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        '';
  const arr = ip.match(/(\d{1,3}\.){3}\d{1,3}/);
  return arr ? arr[0] : '';
}

function dataLeftCompleting(bits, identifier, value) {
  value = identifier.repeat(bits) + value;
  return value.slice(-bits);
}

// 生成订单号
function generateOrderNumber() {
  function pad2(n) {
    return n < 10 ? '0' + n : n;
  }
  const date = new Date();
  const rand = Math.floor(Math.random() * 900) + 100;
  const order_id =
        date.getFullYear().toString() +
        pad2(date.getMonth() + 1) +
        pad2(date.getDate()) +
        pad2(date.getHours()) +
        pad2(date.getMinutes()) +
        rand;
  return order_id;
}
module.exports = {
  dataLeftCompleting,
  getClientIP,
  generateOrderNumber,
};
