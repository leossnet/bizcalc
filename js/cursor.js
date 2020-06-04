/**
 * Класс, реализующий курсор активной ячейки таблицы
 */
class Cursor extends HTMLElement{
    #cell;
    #cellValue;
    #table;
    #editor;

    /**
     * Конструктор курсора таблицы
     * @param {Table} table 
     */
    constructor(table) {
        super();
        this.#table = table;
        this.#editor = new Editor(this);
        this.addEventListener("keydown", this.handlerKey);
    }

    /**
     * Присвоение курсору нового объекта ячейки Cell
     */
    set cell(cell){
        this.#cell = cell;
        this.#cellValue = this.#cell.value;
        this.#cell.innerHTML = "";
        this.innerHTML = this.#cellValue;
        this.#cell.append(this);
    }

    /**
     * Получение объекта ячейки Cell, на которой расположен курсор
     */
    get cell() {
        return this.#cell;
    }

    /**
     * Получение значения ячейки, на которой расположен курсов
     */
    get value() {
        return this.#cellValue;
    }

    /**
     * Получение объекта редактора курсора текущей ячейки 
     */
    get editor() {
        return this.#editor;
    }

    /**
     * Получение объекта таблицы, на которой размещен курсор 
     */
    get table() {
        return this.#table;
    }


}

// регистрация нового html-элемента
customElements.define('b-cursor', Cursor);