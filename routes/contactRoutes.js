const express = require("express");
const router = express.Router();
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");
const validateToken = require("../middleware/validateTokenHandler");
router.use(validateToken);

router.route("/").get(getContacts).post(createContact);

router.route("/:id").get(getContact).delete(deleteContact).put(updateContact);

module.exports = router;
