'use strict';


const fs = require('fs');
const WebCamera = require("webcamjs");
const $ = require('jquery');
const csv = require('csv');
const parser = csv.parse();
const stringify = csv.stringify();
let my_time;
const PreviousScrollTop  = 0;
const ScrollInterval = setInterval(pageScroll, 30);
const DivElmnt = document.getElementById('guestFeedContainer');
const ReachedMaxScroll = false;
const ScrollRate = 1000;

window.addEventListener('keydown', e => {
	if(e.key == 'Enter') {
		takePicture();
	}
});

window.addEventListener('load', event => {
	fs.readFile('assets/Guests.csv', function read(err, data) {
		if (err) {
			throw err;
		}
		csv.parse(data, {header: true, column: { FirstName: 'FirstName', LastName: 'LastName', TableNumber: 'TableNumber' }}, (err, output) => {
			if(err) {
				console.log(err);
			}
			output.forEach(function(value, index) {
				if(index !== 0) { // not header
					$('#table_scroll > tbody').append($('<tr/>').text(value[0] + " " + value[1] + ' - Table: #' + value[2]));
				}
			});   

			scrollDiv_init();   
		});
	});

	WebCamera.set({
		width: 1080,
		height: 720,
		image_format: 'jpeg',
		jpeg_quality: 100,
		fps: 60
	});
	WebCamera.attach('#cam');
});


function scrollDiv_init() {
	DivElmnt.scrollTop = 0;
}

function pageScroll() {  
	if (!ReachedMaxScroll) {
		DivElmnt.scrollTop = PreviousScrollTop;
		PreviousScrollTop++;
		ReachedMaxScroll = DivElmnt.scrollTop >= (DivElmnt.scrollHeight - DivElmnt.offsetHeight);
	} else {
		ReachedMaxScroll = (DivElmnt.scrollTop == 0) ? false : true;
		DivElmnt.scrollTop = 0;
	}
}


function takePicture() {

	WebCamera.freeze();
	var audio = new Audio('assets/sounds/flash.mp3');
	audio.play();
	var timeStampInMs = Date.now();

	WebCamera.snap(function(data_uri) {
		var imageBuffer = processBase64Image(data_uri);
		fs.writeFile('Photos/' + timeStampInMs + ".jpg", imageBuffer.data, function(err) {
			if(err){
				alert("Error: could not save picture.");
			}
		});
	});
	WebCamera.unfreeze();
}

function processBase64Image(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),response = {};

	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}

	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');

	return response;
}
