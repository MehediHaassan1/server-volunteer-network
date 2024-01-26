const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

require('dotenv').config();

const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());

// custom middleware 
const varifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'Unauthorized Access' })
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ error: true, message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    });

}

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

        // JWT
        app.post('/access-token', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' })
            res.send({ token })
        })

        const eventsCollection = client.db('volunteerNetwork').collection('events');
        const participantEventCollection = client.db('volunteerNetwork').collection('participantEventCollection')

        app.get('/events', async (req, res) => {
            const cursor = await eventsCollection.find().toArray();
            res.send(cursor);
        })

        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await eventsCollection.findOne(query);
            res.send(result);
        })

        app.get('/participant-events', varifyJWT, async (req, res) => {
            const email = req.query.email;
            const decoded = req.decoded.email;
            if (decoded !== email) {
                return res.status(401).send({ error: true, message: 'Forbidden Access' })
            }
            const query = { participantsEmail: email }
            const result = await participantEventCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/participant-events', async (req, res) => {
            const participantEventInfo = req.body;
            const result = await participantEventCollection.insertOne(participantEventInfo);
            res.send(result);
        })

        app.delete('/participant-events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await participantEventCollection.deleteOne(query);
            res.send(result)
        })




    } finally {
    }
}
run().catch(console.dir);


// --------------------------- DB End --------------------- //

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})