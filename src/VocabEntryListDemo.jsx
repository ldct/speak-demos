import React, { Component } from 'react';
import VocabEntry from './VocabEntry.jsx';

import lundi from './1-lundi.mp3';
import mardi from './2-mardi.mp3';
import mercredi from './3-mercredi.mp3';
import jeudi from './4-jeudi.mp3';
import vendredi from './5-vendredi.mp3';
import samedi from './6-samedi.mp3';
import dimanche from './7-dimanche.mp3';

class VocabEntryList extends Component {
  render() {
    return <div style={{
      backgroundColor: '#DCDBFF',
      marginTop: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    }}>
    {this.props.entries.map((entry, i) => {
      return <VocabEntry word={entry.word} audioSrc={entry.audioSrc} key={i} />
    })}
    </div>
  }
}

class VocabEntryListDemo extends Component {
  render() {
    return (
      <div style={{
        marginLeft: 30,
        marginRight: 30,
        marginTop: 70}}
      >

      <div>
      Écoutez la prononciation du mot ci-dessous en cliquant sur l’icône audio. Lorsque vous êtes prêt, cliquez sur le bouton d’enregistrement. Si le mot est bien prononcé, il s’affichera en vert.

      <VocabEntryList entries={[
        {word: "lundi", audioSrc: lundi},
        {word: "mardi", audioSrc: mardi},
        {word: "mercredi", audioSrc: mercredi},
        {word: "jeudi", audioSrc: jeudi},
        {word: "vendredi", audioSrc: vendredi},
        {word: "samedi", audioSrc: samedi},
        {word: "dimanche", audioSrc: dimanche},
      ]} />

      </div>
      </div>
    );
  }
}

export default VocabEntryListDemo;