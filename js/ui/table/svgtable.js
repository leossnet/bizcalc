/**
 * Класс таблицы, основанной на SVG
 */
class SvgTable extends HTMLElement {
    #app;
    #xmlns = "http://www.w3.org/2000/svg";

    constructor(app, params) {
        super();
        this.#app = app;
        this.generateTable(params);
    }

    generateTable(params) {
        let boxWidth = 80 * params.colCount;
        let boxHeight = 20 * params.rowCount;
        let width = boxWidth * 0.9;
        let height = boxHeight * 0.9;

        let table = document.createElementNS (this.#xmlns, "svg");
        table.setAttributeNS (null, "viewBox", "0 0 "+width+" "+height);
        table.setAttributeNS (null, "width", width);
        table.setAttributeNS (null, "height", height);

        let x = 0;
        let y = 0;
        for (let row=0; row<params.rowCount; row++) {
            x = 0;
            for (let col=0; col<params.colCount; col++) {
                table.append(this.createCell(x, y, 80, 20));
                x += 80;
            }
            y += 20;
        }

        this.append(table);
    }

    createCell(x, y, width, height) {
        let cell = document.createElementNS (this.#xmlns, "rect");
        cell.setAttributeNS (null, "width", width);
        cell.setAttributeNS (null, "height", height);
        cell.setAttributeNS (null, "x", x);
        cell.setAttributeNS (null, "y", y);
        return cell;
    }

    /**
     * Обрабочик, вызываемой после добавления компонента в документ
     */
     connectedCallback() { 
         console.log("connectedCallback");
    }

    /**
     * Массив пользовательских атрибутов, значения которых отслеживаются процедурой attributeChangedCallback
     */
    static get observedAttributes() {
        return ["id"];
    }

    /**
     * Обработчик события изменения значений пользовательских атрибутов, возвращаемых observedAttributes
     * @param {String} name - имя атрибута 
     * @param {String} oldValue - предыдущее значение атрибута
     * @param {String} newValue - новое значение атрибута
     */
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name);
    }    

}
customElements.define('svg-table', SvgTable); 