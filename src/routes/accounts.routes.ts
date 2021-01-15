import { Router, Request, Response, NextFunction } from 'express';
import { addAccount, updateAccount, removeAccount, getAccounts } from '../db/accounts.db';

const router = Router();

router.get('/accounts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await getAccounts(res.locals.decoded.user)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.post('/account/:account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            email: res.locals.decoded.user,
            account: req.params.account.toString()
        }
        const response = await addAccount(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.put('/account/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            email: res.locals.decoded.user,
            new: req.query.new.toString(),
            old: req.query.old.toString()
        }
        const response = await updateAccount(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.delete('/account/:account', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            email: res.locals.decoded.user,
            account: req.params.account.toString()
        }
        const response = await removeAccount(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

module.exports = router;
