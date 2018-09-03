/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:40
 * @Last Modified by:   mubin
 * @Last Modified time: 2018-08-30 09:44:40
 */
'use strict';

const urls = {
  saveXML: { userType: 0 }, // 保存xml（游客）
  login: { userType: 0 }, // 用户登录（游客）
  register: { userType: 0 }, // 用户注册（游客）
  retrieve: { userType: 0 }, // 找回密码（游客）
  findPassword: { userType: 0, method: 'get', url: '/:email/:code' }, // 激活找回密码（游客）
  active: { userType: 0, method: 'get', url: '/:name/:code' }, // 帐号激活（游客）
  modifyType: {},
  getTypeList: {},
  updateGoods: {},
  categoryDetail: {},
  roleList: {},
  changePwd: {},
  editRole: {},
  uploadSign: {},
  uploadArr: {},
  deleteType: {},
  userInfo: {},
  goodsList: {},
  listSort: {},
  getAllAdmin: {},
  permissions: {},
  deleteMenu: {},
  authorizationList: {},
  reviseAuthorization: {},
  setRoleEnable: {},
  getGood: {},
  permissionsList: {},
  getMenus: {},
  newMenu: {},
  listUpFile: {},
  upload: {},
  delFile: {},
  listUser: {},
  updateUser: {},
  getUserById: {},
  passedUser: {},
  deleteUser: {},
  deleteGoods: {},
  upUserPic: { userType: 4 }, // 用户上传头像
  listArticle: {},
  setMenuRole: {},
  getArticleById: { userType: 4 }, // 获取文章详情
};

module.exports = (options, app) => {
  return async function auth(ctx, next) {
    const arr = /admin\/([a-zA-Z]+)/.exec(ctx.url);
    const key = arr ? arr[1] : '';
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
        ctx.request.header.authorization,
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
