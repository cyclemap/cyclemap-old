
function setupSavePoint() {
	addSavePointListener();
}

function addSavePointListener() {
	map.on('click', (e) => {
		if(e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
			fireSavePoint(e);
		}
	});
}

function fireSavePoint(e) {
	if(savePointUrl == null) {
		return;
	}

	var category = prompt('please enter a category', 'edited');
	if(category == null) {
		return;
	}

	var title = prompt('please enter a title', '');
	if(title == null) {
		return;
	}
	
	var query = new URLSearchParams();
	query.set('point', pointToString(e.lngLat, 4));
	query.set('category', category);
	query.set('title', title);
	var url = `${savePointUrl}?${query}`;

	ajaxGet(url, (data) => {
		alert(data.msg);
	});
}

