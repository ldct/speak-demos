import React, { Component } from 'react';
import ReactOutsideEvent from 'react-outside-event';

import rec from './rec.png';
import recActive from './rec-active.png';
import play from './play.png';

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

export default VocabEntry;