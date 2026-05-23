import {Router} from "express"
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth("contributor", "maintainer"), issueController.createIssue)
router.get("/", auth("contributor", "maintainer"), issueController.getAllIssues)
router.get("/:id", auth("contributor", "maintainer"), issueController.getSingleIssue)
router.patch("/:id", auth("contributor", "maintainer"), issueController.updateIssue)
router.delete("/:id", auth("maintainer"), issueController.deleteIssue)


export const issueRoute = router;