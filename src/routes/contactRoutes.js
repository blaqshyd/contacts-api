import { Router } from "express";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  updateContact,
} from "../controllers/contactController.js";
import validateToken from "../middleware/tokenValidator.js";

export const router = Router();
router.use(validateToken);

router.route("/").get(getContacts).post(createContact);

router.route("/:id").get(getContact).delete(deleteContact).put(updateContact);

export default router;
