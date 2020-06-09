/**
 * Класс, реализующий курсор активной ячейки таблицы
 */
class Cursor extends HTMLElement{
    #printKeyCodes = new Set ([
        48,49,50,51,52,53,54,55,56,57, // цифры основной клавиатуры
        65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,  // латинские буквы
        96,97,98,99,100,101,102,103,104,105, // цифры цифрового блока
        106,107,109,110,111, // прочие символы цифрового блока
        186,187,188,189,190,191,192, // прочие символы и русские буквы
        219,220,221,222 // прочие символы и русские буквы
    ]);

    #cell;
    #editValue;
    #initValue;
    #table;
    #isEdit;

    /**
     * Конструктор курсора таблицы
     * @param {Table} table 
     */
    constructor(table) {
        super();
        this.#table = table;
        this.#isEdit = false;
        this.tabIndex = -1;
    }

    /**
     * Присвоение курсору нового объекта ячейки Cell
     */
    set cell(cell){
        this.#cell = cell;
        this.#cell.innerHTML = "";
        this.#cell.append(this);
        this.value = cell.value;
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
        return this.#editValue;
    }

    set value (value) {
        this.#editValue = value;
        this.innerHTML = value;
    }

    /**
     * Проверка на нахождение редактора в режимер редактирования
     */
    get edit() {
        return this.#isEdit;
    }

    /**
     * Установка/снятие режима редактирования значения текущей ячейки
     */
    set edit(isEdit) {
        this.#isEdit = isEdit;
        if ( isEdit ) {
            this.classList.add("edit");
        }
        else {
            this.classList.remove("edit");
            // this.#table.focus();
        }
    }

    /**
     * Проверка на вхождение кода символа в перечень печатаемых символов
     * @param {Number} keyCode 
     */
    isPrintKey(keyCode) {
        return this.#printKeyCodes.has(keyCode);
    }

    /**
     * Добавление символа к значению текущей ячейки таблицы
     * @param {EventKey} keyEvent 
     */
    addKey(keyEvent) {
        if ( this.isPrintKey(keyEvent.keyCode) ) {
            this.value += keyEvent.key;
        }
    }

    /**
     * Удаление крайнего справа символа значения ячейки
     */
    removeLastKey() {
        let strValue = String(this.value);
        if ( strValue.length ) {
            this.value = strValue.substring(0, strValue.length-1);
        }
    }

    /**
     * Начало редактирования содержимого курсора ячейки
     */
    beginEditing() {
        this.edit = true;
        this.#initValue = this.#editValue;
        this.focus();
    }

    /**
     * Начало ввода данных в текущую ячейку с удалением ранее введенного значения
     */
    beginInput() {
        this.isEdit = true;
        this.#initValue = this.#editValue;
        this.value = "";
        this.focus();
    }

    /**
     * Завершение редактирования содержимого курсора ячейки с сохранением сделанных изменений
     */
    endEditing() {
        this.isEdit = false;
        this.#cell.value = this.value;
        this.#table.focus();
    }

    /**
     * Отмена редактирования содержимого курсора ячейки без сохранения сделанных изменений
     */    
    escapeEditing() {
        this.isEdit = false;
        this.value = this.#initValue;
        this.#table.focus();
    }

    /**
     * Удаление содержимого текущей ячейки 
     */    
    clearValue() {
        this.#cell.value = "";
    }

    /**
     * Получение объекта таблицы, на которой размещен курсор 
     */
//     get table() {
//         return this.#table;
//     }
}

// регистрация нового html-элемента
customElements.define('b-cursor', Cursor);