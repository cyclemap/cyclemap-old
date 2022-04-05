#!/bin/bash

set -e #exit on failure


maplibreVersion=1.15.2
jsCookieVersion=2
geocoderVersion=master


maplibreUrl=https://github.com/maplibre/maplibre-gl-js/releases/download/v$maplibreVersion/dist.zip
geocoderUrl=https://github.com/Joxit/pelias-mapbox-gl-js/archive/refs/heads/$geocoderVersion.zip

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

base='https://tileserver.cyclemap.us/styles/maptiler-cyclemap'

curl --output style.json "$base/style.json"

sed --in-place --expression="s#$base#https://cyclemap.us/sprite#g" style.json
cp style.json style-normal.json
sed --expression='s/hsl(25, 60%, 45%)/red/2' style.json >style-red.json
sed --expression='s/hsl(120, 60%, 30%)/white/g' --expression='s/hsl(25, 60%, 45%)/white/1' --expression='s/hsl(25, 60%, 45%)/red/' style.json >style-highlight.json

mkdir --parents sprite

for filename in sprite{,@2x}.{png,json}; do
	curl --output sprite/$filename "$base/$filename"
done


curl --output js.cookie.min.js https://cdn.jsdelivr.net/npm/js-cookie@$jsCookieVersion/src/js.cookie.min.js

