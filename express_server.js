const { findIDbyEmail } = require('./helpers');
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  })
);

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3" : {
    id : 'user3',
    email: "a@b.com",
    password: "1234"
  }, 
  "abcdef" : {
    id : 'abcdef',
    email: "avedj94@hotmail.com",
    password: "1234"
  }
}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user3", date: "2020-11-12"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "user3", date: "2020-11-12"},
  "k349sd": { longURL: "http://youtube.com", userID: "abcdef", date: "2020-11-12"},
}

const urlsForUser = (id) => {
  let urlforID = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["userID"] === id) { 
      urlforID[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urlforID;
}

const checkUser = (users, nEmail) => {
  let userKeys = Object.keys(users);
  for (user of userKeys) {
    if (users[user].email === nEmail) {
      return true;
    }
  }
  return false;
}

const checkUserCredentials = (users, email, password) => {
  console.log('password',password);

  let userKeys = Object.keys(users);
  for (user of userKeys) {
    // console.log(bcrypt.compareSync(users[user].password, password));
    console.log("user's user password:", users[user]['password']);
    if (users[user].email === email && bcrypt.compareSync(password, users[user]['password'])) {
      return true;
    }
  }
  return false;
}

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
  const templateVars = { 
    username: users[req.session.user_id]["email"],
    date:  "2020/11/12",
    urls: urlforID,
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
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
  else {
    res.send("No Access");
  }
});

// Create new tinyURL with random 6 digit alpha-numeric value
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  let todayDate = new Date().toISOString().slice(0, 10);
  console.log(todayDate)
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id, date: todayDate }; // create shortURL:longURL key:value pair
  console.log(urlDatabase[shortURL])
  res.redirect(`/urls/${shortURL}`);
});

// Show page with long/short URLs. If not exisiting, notify it doesn't exist
app.get("/urls/:shortURL", (req,res) => {
  if (urlDatabase[req.params.shortURL] && req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    const urlforID = urlsForUser(req.session.user_id);
    const templateVars = { 
      username: users[req.session.user_id]["email"],
      shortURL: req.params.shortURL, 
      longURL: urlforID[req.params.shortURL]
    };
    console.log(req.params.shortURL);
    console.log("urlforid", urlforID);
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
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

// Redirect shortURL anchor to the actual longURL link
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]){
    res.send("Short URL link doesn't exist!")
  } else {
    console.log(req.params.shortURL);
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  }
});

// Handle login (compare email/pw/userID)
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  // const hashedPassword = bcrypt.hashSync(password, 10);
   //Check User
  if (!checkUserCredentials(users, email, password)) {
    res.send("403. That's an error!!");
  } else {
    const userID = findIDbyEmail(email, users)
    req.session.user_id = userID;
    console.log(userID);
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








