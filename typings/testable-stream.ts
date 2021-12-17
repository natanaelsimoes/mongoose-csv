import { Writable, WritableOptions } from "stream";

declare module "testable-stream" {
  export default function TestStream(options?: WritableOptions): Writable;
}
