/// <reference types="vite/client" />

// GLSL shader module declarations
declare module '*.glsl' {
  const content: string;
  export default content;
}

declare module '*.vert' {
  const content: string;
  export default content;
}

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.vs' {
  const content: string;
  export default content;
}

declare module '*.fs' {
  const content: string;
  export default content;
}

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
