const express = require("express");
const ejs = require("ejs");
require('dotenv').config();

const mongoose = require("mongoose");
var cors = require("cors");
const sensorinfoModel = require("./model/sensorinfo");
//const threshholdmodel = require("./model/threshhold");

const polyhousemodel = require("./model/polyhouse");
const userModel = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

//
const fs = require("fs");
const moment = require("moment");
const mdq = require("mongo-date-query");
const json2csv = require("json2csv").parse;
const path = require("path");
//

const ADMIN_CODE = process.env.ADMIN_CODE;
// console.log(ADMIN_CODE)
const JWT_SECRET ="nuifbewiudfbewiudsfbweufiiuw783278278782378#%$#$#$#$#%$#*y7biuyguyjyvfytjyvfttjyvf";

const threshholdvaluemodel = require("./model/threshholdvalue");
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

mongoose.connect(
  process.env.DB_URL,
  { useNewUrlParser: true },
  () => {
    console.log("Connected to database !");
  }
);

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/home", (req, res) => {
  const token = req.cookies.token;
  //console.log(req.cookies);

  try {
    const user = jwt.verify(token, JWT_SECRET);

    res.render("first");
  } catch (error) {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/reg", async (req, res) => {
  console.log(req.body);
  const { name, email, password: plaintextpassword, specialaccess } = req.body;

  if (!name || typeof name !== "string") {
    return res.json({ status: "error", error: "Invalid Name" });
  }

  if (!email || typeof email !== "string") {
    return res.json({ status: "error", error: "Invalid Email" });
  }

  if (!plaintextpassword || typeof plaintextpassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  const password = await bcrypt.hash(plaintextpassword, 10);

  try {
    if (specialaccess === ADMIN_CODE) {
      const response = await userModel.create({
        name,
        email,
        password,
        admin: true,
      });
      console.log("user record has been record ", response);
    } else {
      const response = await userModel.create({
        name,
        email,
        password,
        admin: false,
      });
      console.log("user record has been record ", response);
    }

    //console.log("user record has been record ", response);
  } catch (error) {
    console.log(JSON.stringify(error));
    if (error.code === 11000) {
      return res.json({
        status: "error",
        error: "Email / Username is Already in Use!",
      });
    }
    throw error;
  }
  res.json({
    status: "ok",
  });
});

app.get("/home/:id", (req, res) => {
  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    polyhousemodel.findById(req.params.id, (err, result) => {
      if (!err) {
        if (result) {
          res.render("pageforpolyhouse.ejs", { id: req.params.id });
        }
      } else {
        res.redirect("/home");
      }
    });
  } catch (error) {
    res.redirect("/login");
  }
});

app.patch("/editpolyhousedetails/:id", (req, res) => {
  const token = req.cookies.token;
  if (
    req.body.name === "" ||
    req.body.name === undefined ||
    req.body.name === null ||
    req.body.name === " " ||
    req.body.desc === undefined ||
    req.body.desc === null
  ) {
    return res.json({
      status: "error",
      error: "Invalid Name or Description",
    });
  }
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.admin) {
      console.log(req.body);
      polyhousemodel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name: req.body.name,
            desc: req.body.desc,
          },
        },
        (err, result) => {
          if (!err) {
            if (result) {
              return res.json({
                status: "ok",
                message: "polyhouse details updated successfully",
              });
            } else {
              return res.json({
                status: "error",
                message: "polyhouse details not updated",
              });
            }
          }
        }
      );
    } else {
      return res.json({ status: "fail", message: "This is for admin only!" });
    }
  } catch (error) {
    return res.json({ status: "fail", message: "This is for admin only!" });
  }
});

app.post("/createpolyhouse", (req, res) => {
  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.admin == true) {
      const { name, desc } = req.body;
      try {
        const response = polyhousemodel.create({
          name,
          desc,
        });
        res.json({ status: "ok", message: "Inserted Successfully! ✅" });
      } catch (error) {
        res.json({ status: "fail", message: "Something Went Wrong!" });
      }
    } else {
      throw 1;
    }
  } catch (error) {
    res.json({ status: "fail", message: "This is for admin only!" });
  }
});

app.get("/getallpolyhouse", (req, res) => {
  polyhousemodel.find({}, (err, result) => {
    if (!err) {
      if (result) {
        res.json(result);
      }
    } else {
      res.json({ status: "fail", message: "Something Went Wrong!" });
    }
  });
});

app.post("/addthreshhold/:id", (req, res) => {
  const { re_temp, re_humidity, re_soilmoisture } = req.body;
  console.log(re_temp, re_humidity, re_soilmoisture);
  try {
    threshholdvaluemodel.findById(req.params.id, (err, result) => {
      if (!err) {
        if (result) {
          result.re_temp = re_temp;
          result.re_humidity = re_humidity;
          result.re_soilmoisture = re_soilmoisture;
          result.save().then((err, response) => {
            console.log("Inserted value!");
            res.json({ status: "ok", message: "Inserted Successfully! ✅" });
          });
        } else {
          const upd = new threshholdvaluemodel({
            _id: req.params.id,
            re_temp,
            re_humidity,
            re_soilmoisture,
          });
          upd.save().then(() => {
            console.log("Inserted value!");
            res.json({ status: "ok", message: "Inserted Successfully! ✅" });
          });
        }
      } else {
        res.json({ status: "fail", message: "Something Went Wrong!" });
      }
    });
  } catch (error) {}
});

