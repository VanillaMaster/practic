// @ts-nocheck
const {google} = require('googleapis');
const key = require("./serviceaccountKey.json");
const sheets = google.sheets('v4');

const Table = require("./table");
const APIWrapper = require("./googleApiWrapper");

//=========
const ID = '1bs4h6KIrePNFIzjrv2mUkL1GB7ycBh0TMUOHtrqjfr4'; //TODO: change to datrget sheet



async function main() {
	//let table = new Table(ID);
	//console.time('auth in');
	//await table.authorize(key);	
	//console.timeEnd('auth in');

	//console.time('get Client in');
	//console.log(await table.getClientById(1844));
	//console.timeEnd('get Client in');

	let a = new APIWrapper(key);
	a.authorize();

	//a.get(ID,"API_search!E7").then(data=>{console.log(data);});
	//a.get(ID,"API_search!E8").then(data=>{console.log(data);});
	//a.set()


	for(let i = 0; i<6; i++){
		a.set(ID,"API_search!E8",[[`data:${i}`]]).then(data=>{console.log(data);});
		a.get(ID,"API_search!E8").then(data=>{console.log(data);});
	}


	//table.getClientById(1845).then(id=>{console.log(`1845:${id}`);});
	//table.getClientById(1846).then(id=>{console.log(`1846:${id}`);});
 	//table.getClientById(1847).then(id=>{console.log(`1847:${id}`);});
	
}

main();

