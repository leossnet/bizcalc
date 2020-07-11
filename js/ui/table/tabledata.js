/**
 * Класс, реализующий поддержку расчетов ячеек по формулам
 */
class TableData {
    #app;
    #db;
    #cellMap;
    #cellDataMap;
    #tokenMap;
    #valueMap;
    #stringMap; 
    #calculator;

    /**
     * Конструктор данных электронной таблицы
     */
    constructor(app) {
        this.#app = app;
        this.#db = new LocalDB(app);
        this.initTableData();
        // this.#cellMap = new Map();
        // this.#cellDataMap = new Map();
        // this.#tokenMap = new Map();
        // this.#valueMap = new Map();
        // this.#stringMap = new Map();
        // this.#calculator = new Calculator(this);
    }

    initTableData() {
        this.#cellMap = new Map();
        this.#cellDataMap = new Map();
        this.#tokenMap = new Map();
        this.#valueMap = new Map();
        this.#stringMap = new Map();
        this.#calculator = new Calculator(this);
    }

    /**
     * Пересчет значений формульных ячеек электронной таблицы
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
    
    setCellData (cellName, cellData) {
        this.#cellDataMap.set(cellName.toUpperCase(), cellData);
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
    }

    /**
     * Добавление в модель таблицы числового значения первичной ячейки
     * @param {String} cellName 
     * @param {Number} value 
     */
    setValue(cellName, value) {
        this.#valueMap.set(cellName.toUpperCase(), value);
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
    }

    /**
     * Получение текстового значения ячейки
     * @param {String} cellName 
     */
    getString(cellName) {
        return this.#stringMap.get(cellName.toUpperCase());
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
    loadData(json) {
        // парсинг json 
        let data = JSON.parse(json);
        this.clearData();
        this.viewData(data);
    }

    /**
     * Отображение данных в текущей таблице
     * @param {Object} parseJson - данные в формате JSON
     */
    viewData(parseJson) {
        // обновление строковый значений
        if ( parseJson.strings ) {
            let strings = new Map(Object.entries(parseJson.strings));
            for (let cellName of strings.keys()){
                this.getCellData(cellName).value = strings.get(cellName);
                this.#db.put("strings", strings.get(cellName), cellName);
            }
        }

        // обновление первичных данных
        if ( parseJson.values ) {
            let values = new Map(Object.entries(parseJson.values));
            for (let cellName of values.keys()){
                this.getCellData(cellName).value = values.get(cellName);
                this.#db.put("values", values.get(cellName), cellName);
            }
        }
        
        // обновление формул
        if ( parseJson.tokens ) {
            let tokens = new Map(Object.entries(parseJson.tokens));
            // console.log(tokens);
            for (let cellName of tokens.keys()){
                tokens.get(cellName).map( (item, index, array) => {
                    for (let type in item) array[index] = new Token(type, item[type]);
                } );
                this.getCellData(cellName).value = tokens.get(cellName);
                // console.log(tokens.get(cellName));
                this.#db.put("tokens", tokens.get(cellName), cellName);
            }
            // console.log(tokens);
        }
    }

    /**
     * Очистка данных текущей таблицы
     */
    clearData() {
        console.log("clear data...");
        // очистка старых значений
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

        this.#stringMap.clear();
        this.#valueMap.clear();
        this.#tokenMap.clear();
    }


}