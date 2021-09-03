#!/bin/bash

set -e #exit on failure

maplibreVersion=1.15.2
maplibreUrl=https://github.com/maplibre/maplibre-gl-js/releases/download/v$maplibreVersion/dist.zip
geocoderUrl=https://github.com/Joxit/pelias-mapbox-gl-js/archive/refs/heads/master.zip

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

wget --output-document=style.json "$base/style.json"

sed --in-place --expression="s#$base#https://cyclemap.us/sprite#g" style.json
cp style.json style-normal.json
sed --expression='s/hsl(25, 60%, 45%)/red/2' style.json >style-red.json
sed --expression='s/hsl(120, 60%, 30%)/white/g' --expression='s/hsl(25, 60%, 45%)/white/1' --expression='s/hsl(25, 60%, 45%)/red/' style.json >style-highlight.json

mkdir --parents sprite

for filename in sprite{,@2x}.{png,json}; do
	wget --output-document=sprite/$filename "$base/$filename"
done


wget --output-document=js.cookie.min.js https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js

