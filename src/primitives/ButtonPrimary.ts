import { Button, type ButtonProps } from './Button.js';

/** Props for ButtonPrimary — same as ButtonProps but variant is always 'primary'. */
export type ButtonPrimaryProps = Omit<ButtonProps, 'variant'>;

/**
 * ButtonPrimary — heat-fill primary action button.
 * Thin subclass of Button that locks variant to 'primary'.
 * All CSS, bindEvents, setDisabled, and setText are inherited.
 */
export class ButtonPrimary extends Button {
  constructor(props: ButtonPrimaryProps) {
    super({ ...props, variant: 'primary' });
  }
}
