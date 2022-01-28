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
        const database = client.db("travel-blog");
        const blogsCollection = database.collection("blogs");
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


        // getting blogs
        app.get('/blogs', async (req, res) => {
            const cursor = blogsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let blogs;
            const count = await cursor.count();

            if (page) {
                blogs = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                blogs = await cursor.toArray();
            }

            res.send({
                count,
                blogs
            });
        });

        // getting single blogs
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const blogs = await blogsCollection.findOne(query);
            res.send(blogs);
        })

        // adding new blogs
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            const result = await blogsCollection.insertOne(blog);
            res.json(result);
        })

        // updating single blogs status
        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBlogStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedBlogStatus.status,
                },
            };
            const result = await blogsCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        // // Updating whole blogs
        // // UPDATING USERS DATA
        // app.put('/blogs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const data = req.body;
        //     console.log(req.body);
        //     const { name, authorInfo, picture, category, rating, price, date, time, transportation, location, shortDescription, description } = data;
        //     console.log(data);
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             name, authorInfo, picture, category, rating, price, date, time, transportation, location, shortDescription, description
        //         },
        //     };
        //     const result = await blogsCollection.updateOne(filter, updateDoc, options)
        //     res.json(result)
        // })

        // deleting blogs
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.deleteOne(query);
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