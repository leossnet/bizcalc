/**
 * Класс калькулятора, вычисляющего выражения с функциями, числами и ячейками электронных таблиц.
 * Аргументы функций указываются в круглых скобках, разделяемые точкой с запятой.
 */
class Calculator {
    #calcData;

    /**
     * Конструктор калькулятора
     * @param {CalcData} calcData - объект с данными ячеек, содержащих как формулы, так и первичные значения
     */
    constructor(calcData) {
        this.#calcData = calcData;
    }

    /**
     * Расчет значений для формулы
     * @param {String} formula агрумент может быть представлен как в виде формулы в виде строки,
     *      так и в виде массива токенов, на которые была предварительна разобрана формула в виде сроки.
     * Токен представляет собой объект вида { type: Types.xxx [, value: xxx] [, calc:xxx] [, pririty:xxx]}, 
     *      который получается в результате разбора формулы в виде строки функцией getTokens(String)
     */
    calc(formula){
        let tokens = Array.isArray(formula) ? formula : Token.getTokens(formula);
        let operators = [];
        let operands = [];
        let funcs = [];
        let params = new Map();
        tokens.forEach( token => {
            switch(token.type) {
                case Token.Types.Number : 
                    operands.push(token);
                    break;
                case Token.Types.Cell :
                    if (! this.#calcData ) throw new Error("Для калькулятора не определен источник данных ячеек");
                    operands.push(this.#calcData.getNumberToken(token));
                    break;
                case Token.Types.Function :
                    funcs.push(token);
                    params.set(token, []);
                    operators.push(token);             
                    break;
                case Token.Types.Semicolon :
                    this.calcExpression(operands, operators, 1);
                    let funcToken = operators[operators.length-2];  // получить имя функции из стека операторов
                    params.get(funcToken).push(operands.pop());     // извлечь из стека последний операнд и добавить его в параметы функции
                    break;
                case Token.Types.Operator :
                    this.calcExpression(operands, operators, token.priority);
                    operators.push(token);
                    break;
                case Token.Types.LeftBracket :
                    operators.push(token);
                    break;
                case Token.Types.RightBracket :
                    this.calcExpression(operands, operators, 1);
                    operators.pop();
                    // если последний оператор в стеке является функцией
                    if (operators.length && operators[operators.length-1].type == Token.Types.Function ) {
                        let funcToken = operators.pop();        // получить имя функции из стека операторов
                        let funcArgs = params.get(funcToken);   // получить массив токенов аргументов функции
                        let paramValues = [];
                        if ( operands.length ) {
                            // добавить последний аргумент функции
                            funcArgs.push(operands.pop());     
                            // получить массив значений всех аргументов функции
                            paramValues = funcArgs.map( item => item.value ); 
                        }
                        // вычислить значение функции и положить в стек операндов
                        operands.push(this.calcFunction(funcToken.calc, ...paramValues));  
                    }
                    break;
            }
        });
        this.calcExpression(operands, operators, 0);
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
            if ( isNaN(result) || !isFinite(result) ) result = 0;
            operands.push(new Token ( Token.Types.Number, result ));
        }
    }

    /**
     * Вычисление значений функции
     * @param {T} func - функция обработки аргументов
     * @param  {...Number} params - массив числовых значений аргументов
     */
    calcFunction(calc, ...params) {
        return new Token(Token.Types.Number, calc(...params));
    }
}


