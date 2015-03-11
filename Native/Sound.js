Elm.Native.Sound = {};
Elm.Native.Sound.make = function(elm) {
	elm.Native = elm.Native || {};
	elm.Native.Sound = elm.Native.Sound || {};
	if (elm.Native.Sound.values) return elm.Native.Sound.values;

	var Utils = Elm.Native.Utils.make(elm);
	var Signal = Elm.Native.Signal.make(elm);

	var Init = {ctor : "Init"};
	var TimeUpdate = {ctor : "TimeUpdate"};
	var Ended = {ctor : "Ended"};

	function AVProperties(currentTime, duration, ended, volume, src, filename) {
		return { _ : {}, currentTime : currentTime, duration : duration, 
						 ended : ended, volume : volume, src : src, filename : filename};
	}

	function avsignal(eventHandler, avSrc, avHandler, events) {
		var audio = new Audio(avSrc);
		var timer = new Object();

		var index = 0;
		var playlist = new Object();
		var tracklist = [audio.src];

		audio.volume = 1.0;

		var signal = Signal.constant(Utils.Tuple2(Init, AVProperties(0,0,0,0,"","")));
		var process = eventHandler({"audio": audio, "timer": timer, "playlist": playlist});

		var time;

		var filename = audio.src.split('/').pop();

		function exposeProperties(e) {
			// if we're at the end of the file, jump to the next track
			if (audio.currentTime >= audio.duration) {
				if (index + 1 < tracklist.length) {
					index = index + 1;
					audio.src = tracklist[index];
					time = 0;
					timer = new Object();
					filename = audio.src.split('/').pop();
				}
			}
			var p = AVProperties(audio.currentTime, audio.duration, audio.ended, audio.volume, audio.src, filename);
			elm.notify(signal.id, Utils.Tuple2(e, p));
			var event = avHandler(p);
			if (event.ctor == "Just")
				process(event._x);
		}

        timer.start = function() { time = setInterval(function(){ exposeProperties(TimeUpdate); }, 100); };
        timer.stop = function() { clearInterval(time); };

        playlist.add = function(str) { tracklist.push(str); };
        

        audio.addEventListener('ended', function() { exposeProperties(Ended); });

        Signal.map(process)(events);
        return signal;
	}

	function play(o) {
		o.audio.play();
		o.timer.start();
	}

	function pause(o) {
		o.audio.pause();
		o.timer.stop();
	}

	function seek(o, t) {
		o.audio.currentTime = o.audio.currentTime + t;
	}

	function setVol(o, v) {
		o.audio.volume = o.audio.volume + v;
	}

	function volUp(o) {
		if (o.audio.volume < 1.0)
			o.audio.volume = o.audio.volume + 0.1;
	}

	function volDown(o) {
		if (o.audio.volume > 0.0)
			o.audio.volume = o.audio.volume - 0.1;
	}

	// deprecated
	/*function setSrc(o, path) {
		o.timer.stop();
		o.time = 0;
		o.audio = new Audio(path);
		play(o);
	}*/

	function addToPlaylist(o, path) {
		o.playlist.add(path);
	}

	function nextTrack(o) {
		o.audio.currentTime = o.audio.duration;
	}

	function lastTrack(o) {
		//o.playlist.back();
	}

	var vals = {
		sound : F4(avsignal),
		play : play,
		pause : pause,
		seek : F2(seek),
		volume : F2(setVol),
		volUp : volUp,
		volDown : volDown,
		addTrack : F2(addToPlaylist),
		nextTrack : nextTrack,
	};

	return elm.Native.Sound.values = vals;
};