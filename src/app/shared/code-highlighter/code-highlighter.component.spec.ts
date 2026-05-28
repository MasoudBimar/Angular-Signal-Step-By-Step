import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeHighlighterComponent } from './code-highlighter.component';
import { describe, beforeEach, it, expect } from 'vitest';

describe('CodeHighlighterComponent', () => {
  let component: CodeHighlighterComponent;
  let fixture: ComponentFixture<CodeHighlighterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeHighlighterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeHighlighterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
