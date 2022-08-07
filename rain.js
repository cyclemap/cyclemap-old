
function boundsToArray(bounds) {
	var output = bounds.toArray();
	return output[0].concat(output[1]);
}

function boundsToCorners(bounds) {
	return [bounds.getNorthWest().toArray(), bounds.getNorthEast().toArray(), bounds.getSouthEast().toArray(), bounds.getSouthWest().toArray()];
}

var RAIN_LOAD_DELAY = 1500;
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

function fireRain(e) {
	if(map.getLayer('rain-history') == null) {
		return;
	}
	map.getSource('rain-history').updateImage(getRainOptions());
}

function getSize() {
	var canvas = map.getCanvas();
	var aspectRatio = canvas.width / canvas.height;
	var height = 800;
	var width = Math.round(height * aspectRatio);
	return [width, height];
}

function getRainOptions() {
	return {
		"type": "image",
		"url" : `https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/export?bbox=${boundsToArray(map.getBounds()).join(',')}&size=${getSize().join(',')}&dpi=96&format=png8&transparent=true&bboxSR=4326&imageSR=3857&layers=show:27&f=image`,
		"coordinates": boundsToCorners(map.getBounds()),
	};
}

