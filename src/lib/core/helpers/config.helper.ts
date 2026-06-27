import chroma from 'chroma-js';
import { appStore } from '../stores/app.store';
import type { TFireguardConfig, TColor } from '@eoussama/firemitt';

/**
 * @description
 * Helper class for loading configuration settings.
 */
export class ConfigHelper {
	/**
	 * @description
	 * Loads color settings from the configuration and applies them to the application.
	 *
	 * @param config The configuration settings.
	 */
	private static loadColor(name: TColor, color: string): void {
		const root = document.querySelector(':root') as HTMLElement;
		const chromaColor = chroma(color);

		if (root) {
			const colorHex = chromaColor.hex();
			const colorRgb = chromaColor.rgb();
			const colorHsl = chromaColor.hsl();

			root.style.setProperty(`--color-${name}`, colorHex);
			root.style.setProperty(`--color-${name}-rgb`, colorRgb.join(','));
			root.style.setProperty(`--color-${name}-hsl`, `${colorHsl[0]}, ${colorHsl[1] * 100}%`);
		}
	}

	/**
	 * @description
	 * Loads the entire configuration settings.
	 *
	 * @param config The configuration settings to load.
	 */
	static load(config: TFireguardConfig): void {
		const colors: Array<TColor> = ['primary', 'secondary', 'text'];

		colors.forEach((color) => this.loadColor(color, config.theme[color]));
		appStore.loadConfig(config);
	}
}
