import React, { Component } from 'react';

import mic from './mic.gif';
import mic_active from './mic-animate.gif';

class ConfirmingSentenceEntry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      interim_transcript: false,
      final_transcript: false,
    }

    this.restart_once_on_end = false;
  }

  componentDidMount() {

    this.recognition = new window.webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR';

    this.recognition.onresult = this.onRecognitionResult.bind(this);
    this.recognition.onend = this.onRecognitionEnd.bind(this);
    this.recognition.onstart = this.onRecognitionStart.bind(this);

    this.recognition.start();

  }

  onRecognitionEnd() {

    if (this.props.onResult) {
      this.props.onResult(this.state.interim_transcript + this.state.final_transcript);
    }

    this.setState({
      active: false,
    });

    if (this.restart_once_on_end) {
      this.setState({
        interim_transcript: '',
        final_transcript: '',
      });
      window.setTimeout(() => {
        this.recognition.start();
        this.restart_once_on_end = false;
      }, 800);
    }
  }

  onRecognitionStart() {
    this.setState({
      active: true,
    });
  }

  onRecognitionResult(event) {

    var final_transcript = '';
    var interim_transcript = '';

    for (var i = 0; i < event.results.length; ++i) {
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

  handleClickDoneSpeaking() {
    this.recognition.stop();
  }

  handleClickRestart() {
    if (this.state.active) {
      this.restart_once_on_end = true;
      this.recognition.stop();
    } else {
      this.setState({
        interim_transcript: '',
        final_transcript: '',
      })
      this.recognition.start();
    }
  }


  render() {
    return <div style={{
      margin: '1em',
    }}>
      <div style={{
        border: '1px solid lightgrey',
        borderRadius: 5,
        height: '10em',
        padding: '1em',
        display: 'flex',
      }}>
        <div style={{ flexGrow: 1, }}>
        <span>{this.state.final_transcript}</span>
        <span style={{ color: "grey" }}>{this.state.interim_transcript}</span>
        </div>
        <span>
        <img src={
          this.state.active ? mic_active : mic
        } />
        </span>
      </div>
      <div>
      <button onClick={this.handleClickDoneSpeaking.bind(this)}>I'm done speaking</button>
      <button onClick={this.handleClickRestart.bind(this)}>click here to restart recognition</button>
      <button>skip this question </button>
      <button>découvrir la bonne réponse</button>

      </div>
    </div>
  }
}
class PronomDemo extends Component {
  render() {
    return <div>
    <ConfirmingSentenceEntry onResult={res => {
      console.log(res);
    }} />
    </div>
  }
}


export default PronomDemo;
