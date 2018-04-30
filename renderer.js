'use strict';

let fs = require('fs');
let WebCamera = require("webcamjs");
let $ = require('jquery');
let path = require('path');
let csv = require('csv');
let url = require('url')
let parser = csv.parse();
let stringify = csv.stringify();
let os = require('os');


window.addEventListener('keydown', e => {
  if(e.key == 'Enter') {
    takePicture();
  }
});

window.addEventListener('load', event => {
  fs.readFile(
    path.join(__dirname, 'assets/Guests.csv'), 
    function read(err, data) {
      if (err) {
        throw err;
      }
      csv.parse(data, {header: true, column: { FirstName: 'FirstName', LastName: 'LastName', TableNumber: 'TableNumber' }}, (err, output) => {
        if(err) {
          console.log(err);
        }
        output.forEach(function(value, index) {
          if(index !== 0) { // not header 
            $('.GuestScroller > ul').append($('<li/>').text(value[0] + " " + value[1] + ' - Table: #' + value[2]));
          }
        });   
      });
    }
  );

  WebCamera.set({
    width: 700,
    height: 500,
    image_format: 'jpeg',
    jpeg_quality: 100,
    fps: 60
  });
  WebCamera.attach('#cam');

  $('div#cam').removeAttr('style');
  $('#cam video').removeAttr('style');


  $('.GuestScroller > ul').totemticker({
    start		:	null,		/* ID of start button or link */
    row_height	:	'100px',
    max_items	: 5,

  });

});


function takePicture() {

  WebCamera.freeze();
  var audio = new Audio(path.join(__dirname,'assets/sounds/flash.mp3'));
  audio.play();
  var timeStampInMs = Date.now();

  WebCamera.snap(function(data_uri) {
    var imageBuffer = processBase64Image(data_uri);
    fs.writeFile(path.join(__dir, 'Photos/') + timeStampInMs + ".jpg", imageBuffer.data, function(err) {
      if(err){
        alert(err);
      }
    });
  });
  setTimeout(function() {
    WebCamera.unfreeze();
  }, 1000);
}


function processBase64Image(dataString) {
  let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),response = {};

  if (matches.length !== 3) return new Error('Invalid input string');

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

/*
	Totem Ticker Plugin
	Copyright (c) 2011 Zach Dunn / www.buildinternet.com
	Released under MIT License
	--------------------------
	Structure based on Doug Neiner's jQuery plugin blueprint: http://starter.pixelgraphics.us/
*/
(function( $ ){
	
	if(!$.omr){
		$.omr = new Object();
	};

	$.omr.totemticker = function(el, options ) {
	  	
	  	var base = this;
	  	
		//Define the DOM elements
	  	base.el = el;
	  	base.$el = $(el);
	  	
	  	// Add a reverse reference to the DOM object
        base.$el.data("omr.totemticker", base);
	  	
	  	base.init = function(){
            base.options = $.extend({},$.omr.totemticker.defaultOptions, options);
            
            //Define the ticker object
           	base.ticker;
			
			//Adjust the height of ticker if specified
			base.format_ticker();
			
			//Setup navigation links (if specified)
			base.setup_nav();
			
			//Start the ticker
			base.start_interval();
			
			//Debugging info in console
			//base.debug_info();
        };
		
		base.start_interval = function(){
			
			//Clear out any existing interval
			clearInterval(base.ticker);
			
			if (base.options.direction == 'up') {
				//If the direction has been set to up
				base.ticker = setInterval(function() {
					base.$el.find('li:last').detach().prependTo(base.$el).css('marginTop', '-' + base.options.row_height);
					base.$el.find('li:first').animate({
				        marginTop: '0px'
				    }, base.options.speed, function () {
				        //Callback functions go here
				    });
				}, base.options.interval);
			}else{
				//Otherwise, run the default of down
		    	base.ticker = setInterval(function() {
		    	
		    		base.$el.find('li:first').animate({
		            	marginTop: '-' + base.options.row_height
		            }, base.options.speed, function() {
		                $(this).detach().css('marginTop', '0').appendTo(base.$el);
		            });
		            
		    	}, base.options.interval);
	    	}
	    }
	    
	    base.reset_interval = function(){
	    	clearInterval(base.ticker);
	    	base.start_interval();
	    }
	    
	    base.stop_interval = function(){
	    	clearInterval(base.ticker);
	    }
	
		base.format_ticker = function(){
		
			if(typeof(base.options.max_items) != "undefined" && base.options.max_items != null) {
				
				//Remove units of measurement (Should expand to cover EM and % later)
				var stripped_height = base.options.row_height.replace(/px/i, '');
				var ticker_height = stripped_height * base.options.max_items;
			
				base.$el.css({
					height		: ticker_height + 'px', 
					overflow	: 'hidden'
				});
				
			}else{
				//No heights were specified, so just doublecheck overflow = hidden
				base.$el.css({
					overflow	: 'hidden'
				})
			}
			
		}
	
		base.setup_nav = function(){
			
			//Stop Button
			if (typeof(base.options.stop) != "undefined"  && base.options.stop != null){
				$(base.options.stop).click(function(){
					base.stop_interval();
					return false;
				});
			}
			
			//Start Button
			if (typeof(base.options.start) != "undefined"  && base.options.start != null){
				$(base.options.start).click(function(){
					base.start_interval();
					return false;
				});
			}
			
			//Previous Button
			if (typeof(base.options.previous) != "undefined"  && base.options.previous != null){
				$(base.options.previous).click(function(){
					base.$el.find('li:last').detach().prependTo(base.$el).css('marginTop', '-' + base.options.row_height);
					base.$el.find('li:first').animate({
				        marginTop: '0px'
				    }, base.options.speed, function () {
				        base.reset_interval();
				    });
				    return false;
				});
			}
			
			//Next Button
			if (typeof(base.options.next) != "undefined" && base.options.next != null){
				$(base.options.next).click(function(){
					base.$el.find('li:first').animate({
						marginTop: '-' + base.options.row_height
			        }, base.options.speed, function() {
			            $(this).detach().css('marginTop', '0px').appendTo(base.$el);
			            base.reset_interval();
			        });
			        return false;
				});
			}
			
			//Stop on mouse hover
			if (typeof(base.options.mousestop) != "undefined" && base.options.mousestop === true) {
				base.$el.mouseenter(function(){
					base.stop_interval();
				}).mouseleave(function(){
					base.start_interval();
				});
			}
			
			/*
				TO DO List
				----------------
				Add a continuous scrolling mode
			*/
			
		}
		
		base.debug_info = function()
		{
			//Dump options into console
			console.log(base.options);
		}
		
		//Make it go!
		base.init();
  };
  
  $.omr.totemticker.defaultOptions = {
  		message		:	'Ticker Loaded',	/* Disregard */
  		next		:	null,		/* ID of next button or link */
  		previous	:	null,		/* ID of previous button or link */
  		stop		:	null,		/* ID of stop button or link */
  		start		:	null,		/* ID of start button or link */
  		row_height	:	'100px',	/* Height of each ticker row in PX. Should be uniform. */
  		speed		:	800,		/* Speed of transition animation in milliseconds */
  		interval	:	4000,		/* Time between change in milliseconds */
		max_items	: 	null, 		/* Integer for how many items to display at once. Resizes height accordingly (OPTIONAL) */
		mousestop	:	false,		/* If set to true, the ticker will stop on mouseover */
		direction	:	'down'		/* Direction that list will scroll */		
  };
  
  $.fn.totemticker = function( options ){
    return this.each(function(){
    	(new $.omr.totemticker(this, options));
  	});
  };
  
})( $ );
