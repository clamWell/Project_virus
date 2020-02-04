$(function() {
	var ieTest = false,
		screenWidth = $(window).width(),
		screenHeight = $(window).height(),
		imgURL = "http://img.khan.co.kr/spko/storytelling/2020/virus/",
		isMobile = screenWidth <= 800 && true || false,
		isNotebook = (screenWidth <= 1300 && screenHeight < 750) && true || false,
		isMobileLandscape = ( screenWidth > 400 && screenWidth <= 800 && screenHeight < 450 ) && true || false;
	window.onbeforeunload = function(){ window.scrollTo(0, 0) ;}

	var randomRange = function(n1, n2) {
		return Math.floor((Math.random() * (n2 - n1 + 1)) + n1);
	};

	//randomly Spreading Virus
    var $virus= $(".back-virus");
	for (var i = 0; i < $virus.length; i++) {
		var yRange = screenHeight*6;
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
			var BaseWidth_md = ($(".slider-body").width()/2)-20;
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
			if(Slider.index==Slider.itemNumb-(isMobile? 3: 4) ){}
			else if(Slider.index<Slider.itemNumb-(isMobile? 3: 4) ){
				Slider.index +=1;
				var moving = baseWidth*Slider.index;
				$(".slider-body ul").animate({"left":-moving}, 500,"easeOutCubic");
			}

		}
	}

	$(".arrow").on("click", function(e){
		e.preventDefault();
		var drct = $(this).attr("id");
		Slider.moveSlide(drct);
	});
	// Slider


	$(".loading-page").fadeOut(500, function(){
		Slider.setSlider();

	});


	//Scroll Event listener
	$(window).scroll(function(){
		var nowScroll = $(window).scrollTop();

	});


	// (Start) Plots map using leaflet.js
	var mapZoom = (isMobile == true) ? 2 :4;
	var map = L.map("map").setView([30.782613, 114.366952], mapZoom);
	/*
	var mapTile = new L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		minZoom: 3,
		maxZoom: 5,
	});*/

	var mapTile = new L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		minZoom: 2,
		maxZoom: 8,
		continuousWorld: true
	});


	map.addLayer(mapTile);
	map.scrollWheelZoom.disable();

	var info = L.control();
	info.onAdd = function (map) {
		this._div = L.DomUtil.create("div", "map-info");
		this.update();
		return this._div;
	};
	info.update = function (props) {
		this._div.innerHTML = '<h3>각 전염병별 확산지역</h3>'
	};
	info.addTo(map);

	var totalCases;
	var totalDeath;
	var mapVirus;
	var mapDataType;
	var totalCasesNumber = { "sars": [8042,830],"flu":[6717097, 19654],"mers":[1329, 525],"corona":[20626, 426]};
	var circlePos = L.layerGroup().addTo(map);
	var getRadius = function(v){
		if(v>0 && v<=10){
			return 0.5;
		}else if(v>10&& v<=100){
			return 2;
		}else if(v>100&& v<=1000){
			return 3.5;
		}else if(v>1000){
			return 5;
		}
	};


	function makeCirlces(virus, type){
		var virus = virus;
		var data = caseData.filter( function(v,i,a){
			return a[i].virus == virus;
		})
		data.sort(function(a,b){
			return a[type] > b[type] ? -1 :a[type] <  b[type] ? 1 : 0;
		})

		var type = (type == "cases")? "cases" : "death";
		var circleColor = (type == "cases")? "#ff8a00" : "#d10000";

		$(".legend-holder").removeClass("legend-cases legend-death");
		$(".legend-holder").addClass("legend-"+type);
		$(".graph-wrap ul").html("");

		for (var i=0; i<data.length; i++) {
			if( data[i][type] !== 0 ){
				var radius = (getRadius(data[i][type]))*100000;
				var circles = new L.circle([data[i].Latitude, data[i].Longitude],{
					color: circleColor,
					fillColor: circleColor,
					fillOpacity: 0.2,
					border: 1,
					className: 'circle circle-'+data[i].nation,
					idName:i,
					weight:1,
					radius: radius
				}).bindPopup('<p class="nation-info">'+data[i].nationK+'</p><p class="numb">'+ data[i][type] +'명</p>');
				circlePos.addLayer(circles);

				/*
				if(virus=="flu"){
					if(i<15){
						$(".graph-wrap ul").append("<li><em class='country-name'>"+data[i].nationK+"</em><div class='pole pole-case'><span class='number'>"+data[i]["cases"]+"("+data[i]["death"]+")</span></li></div><div class='pole pole-death'></div>");
						$(".graph-wrap ul li").eq(i).find(".pole-case").css({"width": (data[i]["cases"]/2000 >1000)? 1000 : (data[i]["cases"]/2000 <1)? 1: data[i]["cases"]/2000 });
						$(".graph-wrap ul li").eq(i).find(".pole-death").css({"width":data[i]["death"]/2000 });
					}
				}else{
					$(".graph-wrap ul").append("<li><em class='country-name'>"+data[i].nationK+"</em><div class='pole pole-case'><span class='number'>"+data[i]["cases"]+"("+data[i]["death"]+")</span></li></div><div class='pole pole-death'></div>");
					$(".graph-wrap ul li").eq(i).find(".pole-case").css({"width": (data[i]["cases"]/5 >1000)?1000: (data[i]["cases"]/5 <1)?1:data[i]["cases"]/5});
					$(".graph-wrap ul li").eq(i).find(".pole-death").css({"width":data[i]["death"]/5 });
				}*/


			}

		}

		if( virus == "corona" ){
			totalCases = coronaNowCases;
			totalDeath = coronaNowDeath;
		}else{
			totalCases = totalCasesNumber[virus][0];
			totalDeath = totalCasesNumber[virus][1];
		}
		$(".caseNumber").html(totalCases+"명");
		$(".deathNumber").html(totalDeath+"명");
	}

	var coronaNowCases=0;
	var coronaNowDeath=0;
	function getCoronaStatus(){
		var c_Data = caseData.filter( function(v,i,a){
			return a[i].virus == "corona";
		});

		for(c=0;c<c_Data.length;c++){
			coronaNowCases = coronaNowCases + c_Data[c].cases;
			coronaNowDeath = coronaNowDeath + c_Data[c].death;
		}
		console.log( coronaNowCases, coronaNowDeath );
		$("span.coronaNowCases").html(coronaNowCases);
		$("span.coronaNowDeath").html(coronaNowDeath);
	}

	function setMapDefault(){
		getCoronaStatus();
		mapVirus = "sars";
		mapDataType ="cases";
		$(".legend-holder").addClass("legend-cases");
		makeCirlces(mapVirus, mapDataType);
	}
	setMapDefault();

	function removeMapCircles(){
		$(".circle").fadeOut();
	}

	function circlesOn(e) {
		var layer = e.target;
		layer.setStyle({
			fillOpacity: 1
		});
		this.openPopup();
		info.update(layer.features.properties);
	}

	$(".virus-type-change ul li").on("click", function(e){
		$(".virus-type-change ul li").removeClass("on");
		$(this).addClass("on");
		$(".switch-btn-holder .each-btn").removeClass("on");
		$(".type-case").addClass("on");
		mapVirus = $(this).attr("data-virus");
		mapDataType = "cases";

		removeMapCircles();
		makeCirlces(mapVirus, mapDataType);
		map.closePopup();
	});

	$(".switch-btn-holder .each-btn").on("click", function(e){
		$(".switch-btn-holder .each-btn").removeClass("on");
		$(this).addClass("on");
		mapDataType = $(this).attr("data-type");

		removeMapCircles();
		makeCirlces(mapVirus, mapDataType);
		map.closePopup();
	});
	// (End) Plots map using leaflet.js

	// make table
	v_table = {};
	v_table.makeTable = function(){
		for(d=0;d<domesticCases.length;d++){
			$("tbody").html("");
			$("tbody").append("<tr><td headers='co-0' class='persist essential'>+d+</th><td headers='co-1' class='essential'>+domesticCases[d].sex+(+domesticCases[d].age+)</td><td headers='co-2' class='essential'>+domesticCases[d].nation+</td><td headers='co-3' class='optional'>+domesticCases[d].wuhan+</td><td headers='co-4' class='optional'>+domesticCases[d].arriveDate+</td><td headers='co-5' class='essential'>+domesticCases[d].confirmDate+</td><td headers='co-6'><td headers='co-7' class='essential'>+domesticCases[d].contact+</td></tr>");
		}
	};
	$(".table-area").hide();
	//v_table.makeTable();

	// Bottom Virus Card (Start)
	var v_card = {},
		$card = $(".slider-body ul li"),
		virusNameKor = { "sars":"사스(SARS)", "flu":"신종플루(H1N1)", "mers":"메르스(MERS)","corona":"신종코로나" };
	v_card.makeCardContents = function(virus){
		var cardData = virusText.filter( function(v,i,a){
			return a[i].virus == virus;
		});
		$(".card-con-header .virus-name").html( virusNameKor[virus]);
		var cardImgUrl = (isMobile==true)? ("url("+imgURL+"card-con-virus-"+virus+"-m.jpg) no-repeat"): ("url("+imgURL+"card-con-virus-"+virus+".jpg) no-repeat");
		$(".card-con-col-2 .card-con-photo").css({"background": cardImgUrl });
		$(".storytelling-as-numbers > ul").html("");
		$(".text-section > ul").html("");
		var tN = 0;
		for(c=0; c<cardData.length;c++){
			if(cardData[c].listType == "number"){
				$(".storytelling-as-numbers > ul").append("<li><p class='title'>"+cardData[c].title+"</p><p class='conts'>"+cardData[c].conts+"</p></li>");
			}else if(cardData[c].listType == "text"){
				$(".text-section > ul").append("<li><p class='title'>"+cardData[c].title+"</p><div class='para-holder'>"+cardData[c].conts+"</div><div class='card-photo'><img src='"+imgURL+"card-con-photo-"+virus+"-"+tN+".jpg' alt=''></div></li>");
				tN++;
			}
		}

	},
	v_card.showCardContents = function(){
		$(".slider-bottom").slideDown( function(){
			var cardConPos = $(".card-con-header").offset().top-150;
			$("html, body").animate({scrollTop: cardConPos},800, "easeOutCubic");
		});
	}
	v_card.hideCardContents = function(){
		var cardSliderPos = $(".slider").offset().top-(screenHeight*0.3);
		$("html, body").animate({scrollTop: cardSliderPos},800, "easeOutCubic",function(){
			$(".slider-bottom").hide();
		});
		$card.removeClass("on");
	};

	$card.on("click", function(e){
		$card.removeClass("on");
		$(this).addClass("on");
		v_card.makeCardContents($(this).attr("data-card-virus"));
		v_card.showCardContents();
	});
	$(".see-more-btn, .close-btn").on("click", function(e){
		v_card.hideCardContents();
	});
	// Bottom Virus Card (End)



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
