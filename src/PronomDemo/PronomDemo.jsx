import React, { Component } from 'react';

import mic from '../mic.gif';
import mic_active from '../mic-animate.gif';
import consigne from './consigne.mp3';
import Q1 from './Q1.webm';

const canonicalSentence = function (sentence) {
  return sentence.replace(/^\ +/, '').replace(/\,/g, '').replace(/\./g, '').replace(/\?/g, '').toLowerCase().replace('anyway', 'any way').replace(/\ +$/, '');
}

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

    if (this.props.onResult && this.sendResults) {
      this.props.onResult(this.state.interim_transcript + this.state.final_transcript);
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
    this.sendResults = true;
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
    if (this.props.onRestart) {
      this.props.onRestart();
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
  constructor(props) {
    super(props);
    this.state = {
      startClicked: false,
      instructionsEnded: false,
      correct: null,
    }
  }
  handleClickStart() {
    this.setState({
      startClicked: true,
    });
  }
  handleEndInstruction() {
    this.setState({
      instructionsEnded: true,
    });
  }
  handleClickSkip() {
    this.a.currentTime = this.a.duration;
  }
  handleEndVideo() {
    this.setState({
      videoEnded: true,
    });
  }
  handleAnswer(res) {
    this.setState({
      correct: canonicalSentence(res) === canonicalSentence("Oui je l'ai acheté en 2007")
    });
  }
  handleRestart() {
    this.setState({
      correct: null,
    });
  }
  render() {
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    }}>
    <h1 style={{
      textAlign: 'center',
    }}>Exercice 1</h1>
    {this.state.startClicked
      ? <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div>
            Pierre vous pose une question. Répondez à la question de manière affirmative en substituant les compléments (COD ou COI) par les bons pronoms compléments.
              <button style={{
                visibility: this.state.instructionsEnded ? 'hidden' : null
              }}
              onClick={this.handleClickSkip.bind(this)}>skip</button>
          </div>
          <audio autoPlay={true} ref={(a) => {this.a = a}} onEnded={this.handleEndInstruction.bind(this)} src={consigne} />
          {this.state.instructionsEnded
            ? <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column'
              }}>
                <video src={Q1} autoPlay={true} controls width={640} onEnded={this.handleEndVideo.bind(this)} />
                <div style={{ width: '100%' }}>
                <div style={{
                  visibility: this.state.correct === null ? 'hidden' : null
                }}>
                {this.state.correct ? "Correct!" : "Wrong! Click the \"restart recognition\" button to try again"}
                </div>
                {this.state.videoEnded && (this.state.correct !== true)
                  ? <ConfirmingSentenceEntry onResult={this.handleAnswer.bind(this)} onRestart={this.handleRestart.bind(this)} />
                  : null
                }
                </div>
              </div>
            : null
          }

        </div>
      : <button onClick={this.handleClickStart.bind(this)}>Consigne</button>
    }



    </div>
  }
}


export default PronomDemo;
