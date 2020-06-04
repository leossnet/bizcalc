/**
 * Класс, реализующий функционал редактора содержимого курсора ячейки таблицы
 */
class Editor extends HTMLInputElement{
    #cursor;
    #isEditing;
    
    /**
     * Конструктор редактора содеражимого курсора ячейки
     * @param {Cursor} cursor курсор, значения которого обрабатываются редактором
     */
    constructor(cursor) {
        super();
        this.#cursor = cursor;
        this.#isEditing = false;
        this.id="editor";

        this.addEventListener("keydown", this.handlerKey);
        this.addEventListener("focus", this.handlerFocus);
        this.addEventListener("blur", this.handlerBlur);
    }

    /**
     * Начало редактирования содержимого курсора ячейки
     */
    beginEditing() {
        this.value = this.#cursor.innerHTML;
        this.#cursor.innerHTML = "";
        this.#cursor.append(this);
        this.#isEditing = true;
        this.tabIndex = -1;
        this.focus();
        console.log("begin editing...");
    }

    /**
     * Завершение редактирования содержимого курсора ячейки с сохранением сделанных изменений
     */
    endEditing() {
        this.#cursor.remove(this);
        this.#isEditing = false;
        console.log("end editing.");
    }

    /**
     * Отмена редактирования содержимого курсора ячейки без сохранения сделанных изменений
     */    
    escapeEditing() {
        this.#cursor.remove(this);
        this.#isEditing = false;
        console.log("escape editing.");
    }

    /**
     * Проверка на нахождение редактора в режимер редактирования
     */
    get isEditing() {
        return this.#isEditing;
    }

    /**
     * Обработка нажатия клавиш при нахождении в режиме редактирования
     * @param {KeyEvent} event
     */
    handlerKey(event) {
        this.focus();
    }

    /**
     * Обработка событий при получении редактором фокуса
     * @param {FocusEvent} event
     */
    handlerFocus(event) {
        console.log(event);
    }

    /**
     * Обработка событий при потере редактором фокуса
     * @param {FocusEvent} event 
     */
    handlerBlur(event) {
        console.log(event);
        this.#cursor.table.focus();
    }    
}

// регистрация нового html-элемента
customElements.define('b-input', Editor, {extends: 'input'});