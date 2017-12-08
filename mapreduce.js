//like (year)
map = function(){
	var month = this.timestamp.substring(5,7);
	var year = this.timestamp.substring(0,4);
	var rt = parseInt(this.retweets);
	var L = parseInt(this.likes);
	var agrees = 1+rt+L;
	
	emit({
		year: year},
		{
			count: agrees
		});
}
reduce = function(key,values){
	var total=0;
	for(var i = 0; i < values.length; i++){
		total+=values[i].count;
	}
	return {count:total};
}

results = db.runCommand({
	mapReduce: 'like',
	map:map,
	reduce:reduce,
	out:'like_year.report'
});

db.like_year.report.find().pretty()

//dislike (year)

map = function(){
	var month = this.timestamp.substring(5,7);
	var year = this.timestamp.substring(0,4);
	var rt = parseInt(this.retweets);
	var L = parseInt(this.likes);
	var agrees = 1+rt+L;
	
	emit({
		year: year},
		{
			count: agrees
		});
}
reduce = function(key,values){
	var total=0;
	for(var i = 0; i < values.length; i++){
		total+=values[i].count;
	}
	return {count:total};
}

results = db.runCommand({
	mapReduce: 'dislike',
	map:map,
	reduce:reduce,
	out:'dislike_year.report'
});

db.dislike_year.report.find().pretty()

//like (month)
map = function(){
	var month = this.timestamp.substring(5,7);
	var year = this.timestamp.substring(0,4);
	var rt = parseInt(this.retweets);
	var L = parseInt(this.likes);
	var agrees = 1+rt+L;
	
	emit({
		month: month},
		{
			count: agrees
		});
}
reduce = function(key,values){
	var total=0;
	for(var i = 0; i < values.length; i++){
		total+=values[i].count;
	}
	return {count:total};
}

results = db.runCommand({
	mapReduce: 'like',
	map:map,
	reduce:reduce,
	out:'like.report'
});

db.like.report.find().pretty()

//dislike (month)

map = function(){
	var month = this.timestamp.substring(5,7);
	var year = this.timestamp.substring(0,4);
	var rt = parseInt(this.retweets);
	var L = parseInt(this.likes);
	var agrees = 1+rt+L;
	
	emit({
		month: month},
		{
			count: agrees
		});
}
reduce = function(key,values){
	var total=0;
	for(var i = 0; i < values.length; i++){
		total+=values[i].count;
	}
	return {count:total};
}

results = db.runCommand({
	mapReduce: 'dislike',
	map:map,
	reduce:reduce,
	out:'dislike.report'
});

db.dislike.report.find().pretty()




//like (year & month)
map = function(){
	var month = this.timestamp.substring(5,7);
	var year = this.timestamp.substring(0,4);
	var rt = parseInt(this.retweets);
	var L = parseInt(this.likes);
	var agrees = 1+rt+L;
	
	emit({
		year: year,
		month:month},
		{
			count: agrees
		});
}
reduce = function(key,values){
	var total=0;
	for(var i = 0; i < values.length; i++){
		total+=values[i].count;
	}
	return {count:total};
}

results = db.runCommand({
	mapReduce: 'like',
	map:map,
	reduce:reduce,
	out:'like_yrmo.report'
});

db.like_yrmo.report.find().pretty()

//dislike (year & month)

map = function(){
	var month = this.timestamp.substring(5,7);
	var year = this.timestamp.substring(0,4);
	var rt = parseInt(this.retweets);
	var L = parseInt(this.likes);
	var agrees = 1+rt+L;
	
	emit({
		year: year,
		month:month},
		{
			count: agrees
		});
}
reduce = function(key,values){
	var total=0;
	for(var i = 0; i < values.length; i++){
		total+=values[i].count;
	}
	return {count:total};
}

results = db.runCommand({
	mapReduce: 'dislike',
	map:map,
	reduce:reduce,
	out:'dislike_yrmo.report'
});

db.dislike_yrmo.report.find().pretty()
