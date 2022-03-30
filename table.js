const {google} = require('googleapis');
const sheets = google.sheets('v4');
const Client = require("./Client");

class Table {
    #ID;
    #client;
    #isAuthorized = false;
    #searchOptoins = {
        name:"API_search",
        column:"A",
        minRow:2,
        maxRow:3,
    };
    #searchQueue = {
        freeIndexes:[],
        requests:[],
    };

    constructor(tableID,options = {}) {
		this.#ID = tableID;

        for (let i = this.#searchOptoins.maxRow; i >= this.#searchOptoins.minRow; i--) {
            this.#searchQueue.freeIndexes.push(i);
        }
        //console.log(this.#searchQueue.freeIndexes);
	}

    async authorize(credentials){
        return new Promise((resolve,reject)=>{
            this.#client = new google.auth.JWT(
                credentials.client_email,
                null,
                credentials.private_key,
                ['https://www.googleapis.com/auth/spreadsheets']    
            );
            this.#client.authorize((err,token)=>{
                if (err) { console.log(err); reject();} else {
                    this.#isAuthorized = true;
                    resolve();
                }
            });    
        });
    }


    /**
     * @returns {Client} client obj or null if not found
     */
    async getClientById(ID){
        if (!this.#isAuthorized){console.error("client is not authorized"); return;}
        return new Promise((resolve,reject)=>{

            this.#makeRequest(async (range)=>{
                await this.#set(range,[[Table.searchByIdQuery(ID)]],"USER_ENTERED");
                let row = parseInt( (await this.#get(range)).values[0][0] );
                if (!isNaN(row)) {
                    row+= Table.searchByIdShift();
                    resolve(new Client(row,this.#client));
                } else {
                    resolve(null);
                }
            });

        });
    }

    #makeRequest(func){

        if (this.#searchQueue.freeIndexes.length === 0) {
            console.log("pushed to requests queue");
            this.#searchQueue.requests.push(func);
        } else {
            let index = this.#searchQueue.freeIndexes.pop();
            let range = `${this.#searchOptoins.name}!${this.#searchOptoins.column}${index}:${this.#searchOptoins.column}${index}`;
            func(range).then(()=>{
                this.#makeRequestCallBack(index);
            });
        }

    }
    #makeRequestCallBack(index){
        if (this.#searchQueue.requests.length === 0) {
            this.#searchQueue.freeIndexes.push(index);
        } else {
            let range = `${this.#searchOptoins.name}!${this.#searchOptoins.column}${index}:${this.#searchOptoins.column}${index}`;
            let func = this.#searchQueue.requests.shift();
            func(range).then(()=>{
                this.#makeRequestCallBack(index);  
            });
        }    
    }

    async #set(range,data,type="RAW") {
        return new Promise((resolve,reject)=>{
        sheets.spreadsheets.values.update({
            auth: this.#client,
            spreadsheetId: this.#ID,
            valueInputOption: type,
            range: range,
            resource: { range: range, majorDimension: "ROWS", values: data },},
            (err, response) => {
            if (err) { console.error(err); reject(err); } else {
                //console.log(response);
                resolve(response);
            }}
        );
    });}

    async #get(range) {
        return new Promise((resolve,reject)=>{
        sheets.spreadsheets.values.get({
            auth: this.#client,
            spreadsheetId: this.#ID,
            range: range },
            (err, response) => {
            if (err) { console.error(err); reject(err); } else {
                //console.log(response);
                resolve(response.data);  
            }}
        );
    });}

    static searchByIdQuery(ID){
        return `=IFNA(MATCH(${ID};${"'Клиенты'!B4:B"};0);"null")`;
    }
    static searchByIdShift(){
        return 3;
    }
}

module.exports = Table;