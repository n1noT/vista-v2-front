/**
 * Generic yes/no confirmation dialog, styled to the Hallmark/Almanac design
 * system (sharp corners, `border-rule`, mono buttons) — stands in for the
 * browser-native `confirm()`. Originally built for
 * `championship-prediction-page`'s "submit definitively" action (which
 * can't be themed and reads as an out-of-place OS dialog); moved here from
 * `features/predictions/components/` once the admin players page became a
 * second consumer (ban/delete confirmations).
 *
 * Presentational only: the parent owns `open` and reacts to `confirmed`/
 * `cancelled`, this component has no state of its own beyond rendering.
 * Escape and a backdrop click both cancel, matching native `confirm()`'s
 * "dismiss = false" behavior.
 */
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.html',
})
export class ConfirmModal {
  readonly open = input.required<boolean>();
  readonly title = input('Confirm');
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
