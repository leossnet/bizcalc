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
        this.#calculator = new Calculator(this.#values);
    }

    set (cellName, cell) {
        this.#cells.set(cellName, cell);
    }

    get (cellName) {
        return this.#cells.get(cellName);
    }

    /**
     * Пересчет значений электронной таблицы
     */
    calc() {
        this.#tokens.forEach((value, key, map)  => {
            let val = this.#calculator.calc(value);
            this.#cells.get(key).refresh();
            console.log("calc value:"+val);
        });
    }

    setTokens(cellName, formula) {
        let f = formula.substring(1).toUpperCase();
        this.#tokens.set(cellName, this.#calculator.getTokens(f));
        this.calc();
        console.log(this.#tokens);
    }

    setValue(cellName, value) {
        this.#values.set(cellName, value);
        this.calc();
        console.log(this.#tokens);
    }

    refreshValue() {
        for (let cell of this.#cells.values) {

        }
    }

}