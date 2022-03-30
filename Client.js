class Client {
	#row;
	constructor(row) {
		this.#row = row;
	}
	getRow() {
		return this.#row;
	}
}

module.exports = Client;