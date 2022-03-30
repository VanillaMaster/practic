const {google} = require('googleapis');
const sheets = google.sheets('v4');

class Client {
	#row;
	#client
	constructor(row,client) {
		this.#row = row;
		this.#client = client;
	}
	getRow() {
		return this.#row;
	}

	load(){

	}

	save(){

	}

	//TODO: add client properties
}

module.exports = Client;