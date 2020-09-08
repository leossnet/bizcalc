/**
 * Класс, реализующий поддержку расчетов ячеек по формулам
 */
class TableData extends CalcData {
    #app;           // объект приложения
    #table;         // компонент таблицы
    #idb;           // локальная база данных IndexedDB
    #bufferArray;   // стек измененных ячеек

    constructor(app, table) {
        super();
        this.#app = app;
        this.#table = table;
        this.#idb = new LocalDB(app);
        this.#bufferArray = [];
    }

    /**
     * Записть позиции курсора в базу данных
     */
    async asyncSetCursorCellName(cellName) {
        let db = await this.#idb.connect();
        await this.#idb.put(db, "cells", "cursorCell", cellName);
    } 

    /**
     * Запись стартовой позиции таблицы в базу данных
     */
    async asyncSetStartCellName(cellName) {
        let db = await this.#idb.connect();
        await this.#idb.put(db, "cells", "startCell", cellName);
    } 

    /**
     * Добавление в модель таблицы разобранную на токены формулу ячейки
     * @param {String} cellName 
     * @param {Array} formula 
     */
    async setTokens(cellName, formula) {
        super.setTokens(cellName, formula);

        let db = await this.#idb.connect();        
        await this.#idb.put(db, "tokens", cellName, JSON.stringify(this.getTokens(cellName)));
    }

    /**
     * Добавление в модель таблицы числового значения первичной ячейки
     * @param {String} cellName 
     * @param {Number} value 
     */
    async setValue(cellName, value) {
        super.setValue(cellName, value);

        let db = await this.#idb.connect();        
        await this.#idb.put(db, "values", cellName, JSON.stringify(this.getValue(cellName)));
    }


    /**
     * Добавление в модель данных текстового значения
     * @param {String} cellName 
     * @param {String} string 
     */
    async setString(cellName, string) {
        super.setString(cellName, string);

        let db = await this.#idb.connect();        
        await this.#idb.put(db, "strings", cellName, this.getString(cellName));
    }

    /**
     * Удаляет значение ячейки
     * @param {String} cellName - имя удаляемой ячейки
     */
    async asyncDeleteCellValue(cellName) {
        let store = super.deleteCellValue(cellName);

        let db = await this.#idb.connect();
        await this.#idb.delete(db, store, cellName);
    }

    /**
     * Положить значение ячейки в буфеф редактирования
     * @param {CellData} cellData - объект значения ячейки
     */
    pushBuffer(cellData) {
        this.#bufferArray.push({[cellData.name]:cellData.value});
        let cell = this.getCell(cellData.name);
        cell.classList.add("change-value");
    }

    /**
     * Вернуть последний объект значения ячейки из буфера редактирования
     * @returns {CellData} - объект значения ячейки
     */
    popBuffer() {
        let bufferCell = this.#bufferArray.pop();
        let cell = this.getCell(Object.keys(bufferCell)[0]);
        cell.classList.remove("change-value");
        return bufferCell;
    }

    /**
     * Проверка на наличие значений ячеек в буфере редактирования
     */
    hasBuffer() {
        return this.#bufferArray.length;
    }

    /**
     * Загрузка данных из внешнего файла в формате JSON
     * @param {JSON} json - внешние данные в формате JSON
     */
    async loadData(json) {
        this.clearData();
        await this.asyncIndexedClear();
        this.viewData(JSON.parse(json));
        await this.asyncIndexedData();        
    }