app.get("/getrefvalues/:id", (req, res) => {
  threshholdvaluemodel.findById(req.params.id, (err, result) => {
    if (!err) {
      if (result) {
        res.json(result);
      }
    } else {
      res.json({ status: "fail", message: "Something Went Wrong!" });
    }
  });
});

app.post("/addsensorinfo", async (req, res) => {
  console.log(req.body);
  const { temp, humidity, moisture } = req.body;
  try {
    const response = await sensorinfoModel.create({
      temp,
      humidity,
      moisture,
    });
    res.json({ status: "ok", message: "Inserted Successfully! ✅" });
  } catch (error) {
    res.json({ status: "fail", message: "Something Went Wrong!" });
  }
});

app.get("/getsensordata/:id", (req, res) => {
  sensorinfoModel
    .find(
      { polyhsid: req.params.id },
      null,
      { sort: "-date" },
      (err, result) => {
        if (!err) {
          if (result) {
            res.json(result);
          }
        } else {
          res.json({ status: "fail", message: "Something Went Wrong!" });
        }
      }
    )
    .limit(10);
});

app.get("/getthreshholdvalue/:id", (req, res) => {
  //for nodemcu to get threshholdvalue

  threshholdvaluemodel.findOne({ _id: req.params.id }, (err, result) => {
    if (!err) {
      if (result) {
        console.log(result);

        sensorinfoModel.findOne(
          { polyhsid: req.params.id },
          null,
          { sort: "-date" },
          (err, current) => {
            if (!err) {
              if (current) {
                console.log("hi nodemcu");

                console.log(current);
                res.json({
                  success: 1,
                  led: [
                    {
                      re_temp: result.re_temp,
                      re_humidity: result.re_humidity,
                      re_soilmoisture: result.re_soilmoisture,
                      cu_temp: current.temp,
                      cu_humidity: current.humidity,
                      cu_soilmoisture: current.moisture,
                    },
                  ],
                });

                //currentdata=current;
              }
            } else {
              res.json({ status: "fail", message: "Something went Wrong!" });
            }
          }
        );
      }
    } else {
      res.json({ status: "fail", message: "Something went Wrong!" });
    }
  });
});

app.get(
  "/addthreshholdvalue/val1/:val1/val2/:val2/val3/:val3/",
  async (req, res) => {
    //const { re_temp, re_humidity, re_soilmoisture } = req.params;
    console.log(req.params);
    try {
      const response = await threshholdmodel.create({
        re_temp: req.params.val1,
        re_humidity: req.params.val2,
        re_soilmoisture: req.params.val3,
      });
      res.json({ status: "ok", message: "Successfully Inserted" });
    } catch (error) {
      res.json({ status: "fail", message: " Something Went Wrong !" });
    }
  }
);

app.get("/addsensordata/:id/val1/:v1/val2/:v2/val3/:v3/val4/:v4/val5/:v5/val6/:v6/val7/:v7/val8/:v8", async (req, res) => {

  console.log(req.params);
  try {
    const response = await sensorinfoModel.create({
      polyhsid: req.params.id,
      temp: req.params.v1,
      humidity: req.params.v2,
      moisture: req.params.v3,
      co2: req.params.v4,
      N:req.params.v5,
      P:req.params.v6,
      K:req.params.v7,
      lightInt:req.params.v8

    });
    console.log(response);
    res.json({ status: "ok", message: "Successfully Inserted" });
  } catch (error) {
    res.json({ status: "fail", message: " Something Went Wrong !" });
  }
});


app.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).lean();
  if (!user) {
    return res.json({ status: "error", error: "Invalid Email/password" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        id: user._id,

        name: user.name,
        email: user.email,
        admin: user.admin,
      },
      JWT_SECRET
    );
    return res.json({ status: "ok", data: token });
  }

  res.json({ status: "error", error: "Invalid Email / password" });
});

app.get("/download/:id", (req, res) => {
  fields = ["polyhsid", "temp", "humidity", "moisture","N", "P", "K", "lightInt", "date"];
  sensorinfoModel.find({ polyhsid: req.params.id }, (err, result) => {
    if (err) {
      return res.status(500).json({ err });
    } else {
      let csv;
      try {
        csv = json2csv(result, { fields });
      } catch (err) {
        return res.status(500).json({ err });
      }
      res.header("Content-Type", "text/csv");
      res.attachment(`${req.params.id}.csv`);
      return res.send(csv);
    }
  });
});



app.get("/delete/:id", (req, res) => {
  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.admin === true) {
      polyhousemodel.deleteOne({ _id: req.params.id }, (err) => {
        if (err) {
          console.log(`error in deleting : ${req.params.id}`);
        } else {
          console.log(`Deleting successfully : ${req.params.id}`);
          res.redirect("/home");
        }
      });
    } else {
      throw 1;
    }
  } catch (error) {
    res.redirect("/login");
  }
});

app.get("/aboutus", (req, res) => {
  res.render("about");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "").redirect("/login");
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`server Started ${port}`);
});
