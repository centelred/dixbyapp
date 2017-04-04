//variables//
var keys = require('./keys.js');
var twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');
var client = new twitter({
       consumer_key: keys.twitterKeys.consumer_key,
       consumer_secret: keys.twitterKeys.consumer_secret,
       access_token_key: keys.twitterKeys.access_token_key,
       access_token_secret: keys.twitterKeys.access_token_secret
   });
var params = { screen_name: 'centelred', 
				count: 20 
				};

//my-tweets//
function twentyTweets(){

	client.get('statuses/user_timeline', params, function(error,tweets,response){
			if (error) {
				console.log(error);
			}else{
				tweets.forEach(function(tweets){
					var tweetOutput = "==========TWEETS==========" + "\n" + "Tweet: " + tweets.text + "\n" +
					"Published: " + tweets.created_at + "\n";
					logText(tweetOutput);
					console.log(tweetOutput);
				})
			}

			start();
		});
}

//spotify-this-song//
function spotQuery(spotInput){
	spotify.search({
		type: 'track',
		query: spotInput
	}, function(err, spotInput) {
		if (err) {
			console.log('Error: ' + err);
			return;
		}else{
			var userSI = spotInput.tracks.items[0];
			var spotOut = "=========SPOTIFY=========" +"\n" + "Artist: " + userSI.artists[0].name + "\n" +
				"Song Name: " + userSI.name + "\n" +
				"Spotify Link: " + userSI.external_urls.spotify + "\n" +
				"Album: " + userSI.album.name + "\n";
			logText(spotOut);
			console.log(spotOut);
		}

		start();
	});
}

//movie-this//
function chosenMovie(movieInput){
	request('http://www.omdbapi.com/?t='+ movieInput + '&y=&i=&plot=short&tomatoes=true&r=json', function(error,response,body){
		if(!error && response.statusCode == 200){
			var userParse = JSON.parse(body)
			var movieOut = "==========MOVIE==========" + "\n" +
			"Title: " + userParse.Title + "\n" +
			"Year: " + userParse.Year + "\n" +
			"Plot: " + userParse.Plot + "\n" +
			"Actors: " + userParse.Actors + "\n" +
			"IMDB Rate: " + userParse.imdbRating + "\n" +
			"Tomato Rate: " + userParse.tomatoRating + "\n" +
			"Tomato URL: " + userParse.tomatoURL + "\n" +
			"Country: " + userParse.Country + "\n" +
			"Language: " + userParse.Language + "\n";
			logText(movieOut);
			console.log(movieOut);
		}

		start();
	});
}

//random.txt file//
function randomChoice(){
	fs.readFile("random.txt", "utf8", function(error,data){
		if(error) {
			return console.log(error);
		}else{
			var dataArr = data.split(",");
			var userFirstInput = dataArr[0];
			var userSecondInput = dataArr[1];

			switch(userFirstInput){
				case "spotify-this-song":
					spotQuery(userSecondInput);
					break;
			}
		}
	});
}

//append to log.txt//
function logText(data){
	console.log(data);
	fs.appendFile("./log.txt", data + "\n", function(err){
		if(err){
			console.log("Error: " + err);
		}
	});
}

//start function//
function start(){
	inquirer.prompt([
	{
		type:"list",
		name:"whatToPick",
		message:"Where would you like to start?",
		choices:["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says", "EXIT"]
	}
	]).then(function(user){
		if(user.whatToPick == "my-tweets"){
			twentyTweets();
		}else if(user.whatToPick == "spotify-this-song"){
			inquirer.prompt([
			{
				type:"input",
				name:"songChoice",
				message:"Pick a song",
			}
			]).then(function(spotInput){
				if(spotInput.songChoice == ""){
					spotQuery("Cant Tell Me Nothing")
				}else{
					spotQuery(spotInput.songChoice);
				}
			})
		}else if(user.whatToPick == "movie-this"){
			inquirer.prompt([
			{
				type:"input",
				name:"movieChoice",
				message:"Pick a movie",
			}
			]).then(function(movieInput){
				if(movieInput.movieChoice == ""){
					chosenMovie("Mr. Nobody")
				}else{
					chosenMovie(movieInput.movieChoice);
				}
			})
		}else if(user.whatToPick == "do-what-it-says"){
			randomChoice();
		}else if(user.whatToPick == "EXIT"){
			inquirer.prompt([
			{
				type:"confirm",
				name:"exitApp",
				message:"Are you for serious??",
			}
			]).then(function(leave){
				if(leave.exitApp == true){
					console.log("See Ya!");
				}else{
					start();
				}
			})
		}
	})
}

start();