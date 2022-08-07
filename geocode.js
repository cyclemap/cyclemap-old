
function addGeocode(map) {
	map.addControl(new PeliasGeocoder({
		params: {
			'api_key': openrouteAccessToken,
			'boundary.country': 'us,ca,mx',
		},
		marker: {icon: 'marker_11', anchor: 'bottom'},
		flyTo: 'hybrid',
		removeDuplicates: true,
		url: 'https://api.openrouteservice.org/geocode',
		useFocusPoint: true
	}));
}

