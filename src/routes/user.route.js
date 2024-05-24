import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from '../middleware/multer.middleware.js';
const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser
)
//register user is from the user controllers


export default router;