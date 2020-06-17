/**
 * Класс, реализующий поддержку расчетов ячеек по формулам
 */
class TableData {
    #app;
    #cells;
    #tokens;
    #values;
    #calculator;

    /**
     * Конструктор данных электронной таблицы
     */
    constructor(app) {
        this.#app = app;
        this.#cells = new Map();
        this.#tokens = new Map();
        this.#values = new Map();
        this.#calculator = new Calculator(this);
    }

    /**
     * Пересчет значений формульных ячеек электронной таблицы
     */
    calcAllCells() {
        for (let cellName of this.#tokens.keys()) {
            this.getCell(cellName).refreshValue();
        }
    }

    /**
     * Расчет значения ячейки, содержащей формулу
     * @param {String} cellName - имя ячейки
     */
    calcCell (cellName) {
        return this.#calculator.calc(this.getTokens(cellName));
    }

    /**
     * Добавление ячейки в модель данных таблицы
     * @param {String} cellName - имя ячейки
     * @param {Object} cell - объект ячейки
     */
    setCell (cellName, cell) {
        this.#cells.set(cellName, cell);
    }

    /**
     * Получение объекта ячейки по имени ячейки
     * @param {String} cellName 
     */
    getCell (cellName) {
        return this.#cells.get(cellName);
    }

    isNumber(cellName) {
        return this.#values.has(cellName);
    }

    isFormula(cellName) {
        return this.#tokens.has(cellName);
    }

    /**
     * Преобразование токена ячейки в токен его значения
     * @param {Object} token объект токена 
     */
    getNumberToken (token) {
        return new Token (Types.Number, { value: this.getValue(token.value) } );
    }

    /**
     * Получение массива токенов формулы для ячейки
     * @param {Strgin} cellName  - имя ячейки
     */
    getTokens(cellName) {
        return this.#tokens.get(cellName);
    }

    /**
     * Добавление в модель таблицы разобранную на токены формулу ячейки
     * @param {String} cellName 
     * @param {Array} formula 
     */
    setTokens(cellName, formula) {
        let f = formula.substring(1).toUpperCase();
        this.#tokens.set(cellName.toUpperCase(), Token.getTokens(f));
    }

    /**
     * Добавление в модель таблицы числового значения первичной ячейки
     * @param {String} cellName 
     * @param {Number} value 
     */
    setValue(cellName, value) {
        this.#values.set(cellName, value);
    }

    /**
     * Получение числового значения первичной ячейки
     * @param {String} cellName 
     */
    getValue(cellName) {
        return this.#values.get(cellName);;
    }

    /**
     * Возвращает данные в формате JSON
     */
    getData() {
        let table = this.#app.getComponent("table");
        console.log(Object.fromEntries(this.#tokens.entries()));
        let data = {
            rows: table.tableParam.rowCount,
            cols: table.tableParam.colCount,
			values: Object.fromEntries(this.#values.entries()),
			tokens: Object.fromEntries(this.#tokens.entries())
        };

        let res = JSON.stringify(data);
        console.log(res);
        return res; 
    }

    /**
     * Устанавливает данные таблицы из внешних данных в формате JSON
     * @param {JSON} json - внешние данные в формате JSON
     */
    setData(json) {
        console.log(json);
    }

}