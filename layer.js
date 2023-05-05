
const mapboxAccessToken = 'pk.eyJ1IjoiY3ljbGVtYXB1cyIsImEiOiJjanNhbHRlaGMwMGp2NDNqeG80Mzk2cmExIn0.0OBPtvf3KANeaA6QOCk1yw';
const DEFAULT_GEOJSON_TYPE = 'line';


function getLayers() {
	var cookieLayers = Cookies.get('layers') || null;
	var layers = query.has('layers') ? query.get('layers') : cookieLayers;
	
	if(layers != null) {
		Cookies.set('layers', layers, cookieOptions);
	}

	return layers;
}

function setupLayers() {
	var destination = document.getElementsByClassName('maplibregl-ctrl-top-right')[0];
	destination.append(document.getElementById('clearLayers'));
	destination.append(document.getElementById('layerPicker'));

	if(mapboxAccessToken != null) {
		map.on('style.load', (e) => {
			addSatelliteButton();
		});
		map.on('load', (e) => {
			addSatelliteButton();
		});
	}

	document.getElementById('clearLayers').onclick = (event) => {
		var layerPicker = document.getElementById('layerPicker');
		var layerButtons = layerPicker.getElementsByTagName('button');
		Array.prototype.forEach.call(layerButtons, (input) => {
			var id = input.id;
			for(layer of globalLayers) {
				if(layer['id'] === id) {
					removeLayer(layer);
					input.classList.remove('active');
					break;
				}
			}
		});
	};
}

function addSatelliteButton() {
	addLayerButton({
		"id": "satellite-raster",
		"name": "sat",
		"active": false,
		"type": "raster",
		"source": {"type": "raster", "tiles": [`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`]},
		"layout": {"visibility": "visible"},
		"beforeId": "satellite-anchor",
	});
}

function addLayerHelper(id, type, data) {
	addLayerButton({"id": id, "type": type, "source": {"type": "geojson", "data": data}, "active": true});
}

function checkAddGeoJsonLayer() {
	var geoJsonData = query.get('geo'), type = query.get('type') != null ? query.get('type') : DEFAULT_GEOJSON_TYPE;
	if(geoJsonData === null) {
		return;
	}
	map.on('style.load', () => addLayerHelper('geoJsonData', type, geoJsonData));
}

function addLayerButtons(layers) {
	for(var layer of layers) {
		addLayerButton(layer);
	}
}

function addToGlobalLayers(layer) {
	if(!globalLayers.some(check => check['id'] === layer['id'])) {
		globalLayers.push(layer);
	}
}

function addLayerButton(layer) {
	var layerPicker = document.getElementById('layerPicker');
	var button = document.createElement('button');
	var classList = button.classList;
	var id = layer['id'];

	if(document.getElementById(id) != null) {
		return;
	}
	
	addToGlobalLayers(layer);

	button.setAttribute('id', id);
	button.setAttribute('class', 'maplibregl-ctrl maplibregl-ctrl-group');
	if(layer['active'] !== undefined && layer['active'] === true) {
		classList.add('active');
		addLayer(layer);
	}
	var name = layer['name'] !== undefined ? layer['name'] : id.substr(0, 4);
	button.appendChild(document.createTextNode(name));
	button.onclick = (e) => {
		var active = !classList.contains('active');
		if(active) {
			classList.add('active');
			addLayer(layer);
		}
		else {
			classList.remove('active');
			removeLayer(layer);
		}
	};
	layerPicker.appendChild(button);
	
	document.getElementById('clearLayers').style.visibility = 'visible';
}

function addLayer(layer) {
	var id = layer['id'];
	if(layer['type'] === 'directory') {
		addDirectory(layer);
		return;
	}
	if(layer['beforeId'] != null && map.getLayer(layer['beforeId']) == null) {
		layer['beforeId'] = null;
	}
	
	if(layer['onAddLayer'] !== undefined) {
		layer['onAddLayer'](layer);
	}
	if(map.getSource(id) == null) {
		map.addSource(id, layer['source']);
	}

	map.addLayer({
		...getOptions(layer['type']),
		...layer,
		'source': id,
	}, layer['beforeId']);
	

	if(layer['type'] === 'symbol') {
		map.on('click', id, function(e) {
			if(e.features[0].properties.description == null) {
				return;
			}
			var coordinates = e.features[0].geometry.coordinates;
			var description = e.features[0].properties.description;

			new maplibregl.Popup()
				.setLngLat(coordinates)
				.setHTML(description)
				.addTo(map);
		});
	}
}

