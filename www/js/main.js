    function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            notFirstUse();
        }
    }
    var admobid = {};
    if (/(android)/i.test(navigator.userAgent)) {
        admobid = { // for Android
            banner: 'ca-app-pub-1683858134373419/7790106682',
            interstitial:'ca-app-pub-9249695405712287/7509744929'
        };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', 
      interstitial: 'ca-app-pub-9249695405712287/8958557966'
    };
  }

    function initApp() {
        if (!AdMob) { alert('admob plugin not ready'); return; }
        initAd();
        //display interstitial at startup
        loadInterstitial();
    }
    function initAd() {
        var defaultOptions = {
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            bgColor: 'black', // color name, or '#RRGGBB'
            isTesting: false // set to true, to receiving test ad for testing purpose
        };
        AdMob.setOptions(defaultOptions);
        registerAdEvents();
    }

    // optional, in case respond to events or handle error
    function registerAdEvents() {
        // new events, with variable to differentiate: adNetwork, adType, adEvent
        document.addEventListener('onAdFailLoad', function (data) {
            document.getElementById('screen').style.display = 'none';     
        });
        document.addEventListener('onAdLoaded', function (data) { });
        document.addEventListener('onAdPresent', function (data) { });
        document.addEventListener('onAdLeaveApp', function (data) { });
        document.addEventListener('onAdDismiss', function (data) { 
            document.getElementById('screen').style.display = 'none';     
        });
    }

    function createSelectedBanner() {
          AdMob.createBanner({adId:admobid.banner});
    }

    function loadInterstitial() {
        if ((/(android|windows phone)/i.test(navigator.userAgent))) {
            AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: true });
        } else if ((/(ipad|iphone|ipod)/i.test(navigator.userAgent))) {
            //AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: true });
            document.getElementById("screen").style.display = 'none';     
        } else
        {
            document.getElementById("screen").style.display = 'none';     
        }
    }

   function checkFirstUse()
    {
        $(".dropList").select2();
        //window.ga.startTrackerWithId('UA-88579601-20', 1, function(msg) {
        //    window.ga.trackView('Home');
        //});  
        initApp();
        askRating();
        document.getElementById("screen").style.display = 'none';     
    }

   function notFirstUse()
    {
        $(".dropList").select2();
        document.getElementById("screen").style.display = 'none';     
    }

function askRating()
{
  AppRate.preferences = {
  openStoreInApp: true,
  useLanguage:  'en',
  usesUntilPrompt: 10,
  promptAgainForEachNewVersion: true,
  storeAppURL: {
                ios: '1459009412',
                android: 'market://details?id=com.newyork.free'
               }
};
 
AppRate.promptForRating(false);
}


function getDirections() {
    reset();  
    var url = encodeURI("http://bustime.mta.info/api/where/stops-for-route/" + $("#MainMobileContent_routeList").val() + ".json?key=2831577d-91f0-41b5-a3e3-a562be3e8967&includePolylines=false&version=2");
	$.get(url, function(data) {processDirections(data); });    $("span").remove();
    $(".dropList").select2();
}

function processDirections(output)
{
    var list = $("#MainMobileContent_directionList");
    $(list).empty();
    $(list).append($("<option disabled/>").val("0").text("- Select Direction -"));
	var directionsTag = output.data.entry.stopGroupings["0"].stopGroups;	

	for (var i=0; i<directionsTag.length;i++)
	{
		var nameTag = directionsTag[i].name.name;
		var displayTag = i;
        $(list).append($("<option />").val(displayTag).text(nameTag));
	}
	$(list).val(0);
}

function getStops()
{
    reset(); 
    var url = encodeURI("http://bustime.mta.info/api/where/stops-for-route/" + $("#MainMobileContent_routeList").val() + ".json?key=2831577d-91f0-41b5-a3e3-a562be3e8967&includePolylines=false&version=2");
	$.get(url, function(data) {  processStops(data); });
    $("span").remove();
    $(".dropList").select2();
}

