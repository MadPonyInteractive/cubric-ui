import { describe, it, expect, vi } from 'vitest';
import { Component } from './Component.js';

class Trivial extends Component<{ label: string }> {
  rendered = false;
  protected render(): HTMLElement {
    this.rendered = true;
    const el = document.createElement('div');
    el.textContent = this.props.label;
    return el;
  }
}

describe('Component', () => {
  it('runs render on mount and attaches el to the parent', () => {
    const parent = document.createElement('div');
    const c = new Trivial({ label: 'hi' }).mount(parent);
    expect(c.rendered).toBe(true);
    expect(parent.textContent).toBe('hi');
  });

  it('fires each tracked cleanup exactly once on destroy, and removes el', () => {
    const cleanup = vi.fn();
    const parent = document.createElement('div');
    class WithSub extends Trivial {
      protected bindEvents(): void {
        this.track(cleanup);
      }
    }
    const c = new WithSub({ label: 'x' }).mount(parent);
    expect(parent.children.length).toBe(1);

    c.destroy();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(parent.children.length).toBe(0);

    c.destroy(); // idempotent
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('destroys mounted children when the parent is destroyed', () => {
    const childCleanup = vi.fn();
    class Child extends Trivial {
      protected bindEvents(): void {
        this.track(childCleanup);
      }
    }
    class Parent extends Trivial {
      protected setup(): void {
        this.mountChild(new Child({ label: 'c' }));
      }
    }
    const root = document.createElement('div');
    const p = new Parent({ label: 'p' }).mount(root);
    p.destroy();
    expect(childCleanup).toHaveBeenCalledTimes(1);
  });

  it('rejects double mount', () => {
    const parent = document.createElement('div');
    const c = new Trivial({ label: 'a' }).mount(parent);
    expect(() => c.mount(parent)).toThrow(/already mounted/);
  });
});
