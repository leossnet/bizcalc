/**
 * Основной класс клиентского приложения
 */
class App {
    #root;
    #components;
    #blayout;
    #tlayout;

    /**
     * Конструктор клиентского приложения
     * @param {String} appSelector id корневого узла приложения
     * @param {Object} param различные параметры приложенич
     */
    constructor (appSelector, param) {
        this.#root = document.querySelector(appSelector);
        this.#components = new Map();

        // добавление менеджеров размещения компонентов на интерфейсе (компоновщиков)
        this.#blayout = new BorderLayout(this.#root, [LayoutRegion.TOP, LayoutRegion.CENTER, LayoutRegion.BOTTOM]);
        this.#tlayout = new GridLayout(this.#root, 2, 1);
        this.#blayout.add(this.#tlayout, LayoutRegion.TOP);

        // регистрация компонентов в приложении
        this.addComponent("btSave", new Button("Сохранить..."));
        this.addComponent("editor", new Editor(this.#root, {}));
        this.addComponent("table", new Table (this.#root, { 
            rowCount: param.rowCount, colCount: param.colCount, isFocus: true 
        }));

        // размещение компонентов на интерфейсе
        this.#tlayout.add(this.getComponent("btSave"), 0, 0);
        this.#tlayout.add(this.getComponent("editor"), 0, 1);
        this.#blayout.add(this.getComponent("table"), LayoutRegion.CENTER);
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

