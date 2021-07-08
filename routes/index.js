var express = require('express');
var router = express.Router();
const signup = require("../Model/signup");
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c0/\/", salt);
var jwt = require("jsonwebtoken");
const question = require("../Model/question");
const result = require("../Model/result");
/* GET home page. */
const isValid = (req, res, next) => {
  var token = req.cookies.token;
  if (!token) {
    res.send({ error: "please provide token" });
  }
  jwt.verify(token, "secret", function (err, decoded) {
    if (err) {
      console.log("err-->", err);
      res.send({ error: "Invalid token" });
    } else {
      console.log("decoded-->", decoded);
      next();
    }
  });
};
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.get('/whichexam', function (req, res, next) {
  res.render('whichexam');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});
router.get("/logout", async function (req, res, next) {
  var cookie = req.cookies;
  for (var prop in cookie) {
    if (!cookie.hasOwnProperty(prop)) {
      continue;
    }
    res.cookie(prop, "", { expires: new Date(0) });
  }
  res.redirect("/login");
  // res.render("login");
});

router.get('/instructions', function (req, res, next) {
  res.render('instructions');
});

router.get('/question', function (req, res, next) {
  res.render('question');
});
router.get('/exam-page', async function (req, res, next) {
  if (req.query.selected && req.query.qNo) {
    console.log("req.query.selected--:", req.query.selected);
    console.log("req.query.qNo--:", req.query.qNo);
  }
  let skip = 0;
  if (req.query.skip) {
    skip = Number(req.query.skip)
  }
  const questions = await question.find({}).skip(skip).limit(1);
  const questionLength = await question.find({});
  res.render('question', { question: questions, skip: skip, questionLength: questionLength.length });
});
router.post("/create-account", async function (req, res, next) {
  var signData = req.body;
  if (signData) {
    signData = JSON.parse(JSON.stringify(signData));
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(signData.pass, salt, function (err, hash) {
        // Store hash in your password DB.
        signData.password = hash;
        var signupData = new signup(signData);
        signupData.save((err, result) => {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            console.log(result);
            res.send({
              success: "Successfully Saved"
            });
          }
        });
      });
    });
  }
});

router.post("/loginData", async function (req, res, next) {
  var ldata = req.body;
  if (ldata) {
    ldata = JSON.parse(JSON.stringify(ldata));
    console.log(ldata);
    const isuserExist = await signup.findOne({
      username: ldata.username
    });
    console.log("isuserExist-->", isuserExist);
    if (isuserExist) {
      bcrypt.compare(ldata.password, isuserExist.password, function (err, result) {
        if (err) {
          res.send({
            error: "password not match"
          });
        } else if (result === true) {
          // login success
          console.log("logi successssss", result);
          jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
              data: isuserExist
            },
            "secret",
            function (err, token) {
              if (err) {
                console.log(err);
                res.send({ error: err });
              } else {
                console.log("token====>", token);
                res.send({ success: token });
              }
            }
          );
        }
      });
    } else {
      res.send({
        error: "user not exist"
      });
    }
  }
});

router.get('/add-questions', async function (req, res, next) {
  const questionNumber = await question.findOne({}, { _id: 0, qNo: 1 }).sort({ _id: -1 }).limit(1);
  let questionNo = 1;
  console.log("questionNumber--->", questionNumber);
  if (questionNumber) {
    questionNo = Number(questionNumber.qNo);
    questionNo++;
  }
  res.render('add-questions', { questionNo: questionNo });
});
router.post('/question-add', function (req, res, next) {
  var questiondetail = req.body;
  console.log("questiondetail-->", questiondetail)

  questiondetail = JSON.parse(JSON.stringify(questiondetail));
  var questionData = new question(questiondetail);
  questionData.save((err, created) => {
    if (err) {
      console.log(err)
    } else {
      res.send({ "success": "Question Inserted successfully" })
    }
  })
});

router.post('/exam-response', async function (req, res, next) {
  var skip = 0;
  var correct = 0;
  var wrong = 0;

  const answersArray = JSON.parse(req.body.answersArray);
  console.log("answersArray-->", answersArray)
  const correctArray = await question.find({});
  console.log("correctArray-->", correctArray)
  const answers = await question.find({});
  for (var i = 0; i < answersArray.length; i++) {
    for (var j = 0; j < correctArray.length; j++) {
      if (answersArray[i].qNo == correctArray[j].qNo) {
        if (!answersArray[i].selected) {
          skip++;
        } else {
          if (answersArray[i].selected == correctArray[j].correctOption) {
            correct++;
          } else {
            wrong++
          }
        }
      }
    }

  }

  var objResult = {
    correct: correct,
    wrong: wrong,
    skip: skip
  }
  var resultData = new result(objResult);
  resultData.save((err, created) => {
    if (err) {
      console.log(err)
    } else {
      res.send({ "success": "result Data Inserted successfully" })
    }
  })
});

module.exports = router;
