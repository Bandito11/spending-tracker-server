import { Strategy as LocalStrategy } from 'passport-local'
import { PassportStatic } from 'passport'
import { hash, compare } from 'bcrypt'
import * as isemail from 'isemail'
import { MongoClient } from 'mongodb'
import { sign } from 'jsonwebtoken'
import { URL, DBNAME, USERSCOLL } from '../constants'
import { Credentials } from '../models/credentials'
import { ICredentials } from '../interfaces/ICredentials'

//How to use done() callback
// done(null, { email: email, password: password })
// done(null, false) //if error if email or password is incorrect
// done('An error') // Any other server error like database is not available

export function authenticate(passport: PassportStatic) {

    passport.use('login', new LocalStrategy(({ usernameField: 'email' }), async (email, password, done) => {
        if (!isemail.validate(email)) {
            done(`Invalid Email`)
        }
        try {
            const credentials = { ...Credentials }
            credentials.email = email
            credentials.password = password
            const checkedCredentialsOnDb = await getCredentialsFromDb(credentials)
            if (checkedCredentialsOnDb) {
                const result = await compare(credentials.password, checkedCredentialsOnDb.password)
                if (result) {
                    const payload = {
                        user: credentials.email
                    }
                    const token = sign(payload, process.env.JSONWEBTOKEN_SECRET, {
                        expiresIn: '24h'
                    })

                    done(null, { token: token })
                } else {
                    done(null, false)
                }
            } else {
                done(null, false)
            }
        } catch (error) {
            done(error)
        }
    }
    ))

    passport.use('signup', new LocalStrategy(({ usernameField: 'email' }), async (email, password, done) => {
        if (!isemail.validate(email)) {
            done(`Invalid Email`)
        }
        const saltRounds = 12
        const credentials = { ...Credentials }
        credentials.email = email

        Promise.all([hash(password, saltRounds), getCredentialsFromDb(credentials)])
            .then(vals => {
                const credentialsExistInDb = vals[1]
                if (!credentialsExistInDb) {
                    const hashedPassword = vals[0]
                    credentials.password = hashedPassword

                    // Create a new MongoClient
                    const client = new MongoClient(URL, {useUnifiedTopology: true })

                    client.connect(err => {
                        if (err) {
                            // console.error(err)
                            client.close()
                            done({statusCode: 400, error: err})
                        }
                        client.db(DBNAME).collection(USERSCOLL).insertOne(credentials)
                            .then(data => {
                                // console.log(`${data.insertedCount} user was added.`)
                                done(null, { statusCode: 201, message: 'User was created.' })
                                client.close()
                            })
                            .catch(() => {
                                done(null, false)
                                client.close()
                            })
                    })
                } else {
                    done(`${email} already exists in db. Please try another username.`)
                }
            })
            .catch(error => done({statusCode: 400, error: error}))
    }
    ))
}

function getCredentialsFromDb(credentials: ICredentials): Promise<{ username: string, password: string }> {
    return new Promise((resolve, reject) => {

        // Create a new MongoClient
        const client = new MongoClient(URL, {useUnifiedTopology: true })

        // Use connect method to connect to the Server
        client.connect(err => {
            if (err) {
                client.close()
                reject(err)
            }
            client.db(DBNAME).collection(USERSCOLL).findOne({ email: credentials.email })
                .then(data => {
                    client.close()
                    resolve(data)
                })
                .catch(error => {
                    // console.error(error)
                    client.close(error)
                    reject({statusCode: 400, error: error})
                })
        })
    })
}


