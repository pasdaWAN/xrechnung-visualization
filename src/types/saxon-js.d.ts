declare module 'saxon-js' {
  interface TransformOptions {
    stylesheetText: string;
    sourceText: string;
    destination: string;
    parameters?: Record<string, unknown>;
  }

  interface TransformResult {
    principalResult: string;
    metadata?: Record<string, unknown>;
  }

  export function transform(options: TransformOptions): Promise<TransformResult>;
} 