/*
 * @Author: mubin
 * @Date: 2018-08-29 18:00:27
 * @Last Modified by:   mubin
 * @Last Modified time: 2018-08-29 18:00:27
 */

'use strict';

const Controller = require('./base');

class GoodsController extends Controller {
  // 获取单个商品 GET-请求
  async getGood() {
    const prams = this.ctx.query;
    if (!prams.goods_id) {
      return this.returnFormatFail('请输入商品id');
    }
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
      return this.returnFormat(true, result[0], '请求成功', 200);
    }
    return this.returnFormatFail('搜索商品无效');
  }
  // 商品列表 -GET
  async goodsList() {
    const prams = this.ctx.request.body;
    const pageSize = Math.abs(prams.pageSize >> 0) || 10; // 分页率
    let page = Math.abs(prams.page >> 0) || 1; // 当前页码
    const offset = (page - 1) * pageSize;
    // 总数量
    const result = await this.app
      .knex('goods')
      .count({ count: 'goods_id' })
      .where(builder => {
        if (prams.keywords) {
          builder.where(
            'goods_name',
            'like',
            '%' + prams.keywords + '%'
          );
        }
        if (prams.cat_id) {
          builder.where({
            cat_id: prams.cat_id,
          });
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
        if (prams.keywords) {
          builder.where(
            'goods_name',
            'like',
            '%' + prams.keywords + '%'
          );
        }
      })
      .offset(offset)
      .limit(pageSize);

    const data = {
      list_result,
      total,
    };
    return this.returnFormatSuccess(data);
  }
}

module.exports = GoodsController;
