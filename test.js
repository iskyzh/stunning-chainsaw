#!/usr/bin/env node
const request = require('request')
const _ = require('lodash')
const moment = require('moment')
const parseString = require('xml2js').parseString
const mongoose = require('mongoose')
const query = require('./query')
const isAlphanumeric = require('is-alphanumeric')

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

Dce.find({}, (err, models) => {
  _.forEach(models, model => {
    console.log(model.instrumentname)
  })
})
