const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 8080;
app.use(cookieParser());
app.set("view engine", "ejs");
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.use((req, res, next) => {
  res.locals.username = req.cookies["username"];
  next();
});
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const username = req.cookies.username;
  if (username) {
    res.render("header", { username });
  } else {
    res.render("header", { username: null });
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
const generateRandomString = (length) => {
  let randomString = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return randomString;
};

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
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
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "isaacadnanu@gmail.com" && password === "tinyapp") {
    res.cookie("username", username);
    res.redirect("/urls");
  } else {
    res.status(200).send("logged in");
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

