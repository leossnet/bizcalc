/**
 * Основной класс клиентского приложения
 */
class App {
    #root;
    #components;
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
        this.#components = new Map();

        // this.appendElement(this.#butPanel, "label", appSelector+"Label", "Кнопки");

        this.addComponent("editor", new Editor(this.#root, {}));

        this.addComponent("table", new Table (this.#root, { 
            rowCount: param.rowCount, colCount: param.colCount, isFocus: true 
        }));
    }

    /**
     * Регистрация нового компонента в приложении
     * @param {String} componentName - имя компонента
     * @param {Object} component - объект компонента
     */
    addComponent(componentName, component) {
        this.#components.set(componentName, component);
    }

    /**
     * Получение зарегистрированного компонента по его имени
     * @param {String} componentName 
     */
    getComponent(componentName) {
        return this.#components.get(componentName);
    }
}

