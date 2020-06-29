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
     * @params {String} appSelector id корневого узла приложения
     * @params {Object} params различные параметры приложенич
     */
    constructor (appSelector, params) {
        this.#root = document.querySelector(appSelector);
        this.#components = new Map();
        this.#fileName = 'filename.json';

        // добавление менеджеров размещения компонентов на интерфейсе (компоновщиков)
        this.#blayout = new BorderLayout(this.#root);
        this.#tlayout = new GridLayout(this.#root, 3, 1);
        this.#blayout.add(this.#tlayout, LayoutRegion.TOP);

        // настройка кнопочной панели
        const buttons = {
            file: { name: "Файл",
                checked: true,
                buttons: [
                    { name: "btOpen", label: "Открыть...", handler: this.handlerClickButton, icon: "folder-open" },
                    { name: "btSave", label: "Сохранить...", handler: this.handlerClickButton, icon: "save" }
                ]
            },
            main: { name: "Главная",
                buttons: [
                    { name: "btCalc", label: "Рассчитать", handler: this.handlerClickButton, icon: "calculator" }
                ]
            },
            view: { name: "Вид", 
                buttons: [
                    { name: "btFixArea", label: "Закрепить", handler: this.handlerClickButton, icon: "table" }
                ]
            },
            info: { name: "Справка",
                buttons: [
                    { name: "btInfo", label: "Справка", handler: this.handlerClickButton, icon: "info-circle" }
                ]
            }
        };
        this.#btPanel = new ButtonPanel(this, buttons);        
        this.addComponents(this.#btPanel.components);

        // регистрация простых компонентов
        this.addComponent("navbar", new Navbar(this, {}));
        this.addComponent("editor", new Editor(this, {}));
        const tableParams = {
            table1: {
                name: "Лист 1",
                checked: true,
                params: { rowCount: params.rowCount, colCount: params.colCount, isFocus: true }
            },
            table2: {
                name: "Лист 2",
                params: { rowCount: params.rowCount, colCount: params.colCount, isFocus: true }
            }
        };
        this.addComponent("tablePanel", new TablePanel(this, tableParams));
        this.addComponent("infobar", new Infobar(this, {}));

        // размещение компонентов на интерфейсе
        this.#tlayout.add(this.#btPanel, 1, 0);
        this.#tlayout.add(this.getComponent("navbar"), 0, 0);
        this.#tlayout.add(this.getComponent("editor"), 2, 0);
        this.#blayout.add(this.getComponent("tablePanel"), LayoutRegion.CENTER);
        this.#blayout.add(this.getComponent("infobar"), LayoutRegion.BOTTOM);

        this.getComponent("tablePanel").currentTable.focus();
    }

    /**
     * Получение корневого узла приложения
     */
    get root() {
        return this.#root;
    }

    get editor() {
        return this.#components.get("editor");
    }

    /**
     * Регистрация нового компонента в приложении
     * @params {String} componentName - имя компонента
     * @params {Object} component - объект компонента
     */
    addComponent(componentName, component) {
        this.#components.set(componentName, component);
    }

    /**
     * Добавление нескольких заранее подготовленных компонетов
     * @params {Map} components хеш компонетов
     */
    addComponents (components) {
        for ( let component of components.values()) {
            this.#components.set(component.name, component);
        }
    }

    /**
     * Получение зарегистрированного компонента по его имени
     * @params {String} componentName 
     */
    getComponent(componentName) {
        return this.#components.get(componentName);
    }

    /**
     * Обработчик щелчка мыши по кнопке
     * @params {ClickEvent} event 
     */
    handlerClickButton(event) {
        switch(event.target.id) {
            case "btSave" :
                this.app.saveJSON(this.app.getComponent("tablePanel").currentTable.tableData.getData());
                break;
            case "btOpen" :
                this.app.openJSON(this.app.getComponent("tablePanel").currentTable.tableData);
                break;
        }
    }

    /**
     * Сохранение JSON в файл на локальном диске
     * @params {JSON} json 
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
            this.getComponent("infobar").content = "Последний открытый файл: '"+file.name+"'";
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => { target.setData(reader.result); }
            reader.onerror = () => { target.setData(reader.error); }
        };
        input.click();
    }

}

