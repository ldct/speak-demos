import React, { Component } from 'react';

import rec from './rec.png';
import recActive from './rec-active.png';
import play from './play.png';

import map from './map.png';
import legend from './legend.png';
import relaunch from './relaunch.png';
import listen from './listen.png';

import ReactOutsideEvent from 'react-outside-event';

import Q1 from './Q1.mp3';
import Q2 from './Q2.mp3';
import Q3 from './Q3.mp3';
import Q4 from './Q4.mp3';
import Q5 from './Q5.mp3';

import R1 from './R1.mp3';
import R2 from './R2.mp3';
import R3 from './R3.mp3';
import R4 from './R4.mp3';
import R5 from './R5.mp3';

import './App.css';

const canonicalSentence = function (sentence) {
  return sentence.replace(/^\ +/, '').replace(/\,/g, '').replace(/\./g, '').replace(/\?/g, '').toLowerCase().replace('anyway', 'any way').replace(/\ +$/, '');
}

class _SentenceEntry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      correct: false,
      interim_transcript: '',
      final_transcript: '',
    }

    this.recognition = new window.webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR';

    this.recognition.onresult = this.onRecognitionResult.bind(this);
    this.recognition.onend = this.onRecognitionEnd.bind(this);
    this.recognition.onstart = this.onRecognitionStart.bind(this);
  }

  onOutsideEvent() {
    this.recognition.stop(); // triggers onRecognitionEnd
  }

  onRecognitionEnd() {
    console.log('stopped');
    this.setState({
      active: false,
    });
  }

  onRecognitionStart() {
    console.log('started');
    this.setState({
      active: true,
    });
  }

  onRecognitionResult (event) {

    var final_transcript = '';
    var interim_transcript = '';

    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }

    this.setState({
      final_transcript: final_transcript,
      interim_transcript: interim_transcript,
    });

  }

  handleClickPlay() {
    this.question_audio.play();
  }
  handleClickRec(e) {

    e.stopPropagation();

    if (!this.state.active) {
      this.recognition.start();
    }
  }
  renderIcon() {
      return <img
        alt="rec"
        src={this.state.active ? recActive : rec} style={{height: '1.1em', marginRight: 5}} />
  }
  isCorrect() {
    return canonicalSentence(this.state.interim_transcript + this.state.final_transcript) === canonicalSentence(this.props.rightAnswer);
  }
  renderCorrectOrWrong() {
    if (1) {
      return <span style={{color: 'green'}}>✔</span>
    } else {
      return <span style={{color: 'red'}}>✗</span>
    }
  }
  handleClickRelaunch() {
    this.recognition.stop();
    this.setState({
      interim_transcript: '',
      final_transcript: '',
    });
    window.setTimeout(() => {
      this.recognition.start();
    }, 500);
  }
  handleClickListen() {
    this.response_audio.play();
  }
  render() {
    return <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        marginTop: 8, marginBottom: 8,
      }}>
      <audio ref={(a) => this.question_audio = a} src={this.props.audioSrc}></audio>
      <audio ref={(a) => this.response_audio = a} src={this.props.responseAudioSrc}></audio>
      <img alt="play" id="1-audio-button" src={play} width={33} height={30} style={{
        paddingLeft: 10,
        paddingRight: 10}}
        onClick={this.handleClickPlay.bind(this)}
      />
      <div style={{width: '6em'}}>
      {this.props.label}
      </div>
      <div style={{
        backgroundColor: 'white',
        height: '1.5em',
        display: 'flex',
        alignItems: 'center',
        width: '34em',
      }}
      onClick={this.handleClickRec.bind(this)}
      >
      {this.renderIcon()}
      <span style={{
        color: this.isCorrect() ? 'green' : 'grey'
      }}>{this.state.interim_transcript}</span>
      <span style={{
        color: this.isCorrect() ? 'green' : 'black' }}
      >{this.state.final_transcript}</span>
      {this.isCorrect()
        ? <span style={{color: 'green', marginLeft: 'auto'}}>✔</span>
        : null
      }
      </div>
      <img alt="restart" onClick={this.handleClickRelaunch.bind(this)} style={{cursor: 'pointer'}} src={relaunch} height={22} />
      <img alt="listen" onClick={this.handleClickListen.bind(this)} style={{cursor: 'pointer'}} src={listen} height={22} />
      </div>
  }
}

const SentenceEntry = ReactOutsideEvent(_SentenceEntry, ['click']);

class WeatherDemo extends Component {
  render() {
    return (
      <div style={{
        marginLeft: 30,
        marginRight: 30,
        marginTop: 70}}
      >

      <div>

      <div>Regardez la carte ci-dessous. Cliquez sur l’icône audiopour entendre la question. Enregistrez ensuite votre réponse.</div>

      <div>
      <span style={{
        color: 'blue',
      }}>Modèle: </span>
      <div style={{
        display: 'inline-block',
        verticalAlign: 'top',
      }}><div>Quel temps fait-il à Lille ?</div>
      <div>À Lille, il pleut</div>
      </div>
      </div>

      <div style={{
        // border: '1px solid pink',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <img alt="legend" src={legend} width={300} />
      <img alt="map" src={map} width={500} />
      </div>

      <div style={{
        backgroundColor: '#DCDBFF',
        marginTop: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>

      <SentenceEntry audioSrc={Q1} responseAudioSrc={R1} label="Question 1" rightAnswer="à paris il pleut" />
      <SentenceEntry audioSrc={Q2} responseAudioSrc={R2} label="Question 2" rightAnswer="à lyon il neige" />
      <SentenceEntry audioSrc={Q3} responseAudioSrc={R3} label="Question 3" rightAnswer="à nice il fait du soleil" />
      <SentenceEntry audioSrc={Q4} responseAudioSrc={R4} label="Question 4" rightAnswer="à rennes il y a du brouillard" />
      <SentenceEntry audioSrc={Q5} responseAudioSrc={R5} label="Question 5" rightAnswer="à strasbourg le ciel est couvert" />

      </div>


      </div>
      </div>
    );
  }
}

export default WeatherDemo;
