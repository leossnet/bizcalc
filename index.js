/**
 * Основной класс клиентского приложения
 */
class App {
    #root;
    #components;
    #btPanel;
    #blayout;
    #tlayout;
    #fileName;

    /**
     * Конструктор клиентского приложения
     * @param {String} appSelector id корневого узла приложения
     * @param {Object} param различные параметры приложенич
     */
    constructor (appSelector, param) {
        this.#root = document.querySelector(appSelector);
        this.#components = new Map();
        this.#fileName = 'filename.json';

        // добавление менеджеров размещения компонентов на интерфейсе (компоновщиков)
        this.#blayout = new BorderLayout(this.#root, [LayoutRegion.TOP, LayoutRegion.CENTER, LayoutRegion.BOTTOM]);
        this.#tlayout = new GridLayout(this.#root, 3, 1);
        this.#blayout.add(this.#tlayout, LayoutRegion.TOP);

        // настройка кнопочной панели
        const buttons = {
            file: { name: "Файл",
                checked: true,
                buttons: [
                    { name: "btOpen", label: "Открыть...", handler: this.handlerClickButton },
                    { name: "btSave", label: "Сохранить...", handler: this.handlerClickButton }
                ]
            },
            main: { name: "Главная",
                buttons: [
                    { name: "btCalc", label: "Рассчитать", handler: this.handlerClickButton },
                    { name: "btFixArea", label: "Закрепить области", handler: this.handlerClickButton }
                ]
            },
            info: { name: "Справка",
                buttons: [
                    { name: "btInfo", label: "Справка", handler: this.handlerClickButton }
                ]
            }
        };
        this.#btPanel = new ButtonPanel(this, buttons);        
        this.addComponents(this.#btPanel.components);

        // регистрация простых компонентов
        this.addComponent("navbar", new Navbar(this, {}));
        this.addComponent("editor", new Editor(this, {}));
        this.addComponent("table", new Table (this, { 
            rowCount: param.rowCount, colCount: param.colCount, isFocus: true 
        }));

        // размещение компонентов на интерфейсе
        this.#tlayout.add(this.#btPanel, 1, 0);
        this.#tlayout.add(this.getComponent("navbar"), 0, 0);
        this.#tlayout.add(this.getComponent("editor"), 2, 0);
        this.#blayout.add(this.getComponent("table"), LayoutRegion.CENTER);

        this.getComponent("table").focus();
    }

    /**
     * Получение корневого узла приложения
     */
    get root() {
        return this.#root;
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

    /**
     * Обработчик щелчка мыши по кнопке
     * @param {ClickEvent} event 
     */
    handlerClickButton(event) {
        switch(event.target.id) {
            case "btSave" :
                this.app.saveJSON(this.app.getComponent("table").tableData.getData());
                break;
            case "btOpen" :
                this.app.openJSON(this.app.getComponent("table").tableData);
                break;
        }
    }

    /**
     * Сохранение JSON в файл на локальном диске
     * @param {JSON} json 
     */
    saveJSON(json) {
        let output = document.createElement("a");
        let jsonData = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
        output.href = jsonData;
        output.target = '_blank';
        output.download = this.#fileName;
        output.click();
    }

    /**
     * Выбор файла JSON для его открытия в приложении
     */
    openJSON(target) {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept=".json";
        input.onchange = (event) => { 
            let file = event.target.files[0];
            this.#fileName = file.name;
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => { target.setData(reader.result); }
            reader.onerror = () => { target.setData(reader.error); }
        };
        input.click();            
    }

}

