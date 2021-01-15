import { MongoClient } from "mongodb"
import { CATEGORIESCOLL, URL, DBNAME } from "../constants"

export function getCategories(email: string) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(async error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            const collection = client.db(DBNAME).collection(CATEGORIESCOLL);
            try {
                const cursor = await collection.find({ email: email })
                const temp = await cursor.toArray()
                const categories = temp.map(category => {
                    return { account: category.category }
                })
                resolve({ statusCode: 200, data: categories })
            } catch (error) {
                reject(error)
            }
        })
    })
}

export function addCategory(opts: { email: string, category: string }) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(async error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            const collection = client.db(DBNAME).collection(CATEGORIESCOLL);
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
                            resolve({ statusCode: 202, message: `Added new category ${opts.category} to ${opts.email} successfully.` })
                        }
                        resolve({ statusCode: 204, message: `Couldn't add this category to the database.` })
                        client.close()
                    })
            } else
                resolve({ statusCode: 204, message: `Category ${opts.category} already exists under ${opts.email}` })
        })
    })
}

export function updateCategory(opts: { email: string, new: string, old: string }) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(async error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            const collection = client.db(DBNAME).collection(CATEGORIESCOLL)
            try {
                const result = await collection.findOne({ email: opts.email, category: opts.new })
                if (result) {
                    resolve({ statusCode: 204, message: `Couldn't update category ${opts.new} because it was found in the database.` })
                    client.close()
                } else {
                    client.db(DBNAME).collection(CATEGORIESCOLL).findOneAndUpdate({
                        email: opts.email,
                        category: opts.old
                    },
                        { $set: { email: opts.email, category: opts.new } },
                        (error, result) => {
                            if (error) {
                                reject(error)
                                client.close()
                            }
                            if (result.lastErrorObject.n >= 1) {
                                resolve({ statusCode: 202, message: `Updated category ${opts.old} to ${opts.new} successfully.` })
                            }
                            resolve({ statusCode: 204, message: `Couldn't update category ${opts.old} because it wasn't found in the database.` })
                            client.close()
                        })
                }
            } catch (error) {
                reject(error)
            }
        })
    })
}

export function removeCategory(opts: { email: string, category: string }) {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(async error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            client.db(DBNAME).collection(CATEGORIESCOLL).findOneAndDelete({
                email: opts.email,
                category: opts.category
            },
                (error, result) => {
                    if (error) {
                        reject(error)
                        client.close()
                    }
                    if (result.lastErrorObject.n >= 1) {
                        resolve({ statusCode: 202, message: `Deleted category ${opts.category} successfully.` })
                    }
                    resolve({ statusCode: 204, message: `Couldn't remove category ${opts.category} because it didn't find it in the database.` })
                    client.close()
                })
        })
    })
}

