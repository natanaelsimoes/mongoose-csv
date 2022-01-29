import csv from "..";
import fs from "fs/promises";
import mongoose, { Document, Model, model, Schema } from "mongoose";
import TestStream from "testable-stream";
import seeds from "./users.json";

interface ITestSchema extends Document {
  fullname: string;
  email: string;
  age: number;
  username: string;
}

let expected: string, expectedUnder40: string, Test: Model<ITestSchema>;

describe("mongoose-csv", function () {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost/__mongoose_csv_test__");

    var TestSchema = new Schema<ITestSchema>({
      fullname: { type: String },
      email: { type: String },
      age: { type: Number },
      username: { type: String },
    });

    TestSchema.plugin(csv, {
      headers: "Firstname Lastname Username Email Age",
      alias: {
        Username: "username",
        Email: "email",
        Age: "age",
      },
      virtuals: {
        Firstname: function (doc: ITestSchema) {
          return doc.fullname.split(" ")[0];
        },
        Lastname: function (doc: ITestSchema) {
          return doc.fullname.split(" ")[1];
        },
      },
    });

    Test = model("Test", TestSchema);

    for(const user of seeds) {
      await Test.create(user);
    }

    expected = await fs.readFile(__dirname + "/expected.csv", {
      encoding: "utf8",
    });
    expectedUnder40 = await fs.readFile(__dirname + "/expected_under_40.csv", {
      encoding: "utf-8",
    });
  });

  afterAll(async () => {
    await Test.deleteMany({}).exec();
    await mongoose.connection.close();
  });

  it("should create a readable stream from a query.", (done) => {
    Test.find({}).then((docs) => {
      Test.csvReadStream(docs)
        .pipe(TestStream())
        .on("testable", (data: Buffer) => {
          expect(data.toString()).toBe(expected);
          done();
        });
    });
  });

  it("should create a transorm stream.", (done) => {
    Test.find({})
      .cursor()
      .pipe(Test.csvTransformStream())
      .pipe(TestStream())
      .on("testable", function (data: Buffer) {
        expect(data.toString()).toBe(expected);
        done();
      });
  });

  it("should create a stream from a query", (done) => {
    Test.findAndStreamCsv({
      age: { $lt: 40 },
    })
      .pipe(TestStream())
      .on("testable", function (data: Buffer) {
        expect(data.toString()).toBe(expectedUnder40);
        done();
      });
  });

  it("should create a stream from a pipeline", (done) => {
    Test.aggregateAndStreamCsv([
      {
        $match: { age: { $lt: 40 } },
      },
    ])
      .pipe(TestStream())
      .on("testable", function (data: Buffer) {
        expect(data.toString()).toBe(expectedUnder40);
        done();
      });
  });

  it("should accept common json like aggregate result", (done) => {
    Test.aggregate([
      {
        $match: { age: { $lt: 40 } },
      },
    ]).then((docs) => {
      Test.csvReadStream(docs)
        .pipe(TestStream())
        .on("testable", (data: Buffer) => {
          expect(data.toString()).toBe(expectedUnder40);
          done();
        });
    });
  });
});
