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
     * @param {String} appName id корневого узла приложения
     * @param {Object} param различные параметры приложенич
     */
    constructor (appName, param) {
        this.#root = document.querySelector("#"+appName);

        this.appendElement(this.#butPanel, "label", appName+"Label", "Кнопки");
        this.appendElement(this.#editFormula, "input", appName+"Input");

        this.#table = new Table (appName, { rowCount: param.rowCount, colCount: param.colCount });
        this.#table.id = appName+"Table";
        this.#root.append(this.#table);
        this.#table.focus();
    }

    /**
     * Добавление нового компонента в приложение 
     * @param {Object} root узел приложения
     * @param {String} elemName - имя элемента
     * @param {String} elemId - id элемента
     * @param {String} elemInner - содержимое элемента (опционально)
     */
    appendElement(root, elemName, elemId, elemInner) {
        root = document.createElement(elemName);
        root.id = elemId;
        if ( elemInner ) root.innerHTML = elemInner;
        this.#root.append (root);
    }
}

