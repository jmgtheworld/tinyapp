const { findIDbyEmail } = require('./helpers');
const { urlsForUser } = require('./helpers');
const { dateforURL } = require('./helpers');
const { users } = require('./helpers');
const { bcrypt } = require('./helpers');
const { salt } = require('./helpers');
const { urlDatabase } = require('./helpers');
const { visitforURL } = require('./helpers');
const { increaseVisit } = require('./helpers');
const { checkUser } = require('./helpers');
const { checkUserCredentials } = require('./helpers');
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  })
);

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  else{
    res.redirect("/login");
  }
})

// Renders urls_index ( /urls ) with username, and urlDatabase  
app.get("/urls", (req,res) => {
  let userEmail;

  if (!req.session.user_id) {
    const templateVars = { 
      username: null,
      date: null,
      urls: null,
      message: "Please Login or Register"
    }
    res.render("urls_index", templateVars);
  } else {
  const urlforID = urlsForUser(req.session.user_id);
  const urlDates = dateforURL(req.session.user_id);
  const urlVisits = visitforURL(req.session.user_id);

  const templateVars = { 
    username: users[req.session.user_id]["email"],
    urls: urlforID,
    date: urlDates,
    visits: urlVisits,
    message: null
  }
  res.render("urls_index", templateVars);
  }
});

// Renders with urls_new ( /urls/new ) with username - if not logged in redirect to register
app.get("/urls/new", (req,res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = { 
      username: users[req.session.user_id]["email"],
    }
    res.render('urls_new', templateVars);
  }
});

// Update with NewURL
app.post("/urls/:shortURL", (req,res) => {
  if (!req.session.user_id ) {
    res.send('Not logged in!');
  } else {
    if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect("/urls");
    }
    else {
      res.send("No Access");
    }
  }
});

// Create new tinyURL with random 6 digit alpha-numeric value
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let todayDate = new Date().toISOString().slice(0, 10);
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id, date: todayDate, visits: 0}; // create shortURL:longURL key:value pair
  res.redirect(`/urls/${shortURL}`);
});

// Show page with long/short URLs. If not exisiting, notify it doesn't exist
app.get("/urls/:shortURL", (req,res) => {
  if (urlDatabase[req.params.shortURL] && req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    const urlforID = urlsForUser(req.session.user_id);
    const urlDates = dateforURL(req.session.user_id);
    const urlVisits = visitforURL(req.session.user_id);
  
    const templateVars = { 
      username: users[req.session.user_id]["email"],
      shortURL: req.params.shortURL, 
      longURL: urlforID[req.params.shortURL],
      urls: urlforID,
      date: urlDates[req.params.shortURL],
      visits: urlVisits[req.params.shortURL],
    };
    if (urlforID[req.params.shortURL]) {
      res.render("urls_show", templateVars);
    } else {
      const templateVars = { 
        username: users[req.session.user_id]["email"],
        shortURL: req.params.shortURL + " Doesn't exist in database!", 
        longURL: "Non exisitent shortURL",
      };
      res.render("urls_show", templateVars )
    } 
  } else if (!urlDatabase[req.params.shortURL]) {
    res.send("Short URL Doesn't Exist!");
  } else {
    res.send("No Access");
  }

});

// Delete url 
app.post("/urls/:shortURL/delete", (req,res) => {
  if(!req.session.user_id)  {
    res.send("Not logged in");
  } else {
    if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
      delete urlDatabase[req.params.shortURL];
    }
    res.redirect("/urls");
  }
});

// Redirect shortURL anchor to the actual longURL link
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]){
    res.send("Short URL link doesn't exist!")
  } else {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    increaseVisit(req.params.shortURL);
    res.redirect(longURL);
  }
});

// Handle login (compare email/pw/userID)
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  //Check User
  if (!checkUserCredentials(users, email, password)) {
    res.send("403. That's an error!!");
  } else {
    const userID = findIDbyEmail(email, users)
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

// clear cookie with username info, and redirect to /urls
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Render register page 
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { 
      username: null,
    };
    res.render('urls_register', templateVars);
  }
});

// Handle user registration post request
app.post("/register", (req,res) => {
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, salt);
  const foundUser = checkUser(users, email);

  // if email / pw is empty, send 400 error
  if (!email || !password) {
    return res.send("400. That's an error!!");
  } else if (foundUser) {
    return res.send("400. That's an error!!");
  } 

  let userID = generateRandomString();
  users[userID] = {};
  users[userID]['id'] = userID;
  users[userID]['email'] = email;
  users[userID]['password'] = hashedPassword;
  req.session.user_id = userID;

  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = { 
      username: null,
    };
    res.render("urls_login", templateVars )
  }
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








