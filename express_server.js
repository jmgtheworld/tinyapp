const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req,res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.post("/urls/:shortURL", (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // create shortURL:longURL key:value pair
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req,res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL", (req,res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  }
  else {
    const templateVars = { shortURL: req.params.shortURL + " Doesn't exist in database!", longURL: "Non exisitent shortURL"};
    res.render("urls_show", templateVars )
  }
});

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


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
