module Sound where

{-| The Sound module provides a bridge to HTML5 audio and some associated properties (it's a work in progress) |-}

import Native.Sound
import Signal
import Time (Time)

type alias Volume = Float
type alias Source = String

{-| A control manages manipulation of the HTML5 audio stream |-}
type Control = Play | Pause | Seek Time | VolumeUp | VolumeDown | AddTrack Source | Skip | Back | NoChange

{-| Properties allow the elm user to directly view HTML5 audio properties |-}
type alias Properties = { currentTime : Time, duration : Time, ended : Bool, volume : Volume, src : Source, filename : String}

{-| Events are the conditions upon which Properties are exposed |-}
type Event = Init | TimeUpdate | Ended

{-| The SoundConstructor alias allows us an easy way to construct Elm HTML5 streams |-}
type alias SoundConstructor = { source : Source, 
                                pHandler : (Properties -> Maybe Control), 
                                controls : Signal Control
                              }

{-| The eventHandler manages the bridging of controls to the Native backend |-}
eventHandler sound control = case control of
    Play -> Native.Sound.play sound
    Pause -> Native.Sound.pause sound
    Seek t -> Native.Sound.seek sound t
    VolumeUp -> Native.Sound.volUp sound
    VolumeDown -> Native.Sound.volDown sound
    AddTrack src -> Native.Sound.addTrack sound src
    Skip -> Native.Sound.nextTrack sound
    Back -> ()--Native.Sound.lastTrack sound
    NoChange -> ()

{-| Creates a sound stream that exposes its properties upon each of the Event types above |-}
sound : SoundConstructor -> Signal (Event, Properties)
sound s = 
    Native.Sound.sound 
        eventHandler
        s.source
        s.pHandler
        s.controls