define(["collection/instrument","collection/track","models/sound-map","template/precompiled.handlebars"],function(InstrumentCollection,TrackCollection,SoundMap,Templates){
    return new (Backbone.View.extend({

        el: $(".content"),
        events: {
            "click .instruments.scroll li" : "chooseInstrument",
            "click .work-menu button" : "chooseSound",
            "click .instruments-buttons button.create" : "createTrack",
            "click .work-tabs .track.active .sector li": "addSoundToTrack",
            "contextmenu .work-tabs .track .sector li": "deleteSoundInTrack",
            "change .work-menu .bpm": "bpmChange"
            //"keydown": "play"
        },
        initialize : function(options) {
            _.bindAll(this, "play");
            $(document).bind('keydown', this.play); // todo Hack space key to play music
            this.soundMap = new SoundMap();
            this.instrumentCollection = new InstrumentCollection();
            this.instrumentCollection.add({
                name: "agogo",
                sound_list: {
                    hi: {
                        name: "hi",
                        sound: "agogo-hi",
                        active: true
                    },
                    lo: {
                        name: "lo",
                        sound:"agogo-lo",
                        active: false
                    }
                },
                active: true
            });
            this.instrumentCollection.add({
                name: "djembe",
                sound_list: {
                    hi: {
                        name: "hi",
                        sound: "djembe-hi",
                        active:true
                    },
                    mid: {
                        name: "mid",
                        sound: "djembe-mid",
                        active: false
                    },
                    lo: {
                        name: "lo",
                        sound: "djembe-lo",
                        active: false
                    }
                }
            });
            this.instrumentCollection.add({
                name: "metronome",
                sound_list: {
                    hi: {
                        name: "hi",
                        sound: "metronome",
                        active: true
                    }
                }
            });
            this.trackCollection = new TrackCollection();
            var wave = [];

            // for (var i = 0; i < 100; i++){
            //     if (i % 3 == 0){
            //         wave.push({
            //             val: "hi",
            //             sound: "agogo-hi"
            //         });
            //     } else {
            //         wave.push({
            //             val: "empty",
            //             sound: false
            //         });
            //     }
            // }


            // this.trackCollection.add({
            //     instrument: this.instrumentCollection.where({name:"agogo"})[0],
            //     sector_list: [
            //         {
            //             wave: wave
            //         }
            //     ]
            // });
            var wave = [];
            for (var i = 0; i < 100; i++){
                if (i % 25 == 0){
                    wave.push({
                        val: "hi",
                        sound: "metronome"
                    });
                } else {
                    wave.push({
                        val: "empty",
                        sound: false
                    });
                }
            }
            this.trackCollection.add({
                instrument: this.instrumentCollection.where({name:"metronome"})[0],
                sector_list: [
                    {
                        wave: wave
                    }
                ]
            });

            var wave = [];
            // for (var i = 0; i < 100; i++){
            //     if (i % 3 == 1){
            //         wave.push({
            //             val: "hi",
            //             sound: "djembe-hi"
            //         });
            //     } else {
            //         wave.push({
            //             val: "empty",
            //             sound: false
            //         });
            //     }
            // }
            // this.trackCollection.add({
            //     instrument: this.instrumentCollection.where({name:"djembe"})[0],
            //     sector_list: [
            //         {
            //             wave: wave
            //         }
            //     ]
            // });
        },
        render: function(){
            $(".left-col").html(Templates["views/handlebars/instrument_list.handlebars"]({
                instrumental_list: this.instrumentCollection.toJSON()
            }));
            $(".work-menu").html(Templates["views/handlebars/sound_list.handlebars"]({
                instrument: this.instrumentCollection.where({active:true})[0].toJSON(),
                bpm: this.trackCollection.bpm
            }));
            $(".work-tabs-wrapper").html(Templates["views/handlebars/work_tabs_list.handlebars"]({
                track_list: this.trackCollection.toJSON()
            }));
        },

        chooseInstrument: function(el){
            this.instrumentCollection.where({active:true})[0].set({active:false});
            this.instrumentCollection.where({name:$(el.currentTarget).data("name")})[0].set({active:true});
            this.render();
        },

        chooseSound: function(el){
            var sound = _.where(this.instrumentCollection.where({active:true})[0].get("sound_list"),{active:true})[0];
            sound.active = false;
            this.instrumentCollection.where({active:true})[0].get("sound_list")[$(el.currentTarget).data("sound")].active = true;
            this.render();
        },

        createTrack: function(el){
            var wave = [];
            for (var i = 0; i < 100; i++){
                wave.push({
                    val: "empty",
                    sound: false
                });
            }
            this.trackCollection.add({
                instrument: this.instrumentCollection.where({active:true})[0],
                sector_list: [
                    {
                        wave: wave
                    }
                ]
            });
            this.render();
        },

        addSoundToTrack: function(el){
            var $i = $(el.currentTarget).find("i");
            var trackNum = $(el.currentTarget).parents(".track").data("tracknum");
            var instrument = this.instrumentCollection.where({active:true})[0];
            var sound = _.where(instrument.get("sound_list"),{active:true})[0];
            var trackItem = this.trackCollection.models[trackNum].get("sector_list")[0].wave[$i.data("num")-1];
            trackItem.val = sound.name;
            trackItem.sound = instrument.get("sound_list")[sound.name].sound;
            this.render();
        },

        deleteSoundInTrack: function(el){
            el.preventDefault();
            var $i = $(el.currentTarget).find("i");
            var trackNum = $(el.currentTarget).parents(".track").data("tracknum");
            var trackItem = this.trackCollection.models[trackNum].get("sector_list")[0].wave[$i.data("num")-1];
            trackItem.val = "empty";
            trackItem.sound = false;
            this.render();
        },

        bpmChange: function(el){
            this.trackCollection.bpm = $(el.currentTarget).val()
        },

        play: function(el){
            var code = el.keyCode || el.which;
            if(code == 32){
                el.preventDefault();
                var flag = false;
                var linePosition = 0;
                var tickTime = 10;
                var $play = $(".play");
                var bpm = this.trackCollection.bpm;
                var sound_element = {};
                var soundMap = this.soundMap;

                _.each(this.trackCollection.models,function(val,key){
                    var wave = val.get("sector_list")[0].wave;
                    _.each(wave,function(v,k){
                        if(v.sound){
                            if (!sound_element[k]){
                                sound_element[k] = []
                            }
                            sound_element[k].push(soundMap.get(v.sound))
                        }
                    })
                });
                flag = true;
                var speed = (((800/4 * (bpm / 60))/1000)*tickTime);
                var start = Date.now();
                var time = 0;
                var exit = 0;
                var num = 0;
                var diff = 0;
                var instance = function () {
                    linePosition = ( linePosition + speed ) % 800;
                    $play.css({"left": linePosition + 92});
                    exit = ~~(linePosition/8);
                    for (num = ~~((linePosition - speed)/8); num < exit; num +=1) {
                        _.each(sound_element[num], function (v, k) {
                            v.play();
                        })
                    }
                    time += tickTime;
                    diff = (Date.now() - start) - time;
                    if (flag) {
                        setTimeout(instance, (tickTime - diff));
                    }
                };
                setTimeout(instance, tickTime);
            }
        }
    }))();
});