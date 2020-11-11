const express = require("express");
const app = express();

const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Renders urls_index ( /urls ) with username, and urlDatabase
app.get("/urls", (req,res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
})

// Renders with urls_new ( /urls/new ) with username
app.get("/urls/new", (req,res) => {
  const templateVars = { 
    username: req.cookies["username"],
  };
  res.render('urls_new', templateVars);
});

// Update with NewURL
app.post("/urls/:shortURL", (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});


// Create new tinyURL with random 6 digit alpha-numeric value
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // create shortURL:longURL key:value pair
  res.redirect(`/urls/${shortURL}`);
});

// Show page with long/short URLs.
app.get("/urls/:shortURL", (req,res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  }
  else {
    const templateVars = { 
      username: req.cookies["username"],
      shortURL: req.params.shortURL + " Doesn't exist in database!", 
      longURL: "Non exisitent shortURL",
    };
    res.render("urls_show", templateVars )
  }
});

// Delete url 
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Redirect shortURL anchor to the actual longURL link
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// register username info to cookie and redirect to /urls
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

// clear cookie with username info, and redirect to /urls
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = "";
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
}
