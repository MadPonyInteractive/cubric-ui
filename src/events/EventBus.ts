/**
 * Typed event bus. Wrong event name or wrong payload is a COMPILE error, not a
 * runtime surprise — the failure mode of Vision's stringly-typed emit.
 *
 *   bus.emit('ui:toast', { message: 'hi' })   // ok
 *   bus.emit('ui:tost', ...)                   // ts error: bad key
 *   bus.emit('ui:toast', { msg: 'hi' })        // ts error: bad payload
 *
 * Generic over the app's own event map `M` — @cubric/ui ships the bus, each app
 * declares its own map (the package does NOT bake in one app's events).
 *
 * on() returns an unsubscribe; pass it to a component's track() so cleanup is
 * automatic.
 */
export class EventBus<M> {
  private readonly handlers: { [K in keyof M]?: Set<(payload: M[K]) => void> } = {};

  /** Subscribe. Returns an unsubscribe function. */
  on<K extends keyof M>(event: K, handler: (payload: M[K]) => void): () => void {
    (this.handlers[event] ??= new Set()).add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof M>(event: K, handler: (payload: M[K]) => void): void {
    this.handlers[event]?.delete(handler);
  }

  emit<K extends keyof M>(event: K, payload: M[K]): void {
    const set = this.handlers[event];
    if (!set) return;
    for (const handler of [...set]) handler(payload);
  }
}
