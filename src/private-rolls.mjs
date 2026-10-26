const CFG = /** @type {const} */ ({
	id: 'actually-private-rolls',
	SETTINGS: {
		halfBlind: 'halfBlind',
		halfBlindForOthers: 'halfBlindForOthers',
		allSeeingGM: 'allSeeingGM',
	},
});

let halfBlind = false,
	halfBlindForOthers = false,
	allSeeingGM = false;

const registerPrivateMessagesSettings = () => {
	game.settings.register(CFG.id, CFG.SETTINGS.halfBlind, {
		name: 'ActuallyPrivateRolls.Settings.HalfBlind.Label',
		hint: 'ActuallyPrivateRolls.Settings.HalfBlind.Hint',
		scope: 'world',
		type: Boolean,
		default: true,
		requiresReload: true,
		config: true,
		onChange: value => { halfBlind = value; },
	});
	
	game.settings.register(CFG.id, CFG.SETTINGS.halfBlindForOthers, {
		name: 'ActuallyPrivateRolls.Settings.HalfBlindForOthers.Label',
		hint: 'ActuallyPrivateRolls.Settings.HalfBlindForOthers.Hint',
		scope: 'world',
		type: Boolean,
		default: false,
		requiresReload: true,
		config: true,
		onChange: value => { halfBlindForOthers = value; },
	});

	game.settings.register(CFG.id, CFG.SETTINGS.allSeeingGM, {
		name: 'ActuallyPrivateRolls.Settings.AllSeeingGM.Label',
		hint: 'ActuallyPrivateRolls.Settings.AllSeeingGM.Hint',
		scope: 'world',
		type: Boolean,
		default: false,
		requiresReload: true,
		config: true,
		onChange: value => { allSeeingGM = value; },
	});

	halfBlind = game.settings.get(CFG.id, CFG.SETTINGS.halfBlind);
	halfBlindForOthers = game.settings.get(CFG.id, CFG.SETTINGS.halfBlindForOthers);
	allSeeingGM = game.settings.get(CFG.id, CFG.SETTINGS.allSeeingGM);
};

/**
 * @param {*} options
 * @returns {boolean}
 */
function isMessageVisible({ isBlind, isAuthor, isWhisper, whisper } = {}) {
	// GM always sees their own message, even if it's blind GM roll
	if (isAuthor && game.user.isGM) return true;
	// Blind rolls are not visible to author
	if (isBlind && isAuthor) return false;
	// Whispers are only visible to recipients and author
	if (isWhisper) return isAuthor || whisper.includes(game.user.id);
	// All others are visible
	return true;
};

/**
 * Test message visibility.
 *
 * @param {ChatMessage} cm
 */
function getMessageVisibility(cm) {
	const whisper = cm.whisper,
		isWhisper = whisper?.length > 0,
		isBlind = isWhisper && cm.blind,
		isAuthor = cm.isAuthor,
		isVisible = isMessageVisible({ isWhisper, isBlind, isAuthor, whisper });

	return { whisper, isWhisper, isBlind, isAuthor, isVisible };
};

/**
 * Hide private messages entirely.
 *
 * @param {ChatMessage} cm
 * @param {HTMLElement} html
 */
function onRenderChatMessage(cm, html) {
	// GM always sees everything?
	if (game.user.isGM && allSeeingGM) return;

	const { isAuthor, isVisible } = getMessageVisibility(cm);

	if (!isVisible && (
		(halfBlind && isAuthor) || (halfBlindForOthers && !cm.author.isGM)
	)) {
		html.querySelector('.message-content')?.replaceChildren();
		const header = html.querySelector('.message-header');
		const flavor = header?.querySelector('.flavor-text');
		if (!flavor) {
			const msg = document.createElement('span');
			msg.classList.add('flavor-text');
			msg.textContent = game.i18n.format('ActuallyPrivateRolls.PrivateMessage', { user: cm.user.name });
			header?.append(msg);
		}
	}
	else
		html.classList.toggle('actually-private-message', !isVisible);
};

/**
 * Eliminate new message notification if the message is not visible.
 *
 * @param {Function} wrapped
 * @param {ChatMessage} cm
 * @param {object} options - New in v13. Are these even used?
 */
function onChatLogNotify(wrapped, cm, ...options) {
	if (halfBlind && cm.isAuthor) { /* Ignore */ }
	else if (halfBlindForOthers && !cm.author.isGM) { /* Ignore */ }
	else {
		const { isVisible } = getMessageVisibility(cm);
		if (!isVisible) return;
	}

	return wrapped(cm, ...options);
}

Hooks.once('init', registerPrivateMessagesSettings);

// Register here instead of root scope or init to ensure this happens later than other modules
// Allows other modules to replace or extend chat log in init
Hooks.once('setup', () => {
	Hooks.on('renderChatMessageHTML', onRenderChatMessage);

	/* global libWrapper */
	libWrapper.register(CFG.id, 'CONFIG.ui.chat.prototype.notify', onChatLogNotify, libWrapper.MIXED);
	const mod = game.modules.get(CFG.id);
	console.log(mod.title, '|', mod.version, '| Ready | Hooked into', CONFIG.ui.chat.name);
});
