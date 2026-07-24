/**
 * `/` — the public marketing page. Built with Hallmark from Wayfare's
 * structural DNA (live-board hero, numbered stages) applied to Vista's own
 * content: the real competitions board and the real 50/20/0 scoring rule
 * from `Concept_Regles.md`, not the source's travel copy.
 *
 * The rail's scroll-spy (active dot) and the step-sequence sweep-in are
 * IntersectionObserver-driven; both are wrapped in `afterNextRender` since
 * `IntersectionObserver` doesn't exist during SSR.
 */
import { afterNextRender, Component, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    afterNextRender(() => this.setupScrollSpy());
  }

  protected scrollToSection(id: string): void {
    this.elementRef.nativeElement.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private setupScrollSpy(): void {
    const root = this.elementRef.nativeElement;
    const sectionIds = ['hero', 'board', 'how', 'closing'];
    const sections = sectionIds.map((id) => root.querySelector<HTMLElement>(`#${id}`));
    const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('.rail__dots button'));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sections.indexOf(entry.target as HTMLElement);
          dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((section) => section && sectionObserver.observe(section));

    const sweepObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    root.querySelectorAll('.sweep').forEach((el) => sweepObserver.observe(el));
  }
}
