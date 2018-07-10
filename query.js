#!/usr/bin/env node
const _ = require('lodash')
const moment = require('moment')
const async = require('async')
const debug = require('debug')('ctp:query')

current_date = moment('2018-07-05')

__start = Date.now()
count = 0
CONCURRENT_TASK = 10

module.exports = (fn, preprocess) => {
  const push_date = () => {
    q.push(moment(current_date))
    current_date.add(1, 'day')
  }
  const retry_date = date => {
    q.push(moment(date))
  }
  let q = async.queue((date, callback) => {
      fn(date, err => {
        if (!err) {
          count++
          debug(`${date.format('YYYYMMDD')} retrived | Speed: ${count / (Date.now() - __start) * 1000 * 60} / min`)
          setTimeout(() => push_date(), 500)
        } else {
          debug(`${date.format('YYYYMMDD')} failed, retrying...`)
          setTimeout(() => retry_date(date), 500)
        }
        callback()
      })
  }, CONCURRENT_TASK)
  if (preprocess) preprocess(current_date)
  _.range(CONCURRENT_TASK).forEach(() => push_date())
}

