/**
 * Command pattern — the one place we build structure ahead of need.
 *
 * Every state mutation in a consuming app is a Command from day one. v1 apps need
 * not wire an undo *stack* (that's later), but because each mutation already
 * carries an `undo` slot, adding the stack later does NOT mean rewriting every
 * mutation site — exactly the retrofit cost Vision's scattered mutations imposed.
 */
export interface Command<T = void> {
  /** Stable identifier, e.g. 'enhancer:setTargetModel'. */
  readonly name: string;

  /** Perform the mutation; returns its result. */
  execute(): T;

  /**
   * Reverse execute(). Optional (no undo stack yet) but defining it now is the
   * whole point of the pattern — leave it present even when trivial.
   */
  undo?(): void;
}
