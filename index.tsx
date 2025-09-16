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
  const initialPrompts = buildInitialPrompts();

  const pdjMidi = new PromptDjMidi(initialPrompts);
  document.body.appendChild(pdjMidi);

  const toastMessage = new ToastMessage();
  document.body.appendChild(toastMessage);

  const liveMusicHelper = new LiveMusicHelper(ai, model);
  liveMusicHelper.setWeightedPrompts(initialPrompts);

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

function buildInitialPrompts() {
  // Pick 3 random prompts to start at weight = 1
  const startOn = [...DEFAULT_PROMPTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const prompts = new Map<string, Prompt>();

  for (let i = 0; i < DEFAULT_PROMPTS.length; i++) {
    const promptId = `prompt-${i}`;
    const prompt = DEFAULT_PROMPTS[i];
    const { text, color } = prompt;
    prompts.set(promptId, {
      promptId,
      text,
      weight: startOn.includes(prompt) ? 1 : 0,
      cc: i,
      color,
    });
  }

  return prompts;
}

// const DEFAULT_PROMPTS = [
//   { color: '#d9b2ff', text: 'R&B' },
//   { color: '#ff6600', text: 'Hip-Hop' },
//   { color: '#d8ff3e', text: 'Neo Soul' },
//   { color: '#2af6de', text: 'Funk' },
//   { color: '#5200ff', text: 'Rap' },
//   { color: '#9900ff', text: 'Pop' },
//   { color: '#ff25f6', text: 'K Pop' },
//   { color: '#ffdd28', text: 'Konpa' },
//   { color: '#2af6de', text: 'Latin' },
//   { color: '#9900ff', text: 'Brazilian' },
//   { color: '#5200ff', text: 'Afrobeats' },
//   { color: '#ff25f6', text: 'Drums' },
//   { color: '#3dffab', text: 'Punchy Kick' },
//   { color: '#3dffab', text: 'Lush Strings' },
//   { color: '#d9b2ff', text: 'Staccato Rhythms' },
//   { color: '#d8ff3e', text: 'Bass' },
// ];

const DEFAULT_PROMPTS = [
  { color: '#d9b2ff', text: 'Smooth Vocals' },
  { color: '#ff6600', text: 'Melismatic Runs' },
  { color: '#d8ff3e', text: 'Groovy Basslines' },
  { color: '#2af6de', text: 'Syncopated Rhythms' },
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
];


main();