import React, { Component } from 'react';

class ConfirmingSentenceEntry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      interim_transcript: false,
      final_transcript: false,
    }
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

  render() {
    return <div>
      yo
      <span>{this.state.interim_transcript}</span>
      <span>{this.state.final_transcript}</span>

    </div>
  }
}
class PronomDemo extends Component {
  render() {
    return <div>
    hi
    <ConfirmingSentenceEntry />
    </div>
  }
}


export default PronomDemo;
