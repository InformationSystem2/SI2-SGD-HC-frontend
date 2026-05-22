import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

interface TypographyState {
  fontFamily: string;
  baseSize: number;
  headingWeight: number;
  lineHeight: number;
  letterSpacing: number;
  h1Size: number;
  h2Size: number;
  h3Size: number;
  h4Size: number;
  h5Size: number;
  h6Size: number;
}

@Component({
  selector: 'app-typography-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './typography-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyEditorComponent {
  readonly typography = input.required<TypographyState>();
  readonly fontOptions = [
    { group: 'IDENTITY.FONT_SANS_SERIF', fonts: ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Nunito', 'Raleway', 'Ubuntu', 'Work Sans', 'Source Sans 3', 'Manrope', 'Outfit', 'Plus Jakarta Sans', 'Figtree', 'Be Vietnam Pro'] },
    { group: 'IDENTITY.FONT_SERIF', fonts: ['Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Crimson Text', 'Libre Baskerville', 'Source Serif 4', 'Spectral', 'DM Serif Display', 'Cormorant Garamond'] },
    { group: 'IDENTITY.FONT_MONOSPACE', fonts: ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Roboto Mono', 'Space Mono'] },
    { group: 'IDENTITY.FONT_DISPLAY', fonts: ['Oswald', 'Bebas Neue', 'Anton', 'Righteous', 'Bungee', 'Staatliches'] }
  ];

  readonly fontSelected = output<string>();
  readonly typographyChange = output<{ field: string; value: number | string }>();

  getH1Style() {
    const t = this.typography();
    return {
      'font-family': `'${t.fontFamily}', sans-serif`,
      'font-size': `${t.baseSize * t.h1Size}px`,
      'font-weight': t.headingWeight,
      'line-height': t.lineHeight,
      'letter-spacing': `${t.letterSpacing}px`
    };
  }

  getH2Style() {
    const t = this.typography();
    return {
      'font-family': `'${t.fontFamily}', sans-serif`,
      'font-size': `${t.baseSize * t.h2Size}px`,
      'font-weight': t.headingWeight,
      'line-height': t.lineHeight,
      'letter-spacing': `${t.letterSpacing}px`
    };
  }

  getBodyStyle() {
    const t = this.typography();
    return {
      'font-family': `'${t.fontFamily}', sans-serif`,
      'font-size': `${t.baseSize}px`,
      'font-weight': 400,
      'line-height': t.lineHeight,
      'letter-spacing': `${t.letterSpacing}px`
    };
  }

  getTypographyProp(key: string): number {
    return (this.typography() as unknown as Record<string, number>)[key] ?? 1;
  }

  onSelectFont(fontFamily: string) {
    this.fontSelected.emit(fontFamily);
  }

  onUpdateTypography(field: string, value: number | string) {
    this.typographyChange.emit({ field, value });
  }
}