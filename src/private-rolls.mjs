import { CFG } from './config.mjs';
import './settings.mjs';

/**
 * Test message visibility.
 *
 * @param {ChatMessage} cm
 */
const isMessageVisible = ({ isBlind, isAuthor, isWhisper, whisper, cm } = {}) => {
	// Blind rolls are not visible to author
	if (isBlind && isAuthor) return false;
	// Whispers are only visible to recipients and author
	if (isWhisper) return isAuthor || whisper.includes(game.user.id);
	// All others are visible
	return true;
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

	const cmData = game.release.generation >= 10 ? cm : cm.data,
		whisper = cmData.whisper ?? [],
		isWhisper = whisper.length > 0,
		isBlind = isWhisper && cmData.blind,
		isAuthor = cm.isAuthor,
		isVisible = isMessageVisible({ isWhisper, isBlind, isAuthor, whisper, cm });

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
	this._lastMessageTime = Date.now();

	if (!isMessageVisible(cm)) return;
	wrapped.call(this, cm);
}

Hooks.once('init', () => {
	// BUG: This might not work on all systems, in case they extend ChatLog
	/* global libWrapper */
	libWrapper.register(CFG.id, 'ChatLog.prototype.notify', chatLogNotifyWrapper, 'MIXED');
});
