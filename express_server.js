const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  users,
  generateRandomString,
  urlsForUser,
} = require("./helper");
const app = express();
const port = 8080;
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
};

app.use(express.urlencoded({ extended: true }));
const redirectLoggedInUser = (req, res, next) => {
  if (req.cookies.userID) {
    return res.redirect("/urls");
  }
  next();
};
app.use((req, res, next) => {
  res.locals.userID = req.cookies["userID"];
  next();
});
const checkUserLoggedIn = (req, res, next) => {
  if (!req.cookies.userID) {
    return res.redirect("/login");
  }
  next();
};
app.get("/", (req, res) => {
  const userID = req.cookies.userID;
  if (userID) {
    res.render("header", { userID: userID });
  } else {
    res.render("header", { userID: null });
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  console.log(users);
  const id = req.cookies.userID;
  const user = users[id];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies.userID) {
    return res.send("User is not logged in");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("shortURL doesnt exist");
  }
  if (urlDatabase[req.params.id].userID !== req.cookies.userID) {
    return res.send("This url doesn't belong to you");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.userID],
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  console.log(users);
  const id = req.cookies.userID;
  if (!id) {
    return res.send("User is not logged in");
  }
  const user = users[id];
  const templateVars = { urls: urlsForUser(urlDatabase, id), user: user };
  res.render("urls_index", templateVars);
});

app.get("/login", redirectLoggedInUser, (req, res) => {
  console.log(users);
  const id = req.cookies.userID;
  const user = users[id];
  const templateVars = { user: user };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(4);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: req.cookies.userID };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies.userID) {
    return res.send("User is not logged in");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("shortURL doesnt exist");
  }
  if (urlDatabase[req.params.id].userID !== req.cookies.userID) {
    return res.send("This url doesn't belong to you");
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!req.cookies.userID) {
    return res.send("User is not logged in");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("shortURL doesnt exist");
  }
  if (urlDatabase[req.params.id].userID !== req.cookies.userID) {
    return res.send("This url doesn't belong to you");
  }

  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user) {
    res.status(403).send("User with this email does not exist!");
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid password");
  } else {
    req.cookies.userID = user.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  console.log(users);
  const id = req.cookies.userID;
  const user = users[id];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { urls: urlDatabase, user: user };
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }
  const emailexist = getUserByEmail(email);
  if (emailexist) {
    return res.status(400).send("Email already exists.");
  }
  const userID = generateRandomString(4);
  const newUser = {
    id: userID,
    email,
    password: bcrypt.hashSync(password, 4),
  };
  users[userID] = newUser;
  res.cookie("userID", userID);
  res.redirect("/urls");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
