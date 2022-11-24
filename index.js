const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8thupxf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);
const DbConnect = async () => {
  try {
    await client.connect();
    console.log("Database connected");
  } catch (error) {
    console.error(error);
  }
};
DbConnect();

const ALLUSER = client.db("DreamBike").collection("Users");

const BIKE = client.db("DreamBike").collection("Bikes");

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).send({ message: "unauthorized access" });
//     }
//     const token = authHeader.split(" ")[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//       if (err) {
//         return res.status(403).send({ message: "Forbidden access" });
//       }
//       req.decoded = decoded;
//       next();
//     });
//   }
//   app.post("/jwt", (req, res) => {
//     const user = req.body;
//     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//       expiresIn: "1d",
//     });
//     res.send({ token });
//   });

app.post("/adduser", async (req, res) => {
  console.log("0ll",req.body);
  try {
  console.log(req.body);

    const result = await ALLUSER.insertOne(req.body);
    console.log(result);
    if (result.insertedId) {
      res.send({
        success: true,
        message: `Successfully Added  with id ${result.insertedId}`,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't Added",
      });
    }
  } catch (error) {
    console.log(error.name, error.message.bold);
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// //....... ..................DELETE start................
// app.delete("/delete", async (req, res) => {
//   const id = req.query.id;

//   const result = await "DB".deleteOne({ _id: ObjectId(id) });

//   if (result.deletedCount) {
//     res.send({
//       success: true,
//       message: `Successfully Deleted `,
//     });
//   } else {
//     res.send({
//       success: true,
//       message: `Failed to Delete`,
//     });
//   }
// });
// // .........................DELETE end............................

// // ................PATCH  Start...........

// app.patch("/update/", async (req, res) => {
//     const id = req.query.id;
//     const UpdateData = req.body;

//     const result = await'DB'.updateOne(
//       { _id: ObjectId(id) },
//       { $set: req.body }
//     );
//     if (result.matchedCount) {
//       res.send({
//         success: true,
//         message: `successfully updated `,
//       });
//     } else {
//       res.send({
//         success: false,
//         error: "Couldn't update  the product",
//       });
//     }
//     //
//   });

//   // ................Patch  Req End...........
app.get("/", (req, res) => {
  res.send("WOW");
});

app.listen(port, (req, res) => {
  console.log("Server is running", port);
});
