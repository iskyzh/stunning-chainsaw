#!/usr/bin/env node
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const parseString = require('xml2js').parseString
const mongoose = require('mongoose')
const query = require('./query')
const isAlphanumeric = require('is-alphanumeric')
const debug = require('debug')('ctp:shfe')

mongoose.connect('mongodb://localhost/futures')

__current_date = moment(Date.now())
const Schema = mongoose.Schema, ObjectId = Schema.ObjectId

/*
铜 交割月份 前结算 今开盘 最高价 最低价 收盘价 结算参考价 涨跌1 涨跌2 成交 持仓 变化
*/
const Shfe = mongoose.model('Shfe', new Schema({
  PRODUCTID: String,
  PRODUCTSORTNO: Number,
  PRODUCTNAME: String,
  DELIVERYMONTH: String,
  PRESETTLEMENTPRICE: Number,
  OPENPRICE: Number,
  HIGHESTPRICE: Number,
  LOWESTPRICE: Number,
  CLOSEPRICE: Number,
  SETTLEMENTPRICE: Number,
  ZD1_CHG: Number,
  ZD2_CHG: Number,
  VOLUME: Number,
  OPENINTEREST: Number,
  OPENINTERESTCHG: Number,
  ORDERNO: Number,
  DATE: String
}))

query((date, cb) => {
  request({
    url: `http://www.shfe.com.cn/data/dailydata/kx/kx${date.format('YYYYMMDD')}.dat`,
    encoding: 'utf-8',
    json: true
  }, (err, res, body) => {
    if (err) {
      cb(true)
      return
    }
    if (res.statusCode != 200) {
      debug(`${date.format('YYYYMMDD')} no data`)
    } else {
      DATE = `${body.o_year}${body.o_month}${body.o_day}`
      c = _.chain(body.o_curinstrument)
        .map(record => _.mapValues(record, key => _.trim(key)))
        .filter(record => isAlphanumeric(record.DELIVERYMONTH) && _.size(record.DELIVERYMONTH) > 1)
        .value()

      c.forEach(v => {
        const instance = new Shfe(_.merge(v, { DATE }))
        instance.save((err) => {
          if(err) debug(err)
        })
      })
      debug(`${date.format('YYYYMMDD')} ${_.size(c)} entries`)
    }
    cb(null)
  })
}, date => date.subtract(1, 'day'))
