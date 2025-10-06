// Type declarations for importing CSS/SCSS files in TypeScript
declare module '*.css';
declare module '*.scss';
declare module '*.sass';

// For CSS modules, export a mapping of class names to generated strings
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
