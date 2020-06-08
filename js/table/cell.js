/**
 * Класс, реализующий функционал ячейки таблицы
 */
class Cell extends HTMLElement { 
    #table;
    #cell = {};
    #deltaA = "A".charCodeAt(0)-1;

    /**
     * Конструктор ячейки таблицы
     * @param {Object} table объект таблицы, к которому добавляется текущая ячейка
     * @param {String|Number} rowName имя строки ячейки
     * @param {String} colName имя колонки ячейки
     */
    constructor(table, rowName, colName) {
        super();
        this.#table = table;

        this.#cell = {
            name: colName+String(rowName),
            rowName: String(rowName),
            colName: colName,
            rowNumber: Number.parseInt(rowName),
            colNumber: colName.charCodeAt(0) - this.#deltaA,
            value: "",
            formula : "",
            isFormula: false
        };

        this.addEventListener("click", this.hardlerClick );
    }

    /**
     * Получение имени ячейки в формате А1
     */
    get name() {
        return this.#cell.name;
    }


    getCellName(colNumber, rowNumber) {
        return String.fromCharCode(colNumber+this.#deltaA)+String(rowNumber);
    }
    
    /**
     * Получение имени строки ячейки в текстовом виде 
     */
    get rowName() {
        return this.#cell.rowName;
    }

    /**
     * Получение имени колонки в текстовом виде
     */
    get colName() {
        return this.#cell.colName;
    }

    /**
     * Получение номера строки в числовом виде
     */
    get rowNumber() {
        return this.#cell.rowNumber;
    }

    /**
     * Получение номера полонки в числовом виде
     */
    get colNumber() {
        return this.#cell.colNumber;
    }

    /**
     * Получение значения ячейки в числовом формате для числа и текстовом для строки
     */
    get value() {
        return this.#cell.value;
    }

    /**
     * Получение формулы ячейки, для первичного взначения возврат этого значения в текстовом виде
     */
    get formula() {
        return this.#cell.formula;
    }

    /**
     * Установка нового значения ячейки
     */
    set value(value){
        if ( value && value.toString().charAt(0) === '=') {
            this.#cell.value = value;
            this.#cell.formula = String(value);
            this.#cell.isFormula = true;
        }
        else {
            this.#cell.value = value;
            this.#cell.formula = String(value);
            this.#cell.isFormula = false;
        }
        this.refresh();
    }

    refresh() {
        this.innerHTML = this.#cell.value;
    }

    /**
     * Обработка нажатия мыши
     * @param {MouseEvent} event событие мыши
     */
    hardlerClick(event) {
        this.#table.setCursor(this.#cell.name);
    }
}

// регистрация нового html-элемента
customElements.define('b-cell', Cell);