// Ensure TypeScript knows about process.env.API_KEY
// We augment the global NodeJS namespace to add API_KEY to ProcessEnv.
// This avoids conflict with existing declarations of 'process' (e.g. from @types/node).
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      [key: string]: string | undefined;
    }
  }
}

export {};