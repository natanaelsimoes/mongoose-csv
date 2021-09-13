declare module 'mongoose' {
  import { Stream } from 'stream';

  export interface ExportModel<T extends Document> extends Model<T> {
    static csvReadStream(docs: T[]): Stream;

    static findAndStreamCsv(query?: any): Stream;

    static csvTransformStream(): Stream;
  }
}


declare module 'mongoose-to-csv' {
  export function mongooseToCsv(schema: any, options: any): void;
}
