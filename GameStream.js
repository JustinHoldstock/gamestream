
var Stream = require('stream');
var inherits = require('inherits');
var now = require('./now.js');
var GameState = require('./GameState.js');
var GameStatesBag = require('./GameStatesBag.js');
var addPipeBagTo = require('./addPipeBagTo.js');
var Playback = require('./Playback.js');
var TimedUpdate = require('./TimedUpdate.js');
var cloneUtil = require('./cloneUtil.js');

function GameStream(opts) {
	if (!(this instanceof GameStream)) return new GameStream(opts);
	opts = opts || {};

	this.push = opts.push !== undefined ? opts.push : true;
	this.pushInterval = opts.pushInterval || 0;
	this.lag = opts.lag || 0;
	this.fullUpdates = !!opts.fullUpdates;

	this._states = new GameStatesBag();
	this._playback = new Playback(this._states);
	this._playback.setTime(now() - this.lag);
	Playback.exposeInterface(this, this._playback);

	addPipeBagTo(this);

	Stream.call(this, { objectMode: true });
}

inherits(GameStream, Stream);

Object.defineProperty(GameStream.prototype, 'pushInterval', {
	get: function() { return this._pushInterval; },
	set: function(val) {
		val = val > 0 ? val : 0;
		if (val !== this._pushInterval) {
			this._pushInterval = val;
			this._updatePushing();
		}
	}
});

Object.defineProperty(GameStream.prototype, 'push', {
	get: function() { return this._push; },
	set: function(val) {
		val = !!val;
		if (val !== this._push) {
			this._push = val;
			this._updatePushing();
		}
	}
});

Object.defineProperty(GameStream.prototype, 'state', {
	get: function() { return this.getState(); },
	set: function(stateValues) { this.setStateAt(this.getTime(), stateValues); }
});

GameStream.prototype.write = function(gameStates) {
	gameStates.forEach(function(gameState) {
		this.updateAt(gameState.time, gameState.update);
	}.bind(this));
	return true;
};

GameStream.prototype.updateAt = function(time, update) {
	update = cloneUtil.clone(update);
	var state = new GameState(time, update);
	this._states.insertLate(state);
};

GameStream.prototype.updateNow = function(update) {
	update = cloneUtil.clone(update);
	var time = now();
	this.updateAt(time, update);
};

GameStream.prototype.setStateAt = function(time, values) {
	throw new Error('TODO: implement me');
	//var state = new GameState(time, values);
};

GameStream.prototype.getState = function() {
	var gameState = this._playback.getState();
	return gameState ? gameState.values : undefined;
};

GameStream.prototype._updatePushing = function() {
	if (this._pushIntervalID) {
		clearInterval(this._pushIntervalID);
		delete this._pushIntervalID;
	}
	if (this._push) {
		this._pushIntervalID = setInterval(
			this._pushUpdates.bind(this),
			this._pushInterval
		);
	}
};

GameStream.prototype._pushUpdates = function() {
	this._playback.bufferUpdates();
	var updates = this._playback.flushUpdates();
	this._emitGameUpdates(updates);
};

GameStream.prototype._emitGameUpdates = function(gameUpdates) {
	if (gameUpdates.length) {
		if (this.fullUpdates) {
			this.emit('update', gameUpdates);
		} else {
			var squashed = TimedUpdate.squash(gameUpdates);
			this.emit('update', squashed.update);
		}
		this.eachPipe(function(writable) {
			writable.write(gameUpdates);
		});
	}
};

module.exports = GameStream;
