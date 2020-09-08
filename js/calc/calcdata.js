/**
 * Класс, реализующий поддержку расчетов ячеек по формулам
 */
class CalcData {

    #cellMap;       // видимые ячейки таблицы
    #cellDataMap;   // данные видимых ячеек таблицы
    #tokenMap;      // массивы токенов ячеек с формулами
    #valueMap;      // числовые значения ячеек с числами
    #stringMap;     // строковые значения ячеек со строками
    #calculator;    // расчетчик

    /**
     * Конструктор модели данных таблицы
     */
    constructor() {
        this.#cellMap = new Map();
        this.#cellDataMap = new Map();
        this.#tokenMap = new Map();
        this.#valueMap = new Map();
        this.#stringMap = new Map();
        this.#calculator = new Calculator(this);
    }

    get valueMap() {
        return this.#valueMap;
    }

    get tokenMap() {
        return this.#tokenMap;
    }

    get stringMap() {
        return this.#stringMap;
    }

    /**
     * Возвращает числовой токен, соответствующий значению токена ячейки
     * @param {Token} cellToken - токен ячейки
     */
    getNumberToken(cellToken) {
        if ( this.isNumber(cellToken.value) ) {
            return new Token (Types.Number, this.getValue(cellToken.value) );
        }
        else if ( this.isFormula(cellToken.value) ) {
            let formula = this.getTokens(cellToken.value);
            return new Token(Types.Number, this.#calculator.calc(formula));
        }
        else {
            return new Token(Types.Number, 0);
        }        
    }

    /**
     * Удаляет значение ячейки
     * @param {String} cellName - имя удаляемой ячейки
     */
    deleteCellValue(cellName) {
        let cell = cellName.toUpperCase();
        let store = "";
        if (this.valueMap.has(cell)) {
            this.valueMap.delete(cell);
            store = "values";
        }
        else if (this.stringMap.has(cell)) {
            this.stringMap.delete(cell);
            store = "strings";
        }
        else if (this.tokenMap.has(cell)) {
            this.tokenMap.delete(cell);
            store = "tokens";
        }
        return store;
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
     * Получение массива токенов формулы для ячейки
     * @param {Strgin} cellName  - имя ячейки
     */
    getTokens(cellName) {
        return this.#tokenMap.get(cellName.toUpperCase());
    }

    /**
     * Получение числового значения первичной ячейки
     * @param {String} cellName 
     */
    getValue(cellName) {
        return this.#valueMap.get(cellName.toUpperCase());;
    }


    /**
     * Получение текстового значения ячейки
     * @param {String} cellName 
     */
    getString(cellName) {
        return this.#stringMap.get(cellName.toUpperCase());
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
     * Добавление в модель данных текстового значения
     * @param {String} cellName 
     * @param {String} string 
     */
    setString(cellName, string) {
        this.#stringMap.set(cellName.toUpperCase(), string);
    }

    
    /**
     * Очистка данных текущей таблицы
     */
    clearData() {
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
    }

}