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

const colors = [
  '#ff6600',
  '#e2ff3e',
  '#1ffc35',
  '#2af6f6',
  '#0455ff',
  '#9900ff',
  '#ff25f6',
  '#d9b2ff',
]
const PROMPT_SETS = {
  'Music Genres': [
    { color: colors[0], text: 'Pop' },
    { color: colors[1], text: 'Hip-Hop' },
    { color: colors[2], text: 'R&B' },
    { color: colors[3], text: 'Rock' },
    { color: colors[4], text: 'Rap' },
    { color: colors[5], text: 'Jazz' },
    { color: colors[6], text: 'K-Pop' },
    { color: colors[7], text: 'Latin' },
    { color: colors[7], text: 'Reggae' },
    { color: colors[6], text: 'Afrobeats' },
    { color: colors[5], text: 'Electronic' },
    { color: colors[4], text: 'Country' },
    { color: colors[3], text: 'Blues' },
    { color: colors[2], text: 'Soul' },
    { color: colors[1], text: 'Funk' },
    { color: colors[0], text: 'Neo Soul' },
  ],
  'R&B': [
    { color: colors[0], text: 'Smooth Vocals' },
    { color: colors[1], text: 'Melismatic Runs' },
    { color: colors[2], text: 'Groovy Basslines' },
    { color: colors[3], text: 'Neo Soul' },
    { color: colors[4], text: 'Call & Response' },
    { color: colors[5], text: 'Falsetto' },
    { color: colors[6], text: 'Harmonies' },
    { color: colors[7], text: 'Soulful Chords' },
    { color: colors[7], text: 'Claps & Snaps' },
    { color: colors[6], text: 'Electric Piano' },
    { color: colors[5], text: 'Guitar Riffs' },
    { color: colors[4], text: 'Drum Machine' },
    { color: colors[3], text: 'Punchy Kick' },
    { color: colors[2], text: 'Lush Strings' },
    { color: colors[1], text: 'Staccato Rhythms' },
    { color: colors[0], text: '808s' },
  ],
  'Haitian Kompa': [
    { color: colors[0], text: 'Haitian Groove' },
    { color: colors[1], text: 'Haitian Folklore' },
    { color: colors[2], text: 'Rara' },
    { color: colors[3], text: 'Mizik rasin' },
    { color: colors[4], text: 'Zouk Brass' },
    { color: colors[5], text: 'Zouk Trumpets' },
    { color: colors[6], text: 'Kompa Rhythm Guitar' },
    { color: colors[7], text: 'Tanbou' },
    { color: colors[7], text: 'Haitian Percussion' },
    { color: colors[6], text: 'Zouk Synth'},
    { color: colors[5], text: 'Zouk Electric Piano' },
    { color: colors[4], text: 'Twoubadou' },
    { color: colors[3], text: 'Meringue' },
    { color: colors[2], text: 'Kompa String Pads' },
    { color: colors[1], text: 'Zouk Electric Guitar' },
    { color: colors[0], text: 'Haitian Basslines' },
  ],
};

// const DEFAULT_PROMPT_SET_KEY = 'Music Genres';
const DEFAULT_PROMPT_SET_KEY = 'Haitian Kompa';

main();
