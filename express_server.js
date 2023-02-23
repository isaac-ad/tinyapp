const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const { getUserByEmail, users, generateRandomString } = require("./helper");
const app = express();
const port = 8080;
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.userid = req.cookies["userid"];
  next();
});

app.get("/", (req, res) => {
  const userId = req.cookies.userid;
  if (userId) {
    res.render("header", { userid: userId });
  } else {
    res.render("header", { userid: null });
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_index", templateVars);
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(4);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user) {
    res.status(403).send('User with this email does not exist!');
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Invalid password');
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});
app.post('/logout', (req, res) => {
  res.clearCookie('userid');
  res.redirect('/login');
});


app.get("/register", (req, res) => {
  const email = req.cookies.email;
  const templateVars = { urls: urlDatabase, email: email };
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty.");
  } else if (getUserByEmail(email)) {
    res.status(400).send("Email already exists.");
  } else {
    const userId = generateRandomString(4);
    const newUser = {
      id: userId,
      email,
      password: bcrypt.hashSync(password, 4),
    };
    users[userId] = newUser;
    res.cookie("userid", userId);
    res.redirect("/urls");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
