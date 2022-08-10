System.register("main", ["maplibre-gl", "js-cookie"], function (exports_1, context_1) {
    "use strict";
    var maplibre_gl_1, js_cookie_1, HIGH_ZOOM, DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_ZOOM, COOKIE_OPTIONS, MapControl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (maplibre_gl_1_1) {
                maplibre_gl_1 = maplibre_gl_1_1;
            },
            function (js_cookie_1_1) {
                js_cookie_1 = js_cookie_1_1;
            }
        ],
        execute: function () {
            HIGH_ZOOM = 12;
            DEFAULT_LATITUDE = 40;
            DEFAULT_LONGITUDE = -96;
            DEFAULT_ZOOM = 5;
            COOKIE_OPTIONS = { expires: 182 };
            MapControl = class MapControl {
                query = new URLSearchParams(window.location.search);
                map = this.setupMap();
                savePointUrl = null;
                constructor() {
                    this.addMoveListener();
                    this.addClickListeners();
                }
                getStyle() {
                    var styleRoot = '';
                    var cookieStyle = js_cookie_1.Cookies.get('style') || null;
                    var style = this.query.has('style') ? `style-${this.query.get('style')}.json` : cookieStyle;
                    if (style != null) {
                        js_cookie_1.Cookies.set('style', style, COOKIE_OPTIONS);
                    }
                    return styleRoot + (style != null ? style : 'style.json');
                }
                setupMap() {
                    var latitude = js_cookie_1.Cookies.get('latitude') || DEFAULT_LATITUDE;
                    var longitude = js_cookie_1.Cookies.get('longitude') || DEFAULT_LONGITUDE;
                    var zoom = js_cookie_1.Cookies.get('zoom') || DEFAULT_ZOOM;
                    var map = new maplibre_gl_1.Map({
                        container: 'map',
                        style: this.getStyle(),
                        center: new maplibre_gl_1.LngLat(longitude, latitude),
                        zoom: zoom,
                        hash: true,
                        failIfMajorPerformanceCaveat: true,
                        dragRotate: false
                    });
                    map.addControl(new maplibre_gl_1.NavigationControl({}));
                    map.addControl(new maplibre_gl_1.ScaleControl({}));
                    map.addControl(new maplibre_gl_1.GeolocateControl({
                        positionOptions: { enableHighAccuracy: true },
                        trackUserLocation: true
                    }));
                    return map;
                }
                addMoveListener() {
                    this.map.on('moveend', checkMove);
                    checkMove();
                    function checkMove() {
                        if (this.map.isMoving()) {
                            return;
                        }
                        var latitude = this.map.getCenter().lat, longitude = this.map.getCenter().lng, zoom = this.map.getZoom();
                        js_cookie_1.Cookies.set('latitude', latitude, COOKIE_OPTIONS);
                        js_cookie_1.Cookies.set('longitude', longitude, COOKIE_OPTIONS);
                        js_cookie_1.Cookies.set('zoom', zoom, COOKIE_OPTIONS);
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
                        if (e.originalEvent.shiftKey) {
                            alert(`point:  ${this.pointToString(e.lngLat, 4)}`);
                        }
                    });
                }
                pointToString(point, accuracy = 6) { return `${point.lat.toFixed(accuracy)},${point.lng.toFixed(accuracy)}`; }
                reversedPointToString(point, accuracy = 6) { return `${point.lng.toFixed(accuracy)},${point.lat.toFixed(accuracy)}`; }
            };
        }
    };
});
//# sourceMappingURL=cyclemap.js.map