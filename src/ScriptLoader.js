class ScriptLoader {
    constructor(list = [], check = () => true) {
        this._list = list;
        this._check = check;
        this._promises = [];
        this._dependencePromises = [];

        if (this._check() === true) {
            return this.run();
        }
        return new Promise((resolve, reject) => {
            reject('check function return false');
        });
    }

    run() {
        for (const module of this._list) {
            if (typeof module === 'string') {
                this._promises.push(this._handler(module));
            } else if (Array.isArray(module)) {
                this._dependencePromises.push(new ScriptLoader(module));
            }
        }

        return this._wait();
    }

    _handler(module) {
        return new Promise((resolve, reject) => {
            const resultModuleInfo = ScriptLoader._registry[module]
            if (resultModuleInfo === undefined) {
                ScriptLoader._registry[module] = {
                    status: false,
                    callback: [],
                };

                this._load(module)
                    .then((source) => {
                        this._add(source, module)
                            .then(() => {
                                ScriptLoader._registry[module].status = true;
                                ScriptLoader._trig(module);
                                resolve();
                            })
                            .catch((...error) => {
                                console.error(error);
                                reject(error)
                            });
                    })
                    .catch((...error) => {
                        console.error(error);
                        reject(error)
                    });
            } else if (resultModuleInfo.status === true) {
                resolve();
            } else {
                ScriptLoader._on(module, () => resolve());
            }
        });
    }

    _load(module) {
        return new Promise((resolve, reject) => {
            fetch(module)
                .then((loadResult) => {
                    loadResult.text()
                        .then((readResult) => {
                            resolve(readResult);
                        })
                        .catch((...error) => {
                            console.error(error);
                            reject(error)
                        })
                })
                .catch((...error) => {
                    console.error(error);
                    reject(error)
                })
        });
    }

    _add(sourceScript, moduleName) {
        return new Promise((resolve, reject) => {
            Promise.all(this._dependencePromises)
                .then(() => {
                    const head = document.getElementsByTagName('head')[0];
                    const script = document.createElement('script');
                    script.dataset.src = moduleName;
                    head.appendChild(script);
                    script.appendChild(document.createTextNode(sourceScript));
                    resolve();
                })
        })
    }

    _wait() {
        return new Promise((resolve, reject) => {
            Promise.all([...this._promises, ...this._dependencePromises])
                .then((...values) => {
                    resolve(...values);
                })
                .catch((...error) => {
                    console.error(error);
                    reject(error)
                });
        });
    }
}


ScriptLoader._on = (moduleName, f) => {
    const {callback} = ScriptLoader._registry[moduleName];
    callback.push(f);
}
ScriptLoader._trig = (moduleName) => {
    const {callback} = ScriptLoader._registry[moduleName];
    for (const f of callback) {
        f();
    }
    ScriptLoader._registry[moduleName].callback = [];
}
ScriptLoader._registry = {}

try {
    module.exports = ScriptLoader;
} catch (e) {
    window.SL = ScriptLoader;
}
