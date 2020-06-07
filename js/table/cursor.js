/**
 * Класс, реализующий курсор активной ячейки таблицы
 */
class Cursor extends HTMLElement{
    #cell;
    #cellValue;
    #table;
    #isEditing;

    /**
     * Конструктор курсора таблицы
     * @param {Table} table 
     */
    constructor(table) {
        super();
        this.#table = table;
        this.#isEditing = false;
        // this.addEventListener("keydown", this.handlerKey);
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

    set value (value) {
        this.#cellValue = value;
        this.innerHTML = value;
    }

    /**
     * Проверка на нахождение редактора в режимер редактирования
     */
    get isEditing() {
        return this.#isEditing;
    }

    addKey(key) {
        this.value += key;
        console.log(key);
    }

    /**
     * Начало редактирования содержимого курсора ячейки
     */
    beginEditing() {
        this.hidden = false;
        this.innerHTML = "";
        this.#isEditing = true;
        this.tabIndex = 0;
        this.focus();
        console.log("begin editing...");
    }

    /**
     * Завершение редактирования содержимого курсора ячейки с сохранением сделанных изменений
     */
    endEditing() {
        this.#isEditing = false;
        this.innerHTML = this.value;
        console.log(this);
        console.log("end editing. value='"+this.value+"'");
        this.hidden = true;
        this.#table.focus();
    }

    /**
     * Отмена редактирования содержимого курсора ячейки без сохранения сделанных изменений
     */    
    escapeEditing() {
        this.hidden = true;
        this.#isEditing = false;
        this.#table.focus();
        console.log("escape editing");
    }

    /**
     * Обработка нажатия клавиш при нахождении в режиме редактирования
     * @param {KeyEvent} event
     */
    handlerKey(event) {
        this.value += this.value+event.key;
        this.focus();
        console.log(event);
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