import CsvBuilder, { CsvBuilderOptions } from "csv-builder";
import { Document, Schema } from "mongoose";

import "./typings/csv-builder";
import "./typings/mongoose";
import "./typings/testable-stream";

/**
 * Create CSV streams from a mongoose schema
 * @param {mongoose.Schema} schema
 * @param {CsvBuilderOptions} options CsvBuilder options
 */
export default function csv(schema: Schema, options: CsvBuilderOptions) {
  const builder = new CsvBuilder({ delimiter: ";", ...options });

  schema.static("csvReadStream", function (docs: Document[]) {
    const data = docs.map((d) => d.toJSON ? d.toJSON() : d);
    return builder.createReadStream(data);
  });

  schema.static("findAndStreamCsv", function (query) {
    query = query || {};
    return this.find(query).cursor().pipe(builder.createTransformStream());
  });

  schema.static("aggregateAndStreamCsv", function (pipelines) {
    pipelines = pipelines || [];
    return this.aggregate(pipelines)
      .cursor()
      .pipe(builder.createTransformStream());
  });

  schema.static("csvTransformStream", function () {
    return builder.createTransformStream();
  });
}
