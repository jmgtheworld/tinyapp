const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user3", date: "2020-11-12", visits: 0},
  "9sm5xK": { longURL: "http://www.google.com", userID: "user3", date: "2020-11-12", visits: 0},
  "k349sd": { longURL: "http://youtube.com", userID: "abcdef", date: "2020-11-12", visits: 0},
}

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

const findIDbyEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user]["id"];
    }
  }
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

const dateforURL = (id) => {
  let date = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["userID"] === id) { 
      date[shortURL] = urlDatabase[shortURL].date;
    }
  }
  return date;
}

const visitforURL = (id) => {
  let visits = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["userID"] === id) { 
      visits[shortURL] = urlDatabase[shortURL].visits;
    }
  }
  return visits;
}

const increaseVisit = (shortURL) => {
  urlDatabase[shortURL].visits += 1;
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
    if (users[user].email === email && bcrypt.compareSync(password, users[user]['password'])) {
      return true;
    }
  }
  return false;
}


module.exports = { 
  users,
  urlDatabase,
  findIDbyEmail,
  urlsForUser,
  dateforURL,
  visitforURL,
  increaseVisit,
  checkUser,
  checkUserCredentials

};