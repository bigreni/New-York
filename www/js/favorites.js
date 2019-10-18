function loadFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    var arrStops = null;
    var arrIds;
    var text = "";
    for (i = 0; i < arrFaves.length; i++) 
    {
        arrStops = arrFaves[i].split("~");
        arrIds = arrStops[0].split(">");
        text = '<li><button onclick=removeFavorite(' + i + '); style="background-color:red; border:none;float:right;">&#x2718;</button><a href="javascript:loadArrivals(' + "'" + arrIds[0].trim() + "','" + arrIds[2] + "','" + arrStops[1].trim() + "'"  +')"; class="langOption"><h4 class="selectLanguage">' + arrStops[1] + '</h4></a></li>';
	    $("#lstFaves").append(text);
    }
}



function removeFavorite(index)
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    if(arrFaves.length > 1)
    {
        arrFaves.splice(index, 1);
        var faves = arrFaves.join("|");
        localStorage.setItem("Favorites", faves);
    }
    else
    {
        localStorage.removeItem("Favorites");
    }
    location.reload();
}

function loadArrivals(route, stop, text) {
    var url = encodeURI("https://bustime.mta.info/api/siri/stop-monitoring.json?key=2831577d-91f0-41b5-a3e3-a562be3e8967&OperatorRef=MTA&MonitoringRef=" + stop + "&LineRef=" + route);
	$.get(url, function(data) {  processPredictions(data, text); });    
}

function processPredictions(xml, text)
{
        var outputContainer = $('.js-next-bus-results');
		var predsTag = xml.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
        var results = '<p><strong>' + text +'</strong></p><table id="tblResults" cellpadding="0" cellspacing="0">'

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
