/*
 * @Author: mubin
 * @Date: 2018-08-29 18:00:34
 * @Last Modified by:   mubin
 * @Last Modified time: 2018-08-29 18:00:34
 */
'use strict';

const Controller = require('./base');
const bcrypt = require('bcryptjs');

class UserController extends Controller {
  // 注册用户 -POST
  async register() {
    const rule = { password: 'string', mobile: 'string' };
    const prams = this.ctx.request.body;
    // 验证body
    this.ctx.validate(rule, prams);
    const hashPwd = bcrypt.hashSync(prams.password, bcrypt.genSaltSync(10));
    const userResult = await this.app
      .knex('users')
      .where({ mobile: prams.mobile });
    if (userResult.length > 0) {
      return this.returnFormatFail('改手机号码已注册');
    }

    const user = {
      password: hashPwd,
      mobile: prams.mobile,
    };
    const result = await this.app.knex('users').insert(user);
    if (result.length > 0) {
      this.returnFormat(true, null, '注册成功', 200);
    } else {
      this.returnFormatFail('插入数据失败');
    }
  }
  // 验证 返回token
  async login() {
    const prams = this.ctx.request.body;
    const rule = { password: 'string', mobile: 'string' };
    this.ctx.validate(rule, prams);
    const result = await this.app
      .knex('users')
      .where({ mobile: prams.mobile });
    if (result.length > 0) {
      const user = result[0];
      if (bcrypt.compareSync(prams.password, user.password)) {
        delete user.password;
        this.returnFormatSuccess({
          token: this.app.jwt.sign(
            Object.assign(user),
            this.app.config.jwt.secret,
            {
              expiresIn: this.app.config.jwt.expiresIn,
            }
          ),
        });
      } else {
        return this.returnFormatFail('账号或密码错误');
      }
    } else {
      return this.returnFormatFail('账号或密码错误');
    }
  }
}

module.exports = UserController;
