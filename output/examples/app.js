(function() {
	var tracks, model, view;

	// Expose to present and hack
	window.model = model = {
		tracks: {},
		volume: 100,
		playing: false,
		currentTime: 0,
		currentTrack: null
	};

	// Fill the model with the audio elements
	tracks = {
		"0.mp3": "James Brown - I feel good",
		"1.mp3": "Tammi Terrell, Marvin Gaye - Ain't no mountain high enough",
		"revo.m4a": "The Beatles - Revolution"
	};
	Object.keys( tracks ).forEach(function( key ) {
		var audio = document.createElement( "audio" );
		audio.src = key;
		document.body.appendChild( audio );
		model.tracks[ tracks[ key ] ] = audio;
		audio.addEventListener( "timeupdate", function() {
			model.currentTime = parseInt( this.currentTime );
		});
	});

	Object.observe( model, function( changes ) {
		changes.forEach(function( change ) {
			var name = change.name,
				newValue = model[ name ],
				oldValue = change.oldValue;

			if ( name === "currentTime" && newValue !== oldValue ) {
				view.current.text.innerText = newValue;
				view.current.input.value = newValue;
			}

			if ( name === "playing" ) {
				model.currentTrack[ newValue ? 'play' : 'pause' ]();
			}

			if ( name === "volume" ) {
				model.currentTrack.volume = ( newValue / 100 );
			}

			if ( name === "currentTrack" ) {
				if ( oldValue ) {
					oldValue.pause();
				}
				newValue.currentTime = 0;
				view.current.input.max = newValue.duration;
				view.current.input.value = 0;
				view.current.max.innerText = parseInt( newValue.duration, 10 ) + 1;

				if ( model.playing ) {
					newValue.play();
				}
			}
		});
	});

	view = {
		volume: document.querySelector( "#volume" ),
		now: document.querySelector( "#now_playing" ),
		current: {
			input: document.querySelector( "#current" ),
			text: document.querySelector( "#current_view" ),
			max: document.querySelector( "#max_time" )
		},
		trackList: document.querySelector( "#track_list" ),
		play: document.querySelector( "#play" )
	};

	view.volume.addEventListener( "change", function() {
		model.volume = this.value;
	});

	// DOM Event Listeners
	view.play.addEventListener( "change", function( ev ) {
		ev.preventDefault();
		model.playing = !!this.checked;
	});

	view.trackList.addEventListener( "change", function() {
		model.currentTrack = model.tracks[ this.value ];
	});

	// init method
	Object.keys( model.tracks ).forEach(function( trackName ) {
		var el = document.createElement( "option" );

		el.value = trackName;
		el.innerText = trackName;

		view.trackList.appendChild( el );
	});

})();
