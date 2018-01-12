var context = null;
var player = null;

class SamplePlayer {
    
    constructor(context, urls) {  
        this.context = context;
        this.urls = urls;
        this.buffer = [];
        this.filter = null;
        this.highShelf = null;
        this.lowShelf = null;
        this.highPass = null;
        this.lowPass = null;
        this.init_filter();
    }

    init_filter(){
        this.highShelf = context.createBiquadFilter();
        this.filter = this.highShelf;
        this.lowShelf = context.createBiquadFilter();
        this.highPass = context.createBiquadFilter();
        this.lowPass = context.createBiquadFilter();

        this.highShelf.connect(this.lowShelf);
        this.lowShelf.connect(this.highPass);
        this.highPass.connect(this.lowPass);
        this.lowPass.connect(this.context.destination);

        this.highShelf.type = "highshelf";
        this.highShelf.frequency.value = 4700;
        this.highShelf.gain.value = 50;

        this.lowShelf.type = "lowshelf";
        this.lowShelf.frequency.value = 35;
        this.lowShelf.gain.value = 50;

        this.highPass.type = "highpass";
        this.highPass.frequency.value = 800;
        this.highPass.Q.value = 0.7;

        this.lowPass.type = "lowpass";
        this.lowPass.frequency.value = 880;
        this.lowPass.Q.value = 0.7;
      }
      
      loadSound(url, index) {
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.responseType = 'arraybuffer';
        let thisBuffer = this;
        request.onload = function() {
          thisBuffer.context.decodeAudioData(request.response, function(buffer) {
            thisBuffer.buffer[index] = buffer;
            if(index == thisBuffer.urls.length-1) {
              thisBuffer.loaded();
            }       
          });
        };
        request.send();
      };
    
      loadAll() {
        this.urls.forEach((url, index) => {
          this.loadSound(url, index);
        })
      }
    
      loaded() {
        
      }
    
      getSoundByIndex(index) {
        return this.buffer[index];
      }

      play(index) {
        let source = context.createBufferSource();
        source.buffer = this.getSoundByIndex(index);

        source.connect(this.filter);
        source.start();
      }
    
}


function init(){
    context = new (window.AudioContext || window.webkitAudioContext)();

    var soundUrl = ['drums/drum_cymbal_closed.mp3',
                    'drums/drum_cymbal_open.mp3',
                    'drums/drum_snare_soft.mp3',
                    'drums/drum_bass_soft.mp3']; //lokal

    player = new SamplePlayer(context, soundUrl);
    player.loadAll();

    initDrums();
    initSequencer();
    initFilter();
}


function initDrums(){

    var button0 = new Nexus.Button('#button0');
    button0.mode = 'impulse';
    button0.on('change',function(v) {
        console.log(v);
        if (v){
            player.play(0);
      }
    })
  
    var button1 = new Nexus.Button('#button1');
    button1.mode = 'impulse';
    button1.on('change',function(v) {
        console.log(v);
        if (v){
            player.play(1);
      }
    })
  
    var button2 = new Nexus.Button('#button2');
    button2.mode = 'impulse';
    button2.on('change',function(v) {
        console.log(v);
        if (v){
            player.play(2);
      }
    })
  
    var button3 = new Nexus.Button('#button3');
    button3.mode = 'impulse';
    button3.on('change',function(v) {
        console.log(v);
        if (v){
            player.play(3);
        }
    })
}

function initSequencer(){
    var textbutton = new Nexus.TextButton('#play',{
        'text':'play',
        'alternate': 'pause',
        'mode': 'toggle'
    })

    textbutton.on('change',function(v) {
        console.log(v);
        if(v){
            sequencer.start();
        } else {
            sequencer.stop();
        }
    })

    var sequencer = new Nexus.Sequencer('#sequencer',{
        'mode': 'toggle',
        'rows': 4,
        'columns': 8
    });
    sequencer.matrix.set.all([
            [0,0,0,1,0,0,0,0],
            [0,1,0,0,0,0,0,0],
            [0,0,0,1,0,1,0,0],
            [1,0,1,0,1,0,1,0]
        ]);
    sequencer.interval.ms(60/79*1000);
  
    sequencer.on('step',function(v) {
        console.log(v);
        for(var i=0;i<4;i++){
            if(v[i]==1){
                player.play(i);
            }
        }
    });

    var slider = new Nexus.Slider('#slider',{
    'size': [120,20],
    'min': 80,
    'max': 160,
    'step': 0,
    'value': 100
    });

    slider.on('change',function(v) {
        console.log(v);
        sequencer.interval.ms(60/v*1000);
    })
}

function initFilter(){
    var slider_hf_khz = new Nexus.Slider('#slider_hf_khz',{
        'min': 4.7,
        'max': 22,
        'step': 0,
        'value': 4.7
    });
        
    slider_hf_khz.on('change',function(v) {
        console.log(v);
        player.highShelf.frequency.value = v * 1000;
    })
        
    var slider_hf_db = new Nexus.Slider('#slider_hf_db',{
        'min': -50,
        'max': 50,
        'step': 0,
        'value': 50
    });
        
    slider_hf_db.on('change',function(v) {
        console.log(v);
        player.highShelf.gain.value = v;
    })
        
    var slider_lf_khz = new Nexus.Slider('#slider_lf_khz',{
        'min': 35,
        'max': 220,
        'step': 0,
        'value': 50
    });
        
    slider_lf_khz.on('change',function(v) {
        console.log(v);
        player.lowShelf.frequency.value = v;
    })
        
    var slider_lf_db = new Nexus.Slider('#slider_lf_db',{
        'min': -50,
        'max': 50,
        'step': 0,
        'value': 50
    });
        
    slider_lf_db.on('change',function(v) {
        console.log(v);
        player.lowShelf.gain.value = v;
    })
        
    var slider_hp_khz = new Nexus.Slider('#slider_hp_khz',{
        'min': 0.8,
        'max': 5.9,
        'step': 0,
        'value': 0.8
    });
        
    slider_hp_khz.on('change',function(v) {
        console.log(v);
        player.highPass.frequency.value = v * 1000;
    })
        
    var slider_hp_q = new Nexus.Slider('#slider_hp_q',{
        'min': 0.7,
        'max': 12,
        'step': 0,
        'value': 0.7
    });
        
    slider_hp_q.on('change',function(v) {
        console.log(v);
        player.highPass.Q.value = v;
    })
        
    var slider_lp_khz = new Nexus.Slider('#slider_lp_khz',{
        'min': 80,
        'max': 1600,
        'step': 0,
        'value': 800
    });
        
    slider_lp_khz.on('change',function(v) {
        console.log(v);
        player.lowPass.frequency.value = v;
    })
        
    var slider_lp_q = new Nexus.Slider('#slider_lp_q',{
        'min': 0.7,
        'max': 12,
        'step': 0,
        'value': 0.7
    });
        
    slider_lp_q.on('change',function(v) {
        console.log(v);
        player.lowPass.Q.value = v;
    })
}