'use strict';

try {
	const fs = require('fs');

	let rawdata = fs.readFileSync('../../PADDashFormation/monsters-info/official-API/en-card.json');
	let json = JSON.parse(rawdata);
	let data = json.card.filter(c => c[0] < 9999).map(data => {
		let card = this;
		card.attrs=[];
		card.types=[];
		let i = 0;
		function readCurve() {
			return {
				min: data[i++],
				max: data[i++],
				scale: data[i++],
			};
		}
		card.id = data[i++]; //ID
		card.name = data[i++]; //名字
		card.attrs.push(data[i++]); //属性1
		card.attrs.push(data[i++]); //属性2
		card.isUltEvo = data[i++] !== 0; //是否究极进化
		card.types.push(data[i++]); //类型1
		card.types.push(data[i++]); //类型2
		card.rarity = data[i++]; //星级
		card.cost = data[i++]; //cost
		card.unk01 = data[i++]; //未知01
		card.maxLevel = data[i++]; //最大等级
		card.feedExp = data[i++]; //1级喂食经验，需要除以4
		card.isEmpty = data[i++] === 1; //空卡片？
		card.sellPrice = data[i++]; //1级卖钱，需要除以10
		card.hp = readCurve(); //HP增长
		card.atk = readCurve(); //攻击增长
		card.rcv = readCurve(); //回复增长
		card.exp = { min: 0, max: data[i++], scale: data[i++] }; //经验增长
		card.activeSkillId = data[i++]; //主动技
		card.leaderSkillId = data[i++]; //队长技
		card.enemy = { //作为怪物的数值
			countdown: data[i++],
			hp: readCurve(),
			atk: readCurve(),
			def: readCurve(),
			maxLevel: data[i++],
			coin: data[i++],
			exp: data[i++]
		};
		card.evoBaseId = data[i++]; //进化基础ID
		card.evoMaterials = [data[i++], data[i++], data[i++], data[i++], data[i++]]; //进化素材
		card.unevoMaterials = [data[i++], data[i++], data[i++], data[i++], data[i++]]; //退化素材
		card.unk02 = data[i++]; //未知02
		card.unk03 = data[i++]; //未知03
		card.unk04 = data[i++]; //未知04
		card.unk05 = data[i++]; //未知05
		card.unk06 = data[i++]; //未知06
		card.unk07 = data[i++]; //未知07
		const numSkills = data[i++]; //几种敌人技能
		card.enemy.skills = Array.from(new Array(numSkills)).map(() => ({
			id: data[i++],
			ai: data[i++],
			rnd: data[i++]
		}));
		const numAwakening = data[i++]; //觉醒个数
		card.awakenings = Array.from(new Array(numAwakening)).map(() => data[i++]);
		const sAwakeningStr = data[i++];
		card.evoRootId = data[i++]; //进化链根ID
		card.seriesId = data[i++]; //系列ID
		card.types.push(data[i++]); //类型3
		card.sellMP = data[i++]; //卖多少MP
		card.latentAwakeningId = data[i++]; //潜在觉醒ID
		card.collabId = data[i++]; //合作ID
		const flags = data[i++]; //一个旗子？
		card.altName = data[i++].split("|").filter(str=>str.length); //替换名字（分类标签）
		card.limitBreakIncr = data[i++]; //110级增长
		card.voiceId = data[i++]; //语音觉醒的ID
		card.blockSkinId = data[i++]; //珠子皮肤ID
		card.specialAttribute = data[i++]; //特别属性，比如黄龙
		
		if (card.specialAttribute) {
			const transform = card.specialAttribute.substr(5);
			return [card.id, card.name, card.attrs[0], card.attrs[1], sAwakeningStr, +transform];
		}
		
		return [card.id, card.name, card.attrs[0], card.attrs[1], sAwakeningStr];
	});
	let str = JSON.stringify(data);
	fs.writeFileSync('cardData.json', str);
} catch (e) {
	console.log(e);
}