/**
 * Основной класс клиентского приложения
 */
class App {
    #root;
    #components;
    #btPanel;
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

        // регистрация состаных компонентов
        this.#btPanel = new ButtonPanel([
            {name: "btOpen", label: "Открыть..."},
            {name: "btSave", label: "Сохранить..."}
        ]);
        this.addComponents(this.#btPanel.components);

        // регистрация простых компонентов
        this.addComponent("editor", new Editor(this.#root, {}));
        this.addComponent("table", new Table (this.#root, { 
            rowCount: param.rowCount, colCount: param.colCount, isFocus: true 
        }));

        // размещение компонентов на интерфейсе
        this.#tlayout.add(this.#btPanel, 0, 0);
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
     * Добавление нескольких заранее подготовленных компонетов
     * @param {Map} components хеш компонетов
     */
    addComponents (components) {
        for ( let component of components.values()) {
            this.#components.set(component.name, component);
        }
    }

    /**
     * Получение зарегистрированного компонента по его имени
     * @param {String} componentName 
     */
    getComponent(componentName) {
        return this.#components.get(componentName);
    }
}

