import React, { Component } from 'react';

class ConfirmingSentenceEntry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      interim_transcript: false,
      final_transcript: [],
    }
  }

  componentDidMount() {

    this.recognition = new window.webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'fr-FR';
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = this.onRecognitionResult.bind(this);
    this.recognition.onend = this.onRecognitionEnd.bind(this);
    this.recognition.onstart = this.onRecognitionStart.bind(this);

    this.recognition.start();

    console.log(this.recognition);

  }

  onRecognitionEnd() {
    this.setState({
      active: false,
    });
  }

  onRecognitionStart() {
    this.setState({
      active: true,
    });
  }

  onRecognitionResult(event) {

    console.log('ORR', event);

    var interim_transcript = '';

    const final_transcript = [];
    for (var i = 0; i < event.results.length; ++i) {
      final_transcript.push([]);

      const result = event.results[i];
      if (result.isFinal) {
        for (var j = 0; j < result.length; j++) {
          final_transcript[i].push({
            'transcript': result[j].transcript,
            'confidence': result[j].confidence
          });
        }
      } else {
        interim_transcript += result[0].transcript;
      }
    }

    this.setState({
      final_transcript: final_transcript,
      interim_transcript: interim_transcript,
    });
  }

  render() {
    return <div>
      <div>{this.state.final_transcript.map(t => {
        return <div style={{
          border: '1px solid pink',
          display: 'inline-flex',
          flexDirection: 'column',
        }}>{t.map(alt => {
          return <span>{alt.transcript + ' ' + alt.confidence}</span>
        })}</div>
      })}</div>
      <span style={{ color: "pink" }}>{this.state.interim_transcript}</span>

    </div>
  }
}
class DebugVR extends Component {
  render() {
    return <div>
    <ConfirmingSentenceEntry />
    </div>
  }
}


export default DebugVR;
