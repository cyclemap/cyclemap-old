#!/bin/bash

set -e #exit on failure


base=https://api.mapbox.com/mapbox-gl-js/v1.9.1

for filename in mapbox-gl.css mapbox-gl.js; do
	wget --output-document=$filename "$base/$filename"
done


base='https://tileserver.cyclemap.us/styles/klokantech-basic-cycle'

wget --output-document=style.json "$base/style.json"

sed --in-place --expression="s#$base#https://cyclemap.us/sprite#g" style.json
cp style.json style-normal.json
cp style.json style-red.json
sed --in-place --expression="s/hsl(25, 60%, 45%)/red/2" style-red.json
cp style.json style-highlight.json
sed --in-place --expression="s/hsl(120, 60%, 30%)/white/g" --expression="s/hsl(25, 60%, 45%)/white/1" --expression="s/hsl(25, 60%, 45%)/red/" style-highlight.json

mkdir --parents sprite

for filename in sprite{,@2x}.{png,json}; do
	wget --output-document=sprite/$filename "$base/$filename"
done


wget --output-document=js.cookie.min.js https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js

