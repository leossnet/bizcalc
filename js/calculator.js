/**
 * Объект с типами операндов
 */
const Types = {
    Cell: "Переменная" ,
    Number: "Число" ,
    Operator: "Оператор" ,
    LeftBracket: "Левая скобка" , 
    RightBracket: "Правая скобка",
    Text: "Текст"
};

/**
 * Объект, содержащий символы операторов, для каждого из которых указаны:
 * 1. Приоритет выполнения оператора
 * 2. Функция, вызываемая для обработки оператора
 */
const Operators = {
    ["+"]: { priority: 1, calc: function (a, b) { return a + b; } },
    ["-"]: { priority: 1, calc: function (a, b) { return a - b; } }, 
    ["*"]: { priority: 2, calc: function (a, b) { return a * b; } },
    ["/"]: { priority: 2, calc: function (a, b) { return a / b; } },
    ["^"]: { priority: 3, calc: function (a, b) { return Math.pow(a, b); } }
};


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
            if ( token.type == Types.Number ) {
                operands.push(token);
            }
            else if ( token.type == Types.Cell ){
                if ( self.#tdata.hasValue(token.value) ) {
                    operands.push(self.#tdata.getNumberToken(token));
                }
                else if ( self.#tdata.hasTokens(token.value) ) {
                    let formula = self.#tdata.getTokens(token.value);
                    operands.push(new Token(Types.Number, {value: self.calc(formula)} ));
                }
                else operands.push(NaN);
            }
            else if ( token.type == Types.Operator ) {
                self.calcExpression(operands, operators, token.priority);
                operators.push(token);
            }
            else if ( token.type == Types.LeftBracket ) {
                operators.push(token);
            }
            else if ( token.type == Types.RightBracket ) {
                self.calcExpression(operands, operators, 1);
                operators.pop();
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
            operands.push( { type: Types.Number, value: result } );
        }
    }

    /**
     * Разбирает формулу на токены 
     * @param {Sring} formula строка с формулой
     */
    // getTokens(formula){
    //     let self = this;
    //     let tokens = [];
    //     let tokenCodes = formula.replace(/\s+/g, "")                // очистка от пробельных символов
    //         .replace(/,/g, ".")                                     // заменяет запятую на точку (для чисел)
    //         .replace(/^\-/g, "0-")                                  // подставляет отсутсующий 0 для знака "-" в начале строки
    //         .replace(/\(\-/g, "(0-")                                // подставляет отсутсующий 0 для знака "-" в середине строки
    //         .replace(new RegExp (this.sepPattern, "g"), "&$&&")     // вставка знака & перед разделителями
    //         .split("&")                                             // разбиение на токены по знаку &
    //         .filter(item => item != "");                            // удаление из массива пустых элементов
        
    //     tokenCodes.forEach(function (tokenCode){
    //         if ( tokenCode in Operators ) 
    //             tokens.push( { type: Types.Operator, calc: Operators[tokenCode].calc, priority: Operators[tokenCode].priority } );
    //         else if ( tokenCode === "(" )  
    //             tokens.push ( { type: Types.LeftBracket, value: tokenCode } );
    //         else if ( tokenCode === ")" ) 
    //             tokens.push ( { type: Types.RightBracket, value: tokenCode } );
    //         else if ( tokenCode.match(/^\d+[.]?\d*/g) !== null ) 
    //             tokens.push ( { type: Types.Number, value: Number(tokenCode) } ); 
    //         else if ( tokenCode.match(/^[A-Z]+[1-9]+/g) !== null )
    //             tokens.push ( { type: Types.Cell, value: tokenCode } );
    //     });
    //     // console.log(tokens);
    //     return tokens;
    // }

    /**
     * Экранирование обратным слешем специальных символов
     * @param {String} str 
     */
    // escape(str) {
    //     return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // }
}


/**
 * Вспомогательный класс для наглядного определения токена формулы
 */
class Token {

    static separators = Object.keys(Operators).join("")+"()"; // запоминает строку разделителей вида "+-*/^()""
    static sepPattern = `[${Token.escape(Token.separators)}]`; // формирует шаблон разделитетей вида "[\+\-\*\/\^\(\)]"

    #type;
    #value;
    #calc;
    #priority;


    /**
     * Конструктор токена, в котором обязательным параметром задается тип токена, 
     * а прочие параметры устанавливаются в зависимости от типа
     * @param {Types} type 
     * @param {Array} params 
     */
    constructor(type, params){
        this.#type = type;
        this.#value = params.value;
        this.#calc = params.calc;
        this.#priority = params.priority;
    }

    get type() {
        return this.#type;
    }

    get value() {
        return this.#value;
    }

    get calc() {
        return this.#calc;
    }

    get priority() {
        return this.#priority;
    }

    /**
     * Разбирает формулу на токены 
     * @param {Sring} formula строка с формулой
     */
    static getTokens(formula){
        let tokens = [];
        let tokenCodes = formula.replace(/\s+/g, "")                // очистка от пробельных символов
            .replace(/,/g, ".")                                     // заменяет запятую на точку (для чисел)
            .replace(/^\-/g, "0-")                                  // подставляет отсутсующий 0 для знака "-" в начале строки
            .replace(/\(\-/g, "(0-")                                // подставляет отсутсующий 0 для знака "-" в середине строки
            .replace(new RegExp (Token.sepPattern, "g"), "&$&&")     // вставка знака & перед разделителями
            .split("&")                                             // разбиение на токены по знаку &
            .filter(item => item != "");                            // удаление из массива пустых элементов
        
        tokenCodes.forEach(function (tokenCode){
            if ( tokenCode in Operators ) 
                tokens.push( new Token ( Types.Operator, { calc: Operators[tokenCode].calc, priority: Operators[tokenCode].priority } ));
            else if ( tokenCode === "(" )  
                tokens.push ( new Token ( Types.LeftBracket, { value: tokenCode } ));
            else if ( tokenCode === ")" ) 
                tokens.push ( new Token ( Types.RightBracket, { value: tokenCode } ));
            else if ( tokenCode.match(/^\d+[.]?\d*/g) !== null ) 
                tokens.push ( new Token ( Types.Number, { value: Number(tokenCode) } )); 
            else if ( tokenCode.match(/^[A-Z]+[1-9]+/g) !== null )
                tokens.push ( new Token ( Types.Cell, { value: tokenCode } ));
        });
        return tokens;
    }

    /**
     * Экранирование обратным слешем специальных символов
     * @param {String} str 
     */    
    static escape(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }    
}