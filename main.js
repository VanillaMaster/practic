// @ts-nocheck
const {google} = require('googleapis');
const key = require("./serviceaccountKey.json");
const sheets = google.sheets('v4');

const Table = require("./table");

//=========
const ID = '1bs4h6KIrePNFIzjrv2mUkL1GB7ycBh0TMUOHtrqjfr4'; //TODO: change to datrget sheet



async function main() {
	let table = new Table(ID);
	console.time('auth in');
	await table.authorize(key);	
	console.timeEnd('auth in');

	//console.time('get Client in');
	//console.log(await table.getClientById(1844));
	//console.timeEnd('get Client in');

	table.getClientById(2112).then(client=>{console.log(`2112:${client.getRow()}`);});
	//table.getClientById(1845).then(id=>{console.log(`1845:${id}`);});
	//table.getClientById(1846).then(id=>{console.log(`1846:${id}`);});
 	//table.getClientById(1847).then(id=>{console.log(`1847:${id}`);});
	
}

main();

