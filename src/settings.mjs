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

	game.settings.register(CFG.id, CFG.SETTINGS.allSeeingGM, {
		name: 'ActuallyPrivateRolls.Settings.AllSeeingGM.Label',
		hint: 'ActuallyPrivateRolls.Settings.AllSeeingGM.Hint',
		scope: 'world',
		type: Boolean,
		default: false,
		requiresReload: true,
		config: true,
	});
}

Hooks.once('init', registerPrivateRollsSettings);
