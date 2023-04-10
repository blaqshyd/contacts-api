const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");
const { constants } = require("../constants");
//@desc Get all contact
//@route GET /api/contacts
//@access private

const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user_id: req.user_id });
  res.status(200).json(contacts);
});

//@desc Get contact
//@route GET /api/contacts/:id
//@access private

const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(constants.NOT_FOUND);
    throw new Error("Contact not found");
  }
  res.status(200).json(contact);
});

//@desc Create new contact
//@route POST /api/contacts
//@access private

const createContact = asyncHandler(async (req, res) => {
  // console.log('The request body is :', req.body)
  const { name, email, phoneNumber } = req.body;
  if (!name || !email || !phoneNumber) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("No field, all fields are mandatory");
  }
  const contact = await Contact.create({
    name,
    email,
    phoneNumber,
    user_id: req.user_id,
  });
  console.log("Created succesfully");
  res.status(201).json(contact);
});

//@desc Update contact
//@route PUT /api/contacts/:id
//@access private

const updateContact = asyncHandler(async (req, res) => {
  const contact = Contact.findById(req.params.id);
  if (!contact) {
    res.status(constants.NOT_FOUND);
    throw new Error("Contact not found");
  }
  if (contact.user_id.toString() !== req.user_id) {
    res.status(constants.FORBIDDEN);
    throw new Error("Permission declined!!!");
  }

  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json(updatedContact);
});

//@desc Delete contact
//@route DELETE /api/contacts
//@access private

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(constants.NOT_FOUND);
    throw new Error("Contact not found");
  }

  if (contact.user_id.toString() !== req.user_id) {
    res.status(constants.FORBIDDEN);
    throw new Error("Permission declined!!!");
  }
  await Contact.deleteOne({ _id: req.params.id });
  res.status(constants.SUCESS).json(contact);
});

module.exports = {
  getContact,
  getContacts,
  createContact,
  updateContact,
  deleteContact,
};
