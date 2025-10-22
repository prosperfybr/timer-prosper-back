import { Router } from "express";
import userRouter from "./modules/users/users.routes";

const routes: Router = Router();

routes.use(userRouter);

export default routes;