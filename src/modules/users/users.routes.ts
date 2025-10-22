import { Router } from "express";
import { UserController } from "./users.controller";

const userRouter: Router = Router();
const userController = new UserController();

userRouter.post("/", userController.create);

export default userRouter;