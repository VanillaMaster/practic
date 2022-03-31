const Client = require("./Client");
const APIWrapper = require("./googleApiWrapper");

class Table {
    #ID;
    #client = null;

    constructor(tableID) {
		this.#ID = tableID;
	}

    async authorize(credentials){
        this.#client = new APIWrapper(credentials);
        return await this.#client.authorize();
    }

    async getClientById(id){
        if (this.#client === null) { return; }
        let result = ( await this.#client.execute(this.#ID,[[Table.searchByIdQuery(id)]]) )?.values[0][0];
        let row = parseInt(result) + Table.searchByIdShift()
        return row;
    }

    static searchByIdQuery(ID){
        return `=IFNA(MATCH(${ID};${"'Клиенты'!B4:B"};0);"null")`;
    }
    static searchByIdShift(){
        return 3;
    }
}

module.exports = Table;