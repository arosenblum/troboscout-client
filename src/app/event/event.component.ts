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
  successes: Array<Event> = [];
  failures: Array<Event> = [];
  waitPeriod: number;
  timer: any;
  lastCorrelationId: Date;
  hasPiece :boolean = false;
  piece : string;
  matchInProgress = false;

  eventForm = new FormGroup({
    scouter: new FormControl(''),
    team: new FormControl(''),
    round: new FormControl(''),
    event: new FormControl(''),
    comment: new FormControl('')
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
    let failures = this.failures;
    let successes = this.successes;
    let self = this;
    

    // iterate events, sending each to the server
    if (total > 0) {
      for (var i = 0; i < this.eventList.length; i++){
        let aScoutingEvent = this.eventList[i];

 //       axios.post('http://trobots5013.com:8080/event', aScoutingEvent).then(function (response) {
          axios.post('/event', aScoutingEvent).then(function (response) {
          successes.push(aScoutingEvent);
          self.eventList=self.eventList.splice(i--,1);
          console.log(response);
          console.log('self event list size = ' + self.eventList.length + "i=" + i);
          //clearTimeout(self.timer);
        }).catch(function (error) {
          failures.push(aScoutingEvent);
          self.eventList=self.eventList.splice(i--,1);
          console.log(error);
          console.log('self event list size = ' + self.eventList.length+ "i=" + i);
          //clearTimeout(self.timer);
        });
        console.log('ending event list size = ' + this.eventList.length);
        
      }
      this.doWork();
    } else {
      this.doWork();
    }
  }
  hasInfo(){
  	let result =   !(this.eventForm.get('event').value == null || this.eventForm.get('event').value == '' ||
   	this.eventForm.get('scouter').value== null || this.eventForm.get('scouter').value == '' || 
    this.eventForm.get('team').value==null || this.eventForm.get('team').value == '' || 
    this.eventForm.get('round').value == null || this.eventForm.get('round').value == '');
    return result;
    	 
  }
  saveEvent = function (scoutingEvent) {
    scoutingEvent.event = this.eventForm.get('event').value;
    scoutingEvent.scouter = this.eventForm.get('scouter').value;
    scoutingEvent.team = this.eventForm.get('team').value;
    scoutingEvent.round = this.eventForm.get('round').value;
    scoutingEvent.eventTimestamp = new Date();
    if (scoutingEvent.action == 'take'){
    	scoutingEvent.correlationId = scoutingEvent.eventTimestamp;
    	this.lastCorrelationId = scoutingEvent.eventTimestamp;
    	this.hasPiece=true;
    	this.piece = scoutingEvent.piece;
    } else {
    	if (scoutingEvent.action == 'comment'){
    		scoutingEvent.correlationId = null;
    	} else {
    		scoutingEvent.correlationId = this.lastCorrelationId;
    	}
    	this.hasPiece=false;
    	this.piece = null;
    }
    this.eventList.push(scoutingEvent);
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn("onSubmit" + this.eventForm.value);
    let scoutingEvent = new ScoutEvent();
    this.saveEvent(scoutingEvent);
  }

  makeEvent(piece,action, location) {
  	if (action == 'take' && this.hasPiece) return;
  	if ((action == 'place' || action == 'fail') && !this.hasPiece) return;
  	if (this.hasPiece && this.piece != piece) return;
  	if (this.matchInProgress && location=='pre') return;
    let scoutingEvent = new ScoutEvent();
    this.matchInProgress = true;
    scoutingEvent.piece = piece;
    scoutingEvent.action = action;
    scoutingEvent.location = location;
    this.saveEvent(scoutingEvent);
  }
   climb(location) {
    let scoutingEvent = new ScoutEvent();
    scoutingEvent.piece = 'none';
    scoutingEvent.action = 'climb';
    scoutingEvent.location = location;
    this.saveEvent(scoutingEvent);
  }
   makeEventDrop() {
   	if (this.hasPiece){
	    let scoutingEvent = new ScoutEvent();
	    scoutingEvent.piece = this.piece;
	    scoutingEvent.action = 'drop';
	    scoutingEvent.location = 'drop';
	    this.saveEvent(scoutingEvent);
    }
  }
  newMatch(){
  	this.matchInProgress = false;
  	this.eventForm.get('team').setValue('');
  	this.eventForm.get('round').setValue('');
  }
 comment() {
	    let scoutingEvent = new ScoutEvent();
	    scoutingEvent.piece = this.piece;
	    scoutingEvent.action = 'comment';
	    scoutingEvent.location = 'comment';
	    scoutingEvent.comment = this.eventForm.get('comment').value;
	    this.eventForm.get('comment').setValue('');
	    this.saveEvent(scoutingEvent);
  }
  getEventList() {
    return this.eventList;
  }
  
  getTimer() {
  	return this.timer;
  }
  
  getHasPiece() {
  	return this.hasPiece;
  }
  
  hasCargo(){
  	return this.hasPiece && this.piece == 'cargo';
  }
  
    
  hasHatch(){
  	return this.hasPiece && this.piece == 'hatch';
  }
  retryFailures(){
  	for (var i = 0; i < this.failures.length; i++){
  		this.eventList.push(this.failures[i]);
  	}
  	this.failures.splice(0,this.failures.length);
  }
}
