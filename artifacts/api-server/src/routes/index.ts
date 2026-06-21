import { Router, type IRouter } from "express";
import healthRouter from "./health";
import riskRouter from "./risk";
import usersRouter from "./users";
import claimsRouter from "./claims";
import walletRouter from "./wallet";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/risk", riskRouter);
router.use("/users", usersRouter);
router.use("/claims", claimsRouter);
router.use("/wallet", walletRouter);

export default router;
