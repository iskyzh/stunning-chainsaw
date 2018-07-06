#!/usr/bin/env node
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const parseString = require('xml2js').parseString
const mongoose = require('mongoose')
const query = require('./query')
const isAlphanumeric = require('is-alphanumeric')
const isNumber = require('is-number');
mongoose.connect('mongodb://localhost/futures')

const Schema = mongoose.Schema, ObjectId = Schema.ObjectId

/*
商品名称 + 交割月份 开盘价 最高价 最低价 收盘价 前结算价 结算价 涨跌 涨跌1 成交量 持仓量 持仓量变化 成交额
*/

const Dce = mongoose.model('Dce', new Schema({
  instrumentname: String,
  instrumentmonth: String,
  openprice: Number,
  highestprice: Number,
  lowestprice: Number,
  closeprice: Number,
  presettlementprice: Number,
  settlementprice: Number,
  zd: Number,
  zd1: Number,
  volume: Number, //成交量
  openinterest: Number, //持仓量
  delta: Number, //持仓量变化
  turnover: Number, //成交额
  date: String
}))


query((date, cb) => {
  request.post({
    url: 'http://www.dce.com.cn/publicweb/quotesdata/exportDayQuotesChData.html',
    form: {
      'dayQuotes.variety' :'all',
      'dayQuotes.trade_type': 0,
      year: date.format('YYYY'),
      month: (parseInt(date.format('M')) - 1),
      day: date.format('DD'),
      exportFlag: 'txt'
    }
  }, (err, res, body) => {
    if (err) {
      cb(true)
      return
    }
    if (res.statusCode != 200) {
      console.log(`${date.format('YYYY-MM-DD')} no data`)
      return
    }
    d = _.chain(body.split('\r\n'))
      .map(v => _(v.replace(/\t\t/g, '\t').split('\t'))
        .map(v => v.replace(/,/g, ''))
        .filter(v => v != "")
        .value()
      )
      .filter(v => v[2] != "" && _.size(v) > 5)
      .map(v => ({
        instrumentname: v[0],
        instrumentmonth: v[1],
        openprice: v[2],
        highestprice: v[3],
        lowestprice: v[4],
        closeprice: v[5],
        presettlementprice: v[6],
        settlementprice: v[7],
        zd: v[8],
        zd1: v[9],
        volume: v[10],
        openinterest: v[11],
        delta: v[12],
        turnover: v[13],
        date: date.format('YYMMDD')
      }))
      .filter(v => isNumber(v.turnover))
      .value()
    console.log(`-> ${_.size(d)} entries retrived`)
      d.forEach(v => {
        const instance = new Dce(v)
        instance.save((err) => {
          if(err) console.log(err)
        })
      })
    cb(null)
  })
}, date => date.subtract(1, 'day'))
