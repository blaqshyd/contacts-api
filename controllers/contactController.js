const asyncHandler = require("express-async-handler");
//@desc Get all contact
//@route GET /api/contacts
//@access public

const getContacts = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Get all contacts" })
});

//@desc Get contact
//@route GET /api/contacts/:id
//@access public

const getContact = asyncHandler(async (req, res) => {
    res.status(200).json({ message: `Get contact for ${req.params.id}` })
});

//@desc Create new contact
//@route POST /api/contacts
//@access public

const createContact =asyncHandler (async (req, res) => {
    console.log('The request body is :', req.body)
    const {name, email, phoneNumber} = req.body;
    if (!name || !email || !phoneNumber){
        res.status(400);
        throw new Error('No field, all fields are mandatory');
    }
    res.status(201).json({ message: "New contact added succesfully" })
});

//@desc Update contact
//@route PUT /api/contacts/:id
//@access public

const updateContact = asyncHandler(async (req, res) => {
    res.status(201).json({ message: `Update contact for ${req.params.id}` })
});

//@desc DeLete contact
//@route DELETE /api/contacts
//@access public

const deleteContact = asyncHandler(async (req, res) => {
    res.status(200).json({ message: `Delete contact for ${req.params.id}` })
});

module.exports = { getContact, getContacts, createContact, updateContact, deleteContact };