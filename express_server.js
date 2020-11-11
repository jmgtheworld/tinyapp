const express = require("express");
const app = express();

const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

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
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Renders urls_index ( /urls ) with username, and urlDatabase
app.get("/urls", (req,res) => {
  const templateVars = { 
    username: req.cookies["user_id"],
    urls: urlDatabase 
  };
  
  res.render("urls_index", templateVars);
})

// Renders with urls_new ( /urls/new ) with username
app.get("/urls/new", (req,res) => {
  const templateVars = { 
    username: req.cookies["user_id"],
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

// Show page with long/short URLs. If not exisiting, notify it doesn't exist
app.get("/urls/:shortURL", (req,res) => {
  const templateVars = { 
    username: req.cookies["user_id"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };

  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  }

  else {
    const templateVars = { 
      username: req.cookies["user_id"],
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

// Handle login (compare email/pw/userID)
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  console.log(email, password);
   //Check User
  if (! checkUserCredentials(users, email, password)) {
    res.send("403. That's an error!!");
  } else {
    res.cookie('user_id', req.body);
    res.redirect('/urls')
  }
});

// clear cookie with username info, and redirect to /urls
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Render register page 
app.get("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies["user_id"],
  };
  res.render('urls_register', templateVars);
});

// Handle user registration post request
app.post("/register", (req,res) => {
  const {email, password} = req.body;
  console.log(req.body);
  const foundUser = checkUser(users, email, password);
  console.log(foundUser);
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
  users[userID]['password'] = password;
  res.cookie('user_id', users[userID]);
  console.log("Object of users " ,users);
  return res.redirect("/urls");

});

app.get("/login", (req, res) => {
  const templateVars = { 
    username: null,
  };
  res.render("urls_login", templateVars )
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

const checkUser = (users, nEmail, nPassword) => {
  let userKeys = Object.keys(users);
  console.log("userKeys" , userKeys);
  for (user of userKeys) {
    if (users[user].email === nEmail) {
        console.log(users[user].password);
        return true;
    }
  }
  return false;
}


const checkUserCredentials = (users, nEmail, nPassword) => {

  let userKeys = Object.keys(users);
  console.log("userKeys" , userKeys);
  for (user of userKeys) {
    if (users[user].email === nEmail && users[user].password === nPassword) {
      console.log(users[user].password);
      return true;
    }
  }
  return false;
}



