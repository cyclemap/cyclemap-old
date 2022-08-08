
const RAIN_LOAD_DELAY = 1500;

//layer ids found here:  https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/?f=json
//i assume they're volatile?
const LAYER_ID_MAP =  {'1': 23, '3': 27};

function setupRain() {
	map.on('style.load', (e) => {
		addRainButtons();
	});
	map.on('load', (e) => {
		addRainButtons();
	});
	addRainListener();
}

function addRainListener() {
	let rainTimeout = null;
	let clearRainTimeout = () => clearTimeout(rainTimeout);

	map.on('moveend', (e) => {
		clearRainTimeout();
		if(map.isMoving()) {
			return;
		}
		rainTimeout = setTimeout(fireRain, RAIN_LOAD_DELAY);
	});
	map.on('touchmove', clearRainTimeout);
	map.on('pointerdrag', clearRainTimeout);
	map.on('pointermove', clearRainTimeout);
}

function fireRain() {
	for(var days in LAYER_ID_MAP) {
		var id = `rain-history-${days}`;
		if(map.getLayer(id) != null) {
			map.getSource(id).updateImage(getRainOptions(days));
		}
	}
}

function getSize() {
	var canvas = map.getCanvas();
	var aspectRatio = canvas.width / canvas.height;
	var height = 800;
	var width = Math.round(height * aspectRatio);
	return [width, height];
}

function getRainOptions(days) {
	var layerId = LAYER_ID_MAP[days];

	return {
		"type": "image",
		"url" : `https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/export?bbox=${boundsToArray(map.getBounds()).join(',')}&size=${getSize().join(',')}&dpi=96&format=png8&transparent=true&bboxSR=4326&imageSR=3857&layers=show:${layerId}&f=image`,
		"coordinates": boundsToCorners(map.getBounds()),
	};
}

function addRainButtons() {
	addLayerButton({
		"id": "rain-history-3",
		"name": "rain 3d",
		"active": false,
		"type": "raster",
		"layout": {"visibility": "visible"},
		"paint": {"raster-opacity": 0.5},
		"beforeId": "satellite-anchor",
		"onAddLayer": onAddRainLayer,
	});
	addLayerButton({
		"id": "rain-history-1",
		"name": "rain 1d",
		"active": false,
		"type": "raster",
		"layout": {"visibility": "visible"},
		"paint": {"raster-opacity": 0.5},
		"beforeId": "satellite-anchor",
		"onAddLayer": onAddRainLayer,
	});
}

function onAddRainLayer(layer) {
	var id = layer['id'];
	if(map.getSource(id) == null) {
		layer['source']=getRainOptions(parseInt(id.substr(-1)));
	}
	else {
		map.getSource(id).updateImage(getRainOptions(id.substr(-1)));
	}
}

function boundsToArray(bounds) {
	var output = bounds.toArray();
	return output[0].concat(output[1]);
}

function boundsToCorners(bounds) {
	return [bounds.getNorthWest().toArray(), bounds.getNorthEast().toArray(), bounds.getSouthEast().toArray(), bounds.getSouthWest().toArray()];
}