function removeLayerButtons(layers) {
	for(var layer of layers) {
		removeLayerButton(layer);
	}
}

function removeLayerButton(layer) {
	removeLayer(layer);
	var id = layer['id'];
	if(map.getSource(id) != null) {
		map.removeSource(id);
	}
	if(document.getElementById(id) != null) {
		document.getElementById(id).remove();
	}
}

function removeLayer(layer) {
	if(layer['type'] === 'directory') {
		removeDirectory(layer);
		return;
	}
	var id = layer['id'];
	if(map.getLayer(id) == null) {
		return;
	}
	map.removeLayer(id);
}

function checkAddLayers() {
	var layers = getLayers();
	if(layers === null) {
		return;
	}
	ajaxGet(layers, (data) => {
		console.log('checkAddLayers has content');
		savePointUrl = data['savePointUrl'];
		map.on('style.load', (e) => {
			console.log(`${e.type}: checkAddLayers adding layers`);
			addLayerButtons(data['layers']);
		});
		map.on('load', (e) => {
			console.log(`${e.type}: checkAddLayers adding layers`);
			addLayerButtons(data['layers']);
		});
	});
}

function ajaxGet(url, callback) {
	var xhttp = new XMLHttpRequest();
	xhttp.addEventListener("load", function() {
		var returnValue = JSON.parse(this.responseText);
		if(returnValue.error) {
			if(returnValue.error.message) {
				alert(`http: ${returnValue.error.message}`);
				return;
			}
			alert(`http: ${returnValue.error}`);
			return;
		}
		callback(returnValue);
	});
	xhttp.addEventListener("error", function() {alert(`http: ${this.statusText}`);});
	xhttp.open("GET", url, true);
	xhttp.send();
}


function getOptions(type) {
	if(type == 'symbol') {
		return {'layout': {
			'icon-image': ["concat", ["coalesce", ["get", "marker-symbol"], "marker"], "_11"],
			'icon-size': 1.5,
			'text-field': '{title}',
			'icon-allow-overlap': true,
			'text-allow-overlap': true,
			'text-anchor': 'top',
			'text-font': ['Open Sans Regular'],
			'text-max-width': 9,
			'icon-offset': [0, -3],
			'text-offset': [0, .2],
			'text-padding': 2,
			'text-size': 12,
		},
		'paint': {
			'text-color': '#666',
			'text-halo-blur': 0.5,
			'text-halo-color': 'white',
			'text-halo-width': 2,
		}};
	}
	else if(type == 'line') {
		return {'layout': {
			'line-join': 'round',
		},
		'paint': {
			'line-color': '#00d',
			'line-width': {
				'base': 1.2,
				'stops': [[6, 2], [20, 20]],
			},
			'line-opacity': .4,
		}};
	}
	else if(type == 'heatmap') {
		return {
			"maxzoom": 16,
			"minzoom": 9,
			"paint": {
				"heatmap-weight":
					["*",
						["coalesce", ["get", "count"], 1],
						0.00001
					]
				,
				"heatmap-intensity": {
					"stops": [
						[9, 0.1],
						[16, 3000]
					]
				},
				"heatmap-radius": {
					"type": "exponential",
					"stops": [
						[9, 1],
						[16, 20]
					]
				},
				"heatmap-color": [
					"interpolate",
					["linear"],
					["heatmap-density"],
					0, "rgba(0,0,0,0)",
					0.1, "#103",
					0.3, "#926",
					0.4, "#f71",
					0.5, "#ffa"
				],
				"heatmap-opacity": 0.8
			}
		}
	}
	else if(type == 'raster') {
		return;
	}
	console.error('unknown type: ', type);
}

