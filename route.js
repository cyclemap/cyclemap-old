
openrouteAccessToken = '5b3ce3597851110001cf6248ba1b7964630a48d9841d1336bd6686c7';

var startPoint = null;

function setupRoute() {
	addRouteListener();
	addGeocode();
}


/**
 * long press implementation here is fairly manual
 */
function addRouteListener() {
	map.on('contextmenu', fireRoute); //right click
	
	let routeTimeout = null;
	let clearRouteTimeout = () => clearTimeout(routeTimeout);

	map.on('touchstart', (e) => {
		if(e.originalEvent.touches.length > 1) {
			return;
		}
		routeTimeout = setTimeout(() => {
			window.navigator.vibrate(100);
			setTimeout(() => fireRoute(e), 1);
		}, 500);
	});
	map.on('touchend', clearRouteTimeout);
	map.on('touchcancel', clearRouteTimeout);
	map.on('touchmove', clearRouteTimeout);
	map.on('pointerdrag', clearRouteTimeout);
	map.on('pointermove', clearRouteTimeout);
	map.on('moveend', clearRouteTimeout);
	map.on('gesturestart', clearRouteTimeout);
	map.on('gesturechange', clearRouteTimeout);
	map.on('gestureend', clearRouteTimeout);
}

function fireRoute(e) {
	if(openrouteAccessToken === null) {
		return;
	}
	
	var point = e.lngLat;
	addRoutePoint(point);
}

function addRoutePoint(point) {
	if(startPoint === null) {
		removeLayerButton('startPoint');
		removeLayerButton('endPoint');
		removeLayerButton('route');
		
		startPoint = point;
		var pointFeature = { type: 'Feature', geometry: { type: 'Point', coordinates: [point.lng, point.lat] }, properties: {'marker-symbol': 'marker', title: 'start'} };
		addLayerHelper('startPoint', 'symbol', pointFeature);
		return;
	}

	var endPoint = point;

	var query = new URLSearchParams();
	query.set('api_key', openrouteAccessToken);
	query.set('start', reversedPointToString(startPoint));
	query.set('end', reversedPointToString(endPoint));

	var url = `https://api.openrouteservice.org/v2/directions/cycling-regular?${query}`;

	ajaxGet(url, (data) => {
		//sending in url directly here doesn't work because of somesuch header (Accept: application/json) made the server mad
		addLayerHelper('route', 'line', data);
		var summary = data.features[0].properties.summary;
		var duration = (summary.duration / 3600).toFixed(1);
		var distance = (summary.distance / 1000).toFixed(0);
		var pointFeature = { type: 'Feature', geometry: { type: 'Point', coordinates: [point.lng, point.lat] }, properties: {'marker-symbol': 'marker', title: `end ${duration}h\n${distance}km`} };
		addLayerHelper('endPoint', 'symbol', pointFeature);
	});
	
	startPoint = null;
}

function pointToString(point, accuracy = 6) {return `${point.lat.toFixed(accuracy)},${point.lng.toFixed(accuracy)}`;}
function reversedPointToString(point, accuracy = 6) {return `${point.lng.toFixed(accuracy)},${point.lat.toFixed(accuracy)}`;}


function addGeocode() {
   map.addControl(new PeliasGeocoder({
       params: {
           'api_key': openrouteAccessToken,
       },
       marker: {icon: 'marker_11', anchor: 'bottom'},
       flyTo: 'hybrid',
       removeDuplicates: true,
       url: 'https://api.openrouteservice.org/geocode',
       useFocusPoint: true
   }));
}

