/**
 * Класс, реализующий поддержку расчетов ячеек по формулам
 */
class TableData {
    #app;           // объект приложения
    #table;         // компонент таблицы
    #idb;           // локальная база данных IndexedDB
    #cellMap;       // видимые ячейки таблицы
    #cellDataMap;   // данные видимых ячеек таблицы
    #tokenMap;      // массивы токенов ячеек с формулами
    #valueMap;      // числовые значения ячеек с числами
    #stringMap;     // строковые значения ячеек со строками
    #bufferArray;   // стек измененных ячеек
    #calculator;    // расчетчик

    /**
     * Конструктор модели данных таблицы
     */
    constructor(app, table) {
        this.#app = app;
        this.#table = table;
        this.#idb = new LocalDB(app);
        this.initTableData();
    }

    /**
     * Инициализация переменных модели данных таблицы
     */
    initTableData() {
        this.#cellMap = new Map();
        this.#cellDataMap = new Map();
        this.#tokenMap = new Map();
        this.#valueMap = new Map();
        this.#stringMap = new Map();
        this.#bufferArray = [];
        this.#calculator = new Calculator(this);
    }

    /**
     * Пересчет значений формульных ячеек таблицы
     */
    calcAllCells() {
        for (let cellName of this.#tokenMap.keys()) {
            this.getCell(cellName.toUpperCase()).refreshValue();
        }
    }

    /**
     * Расчет значения ячейки, содержащей формулу
     * @param {String} cellName - имя ячейки
     */
    calcCell (cellName) {
        return this.#calculator.calc(this.getTokens(cellName.toUpperCase()));
    }

    /**
     * Добавление ячейки в модель данных таблицы
     * @param {String} cellName - имя ячейки
     * @param {Object} cell - объект ячейки
     */
    setCell (cellName, cell) {
        this.#cellMap.set(cellName.toUpperCase(), cell);
    }
    
    /**
     * Установка модели данных ячейки
     * @param {String} cellName - имя ячейки
     * @param {Object} cellData - объект данных ячейки CellData
     */
    setCellData (cellName, cellData) {
        this.#cellDataMap.set(cellName.toUpperCase(), cellData);
    }

    /**
     * Удаляет значение ячейки
     * @param {String} cellName - имя удаляемой ячейки
     */
    deleteCellValue(cellName) {
        this.#idb.connect()
            .then( db => {
                let cell = cellName.toUpperCase();
                if (this.#valueMap.has(cell)) {
                    this.#valueMap.delete(cell);
                    this.#idb.delete(db, "values", cell);
                }
                if (this.#stringMap.has(cell)) {
                    this.#stringMap.delete(cell);
                    this.#idb.delete(db, "strings", cell);
                }
                if (this.#tokenMap.has(cell)) {
                    this.#tokenMap.delete(cell);
                    this.#idb.delete(db, "tokens", cell);
                }
            })
        ;
    }

