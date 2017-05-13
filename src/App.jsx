import React, { Component } from 'react';

import save from './save.svg';
import mic128 from './mic128.png';

import VocabEntryListDemo from './VocabEntryListDemo.jsx';
import WeatherDemo from './WeatherDemo.jsx';

import './App.css';

import Recorder from './Recorder.js';

import parseWav from './parseWav.js';
import Uint8ArrayToFloat32Array from './Uint8ArrayToFloat32Array.js';

import {
  BrowserRouter as Router,
  Route,
  Link,
  browserHistory,
  Switch,
  Redirect
} from 'react-router-dom'



class RecorderDemo extends Component {
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

    this.audioRecorder = new Recorder( this.inputPoint );

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
      self.link.href = url;
      self.link.download = 'output.mp3';
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
        <img alt="mic" style={{
          height: '15vh',
          cursor: 'pointer',
          background: this.state.recording ? '-webkit-radial-gradient(center, ellipse cover, #ff0000 0%,white 75%,white 100%,#7db9e8 100%)' : null,
        }}
        src={mic128} onClick={this.toggleRecording.bind(this)} />
        <a href="#" ref={l => {this.link = l}}>
          <img alt="save" src={save} />
        </a>
      </div>

    </div>
  }
}

class NotFound extends Component {
  render() {
    return <h1>Not found</h1>
  }
}

class TOC extends Component {
  render() {
    return <ol>
      <li><Link to="/vocab">Vocab exercise (Days of Week)</Link></li>
      <li><Link to="/weather">Weather Exercise</Link></li>
      <li><Link to="/record">Recorder demo</Link></li>
    </ol>
  }
}

class App extends Component {
  render () {
    return <div>
    <Router history={browserHistory}>
      <Switch>
        <Route exact path="/" component={TOC} />
        <Route exact path="/vocab" component={VocabEntryListDemo} />
        <Route exact path="/weather" component={WeatherDemo} />
        <Route exact path="/record" component={RecorderDemo} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
    </div>
  }
}


export default App;
