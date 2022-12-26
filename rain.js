
const TILE_SIZE = 2048;

//layer ids found here:  https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/?f=json
//i assume they're volatile?
const LAYER_ID_MAP =  {'1': 19, '3': 27};

function setupRain() {
	map.on('style.load', (e) => {
		addRainButtons();
	});
	map.on('load', (e) => {
		addRainButtons();
	});
}

function addRainButtons() {
	for(var days in LAYER_ID_MAP) {
		addRainButton(days);
	}
}

function addRainButton(days) {
	var layerId = LAYER_ID_MAP[days];

	addLayerButton({
		"id": `rain-history-${days}`,
		"name": `rain ${days}d`,
		"active": false,
		"type": "raster",
		"layout": {"visibility": "visible"},
		"paint": {"raster-opacity": 0.5},
		"beforeId": "rain-anchor",
		"source": {
			"type": "raster",
			"tileSize": TILE_SIZE,
			"tiles" : [
				`https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/export?bbox={bbox-epsg-3857}&size=${TILE_SIZE/4},${TILE_SIZE/4}&dpi=96&format=png8&transparent=true&bboxSR=3857&imageSR=3857&layers=show:${layerId}&f=image`
			],
		},
	});
}

