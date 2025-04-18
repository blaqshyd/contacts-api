import asyncHandler from "express-async-handler";
import { statusCode } from "../constants.js";
import Contact from "../models/contactModel.js";

//@desc Get all contact
//@route GET /v1/contacts
//@access private

export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user_id: req.user_id });
  res.status(200).json(contacts);
});

//@desc Get contact
//@route GET /v1/contacts/:id
//@access private

export const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(statusCode.NOT_FOUND);
    throw new Error("Contact not found");
  }
  res.status(200).json(contact);
});

//@desc Create new contact
//@route POST /v1/contacts
//@access private

export const createContact = asyncHandler(async (req, res) => {
  // console.log('The request body is :', req.body)
  const { name, email, phoneNumber } = req.body;
  if (!name || !email || !phoneNumber) {
    res.status(statusCode.VALIDATION_ERROR);
    throw new Error("No field, all fields are mandatory");
  }
  const contact = await Contact.create({
    name,
    email,
    phoneNumber,
    user_id: req.user_id,
  });
  console.log("Created succesfully");
  res.status(statusCode.CREATED).json(contact);
});

//@desc Update contact
//@route PUT /v1/contacts/:id
//@access private

export const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(statusCode.NOT_FOUND);
    throw new Error("Contact not found");
  }
  if (contact.user_id.toString() !== req.user_id) {
    res.status(statusCode.FORBIDDEN);
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
//@route DELETE /v1/contacts
//@access private

export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(statusCode.NOT_FOUND);
    throw new Error("Contact not found");
  }

  if (contact.user_id.toString() !== req.user_id) {
    res.status(statusCode.FORBIDDEN);
    throw new Error("Permission declined!!!");
  }
  await Contact.deleteOne({ _id: req.params.id });
  res.status(statusCode.SUCESS).json(contact);
});
