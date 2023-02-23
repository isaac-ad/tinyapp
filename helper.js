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
  const generateRandomString = (length) => {
    let randomString = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }
    console.log("randomString", randomString);
    return randomString;
  };
  
  function getUserByEmail(email) {
    for (const userId in users) {
      if (users[userId].email === email) {
        return users[userId];
      }
    }
    return false;
  }

module.exports = { getUserByEmail, users , generateRandomString };  