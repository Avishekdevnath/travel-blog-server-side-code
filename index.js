const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kq3to.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("mobilepoint");
        const reviewsCollection = database.collection("reviews");
        const mobilesCollection = database.collection("mobiles");
        const allOrdersCollection = database.collection("allOrders");
        const usersCollection = database.collection("users");



        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email, password: user.password };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })



        app.get('/mobiles', async (req, res) => {
            const cursor = mobilesCollection.find({});
            const mobiles = await cursor.toArray();
            res.send(mobiles);
        })

        app.get('/mobiles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const mobiles = await mobilesCollection.findOne(query);
            res.send(mobiles);
        })

        app.post('/mobiles', async (req, res) => {
            const mobile = req.body;
            const result = await mobilesCollection.insertOne(mobile);
            res.json(result);
        })
   
        app.delete('/mobiles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await mobilesCollection.deleteOne(query);
            res.json(result);
        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })

        app.get('/allOrders', async (req, res) => {
            const cursor = allOrdersCollection.find({});
            const allOrders = await cursor.toArray();
            res.send(allOrders);
        })

        app.post('/allOrders', async (req, res) => {
            const allOrders = req.body;
            const result = await allOrdersCollection.insertOne(allOrders);
            res.json(result);
        })

        app.put('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedAllOrders = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedAllOrders.status,
                },
            };
            const result = await allOrdersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allOrdersCollection.deleteOne(query);
            res.json(result);
        })


    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hurray! Server is on');
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})