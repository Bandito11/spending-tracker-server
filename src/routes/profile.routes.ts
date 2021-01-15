import { Request, Response, NextFunction, Router } from "express"
import { verifyUsername } from "../db/profile.db";


const router = Router();

router.get('/verify/username/:username', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await verifyUsername(req.params.username)
        res.send(response)
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = router