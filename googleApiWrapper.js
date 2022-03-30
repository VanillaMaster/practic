const {google} = require('googleapis');
const sheets = google.sheets('v4');

class APIWrapper{
    static maxReq = 2;
    static delay = 1_000;
    #client;
    #isAuthorized = false;

    #reqCounter = 0;

    #globalRequestQueue = [];
    #searchRequestSlotQueue = [];
    #searchRequestFreeSlots = [];
    #searchRequestOptoins = {
        name:"API_search",
        column:"A",
        minRow:2,
        maxRow:51,
    };

    constructor(credentials){
        this.#client = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        for (let i = this.#searchRequestOptoins.maxRow; i >= this.#searchRequestOptoins.minRow; i--) {
            this.#searchRequestFreeSlots.push(i);
        }
    }

    async authorize(){
        return new Promise((resolve,reject)=>{
            this.#client.authorize((err,token)=>{
                if (err) { console.log(err); reject();} else {
                    this.#isAuthorized = true;
                    resolve(token);
                }
            });    
        });
    }

    async makeRequest(){

    }

    
    async execute(expression){
        let req = new SearchRequestInstance(expression);

        if (this.#searchRequestSlots.length == 0) {
            this.#searchRequestSlotQueue.push(req);
            this.#globalRequestQueue.push(req);
        } else {
            let index = this.#searchRequestSlots.pop();
            req.range = `${this.#searchRequestOptoins.name}!${this.#searchRequestOptoins.column}${index}:${this.#searchRequestOptoins.column}${index}`
            
            if(this.#reqCounter <= this.maxReq){
                this.#reqCounter++;

            } else {
                this.#globalRequestQueue.push(req);    
            }
        }

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
                console.log(response.status);
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
    range = null;
    constructor(ID,data,type,resolve,reject){
        this.ID = ID;
        this.data = data;
        this.type = type;
        this.resolve = resolve;
        this.reject = reject;
    }
    isReady(){
        return !(this.range === null);
    }
}

module.exports = APIWrapper;