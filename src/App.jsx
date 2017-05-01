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

import './App.css';

class VocabEntry extends Component {
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
  handleClickRec() {
    this.setState({
      active: true,
    });
    this.recognition.start();
  }
  render() {
    return <div style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: 8, marginBottom: 8
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
      <img alt="rec" src={this.state.active ? recActive : rec} style={{height: '1.1em'}} />
      <span style={{color: 'grey'}}></span>
      <span>{this.state.lastWord}</span>
      </div>
      <span style={{color: 'green'}}>{this.state.lastWord === this.props.word ? "✔" : ""}</span>
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

      <div style={{
        backgroundColor: '#DCDBFF',
        marginTop: 30,
      }}>
        <VocabEntry word="lundi" audioSrc={lundi} />
        <VocabEntry word="mardi" audioSrc={mardi} />
        <VocabEntry word="mercredi" audioSrc={mercredi} />
        <VocabEntry word="jeudi" audioSrc={jeudi} />
        <VocabEntry word="vendredi" audioSrc={vendredi} />
        <VocabEntry word="samedi" audioSrc={samedi} />
        <VocabEntry word="dimanche" audioSrc={dimanche} />
      </div>
      </div>
      </div>
    );
  }
}

export default App;
