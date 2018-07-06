#!/usr/bin/env node
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const parseString = require('xml2js').parseString
const mongoose = require('mongoose')
const query = require('./query')
const debug = require('debug')('ctp:cffex')

mongoose.connect('mongodb://localhost/futures')

const Schema = mongoose.Schema, ObjectId = Schema.ObjectId

/*
合约代码	今开盘	最高价	最低价	成交量	成交金额	持仓量	今收盘	今结算	涨跌1	涨跌2	隐含波动率(%)	Delta
*/

const Cffex = mongoose.model('Cffex', new Schema({
  instrumentid: String,
  tradingday: String,
  openprice: Number,
  highestprice: Number,
  lowestprice: Number,
  closeprice: Number,
  openinterest: Number,
  presettlementprice: Number,
  settlementpriceif: Number,
  settlementprice: Number,
  volume: Number, //成交量
  turnover: Number, //成交金额
  productid: String,
  expiredate: String
}))


query((date, cb) => {
  request(`http://www.cffex.com.cn/sj/hqsj/rtj/${date.format('YYYYMM/DD')}/index.xml`, (error, response, body) => {
    if (error) {
      cb(true)
      return
    }
    parseString(body, function (err, result) {
      if ('dailydatas' in result) {
        c = _.chain(result.dailydatas.dailydata)
          .map(record => _.mapValues(record, key => key[0]))
          .value()
          .forEach(v => {
            const instance = new Cffex(v)
            instance.save((err) => {
              if(err) debug(err)
            })
          })
      } else {
        debug(`${date.format('YYYY-MM-DD')} no data`)
      }
    })
    cb(null)
  })
})
