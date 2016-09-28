
function PlaybackLogger(playbackPoint) {
	this._points = [];
	this.logPoint(playbackPoint);
	this.setCurrentPoint(playbackPoint);
}

PlaybackLogger.prototype.logPoint = function(playbackPoint) {
	this._points.push(playbackPoint);
};

PlaybackLogger.prototype.setCurrentPoint = function(playbackPoint) {
	this.current = playbackPoint;
};

PlaybackLogger.prototype.getPlaybackHistory = function(realTime) {
	var results = [];
	var previous;
	var points = [].concat(this._points);
	if (this.current) {
		points.push(this.current);
	}
	points.forEach(function(next) {
		if (previous) {
			if (previous.speed === 0 && previous.play === realTime) {
				results.push({
					time: previous.play,
					speed: previous.speed
				});
			} else if (
				(previous.speed > 0 && realTime >= previous.play && realTime < next.play) ||
				(previous.speed < 0 && realTime <= previous.play && realTime > next.play)
			) {
				var time = previous.play + ((realTime - previous.real) * previous.speed);
				results.push({
					time: time,
					speed: previous.speed
				});
			}
		}
		previous = next;
	});
	return results;
};

module.exports = PlaybackLogger;
