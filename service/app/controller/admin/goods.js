/*
 * @Author: mubin
 * @Date: 2018-08-30 09:44:17
 * @Last Modified by: mubin
 * @Last Modified time: 2018-08-30 09:45:13
 */
'use strict';
const fromat = require('../../utils/fromat');

const Controller = require('egg').Controller;

class GoodsController extends Controller {
  // 删除分类 -POST
  async deleteType() {
    const prams = this.ctx.request.body;
    let err;
    let data;
    if (!prams.id) {
      err = '请输入删除分类id';
    } else {
      const result = await this.app
        .knex('goods_category')
        .where({ parent_id: prams.id })
        .limit(1);
      if (result.length > 0) {
        err = '该分类下还有分类不得删除!';
      } else {
        // 判断是否有商品存在
        const result = await this.app
          .knex('goods')
          .where({ cat_id: prams.id })
          .limit(1);
        if (result.length > 0) {
          err = '该分类下有商品部的删除';
        } else {
          const result = await this.app
            .knex('goods_category')
            .where({ id: prams.id })
            .del();
          if (result.affectedRows === 0) {
            err = '查询Id失败';
          }
        }
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 新增修改分类 -POST
  async modifyType() {
    const prams = this.ctx.request.body;
    // action = 1 新增  action = 2 修改let err
    let data;
    let err;
    const type = {
      name: prams.name,
      mobile_name: prams.mobile_name,
      parent_id: prams.parent_id,
      sort_order: prams.sort_order,
      image: prams.image,
      is_hot: prams.ishot,
      cat_group: prams.cat_group,
      id: prams.id,
    };
    if (prams.id && prams.id > 0) {
      const result = await this.app
        .knex('goods_category')
        .where({ id: prams.id })
        .update(type);
      if (result === 1) {
        await this.service.goods.parentPath();
      } else {
        err = '更新失败';
      }
    } else {
      const result = await this.app.knex('goods_category').insert(type);
      if (result.length > 0) {
        await this.service.goods.parentPath(result[0]);
      } else {
        err = '插入失败';
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 获取所有分类 -GET
  async getTypeList() {
    const result = await this.app
      .knex({ a: 'goods_category' })
      .select(
        'a.id',
        'a.name',
        'a.sort_order',
        'a.is_hot',
        'a.is_show',
        'a.parent_id',
        { parent_name: 'b.name' }
      )
      .leftJoin({ b: 'goods_category' }, 'a.parent_id', 'b.id');

    const data = result;
    let val = [];
    // 如果树状则排列
    if (this.ctx.query.istree && Number(this.ctx.query.istree) > 0) {
      data.forEach(function(item) {
        delete item.children;
      });
      const map = {};
      data.forEach(function(item) {
        map[item.id] = item;
      });

      data.forEach(function(item) {
        const parent = map[item.parent_id];
        if (parent) {
          (parent.children || (parent.children = [])).push(item);
        } else {
          val.push(item);
        }
      });
    } else {
      val = data;
    }
    this.ctx.body = fromat(true, val);
  }
  // 获取商品分类 -GET
  async categoryDetail() {
    const prams = this.ctx.query;
    let data;
    let err;
    if (prams.id) {
      const result = await this.app
        .knex('goods_category')
        .where({ id: prams.id });
      if (result.length > 0) {
        data = result[0];
      } else {
        err = '查询的分类id无效';
      }
    } else {
      err = '请输入分类id';
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 商品列表 -GET
  async goodsList() {
    const prams = this.ctx.request.body;
    const pageSize = Math.abs(prams.pageSize >> 0) || 10; // 分页率
    let page = Math.abs(prams.page >> 0) || 1; // 当前页码
    const offset = (page - 1) * pageSize;
    let data;
    let err;

    // 总数量
    const result = await this.app
      .knex('goods')
      .count({ count: 'goods_id' })
      .where(builder => {
        if (prams.goods_name) {
          builder.where(
            'goods_name',
            'like',
            '%' + prams.goods_name + '%'
          );
        }
      });
    const total = result[0].count; // 总数量
    const pages = Math.ceil(total / pageSize);

    if (page > pages) {
      page = Math.max(1, pages); // 以防没数据
    }
    const list_result = await this.app
      .knex({ a: 'goods' })
      .select(
        'a.goods_id',
        { category_name: 'b.name' },
        { category_id: 'a.cat_id' },
        'a.extend_cat_id',
        'a.goods_sn',
        'a.goods_name',
        'a.click_count',
        'a.store_count',
        'a.comment_count',
        'a.weight',
        'a.volume',
        'a.market_price',
        'a.shop_price',
        'a.market_price',
        'a.price_ladder',
        'a.is_hot',
        'a.is_new',
        'a.is_on_sale'
      )
      .leftJoin({ b: 'goods_category' }, 'a.cat_id', 'b.id')
      .where(builder => {
        if (prams.goods_name) {
          builder.where(
            'goods_name',
            'like',
            '%' + prams.goods_name + '%'
          );
        }
      })
      .offset(offset)
      .limit(pageSize);
    data = {
      list_result,
      total,
    };
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 删除商品 -POST
  async deleteGoods() {
    const prams = this.ctx.request.body;
    let err;
    let data;
    if (!prams.goods_id) {
      err = '请输入商品id';
    } else {
      // 判断订单表是否有当前商品
      const result = await this.app
        .knex('order_goods')
        .where({ goods_id: prams.goods_id });
      if (result.length > 0) {
        err = '该id为' + prams.goods_id + '商品有订单,不得删除';
      } else {
        const result = await this.app
          .knex('goods')
          .where({ goods_id: prams.goods_id })
          .del();
        if (result !== 1) {
          err = '删除失败';
        }
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 获取单个商品 GET-请求
  async getGood() {
    const prams = this.ctx.query;
    let data;
    let err;
    if (!prams.goods_id) {
      err = '请输入商品号';
    } else {
      const result = await this.app
        .knex({ a: 'goods' })
        .select(
          'a.goods_id',
          'a.keywords',
          'b.parent_id_path',
          'a.cat_id',
          'a.extend_cat_id',
          'a.goods_sn',
          'a.goods_name',
          'a.click_count',
          'a.brand_id',
          'a.store_count',
          'a.comment_count',
          'a.weight',
          'a.volume',
          'a.market_price',
          'a.shop_price',
          'a.goods_remark',
          'a.goods_content',
          'a.is_on_sale',
          'a.is_free_shipping',
          'a.on_time',
          'a.is_new',
          'a.is_recommend',
          'a.is_hot',
          'a.last_update',
          'a.sales_sum'
        )
        .leftJoin({ b: 'goods_category' }, 'a.cat_id', 'b.id')
        .where({ goods_id: prams.goods_id });

      if (result.length > 0) {
        data = result[0];
      } else {
        err = '该商品不存在';
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
  // 新增和编辑商品 -POST
  async updateGoods() {
    const prams = this.ctx.request.body;
    let err;
    let data;
    // 判断修改还是新增
    const type = prams.goods_id > 0 ? 2 : 1;

    const obj = {
      cat_id: '商品分类',
      goods_name: '商品名称',
      weight: '商品重量',
      volume: '商品体积',
      shop_price: '本店价',
      market_price: '市场价',
      keywords: '商品关键词',
    };
    for (const key in obj) {
      if (!prams[key]) {
        err = obj[key] + '不能为空！';
        break;
      }
    }
    if (!err) {
      const goodsDic = {
        market_price: prams.market_price,
        cat_id: prams.cat_id,
        goods_sn: prams.goods_sn,
        goods_name: prams.goods_name,
        store_count: prams.store_count,
        weight: prams.weight,
        volume: prams.volume,
        shop_price: prams.shop_price,
        keywords: prams.keywords,
        goods_remark: prams.goods_remark,
        goods_content: prams.goods_content,
        is_free_shipping: prams.is_free_shipping,
      };
      if (type === 1) {
        const result = await this.app.knex('goods').insert(goodsDic);
        if (result.length <= 0) {
          err = '插入失败';
        }
        await this.service.goods.afterSave(result[0]);
      }
      // 编辑
      if (type === 2) {
        if (!prams.goods_id) {
          err = '请输入商品id';
        }
        const result = await this.app
          .knex('goods')
          .update(goodsDic)
          .where({ goods_id: prams.goods_id });
        if (result !== 1) {
          err = '更新失败';
        } else {
          await this.app
            .knex('cart')
            .update(this.app.knex.raw)
            .where(builder => {
              if (prams.market_price) {
                builder.where({
                  market_price: prams.market_price,
                });
              }
              if (prams.shop_price) {
                builder.where({
                  goods_price: prams.shop_price,
                });
              }
              if (prams.shop_price) {
                builder.where({
                  member_goods_price: prams.shop_price,
                });
              }
            });
        }
      }
    }
    this.ctx.body = fromat(!err, data, err, !err === true ? 200 : 0);
  }
}

module.exports = GoodsController;
