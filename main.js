// @ts-nocheck
const key = require("./serviceaccountKey.json");
const Table = require("./table");
const ID = '1bs4h6KIrePNFIzjrv2mUkL1GB7ycBh0TMUOHtrqjfr4'; //TODO: change to datrget sheet



async function main() {
	let table = new Table(ID);
	await table.authorize(key);	

	table.getClientById(1845).then(id=>{console.log(id);});
	
}

main();

