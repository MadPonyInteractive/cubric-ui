import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './EventBus.js';

// The package ships a GENERIC bus — apps declare their own map. This local map
// stands in for a consuming app's, proving the generic works with any shape.
interface TestEventMap {
  'ui:toast': { message: string };
  'model:loaded': { model: string };
}

describe('EventBus', () => {
  it('delivers a correctly-typed emit to a typed handler', () => {
    const bus = new EventBus<TestEventMap>();
    const handler = vi.fn<(p: TestEventMap['ui:toast']) => void>();
    bus.on('ui:toast', handler);
    bus.emit('ui:toast', { message: 'hello' });
    expect(handler).toHaveBeenCalledWith({ message: 'hello' });
  });

  it('on() returns an unsubscribe that stops delivery', () => {
    const bus = new EventBus<TestEventMap>();
    const handler = vi.fn();
    const off = bus.on('ui:toast', handler);
    off();
    bus.emit('ui:toast', { message: 'x' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects wrong event names and wrong payloads at COMPILE time', () => {
    const bus = new EventBus<TestEventMap>();
    // @ts-expect-error unknown event name
    bus.emit('ui:tost', { message: 'x' });
    // @ts-expect-error wrong payload shape
    bus.emit('ui:toast', { msg: 'x' });
    // @ts-expect-error unknown event name on subscribe
    bus.on('nope', () => {});
    expect(true).toBe(true); // the assertions above are the @ts-expect-error lines
  });
});
