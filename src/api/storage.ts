import type { DCDFileManagerType, Payload } from '@typings/api/native';
import { BundleManager, getNativeModule } from '@api/native';
import EventEmitter from '@structures/emitter';
import { isEmpty } from '@utilities';

const Events = new EventEmitter();

export const DCDFileManager: DCDFileManagerType = getNativeModule('DCDFileManager', 'RTNFileManager');
export const settings = globalThis.UNBOUND_SETTINGS ?? {};

export const on = Events.on.bind(Events);
export const off = Events.off.bind(Events);

export function get<T extends any>(store: string, key: string, def: T): T & {} {
	const keys = key.split('.');
	const data = { result: settings[store] };

	for (const key of keys) {
		if (data.result === void 0 || data.result[key] === void 0) {
			data.result = def;
			break;
		}

		data.result = data.result[key];
	}

	return data.result;
}

export function set(store: string, key: string, value: any) {
	const keys = key.split('.');
	const data = { current: settings[store] ??= {} };

	for (let i = 0; keys.length > i; i++) {
		data.current[keys[i]] ??= {};

		if ((keys.length - 1) === i) {
			data.current[keys[i]] = value;
		} else {
			data.current = data.current[keys[i]];
		}
	}

	Events.emit('changed', { store, key, value });
	Events.emit('set', { store, key, value });
}

export function toggle(store: string, key: string, def: any) {
	const prev = get(store, key, def);
	set(store, key, !prev);

	Events.emit('changed', { store, key, value: !prev });
	Events.emit('toggled', { store, key, prev, value: !prev });
}

export function remove(store: string, key: string) {
	delete settings[store][key];

	if (isEmpty(settings[store])) {
		delete settings[store];
	}

	Events.emit('changed', { store, key, value: undefined });
	Events.emit('removed', { store, key });
}

export function getStore(store: string) {
	return {
		set: (key: string, value: any) => set(store, key, value),
		get: <T extends any>(key: string, def: T): T & {} => get(store, key, def),
		toggle: (key: string, def: any) => toggle(store, key, def),
		remove: (key: string) => remove(store, key),
		useSettingsStore: () => useSettingsStore(store)
	};
}

export function useSettingsStore(store: string, predicate?: (payload: Payload) => boolean) {
	const [, forceUpdate] = React.useState({});

	React.useEffect(() => {
		function handler(payload) {
			if (payload.store !== store) {
				return;
			}

			if (!predicate || predicate(payload)) {
				forceUpdate({});
			}
		}

		Events.on('changed', handler);

		return () => void Events.off('changed', handler);
	}, []);

	return {
		set: (key: string, value: any) => set(store, key, value),
		get: <T extends any>(key: string, def: T): T & {} => get(store, key, def),
		toggle: (key: string, def: any) => toggle(store, key, def),
		remove: (key: string) => remove(store, key),
	};
}

export const pendingReload = { value: false };

Events.on('changed', () => {
	const payload = JSON.stringify(settings, null, 2);
	const path = 'Unbound/settings.json';

	const promise = DCDFileManager.writeFile('documents', path, payload, 'utf8');
	promise.then(() => pendingReload.value && BundleManager.reload());
});

export default { useSettingsStore, getStore, get, set, remove, on, off };