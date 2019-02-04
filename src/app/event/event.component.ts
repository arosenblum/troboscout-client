import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Event as ScoutEvent } from '../model/event';
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: [
    './event.component.css'
  ]
})
export class EventComponent implements OnInit {
  eventList: Array<Event> = [];
  waitPeriod: number;
  timer: any;

  eventForm = new FormGroup({
    scouter: new FormControl(''),
    team: new FormControl(''),
    round: new FormControl(''),
    event: new FormControl('')
  });

  constructor() {
    this.waitPeriod = 5000;
    this.timer = null;

    // start the loop
    this.doWork();
  }

  ngOnInit() { }

  doWork() {
    let self = this;
    this.timer = setTimeout(() => {
      self.sendEvents();
    }, self.waitPeriod);
  }

  sendEvents () {
    console.log('Looking for events to send: ' + new Date());
    let total = this.eventList.length;
    let failures = [];
    let successes = [];
    let self = this;

    // iterate events, sending each to the server
    if (total > 0) {
      for (let aScoutingEvent of this.eventList) {
        axios.post('http://trobots5013.com:8080/event', aScoutingEvent).then(function (response) {
          successes.push(aScoutingEvent);
          console.log(response);
          if (failures.length + successes.length === total) {
            // TODO - done now, clear the timeout, and cleanup, or something
            clearTimeout(self.timer);
          }
        }).catch(function (error) {
          failures.push(aScoutingEvent);
          console.log(error);
          if (failures.length + successes.length === total) {
            // TODO - done now, clear the timeout, and cleanup, or something
            clearTimeout(self.timer);
          }
        });
      }
    } else {
      this.doWork();
    }
  }

  saveEvent = function (scoutingEvent) {
    scoutingEvent.event = this.eventForm.get('event').value;
    scoutingEvent.scouter = this.eventForm.get('scouter').value;
    scoutingEvent.team = this.eventForm.get('team').value;
    scoutingEvent.round = this.eventForm.get('round').value;
    scoutingEvent.eventTimestamp = new Date();
    this.eventList.push(scoutingEvent);
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn("onSubmit" + this.eventForm.value);
    let scoutingEvent = new ScoutEvent();
    this.saveEvent(scoutingEvent);
  }

  makeEvent(piece,action, location) {
    console.warn("cargoFloor");
    let scoutingEvent = new ScoutEvent();
    scoutingEvent.piece = piece;
    scoutingEvent.action = action;
    scoutingEvent.location = location;
    this.saveEvent(scoutingEvent);
  }
  getEventList() {
    return this.eventList;
  }
  
  getTimer() {
  	return this.timer;
  }

}
