// Import the bcryptjs library for hashing passwords
const bcrypt = require("bcryptjs");

// Define an object containing two user objects with unique IDs, email addresses, and hashed passwords
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Define a function that generates a random string of a given length
const generateRandomString = (length = 6) => {
  let randomString = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  ("randomString", randomString);
  return randomString;
};

// Define a function that returns a user object based on the given email address
function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined;
}

// Define a function that returns an object containing only the URLs associated with a given user ID
const urlsForUser = (urlDatabase, userID) => {
  const result = {}

  for (let shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === userID) {
      result[shortURL] = urlDatabase[shortURL].longURL
    }
  }

  return result
}

// Export all the functions and variables so they can be used in other modules
module.exports = { getUserByEmail, users , generateRandomString, urlsForUser, bcrypt };
