import { statusCode } from "../constants.js";
import Contact from "../models/contactModel.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.userId });
    return successResponse(res, statusCode.OK, "Contacts fetched successfully", contacts);
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to fetch contacts", err.message);
  }
};

export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return errorResponse(res, statusCode.NOT_FOUND, "Contact not found");
    }
    if (contact.userId.toString() !== req.user.userId) {
      return errorResponse(res, statusCode.FORBIDDEN, "Access denied");
    }
    return successResponse(res, statusCode.OK, "Contact fetched successfully", contact);
  } catch (err) {
    if (err.name === "CastError") {
      return errorResponse(res, statusCode.NOT_FOUND, "Contact not found");
    }
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to fetch contact", err.message);
  }
};

export const createContact = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return errorResponse(res, statusCode.BAD_REQUEST, "All fields are required");
    }
    const contact = await Contact.create({
      name,
      email,
      phone,
      userId: req.user.userId,
    });
    return successResponse(res, statusCode.CREATED, "Contact created successfully", contact);
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to create contact", err.message);
  }
};

export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return errorResponse(res, statusCode.NOT_FOUND, "Contact not found");
    }
    if (contact.userId.toString() !== req.user.userId) {
      return errorResponse(res, statusCode.FORBIDDEN, "Access denied");
    }

    const updatedContact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return successResponse(res, statusCode.OK, "Contact updated successfully", updatedContact);
  } catch (err) {
    if (err.name === "CastError") {
      return errorResponse(res, statusCode.NOT_FOUND, "Contact not found");
    }
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to update contact", err.message);
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return errorResponse(res, statusCode.NOT_FOUND, "Contact not found");
    }
    if (contact.userId.toString() !== req.user.userId) {
      return errorResponse(res, statusCode.FORBIDDEN, "Access denied");
    }
    await Contact.deleteOne({ _id: req.params.id });
    return successResponse(res, statusCode.OK, "Contact deleted successfully", { id: req.params.id });
  } catch (err) {
    if (err.name === "CastError") {
      return errorResponse(res, statusCode.NOT_FOUND, "Contact not found");
    }
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to delete contact", err.message);
  }
};
