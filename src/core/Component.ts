/**
 * The OOP component foundation — the architecture itself, not a helper.
 *
 * Replaces Cubric Vision's functional ComponentFactory (closures + prose-enforced
 * cleanup that agents repeatedly violated). Here the lifecycle is a template
 * method and cleanup is INHERITED, so a subclass physically cannot forget to
 * unsubscribe: it never writes destroy().
 *
 *   mount() -> render() -> setup() -> bindEvents()      (orchestrated, final)
 *   destroy() -> onDestroy() + flush track()ed cleanups + destroy children
 *
 * Tiers (Primitive -> Compound -> Organism -> Block) are enforced by
 * eslint-plugin-boundaries on directory, not by this class.
 *
 * Components emit through a typed EventBus<M> directly, so the base class is
 * parameterized on props only — a TEvents param would have no consumer.
 */

export type Cleanup = () => void;

/**
 * The minimal lifecycle a mountChild() child must satisfy. Structural, NOT
 * nominal: a child only needs to mount and tear down. This is deliberate — a
 * consumer app that has its OWN copy of Component (e.g. Vision's future TS
 * core, or any app not yet migrated to @cubric/ui's core) must still be able to
 * mountChild() a @cubric/ui component, and vice versa. Requiring `child` to be
 * nominally `Component<P>` would couple the two classes through TS's nominal
 * `protected` checks and make cross-package mounting fail to compile.
 */
export interface Mountable {
  mount(parent: HTMLElement): unknown;
  destroy(): void;
}

export abstract class Component<TProps = void> {
  /** The root element, available after mount(). */
  protected el!: HTMLElement;

  protected readonly props: TProps;

  private readonly cleanups: Cleanup[] = [];
  private readonly children: Mountable[] = [];
  private mounted = false;
  private destroyed = false;

  constructor(props: TProps) {
    this.props = props;
  }

  /**
   * Template method. Orchestrates the lifecycle and attaches `el` to `parent`.
   * Do NOT override — override render/setup/bindEvents instead.
   */
  mount(parent: HTMLElement): this {
    if (this.mounted) throw new Error('Component already mounted');
    if (this.destroyed) throw new Error('Cannot mount a destroyed component');
    this.el = this.render();
    this.setup();
    this.bindEvents();
    parent.appendChild(this.el);
    this.mounted = true;
    return this;
  }

  /** The root element, for composition by a parent (mounting children into a layout). Available after mount(). */
  get element(): HTMLElement {
    return this.el;
  }

  /** Build and return the root element. The one piece every component must define. */
  protected abstract render(): HTMLElement;

  /** One-time wiring after render (refs, initial state). Optional. */
  protected setup(): void {}

  /** Subscribe to DOM/bus events here; use track() so they auto-clean. Optional. */
  protected bindEvents(): void {}

  /** Optional teardown hook, run before tracked cleanups and children. */
  protected onDestroy(): void {}

  /**
   * Register a cleanup (an unsubscribe, a removeEventListener, etc.). Everything
   * registered here runs exactly once on destroy(). This is how leaks become
   * impossible: subscriptions are tracked, not hand-managed.
   */
  protected track(cleanup: Cleanup): void {
    this.cleanups.push(cleanup);
  }

  /**
   * Mount a child and tie its lifetime to this component's. Accepts any
   * Mountable (structural), so a consumer can mount a @cubric/ui component even
   * when its own enclosing component extends a DIFFERENT copy of Component.
   */
  protected mountChild<C extends Mountable>(child: C, parent: HTMLElement = this.el): C {
    child.mount(parent);
    this.children.push(child);
    return child;
  }

  /**
   * Tear down: run onDestroy, flush every tracked cleanup, destroy children,
   * remove `el`. Idempotent. Inherited — subclasses never reimplement this.
   */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.onDestroy();
    for (const child of this.children.splice(0)) child.destroy();
    for (const cleanup of this.cleanups.splice(0)) cleanup();
    this.el?.remove();
  }
}
