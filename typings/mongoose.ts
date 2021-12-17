import { FilterQuery, Document, PipelineStage } from "mongoose";
import { Writable, Transform } from "stream";

declare module "mongoose" {
  interface Model<
    T extends Document,
    TQueryHelpers = {},
    TMethods = {},
    TVirtuals = {}
  > extends NodeJS.EventEmitter,
      AcceptsDiscriminator {
    /**
     * Method `csvReadStream`
     * @param {T[]} docs Array of mongoose documents
     * @return {Writable} Csv read stream.
     */
    csvReadStream(docs: T[]): Writable;
    /**
     * Create a transform stream
     * @return {Transform} Transform stream
     */
    csvTransformStream(): Transform;
    /**
     * Create a CSV stream from a query Object.
     * @param {FilterQuery<any>} query Mongoose query
     * @return {Transform} CSV transform stream
     */
    findAndStreamCsv(query: FilterQuery<any>): Transform;
    /**
     * Create a CSV stream from a aggregation.
     * @param {PipelineStage[]} pipelines Mongoose pipelines
     * @return {Transform} CSV transform stream
     */
    aggregateAndStreamCsv(pipelines: PipelineStage[]): Transform;
  }
}
