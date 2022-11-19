import { CFG } from './config.mjs';

const registerPrivateRollsSettings = () => {
	game.settings.register(CFG.id, CFG.SETTINGS.halfBlind, {
		name: 'ActuallyPrivateRolls.Settings.HalfBlind.Label',
		hint: 'ActuallyPrivateRolls.Settings.HalfBlind.Hint',
		scope: 'world',
		type: Boolean,
		default: true,
		requiresReload: true,
		config: true,
	});
}

Hooks.once('init', registerPrivateRollsSettings);
