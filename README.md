# BizCalc
Простая электронная таблица, поддерживающая операции сложения (+), вычитания (-), умножения (*), деления (/) и возведения в степень (^), а также скобки и унарный минус. Определение формулы начинается со знака равно (=).

Исходный код приложения написан в следующем стиле:
1. Весь функцонал приложения оформлен в виде классов, включая веб-компоненты, созданные путем расширения класса HTMLElement или его потомков.
2. Проект содержит только файлы *.js и *.css, а также единственный файл index.html, в котором устанавливаются глобальные параметры приложения и который используется в качестве точки входа в приложение. 
3. Код приложения написан в стандарте ES2015 без использования сторонних библиотек.
4. Все вычисления выполняются на стороне клиента.

В приложении реализованы следующие механизмы оптимизации:
1. Ячейки таблицы оформляются в виде объектов класса Cell.
2. В объекте ячейки сохраняются помимо выводимого на интерфейс текстового значения также ее тип (число, формула, строка) в виде атрибута класса ValueTypes, числовое значение, строка формулы и строка текста. 
3. В источнике данных TableData веб-компонета таблицы используются следующие Map-кеши с ключами в виде текстового имени ячейки:
* объекты ячеек класса Cell, которые инициализируются в момент запуска приложения;
* массивы токенов класса Token, на которые разбиваются строки формул при их первичном вводе и последующем редактировании;
* вводимые и редактируемые числовые значения типа Number.

