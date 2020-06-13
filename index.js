/**
 * Основной класс клиентского приложения
 */
class App {
    #root; 
    #butPanel;
    #editFormula;
    #table;

    /**
     * Конструктор клиентского приложения
     * @param {String} appSelector id корневого узла приложения
     * @param {Object} param различные параметры приложенич
     */
    constructor (appSelector, param) {
        this.#root = document.querySelector(appSelector);

        // this.appendElement(this.#butPanel, "label", appSelector+"Label", "Кнопки");
        this.appendElement(this.#editFormula, "input", this.#root.id+"Input");

        this.#table = new Table (this.#root, { rowCount: param.rowCount, colCount: param.colCount });
        this.#table.focus();
    }

    /**
     * Добавление нового компонента в приложение 
     * @param {Object} root узел приложения
     * @param {String} elemName - имя элемента
     * @param {String} elemId - id элемента
     * @param {String} elemInner - содержимое элемента (опционально)
     */
    appendElement(element, elemName, elemId, elemInner) {
        element = document.createElement(elemName);
        element.id = elemId;
        if ( elemInner ) element.innerHTML = elemInner;
        this.#root.append (element);
    }
}

