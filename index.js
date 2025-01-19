const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// 
//
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { assign } = require('nodemailer/lib/shared');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.epj76.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const userCollection = client.db("courseHive").collection("users");
    const courseCollection = client.db("courseHive").collection("courses");
    const assignmentCollection = client.db("courseHive").collection("assignments");
    const enrolledInfoCollection = client.db("courseHive").collection("enrolledInfo");
    const assignmentSubmissionCollection = client.db("courseHive").collection("assignmentSubmission");

    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    // middlewares 
    // TODO : fix jwt
    // ! jwt logout system is not working 
    const verifyToken = (req, res, next) => {
      // console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      // console.log(token)
      // console.log(req.headers.authorization)
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }
    // TODO : verify admin implement 


    // users related api
    // TODO : make it secure 
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = { email }
      const user = req.body
      // check if user exists in db
      const isExist = await userCollection.findOne(query)
      if (isExist) {
        return res.send(isExist)
      }
      const result = await userCollection.insertOne({
        ...user,
        role: 'student',
        timestamp: Date.now(),
      })
      res.send(result)
    })

    app.put('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      // console.log(additionalInfo)
      // console.log(req.body)
      try {
        const user = await userCollection.findOne(query);
        // console.log('user info', user)
        if (!user) return res.status(400).send('You have allready requested, wait for approval')
        const options = { upsert: true }
        const updatedDoc = {
          $set: {
            title: req.body.title,
            experience: req.body.experience,
            category: req.body.category,
          }
        }
        // console.log('updatedDoc : ', updatedDoc)
        const result = await userCollection.updateOne(query, updatedDoc, options)
        // console.log('result ', result)
        res.send(result)
      } catch (err) { console.log(err) }
    })

    // manage user status 
    app.patch('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      if (!user || user?.status === 'requested') return res.status(400).send('You have allready requested, wait for approval')
      const updatedDoc = {
        $set: {
          status: 'requested'
        }
      }
      const result = await userCollection.updateOne(query, updatedDoc)
      res.send(result)
    })

    // to check the role 
    app.get('/user/role/:email', async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email })
      res.send({ role: result?.role })
    })

    // to make teacher --->
    app.patch('/user/teacher/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      if (!user || !user?.status === 'requested') return res.status(400).send('You have allready requested, wait for approval')
      const updatedDoc = {
        $set: {
          status: 'accepted',
          role: 'teacher'
        }
      }
      // console.log(user)
      const result = await userCollection.updateOne(query, updatedDoc)
      // console.log(result)
      res.send(result)
    })

    // reject teacher /user/teacher/reject/
    app.patch('/user/teacher/reject/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      if (!user) return res.status(400).send('You are not the user')
      const updatedDoc = {
        $unset: {
          status: '',
          category: '',
          experience: '',
          title: ''
        },
        $set: { role: 'student' }
      }
      // console.log(user)
      const result = await userCollection.updateOne(query, updatedDoc)
      // console.log(result)
      res.send(result)
    })
    // make admin 
    app.patch('/user/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      if (!user) return res.status(400).send('You are not the user')
      const updatedDoc = {
        $set: { role: 'admin' }
      }
      // console.log(user)
      const result = await userCollection.updateOne(query, updatedDoc)
      // console.log(result)
      res.send(result)
    })



    // ----------------------------------------------- 
    // --------->     Courses 
    app.post('/courses', verifyToken, async (req, res) => {
      const courseInfo = req.body;
      let TotalEnrollment = 0;
      const count = 1;
      // check if courseInfo exists in db
      const result = await courseCollection.insertOne({
        ...courseInfo,
        // TODO : fix total enrollment number 
        TotalEnrollment: 0,
        TotalAssignment: 0,
        TotalSubmissionAssignment: 0,
        status: 'pending',
        timestamp: Date.now(),
      })
      res.send(result)
    })
    // update course
    app.patch('/courses/:id', verifyToken, async (req, res) => {
      const courseId = req.params.id;
      const {
        TeacherName,
        TeacherEmail,
        TeacherPhotoURL,
        price,
        description,
        title,
        image
      } = req.body;
      const updateData = {
        TeacherName,
        TeacherEmail,
        TeacherPhotoURL,
        price: parseFloat(price),
        description,
        title,
        image
      };
      const query = { _id: new ObjectId(courseId) }
      const result = await courseCollection.updateOne(
        query,
        { $set: updateData }
      );
      // console.log(result)
      res.send(result)

    })

    app.get('/courses', async (req, res) => {
      const result = await courseCollection.find().toArray();
      res.send(result);
    });

    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await courseCollection.findOne(query);
      res.send(result);
    });


    // accept 
    app.patch('/courses/acept/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const course = await courseCollection.findOne(query);
      const updatedDoc = {
        $set: { status: 'accepted' }
      }
      const result = await courseCollection.updateOne(query, updatedDoc)
      // console.log(result)
      res.send(result)
    })
    app.patch('/courses/reject/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const course = await courseCollection.findOne(query);
      const updatedDoc = {
        $set: { status: 'rejected' }
      }
      const result = await courseCollection.updateOne(query, updatedDoc)
      // console.log(result)
      res.send(result)
    })
    // delete a course 
    app.delete('/courses/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await courseCollection.deleteOne(query);
      res.send(result)
    });



    // ! -----------------------------------------------------------
    // ------------ ------>> assingment 
    // TODO : post assignment 
    app.post('/assignments', verifyToken, async (req, res) => {
      const assignmentInfo = req.body;
      const { courseID } = assignmentInfo;
      const result = await assignmentCollection.insertOne({
        ...assignmentInfo,
        // TODO : fix submission 
        TotalSubmissionAssignment: 0,
      })
      // TODO : Do the same in the case of total enrollments and submission 
      await courseCollection.updateOne(
        { _id: new ObjectId(courseID) },
        { $inc: { TotalAssignment: 1 } }
      );
      res.send(result)
    })

    app.get('/assignments', async (req, res) => {
      const result = await assignmentCollection.find().toArray();
      res.send(result);
    });

    // ! ---------------------------------------------------------------------
    //  * ------------- ------> enrolledInfo
    // TODO  :  FIX enrolledInfo 
    app.post('/enrolledINFO', verifyToken, async (req, res) => {
      const enrolledInfo = req.body;
      const { courseID } = enrolledInfo;
      const result = await enrolledInfoCollection.insertOne({
        ...enrolledInfo,
        // TODO : fix submission 
      })
      // TODO : Do the same in the case of total enrollments and submission 
      await enrolledInfoCollection.updateOne(
        { _id: new ObjectId(courseID) },
        { $inc: { TotalEnrollment: 1 } }
      );
      res.send(result)
    })


    app.get('/enrolledInfo', async (req, res) => {
      const result = await enrolledInfoCollection.find().toArray();
      res.send(result);
    });

    //? to get the enrolledCourse usign student email 
    app.get('/enrolledCourse/:email', async (req, res) => {
     const {email} = req.params;
     const queryStudentEmail = {studentEmail:email}
     const studentEmails = await enrolledInfoCollection.find(queryStudentEmail).toArray();
     const courseIDs = studentEmails.map(enrollment =>new ObjectId(enrollment.courseID));
     const queryCourseId = {_id: {$in:courseIDs}}
     const courses = await courseCollection.find(queryCourseId).toArray();
     console.log(courses)
     res.send(courses)
    });

    // app.get('/courses/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await courseCollection.findOne(query);
    //   res.send(result);
    // });

    // !-----------------------------------------------------
    // * post  
    app.post('/assignmentSubmission', verifyToken, async (req, res) => {
      const submissionInfo = req.body;
      // const { courseID } = submissionInfo;
      const {assignment}= submissionInfo;
      const {_id, courseID}= assignment;
      console.log(assignment)
      const result = await assignmentSubmissionCollection.insertOne({
        ...submissionInfo,
      })
      
      await assignmentCollection.updateOne(
        { _id: new ObjectId(_id) },
        { $inc: { TotalSubmissionAssignment: 1 } }
      );
      await courseCollection.updateOne(
        { _id: new ObjectId(courseID) },
        { $inc: { TotalSubmissionAssignment: 1 } }
      );
      res.send(result)
    })
 // TODO : post feedback data also in server side








    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('boss is sitting')
})

app.listen(port, () => {
  console.log(`Course Hive is sitting on port ${port}`);
})