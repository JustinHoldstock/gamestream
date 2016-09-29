
var objectFactory = require('../misc/objectFactory.js');

var clone = objectFactory.clone;

var cloneClean = objectFactory.createFactory({
	clone: true,
	deep: true,
	narrow: false,
	copyUndefined: false
});

var applyClean = objectFactory.createFactory({
	clone: false,
	deep: true,
	narrow: false,
	copyUndefined: false
});

var cloneNarrowClean = objectFactory.createFactory({
	clone: true,
	deep: true,
	narrow: true,
	copyUndefined: false
});

function State(time, updateValues) {
	updateValues = objectFactory.clone(updateValues);
	this.time = time;
	this.update = updateValues;
	this.values = updateValues;
	this.reverseUpdate = {};
}

State.fromOutputState = function(outputState) {
	var state = new State(outputState.time, outputState.update);
	if (outputState.speed || outputState.speed === 0) {
		state.speed = outputState.speed;
	}
	return state;
};

State.setPreviousState = function(targetState, previousState) {
	targetState.previous = previousState;
	if (previousState) {
		previousState.next = targetState;
	}
	this._computeValues(targetState);
	this._computeReverseUpdate(targetState);

};

State._computeValues = function(targetState) {
	var values = (targetState.previous ? clone(targetState.previous.values) : null) || {};
	values = applyClean(values, [targetState.update]);
	targetState.values = values;
};

State._computeReverseUpdate = function(targetState) {
	var previousValues = (targetState.previous ? targetState.previous.values : null) || {};
	reverseUpdate = cloneNarrowClean(targetState.update, [previousValues]);
	targetState.reverseUpdate = reverseUpdate;
};

module.exports = State;
