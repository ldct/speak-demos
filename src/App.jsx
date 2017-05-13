import React, { Component } from 'react';

import rec from './rec.png';
import recActive from './rec-active.png';
import play from './play.png';

import lundi from './1-lundi.mp3';
import mardi from './2-mardi.mp3';
import mercredi from './3-mercredi.mp3';
import jeudi from './4-jeudi.mp3';
import vendredi from './5-vendredi.mp3';
import samedi from './6-samedi.mp3';
import dimanche from './7-dimanche.mp3';

import save from './save.svg';
import mic128 from './mic128.png';

import ReactOutsideEvent from 'react-outside-event';

import './App.css';

import recorderWorker from './recorderWorker.js';

const parseWav = function(wav) {
  var readInt = function(i, bytes) {
    var ret = 0,
      shft = 0;

    while (bytes) {
      ret += wav[i] << shft;
      shft += 8;
      i++;
      bytes--;
    }
    return ret;
  };
  if (readInt(20, 2) !== 1) throw new Error('Invalid compression code, not PCM');
  if (readInt(22, 2) !== 1) throw new Error('Invalid number of channels, not 1');
  return {
    sampleRate: readInt(24, 4),
    bitsPerSample: readInt(34, 2),
    samples: wav.subarray(44)
  };
};

const Uint8ArrayToFloat32Array = function (u8a){
  var f32Buffer = new Float32Array(u8a.length);
  for (var i = 0; i < u8a.length; i++) {
    var value = u8a[i<<1] + (u8a[(i<<1)+1]<<8);
    if (value >= 0x8000) value |= ~0x7FFF;
    f32Buffer[i] = value / 0x8000;
  }
  return f32Buffer;
}


class _VocabEntry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      correct: false,
      lastWord: '',
    }

    this.recognition = new window.webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR';

    this.recognition.onresult = this.onRecognitionResult.bind(this);
    this.recognition.onend = this.onRecognitionEnd.bind(this);
  }

  onOutsideEvent() {
    this.recognition.stop();
  }

  onRecognitionEnd() {
    this.setState({
      active: false,
    });
  }

  onRecognitionResult (event) {

    const last_transcript = event.results[event.results.length - 1][0].transcript;
    var last_word = last_transcript.split(' ');
    last_word = last_word[last_word.length - 1];

    this.setState({
      lastWord: last_word,
    });

  }

  handleClickPlay() {
    this.audio.play();
  }
  handleClickRec(e) {

    e.stopPropagation();

    if (!this.state.active) {
      this.setState({
        active: true,
      });
      this.recognition.start();

    }
  }
  renderIcon() {
    if (this.state.lastWord === this.props.word) {
      return <span style={{color: 'green'}}>✔</span>
    } else {
      return <img alt="rec" src={this.state.active ? recActive : rec} style={{height: '1.1em'}} />
    }
  }
  render() {
    return <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        marginTop: 8, marginBottom: 8,
      }}>
      <audio ref={(a) => this.audio = a} src={this.props.audioSrc}></audio>
      <img alt="play" id="1-audio-button" src={play} width={33} height={30} style={{
        paddingLeft: 10,
        paddingRight: 10}}
        onClick={this.handleClickPlay.bind(this)}
      />
      <div style={{width: '5em'}}>
      {this.props.word}
      </div>
      <div id="1-rec" style={{
        backgroundColor: 'white',
        height: '1.5em',
        display: 'flex',
        alignItems: 'center',
        width: '10em'
      }}
      onClick={this.handleClickRec.bind(this)}
      >
      {this.renderIcon()}
      <span style={{color: 'grey'}}></span>
      <span>{this.state.lastWord}</span>
      </div>
      </div>
  }
}

const VocabEntry = ReactOutsideEvent(_VocabEntry, ['click']);

class VocabEntryList extends Component {
  render() {
    return <div style={{
      backgroundColor: '#DCDBFF',
      marginTop: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    }}>
    {this.props.entries.map((entry, i) => {
      return <VocabEntry word={entry.word} audioSrc={entry.audioSrc} key={i} />
    })}
    <div>Add more</div>
    </div>
  }
}

class App extends Component {
  render() {
    return (
      <div style={{
        marginLeft: 30,
        marginRight: 30,
        marginTop: 70}}
      >

      <div>
      Écoutez la prononciation du mot ci-dessous en cliquant sur l’icône audio. Lorsque vous êtes prêt, cliquez sur le bouton d’enregistrement. Si le mot est bien prononcé, il s’affichera en vert.

      <VocabEntryList entries={[
        {word: "lundi", audioSrc: lundi},
        {word: "mardi", audioSrc: mardi},
        {word: "mercredi", audioSrc: mercredi},
        {word: "jeudi", audioSrc: jeudi},
        {word: "vendredi", audioSrc: vendredi},
        {word: "samedi", audioSrc: samedi},
        {word: "dimanche", audioSrc: dimanche},
      ]} />

      </div>
      </div>
    );
  }
}