    /**
     * Записть позации курсора в базу данных
     */
    set cursorCellName(cellName) {
        this.#idb.connect().then ( db => {
            this.#idb.put(db, "cells", "cursorCell", cellName);
        });
    }

    /**
     * Запись стартовой позизции в базу данных
     */
    set startCellName(cellName) {
        this.#idb.connect().then ( db => {
            this.#idb.put(db, "cells", "startCell", cellName);
        });
    }


    /**
     * Получение объекта ячейки по имени ячейки
     * @param {String} cellName - имя ячейки
     */
    getCell (cellName) {
        return this.#cellMap.get(cellName.toUpperCase());
    }

    getCellData (cellName) {
        return this.#cellDataMap.get(cellName.toUpperCase());
    }

    /**
     * Содержит ли ячейка число
     * @param {String} cellName - имя ячейки
     */
    isNumber(cellName) {
        return this.#valueMap.has(cellName.toUpperCase());
    }

    /**
     * Содержит ли ячейка формулу
     * @param {String} cellName - имя ячейки
     */
    isFormula(cellName) {
        return this.#tokenMap.has(cellName.toUpperCase());
    }

    /**
     * Содержил ли ячейка строку
     * @param {String} cellName - имя ячейки
     */
    isString(cellName) {
        return this.#stringMap.has(cellName.toUpperCase());
    }

    /**
     * Преобразование токена ячейки в токен его значения
     * @param {Object} token объект токена 
     */
    getNumberToken (token) {
        return new Token (Types.Number, this.getValue(token.value) );
    }

    /**
     * Получение массива токенов формулы для ячейки
     * @param {Strgin} cellName  - имя ячейки
     */
    getTokens(cellName) {
        return this.#tokenMap.get(cellName.toUpperCase());
    }

    /**
     * Добавление в модель таблицы разобранную на токены формулу ячейки
     * @param {String} cellName 
     * @param {Array} formula 
     */
    setTokens(cellName, formula) {
        if ( Array.isArray(formula) ) {
            this.#tokenMap.set(cellName.toUpperCase(), formula);
        }
        else {
            let f = formula.substring(1).toUpperCase();
            this.#tokenMap.set(cellName.toUpperCase(), Token.getTokens(f));
        }
        this.#idb.connect().then ( db => {
            this.#idb.put(db, "tokens", cellName, JSON.stringify(this.#tokenMap.get(cellName)));
        });
    }

    /**
     * Добавление в модель таблицы числового значения первичной ячейки
     * @param {String} cellName 
     * @param {Number} value 
     */
    setValue(cellName, value) {
        this.#valueMap.set(cellName.toUpperCase(), value);
        this.#idb.connect().then ( db => {
            this.#idb.put(db, "values", cellName, JSON.stringify(this.#valueMap.get(cellName)));
        });        
    }

    /**
     * Получение числового значения первичной ячейки
     * @param {String} cellName 
     */
    getValue(cellName) {
        return this.#valueMap.get(cellName.toUpperCase());;
    }

    /**
     * Добавление в модель данных текстового значения
     * @param {String} cellName 
     * @param {String} string 
     */
    setString(cellName, string) {
        this.#stringMap.set(cellName.toUpperCase(), string);
        this.#idb.connect().then ( db => {
            this.#idb.put(db, "strings", cellName, this.#stringMap.get(cellName));
        });         
    }

    /**
     * Получение текстового значения ячейки
     * @param {String} cellName 
     */
    getString(cellName) {
        return this.#stringMap.get(cellName.toUpperCase());
    }

    pushBuffer(cellData) {
        this.#bufferArray.push({[cellData.name]:cellData.value});
        let cell = this.getCell(cellData.name);
        cell.classList.add("change-value");
    }

    popBuffer() {
        let bufferCell = this.#bufferArray.pop();
        let cell = this.getCell(Object.keys(bufferCell)[0]);
        cell.classList.remove("change-value");
        return bufferCell;
    }

    hasBuffer() {
        return this.#bufferArray.length;
    }

    /**
     * Подготавливает данные для сохранения в файл формата JSON
     */
    saveData() {
		let table = this.#app.getComponent("table");
		let tokens = {};
		this.#tokenMap.forEach( (value, key, map) => { 
			tokens[key] = [];
			this.getTokens(key).forEach( ( token ) => {
				tokens[key].push({
                    [token.type]: token.value   
				});
			}) 
		} );
        let data = {
            strings:Object.fromEntries(this.#stringMap.entries()), 
			values: Object.fromEntries(this.#valueMap.entries()),
			tokens: tokens
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Загрузка данных из внешнего файла в формате JSON
     * @param {JSON} json - внешние данные в формате JSON
     */
    async loadData(json) {
        await this.asyncClearData();
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
            console.log(tokens);
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

        for (let cellName of this.#stringMap.keys()) {
            let value = this.#stringMap.get(cellName);
            await this.#idb.put(db, "strings", cellName, this.#stringMap.get(cellName));
        }

        for (let cellName of this.#valueMap.keys()) {
            let value = this.#valueMap.get(cellName);
            await this.#idb.put(db, "values", cellName, this.#valueMap.get(cellName));
        }

        for (let cellName of this.#tokenMap.keys()) {
            let tokenArray = this.#tokenMap.get(cellName);
            tokenArray.map((item, index, array) => array[index] = new Token(item.type, item.value));
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
    }

    /**
     * Обновление имени текущей ячеейки курсора
     */
    async asyncRefreshCursorCell() {
        let db = await this.#idb.connect();
        let cells = await this.#idb.get(db, "cells");

        let startCellName = cells.get("startCell");
        this.#table.setStartCell(startCellName ? startCellName : "A1");

        let cursorCellName = cells.get("cursorCell");
        this.#table.setCursorCell(cursorCellName ? cursorCellName : "A1");
    }
    
    /**
     * Очистка данных текущей таблицы
     */
    async asyncClearData() {
        // очистка модели данных и содержимого таблицы от старых значений 
        for (let cellName of this.#valueMap.keys()){
            this.getCellData(cellName).initCell();
            this.getCell(cellName).refresh();
        }
        for (let cellName of this.#tokenMap.keys()){
            this.getCellData(cellName).initCell();
            this.getCell(cellName).refresh();
        }
        for (let cellName of this.#stringMap.keys()){
            this.getCellData(cellName).initCell();
            this.getCell(cellName).refresh();
        }

        // очистка хешей
        this.#stringMap.clear();
        this.#valueMap.clear();
        this.#tokenMap.clear();

        let db = await this.#idb.connect();
        await this.#idb.clear(db, "strings");
        await this.#idb.clear(db, "values");
        await this.#idb.clear(db, "tokens");

        this.#table.setStartCell("A1");
        this.#table.setCursor("A1");        
    }

}