// C - Create
// R - Read
// U - Update
// D - Delete
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const URL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

MongoClient.connect(URL, { useUnifiedTopology: true }, (error, client) => {
  if (error) {
    return console.log('Unable to connect to database');
  }
  const db = client.db(databaseName);
  db.collection('users').insertOne(
    {
      name: 'Watson',
      age: 25,
    },
    (error, result) => {
      //Callback
      if (error) {
        return console.log('Unable to insert');
      }
      console.log(result.ops);
    }
  );
});
