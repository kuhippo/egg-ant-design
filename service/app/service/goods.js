/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:50
 * @Last Modified by:   mubin
 * @Last Modified time: 2018-08-30 09:44:50
 */
'use strict';

// app/service/user.js
const Service = require('egg').Service;

class GoodsService extends Service {
  // 修改订单号
  async afterSave(goods_id) {
    const goods_id_st = goods_id + '';
    const goods_sn = goods_id_st.padStart(8, '0');
    const result = await this.app
      .knex('goods')
      .where({ goods_id, goods_sn: '' });
    if (result.length > 0) {
      await this.app
        .knex('goods')
        .update({ goods_sn })
        .where({ goods_id });
    }
  }
  // 修改父路径
  async parentPath(id) {
    const result = await this.app.knex('goods_category').where({ id });
    if (result[0].parent_id === 0) {
      await this.app
        .knex('goods_category')
        .where({ id })
        .update({ parent_id_path: '0_' + id, level: 1 });
    } else {
      // id,
      await this.app
        .knex({ a: 'goods_category', b: 'goods_category' })
        .whereRaw('?? = ??', [ 'a.parent_id', 'b.id' ])
        .whereRaw('?? = ??', [ 'a.id', id ])
        .update({
          'a.parent_id_path': this.app.knex.raw(
            'CONCAT_WS("_",b.parent_id_path,?)',
            [ id ]
          ),
          'a.level': this.app.knex.raw(' ?? + 1 ', [ 'b.level' ]),
        });
    }
  }
}

module.exports = GoodsService;
