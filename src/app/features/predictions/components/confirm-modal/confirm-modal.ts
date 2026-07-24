/**
 * Generic yes/no confirmation dialog, styled to the Hallmark/Almanac design
 * system (sharp corners, `border-rule`, mono buttons) — stands in for the
 * browser-native `confirm()` used by `championship-prediction-page`'s
 * "submit definitively" action, which can't be themed and reads as an
 * out-of-place OS dialog. Kept feature-local (not `shared/`) for now since
 * this page is still the only consumer, matching the convention already
 * used by `predictions.service.ts`.
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
