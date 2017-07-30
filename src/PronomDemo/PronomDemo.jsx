import React, { PureComponent, Component } from 'react';

import mic from '../mic.gif';
import mic_active from '../mic-animate.gif';
import consigne from './consigne.mp3';
import Q1 from './Q1.webm';
import R1 from './R1.webm';
import Q2 from './Q2.webm';
import R2 from './R2.webm';
import Q3 from './Q3.webm';
import R3 from './R3.webm';
import Q4 from './Q4.webm';
import R4 from './R4.webm';
import Q5 from './Q5.webm';
import R5 from './R5.webm';
import Q6 from './Q6.webm';
import R6 from './R6.webm';
import Q7 from './Q7.webm';
import R7 from './R7.webm';
import Q8 from './Q8.webm';
import R8 from './R8.webm';
import Q9 from './Q9.webm';
import R9 from './R9.webm';
import Q10 from './Q10.webm';
import R10 from './R10.webm';

const substituteText = (text) => {
  const ret = text.replace('2016', '2007').replace('me emmener', "m'y emmener").replace('le faire', 'les faire');
  return ret;
}

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

  componentWillUnmount() {
    this.recognition.onend = null;
    this.recognition.onresult = null;
    this.recognition.stop();
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

    interim_transcript = substituteText(interim_transcript);
    final_transcript = substituteText(final_transcript);

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
      <button onClick={this.props.onSkip}>skip this question </button>
      <button onClick={this.props.onRequestCorrect}>découvrir la bonne réponse</button>

      </div>
    </div>
  }
}

class Show extends PureComponent {
  render() {
    const style = this.props.style || {};
    if (this.props.if) {
      return <div style={style}>
      {this.props.children}
      </div>
    } else {
      return null;
    }
  }
}

class Hide extends PureComponent {
  render() {
    return <div style={{visibility: this.props.if ? 'hidden' : null}}>
      {this.props.children}
    </div>
  }
}

class PronomDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startClicked: false,
      instructionsEnded: false,
      questionNumber: 0,
    }
  }
  handleClickStart() {
    this.setState({
      startClicked: true,
    });
  }
  handleClickSkip() {
    this.a.currentTime = this.a.duration;
  }
  handleEndInstruction() {
    this.setState({
      instructionsEnded: true,
    });
  }
  handleSkip() {
    this.setState({
      questionNumber: this.state.questionNumber + 1,
    });
  }
  render() {
    const questions = [
      <Question
        key={1}
        rightAnswers={["Oui je l'ai acheté en 2007", "Oui je l'ai acheté"]} /* de mil sept */
        onSkip={this.handleSkip.bind(this)}
        Q={Q1}
        R={R1} />,
      <Question
        key={2}
        rightAnswers={["Oui je l'ai déjà fait", "Oui je l'ai fait"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q2}
        R={R2} />,
      <Question
        key={3}
        rightAnswers={["Oui je l'ai déjà terminé", "Oui je l'ai terminé"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q3}
        R={R3} />,
      <Question
        key={4}
        rightAnswers={["Oui je l'ai retrouvé"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q4}
        R={R4} />,
      <Question
        key={5}
        rightAnswers={["Oui je vais te le rendre"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q5}
        R={R5} />,
      <Question
        key={6}
        rightAnswers={["Oui j'ai oublié de les faire"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q6}
        R={R6} />,
      <Question
        key={7}
        rightAnswers={["Oui je le lui ai prêté", "oui je l'ai prêté à mon ami", "oui je lui ai prêté mon ordinateur"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q7}
        R={R7} />,
      <Question
        key={8}
        rightAnswers={["Oui je vais l'étudier"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q8}
        R={R8} />,
      <Question
        key={9}
        rightAnswers={["Oui je l'ai aimé"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q9}
        R={R9} />,
      <Question
        key={10}
        rightAnswers={["Oui il va m'y emmener", "Oui il va m'y emmener à Paris"]}
        onSkip={this.handleSkip.bind(this)}
        Q={Q10}
        R={R10} />,
    ];
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    }}>
        <h1 style={{textAlign: 'center'}}>Exercice</h1>
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
              <Show if={this.state.instructionsEnded} style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column'
              }}>
                Jump to
                <div>
                <button onClick={() => this.setState({questionNumber: 0})}>Q1</button>
                <button onClick={() => this.setState({questionNumber: 1})}>Q2</button>
                <button onClick={() => this.setState({questionNumber: 2})}>Q3</button>
                <button onClick={() => this.setState({questionNumber: 3})}>Q4</button>
                <button onClick={() => this.setState({questionNumber: 4})}>Q5</button>
                <button onClick={() => this.setState({questionNumber: 5})}>Q6</button>
                <button onClick={() => this.setState({questionNumber: 6})}>Q7</button>
                <button onClick={() => this.setState({questionNumber: 7})}>Q8</button>
                <button onClick={() => this.setState({questionNumber: 8})}>Q9</button>
                <button onClick={() => this.setState({questionNumber: 9})}>Q10</button>


                </div>
                {questions[this.state.questionNumber]}
              </Show>
            </div>
          : <button onClick={this.handleClickStart.bind(this)}>Consigne</button>
        }

    </div>
  }
}

class Question extends Component {
  constructor(props) {
    super(props);
    this.state = {
      correct: null,
      requestedCorrect: false,
    }
  }
  handleEndVideo() {
    this.setState({
      videoEnded: true,
    });
  }
  isCorrect(res) {
    for (let rightAnswer of this.props.rightAnswers) {
      if (canonicalSentence(res) === canonicalSentence(rightAnswer)) {
        return true;
      }
    }
    return false;
  }
  handleAnswer(res) {
    this.setState({
      correct: this.isCorrect(res),
    });
  }
  handleRestart() {
    this.setState({
      correct: null,
    });
  }
  render() {
    return <div>
      {this.state.requestedCorrect
        ? <video src={this.props.R} autoPlay={true} controls width={640} />
        : <video src={this.props.Q} autoPlay={true} controls width={640} onEnded={this.handleEndVideo.bind(this)} />
      }
      <div style={{ width: '100%' }}>
        <Hide if={this.state.correct === null}>
          {this.state.correct
            ? <div>
            Correct!
              <button onClick={this.props.onSkip}>Next</button>
              <button onClick={() => {
                this.setState({
                  correct: null,
                })
              }}>Redo</button>
              <button onClick={() => {
                this.setState({
                  requestedCorrect: true,
                  correct: null,
                })
              }}>Discover</button>
            </div>
            : "Wrong! Click the \"restart recognition\" button to try again"}
        </Hide>
        <Show if={this.state.videoEnded && !this.state.requestedCorrect && (this.state.correct !== true)}>
          <ConfirmingSentenceEntry
            onResult={this.handleAnswer.bind(this)}
            onRestart={this.handleRestart.bind(this)}
            onRequestCorrect={() => this.setState({
              'requestedCorrect': true,
            })}
            onSkip={this.props.onSkip}
          />
        </Show>
        <Show if={this.state.requestedCorrect}>
        <button onClick={() => {
          this.setState({
            'videoEnded': false,
            'requestedCorrect': false,
          })
        }}>Back</button>
        </Show>
      </div>




    </div>
  }
}


export default PronomDemo;
