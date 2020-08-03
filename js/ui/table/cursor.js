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
        219,220,221,222, // прочие символы и русские буквы
        32 // пробел
    ]);

    #app;
    #cell;
    #table;
    #isEdit;
    #editor; // поле редактирования содержимого ячейки над таблицей

    /**
     * Конструктор курсора таблицы
     * @param {Object} table 
     */
    constructor(app, table) {
        super();
        this.#app = app;
        this.#table = table;
        this.#isEdit = false;
        this.classList.add("table-cursor");
        this.setAttribute("contenteditable", false);
        this.#editor = this.#app.editor;
        this.tabIndex = -1;
    }

    /**
     * Присвоение курсору нового объекта ячейки Cell
     */
    set cell(cell){
        if ( this.#cell ) {
            this.#cell.classList.remove("cell-cursor");
            this.#table.getLeftCell(this.#cell).classList.remove("left-cell-cursor")
            this.#table.getTopCell(this.#cell).classList.remove("top-cell-cursor")
        }
        this.#cell = cell;
        this.setEditableValue(this.#editor);
        this.#editor.cellName = this.#cell.data.name;
        this.#cell.append(this);

        this.#cell.classList.add("cell-cursor");
        this.#table.getLeftCell(this.#cell).classList.add("left-cell-cursor");
        this.#table.getTopCell(this.#cell).classList.add("top-cell-cursor");
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
        return this.#cell.data.value;
    }

    /**
     * Установление нового значения курсора
     */
    set value (value) {
        this.#cell.data.value = value;
    }

    /**
     * Проверка на нахождение редактора в режимер редактирования
     */
    get isEdit() {
        return this.#isEdit;
    }

    /**
     * Установка/снятие режима редактирования значения текущей ячейки
     */
    set isEdit(isEdit) {
        this.#isEdit = isEdit;
        if ( isEdit ) {
            this.#cell.setAttribute("contenteditable", true);
            this.#cell.addEventListener("input", this.handlerInput);
        }
        else {
            this.#cell.removeAttribute("contenteditable");
            this.#cell.removeEventListener("input", this.handlerInput);
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
     * Удаление содержимого текущей ячейки 
     */    
    clearValue() {
        this.#table.tableData.pushBuffer(this.#cell.data);
        this.value = undefined;
        this.#editor.value = "";
    }

    /**
     * Начало редактирования содержимого курсора ячейки
     */
    beginEditing() {
        this.isEdit = true;
        this.#cell.buffer = this.value;
        this.#cell.focus();
    }

    /**
     * Передача html-элементу значения для редактирования или отображения
     * @param {HTMLElement} target 
     */
    setEditableValue(targetElement) {
        switch(this.#cell.data.type) {
            case ValueTypes.Formula : 
                targetElement.value = this.#cell.data.formula;
                break;
            case ValueTypes.Number :
                targetElement.value = this.#cell.data.number;
                break;
            case ValueTypes.String :
                targetElement.value = this.#cell.data.string;
                break;
            default :
                targetElement.value = "";
                break;
        }
    }    

    /**
     * Начало ввода данных в текущую ячейку с удалением ранее введенного значения
     */
    beginInput() {
        this.isEdit = true;
        this.#editor.value = "";
        this.#cell.firstChild.textContent = "";
        this.#cell.buffer = "";
        this.#cell.focus();
    }

    /**
     * Завершение редактирования содержимого курсора ячейки с сохранением сделанных изменений
     */
    endEditing() {
        this.isEdit = false;
        if ( String(this.value) !== this.#cell.buffer ) {
            this.#table.tableData.pushBuffer(this.#cell.data);
            this.value = this.#cell.buffer;
        }
        this.#table.focus();
    }

    /**
     * Отмена редактирования содержимого курсора ячейки без сохранения сделанных изменений
     */    
    escapeEditing() {
        this.isEdit = false;
        this.#cell.firstChild.textContent = this.value;
        this.#table.focus();
    }

    /**
     * Обработка нажатия клавиш
     * @param {KeyEvent} keyEvent - событие нажатия клавиш
     */
    handlerInput(keyEvent) {
        this.buffer += keyEvent.data;
        this.editor.value = this.buffer;
    }

}

// регистрация нового html-элемента
customElements.define('table-cursor', Cursor);