const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


// middleware
app.use(express.json());
app.use(cors());







const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PSS}@cluster0.mndvni1.mongodb.net/?appName=Cluster0`

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("hireloop_auth")
    const jobsCollection = database.collection("jobs");
    const companyCollection = database.collection("company");
    const applicationsColl = database.collection("applications");
    const planColl = database.collection("plans");
    const subscriptionColl = database.collection('subscriptions');
    const userCollection = database.collection("user");


    app.get('/jobs', async (req, res) => {
      const cursor = await jobsCollection.find({}).limit(7)
      const result = await cursor.toArray();
      res.send(result);
    })
    // get all jobs
    app.get('/all-jobs', async (req, res) => {
      const cursor = await jobsCollection.find({})
      const result = await cursor.toArray();
      res.send(result);
    })

    // get one job data
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)
      }
      const result = await jobsCollection.findOne(query);
      res.send(result)
    })

    app.post('/jobs', async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job);
      res.send(result);
    })


    // get company jobs
    app.get('/api/jobs', async (req, res) => {
      const query = {}
      if (req.query.companyId) {
        query["company.companyId"] = req.query.companyId
      }
      if (req.query.status) {
        query.status = req.query.status;
      }
      const cursor = await jobsCollection.find(query)
      const result = await cursor.toArray();
      res.send(result);
    })



    // post company data

    app.post('/company', async (req, res) => {
      const data = req.body;
      const result = await companyCollection.insertOne(data);
      res.send(result);
    })

    // get all company data
    app.get('/api/company', async (req, res) => {
      const result = await companyCollection.find().toArray();
      res.send(result);
    })


    app.get('/company', async (req, res) => {
      const recruiterId = req.query.recruiterId
      console.log('recruiter id',recruiterId);
      console.log(req.query);
 
      const query = {
        recruiterId: recruiterId
      }
      const cursor = await companyCollection.findOne(query)
      res.send(cursor || []);
    })



    // post job application
    app.post('/applications', async (req, res) => {
      const application = req.body
      const result = await applicationsColl.insertOne(application);
      res.send(result);
    })

    // get user job application
    app.get('/job-application', async (req, res) => {
      const query = {}

      if (req.query.jobId) {
        query.applicantId = req.query.jobId
      }
      const result = await applicationsColl.find(query).toArray();
      res.send(result);
    })


    // get user job application by user id
    app.get('/applied-jobs', async (req, res) => {
      const query = {}
      console.log('queary', req.query.applicantId);

      if (req.query.applicantId) {
        query.applicantId = req.query.applicantId
      }
      const result = await applicationsColl.find(query).toArray();
      res.send(result);
    })

    // get plans
    app.get('/api/plans', async (req, res) => {
      const query = {}
      if (req.query.plan_id) {
        query.planId = req.query.plan_id
      }
      const result = await planColl.findOne(query);
      res.send(result)
    })

    // post subscription details in db
    app.post('/api/plans', async (req, res) => {
      const data = req.body;
      console.log('server data for sub', data);

      const plansData = {
        ...data,
        createdAt: new Date()
      }
      const result = await subscriptionColl.insertOne(plansData);


      const filter = { email: data.email }
      const updatedDoc = {
        $set: {
          plans: data.planId
        }
      }
      const updateResult = await userCollection.updateOne(filter, updatedDoc);
      res.send(updateResult)

    })


    // update the approval for companies
    app.patch('/api/companies/:id', async (req, res) => {
      const id = req.params.id;
      const updatedCompaniesField = req.body?.status
      const filter = {
        _id: new ObjectId(id)
      }
      const updatedDoc = {
        $set: {
          status: updatedCompaniesField
        }
      }

      const result = await companyCollection.updateOne(filter, updatedDoc)
      res.send(result);

    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('server is getting hotter')
})

app.listen(port, () => {
  console.log(`server is running port ${port}`);

})