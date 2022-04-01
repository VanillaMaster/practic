class Client {
	#row;
	#saveFunc = null;
	data = {// welcome to the разметка club
		independent:{
			//hafID: new Value(null),
			//shopName: new Value(null),
			//source: new Value(null),
			//ozonID: new Value(null),
			//ozon: new Value(null),
			//hafID: new Value(null),
			//point: new Value(null),
			//yandex: new Value(null),
			//kaspi: new Value(null),
			//aliexpress: new Value(null),
			//timeForAcc: new Value(null),
			sendOzonMsg: new Value(null,16),
			activeShops: new Value(null,17),
		},
		ozon:{
			//msgForClient: new Value(null),
			//msgIsReceived: new Value(null),
			//msgIsSendt: new Value(null),
			//pinned: new Value(null),
			//comment: new Value(null),
		},
		yandex:{
			//yandexID: new Value(null),
			//yandexTradingModel: new Value(null),
			//status: new Value(null),
		},
	}

	#getData(){
		let result = [];
		for (let [name, gropu] of Object.entries(this.data)) {
			for (let [key, value] of Object.entries(gropu)) {
				if (value.isUpdateRequired()) {
					result[value.getPosition()] = value.getValue();
				}
			}
		}
		return result;
	}

	constructor(row,func) {
		this.#row = row;
		this.#saveFunc = func;
	}
	getRow() {
		return this.#row;
	}

	load(){

	}

	save(){
		if (this.#saveFunc instanceof Function){
			let data = [this.#getData()];
			this.#saveFunc(data,Client.getRange(this.#row));
		}
	}

	static getRange(row){
		return `'Клиенты'!A${row}:AB${row}`
	}
}

class Value{
	#data = null;
	#isChanged = false;
	#position;
	constructor(data,position){
		this.#data = data;
		this.#position = position;
	}
	getValue(){
		return this.#data;
	}
	setValue(data){
		this.#data = data;
		this.#isChanged = true;
	}
	isUpdateRequired(){
		return this.#isChanged;
	}
	getPosition(){
		return this.#position;
	}
}

module.exports = Client;