/**
 * Root component (`<app-root>`), just an outlet plus one bit of app-wide
 * bootstrapping: kicking off session hydration so the rest of the app knows
 * whether a user is logged in before it matters (e.g. before a guard needs
 * to check it, or before a navbar would need to show a logged-in state).
 * The `authService.ensureSession()` call is wrapped in `afterNextRender`
 * specifically so it only ever runs in the browser — during SSR there's no
 * cookie jar to read the session from (the server has no notion of "this
 * browser's cookies" without the incoming request's Cookie header being
 * forwarded, which this app doesn't do; see the SSR caveat in the auth
 * feature's plan), so attempting it server-side would be pointless at best.
 */
import { afterNextRender, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly authService = inject(AuthService);

  constructor() {
    // Session hydration is client-only: SSR has no browser cookie jar to read from.
    afterNextRender(() => this.authService.ensureSession().subscribe());
  }
}
