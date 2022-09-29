const CFG = {
	module: 'actually-private-rolls'
};

const gen10 = () => game.release.generation >= 10;
const getDocData = (doc) => gen10() ? doc : doc.data;

/**
 * Test message visibility.
 *
 * @param {ChatMessage} cm
 */
function isMessageVisible(cm) {
	const cmData = getDocData(cm);
	const whisper = cmData.whisper || [],
		isWhisper = whisper.length > 0,
		isBlind = isWhisper && cmData.blind;
	// console.log('DEBUG | ACTUALLY PRIVATE ROLLS:', game.user);
	return isWhisper ? whisper.includes(game.user.id) || cm.isAuthor && !isBlind : true;
}

/**
 * Hide private messages entirely.
 *
 * @param {ChatMessage} cm
 * @param {JQuery} html
 */
function renderChatMessageEvent(cm, [html]) {
	// console.log('DEBUG | ACTUALLY PRIVATE ROLLS:', game.user);

	if (game.user.isGM) return;

	// TODO: Change this to !important CSS rule
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
	// console.log('DEBUG | ACTUALLY PRIVATE ROLLS:', game.user);
	if (!isMessageVisible(cm)) return;
	wrapped(cm);
}

Hooks.once('init', () => {
	// BUG: This might not work on all systems, in case they extend ChatLog
	/* global libWrapper */
	libWrapper.register(CFG.module, 'ChatLog.prototype.notify', chatLogNotifyWrapper, 'MIXED');
});
