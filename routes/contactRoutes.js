import { Router } from "express";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  updateContact,
} from "../controllers/contactController.js";
import validateToken from "../middleware/validateTokenHandler.js";

const appRouter = Router();
appRouter.use(validateToken);

appRouter.route("/").get(getContacts).post(createContact);

appRouter
  .route("/:id")
  .get(getContact)
  .delete(deleteContact)
  .put(updateContact);

export default appRouter;
