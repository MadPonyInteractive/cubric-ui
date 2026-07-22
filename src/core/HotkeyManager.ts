/**
 * Global keyboard shortcuts, app-owned (instantiate one per window, D4). The
 * app supplies its own bindings — this ships the mechanism (bind/unbind, key
 * normalization, typing gate), NOT a registry of app-specific keys.
 */

export interface HotkeyOptions {
  /** Fire even while a text field is focused. Default false. */
  allowWhileTyping?: boolean;
}

type HotkeyHandler = (e: KeyboardEvent) => void;

interface Binding {
  handler: HotkeyHandler;
  allowWhileTyping: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  const node = target as HTMLElement | null;
  if (!node || !node.tagName) return false;
  const tag = node.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable === true;
}

/** Normalize a KeyboardEvent to a lowercase "ctrl+shift+k" / "escape" string. */
export function hotkeyString(e: KeyboardEvent): string {
  const parts: string[] = [];
  // ponytail: Ctrl and Cmd fold to one "ctrl" token — cross-platform bindings
  // without every caller writing both. Split them if a shortcut ever needs to.
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  const key = e.key.toLowerCase();
  if (key !== 'control' && key !== 'meta' && key !== 'alt' && key !== 'shift') parts.push(key);
  return parts.join('+');
}

export class HotkeyManager {
  private readonly bindings = new Map<string, Binding[]>();
  private readonly target: Document | HTMLElement;
  private readonly onKeyDown: EventListener;

  constructor(target: Document | HTMLElement = document) {
    this.target = target;
    this.onKeyDown = (e) => this.dispatch(e as KeyboardEvent);
    this.target.addEventListener('keydown', this.onKeyDown);
  }

  /** Bind a normalized key string (e.g. 'escape', 'ctrl+k'). Returns an unbind. */
  bind(key: string, handler: HotkeyHandler, opts: HotkeyOptions = {}): () => void {
    const norm = key.toLowerCase();
    const binding: Binding = { handler, allowWhileTyping: opts.allowWhileTyping ?? false };
    const list = this.bindings.get(norm);
    if (list) list.push(binding);
    else this.bindings.set(norm, [binding]);
    return () => {
      const arr = this.bindings.get(norm);
      if (!arr) return;
      const i = arr.indexOf(binding);
      if (i !== -1) arr.splice(i, 1);
    };
  }

  private dispatch(e: KeyboardEvent): void {
    const list = this.bindings.get(hotkeyString(e));
    if (!list || list.length === 0) return;
    const typing = isTypingTarget(e.target);
    // copy: a handler may unbind mid-dispatch; iterating the live array would skip siblings
    for (const b of [...list]) {
      if (typing && !b.allowWhileTyping) continue;
      b.handler(e);
    }
  }

  destroy(): void {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.bindings.clear();
  }
}