// Build a worker from an anonymous function body
var workerBlobURL = URL.createObjectURL( new Blob([ '(', recorderWorker.toString(), ')()' ], { type: 'application/javascript' } ) );

var Recorder = function(source, cfg){
  var config = cfg || {};
  var bufferLen = config.bufferLen || 4096;
  this.context = source.context;
  if(!this.context.createScriptProcessor){
     this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
  } else {
     this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
  }

  var worker = new Worker( workerBlobURL );
  URL.revokeObjectURL( workerBlobURL );

  worker.postMessage({
    command: 'init',
    config: {
      sampleRate: this.context.sampleRate
    }
  });


  var recording = false,
    currCallback;

  this.node.onaudioprocess = function(e){
    if (!recording) return;
    worker.postMessage({
      command: 'record',
      buffer: [
        e.inputBuffer.getChannelData(0),
        // e.inputBuffer.getChannelData(1)
      ]
    });
  }

  this.configure = function(cfg){
    for (var prop in cfg){
      if (cfg.hasOwnProperty(prop)){
        config[prop] = cfg[prop];
      }
    }
  }

  this.record = function(){
    recording = true;
  }

  this.stop = function(){
    recording = false;
  }

  this.clear = function(){
    worker.postMessage({ command: 'clear' });
  }

  this.getBuffers = function(cb) {
    currCallback = cb || config.callback;
    worker.postMessage({ command: 'getBuffers' })
  }

  this.exportWAV = function(cb, type){
    currCallback = cb || config.callback;
    type = type || config.type || 'audio/wav';
    if (!currCallback) throw new Error('Callback not set');
    worker.postMessage({
      command: 'exportWAV',
      type: type
    });
  }

  worker.onmessage = function(e) {
    var blob = e.data;
    currCallback(blob);
  }


  source.connect(this.node);
  this.node.connect(this.context.destination);   // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
};

window.Recorder = Recorder;