function processStops(output)
{
    var list = $("#MainMobileContent_stopList");
    $(list).empty();
    $(list).append($("<option disabled/>").val("0").text("- Select Stop -"));
	var stopsTag = output.data.references;
	var direction = $("#MainMobileContent_directionList").val();
	var directionStops = output.data.entry.stopGroupings["0"].stopGroups[direction];
    var arrStops = [];
    $.each(stopsTag.stops, function (index) {
       {
            arrStops.push(this.id);
        }});
    var match;

    $.each(directionStops.stopIds, function (index) {
        {
            match = arrStops.indexOf(directionStops.stopIds[index]);
            if (match != -1)
                $(list).append($("<option />").val(stopsTag.stops[match].code).text(stopsTag.stops[match].name));
        }
    });
    
	$(list).val(0);
}

function getArrivalTimes() {
    reset();
    var url = encodeURI("http://bustime.mta.info/api/siri/stop-monitoring.json?key=2831577d-91f0-41b5-a3e3-a562be3e8967&OperatorRef=MTA&MonitoringRef=" + $("#MainMobileContent_stopList").val() + "&LineRef=" + $("#MainMobileContent_routeList").val());
	$.get(url, function(data) {  processPredictions(data); });       
    $("span").remove();
    $(".dropList").select2();
}

function processPredictions(xml)
{
        var outputContainer = $('.js-next-bus-results');
		var predsTag = xml.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
        var results = '<table id="tblResults" cellpadding="0" cellspacing="0">'
        document.getElementById('btnSave').style.visibility = "visible";

		if(predsTag != null)
		{
		    results = results.concat('<tr class="header"><th>DESTINATION</th><th>ARRIVAL</th></tr><tr><td class="spacer" colspan="2"></td></tr>');
			for(var i=0; i<predsTag.length;i++)
			{
			    if (predsTag[i] != null && predsTag[i].MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime != null)
                    {
                        var arrival = new Date(predsTag[i].MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime);
                        var arrivalTime = arrival - Date.now();
                        arrivalTime = Math.floor(((arrivalTime % 86400000) % 3600000) / 60000);
                        if (arrivalTime <= 0)
                            arrivalTime = 'Due';       
                        var destination = predsTag[i].MonitoredVehicleJourney.PublishedLineName + " - " + predsTag[i].MonitoredVehicleJourney.DestinationName;
			            results = results.concat('<tr class="predictions">');
			            results = results.concat('<td style="word-wrap: break-word;">' + destination + '</td>' + '<td>' + arrivalTime + ' </td>');
			            results = results.concat('</tr><tr><td class="spacer" colspan="2"></td></tr>')
                    }
                else
                    {
                        var schedDeparture = new Date(predsTag[i].MonitoredVehicleJourney.OriginAimedDepartureTime).toLocaleTimeString();
                        var destination = predsTag[i].MonitoredVehicleJourney.PublishedLineName + " - " + predsTag[i].MonitoredVehicleJourney.DestinationName;
			            results = results.concat('<tr class="predictions">');
			            results = results.concat('<td style="word-wrap: break-word;">' + destination + '</td>' + '<td>' + predsTag[i].MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.PresentableDistance + ' (Departs Terminal at ' + schedDeparture + ' )' + ' </td>');
			            results = results.concat('</tr><tr><td class="spacer" colspan="2"></td></tr>')
                    }
            }
		}
        else
        {
            results = results.concat('<tr><td style="word-wrap: break-word;">No upcoming arrivals</td></tr>');
        }
        results = results + "</table>";
        $(outputContainer).html(results).show();
}


function displayError(error) {
}

function reset() {
    $('.js-next-bus-results').html('').hide(); // reset output container's html
    document.getElementById('btnSave').style.visibility = "hidden";
    $("#message").text('');         
}

function saveFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var newFave = $('#MainMobileContent_routeList option:selected').val() + ">" + $("#MainMobileContent_directionList option:selected").val() + ">" + $("#MainMobileContent_stopList option:selected").val() + "~" + $('#MainMobileContent_routeList option:selected').text() + " > " + $("#MainMobileContent_directionList option:selected").text() + " > " + $("#MainMobileContent_stopList option:selected").text();
        if (favStop == null)
        {
            favStop = newFave;
        }   
        else if(favStop.indexOf(newFave) == -1)
        {
            favStop = favStop + "|" + newFave;               
        }
        else
        {
            $("#message").text('Stop is already favorited!!');
            return;
        }
        localStorage.setItem("Favorites", favStop);
        $("#message").text('Stop added to favorites!!');
}