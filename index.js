const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bv0gyj5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const userCollection = client.db("impactAcademy").collection("users");
    const courseCollection = client.db("impactAcademy").collection("courses");
    const bookingCollection = client.db("impactAcademy").collection("bookings");
    const noticeCollection = client.db("impactAcademy").collection("notices");

    //Users

    app.get("/users", async (req, res) => {
      let query = {};
      const role = req.query.role;
      if (role) {
        query = { role: role };
      }

      const students = await userCollection.find(query).toArray();
      res.send(students);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.put("/users", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "student",
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    //user-admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.get("/users/student/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send({ isStudent: user?.role === "student" });
    });

    app.get("/users/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send({ isUser: user?.role === "user" });
    });

    //Courses
    app.get("/courses", async (req, res) => {
      const query = {};
      const courses = await courseCollection.find(query).toArray();
      res.send(courses);
    });

    app.get("/coursesSpecialty", async (req, res) => {
      const query = {};
      const result = await courseCollection
        .find(query)
        .project({ name: 1 })
        .toArray();
      res.send(result);
    });

    app.post("/courses", async (req, res) => {
      const course = req.body;
      const result = await courseCollection.insertOne(course);
      res.send(result);
    });

    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const course = await courseCollection.findOne(query);
      res.send(course);
    });

    app.delete("/courses/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const result = await courseCollection.deleteOne(filter);
      res.send(result);
    });

    //booking

    app.get("/bookings", async (req, res) => {
      let query = {};
      const email = req.query.email;

      if (email) {
        query = { email: email };
      }

      const bookings = await bookingCollection
        .find(query)
        .sort({ borough: 1, _id: -1 })
        .toArray();
      res.send(bookings);
    });

    app.get("/approved-student/:status", async (req, res) => {
      const status = req.params.status;
      const query = { status: status };

      const bookings = await bookingCollection.find(query).toArray();
      const approved = bookings.filter((booking) => booking.status === status);
      res.send(approved);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "Approved",
        },
      };

      const result = await bookingCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(filter);
      res.send(result);
    });

    //Notices

    app.get("/notices", async (req, res) => {
      let query = {};
      const noticeFor = req.query.noticeFor;
      if (noticeFor) {
        query = { noticeFor: noticeFor };
      }

      const notices = await noticeCollection
        .find(query)
        .sort({ borough: 1, _id: -1 })
        .toArray();
      res.send(notices);
    });

    app.get("/notices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const notice = await noticeCollection.findOne(query);
      res.send(notice);
    });

    app.post("/notices", async (req, res) => {
      const notice = req.body;
      const result = await noticeCollection.insertOne(notice);
      res.send(result);
    });

    app.delete("/notices/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await noticeCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/announcement", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const booking = await bookingCollection.findOne(query);

      const courseId = booking.courseId;

      const noticeQuery = {};
      const notices = await noticeCollection.find(noticeQuery).toArray();

      const specificNotices = notices.filter(
        (notice) => notice.noticeFor === courseId
      );

      res.send(specificNotices);
    });
  } finally {
  }
}

run().catch((err) => {
  console.log(err);
});

app.get("/", (req, res) => {
  res.send("Impact Academy Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
