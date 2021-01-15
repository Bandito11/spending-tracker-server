import { ITransaction, IRepeat, IEvery } from "../interfaces/ITransaction"
import { IAccount } from "../interfaces/IAccount"
import { ICategory } from "../interfaces/ICategory"
import { MongoClient } from "mongodb"
import { URL, DBNAME, FINANCECOLL } from "../constants"
import { toUppercase } from "../utils/toUppercase"
import { Account } from "../models/account"
import { Transaction } from "../models/transaction"
import { ICredentials } from "../interfaces/ICredentials"
import { Credentials } from "../models/credentials"

export async function getTransactionsByDay(opts: { email, date: string, account }) {
    const date = opts.date.split('-')
    const length = date.length
    const query = {
        email: opts.email,
        account: opts.account,
        day: parseInt(date[length - 1]),
        year: parseInt(date[length - 3]),
        month: parseInt(date[length - 2]),
    }
    return await getTransactionsByDate([
        {
            $project: {
                day: { $dayOfMonth: '$date' },
                month: { $month: '$date' },
                year: { $year: '$date' },
                account: '$account',
                email: '$email',
                repeat: '$repeat',
                time: '$time',
                date: '$date',
                amount: '$amount',
                note: '$note',
                category: '$category',
                transaction: '$transaction',
                timezone: '$timezone',
            }
        },
        {
            $match: query
        }
    ])
}

export async function getTransactionsByMonth(opts: { email, date, account }) {
    const date = opts.date.split('-')
    const length = date.length
    const query = {
        email: opts.email,
        account: opts.account,
        year: parseInt(date[length - 3]),
        month: parseInt(date[length - 2]),
    }
    return await getTransactionsByDate([
        {
            $project: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                account: '$account',
                email: '$email',
                repeat: '$repeat',
                time: '$time',
                date: '$date',
                amount: '$amount',
                note: '$note',
                category: '$category',
                transaction: '$transaction',
                timezone: '$timezone',
            }
        },
        {
            $match: query
        }
    ])
}


export async function getTransactionsByYear(opts: { email, date, account }) {
    const date = opts.date.split('-')
    const length = date.length
    const query = {
        email: opts.email,
        account: opts.account,
        year: parseInt(date[length - 3])
    }

    return await getTransactionsByDate([{
        $project: {
            year: { $year: '$date' },
            account: '$account',
            email: '$email',
            repeat: '$repeat',
            time: '$time',
            date: '$date',
            amount: '$amount',
            note: '$note',
            category: '$category',
            transaction: '$transaction',
            timezone: '$timezone',
        }
    }, {
        $match: query
    }])
}

function getTransactionsByDate(mongoPipelines: {}[]) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            client.db(DBNAME).collection(FINANCECOLL).aggregate(
                mongoPipelines,
                (error, cursor) => {
                    if (error) {
                        reject(error)
                        client.close()
                    }
                    cursor.toArray()
                        .then((data: (ITransaction & IAccount & ICategory)[]) => {
                            const transactions = data.map(transaction => {
                                const temp = {} as ITransaction & IAccount & ICategory
                                temp.account = transaction.account
                                temp.amount = transaction.amount
                                temp.category = transaction.category
                                temp.date = transaction.date
                                temp.note = transaction.note
                                temp.repeat = transaction.repeat
                                temp.time = transaction.time
                                temp.timezone = transaction.timezone
                                temp.transaction = transaction.transaction
                                return temp
                            })
                            resolve({ statusCode: 200, data: transactions })
                        })
                        .catch(error => reject(error))
                })
        })
    })
}

export function addNewTransaction(opts: ITransaction & IAccount & ICredentials) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            client.db(DBNAME).collection(FINANCECOLL).insertOne({ ...opts, date: new Date(opts.date) })
                .then(data => {
                    if (data) {
                        const message = toUppercase(`${opts.transaction} was added successfully on ${opts.account}.`)
                        resolve({
                            statusCode: 201,
                            message: message
                        })
                    } else {
                        const message = toUppercase(`${opts.transaction} was not added successfully on ${opts.account}. Please try again.`)
                        resolve({
                            statusCode: 204,
                            message: message
                        })
                    }
                    client.close()
                })
                .catch(error => {
                    //console.error(error)
                    reject(error)
                    client.close()
                })
        })
    })
}

export function removeTransaction(opts: { time: string, email: string, date: string, account: string }) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            client.db(DBNAME).collection(FINANCECOLL).findOneAndDelete({
                account: opts.account,
                date: new Date(opts.date),
                email: opts.email,
                time: opts.time
            },
                (error, result) => {
                    if (error) {
                        reject(error)
                        client.close()
                    }
                    if (result.value != null) {
                        resolve({ statusCode: 202, message: `Deleted this transaction successfully.` })
                    }
                    resolve({ statusCode: 204, message: `This transaction wasn't found in the database.` })
                    client.close()
                })
        })
    })
}

export function updateTransaction(opts: ITransaction & IAccount & ICredentials & { newDate: string, /*newTime: string */ }) {
    const query = {
        ...Account,
        ...Transaction,
        ...Credentials
    }
    if (opts.newDate) {
        query.date = opts.newDate
    } else {
        query.date = opts.date
    }
    // if (opts.newTime) {
    //     query.time = opts.newTime
    // } else {
    //     query.time = opts.time
    // }
    query.repeat = {} as IRepeat
    query.repeat.every = {} as IEvery
    query.category = {} as ICategory
    query.account = opts.account
    query.amount = opts.amount
    query.note = opts.note
    query.transaction = opts.transaction
    query.email = opts.email
    query.category.category = opts.category.category
    query.category.icon = opts.category.icon
    query.timezone = opts.timezone
    query.repeat.yes = opts.repeat.yes
    query.repeat.every.times = opts.repeat.every.times
    query.repeat.every.period = opts.repeat.every.period
    query.repeat.endDate = opts.repeat.endDate
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            client.db(DBNAME).collection(FINANCECOLL).findOneAndUpdate({
                account: opts.account,
                date: new Date(opts.date),
                email: opts.email,
                time: opts.time
            },
                { $set: { query, date: new Date(query.date) } },
                (error, result) => {
                    if (error) {
                        reject(error)
                        client.close()
                    }
                    if (result.value != null) {
                        const transaction: ITransaction & IAccount = {
                            account: result.value.account,
                            date: result.value.date,
                            time: result.value.time,
                            amount: result.value.amount,
                            note: result.value.note,
                            transaction: result.value.transaction,
                            timezone: result.value.timezone,
                            repeat: {
                                ...result.value.repeat
                            },
                            category: {
                                category: result.value.category.name,
                                icon: result.value.category.icon
                            }
                        }
                        resolve({ statusCode: 202, data: transaction })
                    }
                    resolve({ statusCode: 204, message: `This transaction wasn't found in the database.` })
                    client.close()
                })
        })
    })
}