/*
 * @Author: mubin
 * @Date: 2018-08-30 09:45:29
 * @Last Modified by: mubin
 * @Last Modified time: 2018-09-03 12:01:42
 */
'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/admin/setMenuRole', controller.admin.home.index);
  router.post('/admin/register', controller.admin.manage.register);
  router.post('/admin/login', controller.admin.manage.login);
  router.post('/admin/changePwd', controller.admin.manage.changePwd);
  router.get('/admin/userInfo', controller.admin.manage.userInfo);
  router.get('/admin/permissions', controller.admin.manage.permissions);
  router.get(
    '/admin/permissionsList',
    controller.admin.manage.permissionsList
  );
  router.get('/admin/getMenus', controller.admin.manage.getMenus);
  router.post('/admin/deleteMenu', controller.admin.manage.deleteMenu);
  router.post('/admin/newMenu', controller.admin.manage.newMenu);
  router.post('/admin/setMenuRole', controller.admin.manage.setMenuRole);
  router.get(
    '/admin/authorizationList',
    controller.admin.manage.authorizationList
  );
  router.post(
    '/admin/reviseAuthorization',
    controller.admin.manage.reviseAuthorization
  );
  router.post('/admin/setRoleEnable', controller.admin.manage.setRoleEnable);
  router.get('/admin/getAllAdmin', controller.admin.manage.getAllAdmin);

  // goods
  router.post('/admin/deleteType', controller.admin.goods.deleteType);
  router.post('/admin/modifyType', controller.admin.goods.modifyType);
  router.get('/admin/getTypeList', controller.admin.goods.getTypeList);
  router.get('/admin/categoryDetail', controller.admin.goods.categoryDetail);
  router.post('/admin/goodsList', controller.admin.goods.goodsList);
  router.post('/admin/deleteGoods', controller.admin.goods.deleteGoods);
  router.get('/admin/getGood', controller.admin.goods.getGood);
  router.post('/admin/updateGoods', controller.admin.goods.updateGoods);
  // upload
  router.post('/upload', controller.admin.upload.upload);
  router.post('/multi_upload', controller.admin.upload.multi_upload);

  // ----------------------------- mobile -----------------------------
  // user
  router.post('/mobile/v1/register', controller.mobile.user.register);
  router.post('/mobile/v1/login', controller.mobile.user.login);

  // adress
  router.get('/mobile/v1/getAdress', controller.mobile.address.getAdress);
  router.post(
    '/mobile/v1/editAddress',
    controller.mobile.address.editAddress
  );
  router.post(
    '/mobile/v1/deleteAddress',
    controller.mobile.address.deleteAddress
  );

  // goods
  router.post('/mobile/v1/goodsList', controller.mobile.goods.goodsList);
  router.get('/mobile/v1/getGood', controller.mobile.goods.getGood);
  // carts
  router.post('/mobile/v1/addCart', controller.mobile.cart.addCart);
  router.post('/mobile/v1/deleteCart', controller.mobile.cart.deleteCart);
  router.get('/mobile/v1/cartList', controller.mobile.cart.cartList);
  router.get('/mobile/v1/cartCount', controller.mobile.cart.cartCount);
  router.post('/mobile/v1/selectAll', controller.mobile.cart.selectAll);

  // order
  router.post('/mobile/v1/submitOrder', controller.mobile.order.submitOrder);
  router.post('/mobile/v1/cancelOrder', controller.mobile.order.cancelOrder);
  router.post('/mobile/v1/receipt', controller.mobile.order.receipt);
  router.get('/mobile/v1/orderList', controller.mobile.order.orderList);
  router.get('/mobile/v1/ordersDetail', controller.mobile.order.ordersDetail);
};
