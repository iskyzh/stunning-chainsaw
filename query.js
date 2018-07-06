#!/usr/bin/env node
const _ = require('lodash')
const moment = require('moment')
const async = require('async')
const debug = require('debug')('ctp:query')

current_date = moment(Date.now())

__start = Date.now()
count = 0

module.exports = (fn, preprocess) => {
  let q = async.queue((date, callback) => {
      fn(date, err => {
        if (!err) {
          count++
          debug(`${date.format('YYYYMMDD')} retrived | Speed: ${count / (Date.now() - __start) * 1000 * 60} / min`)
          setTimeout(() => q.push(moment(date).subtract(5, 'day')), 500)
        } else {
          debug(`${date.format('YYYYMMDD')} failed, retrying...`)
          setTimeout(() => q.push(moment(date)), 500)
        }
        callback()
      })
  }, 5)
  if (preprocess) preprocess(current_date)
  q.push(moment(current_date))
  q.push(moment(current_date).subtract(1, 'day'))
  q.push(moment(current_date).subtract(2, 'day'))
  q.push(moment(current_date).subtract(3, 'day'))
  q.push(moment(current_date).subtract(4, 'day'))
}

// CZCE: http://www.czce.com.cn/portal/DFSStaticFiles/Future/2018/20180704/FutureDataDaily.txt
// DCE: http://www.dce.com.cn/publicweb/quotesdata/exportDayQuotesChData.html | dayQuotes.variety: all
// INE: http://www.ine.cn/data/dailydata/kx/kx20180705.dat
/*
dayQuotes.trade_type: 0
year: 2018
month: 6
day: 03
exportFlag: txt
*/
