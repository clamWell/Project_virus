$(function() {	
	var ieTest = false,
		screenWidth = $(window).width(),
		screenHeight = $(window).height(),
		imgURL = "http://img.khan.co.kr/spko/storytelling/2020/coronavirus/",
		isMobile = screenWidth <= 800 && true || false,
		isNotebook = (screenWidth <= 1300 && screenHeight < 750) && true || false,
		isMobileLandscape = ( screenWidth > 400 && screenWidth <= 800 && screenHeight < 450 ) && true || false;
	window.onbeforeunload = function(){ window.scrollTo(0, 0) ;}

	var randomRange = function(n1, n2) {
		return Math.floor((Math.random() * (n2 - n1 + 1)) + n1);
	};

	//randomly Srpeading Virus
    var $virus= $(".back-virus");
	for (var i = 0; i < $virus.length; i++) {
		var yRange = screenHeight;
		var x = randomRange(0, screenWidth) + "px";
		var y = randomRange(0, yRange) + "px";
		$virus.eq(i).css({"left": x});
		$virus.eq(i).css({"top": y});
    }	
	//randomly Srpeading Virus

	// Slider 
	var Slider = {};
	var baseWidth = null; 

 	Slider.itemNumb = 5;
	Slider.setSlider = function(){
		var $Base = $(".slider-body ul li");
		var margin = isMobile? 10 : 20;
		if (isMobile==true) {
			var BaseWidth_md = ($(".slider-body").width()-40)-20; 
			$Base.css({"width": BaseWidth_md });
			baseWidth = BaseWidth_md + margin; 
		}else {
			baseWidth = $Base.width() + margin;
		}		
		$(".slider-body ul").css({"width":Slider.itemNumb*baseWidth });
	};

	Slider.index = 0;
	Slider.moveSlide = function(drct){
		if(drct=="prev"){ // 이전
			if(Slider.index==0){}
			else if(Slider.index>0){
				Slider.index -=1;
				var moving = baseWidth*Slider.index;
				$(".slider-body ul").animate({"left":-moving}, 500,"easeOutCubic");
			}

		}else if(drct=="next"){ // 다음
			if(Slider.index==Slider.itemNumb-(isMobile? 1: 4) ){}
			else if(Slider.index<Slider.itemNumb-(isMobile? 1: 4) ){
				Slider.index +=1;
				var moving = baseWidth*Slider.index;
				$(".slider-body ul").animate({"left":-moving}, 500,"easeOutCubic");
			}

		}
	}
	// Slider 

	
	$(".loading-page").fadeOut(500, function(){		


	});
	

	//Scroll Event listener		
	$(window).scroll(function(){
		var nowScroll = $(window).scrollTop();	

	});

	// (Start) Plots map using leaflet.js
	var mapZoom = (isMobile == true) ? [6, 6, 8] : [7, 7, 8];
	var map = L.map("map").setView([30.782613, 114.366952], 3);
	//map.setMaxBounds(bounds);
	var mapTile = new L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		minZoom: 3,
		maxZoom: 5,
	});


	map.addLayer(mapTile);
	//map.dragging.disable();
	map.scrollWheelZoom.disable();
	//map.fitWorld();

	var geoData = acc_geoCode;
	var nullCount = 0;
	var makePlots = function() {
		var plots = L.layerGroup().addTo(map);
		for (var i = 0; i < geoData.length; i++) {
			if (geoData[i].lat != "" && geoData[i].lon != "") {
					var circles = new L.circle([geoData[i].lat, geoData[i].lon], {
					color: '#fa9461',
					weight: 1,
					fillColor: '#fddcaf',
					fillOpacity: 0.3,
					radius: 2000,
				});
				plots.addLayer(circles);
			} else if (geoData[i].lat == "" || geoData[i].lon == "") {
				nullCount++;
			}
		}
	};	
	//	makePlots();

	var totalCases;
	var totalDeath;
	var mapVirus; 
	var mapDataType; 

	var circlePos = L.layerGroup().addTo(map);		
	function makeCirlces(virus, type){
		var virus = virus;		
		var data = caseData.filter( function(v,i,a){
			return a[i].virus == virus;
		})
		var totalCases = 0;
		var totalDeath = 0;
		var type = (type == "cases")? "cases" : "death";
		var circleColor = (type == "cases")? "#ff8a00" : "#d10000";
		
		for (var i=0; i<data.length; i++) {
			totalCases += data[i].cases;
			totalDeath += data[i].death;
			var radius = Math.sqrt( data[i][type] ) * 20000 ;
			console.log(radius, data[i].lat, data[i].lot);
			var circles = new L.circle([data[i].lat, data[i].lot],{
				color: circleColor,
				fillColor: circleColor,
				fillOpacity: 0.5,
				border: 1,
				className: 'circle circle-'+data[i].nation,
				idName:i,	
				weight:2,	
				radius: radius
			})
			circlePos.addLayer(circles);												
		}	
		
		$(".caseNumber").html(totalCases);
		$(".deathNumber").html(totalDeath);
	}


	function setMapDefault(){
		makeCirlces("sars", "cases");
	}
	setMapDefault();

	$(".virus-type-change ul li").on("click", function(e){
		$(".virus-type-change ul li").removeClass("on");
		$(this).addClass("on");
		$(".switch-btn-holder .each-btn").removeClass("on");
		$(".type-case").addClass("on");

		mapVirus = $(this).attr("data-virus");
		mapDataType = "cases";
		makeCirlces(mapVirus, mapDataType);
	});

	// (End) Plots map using leaflet.js



});

// 공유

function sendSns(sns) {
  var url = encodeURIComponent(location.href);
  var txt = encodeURIComponent($("title").html());
  switch (sns) {
    case 'facebook':
      window.open('http://www.facebook.com/sharer/sharer.php?u=' + url);
      break;

    case 'twitter':
      window.open('http://twitter.com/intent/tweet?text=' + txt + '&url=' + url);
      break;
  }
}
