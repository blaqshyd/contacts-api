import asyncHandler from "express-async-handler";

//@desc current user
//@route POST /api/users/current
//@access private

export const currentUserInfo = asyncHandler(async (req, res) => {
  res.json(req.user);
});
