#!/usr/bin/env node
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const parseString = require('xml2js').parseString
const mongoose = require('mongoose')
const iconv = require('iconv-lite')
const query = require('./query')
const isAlphanumeric = require('is-alphanumeric')
const debug = require('debug')('ctp:czce')

mongoose.connect('mongodb://localhost/futures')

const Schema = mongoose.Schema, ObjectId = Schema.ObjectId

/*
[ '品种月份',
'昨结算',
'今开盘',
'最高价',
'最低价',
'今收盘',
'今结算',
'涨跌1',
'涨跌2',
'成交量(手)',
'空盘量',
'增减量',
'成交额(万元)',
'交割结算价']
*/

const Czce = mongoose.model('Czce', new Schema({
  instrumentid: String,
  lstcloseprice: Number,
  openprice: Number,
  highestprice: Number,
  lowestprice: Number,
  closeprice: Number,
  settlementprice: Number, //结算价
  zd1: Number,
  zd2: Number,
  volume: Number, //成交量
  openinterest: Number, //空盘量
  delta: Number, //增减量
  turnover: Number, //成交额
  finalsettlementprice: Number, //交割结算价
  date: String
}))
query((date, cb) => {
  request({
    url: `http://www.czce.com.cn/portal/DFSStaticFiles/Future/${date.format('YYYY/YYYYMMDD')}/FutureDataDaily.txt`,
    encoding: null
  }, (error, response, body) => {
    if (error) {
      cb(true)
      return
    }
    if (response.statusCode != 200) {
      debug(`${date.format('YYYY-MM-DD')} no data`)
    } else {
      body = iconv.decode(body, 'gb2312')
      __date = date.format('YYMMDD')
      data = _.chain(body.split('\r\n'))
        .map(row => _.map(row.split('|'), v => _.trim(v).replace(/,/g, '')))
        .filter(d => isAlphanumeric(d[0]))
        .filter(d => _.size(d[0]) > 1)
        .value()
        .forEach(v => {
          const instance = new Czce
          _.forEach([
            'instrumentid',
            'lstcloseprice',
            'openprice',
            'highestprice',
            'lowestprice',
            'closeprice',
            'settlementprice',
            'zd1',
            'zd2',
            'volume',
            'openinterest',
            'delta',
            'turnover',
            'finalsettlementprice'
          ], (key, index) => {
            instance[key] = v[index]
          })
          instance.date = __date
          instance.save((err) => {
            if(err) debug(err)
          })
        })
    }
    cb(null)
  })
})
