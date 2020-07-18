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

        this.addEventListener("change", this.handlerChange);

        window.addEventListener("resize", () => { 
            this.setAttribute("view-width", getComputedStyle(this.parentElement).width); 
            this.setAttribute("view-height", getComputedStyle(this.parentElement).height); 
        });
    }
    
    generateEditor() {
        // this.id = this.#app.root.id+"Editor";
        this.classList.add("table-editor");

        this.#cellName = document.createElement("input");
        this.#cellName.classList.add("cell-name");
        this.append(this.#cellName);

        this.#cellType = document.createElement("div");
        this.#cellType.classList.add("cell-type");
        this.append(this.#cellType);

        this.#btEscape = new Button(this.#app, { name: "btEscape", handler: this.handlerClickButton, img: "escape.ico" });
        this.#cellType.append(this.#btEscape);
        this.#btEnter = new Button(this.#app, { name: "btEnter", handler: this.handlerClickButton, img: "enter.ico" });
        this.#cellType.append(this.#btEnter);
        
        let img = document.createElement("img");
        img.src = "res/ico/function.ico";
        img.classList.add("cell-input-img");
        this.#cellType.append(img);



        this.#cellInput = document.createElement("input");
        this.#cellInput.classList.add("cell-input");
        this.#cellInput.tabIndex = -1;
        this.append(this.#cellInput);
    }


    get cellName() {
        return this.#cellName.value;
    }

    set cellName(cellName) {
        this.#cellName.value = cellName;
    }

    get value() {
        return this.#cellInput.value;
    }

    set value(value) {
        this.#cellInput.value = value;
    }

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
     * Обработка окончания ввода данных в строке формул
     * @param {Event} Event 
     */
    handlerChange(event) {
        let cursor = this.#app.getComponent("table").getCursor();
        cursor.value = this.value;
        cursor.endEditing();
        cursor.cell = cursor.cell;
    }

    /**
     * Обработка нажатия кнопко на панели типов данных строки формул
     * @param {Event} Event 
     */
    handlerClickButton(event) {
        console.log(event);

    }

}

// регистрация нового html-элемента
customElements.define('table-editor', Editor, {extends: 'div'});