import { Router, Request, Response, NextFunction } from 'express';
import { Account } from '../models/account';
import { Transaction } from '../models/transaction';
import { Credentials } from '../models/credentials';
import { IRepeat, IEvery } from '../interfaces/ITransaction';
import { getTransactionsByDay, getTransactionsByMonth, getTransactionsByYear, addNewTransaction, updateTransaction, removeTransaction } from '../db/transactions.db';
import { ICategory } from '../interfaces/ICategory';

const router = Router();

router.get('/transaction/by/day/date/:date/account/:account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            date: req.params.date.toString(),
            account: req.params.account.toString(),
            email: res.locals.decoded.user
        }
        const response = await getTransactionsByDay(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.get('/transaction/by/month/date/:date/account/:account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            date: req.params.date.toString(),
            account: req.params.account.toString(),
            email: res.locals.decoded.user
        }
        const response = await getTransactionsByMonth(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.get('/transaction/by/year/date/:date/account/:account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            date: req.params.date.toString(),
            account: req.params.account.toString(),
            email: res.locals.decoded.user
        }
        const response = await getTransactionsByYear(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.post('/transaction/account/:account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = { ...Account, ...Transaction, ...Credentials }
        query.repeat = {} as IRepeat
        query.category = {} as ICategory
        query.repeat.every = {} as IEvery
        query.email = res.locals.decoded.user
        query.time = req.query.time.toString()
        query.account = req.params.account.toString()
        query.date = req.query.date.toString()
        query.amount = parseInt(req.query.amount as string)
        query.note = req.query.note.toString()
        query.category.category = req.query.categoryname.toString()
        query.category.icon = req.query.categoryicon.toString()
        query.transaction = req.query.transaction as 'expenses' | 'income'
        query.timezone = req.query.timezone.toString()
        req.query.repeat.toString() === 'true' ? query.repeat.yes = true : query.repeat.yes = false
        query.repeat.every.times = parseInt(req.query.everytime.toString())
        query.repeat.every.period = req.query.everyperiod.toString()
        query.repeat.endDate = req.query.enddate.toString()
        const response = await addNewTransaction(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.put('/transaction/time/:time/date/:date/account/:account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = { ...Transaction, ...Account, ...Credentials }
        query.repeat = {} as IRepeat
        query.repeat.every = {} as IEvery
        query.category = {} as ICategory
        query.email = res.locals.decoded.user
        query.time = req.params.time
        query.account = req.params.account
        query.date = req.params.date
        query.amount = parseInt(req.query.amount.toString())
        query.category.category = req.query.categoryname.toString()
        query.category.icon = req.query.categoryicon.toString()
        query.note = req.query.note.toString()
        query.transaction = req.query.transaction as 'expenses' | 'income'
        query.timezone = req.query.timezone.toString()
        req.query.repeat.toString() === 'true' ? query.repeat.yes = true : query.repeat.yes = false
        query.repeat.every.times = parseInt(req.query.everytime.toString())
        query.repeat.every.period = req.query.everyperiod.toString()
        query.repeat.endDate = req.query.enddate.toString()
        let newDate = null
        if (req.query['newdate']) {
            newDate = req.query.newdate.toString()
        }
        // let newTime = null
        // if (req.query['newtime']) {
        //     newTime = req.query.newtime.toString()
        // }
        const response = await updateTransaction({ ...query, /*newTime: newTime,*/ newDate: newDate })
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.delete('/transaction/time/:time/date/:date/account/:account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = {
            date: req.params.date,
            time: req.params.time,
            account: req.params.account,
            email: res.locals.decoded.user
        }
        const response = await removeTransaction(params)
        res.send(response)
    } catch (error) {
        next(error)
    }
})


module.exports = router;
