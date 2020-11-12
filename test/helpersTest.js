const { assert } = require('chai');

const { findIDbyEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('findIDbyEmail', function() {
  it('should return a user with valid email', function() {
    const user = findIDbyEmail("a@b.com", testUsers)
    const expectedOutput = "user3";
    // Write your assert statement here
    assert.equal(user, expectedOutput );
  });
  it('if email is not in our users database, should return undefined', function() {
    const user = findIDbyEmail("aasdfd@fdf.com", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput );
  });
});