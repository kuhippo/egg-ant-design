/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:52
 * @Last Modified by: mubin
 * @Last Modified time: 2018-09-01 11:21:20
 */
'use strict';

// app/service/user.js
const Service = require('./base');

class CartService extends Service {
  // 加入购物车方法
  async addCart(goods_id, goods_num, goods_spec, user_id) {
    const goodsResult = await this.app.knex('goods').where({ goods_id });
    if (goodsResult.length < 0) {
      return this.returnFormatFail('查询不到相关商品');
    }
    let goods_price = goodsResult[0].shop_price;
    const spec_goods_price = await this.app
      .knex('spec_goods_price')
      .select('key', 'key_name', 'price', 'store_count', 'sku')
      .where({ goods_id });
    console.log(spec_goods_price);
    if (spec_goods_price.length > 0 && goods_spec === null) {
      return this.returnFormatFail('该订单有规格,请选择规格');
    }
    if (spec_goods_price.length > 0 && goods_spec) {
      goods_price = spec_goods_price[0].price;
    }

    if (goods_spec && spec_goods_price.length > 0) {
      const spec_num = spec_goods_price[0].store_count;
      if (goods_num > spec_num) {
        return this.returnFormatFail('该规格数量不足');
      }
    }
    // // 限时抢购，不能超过购买数量
    // if (goodsResult.prom_type === 1) {
    //   await this.app
    //     .knex('flash_sale')
    //     .where({ id: goodsResult[0].prom_id });
    // } else {
    // }

    // 判断是否之前加入过购物车
    const cartResult = await this.app
      .knex('cart')
      .where({ user_id, goods_id, spec_key: goods_spec });
    // 插入数据
    const data = {
      user_id,
      goods_id,
      goods_sn: goodsResult[0].goods_sn,
      goods_name: goodsResult[0].goods_name,
      goods_price,
      goods_num,
      prom_type: goodsResult[0].prom_type,
      prom_id: goodsResult[0].prom_id,
    };
    // 商品已经加入购物车
    if (cartResult.length > 0) {
      const alCartResult = cartResult[0];
      let goods_num = 0;
      if (goods_num + alCartResult.goods_num > goodsResult.store_count) {
        goods_num = goodsResult.store_count;
      } else {
        goods_num = alCartResult.goods_num;
      }
      await this.app
        .knex('cart')
        .where({ id: cartResult.id })
        .update({ goods_num });
    } else {
      const resutl = await this.app.knex('cart').insert(data);
      if (resutl) {
        return this.returnFormatSuccess('成功加入购物车');
      }
      return this.returnFormatFail('请求失败');
    }
  }

  // 限时限购活动获取可购买数量
  async getGoodsNumForFlashSale(goods_id, goods_num) {
    let goods;
    if (goods_id.constructor === Array) {
      goods = goods_id;
    } else {
      goods = await this.app.knex('goods').where({ goods_id });
    }
    if (goods[0].prom_type === 1) {
      const flash_sale = await this.app
        .knex('flash_sale')
        .where({ id: goods[0].prom_id })
        .andWhere('start_time', '<', Date())
        .end_time('start_time', '>', Date())
        .goods_num('buy_num', '>', 'buy_num');
      if (flash_sale.length > 0) {
        if (goods_num > flash_sale[0].buy_limit) {
          return flash_sale[0].buy_limit;
        }
        if (
          flash_sale[0].goods_num - flash_sale[0].buy_num <
                    goods_num
        ) {
          return flash_sale[0].goods_num - flash_sale[0].buy_num;
        }
      }
    }
    // 活动已取消或不参与活动
    return goods_num;
  }

  // 结算 已勾选购物车的总金额 返回:总金额、优惠金额、优惠活动类型、活动id
  async cartCount() {
    const user = this.ctx.state.userInfo;
    let cart_acount = 0; // /合计购物车总价
    let original_price = 0; // 市场价格
    let prom_acount = 0; // 优惠金额
    const prom_type = 0; // 活动方式
    const prom_id = 0; // 活动id
    const result = await this.app
      .knex('cart as a')
      .leftJoin('goods as b', 'b.goods_id', 'a.goods_id')
      .leftJoin('spec_goods_price as sgp', 'sgp.key', 'a.spec_key')
      .select(
        'sgp.price',
        'a.id',
        'a.goods_id',
        'a.goods_name',
        'a.market_price',
        'a.goods_num',
        'a.goods_price',
        'a.spec_key',
        'a.selected',
        'a.prom_type',
        'b.goods_remark',
        { image_url: 'b.original_img' },
        'b.is_on_sale',
        'b.cat_id'
      )
      .where({ selected: 1, user_id: user.user_id });
    if (result.length === 0) {
      return {
        cart_acount,
        original_price,
        prom_acount,
        prom_type,
        prom_id,
      };
    }

    for (const item of result) {
      cart_acount += item.goods_num * item.goods_price;
      original_price += item.market_price * item.goods_price;
    }
    prom_acount = original_price - cart_acount > 0 ? prom_acount : 0;

    return {
      cart_acount,
      original_price,
      prom_acount,
      prom_type,
      prom_id,
    };
  }
}

module.exports = CartService;
