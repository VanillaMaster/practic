// @ts-nocheck
const key = require("./serviceaccountKey.json");
const Table = require("./table");
const ID = '1bs4h6KIrePNFIzjrv2mUkL1GB7ycBh0TMUOHtrqjfr4'; //TODO: change to datrget sheet



async function main() {
	let table = new Table(ID);
	await table.authorize(key);	

	let Leomik = await table.getClientById(2);
	Leomik.data.independent.sendOzonMsg.setValue(true);
	Leomik.save();
	console.log("saved");
	
}

main();

