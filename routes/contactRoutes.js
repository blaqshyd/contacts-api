const express = require("express");
const appRouter = express.Router();
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");
const validateToken = require("../middleware/validateTokenHandler");
appRouter.use(validateToken);

appRouter.route("/").get(getContacts).post(createContact);

appRouter
  .route("/:id")
  .get(getContact)
  .delete(deleteContact)
  .put(updateContact);

module.exports = appRouter;
