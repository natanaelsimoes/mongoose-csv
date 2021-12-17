import { Writable, Transform } from "stream";

declare module "csv-builder" {
  interface CsvBuilderOptions {
    headers: string[];
    alias: {
      [target: string]: string;
    };
    delimiter?: string;
    terminator?: string;
    quoted?: boolean;
  }

  export default class CsvBuilder {
    constructor(options: CsvBuilderOptions);
    createReadStream(data: any): Writable;
    createTransformStream(): Transform;
  }
}