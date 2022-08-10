
// i had to do this because i couldn't get the browser to accept a module with maplibregl

//these imports weren't working:
//import * as maplibregl from 'maplibre-gl'; //typescript liked it but browser said "Uncaught TypeError: maplibregl.Map is not a constructor" for the "new maplibregl.Map(...)" below
import { Map } from 'maplibre-gl'; //typescript liked it but browser said "Uncaught SyntaxError: The requested module 'maplibre-gl' does not provide an export named 'Map'"
import Cookies from 'js-cookie';

const HIGH_ZOOM: number = 12;
const DEFAULT_LATITUDE = 40;
const DEFAULT_LONGITUDE = -96;
const DEFAULT_ZOOM = 5;

const COOKIE_OPTIONS = { expires: 182 };


class MapControl {
	query = new URLSearchParams(window.location.search);

	map: Map = this.setupMap();

	savePointUrl : string = null;

	constructor() {
		this.addMoveListener();
		this.addClickListeners();
		/*
		checkAddGeoJsonLayer();
		checkAddLayers();
		setupLayers();
		setupSavePoint();
		setupRoute();
		setupRain();
		*/
	}

	getStyle() {
		var styleRoot = '';
		var cookieStyle = Cookies.get('style') || null;
		var style = this.query.has('style') ? `style-${this.query.get('style')}.json` : cookieStyle;

		
		if(style != null) {
			Cookies.set('style', style, COOKIE_OPTIONS);
		}

		return styleRoot + (style != null ? style : 'style.json');
	}

	setupMap() {
		console.log('test1');
		var latitude = Cookies.get('latitude') || DEFAULT_LATITUDE;
		var longitude = Cookies.get('longitude') || DEFAULT_LONGITUDE;
		var zoom = Cookies.get('zoom') || DEFAULT_ZOOM;

			//center: new maplibregl.LngLat(longitude, latitude),
		var map = new Map({
			container: 'map',
			style: this.getStyle(),
			zoom: zoom,
			hash: true,
			failIfMajorPerformanceCaveat: true,
			dragRotate: false
		});
		/*
		map.addControl(new maplibregl.NavigationControl({}));
		map.addControl(new maplibregl.ScaleControl({}));
		map.addControl(new maplibregl.GeolocateControl({
			positionOptions: {enableHighAccuracy: true},
			trackUserLocation: true
		}));
		*/
		return map;
	}

	addMoveListener() {
		this.map.on('moveend', checkMove);
		checkMove();
		function checkMove() {
			if(this.map.isMoving()) {
				return;
			}
			var latitude = this.map.getCenter().lat, longitude = this.map.getCenter().lng, zoom = this.map.getZoom();

			Cookies.set('latitude', latitude, COOKIE_OPTIONS);
			Cookies.set('longitude', longitude, COOKIE_OPTIONS);
			Cookies.set('zoom', zoom, COOKIE_OPTIONS);
		}
		
		this.map.on('zoom', checkZoom);
		checkZoom();
		function checkZoom() {
			var highZoomEnabled = this.map.getZoom() >= HIGH_ZOOM;
			document.getElementById('footLegend').style.opacity = highZoomEnabled ? '1' : '0';
		}
	}

	addClickListeners() {
		this.map.on('mouseup', (e) => {
			if(e.originalEvent.shiftKey) {
				alert(`point:  ${this.pointToString(e.lngLat, 4)}`);
			}
		});
	}

	pointToString(point, accuracy = 6) {return `${point.lat.toFixed(accuracy)},${point.lng.toFixed(accuracy)}`;}
	reversedPointToString(point, accuracy = 6) {return `${point.lng.toFixed(accuracy)},${point.lat.toFixed(accuracy)}`;}

}

console.log('test0');
new MapControl();

