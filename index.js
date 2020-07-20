/**
 * Основной класс клиентского приложения
 */
class App {
    #root;
    #components;
    #btPanel;
    #flayout;
    #tlayout;
    #fileName;

    /**
     * Конструктор клиентского приложения
     * @params {String} appSelector id корневого узла приложения
     * @params {Object} params различные параметры приложенич
     */
    constructor (appSelector, params) {
        console.time("app");
        this.#root = document.querySelector(appSelector);
        this.#components = new Map();
        this.#fileName = 'filename.json';

        // добавление менеджеров размещения компонентов на интерфейсе (компоновщиков)
        this.#flayout = new FlexLayout(this.#root);
        this.#tlayout = new GridLayout(this.#root, 3, 1);
        this.#flayout.add(this.#tlayout, Space.TOP);

        // настройка кнопочной панели
        const buttons = {
            file: { name: "Файл",
                checked: true,
                buttons: [
                    { name: "btOpen", label: "Открыть...", shortcut: "Ctrl+O", handler: this.handlerClickButton, img: "open.ico" },
                    { name: "btSave", label: "Сохранить...", shortcut: "Ctrl+S", handler: this.handlerClickButton, img: "save.ico" },
                    { name: "btClose", label: "Закрыть", shortcut: "Ctrl+W", handler: this.handlerClickButton, img: "close_file.ico" }
                ]
            },
            main: { name: "Главная",
                buttons: [
                    { name: "btCalc", label: "Обновить", handler: this.handlerClickButton, img: "update.ico" }
                ]
            },
            view: { name: "Вид", 
                buttons: [
                    { name: "btFixArea", label: "Закрепить", handler: this.handlerClickButton, img: "merge_cells.ico" }
                ]
            },
            info: { name: "Справка",
                buttons: [
                    { name: "btInfo", label: "Справка", handler: this.handlerClickButton, img: "property.ico" }
                ]
            }
        };
        this.#btPanel = new ButtonPanel(this, buttons);        
        this.addComponents(this.#btPanel.components);

        // регистрация простых компонентов
        this.addComponent("navbar", new Navbar(this, {}));
        let editor = new Editor(this, {});
        this.addComponent("editor", editor);
        // const tablePanelParams = {
        //     table1: {
        //         name: "Лист 1",
        //         checked: true,
        //         params: { rowCount: params.rowCount, colCount: params.colCount, isFocus: true }
        //     },
        //     table2: {
        //         name: "Лист 2",
        //         params: { rowCount: params.rowCount, colCount: params.colCount, isFocus: true }
        //     }
        // };
        // this.addComponent("tablePanel", new TablePanel(this, tablePanelParams));

        const tableParams = {
            colCount: params.colCount,
            rowCount: params.rowCount,
            colWidths: [40, 240],  // ширина первых двух колонок таблицы
            editor: editor,
            isFocus: true
        };
        let table = new Table(this, tableParams);
        this.addComponent("table", table);

        this.addComponent("infobar", new Infobar(this, {}));

        // размещение компонентов на интерфейсе
        this.#tlayout.add(this.#btPanel, 1, 0);
        this.#tlayout.add(this.getComponent("navbar"), 0, 0);
        this.#tlayout.add(this.getComponent("editor"), 2, 0);
        
        // this.#flayout.add(this.getComponent("tablePanel"), Space.CENTER);
        this.#flayout.add(this.getComponent("table"), Space.CENTER);
        // this.#flayout.add("Просто текст", Space.CENTER);

        this.#flayout.add(this.getComponent("infobar"), Space.BOTTOM);

        // this.getComponent("tablePanel").currentTable.focus();
        this.getComponent("table").focus();

        console.timeEnd("app");
        window.addEventListener("keydown", this.handlerKeyDown);
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
     * Обработка нажатия клавиш
     * @param {KeyDownEvent} event - событие нажатия клавиш
     */
    handlerKeyDown(event) {
        let table = document.querySelector("table.table");
        let tableData = table.tableData;
        if ( event.ctrlKey ) {
            switch(event.keyCode) {
                case 83 : // Ctrl+S - сохранение текущей таблицы в JSON-файл
                    event.preventDefault();
                    table.app.saveJSON(tableData);
                    break;
                case 79 : // Ctrl+O - загрузка JSON-файла в текущую таблицу
                    event.preventDefault();
                    table.app.loadJSON(tableData);
                    break;
                case 81 : // Ctrl+Q - отчистка текущей таблицы
                    tableData.clearData();
                    tableData.asyncIndexedClear();
                    break;
            }
        }
    }

    /**
     * Обработчик щелчка мыши по кнопке
     * @params {ClickEvent} event 
     */
    handlerClickButton(event) {
        let button = event.path.filter( item => item.localName == "button").map(item => item.id)[0];
        let tableData = this.app.getComponent("table").tableData;
        switch(button) {
            case "btSave" :
                // this.app.saveJSON(this.app.getComponent("tablePanel").currentTable.tableData);
                this.app.saveJSON(tableData);
                break;
            case "btOpen" :
                // this.app.openJSON(this.app.getComponent("tablePanel").currentTable.tableData);
                this.app.loadJSON(tableData);
                break;
            case "btClose" :
                tableData.clearData();
                tableData.asyncIndexedClear();
                break;
            }
    }

    /**
     * Сохранение JSON в файл на локальном диске
     * @params {JSON} json 
     */
    saveJSON(target) {
        let output = document.createElement("a");
        let jsonData = 'data:application/json;charset=utf-8,' + encodeURIComponent(target.saveData());
        output.href = jsonData;
        output.target = '_blank';
        output.download = this.#fileName;
        output.click();
    }

    /**
     * Выбор файла JSON для его открытия в приложении
     */
    loadJSON(target) {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept=".json";
        input.onchange = (event) => { 
            let file = event.target.files[0];
            this.#fileName = file.name;
            // LocalDB.testBase64(file);
            this.getComponent("infobar").content = "Последний открытый файл: '"+file.name+"'";
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => { target.loadData(reader.result); }
            reader.onerror = () => { target.loadData(reader.error); }
        };
        input.click();
    }

}