class App2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
    }
  }
  gotStream(stream) {
        this.inputPoint = this.audioContext.createGain();

        // Create an AudioNode from the stream.
        this.realAudioInput = this.audioContext.createMediaStreamSource(stream);
        this.audioInput = this.realAudioInput;
        this.audioInput.connect(this.inputPoint);

        // audioInput = convertToMono( input );

        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.inputPoint.connect( this.analyserNode );

        this.audioRecorder = new window.Recorder( this.inputPoint );

        this.zeroGain = this.audioContext.createGain();
        this.zeroGain.gain.value = 0.0;
        this.inputPoint.connect( this.zeroGain );
        this.zeroGain.connect( this.audioContext.destination );

        this.updateAnalysers();
  }

  doneEncoding(blob) {

    console.log(blob);

    var arrayBuffer;
    var fileReader = new FileReader();

    var self = this;

    fileReader.onload = function() {
      arrayBuffer = this.result;
      var buffer = new Uint8Array(arrayBuffer),
      data = parseWav(buffer);

      console.log(data);
      console.log("Converting to Mp3");

      var mp3codec = window.Lame.init();

      window.Lame.set_mode(mp3codec, 3);
      window.Lame.set_num_channels(mp3codec, 1);
      window.Lame.set_num_samples(mp3codec, -1);
      window.Lame.set_in_samplerate(mp3codec, data.sampleRate);
      window.Lame.set_out_samplerate(mp3codec, data.sampleRate);
      window.Lame.set_bitrate(mp3codec, data.bitsPerSample);

      window.Lame.init_params(mp3codec);
      console.log('Version :', window.Lame.get_version() + ' / ',
        'Mode: '+window.Lame.get_mode(mp3codec) + ' / ',
        'Samples: '+window.Lame.get_num_samples(mp3codec) + ' / ',
        'Channels: '+window.Lame.get_num_channels(mp3codec) + ' / ',
        'Input Samplate: '+ window.Lame.get_in_samplerate(mp3codec) + ' / ',
        'Output Samplate: '+ window.Lame.get_in_samplerate(mp3codec) + ' / ',
        'Bitlate :' +window.Lame.get_bitrate(mp3codec) + ' / ',
        'VBR :' + window.Lame.get_VBR(mp3codec));


      var buf = Uint8ArrayToFloat32Array(data.samples);

      var mp3data = window.Lame.encode_buffer_ieee_float(mp3codec, buf, buf);

      var mp3Blob = new Blob([new Uint8Array(mp3data.data)], {type: 'audio/mp3'});

      console.log(mp3Blob);

      const url = window.URL.createObjectURL(mp3Blob);
      const filename = "myRecording" + ((this.recIndex<10)?"0":"") + this.recIndex + ".mp3";
      self.link.href = url;
      self.link.download = filename || 'output.mp3';
      self.recIndex++;

    };

    fileReader.readAsArrayBuffer(blob);

    // var reader = new window.FileReader();
    // reader.addEventListener("loadend", function() {

    //   var base64FileData = reader.result.toString();

    //   var mediaFile = {
    //     size: blob.size,
    //     type: blob.type,
    //     src: base64FileData,
    //     srcSize: base64FileData.length,
    //   };

    //   console.log(mediaFile);

    //   // save the file info to localStorage
    //   localStorage.setItem('myTest', JSON.stringify(mediaFile));

    //   // read out the file info from localStorage again
    //   var reReadItem = JSON.parse(localStorage.getItem('myTest'));

    //   // audioControl.src = reReadItem.src;

    // });

    // reader.readAsDataURL(blob);


    // const url = window.URL.createObjectURL(blob);
    // const filename = "myRecording" + ((this.recIndex<10)?"0":"") + this.recIndex + ".wav";
    // this.link.href = url;
    // this.link.download = filename || 'output.wav';
    // this.recIndex++;
  }

  gotBuffers(buffers) {

    const drawBuffer = function ( width, height, context, data ) {
        var step = Math.ceil( data.length / width );
        var amp = height / 2;
        context.fillStyle = "silver";
        context.clearRect(0,0,width,height);
        for(var i=0; i < width; i++){
            var min = 1.0;
            var max = -1.0;
            for (var j=0; j<step; j++) {
                var datum = data[(i*step)+j];
                if (datum < min)
                    min = datum;
                if (datum > max)
                    max = datum;
            }
            context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
        }
    }


        var canvas = this.wavedisplay;

        drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

        this.audioRecorder.exportWAV( this.doneEncoding.bind(this) );
  }

  toggleRecording() {
    if (this.state.recording) {
      this.setState({
        recording: false,
      });
      this.audioRecorder.stop();
      this.audioRecorder.getBuffers( this.gotBuffers.bind(this) );
    } else {
      this.setState({
        recording: true,
      });
      this.audioRecorder.clear();
      this.audioRecorder.record();
    }
  }

  updateAnalysers(time) {
    if (!this.analyserContext) {
        var canvas = this.analyserCanvas;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.analyserContext = canvas.getContext('2d');
    }

    var SPACING = 3;
    var BAR_WIDTH = 1;
    var numBars = Math.round(this.canvasWidth / SPACING);
    var freqByteData = new Uint8Array(this.analyserNode.frequencyBinCount);

    this.analyserNode.getByteFrequencyData(freqByteData);

    this.analyserContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.analyserContext.fillStyle = '#F6D565';
    this.analyserContext.lineCap = 'round';
    var multiplier = this.analyserNode.frequencyBinCount / numBars;

    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor( i * multiplier );
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j< multiplier; j++)
            magnitude += freqByteData[offset + j];
        magnitude /= multiplier;
        // var magnitude2 = freqByteData[i * multiplier];
        this.analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
        this.analyserContext.fillRect(i * SPACING, this.canvasHeight, BAR_WIDTH, -magnitude);
    }

    this.rafID = window.requestAnimationFrame( this.updateAnalysers.bind(this) );
  }

  componentDidMount() {

    this.audioContext = new AudioContext();
    this.audioInput = null;
    this.realAudioInput = null;
    this.inputPoint = null;
    this.audioRecorder = null;
    this.rafID = null;
    this.analyserContext = null;
    this.canvasWidth = null;
    this.canvasHeight = null;
    this.recIndex = 0;

    if (!window.navigator.getUserMedia)
        window.navigator.getUserMedia = window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
    if (!window.navigator.cancelAnimationFrame)
        window.navigator.cancelAnimationFrame = window.navigator.webkitCancelAnimationFrame || window.navigator.mozCancelAnimationFrame;
    if (!window.navigator.requestAnimationFrame)
        window.navigator.requestAnimationFrame = window.navigator.webkitRequestAnimationFrame || window.navigator.mozRequestAnimationFrame;

    window.navigator.getUserMedia({
        "audio": {
            "mandatory": {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
            },
            "optional": []
        },
    }, this.gotStream.bind(this), function(e) {
        alert('Error getting audio');
        console.log(e);
    });
  }
  render() {
    return <div style={{
      display: 'flex',
      flexDirection: 'row',
    }}>
      <div id="viz" style={{
        height: '80%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        <canvas style={{
          background: '#202020',
          width: '95%',
          height: '45%',
          boxShadow: '0px 0px 10px blue',
        }} ref={a => {this.analyserCanvas = a} } width="1024" height="200"></canvas>
        <canvas style={{
          background: '#202020',
          width: '95%',
          height: '45%',
          boxShadow: '0px 0px 10px blue',
        }} ref={w => {this.wavedisplay = w}} width="1024" height="200"></canvas>
      </div>
      <div id="controls" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '100%',
        width: '10%',
      }}>
        <img alt="mic" style={{ height: '15vh', }}
        src={mic128} onClick={this.toggleRecording.bind(this)} />
        <a href="#" ref={l => {this.link = l}}>
          <img alt="save" src={save} />
        </a>
      </div>

    </div>
  }
}

export default App2;
