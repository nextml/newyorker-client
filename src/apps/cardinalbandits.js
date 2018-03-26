// @flow

import type {Experiment} from '../experiment';
import {randomString} from '../util';
import axios from 'axios';

export class CardinalBandits implements Experiment {
  expUid: string;
  participantUid: string;
  // URLs to data we need
  apiBaseUrl: string;
  targetsUrl: string;
  priorityListUrl: string;

  // list of targets.
  targets: string[] = [];
  // a list encoding the priority of sampling each arm. the first element is
  // the most important arm to sample.
  priorityList: number[] = [];
  // a pointer to our current location in the priority list.
  priorityPtr: number = 0;
  // caption indices we've seen.
  seen: number[] = [];

  constructor(expUid: string, urls: {
                apiBase: string, targets: string, priorityList: string
              })
  {
    this.expUid = expUid;
    this.apiBaseUrl      = urls.apiBase;
    this.targetsUrl      = urls.targets;
    this.priorityListUrl = urls.priorityList;

    // derive the participant id. if this user has already visited, they will
    // have a pid stored in localStorage, which we can simply retrieve. if not,
    // we generate a new pid and store it.
    const storedId = localStorage.getItem('participantUid');
    if (storedId) {
      this.participantUid = storedId;
    } else {
      this.participantUid = randomString(30);
      localStorage.setItem('participant_uid', this.participantUid);
    }
  }

  async _fetchTargets(url: string): Promise<string[]> {
    const response = await axios.get(url);
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return Promise.reject(new Error("didn't recieve expected type"));
    }
  }

  async _loadPriorityList(url: string): Promise<number[]> {
    const response = await axios.get(url);
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return Promise.reject(new Error("didn't recieve expected type"));
    }
  }

  async load() {
    this.targets = await self._loadTargets(this.targetsUrl);
    this.priorityList = await self._loadPriorityList(this.priorityListUrl);
  }

  getQuery(): string {
    const idx = ((this.priorityList.length === 0 || (this.seen.length >= this.targets.length))) ? (
      Math.floor(Math.random()*this.targets.length)
    ) : (
      this.priorityList[this.priorityPtr]
    );

    return this.targets[idx];
  }

  processAnswer(idx: number, reward: number) {
    throw new Error('implement me');
  }
}