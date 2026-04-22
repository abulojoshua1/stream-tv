/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HLS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
