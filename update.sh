#!/bin/bash

set -e #exit on failure


maplibreVersion=3.0.0-pre.7
jsCookieVersion=3.0.1
geocoderVersion=master
vectorTextProtocolVersion=master


maplibreUrl=https://github.com/maplibre/maplibre-gl-js/releases/download/v$maplibreVersion/dist.zip
geocoderUrl=https://github.com/Joxit/pelias-mapbox-gl-js/archive/refs/heads/$geocoderVersion.zip
vectorTextProtocol=https://github.com/jimmyrocks/maplibre-gl-vector-text-protocol/archive/refs/heads/$vectorTextProtocolVersion.zip
base='https://tileserver.cyclemap.us/styles/maptiler-cyclemap'

curl --output style.json "$base/style.json"

sed --in-place --expression="s#$base#https://cyclemap.us/sprite#g" style.json
cp style.json style-normal.json
sed --expression='s/hsl(25, 60%, 45%)/red/2' style.json >style-red.json
sed \
	--expression='s/hsl(120, 60%, 30%)/hsl(0, 0%, 100%)/g' \
	--expression='s/hsl(25, 60%, 45%)/hsl(0, 0%, 100%)/1' \
	--expression='s/"line-color":"hsl(0, 0%, \(95\|97\|100\)%)"/&,"line-opacity":0.2/g' \
	--expression='s/"line-color":"hsl(25, 60%, 45%)","line-width":{[^{}]*}/"line-color":"red","line-width":{"base":1.1,"stops":[[9,4],[18,6]]}/' \
	style.json >style-highlight.json

mkdir --parents sprite

for filename in sprite{,@2x}.{png,json}; do
	curl --output sprite/$filename "$base/$filename"
done

curl \
	--location \
	--silent \
	"$maplibreUrl" |
bsdtar \
	--extract \
	--strip-components 1 \
	--file -

curl \
	--location \
	--silent \
	"$geocoderUrl" |
bsdtar \
	--extract \
	--strip-components 1 \
	--file - \
	'*geocoder*'

curl \
	--location \
	--silent \
	"$vectorTextProtocol" |
bsdtar \
	--extract \
	--strip-components 2 \
	--file - \
	'*/dist/*.min.js'

curl --output js.cookie.min.js --location https://github.com/js-cookie/js-cookie/releases/download/v$jsCookieVersion/js.cookie.min.js

