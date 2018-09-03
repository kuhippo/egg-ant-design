/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:06
 * @Last Modified by: mubin
 * @Last Modified time: 2018-08-31 15:19:20
 */
'use strict';

const Controller = require('egg').Controller;
const bcrypt = require('bcryptjs');
const fromat = require('../../utils/fromat');
const tools = require('../../utils/tools');

class AdminController extends Controller {
  // 注册
  async register() {
    const prams = this.ctx.request.body;
    let err;
    const data = {};
    if (!prams.name) {
      err = '请输入用户名';
    } else if (!prams.password) {
      err = '请输入密码';
    } else if (!prams.account) {
      err = '请输入账户';
    } else if (!prams.role_id) {
      err = '请选择用户权限';
    } else {
      const reult = await this.app
        .knex('admin')
        .select()
        .where({ account: prams.account });
      if (reult.length !== 0) {
        err = '该用户已经注册请重新输入一个';
      } else {
        const password = bcrypt.hashSync(
          prams.password,
          bcrypt.genSaltSync(10)
        );
        const newAdming = {
          admin_name: prams.name,
          password,
          account: prams.account,
          role_id: prams.role_id,
        };
        const result = await this.app.knex
          .insert(newAdming)
          .into('admin');
        err = result !== 1 ? '' : '注册失败';
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 登录
  async login() {
    const prams = this.ctx.request.body;
    let err;
    let data = {};
    if (!prams.account) {
      err = '请输入账号';
    } else if (!prams.password) {
      err = '请输入密码';
    } else {
      const result = await this.app
        .knex('admin')
        .where({ account: prams.account });
      if (result.length > 0) {
        const user = result[0];
        if (bcrypt.compareSync(prams.password, user.password)) {
          const ip = tools.getClientIP(this.ctx);
          const userLog = {
            admin_id: user.admin_id,
            login_ip: ip,
            login_info: '后台登录',
          };
          await this.app.knex('admin_log').insert(userLog);
          delete user.password;
          data = {
            token: this.app.jwt.sign(
              Object.assign({ ip }, user),
              this.app.config.jwt.secret,
              {
                expiresIn: this.app.config.jwt.expiresIn,
              }
            ),
          };
        } else {
          err = '账号或密码错误';
        }
      } else {
        err = '账号或密码错误';
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 更改密码 -POST
  async changePwd() {
    const prams = this.ctx.request.body;
    let err;
    const data = {};
    if (!prams.old_password) {
      err = '请输入旧密码';
    } else if (!prams.new_password) {
      err = '请输入新密码';
    } else if (prams.old_password === prams.new_password) {
      err = '旧密码不能与新密码相同';
    } else {
      const user = this.ctx.state.userInfo; // 获取用户信息
      const result = await this.app.knex
        .select('admin')
        .where({ admin_id: user.admin_id });
      if (result.length > 0) {
        const password = bcrypt.hashSync(
          prams.new_password,
          bcrypt.genSaltSync(10)
        );

        const result = await this.app
          .knex('admin')
          .where({ admin_id: user.admin_id })
          .update({ password });

        if (result.affectedRows !== 1) {
          err = '更新密码失败';
        }
      } else {
        err = 'token异常';
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 获取用户信息 - GET
  async userInfo() {
    let err;
    let data;
    const userId = this.ctx.state.userInfo.admin_id;
    const userResult = await this.app
      .knex('admin')
      .select('admin_id', 'admin_name', 'role_id')
      .where({ admin_id: userId });
    if (userResult.length > 0) {
      const user = userResult[0];
      const role_id = user.role_id;
      const roleIdResult = await this.app
        .knex('admin_role')
        .where({ role_id });
      if (roleIdResult.length === 0) {
        err = '获取权限失败';
      } else {
        if (roleIdResult[0].act_list === 'all') {
          // 全部权限
          const menusResult = await this.app.knex('admin_menus');
          data = { userInfo: user, menus: menusResult };
        } else {
          const menusResult = await this.app
            .knex('admin_menus')
            .where({ id: [ roleIdResult[0].act_list ], enable: 1 });
          data = { userInfo: user, menus: menusResult };
        }
      }
    } else {
      err = 'token 错误';
    }
    // 更新用户ip地址 和 登录时间
    const ip = this.ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0];
    const login_time = new Date();
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
    await this.app
      .knex('admin')
      .update({ last_time: login_time, last_ip: ip })
      .where({ admin_id: userId });
  }
  // 获取用户权限列表 - GET
  async permissions() {
    let err;
    let data;
    const userId = this.ctx.state.userInfo.admin_id;
    const result = await this.app
      .knex('admin_role')
      .select('role')
      .where({ admin_id: userId });
    if (result.length > 0) {
      data = result[0];
    } else {
      err = '用户无效';
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 获取权限列表 - GET
  async permissionsList() {
    let err;
    let data;
    const prams = this.ctx.query;
    const pageSize = Math.abs(prams.pageSize >> 0) || 10; // 分页率
    const page = Math.abs(prams.page >> 0) || 1; // 当前页码
    const offset = (page - 1) * pageSize;
    const resultCount = await this.app
      .knex('admin_role')
      .count('role_id as count');
    const result = await this.app
      .knex('admin_role')
      .offset(offset)
      .limit(pageSize);
    data = {
      count: resultCount[0].count,
      list: result,
    };

    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }

  // 获取用户权限菜单列表 -GET
  async getMenus() {
    let err;
    let data;
    const role_id = this.ctx.state.userInfo.role_id;

    const userResult = await this.app.knex('admin_role').where({ role_id });
    if (userResult.length === 0) {
      err = '获取权限失败';
    }

    if (userResult[0].act_list === 'all') {
      // 全部权限
      const menusResult = await this.app.knex('admin_menus');
      data = menusResult;
    } else {
      const menusResult = await this.app
        .knex('admin_menus')
        .whereIn('id', userResult[0].act_list.split(','));
      data = menusResult;
    }

    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 删除菜单 -POST
  async deleteMenu() {
    let err;
    let data;
    const prams = this.ctx.request.body;
    const id = prams.id;
    const result = await this.app
      .knex('admin_menus')
      .where({ id })
      .del();
    if (!result === 1) {
      err = '删除失败';
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 新增菜单 -POST
  async newMenu() {
    let err;
    let data;
    const prams = this.ctx.request.body;
    if (!prams.name) {
      err = '请输入菜单名称';
    } else {
      const dic = {
        name: prams.name,
        enable: prams.enable || 1,
        route: prams.route || '',
        pid: prams.pid || 1,
        icon: prams.icon || '',
        mpid: prams.pid || 1,
      };
      const result = await this.app.knex('admin_menus').insert(dic);
      if (!result === 1) {
        err = '插入失败';
      }
    }

    return (this.ctx.body = fromat(
      !err,
      data,
      err,
      !err === true ? 200 : 0
    ));
  }
  // 设置菜单权限
  async setMenuRole() {
    let err;
    let data;
    const prams = this.ctx.request.body;
    if (!prams.id) {
      err = '请输入id';
    } else {
      const id = prams.id;
      const enable = prams.enable || 1;
      const result = await this.app
        .knex('admin_menus')
        .update({ enable })
        .where({ id });
      if (!result === 1) {
        err = '更新失败';
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 获取用户授权 -GET
  async authorizationList() {
    let err;
    let data;
    const prams = this.ctx.query;
    const role_id = prams.role_id;
    const result = await this.app
      .knex('admin')
      .where({ role_id })
      .select('account', 'add_time', 'admin_id', 'admin_name');
    data = result;
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 修改用户用户权限 -POST
  async reviseAuthorization() {
    let err;
    let data;
    const prams = this.ctx.request.body;
    if (!prams.admin_id) {
      err = '请输入用户id';
    } else if (!prams.role_id) {
      err = '请输入权限id';
    } else if (!prams.role_id === 1) {
      err = '不能设置为最高管理权限';
    } else {
      const role_id = prams.role_id;
      const admin_id = prams.admin_id;
      const result = await this.app
        .knex('admin')
        .where({ admin_id })
        .update({ role_id });
      // 修改失败
      if (!result === 1) {
        err = '修改失败';
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 设置权限列表是否可用 -POST
  async setRoleEnable() {
    let err;
    let data;
    const prams = this.ctx.request.body;
    if (prams.enable === null) {
      err = '请输入权限';
    } else if (!prams.role_id) {
      err = '请输入权限id';
    } else {
      const enable = prams.enable > 0 ? 1 : 0;
      const role_id = prams.role_id;
      const result = await this.app
        .knex('admin_role')
        .where({ role_id })
        .update({ enable });
      if (!result === 1) {
        err = '更新失败';
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 获取用户列表 - GET
  async getAllAdmin() {
    let err;
    let data;
    const prams = this.ctx.query;
    const pageSize = Math.abs(prams.pageSize >> 0) || 10; // 分页率
    const page = Math.abs(prams.page >> 0) || 1; // 当前页码
    const offset = (page - 1) * pageSize;

    const resultCount = await this.app
      .knex('admin')
      .count('admin_id as count')
      .where(builder => {
        if (prams.admin_name) {
          builder.where(
            'admin_name',
            'like',
            '%' + prams.admin_name + '%'
          );
        }
      });

    const result = await this.app
      .knex('admin')
      .select(
        'admin_id',
        'admin_name',
        'role_id',
        'account',
        'last_ip',
        'last_time'
      )
      .where(builder => {
        if (prams.admin_name) {
          builder.where(
            'admin_name',
            'like',
            '%' + prams.admin_name + '%'
          );
        }
      })
      .offset(offset)
      .limit(pageSize);

    data = {
      list: result,
      count: resultCount[0].count,
    };
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
}

module.exports = AdminController;
