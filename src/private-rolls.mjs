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
		// baseMsg?.querySelector('.flavor-text');
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
