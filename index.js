const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

require('dotenv').config();

const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Volunteer Network server is running!!!')
})

// --------------------------- DB Start --------------------- //



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.redp2x6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const eventsCollection = client.db('volunteerNetwork').collection('events');

        app.get('/events', async (req, res) => {
            const cursor = await eventsCollection.find().toArray();
            res.send(cursor);
        })


    } finally {
    }
}
run().catch(console.dir);


// --------------------------- DB End --------------------- //

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})