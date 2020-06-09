/**
 * Класс, реализующий поддержку расчетов ячеек по формулам
 */
class TableData {
    #cells;
    #tokens;
    #values;
    #calculator;

    /**
     * Конструктор данных электронной таблицы
     */
    constructor() {
        this.#cells = new Map();
        this.#tokens = new Map();
        this.#values = new Map();
        this.#calculator = new Calculator(this);
    }

    /**
     * Пересчет значений электронной таблицы
     */
    calc() {
        this.#tokens.forEach((value, key, map)  => {
            let val = this.#calculator.calc(value);
            let cell = this.#cells.get(key);
            cell.value = val;
            cell.refresh();
        });
    }

    /**
     * Расчет значения ячейки, содержащей формулу
     * @param {String} cellName - имя ячейки
     */
    calc (cellName) {
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

    /**
     * Преобразование токена ячейки в токен его значения
     * @param {Object} token объект токена 
     */
    getNumberToken (token) {
        return { type: Types.Number, value: this.getValue(token.value) };        
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
        this.#tokens.set(cellName.toUpperCase(), this.#calculator.getTokens(f));
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

}