    /**
     * Отображение данных в текущей таблице
     * @param {Object} parseJson - данные в формате JSON
     */
    viewData(parseJson) {
        // обновление строковых данных
        if ( parseJson.strings ) {
            let strings = new Map(Object.entries(parseJson.strings));
            for (let cellName of strings.keys()){
                this.getCellData(cellName).setValue(strings.get(cellName), false);
            }
        }
        // обновление первичных данных
        if ( parseJson.values ) {
            let values = new Map(Object.entries(parseJson.values));
            for (let cellName of values.keys()){
                this.getCellData(cellName).setValue(values.get(cellName), false);
            }
        }        
        // обновление формул
        if ( parseJson.tokens ) {
            let tokens = new Map(Object.entries(parseJson.tokens));
            for (let cellName of tokens.keys()){
                let tokenArray = tokens.get(cellName);
                tokenArray.map( (item, index, array) => {
                    for (let type in item) array[index] = new Token(type, item[type]);
                });
                this.getCellData(cellName).setValue(tokenArray, false);
            }
        }
        this.calcAllCells();
    }

    /**
     * Кеширование загруженных данных в локальной базе IndexedDB
     */
    async asyncIndexedData() {
        let db = await this.#idb.connect();

        for (let cellName of super.stringMap.keys()) {
            let value = super.stringMap.get(cellName);
            await this.#idb.put(db, "strings", cellName, value);
        }

        for (let cellName of super.valueMap.keys()) {
            let value = super.valueMap.get(cellName);
            await this.#idb.put(db, "values", cellName, value);
        }

        for (let cellName of super.tokenMap.keys()) {
            let tokenArray = super.tokenMap.get(cellName);
            tokenArray.map((item, index, array) => {
                array[index] = new Token(item.type, item.value)
            });
            await this.#idb.put(db, "tokens", cellName, JSON.stringify(tokenArray));
        }
    }

    /**
     * Обновление данных таблицы из локальной базы данных
     */
    async asyncRefreshData() {
        let db = await this.#idb.connect();

        let stringMap = await this.#idb.get(db, "strings");
        for (let cellName of stringMap.keys()) {
            let value = stringMap.get(cellName);
            this.getCellData(cellName).setValue(value, false);
        }

        let valueMap = await this.#idb.get(db, "values");
        for (let cellName of valueMap.keys()) {
            let value = valueMap.get(cellName);
            this.getCellData(cellName).setValue(value, false);
        }

        let tokenMap = await this.#idb.get(db, "tokens");
        for (let cellName of tokenMap.keys()) {
            let tokenArray = JSON.parse(tokenMap.get(cellName));
            tokenArray.map( (item, index, array) => array[index] = new Token(item.type, item.value) );
            this.getCellData(cellName).setValue(tokenArray, false);
        }
        this.calcAllCells();

        await this.asyncRefreshCursorCell();
    }

    /**
     * Обновление имени текущей ячеейки курсора
     */
    async asyncRefreshCursorCell() {
        let db = await this.#idb.connect();
        let cells = await this.#idb.get(db, "cells");

        let cursorCellName = cells.get("cursorCell");
        if ( cursorCellName ) {
            this.#table.setCursor(cursorCellName);
        }
    }
    
    /**
     * Очистка данных текущей таблицы
     */
    clearData() {
        super.clearData();
        this.#table.setStartCell("A1");
        this.#table.setCursor("A1");        
    }


    /**
     * Очистка локальной базы данных IndexedDb от данных ячеек таблицы
     */
    async asyncIndexedClear() {
        let db = await this.#idb.connect();
        await this.#idb.clear(db, "strings");
        await this.#idb.clear(db, "values");
        await this.#idb.clear(db, "tokens");
    }

    /**
     * Подготавливает данные для сохранения в файл формата JSON
     */
    saveData() {
		let table = this.#app.getComponent("table");
		let tokens = {};
		this.tokenMap.forEach( (value, key, map) => { 
			tokens[key] = [];
			this.getTokens(key).forEach( ( token ) => {
				tokens[key].push({
                    [token.type]: token.value   
				});
			}) 
		} );
        let data = {
            strings:Object.fromEntries(this.stringMap.entries()), 
			values: Object.fromEntries(this.valueMap.entries()),
			tokens: tokens
        };
        return JSON.stringify(data, null, 2);
    }

}