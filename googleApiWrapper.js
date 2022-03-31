const {google} = require('googleapis');
const sheets = google.sheets('v4');

class APIWrapper{
    static maxReq = 100;//        <========= TODO: replace to: 100 
    static delay = 100_000;//     <========= TODO: replace to: 100_000

    static exp = RegExp(/[0-9]+$/);

    #client;

    #reqCounter = 0;

    #globalRequestQueue = [];
    #searchRequestSlotQueue = [];
    #searchRequestFreeSlots = [];
    #searchRequestOptoins = {
        name:"API_search",
        column:"A",
        minRow:2,
        maxRow:21,
    };

    constructor(credentials,searchOptions={}){
        this.#client = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        if ("name" in searchOptions) this.#searchRequestOptoins.name = searchOptions.name;
        if ("column" in searchOptions) this.#searchRequestOptoins.column = searchOptions.column;
        if ("minRow" in searchOptions) this.#searchRequestOptoins.minRow = searchOptions.minRow;
        if ("maxRow" in searchOptions) this.#searchRequestOptoins.maxRow = searchOptions.maxRow;

        for (let i = this.#searchRequestOptoins.maxRow; i >= this.#searchRequestOptoins.minRow; i--) {
            this.#searchRequestFreeSlots.push(i.toString());
        }
    }

    async authorize(){
        return new Promise((resolve,reject)=>{
            this.#client.authorize((err,token)=>{
                if (err) { console.log(err); reject();} else {
                    resolve(token);
                }
            });    
        });
    }

    async execute(ID,expression){
        let setResult = await new Promise((resolve,reject)=>{
            let req = new SetRequestInstance(ID,expression,"USER_ENTERED",resolve,reject);
            req.onReady = (it) => {
                if(this.#reqCounter < APIWrapper.maxReq){
                    this.#reqCounter++;
                    this.#set(it);
                }
            }
            this.#globalRequestQueue.push(req);

            if (this.#searchRequestFreeSlots.length == 0) {
                this.#searchRequestSlotQueue.push(req);
            } else {
                let slot = this.#searchRequestFreeSlots.pop();
                req.setRange(`${this.#searchRequestOptoins.name}!${this.#searchRequestOptoins.column}${slot}:${this.#searchRequestOptoins.column}${slot}`);
            }
        });
        let range = setResult.updatedRange;
        let slot = APIWrapper.exp.exec(range);
        if (!(slot === null)) {slot = slot[0];}
        //console.log(setResult.updatedRange); 
        //console.log(slot);
        let getRequest = await this.get(ID,range);
        if (this.#searchRequestSlotQueue.length == 0) {
            this.#searchRequestFreeSlots.push(slot);
        } else {
            this.#searchRequestSlotQueue.shift().setRange(range);
        }
        return getRequest;
    }
    

    async #set(setRequest) {
        sheets.spreadsheets.values.update({
            auth: this.#client,
            spreadsheetId: setRequest.ID,
            valueInputOption: setRequest.type,
            range: setRequest.range,
            resource: { range: setRequest.range, majorDimension: "ROWS", values: setRequest.data },},
            (err, response) => {
            if (err) { console.error(err); setRequest.reject(err); } else {
                //console.log(response);
                setTimeout(()=>{this.#requestCallBack()}, APIWrapper.delay);
                setRequest.resolve(response.data);
            }}
        );
    }

    async set(ID,range,data,type="RAW"){
        return new Promise((resolve,reject)=>{
            let req = new SetRequestInstance(ID,data,type,resolve,reject);
            req.range = range;

            if(this.#reqCounter < APIWrapper.maxReq){
                this.#reqCounter++;
                this.#set(req);
            } else {
                this.#globalRequestQueue.push(req);
            }

        });
    }

    async #get(getRequest){
        sheets.spreadsheets.values.get({
            auth: this.#client,
            spreadsheetId: getRequest.ID,
            range: getRequest.range },
            (err, response) => {
            if (err) { console.error(err); getRequest.reject(); } else {
                //console.log(response.status);
                setTimeout(()=>{this.#requestCallBack()}, APIWrapper.delay);
                getRequest.resolve(response.data);  
            }}
        );
    }

    async get(ID,range){
        return new Promise((resolve,reject)=>{
            let req = new GetRequestInstance(ID,range,resolve,reject);
            
            if(this.#reqCounter < APIWrapper.maxReq){
                this.#reqCounter++;
                this.#get(req);
            } else {
                this.#globalRequestQueue.push(req);
            }
        });
    }
    
    async #requestCallBack(){
        if (this.#globalRequestQueue.length == 0) {
            this.#reqCounter--;
        }
        else {
            let req = null;
            for (let i = 0; i < this.#globalRequestQueue.length; i++) {
                if (this.#globalRequestQueue[i].isReady()) {
                    req = this.#globalRequestQueue.splice(i,1)[0];
                    break;
                }
            }
            if (req === null) { 
                this.#reqCounter--;
            } else {
                if (req instanceof GetRequestInstance) this.#get(req);
                if (req instanceof SetRequestInstance) this.#set(req);
            }
        }
    }


}

class GetRequestInstance{
    constructor(ID,range,resolve,reject){
        this.ID = ID;
        this.range = range;
        this.resolve = resolve;
        this.reject = reject;
    }
    isReady(){
        return true;
    }
}

class SetRequestInstance{
    onReady = null;
    range = null;
    constructor(ID,data,type,resolve,reject){
        this.ID = ID;
        this.data = data;
        this.type = type;
        this.resolve = resolve;
        this.reject = reject;
    }
    setRange(range){
        this.range = range;
        if (this.onReady instanceof Function) this.onReady(this);
    }
    isReady(){
        return !(this.range === null);
    }
}

module.exports = APIWrapper;