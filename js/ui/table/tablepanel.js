/**
 * Класс, реализующий поддержку вкладок таблицы
 */
class TablePanel extends HTMLDivElement {
    #app;
    #currentSection;

    /**
     * Конструктор класса вкладок таблиц
     * @param {Object} app - объект приложения
     * @param {Object} tables объект с первоначальными параметрами таблиц для каждой вкладки в формате
     *  tables = {
     *      {String}: { name: {String}, checked: {Boolean}, params: { rowCount: {Number}, colCount: {Number}, isFocus: {Boolean} } },
     *      {String}: { name: {String}, params: { rowCount: {Number}, colCount: {Number}, isFocus: {Boolean} } },
     *      ...
     *  };
     */
    constructor(app, tables) {
        super();
        this.#app = app;
        this.classList.add("table-panel");
        
        this.generateTablePanel(app, tables);
        this.addEventListener("click", this.handlerClick);

        let currentInput = this.querySelector("input");
        currentInput.setAttribute("checked", true);
        this.#currentSection = this.querySelector("#"+currentInput.getAttribute("target"));
        this.#currentSection.style.display = "block";
        app.root.append(this);
    }

    /**
     * Генерация содержимого элемента
     * @param {Object} app - объект приложения
     * @param {Object} tables - объект с первоначальными параметрами таблиц для каждой вкладки 
     */
    generateTablePanel(app, tables) {
        for (let tableTab in tables) {
            let section = document.createElement("section");
            section.id = "content-" + tableTab;
            section.style.display = "none";
            section.append(new Table(app, tables[tableTab].params));
            this.append(section);
        }
        for (let tableTab in tables) {
            let input = document.createElement("input");
            input.id = tableTab;
            input.type = "radio";
            input.name = "tab-panel";
            input.style.display = "none";
            input.style.position = "absolute";
            input.setAttribute("target", "content-" + tableTab);
            this.append(input);

            let label = document.createElement("label");
            label.setAttribute("for", tableTab);
            label.title = tables[tableTab].name;
            label.style.display = "inline-block";
            label.innerHTML = tables[tableTab].name;
            this.append(label);
        }
    }

    /**
     * Получение текущей видимой секции с таблицей
     */
    get currentSection() {
        return this.#currentSection;
    }

    /**
     * Установление ткущей видимой секции таблицы
     */
    set currentSection(section) {
        this.currentSection.style.display = "none";
        this.#currentSection = section;
        this.currentSection.style.display = "block";
    }

    /**
     * Обработка щелчка мыши по вкладке 
     * @param {ClickEvent} event 
     */
    handlerClick (event) {
        if  (event.target.getAttribute("target")) {
            this.currentSection = document.querySelector("#"+event.target.getAttribute("target"));
        }
    }
}

// регистрация нового компонента
customElements.define('table-panel', TablePanel, {extends: 'div'}); 
