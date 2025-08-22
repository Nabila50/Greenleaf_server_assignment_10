const express = require("express");

const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.GDB_USER}:${process.env.GDB_PASS}@cluster.fhxucjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const gardenCollection = client.db("gardenDB").collection("gardens");
    const usersCollection = client.db("gardenDB").collection("users");

    // -----get garden data--------------

    app.get("/gardens", async (req, res) => {
      const cursor = gardenCollection.find({ availability: "public" });
      const result = await cursor.toArray();
      res.send(result);
    });
    // ------Get data from user for 6 top trading tips show in home page----
    app.get("/gardens/description", async(req, res)=>{
      const tradingTips = await gardenCollection.find().limit(6).toArray();
      res.send(tradingTips);
    })

    // -------get data for 6 active gardeners for Home Page---------
    app.get("/users/active", async(req, res)=>{
      const activeUsers = await usersCollection.find({status :"Active"}).limit(6).toArray();
      res.send(activeUsers);
    })
    // for an specific id (Tips Details)-------------

    app.get("/garden/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gardenCollection.findOne(query);
      res.send(result);
    });

    // ------sort according to active----------

    // Share Gardening Data;
    app.post("/gardens", async (req, res) => {
      const newShare = req.body;
      console.log(newShare);
      const result = await gardenCollection.insertOne(newShare);
      res.send(result);
    });

    // -------------User Related API-----------------------------------------

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // -------------Get Single Users data----------------------

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
      console.log(userProfile);
      const result = await usersCollection.insertOne(userProfile);
      res.send(result);
    });

    // ----------------get information for Profile-------------

    // Get user by email
    app.get("/gardens/:email", async (req, res) => {
      const email = req.params.email;
      const result = await gardenCollection.find({ email }).toArray();
      res.send(result);
    });
    // ------------Updated share garden info form----------------
    app.get("/gardens/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gardenCollection.findOne(query);
      res.send(result);
    });
    app.put("/gardens/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTip = req.body;
      const updatedDoc = {
        $set: updatedTip,
      };
      const result = await gardenCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

     
    // --------------deleting Tips from Browser-----------

    app.delete("/gardens/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gardenCollection.deleteOne(query);
      res.send(result);
    });
    // -----------delete from myTips page table------------------
    app.delete("/gardens/delete/:id", async (req, res) => {
      const id = req.params.id;
      const result = await gardenCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// ----------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Gardening is a good for health and mind");
});

app.listen(port, () => {
  console.log(`Gardening server is running well ${port}`);
});
