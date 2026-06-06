const express = require('express');
const cors = require('cors');
const app=express();
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    const database=client.db("hireloop_auth")
    const jobsCollection=database.collection("jobs");
    const companyCollection=database.collection("company");



    app.post('/jobs',async(req,res)=>{
        const job=req.body;
        const result=await jobsCollection.insertOne(job);
        res.send(result);
    })


    // get company jobs
    app.get('/api/jobs',async(req,res)=>{
      const query={}
      if(req.query.companyId){
        query["company.companyId"]=req.query.companyId
      }
      if(req.query.status){
        query.status=req.query.status;
      }
      const cursor=await jobsCollection.find(query)
      const result=await cursor.toArray();
      res.send(result);
    })



    // post company data

    app.post('/company',async(req,res)=>{
      const data=req.body;
      const result=await companyCollection.insertOne(data);
      res.send(result);
    })


  app.get('/company',async(req,res)=>{
    const recruiterId=req.query.recruiterId
    console.log(recruiterId);
    
    const query={
      recruiterId:recruiterId
    }
    const cursor=await companyCollection.find(query)
    const result=await cursor.toArray();
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






app.get('/',(req,res)=>{
    res.send('server is getting hotter')
})

app.listen(port,()=>{
    console.log(`server is running port ${port}`);
    
})