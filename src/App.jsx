import React, { Component } from 'react';

import VocabEntryListDemo from './VocabEntryListDemo.jsx';
import WeatherDemo from './WeatherDemo.jsx';
import RecorderDemo from './RecorderDemo.jsx';

import './App.css';

import {
  BrowserRouter as Router,
  Route,
  Link,
  browserHistory,
  Switch,
} from 'react-router-dom'

class NotFound extends Component {
  render() {
    return <h1>Not found</h1>
  }
}

class TOC extends Component {
  render() {
    return <ol>
      <li><Link to="/vocab">Days of Week Exercise</Link></li>
      <li><Link to="/weather">Weather Exercise</Link></li>
      <li><Link to="/record">Recorder demo</Link></li>
      <li><Link to="/slides/slides.html">Pronom Complement</Link></li>
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
