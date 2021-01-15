import { URL, DBNAME, USERSCOLL } from "../constants";
import { MongoClient } from 'mongodb'
import { Credentials } from "../models/credentials";


export function verifyUsername(username) {
    const credentials = { ...Credentials }
    credentials.username = username
    return new Promise((resolve, reject) => {
        const client = new MongoClient(URL, { useUnifiedTopology: true })
        client.connect(error => {
            if (error) {
                //console.error(err)
                reject(error)
                client.close()
            }
            client.db(DBNAME).collection(USERSCOLL).findOne({ username: credentials.username })
                .then(data => {
                    if (data) {
                        resolve({ statusCode: 200, verified: true })
                    } else {
                        resolve({ statusCode: 204, verified: false })
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
