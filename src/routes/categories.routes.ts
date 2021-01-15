import { Router, Request, Response, NextFunction } from 'express';
import { addCategory, updateCategory, removeCategory, getCategories } from '../db/categories.db';

const router = Router();

router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await getCategories(res.locals.decoded.user)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.post('/category/:category', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            email: res.locals.decoded.user,
            category: req.params.category.toString()
        }
        const response = await addCategory(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.put('/category/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            email: res.locals.decoded.user,
            new: req.query.new.toString(),
            old: req.query.old.toString()
        }
        const response = await updateCategory(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

router.delete('/category/:category', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = {
            email: res.locals.decoded.user,
            category: req.params.category.toString()
        }
        const response = await removeCategory(query)
        res.send(response)
    } catch (error) {
        next(error)
    }
})

module.exports = router;
