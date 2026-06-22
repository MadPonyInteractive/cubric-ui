import type { Command } from './Command.js';

/**
 * Executes commands and records them in history. The history exists so a future
 * undo stack has data to work with, but it is never popped here — execution is
 * one-directional for now.
 */
export class CommandBus {
  private readonly registry = new Map<string, Command<unknown>>();
  private readonly history: Command<unknown>[] = [];

  /** Register a command instance under its name. */
  register<T>(command: Command<T>): void {
    this.registry.set(command.name, command as Command<unknown>);
  }

  /** Execute a registered command by name, record it, and return its result. */
  execute<T>(name: string): T {
    const command = this.registry.get(name);
    if (!command) throw new Error(`Unknown command: ${name}`);
    const result = command.execute();
    this.history.push(command);
    return result as T;
  }

  /** Number of commands executed (for tests / future undo stack). */
  get historyLength(): number {
    return this.history.length;
  }
}
