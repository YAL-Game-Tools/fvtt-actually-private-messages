const CFG = {
	module: 'actually-private-rolls'
};

/**
 * Test message visibility.
 *
 * @param {ChatMessage} cm
 */
function isMessageVisible(cm) {
	const whisper = cm.data.whisper || [],
		isWhisper = whisper.length > 0,
		isBlind = isWhisper && cm.data.blind;
	return isWhisper ? whisper.includes(game.user.id) || cm.isAuthor && !isBlind : true;
}

/**
 * Hide private messages entirely.
 *
 * @param {ChatMessage} cm
 * @param {JQuery} jq
 */
function renderChatMessageEvent(cm, jq) {
	if (game.user.isGM) return;
	const html = jq[0];
	if (isMessageVisible(cm)) html.style.removeProperty('display');
	else html.style.display = 'none';
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
	wrapped(cm);
}

Hooks.once('init', () => {
	// BUG: This might not work on all systems, in case they extend ChatLog
	/* global libWrapper */
	libWrapper.register(CFG.module, 'ChatLog.prototype.notify', chatLogNotifyWrapper, 'MIXED');
});
