const express = require('express')
const router = express.Router()
const db = require('../models')
const Record = db.Record
const { authenticated } = require('../config/auth')
const { getTotal } = require('../expense-tracker')


// 瀏覽全部資料
router.get('/', authenticated, (req, res) => {
  res.redirect('/record/')
})

// 瀏覽條件篩選資料  
router.get('/filter', authenticated, (req, res) => {

  const filter = req.query

  Record.findAll({
    raw: true,
    nest: true,
    where: { UserId: req.user.id }
  })
    .then(records => {

      if (filter.month || filter.category) {//是否有勾選篩選條件

        records = records.filter(record => {

          let recordsMonth = record.date.getMonth() + 1

          const getTime = record.date
          record.date = getTime.toLocaleDateString()

          if (filter.month && filter.category) {  //篩選月份&類別
            return (filter.month.includes(recordsMonth.toString()) &&  //是否符合篩選月份&類別
              filter.category.includes(record.category))
          }
          else if (filter.month) {  //僅篩選月份
            return (filter.month.includes(recordsMonth.toString())) //是否符合篩選月份
          }
          else if (filter.category) { //僅篩選類別
            return (filter.category.includes(record.category)) //是否符合篩選類別
          }
          else {
            return false
          }

        })
      } else {

        for (record of records) {

          const getTime = record.date
          record.date = getTime.toLocaleDateString()
        }
      }

      return res.render('index', { records, totalAmount: getTotal(records), filter })

    }).catch((error) => { return res.status(422).json(error) })
})

module.exports = router