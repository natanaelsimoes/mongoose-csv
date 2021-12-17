# mongoose-csv
This is a mongoose plugin that creates a [`CsvBuilder`](https://github.com/nickpisacane/CsvBuilder) instance for your Schema, fully compatible with TypeScript.

## Usage
```ts
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import csv from 'mongoose-csv-export';
import fs from 'fs';

interface IUserSchema extends mongoose.Document {
  fullname: string;
  email: string;
  age: number;
  username: string;
}

var UserSchema = new mongoose.Schema<IUserSchema>({
  fullname: String,
  email: String,
  age: Number,
  username: String,
});

UserSchema.plugin(csv, {
  headers: 'Firstname Lastname Username Email Age',
  alias: {
    'Username': 'username',
    'Email': 'email',
    'Age': 'age'
  },
  virtuals: {
    'Firstname': function(doc) {
      return doc.fullname.split(' ')[0];
    },
    'Lastname': function(doc) {
      return doc.fullname.split(' ')[1];
    }
  }
});

var User = mongoose.model<IUserSchema>('Users', UserSchema);

// Query and stream
User.findAndStreamCsv({age: {$lt: 40}})
  .pipe(fs.createWriteStream('users_under_40.csv'));

// Create stream from query results
User.find({}).exec()
  .then((docs) => {
    User.csvReadStream(docs)
      .pipe(fs.createWriteStream('users.csv'));
  });

// Transform mongoose streams
User.find({})
  .where('age').gt(20).lt(30)
  .limit(10)
  .sort('age')
  .stream()
  .pipe(User.csvTransformStream())
  .pipe(fs.createWriteStream('users.csv'));

// Pipe it to an express route
const app = express();
app.get('/', async (req: Request, res: Response) => {
  const docs = await Test.find({}).exec();
  res.header('Content-Type', 'text/csv; charset=utf-8');
  Test.csvReadStream(docs).pipe(res);
});
app.listen(5000);
```

## Installation
```sh
$ npm install mongoose-csv-export
# OR
$ yarn add mongoose-csv-export
```

## Testing
Running tests requires a local mongodb server, and mocha. While most likely not a namespace issue, the test script will create a database `__mongoose_csv_test__`, and drop the database when finished. You have been warned.
```sh
$ npm test
```

## API

#### Schema.plugin(mongooseToCsv, options)
The `options` argument is passed to the `CsvBuilder` instance, please refer to
the <a href="https://github.com/Nindaff/CsvBuilder">Docs</a> for more in-depth details. The only aditional property that can be included is the `virutals` property.
The `virtuals` have nothing to do with mongoose virtuals.

### Schema.csvReadStream([docs])
Creates a csv formated read stream from query results.
* docs: mongoose query result documents

### Schema.csvTransformStream()
Transforms mongoose querystreams to csv formated streams.

### Schema.findAndStreamCsv(query)
* query: mongoose query object

This is just a convenience method for:
```js
Schema.find(query).cursor().pipe(Schema.csvTransformStream())
```

### Schema.aggregateAndStreamCsv(pipelines)
* pipelines: mongoose pipelines array

This is just a convenience method for:
```js
Schema.aggregate(pipelines).cursor().pipe(Schema.csvTransformStream())
```

## Acknowledgments

Thanks to [`Nick Pisacane`](https://github.com/nickpisacane/mongooseToCsv) for his great job with the original CSV exporter that this repo is based on.