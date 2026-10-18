// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  /**
   * @description
   * The version of Fireguard, injected from its package.json at build time.
   */
  const __FIREGUARD_VERSION__: string;
}

export {};
