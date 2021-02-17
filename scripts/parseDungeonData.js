'use strict';

try {
	const fs = require('fs');

	let rawdata = fs.readFileSync('download_dungeon_data.json');
	let json = JSON.parse(rawdata);
	let values = json.dungeons.split('\n');
	let dungeonName = '';
	let dungeonId = 0;
	let data = [];
	values.forEach(v => {
		let attrs = v.split(',');
		if (v[0] == 'd') {
            dungeonId = parseInt(attrs[0].substr(2));
            dungeonName = attrs[1].trim();
            while (dungeonName.indexOf('$') != -1) {
                dungeonName = dungeonName.substr(dungeonName.indexOf('$') + 1);
            }
            while (dungeonName.indexOf('#') != -1) {
                dungeonName = dungeonName.substr(dungeonName.indexOf('#') + 1);
            }
		} else if (v[0] == 'f') {
            let floorId = parseInt(attrs[0].substr(2));
            let floorName = attrs[1].trim();
            while (floorName.indexOf('$') != -1) {
                floorName = floorName.substr(floorName.indexOf('$') + 1);
            }
            while (floorName.indexOf('#') != -1) {
                floorName = floorName.substr(floorName.indexOf('#') + 1);
            }
            data.push({ id: dungeonId + '-' + floorId, name: dungeonName + ' - ' + floorName });
		}
	});

	let str = JSON.stringify(data);
	fs.writeFileSync('dungeonData.json', str);
} catch (e) {
	console.log(e);
}