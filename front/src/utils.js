export const getAvatarLetter = (username, email) => {
    return username?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'U';
};