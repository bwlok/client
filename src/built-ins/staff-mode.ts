import Storage, { getStore, type SettingsPayload } from '@api/storage';
import type { BuiltInData } from '@typings/built-ins';
import { Guilds, Users } from '@api/metro/stores';
import { createLogger } from '@structures/logger';
import { createPatcher } from '@api/patcher';
import { findStore } from '@api/metro';


const Patcher = createPatcher('unbound::staff');
const Logger = createLogger('Core', 'Staff Mode');
const Settings = getStore('unbound');

export let ws: WebSocket;

export const data: BuiltInData = {
	name: 'Staff Mode',
	unpatches: []
};

export function start() {
	patchDeveloperStore();
}

export function stop() {
	data.unpatches.map(unpatch => unpatch());
	Patcher.unpatchAll();
}

function patchDeveloperStore() {
	const Store = findStore('DeveloperExperiment');
	if (!Store) return Logger.error('Failed to find DeveloperExperimentStore.');

	Patcher.instead(Store, 'initialize', (self, args, orig) => {
		self.waitFor(Users, Guilds);

		Object.defineProperties(self, {
			isDeveloper: {
				configurable: false,
				get: () => Settings.get('staff-mode', false),
				set: () => { }
			}
		});
	});

	function handler({ store, key }: SettingsPayload) {
		if (store !== 'unbound' || key !== 'staff-mode') return;

		Store.emitChange();
	}

	Storage.on('changed', handler);
	data.unpatches.push(() => void Storage.off('changed', handler));
}