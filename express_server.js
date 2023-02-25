// Importing required modules and helper functions
const express = require("express");
const cookieSession = require("cookie-session");
const {
getUserByEmail,
users,
generateRandomString,
urlsForUser,
bcrypt,
} = require("./helper");

const app = express();
const port = 8080; // Setting up the server port number to 8080.

// Use cookie session middleware to manage user sessions
app.use(cookieSession({
  name: 'session',
  keys: ["pass"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// Set view engine to EJS
app.set("view engine", "ejs");

// Database to store URLs
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
};

// Use middleware to parse URL encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware function to redirect logged in user from accessing login and register page
const redirectLoggedInUser = (req, res, next) => {
  if (req.session.userID) {
    return res.redirect("/urls");
  }
  next();
};

// Middleware function to add session user ID to response locals
app.use((req, res, next) => {
  res.locals.userID = req.session["userID"];
  next();
});

// Middleware function to check if user is logged in
const checkUserLoggedIn = (req, res, next) => {
  if (!req.session.userID) {
    return res.redirect("/login");
  }
  next();
};

// Render header template with user ID
app.get("/", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Return URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Render new URL creation page
app.get("/urls/new", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

// Render URL show page for given ID
app.get("/urls/:id", (req, res) => {
  // Check if user is logged in
  if (!req.session.userID) {
    return res.send("User is not logged in");
  }
  // Check if URL with given ID exists
  if (!urlDatabase[req.params.id]) {
    return res.send("shortURL doesnt exist");
  }
  // Check if URL with given ID belongs to user
  if (urlDatabase[req.params.id].userID !== req.session.userID) {
    return res.send("This url doesn't belong to you");
  }
  // Render URL show page with URL information and user information
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.userID],
  };
  res.render("urls_show", templateVars);
});

// Render URL index page for logged in user
app.get("/urls", (req, res) => {
  const id = req.session.userID;
  // Check if user is logged

  if (!id) {
    return res.send("User is not logged in");
  }
// Get the user object from the users database
const user = users[id];

// Set up template variables to pass to the view
const templateVars = { urls: urlsForUser(urlDatabase, id), user: user };

// Render the view with the template variables
res.render("urls_index", templateVars);
});

// 
app.get("/u/:id", (req,res) => {
  if(!urlDatabase[req.params.id]) {
    return res.send("short url doesn't exist")
  }

  res.redirect(urlDatabase[req.params.id].longURL)
})

// Set up a route to display the login page
app.get("/login", redirectLoggedInUser, (req, res) => {
// Get the user ID from the session
const id = req.session.userID;

// Get the user object from the users database
const user = users[id];

// Set up template variables to pass to the view
const templateVars = { user: user };

// Render the view with the template variables
res.render("login", templateVars);
});

// Set up a route to create a new short URL
app.post("/urls", (req, res) => {
// Generate a random short URL
const shortURL = generateRandomString(4);

// Get the long URL from the request body
const longURL = req.body.longURL;
if(!longURL) return res.send("Long url field cannot be left blank")

// Add the URL to the database with the user ID from the session
urlDatabase[shortURL] = { longURL, userID: req.session.userID };

// Redirect to the page for the new short URL
res.redirect(`/urls/${shortURL}`);
});

// Set up a route to delete a short URL
app.post("/urls/:id/delete", (req, res) => {
// Check if user is logged in
if (!req.session.userID) {
  return res.send("User is not logged in");
}

// Check if the short URL exists in the database
if (!urlDatabase[req.params.id]) {
  return res.send("shortURL doesnt exist");
}

// Check if the short URL belongs to the logged-in user
if (urlDatabase[req.params.id].userID !== req.session.userID) {
  return res.send("This url doesn't belong to you");
}

// Delete the URL from the database
const id = req.params.id;
delete urlDatabase[id];

// Redirect to the list of URLs
res.redirect("/urls");
});

// Set up a route to update a long URL
app.post("/urls/:id", (req, res) =>  {
// Check if user is logged in
if (!req.session.userID) {
  return res.send("User is not logged in");
}

// Check if the short URL exists in the database
if (!urlDatabase[req.params.id]) {
  return res.send("shortURL doesnt exist");
}

// Check if the short URL belongs to the logged-in user
if (urlDatabase[req.params.id].userID !== req.session.userID) {
  return res.send("This url doesn't belong to you");
}

// Update the long URL in the database
const id = req.params.id;
const newLongURL = req.body.longURL;
if(!newLongURL) return res.send("Long url field cannot be left blank")
urlDatabase[id].longURL = newLongURL;

// Redirect to the list of URLs
res.redirect("/urls");
});

// Handle POST request to log in a user
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Find user with given email
  const user = getUserByEmail(email);
  if (!user) {
  return res.status(403).send("User with this email does not exist!");
  }
  // Check if the provided password matches the stored hash
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
  return res.status(403).send("Invalid password");
  }
  // Set user ID in the session and redirect to the URLs page
  req.session.userID = user.id;
  res.redirect("/urls");
  });
  
  // Handle POST request to log out a user
  app.post("/logout", (req, res) => {
  // Clear the session and redirect to the login page
  req.session = null;
  res.redirect("/login");
  });
  
  // Handle GET request to show the registration page
  app.get("/register", (req, res) => {
  const id = req.session.userID;
  const user = users[id];
  // If user is already logged in, redirect to the URLs page
  if (user) {
  return res.redirect("/urls");
  }
  // Render the registration page with URLs and user data
  const templateVars = { urls: urlDatabase, user: user };
  res.render("register", templateVars);
  });
  
  // Handle POST request to register a new user
  app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // Validate that email and password fields are not empty
  if (!email || !password) {
  return res.status(400).send("Email and password cannot be empty.");
  }
  // Check if a user with the given email already exists
  const emailexist = getUserByEmail(email);
  if (emailexist) {
  return res.status(400).send("Email already exists.");
  }
  // Generate a new user ID and add the user to the database
  const userID = generateRandomString();
  const newUser = {
  id: userID,
  email,
  password: bcrypt.hashSync(password, 10), // Store the password hash
  };
  users[userID] = newUser;
  // Set user ID in the session and redirect to the URLs page
  req.session.userID = userID;
  res.redirect("/urls");
  });
  
  // Start the server and listen on the specified port
  app.listen(port, () => {
  (`Example app listening on port ${port}!`);
  });