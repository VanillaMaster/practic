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
        let result = ( await this.#client.execute(this.#ID,[[Table.searchByIdQuery(id)]]) )?.values;
        let row = parseInt(result) + Table.searchByIdShift();
        return new Client(row,(data,range)=>{
            this.#client.set(this.#ID,range,data);
        });
    }

    static searchByIdQuery(ID){
        return `=IFNA(MATCH(${ID};${"'Клиенты'!B3:B"};0);"null")`;
    }
    static searchByIdShift(){
        return 2;
    }
}

module.exports = Table;