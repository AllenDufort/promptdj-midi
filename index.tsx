/**
 * @fileoverview Control real time music with a MIDI controller
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlaybackState, Prompt } from './types';
import { GoogleGenAI, LiveMusicFilteredPrompt } from '@google/genai';
import { PromptDjMidi } from './components/PromptDjMidi';
import { ToastMessage } from './components/ToastMessage';
import { LiveMusicHelper } from './utils/LiveMusicHelper';
import { AudioAnalyser } from './utils/AudioAnalyser';

// Fix: Use process.env.API_KEY and remove apiVersion as per Gemini API guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'lyria-realtime-exp';

function main() {
  const pdjMidi = new PromptDjMidi(PROMPT_SETS, DEFAULT_PROMPT_SET_KEY);
  document.body.appendChild(pdjMidi);

  const toastMessage = new ToastMessage();
  document.body.appendChild(toastMessage);

  const liveMusicHelper = new LiveMusicHelper(ai, model);
  liveMusicHelper.setWeightedPrompts(pdjMidi.getPrompts());

  const audioAnalyser = new AudioAnalyser(liveMusicHelper.audioContext);
  liveMusicHelper.extraDestination = audioAnalyser.node;

  pdjMidi.addEventListener('prompts-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<Map<string, Prompt>>;
    const prompts = customEvent.detail;
    liveMusicHelper.setWeightedPrompts(prompts);
  }));

  pdjMidi.addEventListener('play-pause', () => {
    liveMusicHelper.playPause();
  });

  liveMusicHelper.addEventListener('playback-state-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaybackState>;
    const playbackState = customEvent.detail;
    pdjMidi.playbackState = playbackState;
    playbackState === 'playing' ? audioAnalyser.start() : audioAnalyser.stop();
  }));

  liveMusicHelper.addEventListener('filtered-prompt', ((e: Event) => {
    const customEvent = e as CustomEvent<LiveMusicFilteredPrompt>;
    const filteredPrompt = customEvent.detail;
    toastMessage.show(filteredPrompt.filteredReason!)
    pdjMidi.addFilteredPrompt(filteredPrompt.text!);
  }));

  const errorToast = ((e: Event) => {
    const customEvent = e as CustomEvent<string>;
    const error = customEvent.detail;
    toastMessage.show(error);
  });

  liveMusicHelper.addEventListener('error', errorToast);
  pdjMidi.addEventListener('error', errorToast);

  audioAnalyser.addEventListener('audio-level-changed', ((e: Event) => {
    const customEvent = e as CustomEvent<number>;
    const level = customEvent.detail;
    pdjMidi.audioLevel = level;
  }));

}

const PROMPT_SETS = {
  'Music Genres': [
    { color: '#d9b2ff', text: 'Pop' },
    { color: '#ff6600', text: 'Hip-Hop' },
    { color: '#d8ff3e', text: 'R&B' },
    { color: '#2af6de', text: 'Rock' },
    { color: '#5200ff', text: 'Rap' },
    { color: '#9900ff', text: 'Jazz' },
    { color: '#ff25f6', text: 'K-Pop' },
    { color: '#ffdd28', text: 'Latin' },
    { color: '#2af6de', text: 'Reggae' },
    { color: '#9900ff', text: 'Afrobeats' },
    { color: '#5200ff', text: 'Electronic' },
    { color: '#ff25f6', text: 'Country' },
    { color: '#3dffab', text: 'Blues' },
    { color: '#3dffab', text: 'Soul' },
    { color: '#d9b2ff', text: 'Funk' },
    { color: '#d8ff3e', text: 'Neo Soul' },
  ],
  'R&B': [
    { color: '#d9b2ff', text: 'Smooth Vocals' },
    { color: '#ff6600', text: 'Melismatic Runs' },
    { color: '#d8ff3e', text: 'Groovy Basslines' },
    { color: '#2af6de', text: 'Neo Soul' },
    { color: '#5200ff', text: 'Call & Response' },
    { color: '#9900ff', text: 'Falsetto' },
    { color: '#ff25f6', text: 'Harmonies' },
    { color: '#ffdd28', text: 'Soulful Chords' },
    { color: '#2af6de', text: 'Claps & Snaps' },
    { color: '#9900ff', text: 'Electric Piano' },
    { color: '#5200ff', text: 'Guitar Riffs' },
    { color: '#ff25f6', text: 'Drum Machine' },
    { color: '#3dffab', text: 'Punchy Kick' },
    { color: '#3dffab', text: 'Lush Strings' },
    { color: '#d9b2ff', text: 'Staccato Rhythms' },
    { color: '#d8ff3e', text: '808s' },
  ],
  'Konpa': [
    { color: '#d9b2ff', text: 'Guitar Rhythms' },
    { color: '#ff6600', text: 'Clave Patterns' },
    { color: '#d8ff3e', text: 'Horn Sections' },
    { color: '#2af6de', text: 'Syncopated Bass' },
    { color: '#5200ff', text: 'Steady Kick Drum' },
    { color: '#9900ff', text: 'Call & Response Vocals' },
    { color: '#ff25f6', text: 'Layered Harmonies' },
    { color: '#ffdd28', text: 'Bright Keys' },
    { color: '#2af6de', text: 'Percussion Breaks' },
    { color: '#9900ff', text: 'Smooth Melodies' },
    { color: '#5200ff', text: 'Rhythmic Guitar Chops' },
    { color: '#ff25f6', text: 'Brass Hits' },
    { color: '#3dffab', text: 'Rolling Congas' },
    { color: '#3dffab', text: 'Tambourine Accents' },
    { color: '#d9b2ff', text: 'Dance Groove' },
    { color: '#d8ff3e', text: 'Melodic Basslines' },
  ]
};

const DEFAULT_PROMPT_SET_KEY = 'Music Genres';


main();
