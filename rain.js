
const TILE_SIZE = 2048;

//layer ids found here:  curl https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/?f=json |jq .
//also found here     :  curl https://mapservices.weather.noaa.gov/raster/rest/services/obs/rfc_qpe/MapServer/?f=json |jq .

//const RAIN_PATH = 'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/export'; const LAYER_ID_MAP =  {'1d': 19, '3d': 27};
const RAIN_PATH = 'https://mapservices.weather.noaa.gov/raster/rest/services/obs/rfc_qpe/MapServer/export'; const LAYER_ID_MAP =  {'1d': 25+3, '3d': 37+3, '7d': 53+3};

//5 day and 7 day can be found here:  https://www.wpc.ncep.noaa.gov/qpf/p120i.gif  https://www.wpc.ncep.noaa.gov/qpf/p168i.gif

function setupRain() {
	map.on('style.load', (e) => {
		addRainButtons();
	});
	map.on('load', (e) => {
		addRainButtons();
	});
}

function addRainButtons() {
	for(var key in LAYER_ID_MAP) {
		addRainButton(key);
	}
}

function addRainButton(key) {
	var layerId = LAYER_ID_MAP[key];

	addLayerButton({
		"id": `rain-history-${key}`,
		"name": `rain ${key}`,
		"active": false,
		"type": "raster",
		"layout": {"visibility": "visible"},
		"paint": {"raster-opacity": 0.5},
		"beforeId": "rain-anchor",
		"source": {
			"type": "raster",
			"tileSize": TILE_SIZE,
			"tiles" : [
				`${RAIN_PATH}?bbox={bbox-epsg-3857}&size=${TILE_SIZE/4},${TILE_SIZE/4}&dpi=96&format=png8&transparent=true&bboxSR=3857&imageSR=3857&layers=show:${layerId}&f=image`
			],
		},
	});
}

