import { MongoClient } from "mongodb"
import { URL, DBNAME, ACCOUNTSCOLL } from "../constants"

export function getAccounts(email: string) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(async error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            const collection = client.db(DBNAME).collection(ACCOUNTSCOLL);
            try {
                const cursor = await collection.find({ email: email })
                const temp = await cursor.toArray()
                const accounts = temp.map(account => {
                    return { account: account.account }
                })
                resolve({ statusCode: 200, data: accounts })
            } catch (error) {
                reject(error)
            }
        })
    })
}

export function addAccount(opts: { email: string, account: string }) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(async error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            const collection = client.db(DBNAME).collection(ACCOUNTSCOLL);
            const foundOne = await collection.findOne(opts)
            if (!foundOne) {
                collection.insertOne(
                    opts,
                    (error, result) => {
                        if (error) {
                            reject(error)
                            client.close()
                        }
                        if (result.result.ok >= 1) {
                            resolve({ statusCode: 202, message: `Added new account ${opts.account} to ${opts.email} successfully.` })
                        }
                        resolve({ statusCode: 204, message: `Couldn't add this account to the database.` })
                        client.close()
                    })
            } else
                resolve({ statusCode: 204, message: `Account ${opts.account} already exists under ${opts.email}` })
        })
    })
}

export function updateAccount(opts: { email: string, new: string, old: string }) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(async error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            const collection = client.db(DBNAME).collection(ACCOUNTSCOLL)
            try {
                const result = await collection.findOne({ email: opts.email, account: opts.new })
                if (result) {
                    resolve({ statusCode: 204, message: `Couldn't update account ${opts.new} because it was found in the database.` })
                    client.close()
                } else {
                    client.db(DBNAME).collection(ACCOUNTSCOLL).findOneAndUpdate({
                        email: opts.email,
                        account: opts.old
                    },
                        { $set: { email: opts.email, account: opts.new } },
                        (error, result) => {
                            if (error) {
                                reject(error)
                                client.close()
                            }
                            if (result.lastErrorObject.n >= 1) {
                                resolve({ statusCode: 202, message: `Updated account ${opts.old} to ${opts.new} successfully.` })
                            }
                            resolve({ statusCode: 204, message: `Couldn't update account ${opts.old} because it didn't find it in the database.` })
                            client.close()
                        })
                }
            } catch (error) {
                reject(error)
            }
        })
    })
}

export function removeAccount(opts: { email: string, account: string }) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(async error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            client.db(DBNAME).collection(ACCOUNTSCOLL).findOneAndDelete({
                email: opts.email,
                account: opts.account
            },
                (error, result) => {
                    if (error) {
                        reject(error)
                        client.close()
                    }
                    if (result.lastErrorObject.n >= 1) {
                        resolve({ statusCode: 202, message: `Deleted account ${opts.account} successfully.` })
                    }
                    resolve({ statusCode: 204, message: `Couldn't remove account ${opts.account} because it wasn't found it in the database.` })
                    client.close()
                })
        })
    })
}

