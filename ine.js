#!/usr/bin/env node
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const parseString = require('xml2js').parseString
const mongoose = require('mongoose')
const query = require('./query')

mongoose.connect('mongodb://localhost/futures')

__current_date = moment(Date.now())
const Schema = mongoose.Schema, ObjectId = Schema.ObjectId

/*
铜 交割月份 前结算 今开盘 最高价 最低价 收盘价 结算参考价 涨跌1 涨跌2 成交 持仓 变化
*/
const Ine = mongoose.model('Ine', new Schema({
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
    url: `http://www.ine.cn/data/dailydata/kx/kx${date.format('YYYYMMDD')}.dat`,
    encoding: 'utf-8',
    json: true
  }, (err, res, body) => {
    if (err) {
      cb(true)
      return
    }
    if (res.statusCode != 200) {
      console.log(`${date.format('YYYYMMDD')} no data`)
    } else {
      console.log(`${date.format('YYYYMMDD')} complete`)
      DATE = `${body.o_year}${body.o_month}${body.o_day}`
      c = _.chain(body.o_curinstrument)
        .filter(record => record.HIGHESTPRICE != "")
        .map(record => _.mapValues(record, key => _.trim(key)))
        .value()
        .forEach(v => {
          const instance = new Ine(_.merge(v, { DATE }))
          instance.save((err) => {
            if(err) console.log(err)
          })
        })
    }
    cb(null)
  })
}, date => date.subtract(1, 'day'))
