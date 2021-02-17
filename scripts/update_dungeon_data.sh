curl https://f000.backblazeb2.com/file/ilmina/extract/api/download_dungeon_data.json -o download_dungeon_data.json
node parseDungeonData.js
cp dungeonData.json ../src/app/data
rm download_dungeon_data.json
rm dungeonData.json