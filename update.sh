#!/bin/bash

set -e #exit on failure

maplibreVersion=1.13.0-rc.4
maplibreUrl=https://registry.npmjs.org/maplibre-gl/-/maplibre-gl-$maplibreVersion.tgz

curl \
	--silent \
	"$maplibreUrl" |
tar \
	--extract \
	--gzip \
	--strip-components 2 \
	package/dist/{mapbox-gl.css,mapbox-gl.js}

base='https://tileserver.cyclemap.us/styles/maptiler-cyclemap'

cp ../../conf/viewer/viewer.tmpl index.html
sed --in-place \
	--expression 's#{{public_url}}viewer/##g' \
	--expression 's#{{public_url}}##g' \
	--expression 's#styles/maptiler-cyclemap/##g' \
	--expression 's#.*tileserver only has this style##' \
	--expression 's#/sprite@2x#sprite&#' \
	index.html

wget --output-document=style.json "$base/style.json"

sed --in-place --expression="s#$base#https://cyclemap.us/sprite#g" style.json
cp style.json style-normal.json
cp style.json style-red.json
sed --in-place --expression='s/hsl(25, 60%, 45%)/red/2' --expression 's/,\["==","true","false"\]//' style-red.json
cp style.json style-highlight.json
sed --in-place --expression='s/hsl(120, 60%, 30%)/white/g' --expression='s/hsl(25, 60%, 45%)/white/1' --expression='s/hsl(25, 60%, 45%)/red/' style-highlight.json

mkdir --parents sprite

for filename in sprite{,@2x}.{png,json}; do
	wget --output-document=sprite/$filename "$base/$filename"
done


wget --output-document=js.cookie.min.js https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js

