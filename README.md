# ScriptLoader
-----

Загрузка массива скриптов
```javascript
new SL(['/script.js', '/script2.js']);
```

Вторым аргументом передается функция проверки, нужно ли сейчас загружать скрипты, по умолчанию ``true``.
```javascript
new SL(['/script.js'], () => document.querySelectorAll('.element').length !== 0);
```

Если у скриптов есть зависимости, то они передаются бесконечным вложенным массивом. В начале грузятся зависимости. При этом, при повторе зависимостей SL не будет грузить их снова.
```javascript
new SL([
    '/script.js',
    [
        'moduleA.js',
        'moduleB.js',
    ]
]);

new SL([
    '/script2.js',
    [
        'moduleB.js',
        'moduleC.js',
        [
            'moduleD.js',
        ]
    ]
]);
```
