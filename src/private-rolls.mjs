import { CFG } from './config.mjs';
import './settings.mjs';

const isMessageVisible = ({ isBlind, isAuthor, isWhisper, whisper } = {}) => {
	// Blind rolls are not visible to author
	if (isBlind && isAuthor) return false;
	// Whispers are only visible to recipients and author
	if (isWhisper) return isAuthor || whisper.includes(game.user.id);
	// All others are visible
	return true;
}

/**
 * Test message visibility.
 *
 * @param {ChatMessage} cm
 */
const getMessageVisibility = (cm) => {
	const cmData = game.release.generation >= 10 ? cm : cm.data,
		whisper = cmData.whisper ?? [],
		isWhisper = whisper.length > 0,
		isBlind = isWhisper && cmData.blind,
		isAuthor = cm.isAuthor,
		isVisible = isMessageVisible({ isWhisper, isBlind, isAuthor, whisper });

	return { whisper, isWhisper, isBlind, isAuthor, isVisible };
}

/**
 * Find user name, even if user info has not been initialized yet
 *
 * @param {ChatMessage} cm
 */
function getUserName(cm) {
	const userId = cm._source.user;
	const user = cm.user ?? game.data.users.find(i => i._id == userId);
	return user?.name;
}

/**
 * Hide private messages entirely.
 *
 * @param {ChatMessage} cm
 * @param {JQuery} html
 */
const renderChatMessageEvent = (cm, [html]) => {
	// GM always sees everything
	if (game.user.isGM) return;

	const { isAuthor, isBlind, isVisible } = getMessageVisibility(cm);
	const baseMsg = html.dataset.messageId ? html : html.closest('[data-message-id]');
	if (game.settings.get(CFG.id, CFG.SETTINGS.halfBlind) && isAuthor && isBlind) {
		baseMsg?.querySelector('.message-content')?.replaceChildren();
		const header = baseMsg?.querySelector('.message-header');
		const flavor = header?.querySelector('.flavor-text');
		if (!flavor) {
			const msg = document.createElement('span');
			msg.classList.add('flavor-text');
			const userName = getUserName(cm);
			msg.textContent = game.i18n.format('ActuallyPrivateRolls.PrivateMessage', { user: userName });
			header?.append(msg);
		}
	}
	else
		baseMsg.classList.toggle('actually-private-roll', !isVisible);
}

Hooks.on('renderChatMessage', renderChatMessageEvent);
// Hooks.on('updateChatMessage', ...); // unnecessary

/**
 * Eliminate new message notification if the message is not visible.
 *
 * @param {Function} wrapped
 * @param {ChatMessage} cm
 */
function chatLogNotifyWrapper(wrapped, cm) {
	const { isVisible } = getMessageVisibility(cm);
	if (!isVisible) return;
	wrapped.call(this, cm);
}

Hooks.once('init', () => {
	// BUG: This might not work on all systems, in case they extend ChatLog
	/* global libWrapper */
	libWrapper.register(CFG.id, 'ChatLog.prototype.notify', chatLogNotifyWrapper, libWrapper.MIXED);
});

Hooks.once('ready', () => {
	const mod = game.modules.get(CFG.id);
	console.log('Actually Private Rolls |', mod.version);
});
