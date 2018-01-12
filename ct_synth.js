var context = null;

var gain = null;
var envelopeGain = null;
var select = null;
var osc = null;

var envelope = null;
var attackDial = null;
var releaseDial = null;
var attackDial = null;
var sustainDial = null;

function init(){
    
    context = new (window.AudioContext || window.webkitAudioContext)();
    Nexus.context = context;
      
    gain = context.createGain();
    envelopeGain = context.createGain();
    envelopeGain.connect(gain);
    envelopeGain.gain.value = 0;
    gain.connect(context.destination);
    gain.gain.value=0.2;

    initPiano();

    var oscilloscope = new Nexus.Oscilloscope('#oscilloscope');
    oscilloscope.connect(gain);

    initEnvelope();

    initOscAndGain();
      
    }

function initPiano(){
    var piano = new Nexus.Piano('#piano',{
        'lowNote': 50,
        'highNote': 94
    })

    piano.on('change',function(v) {
        console.log(v);
        if (v.state) {
            startTone(v.note);
        } else {
            stopTone();
        }
    })
}

function initEnvelope(){
    envelope = new Nexus.Envelope('#envelope',{
        'points': [{ x: 0.0, y: 0.0 },
                   { x: 0.35, y: 1 },
                   { x: 0.65, y: 0.2 },
                   { x: 0.8, y: 0.2},
                   { x: 1.0,  y: 0.0 }]
    });
    
    attackDial = new Nexus.Dial('#attack', {'value':0.1, 'min':0, 'max':2});
    var attackNumber = new Nexus.Number('#attack_number');
    attackNumber.link(attackDial);
    attackDial.on('change',function(v) {
      setEnvelope();
    })
    decayDial = new Nexus.Dial('#decay');
    decayDial.value = 0.3;
    var decayNumber = new Nexus.Number('#decay_number');
    decayNumber.link(decayDial);
    decayDial.on('change',function(v) {
      setEnvelope();
    })
    sustainDial = new Nexus.Dial('#sustain');
    sustainDial.value = 0.5;
    var sustainNumber = new Nexus.Number('#sustain_number');
    sustainNumber.link(sustainDial);
    sustainDial.on('change',function(v) {
      setEnvelope();
    })
    releaseDial = new Nexus.Dial('#release');
    releaseDial.value = 1;
    var releaseNumber = new Nexus.Number('#release_number');
    releaseNumber.link(releaseDial);
    releaseDial.on('change',function(v) {
      setEnvelope();
    })
    setEnvelope();
}

function initOscAndGain(){
    select = new Nexus.Select('#select',{
        'options':['sine', 'square', 'triangle','sawtooth']
    })

    var gainDial = new Nexus.Dial('#dial');
    gainDial.value = gain.gain.value;
    var gainNumber = new Nexus.Number('#number');

    gainNumber.link(gainDial);
    gainDial.on('change',function(v) {
      console.log(v);
      gain.gain.value = v;
    })
}

function setEnvelope(){
    var duration = attackDial.value + decayDial.value + 0.5 + releaseDial.value;
    envelope.movePoint(1,attackDial.value/duration);
    envelope.movePoint(2,(attackDial.value+decayDial.value)/duration,sustainDial.value);
    envelope.movePoint(3,(attackDial.value+decayDial.value+0.5)/duration,sustainDial.value);
}

function startTone(note){
    osc = context.createOscillator();
    osc.connect(envelopeGain);
    osc.frequency.value = Nexus.mtof(note);
    osc.type = select.value;
    osc.start();

    var now = context.currentTime;
    var attack = attackDial.value;
    var decay = decayDial.value;
    var sustain = sustainDial.value;
    envelopeGain.gain.cancelScheduledValues(0);
    envelopeGain.gain.setValueAtTime(0, now);
    envelopeGain.gain.linearRampToValueAtTime(1, now + attack);
    envelopeGain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
}

function stopTone(){
    var now = context.currentTime;
    var release = releaseDial.value;
    envelopeGain.gain.cancelScheduledValues(0);
    envelopeGain.gain.setValueAtTime(envelopeGain.gain.value, now);
    envelopeGain.gain.linearRampToValueAtTime(0, now + release);
    osc.stop(now + release);
}