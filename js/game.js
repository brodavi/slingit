var WIDTH = 640;
var HEIGHT = 480;

A = {};

soundManager.url = "swf/";

// the music
soundManager.onready(function() {

    // create "track1"...
    A.track1 = soundManager.createSound({
        id: 'track1',
        url: 'audio/track1.mp3'
    });

    // create "explode"...
    A.explode = soundManager.createSound({
        autoLoad: true,
        id: 'explode',
        url: 'audio/explode.mp3'
    });

    // create "hit"...
    A.hit = soundManager.createSound({
        autoLoad: true,
        id: 'hit',
        url: 'audio/hit.mp3'
    });

    // ...play music track
    A.track1.play({volume: 20});

    // disable scrolling
    document.onkeydown=function(){return event.keyCode!=38 && event.keyCode!=40 && event.keyCode!=32};

    Crafty.init(WIDTH, HEIGHT);
    Crafty.canvas.init();
    Crafty.scene("level1Scene");

});
