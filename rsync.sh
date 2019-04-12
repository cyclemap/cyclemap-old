#!/bin/bash

set -e #exit on failure

base=https://cdn.klokantech.com/mapbox-gl-js/v0.53.0

for filename in mapbox-gl.css mapbox-gl.js; do
	wget --output-document=$filename "$base/$filename"
done

wget --output-document=style.json https://tileserver.cyclemap.us/styles/klokantech-basic-cycle/style.json

wget --output-document=js.cookie.min.js https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
