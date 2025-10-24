// Type declarations for Deno runtime
declare namespace Deno {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  
  export namespace env {
    export function get(key: string): string | undefined;
  }
}
