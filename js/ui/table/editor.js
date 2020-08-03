/**
 * Класс редактора содержимого текущей ячейки таблицы
 */
class Editor extends HTMLDivElement {
    #app;
    #cellInput;
    #cellName;
    #cellType;
    #btEscape;
    #btEnter;

    /**
     * Конструктор редактора содержимого текущей ячейки таблицы
     * @param {Object} app ссылка на объект приложения
     * @param {Object} params - набор опциональных атрибутов в формате ключ:значение
     */
    constructor(app, params) {
        super();
        this.#app = app;
        this.generateEditor();
        this.tabIndex = -1;
        this.addEventListener("keydown", this.handlerKeyDown);
        this.addEventListener("input", this.handlerInput);
        this.addEventListener("focus", this.handlerFocus, true);
    }
    
    /**
     * Генерация внешнего вида редактора содержимого текущей ячейки таблицы
     */
    generateEditor() {
        // this.id = this.#app.root.id+"Editor";
        this.classList.add("table-editor");

        this.#cellName = document.createElement("input");
        this.#cellName.classList.add("cell-name");
        this.append(this.#cellName);

        this.#cellType = document.createElement("div");
        this.#cellType.classList.add("cell-type");
        this.append(this.#cellType);

        this.#btEscape = new Button(this.#app, { name: "btEscape", shortcut: "Escape", handler: this.handlerClickButton, img: "escape.ico" });
        this.#cellType.append(this.#btEscape);
        this.#btEnter = new Button(this.#app, { name: "btEnter", shortcut: "Enter", handler: this.handlerClickButton, img: "enter.ico" });
        this.#cellType.append(this.#btEnter);
        
        let img = document.createElement("img");
        img.src = "res/ico/function.ico";
        img.classList.add("cell-input-img");
        this.#cellType.append(img);



        this.#cellInput = document.createElement("input");
        this.#cellInput.classList.add("cell-input");
        // this.#cellInput.tabIndex = -1;
        this.append(this.#cellInput);
    }

    /**
     * Получение объекта приложения 
     * @returns {Object} - объект приложения
     */
    get app() {
        return this.#app;
    }

    /**
     * Получение имени редактируемой ячейки
     * @returns {String} - имя ячейки
     */
    get cellName() {
        return this.#cellName.value;
    }

    /**
     * Установление имени редактируемой ячейки в окне текущей ячейки
     */
    set cellName(cellName) {
        this.#cellName.value = cellName;
    }

    /**
     * Получение введенного значения ячейки
     */
    get value() {
        return this.#cellInput.value;
    }

    /**
     * Установление значения ячейки для редактирования
     */
    set value(value) {
        this.#cellInput.value = value;
    }

    /**
     * Установление фокуса в форму ввода панели редактирования формул
     */
    focus() {
        this.#cellInput.focus();
    }


    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     */
    connectedCallback() { 
        this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
        this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
    }

    /**
     * Массив пользовательских атрибутов, значения которых отслеживаются процедурой attributeChangedCallback
     */
    static get observedAttributes() {
        return ["cursor-cell", "view-width", "view-height"];
    } 

    /**
     * Обработка нажатия кнопок в строке формул
     * @param {KeyboardEvent} event - событие нажатия клавиши
     */
    handlerKeyDown(event) {
        let table = this.#app.getComponent("table");
        let cursor = table.cursor;
        switch(event.key) {
            case "Enter" :
                cursor.cell.buffer = event.target.value;
                cursor.endEditing();
                break;
            case "Escape" : 
                cursor.cell = cursor.cell;
                table.focus();
                break;
        }
    }

    /**
     * Обработка щелчка мыши при нажатии на кнопки панели формул
     * @param {MouseEvent} event - событие щелчка мыши
     */
    handlerClickButton(event) {
        let button = event.path.filter( item => item.localName == "button").map(item => item.id)[0];
        let editor = document.querySelector(".table-editor");
        let table = editor.app.getComponent("table");
        let cursor = table.cursor;
        switch(button) {
            case "btEnter" :
                cursor.cell.buffer = editor.value;
                cursor.endEditing();
                break;
            case "btEscape" :
                cursor.cell = cursor.cell;
                table.focus();
                break;
        }
    }

    /**
     * Обработка получения фокуса панели формул
     * @param {FocusEvent} focusEvent - событие получения фокуса
     */
    handlerFocus(focusEvent) {
        this.#app.getComponent("table").cursor.cell.buffer = this.value;
    }

    /**
     * Обработка вводимых символов
     * @param {InputEvent} inputEvent - событие нажатия клавиш
     */
    handlerInput(inputEvent) {
        let cell = this.#app.getComponent("table").cursor.cell;
        this.buffer = inputEvent.target.value;
        cell.firstChild.textContent = this.buffer;
    }

}

// регистрация нового html-элемента
customElements.define('table-editor', Editor, {extends: 'div'});