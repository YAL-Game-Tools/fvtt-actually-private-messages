import { CFG } from './config.mjs';
import './settings.mjs';

/**
 * Test message visibility.
 *
 * @param {ChatMessage} cm
 */
const isMessageVisible = (cm) => {
	const cmData = game.release.generation >= 10 ? cm : cm.data,
		whisper = cmData.whisper ?? [],
		isWhisper = whisper.length > 0,
		isBlind = isWhisper && cmData.blind;

	console.log({ isBlind, isWhisper, isAuthor: cm.isAuthor, cm });

	// Blind rolls are not visible to author
	if (isBlind && cm.isAuthor) return false;
	// Whispers are only visible to recipients and author
	if (isWhisper) return cm.isAuthor || whisper.includes(game.user.id);
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

	// TODO: Change this to !important CSS rule
	const baseMsg = html.dataset.messageId ? html : html.closest('[data-message-id]');
	console.log(baseMsg);
	baseMsg.classList.toggle('actually-private-roll', !isMessageVisible(cm));
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
	// console.log('DEBUG | ACTUALLY PRIVATE ROLLS:', game.user);
	if (!isMessageVisible(cm)) return;
	wrapped.call(this, cm);
}

Hooks.once('init', () => {
	// BUG: This might not work on all systems, in case they extend ChatLog
	/* global libWrapper */
	libWrapper.register(CFG.id, 'ChatLog.prototype.notify', chatLogNotifyWrapper, 'MIXED');
});
