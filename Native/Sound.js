Elm.Native.Sound = {};
Elm.Native.Sound.make = function(elm) {
	elm.Native = elm.Native || {};
	elm.Native.Sound = elm.Native.Sound || {};
	if (elm.Native.Sound.values) return elm.Native.Sound.values;

	var Utils = Elm.Native.Utils.make(elm);
	var Signal = Elm.Native.Signal.make(elm);
	var Maybe = Elm.Native.Maybe.make(elm);

	var Init = {ctor : "Init"};
	var TimeUpdate = {ctor : "TimeUpdate"};
	var Ended = {ctor : "Ended"};
	
	function AVProperties(currentTime, duration, ended, volume, src) {
		return { _ : {}, currentTime : currentTime, duration : duration, 
						 ended : ended, volume : volume, src : src };
	}

	function avsignal(eventHandler, avSrc, avHandler, events) {
		var audio = new Audio(avSrc);
		var timer = new Object();

		var signal = Signal.constant(Utils.Tuple2(Init, AVProperties(0,0,0,1.0,0)));
		var process = eventHandler({"audio" : audio, "timer" : timer});

		var time;

		function exposeProperty(e) {
			var p = AVProperties(audio.currentTime, audio.duration, audio.ended, audio.volume, audio.src);
			elm.notify(process.id, Utils.Tuple2(e, p));
			var event = avHandler(p);
			if (event.ctor == "Just")
				process(event._x);
		}

        timer.start = function() { time = setInterval(function(){ exposeProperty(TimeUpdate); }, 100); };
        timer.stop = function() { clearInterval(timer); };

        audio.addEventListener('ended', function() { exposeProperty(Ended); });

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
		o.audio.currentTime = t;
	}

	function setVol(o, v) {
		o.audio.volume = v;
	}

	function setSrc(o, path) {
		o.timer.stop();
		o.time = 0;
		o.audio = new Audio(path);
		play(o);
	}

	var vals = {
		sound : F4(avsignal),
		play : play,
		pause : pause,
		seek : F2(seek),
		volume : F2(setVol),
		source : F2(setSrc)
	};

	return elm.Native.Sound.values = vals;
};