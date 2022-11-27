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

const CATEGORY = client.db("DreamBike").collection("bikeCategory");
const ALLUSER = client.db("DreamBike").collection("Users");
const BIKE = client.db("DreamBike").collection("Bikes");
const BOOKED = client.db("DreamBike").collection("Booked");



function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "Forbidden access" });
      }
console.log("decoded",decoded);
      req.decoded = decoded;
      
    });

    next();
  }




    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;   
      console.log("HAAH ADMIN HAHA" ,email);
      const query = {email };
      const user = await ALLUSER.findOne(query);
      if (user?.role !== 'admin') {
          return res.status(403).send({ message: 'forbidden access' })
      }
      next();
  }
    const verifySeller = async (req, res, next) => {
      const email = req.decoded.email;   
      console.log("SELLER" ,email);
      const query = {email };
      const user = await ALLUSER.findOne(query);
      if (user?.role !== 'seller') {
          return res.status(403).send({ message: 'forbidden access' })
      }
      next();
  }
    const verifyBuyer = async (req, res, next) => {
      const email = req.decoded.email;   
      console.log("BUYER" ,email);
      const query = {email };
      const user = await ALLUSER.findOne(query);
      if (user?.role !== 'buyer') {
          return res.status(403).send({ message: 'forbidden access' })
      }
      next();
  }





  
app.post("/jwt", (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    res.send({ token });
});
app.post("/adduser", async (req, res) => {
  try {
    const result = await ALLUSER.insertOne(req.body);
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
app.post("/addbike", async (req, res) => {
  try {
    const result = await BIKE.insertOne(req.body);

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
app.get("/users", async (req, res) => {
  const { search } = req.query;
  const user = await ALLUSER.find({ email: search }).toArray();
  res.send(user);
});
app.get("/admindata", async (req, res) => {
  const { search } = req.query;
  if(search){
    const user = await ALLUSER.find({ role: search }).toArray();
    res.send(user);
  }
  else{
    const user = await ALLUSER.find().toArray();
    res.send(user);
  }
 
 
});
app.get("/myproducts", async (req, res) => {
  const { search } = req.query;
  const user = await BIKE.find({ email: search }).toArray();
  res.send(user);
});
app.get("/category", async (req, res) => {
  const { search } = req.query;
  if (search) {
    const category = await CATEGORY.find({ brand: search }).toArray();
    const bikes = await BIKE.find({ brand: search }).toArray();
    res.send({ category, bikes });
  } else {
    const category = await CATEGORY.find({}).toArray();
    res.send(category);
  }
});
app.get("/bikes", async (req, res) => {
  const { search } = req.query;
  if(search){
    const bikes = await BIKE.find({ catName: search }).toArray();
    res.send(bikes);
  }
  const reported = await BIKE.find({ reported: true }).toArray();
  res.send(reported);
});
app.get("/myorders", verifyJWT,verifyBuyer, async (req, res) => {
  const { search } = req.query;
  const MyOrders = await BOOKED.find({ customerEmail: search }).toArray();
  res.send(MyOrders);
});
app.get("/advertise", async (req, res) => {
  const advertise = await BIKE.find({ advertise: true }).toArray();
  res.send(advertise);
});





// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
app.get('/payment/:id',async (req,res)=>{
  const id=req.params.id
  // const result = await BOOKED.find({ _id: ObjectId(id) });
  const result = await BOOKED.find({ _id:  ObjectId(id) }).toArray();
  console.log(result.data);
res.send(result)
})



// //....... ..................DELETE start................


app.delete("/deleteuser", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.query.id;
  const result = await ALLUSER.deleteOne({ _id: ObjectId(id) });
  if (result.deletedCount) {
    res.send({
      success: true,
      message: `Successfully Deleted `,
    });
  } else {
    res.send({
      success: true,
      message: `Failed to Delete`,
    });
  }
});

app.delete("/delete",verifyJWT, async (req, res) => {
  const id = req.query.id;
  const result = await BIKE.deleteOne({ _id: ObjectId(id) });
  if (result.deletedCount) {
    res.send({
      success: true,
      message: `Successfully Deleted `,
    });
  } else {
    res.send({
      success: true,
      message: `Failed to Delete`,
    });
  }
});
// // .........................DELETE end............................

// // ................PATCH  Start...........



app.patch("/updateuserstatus",verifyJWT,verifyAdmin, async (req, res) => {
    const {id} = req.query
    const {email} = req.query
    const UpdateData = req.body;
    const filter = {email }
    const updateDoc = {
      $set: {
        sellerVerified:true
      },
    };
    const updateUserDB = await ALLUSER.updateOne(
      { _id: ObjectId(id) },
      { $set: UpdateData }
    );
    const updateBikeDB = await BIKE.updateMany(filter, updateDoc);
    
    if (updateBikeDB.matchedCount) {
      res.send({
        success: true,
        message: `successfully updated `,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't update  the product",
      });
    }
  });


app.patch("/updatestatus", verifyJWT, async (req, res) => {
    const {id} = req.query
    const UpdateData = req.body;

    const result = await BIKE.updateOne(
      { _id: ObjectId(id) },
      { $set: UpdateData }
    );
    
    if (result.matchedCount) {
      res.send({
        success: true,
        message: `successfully updated `,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't update  the product",
      });
    }
    //
  });
app.patch("/updatebookedstatus", verifyJWT, async (req, res) => {
    const {id} = req.query
    const UpdateData = req.body;

    const result = await BOOKED.updateOne(
      { _id: ObjectId(id) },
      { $set: UpdateData }
    );
    
    if (result.matchedCount) {
      res.send({
        success: true,
        message: `successfully updated `,
      });
    } else {
      res.send({
        success: false,
        error: "Couldn't update  the product",
      });
    }
    //
  });
// .........................PYMENT Intend...................Start.....................


const stripe = require("stripe")(
  "sk_test_51M6z31Kmdh1q09CFgrA6bPq8HB0u5PIsuQ9PtjCwI0mojBAmVMPhSrkcHfuuzQJ3JwEthnqtvKHBuokHMwkhqSX200ErYpRbRL"
);
app.post("/create-payment-intent", async (req, res) => {
  const price=req.body.price;
  const amount=price*100;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    "payment_method_types": [
      "card"
    ]
  });



  
  res.send({
    clientSecret: paymentIntent.client_secret,
  });

});












// .........................PYMENT Intend...................End.....................



  
  app.post("/bookbike", async (req, res) => {
    try {
      const result = await BOOKED.insertOne(req.body);
  
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

//   // ................Patch  Req End...........
app.get("/", (req, res) => {
  res.send("Server Running ");
});

app.listen(port, (req, res) => {
  console.log("Server is running", port);
});
