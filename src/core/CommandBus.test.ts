import { describe, it, expect } from 'vitest';
import type { Command } from './Command.js';
import { CommandBus } from './CommandBus.js';

describe('CommandBus', () => {
  it('executes a registered command, returns its result, and records history', () => {
    const bus = new CommandBus();
    let value = 0;
    const inc: Command<number> = {
      name: 'test:inc',
      execute: () => (value += 1),
      undo: () => (value -= 1),
    };
    bus.register(inc);

    expect(bus.historyLength).toBe(0);
    expect(bus.execute<number>('test:inc')).toBe(1);
    expect(bus.historyLength).toBe(1);
    expect(bus.execute<number>('test:inc')).toBe(2);
    expect(bus.historyLength).toBe(2);
  });

  it('throws on an unregistered command', () => {
    const bus = new CommandBus();
    expect(() => bus.execute('test:missing')).toThrow(/Unknown command/);
  });
});
