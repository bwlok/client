import { createLogger } from '@structures/logger';
import { DCDFileManager } from '@api/storage';
import { ManagerType } from '@managers/base';
import FontName from '@managers/test';

class Fonts {
	name = 'Fonts';
	path = `Unbound/${this.name}`;
	logger = createLogger('Manager', 'Fonts');
	entities = new Map<string, Font>();
	type = ManagerType.Fonts;

	constructor() {
		for (const font of window.UNBOUND_FONTS ?? []) {
			this.entities.set(font.name, font);
		}
	}

	save(file: string, name: string, data: string) {
		const path = `${this.path}/${file}`;

		DCDFileManager.writeFile('documents', path, data, 'base64');
		this.entities.set(file, { path, file, name });
	}

	async install(url: string, setState?: Fn, signal?: AbortSignal, ...args): Promise<string | Error> {
		const name = url.split('/').pop();

		this.logger.debug(`Fetching ${url} for font ${name}`);

		const font = await fetch(url, { cache: 'no-cache', signal })
			.then(res => {
				if (res.ok) return res.arrayBuffer();

				setState?.({ error: `${res.status}: ${res.statusText}` });
			})
			.catch(e => {
				this.logger.error(`Encountered error while fetching ${url}:`, e);
				setState?.({ error: e.message });
			});

		if (!font) return;

		console.log(font);
		const buffer = Buffer.from(font);
		const data = buffer.toString('base64');

		try {
			this.logger.debug('Parsing font from', url);
			var [{ fullName }] = FontName.parse(font);
			this.logger.debug('Successfully parsed font from', url);
		} catch (e) {
			setState?.({ error: 'Failed to parse font. Is it a valid font?' });
			this.logger.error('Failed to parse font:', e.message);
			return;
		}



		this.logger.debug('Saving...');
		this.save(name, fullName, data);
		this.logger.debug('Saved.');

		return this.onFinishedInstalling(name);
	}

	async onFinishedInstalling(name: string) {
		const { Redesign } = await import('@metro/components');

		Redesign.dismissAlerts();

		await this.showAddonToast(name, 'UNBOUND_SUCCESSFULLY_INSTALLED');
		return name;
	}

	initialize(constants: any) {
		return;
		// alert('loading');
		// for (const font in constants.Fonts) {
		// 	constants.Fonts[font] = [...this.entities.values()][0].name;
		// 	alert('Replaced ' + font);
		// }
	}

	async showAddonToast(name: string, message: string, icon?: string) {
		// const { Strings } = await import('@api/i18n');
		// const { showToast } = await import('@api/toasts');
		// const { Icons } = await import('@api/assets');

		// showToast({
		// 	title: name,
		// 	content: Strings[message],
		// 	icon: (() => {
		// 		if (icon) return Icons[icon];
		// 		if (addon?.data?.icon) {
		// 			return typeof addon.data.icon === 'string' ? Icons[addon.data.icon] : addon.data.icon;
		// 		}

		// 		return this.icon ?? 'CircleQuestionIcon';
		// 	})(),
		// 	tintedIcon: true
		// });
	}
}

export default new Fonts();