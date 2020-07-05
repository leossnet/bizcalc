/**
 * Класс, реализующий поддержку расчетов ячеек по формулам
 */
class TableData {
    #app;
    #cellMap;
    #tokenMap;
    #valueMap;
    #stringMap; 
    #calculator;

    /**
     * Конструктор данных электронной таблицы
     */
    constructor(app) {
        this.#app = app;
        this.#cellMap = new Map();
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

    /**
     * Получение объекта ячейки по имени ячейки
     * @param {String} cellName - имя ячейки
     */
    getCell (cellName) {
        return this.#cellMap.get(cellName.toUpperCase());
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
     * Возвращает данные в формате JSON
     */
    getData() {
		let table = this.#app.getComponent("table");
		let tokens = {};
		this.#tokenMap.forEach( (value, key, map) => { 
			tokens[key] = [];
			this.getTokens(key).forEach( ( token ) => {
				tokens[key].push({
					type: token.type,
					value: token.value
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
     * Устанавливает данные таблицы из внешних данных в формате JSON
     * @param {JSON} json - внешние данные в формате JSON
     */
    setData(json) {
        // очистка старых значений
        for (let cellName of this.#valueMap.keys()){
            this.getCell(cellName).initCell();
        }
        for (let cellName of this.#tokenMap.keys()){
            this.getCell(cellName).initCell();
        }

        // парсинг json 
        let data = JSON.parse(json);

        // обновление строковый значений
        this.#stringMap.clear();
        if ( data.strings ) {
            let strings = new Map(Object.entries(data.strings));
            for (let cellName of strings.keys()){
                this.getCell(cellName).value = strings.get(cellName);
            }
        }

        // обновление первичных данных
        this.#valueMap.clear();
        if ( data.values ) {
            let values = new Map(Object.entries(data.values));
            for (let cellName of values.keys()){
                this.getCell(cellName).value = values.get(cellName);
            }
        }
        
        // обновление формул
        this.#tokenMap.clear();
        if ( data.tokens ) {
            let tokens = new Map(Object.entries(data.tokens));
            for (let cellName of tokens.keys()){
                tokens.get(cellName).map( (item, index, array) => {
                    array[index] = new Token(item.type, item.value);
                } );
                this.getCell(cellName).value = tokens.get(cellName);
            }
        }
    }
}