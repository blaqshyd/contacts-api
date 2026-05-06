export const transformUser = (user, options = {}) => {
  const { includeSensitive = false } = options;

  const response = {
    userId: user._id,
    username: user.username,
    email: user.email,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (includeSensitive) {
    response.avatar = user.avatar;
    response.preferences = user.preferences;
  }

  return response;
};

export const transformUserMinimal = (user) => ({
  userId: user._id,
  username: user.username,
  email: user.email,
  updatedAt: user.updatedAt,
});
