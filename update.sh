#!/bin/bash

set -e #exit on failure

#move from mapbox-gl-js -> maplibre-gl-js
#https://github.com/maplibre/maplibre-gl-js/projects/1
#https://github.com/maplibre/maplibre-gl-js/releases/ (nothing here yet)

base=https://api.mapbox.com/mapbox-gl-js/v1.13.0

for filename in mapbox-gl.css mapbox-gl.js; do
	wget --output-document=$filename "$base/$filename"
done


base='https://tileserver.cyclemap.us/styles/klokantech-basic-cycle'

cp ../../conf/viewer/viewer.tmpl index.html
sed --in-place \
	--expression 's#{{public_url}}viewer/##g' \
	--expression 's#{{public_url}}##g' \
	--expression 's#styles/klokantech-basic-cycle/##g' \
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

