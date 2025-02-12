import { createLogger } from '@structures/logger';
import * as Managers from '@managers';
import Patcher from '@api/patcher';
import BuiltIns from '@built-ins';
import * as API from '@api';


const Logger = createLogger('Core');

export async function initialize() {
	try {
		await BuiltIns.initialize();
	} catch (e) {
		Logger.error('Failed to apply built-ins:', e.message);
	}

	window.unbound ??= API;

	Managers.Plugins.initialize();
	Managers.Themes.initialize();
}

export async function shutdown() {
	Patcher.unpatchAll();

	Managers.Plugins.shutdown();
	Managers.Themes.shutdown();

	BuiltIns.shutdown();
}

export default { initialize, shutdown };