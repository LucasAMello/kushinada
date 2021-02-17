cd ../../PADDashFormation
git pull
cd ../kushinada/scripts
node parseCardData.js
cp cardData.json ../src/app/data
cp ../../PADDashFormation/images/cards_en/* ../src/assets/images/cards_en
rm cardData.json