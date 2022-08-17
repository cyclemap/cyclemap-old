
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
	addAnimation();
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
		"beforeId": "satellite-anchor",
		"source": {
			"type": "raster",
			"tileSize": TILE_SIZE,
			"tiles" : [
				`https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/export?bbox={bbox-epsg-3857}&size=${TILE_SIZE/4},${TILE_SIZE/4}&dpi=96&format=png8&transparent=true&bboxSR=3857&imageSR=3857&layers=show:${layerId}&f=image`
			],
		},
	});
}

const frameCount = 100;
let currentImage = 0;

function getPath() {
	return `https://aporter.org/map/ride/ride-${currentImage.toString().padStart(2, '0')}.png`;
}

function addAnimation() {
	const center=[38.88, -77.14], size=.10;
	const bounds = new maplibregl.LngLatBounds(
		new maplibregl.LngLat(center[1]-size, center[0]-size),
		new maplibregl.LngLat(center[1]+size, center[0]+size)
	);
	addLayerButton({
		"id": 'animation',
		"name": 'anim',
		"active": false,
		"type": "raster",
		"layout": {"visibility": "visible"},
		"paint": {"raster-opacity": 0.8},
		"source": {
			"type": "image",
			"url" : getPath(),
			"coordinates": [bounds.getNorthWest().toArray(), bounds.getNorthEast().toArray(), bounds.getSouthEast().toArray(), bounds.getSouthWest().toArray()],
		},
		"onAddLayer": addAnimationLayer,
	});
}

let animationInterval = null;

function addAnimationLayer(layer) {
	console.log('creating interval');
	if(animationInterval != null) {
		console.log('killing interval');
		clearInterval(animationInterval);
	}
	//NO!  this will spin even when layer is disabled
	animationInterval = setInterval(() => {
		if(map.getLayer('animation') != null && map.getSource('animation') != null) {
			currentImage = (currentImage + 1) % frameCount;
			console.log('updating image', getPath());
			map.getSource('animation').updateImage({ url: getPath() });
		}
	}, 500);
}

