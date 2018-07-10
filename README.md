# stunning-chainsaw

## aka CTP-history read

This project fetches data from major China future markets and save them to MongoDB.

## Usage

1. Setup MongoDB with default settings. For quick start, install docker and run `db.sh`.
2. Run `DEBUG=ctp:* node xxx.js`

## Reference

* `cffex.js` -> [中国金融期货交易所](http://www.cffex.com.cn/)
* `czce.js` -> [郑州商品交易所](http://www.czce.com.cn/)
* `dce.js` -> [大连商品交易所](http://www.dce.com.cn/)
* `shfe.js` -> [上海期货交易所](http://www.shfe.com.cn/)

If you want to control whether to fetch data from now to past or from past to now, edit `query.js`.

* `current_date` -> Start date
* `current_date.add(1, 'day')` -> Step, you can change it to `subtract`
* `CONCURRENT_TASK` -> Maximum url number to fetch at the same time

## License

DO WHATEVER YOU WANT.
