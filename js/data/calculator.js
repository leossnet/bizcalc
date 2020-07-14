/**
 * Класс калькулятора, вычисляющего простые выражения с числами и ячейками электронных таблиц
 */
class Calculator {
    #tdata;

    /**
     * Конструктор калькулятора
     * @param {Map} cells хеш ячеек, содержащих формулы, в которых другие ячейки ссылаются на первичные значения
     */
    constructor(tableData) {
        this.#tdata = tableData;
    }

    /**
     * Расчет значений для формулы
     * @param {String} formula агрумент может быть представлен как в виде формулы в виде строки,
     *      так и в виде массива токенов, на которые была предварительна разобрана формула в виде сроки.
     * Токен представляет собой объект вида { type: Types.xxx [, value: xxx] [, calc:xxx] [, pririty:xxx]}, 
     *      который получается в результате разбора формулы в виде строки функцией getTokens(String)
     */
    calc(formula){
        let self = this;
        let tokens = Array.isArray(formula) ? formula : Token.getTokens(formula);
        let operators = [];
        let operands = [];
        tokens.forEach(function (token) {
            switch(token.type) {
                case Types.Number : 
                    operands.push(token);
                    break;
                case Types.Cell :
                    if ( self.#tdata.isNumber(token.value) ) {
                        operands.push(self.#tdata.getNumberToken(token));
                    }
                    else if ( self.#tdata.isFormula(token.value) ) {
                        let formula = self.#tdata.getTokens(token.value);
                        operands.push(new Token(Types.Number, self.calc(formula)));
                    }
                    else {
                        operands.push(NaN);
                    }
                    break;
                case Types.Operator :
                    self.calcExpression(operands, operators, token.priority);
                    operators.push(token);
                    break;
                case Types.LeftBracket :
                    operators.push(token);
                    break;
                case Types.RightBracket :
                    self.calcExpression(operands, operators, 1);
                    operators.pop();
                    break;
            }
        });
        self.calcExpression(operands, operators, 0);
        return operands.pop().value; 
    }

    /**
     * Вычисление подвыражения внутри (без) скобок
     * @param {Array} operands массив операндов
     * @param {Array} operators массив операторов 
     * @param {Number} minPriority минимальный приоритет для вычисления выражения
     */
    calcExpression (operands, operators, minPriority) {
        while ( operators.length && ( operators[operators.length-1].priority ) >= minPriority ) {
            let rightOperand = operands.pop().value;
            let leftOperand = operands.pop().value;
            let operator = operators.pop();
            let result = operator.calc(leftOperand, rightOperand);
            operands.push(new Token ( Types.Number, result ));
        }
    }

    calcFunction() {

    }
}
