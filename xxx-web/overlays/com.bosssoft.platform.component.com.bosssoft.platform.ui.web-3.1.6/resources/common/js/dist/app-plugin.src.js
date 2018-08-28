/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, https://github.com/requirejs/requirejs/blob/master/LICENSE
 */
//Not using strict: uneven strict support in browsers, #392, and causes
//problems with requirejs.exec()/transpiler plugins that may not be strict.
/*jslint regexp: true, nomen: true, sloppy: true */
/*global window, navigator, document, importScripts, setTimeout, opera */

var requirejs, require, define;
(function (global, setTimeout) {
    var req, s, head, baseElement, dataMain, src,
        interactiveScript, currentlyAddingScript, mainScript, subPath,
        version = '2.3.3',
        commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        jsSuffixRegExp = /\.js$/,
        currDirRegExp = /^\.\//,
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
        isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
        //PS3 indicates loaded and complete, but need to wait for complete
        //specifically. Sequence is 'loading', 'loaded', execution,
        // then 'complete'. The UA check is unfortunate, but not sure how
        //to feature test w/o causing perf issues.
        readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
                      /^complete$/ : /^(complete|loaded)$/,
        defContextName = '_',
        //Oh the tragedy, detecting opera. See the usage of isOpera for reason.
        isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
        contexts = {},
        cfg = {},
        globalDefQueue = [],
        useInteractive = false;

    //Could match something like ')//comment', do not lose the prefix to comment.
    function commentReplace(match, singlePrefix) {
        return singlePrefix || '';
    }

    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Helper function for iterating over an array backwards. If the func
     * returns a true value, it will break out of the loop.
     */
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1; i -= 1) {
                if (ary[i] && func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value &&
                        !isArray(value) && !isFunction(value) &&
                        !(value instanceof RegExp)) {

                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    //Similar to Function.prototype.bind, but the 'this' object is specified
    //first, since it is easier to read/figure out what 'this' will be.
    function bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    function scripts() {
        return document.getElementsByTagName('script');
    }

    function defaultOnError(err) {
        throw err;
    }

    //Allow getting a global that is expressed in
    //dot notation, like 'a.b.c'.
    function getGlobal(value) {
        if (!value) {
            return value;
        }
        var g = global;
        each(value.split('.'), function (part) {
            g = g[part];
        });
        return g;
    }

    /**
     * Constructs an error with a pointer to an URL with more information.
     * @param {String} id the error ID that maps to an ID on a web page.
     * @param {String} message human readable error.
     * @param {Error} [err] the original error, if there is one.
     *
     * @returns {Error}
     */
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + '\nhttp://requirejs.org/docs/errors.html#' + id);
        e.requireType = id;
        e.requireModules = requireModules;
        if (err) {
            e.originalError = err;
        }
        return e;
    }

    if (typeof define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof requirejs !== 'undefined') {
        if (isFunction(requirejs)) {
            //Do not overwrite an existing requirejs instance.
            return;
        }
        cfg = requirejs;
        requirejs = undefined;
    }

    //Allow for a require config object
    if (typeof require !== 'undefined' && !isFunction(require)) {
        //assume it is a config object.
        cfg = require;
        require = undefined;
    }

    function newContext(contextName) {
        var inCheckLoaded, Module, context, handlers,
            checkLoadedTimeoutId,
            config = {
                //Defaults. Do not set a default for map
                //config to speed up normalize(), which
                //will run faster if there is no default.
                waitSeconds: 7,
                baseUrl: './',
                paths: {},
                bundles: {},
                pkgs: {},
                shim: {},
                config: {}
            },
            registry = {},
            //registry of just enabled modules, to speed
            //cycle breaking code when lots of modules
            //are registered, but not activated.
            enabledRegistry = {},
            undefEvents = {},
            defQueue = [],
            defined = {},
            urlFetched = {},
            bundlesMap = {},
            requireCounter = 1,
            unnormalizedCounter = 1;

        /**
         * Trims the . and .. from an array of path segments.
         * It will keep a leading path segment if a .. will become
         * the first path segment, to help with module name lookups,
         * which act like paths, but can be remapped. But the end result,
         * all paths that use this function should look normalized.
         * NOTE: this method MODIFIES the input array.
         * @param {Array} ary the array of path segments.
         */
        function trimDots(ary) {
            var i, part;
            for (i = 0; i < ary.length; i++) {
                part = ary[i];
                if (part === '.') {
                    ary.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        ary.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
        }

        /**
         * Given a relative module name, like ./something, normalize it to
         * a real name that can be mapped to a path.
         * @param {String} name the relative name
         * @param {String} baseName a real name that the name arg is relative
         * to.
         * @param {Boolean} applyMap apply the map config to the value. Should
         * only be done if this normalization is for a dependency ID.
         * @returns {String} normalized name
         */
        function normalize(name, baseName, applyMap) {
            var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex,
                foundMap, foundI, foundStarMap, starI, normalizedBaseParts,
                baseParts = (baseName && baseName.split('/')),
                map = config.map,
                starMap = map && map['*'];

            //Adjust any relative paths.
            if (name) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // If wanting node ID compatibility, strip .js from end
                // of IDs. Have to do this here, and not in nameToUrl
                // because node allows either .js or non .js to map
                // to same file.
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                // Starts with a '.' so need the baseName
                if (name[0].charAt(0) === '.' && baseParts) {
                    //Convert baseName to array, and lop off the last part,
                    //so that . matches that 'directory' and not name of the baseName's
                    //module. For instance, baseName of 'one/two/three', maps to
                    //'one/two/three.js', but we want the directory, 'one/two' for
                    //this normalization.
                    normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                    name = normalizedBaseParts.concat(name);
                }

                trimDots(name);
                name = name.join('/');
            }

            //Apply map config if available.
            if (applyMap && map && (baseParts || starMap)) {
                nameParts = name.split('/');

                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    nameSegment = nameParts.slice(0, i).join('/');

                    if (baseParts) {
                        //Find the longest baseName segment match in the config.
                        //So, do joins on the biggest to smallest lengths of baseParts.
                        for (j = baseParts.length; j > 0; j -= 1) {
                            mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

                            //baseName segment has config, find if it has one for
                            //this name.
                            if (mapValue) {
                                mapValue = getOwn(mapValue, nameSegment);
                                if (mapValue) {
                                    //Match, update name to the new value.
                                    foundMap = mapValue;
                                    foundI = i;
                                    break outerLoop;
                                }
                            }
                        }
                    }

                    //Check for a star map match, but just hold on to it,
                    //if there is a shorter segment match later in a matching
                    //config, then favor over this star map.
                    if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
                        foundStarMap = getOwn(starMap, nameSegment);
                        starI = i;
                    }
                }

                if (!foundMap && foundStarMap) {
                    foundMap = foundStarMap;
                    foundI = starI;
                }

                if (foundMap) {
                    nameParts.splice(0, foundI, foundMap);
                    name = nameParts.join('/');
                }
            }

            // If the name points to a package's name, use
            // the package main instead.
            pkgMain = getOwn(config.pkgs, name);

            return pkgMain ? pkgMain : name;
        }

        function removeScript(name) {
            if (isBrowser) {
                each(scripts(), function (scriptNode) {
                    if (scriptNode.getAttribute('data-requiremodule') === name &&
                            scriptNode.getAttribute('data-requirecontext') === context.contextName) {
                        scriptNode.parentNode.removeChild(scriptNode);
                        return true;
                    }
                });
            }
        }

        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
                //Pop off the first array value, since it failed, and
                //retry
                pathConfig.shift();
                context.require.undef(id);

                //Custom require that does not do map translation, since
                //ID is "absolute", already mapped/resolved.
                context.makeRequire(null, {
                    skipMap: true
                })([id]);

                return true;
            }
        }

        //Turns a plugin!resource to [plugin, resource]
        //with the plugin being undefined if the name
        //did not have a plugin prefix.
        function splitPrefix(name) {
            var prefix,
                index = name ? name.indexOf('!') : -1;
            if (index > -1) {
                prefix = name.substring(0, index);
                name = name.substring(index + 1, name.length);
            }
            return [prefix, name];
        }

        /**
         * Creates a module mapping that includes plugin prefix, module
         * name, and path. If parentModuleMap is provided it will
         * also normalize the name via require.normalize()
         *
         * @param {String} name the module name
         * @param {String} [parentModuleMap] parent module map
         * for the module name, used to resolve relative names.
         * @param {Boolean} isNormalized: is the ID already normalized.
         * This is true if this call is done for a define() module ID.
         * @param {Boolean} applyMap: apply the map config to the ID.
         * Should only be true if this map is for a dependency.
         *
         * @returns {Object}
         */
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts,
                prefix = null,
                parentName = parentModuleMap ? parentModuleMap.name : null,
                originalName = name,
                isDefine = true,
                normalizedName = '';

            //If no name, then it means it is a require call, generate an
            //internal name.
            if (!name) {
                isDefine = false;
                name = '_@r' + (requireCounter += 1);
            }

            nameParts = splitPrefix(name);
            prefix = nameParts[0];
            name = nameParts[1];

            if (prefix) {
                prefix = normalize(prefix, parentName, applyMap);
                pluginModule = getOwn(defined, prefix);
            }

            //Account for relative paths if there is a base name.
            if (name) {
                if (prefix) {
                    if (isNormalized) {
                        normalizedName = name;
                    } else if (pluginModule && pluginModule.normalize) {
                        //Plugin is loaded, use its normalize method.
                        normalizedName = pluginModule.normalize(name, function (name) {
                            return normalize(name, parentName, applyMap);
                        });
                    } else {
                        // If nested plugin references, then do not try to
                        // normalize, as it will not normalize correctly. This
                        // places a restriction on resourceIds, and the longer
                        // term solution is not to normalize until plugins are
                        // loaded and all normalizations to allow for async
                        // loading of a loader plugin. But for now, fixes the
                        // common uses. Details in #1131
                        normalizedName = name.indexOf('!') === -1 ?
                                         normalize(name, parentName, applyMap) :
                                         name;
                    }
                } else {
                    //A regular module.
                    normalizedName = normalize(name, parentName, applyMap);

                    //Normalized name may be a plugin ID due to map config
                    //application in normalize. The map config values must
                    //already be normalized, so do not need to redo that part.
                    nameParts = splitPrefix(normalizedName);
                    prefix = nameParts[0];
                    normalizedName = nameParts[1];
                    isNormalized = true;

                    url = context.nameToUrl(normalizedName);
                }
            }

            //If the id is a plugin id that cannot be determined if it needs
            //normalization, stamp it with a unique ID so two matching relative
            //ids that may conflict can be separate.
            suffix = prefix && !pluginModule && !isNormalized ?
                     '_unnormalized' + (unnormalizedCounter += 1) :
                     '';

            return {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ?
                        prefix + '!' + normalizedName :
                        normalizedName) + suffix
            };
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id]);
                }
            } else {
                mod = getModule(depMap);
                if (mod.error && name === 'error') {
                    fn(mod.error);
                } else {
                    mod.on(name, fn);
                }
            }
        }

        function onError(err, errback) {
            var ids = err.requireModules,
                notified = false;

            if (errback) {
                errback(err);
            } else {
                each(ids, function (id) {
                    var mod = getOwn(registry, id);
                    if (mod) {
                        //Set error on module, so it skips timeout checks.
                        mod.error = err;
                        if (mod.events.error) {
                            notified = true;
                            mod.emit('error', err);
                        }
                    }
                });

                if (!notified) {
                    req.onError(err);
                }
            }
        }

        /**
         * Internal method to transfer globalQueue items to this context's
         * defQueue.
         */
        function takeGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                each(globalDefQueue, function(queueItem) {
                    var id = queueItem[0];
                    if (typeof id === 'string') {
                        context.defQueueMap[id] = true;
                    }
                    defQueue.push(queueItem);
                });
                globalDefQueue = [];
            }
        }

        handlers = {
            'require': function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            },
            'exports': function (mod) {
                mod.usingExports = true;
                if (mod.map.isDefine) {
                    if (mod.exports) {
                        return (defined[mod.map.id] = mod.exports);
                    } else {
                        return (mod.exports = defined[mod.map.id] = {});
                    }
                }
            },
            'module': function (mod) {
                if (mod.module) {
                    return mod.module;
                } else {
                    return (mod.module = {
                        id: mod.map.id,
                        uri: mod.map.url,
                        config: function () {
                            return getOwn(config.config, mod.map.id) || {};
                        },
                        exports: mod.exports || (mod.exports = {})
                    });
                }
            }
        };

        function cleanRegistry(id) {
            //Clean up machinery used for waiting modules.
            delete registry[id];
            delete enabledRegistry[id];
        }

        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;

            if (mod.error) {
                mod.emit('error', mod.error);
            } else {
                traced[id] = true;
                each(mod.depMaps, function (depMap, i) {
                    var depId = depMap.id,
                        dep = getOwn(registry, depId);

                    //Only force things that have not completed
                    //being defined, so still in the registry,
                    //and only if it has not been matched up
                    //in the module already.
                    if (dep && !mod.depMatched[i] && !processed[depId]) {
                        if (getOwn(traced, depId)) {
                            mod.defineDep(i, defined[depId]);
                            mod.check(); //pass false?
                        } else {
                            breakCycle(dep, traced, processed);
                        }
                    }
                });
                processed[id] = true;
            }
        }

        function checkLoaded() {
            var err, usingPathFallback,
                waitInterval = config.waitSeconds * 1000,
                //It is possible to disable the wait interval by using waitSeconds of 0.
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                noLoads = [],
                reqCalls = [],
                stillLoading = false,
                needCycleCheck = true;

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return;
            }

            inCheckLoaded = true;

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map,
                    modId = map.id;

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return;
                }

                if (!map.isDefine) {
                    reqCalls.push(mod);
                }

                if (!mod.error) {
                    //If the module should be executed, and it has not
                    //been inited and time is up, remember it.
                    if (!mod.inited && expired) {
                        if (hasPathFallback(modId)) {
                            usingPathFallback = true;
                            stillLoading = true;
                        } else {
                            noLoads.push(modId);
                            removeScript(modId);
                        }
                    } else if (!mod.inited && mod.fetched && map.isDefine) {
                        stillLoading = true;
                        if (!map.prefix) {
                            //No reason to keep looking for unfinished
                            //loading. If the only stillLoading is a
                            //plugin resource though, keep going,
                            //because it may be that a plugin resource
                            //is waiting on a non-plugin cycle.
                            return (needCycleCheck = false);
                        }
                    }
                }
            });

            if (expired && noLoads.length) {
                //If wait time expired, throw error of unloaded modules.
                err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
                err.contextName = context.contextName;
                return onError(err);
            }

            //Not expired, check for a cycle.
            if (needCycleCheck) {
                each(reqCalls, function (mod) {
                    breakCycle(mod, {}, {});
                });
            }

            //If still waiting on loads, and the waiting load is something
            //other than a plugin resource, or there are still outstanding
            //scripts, then just try back later.
            if ((!expired || usingPathFallback) && stillLoading) {
                //Something is still waiting to load. Wait for it, but only
                //if a timeout is not already in effect.
                if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0;
                        checkLoaded();
                    }, 50);
                }
            }

            inCheckLoaded = false;
        }

        Module = function (map) {
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.shim = getOwn(config.shim, map.id);
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];
            this.pluginMaps = {};
            this.depCount = 0;

            /* this.exports this.factory
               this.depMaps = [],
               this.enabled, this.fetched
            */
        };

        Module.prototype = {
            init: function (depMaps, factory, errback, options) {
                options = options || {};

                //Do not do more inits if already done. Can happen if there
                //are multiple define calls for the same module. That is not
                //a normal, common case, but it is also not unexpected.
                if (this.inited) {
                    return;
                }

                this.factory = factory;

                if (errback) {
                    //Register for errors on this module.
                    this.on('error', errback);
                } else if (this.events.error) {
                    //If no errback already, but there are error listeners
                    //on this module, set up an errback to pass to the deps.
                    errback = bind(this, function (err) {
                        this.emit('error', err);
                    });
                }

                //Do a copy of the dependency array, so that
                //source inputs are not modified. For example
                //"shim" deps are passed in here directly, and
                //doing a direct modification of the depMaps array
                //would affect that config.
                this.depMaps = depMaps && depMaps.slice(0);

                this.errback = errback;

                //Indicate this module has be initialized
                this.inited = true;

                this.ignore = options.ignore;

                //Could have option to init this module in enabled mode,
                //or could have been previously marked as enabled. However,
                //the dependencies are not known until init is called. So
                //if enabled previously, now trigger dependencies as enabled.
                if (options.enabled || this.enabled) {
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    this.check();
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true;
                    this.depCount -= 1;
                    this.depExports[i] = depExports;
                }
            },

            fetch: function () {
                if (this.fetched) {
                    return;
                }
                this.fetched = true;

                context.startTime = (new Date()).getTime();

                var map = this.map;

                //If the manager is for a plugin managed resource,
                //ask the plugin to load it now.
                if (this.shim) {
                    context.makeRequire(this.map, {
                        enableBuildCallback: true
                    })(this.shim.deps || [], bind(this, function () {
                        return map.prefix ? this.callPlugin() : this.load();
                    }));
                } else {
                    //Regular dependency.
                    return map.prefix ? this.callPlugin() : this.load();
                }
            },

            load: function () {
                var url = this.map.url;

                //Regular dependency.
                if (!urlFetched[url]) {
                    urlFetched[url] = true;
                    context.load(this.map.id, url);
                }
            },

            /**
             * Checks if the module is ready to define itself, and if so,
             * define it.
             */
            check: function () {
                if (!this.enabled || this.enabling) {
                    return;
                }

                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                if (!this.inited) {
                    // Only fetch if not already in the defQueue.
                    if (!hasProp(context.defQueueMap, id)) {
                        this.fetch();
                    }
                } else if (this.error) {
                    this.emit('error', this.error);
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true;

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            //If there is an error listener, favor passing
                            //to that instead of throwing an error. However,
                            //only do it for define()'d  modules. require
                            //errbacks should not be called for failures in
                            //their callbacks (#699). However if a global
                            //onError is set, use that.
                            if ((this.events.error && this.map.isDefine) ||
                                req.onError !== defaultOnError) {
                                try {
                                    exports = context.execCb(id, factory, depExports, exports);
                                } catch (e) {
                                    err = e;
                                }
                            } else {
                                exports = context.execCb(id, factory, depExports, exports);
                            }

                            // Favor return value over exports. If node/cjs in play,
                            // then will not have a return value anyway. Favor
                            // module.exports assignment over exports object.
                            if (this.map.isDefine && exports === undefined) {
                                cjsModule = this.module;
                                if (cjsModule) {
                                    exports = cjsModule.exports;
                                } else if (this.usingExports) {
                                    //exports already set the defined value.
                                    exports = this.exports;
                                }
                            }

                            if (err) {
                                err.requireMap = this.map;
                                err.requireModules = this.map.isDefine ? [this.map.id] : null;
                                err.requireType = this.map.isDefine ? 'define' : 'require';
                                return onError((this.error = err));
                            }

                        } else {
                            //Just a literal value
                            exports = factory;
                        }

                        this.exports = exports;

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports;

                            if (req.onResourceLoad) {
                                var resLoadMaps = [];
                                each(this.depMaps, function (depMap) {
                                    resLoadMaps.push(depMap.normalizedMap || depMap);
                                });
                                req.onResourceLoad(context, this.map, resLoadMaps);
                            }
                        }

                        //Clean up
                        cleanRegistry(id);

                        this.defined = true;
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false;

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    }

                }
            },

            callPlugin: function () {
                var map = this.map,
                    id = map.id,
                    //Map already normalized the prefix.
                    pluginMap = makeModuleMap(map.prefix);

                //Mark this as a dependency for this plugin, so it
                //can be traced for cycles.
                this.depMaps.push(pluginMap);

                on(pluginMap, 'defined', bind(this, function (plugin) {
                    var load, normalizedMap, normalizedMod,
                        bundleId = getOwn(bundlesMap, this.map.id),
                        name = this.map.name,
                        parentName = this.map.parentMap ? this.map.parentMap.name : null,
                        localRequire = context.makeRequire(map.parentMap, {
                            enableBuildCallback: true
                        });

                    //If current map is not normalized, wait for that
                    //normalized name to load instead of continuing.
                    if (this.map.unnormalized) {
                        //Normalize the ID if the plugin allows it.
                        if (plugin.normalize) {
                            name = plugin.normalize(name, function (name) {
                                return normalize(name, parentName, true);
                            }) || '';
                        }

                        //prefix and name should already be normalized, no need
                        //for applying map config again either.
                        normalizedMap = makeModuleMap(map.prefix + '!' + name,
                                                      this.map.parentMap,
                                                      true);
                        on(normalizedMap,
                            'defined', bind(this, function (value) {
                                this.map.normalizedMap = normalizedMap;
                                this.init([], function () { return value; }, null, {
                                    enabled: true,
                                    ignore: true
                                });
                            }));

                        normalizedMod = getOwn(registry, normalizedMap.id);
                        if (normalizedMod) {
                            //Mark this as a dependency for this plugin, so it
                            //can be traced for cycles.
                            this.depMaps.push(normalizedMap);

                            if (this.events.error) {
                                normalizedMod.on('error', bind(this, function (err) {
                                    this.emit('error', err);
                                }));
                            }
                            normalizedMod.enable();
                        }

                        return;
                    }

                    //If a paths config, then just load that file instead to
                    //resolve the plugin, as it is built into that paths layer.
                    if (bundleId) {
                        this.map.url = context.nameToUrl(bundleId);
                        this.load();
                        return;
                    }

                    load = bind(this, function (value) {
                        this.init([], function () { return value; }, null, {
                            enabled: true
                        });
                    });

                    load.error = bind(this, function (err) {
                        this.inited = true;
                        this.error = err;
                        err.requireModules = [id];

                        //Remove temp unnormalized modules for this module,
                        //since they will never be resolved otherwise now.
                        eachProp(registry, function (mod) {
                            if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
                                cleanRegistry(mod.map.id);
                            }
                        });

                        onError(err);
                    });

                    //Allow plugins to load other code without having to know the
                    //context or how to 'complete' the load.
                    load.fromText = bind(this, function (text, textAlt) {
                        /*jslint evil: true */
                        var moduleName = map.name,
                            moduleMap = makeModuleMap(moduleName),
                            hasInteractive = useInteractive;

                        //As of 2.1.0, support just passing the text, to reinforce
                        //fromText only being called once per resource. Still
                        //support old style of passing moduleName but discard
                        //that moduleName in favor of the internal ref.
                        if (textAlt) {
                            text = textAlt;
                        }

                        //Turn off interactive script matching for IE for any define
                        //calls in the text, then turn it back on at the end.
                        if (hasInteractive) {
                            useInteractive = false;
                        }

                        //Prime the system by creating a module instance for
                        //it.
                        getModule(moduleMap);

                        //Transfer any config to this other module.
                        if (hasProp(config.config, id)) {
                            config.config[moduleName] = config.config[id];
                        }

                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError('fromtexteval',
                                             'fromText eval for ' + id +
                                            ' failed: ' + e,
                                             e,
                                             [id]));
                        }

                        if (hasInteractive) {
                            useInteractive = true;
                        }

                        //Mark this as a dependency for the plugin
                        //resource
                        this.depMaps.push(moduleMap);

                        //Support anonymous modules.
                        context.completeLoad(moduleName);

                        //Bind the value of that module to the value for this
                        //resource ID.
                        localRequire([moduleName], load);
                    });

                    //Use parentName here since the plugin's name is not reliable,
                    //could be some weird string with no path that actually wants to
                    //reference the parentName's path.
                    plugin.load(map.name, localRequire, load, config);
                }));

                context.enable(pluginMap, this);
                this.pluginMaps[pluginMap.id] = pluginMap;
            },

            enable: function () {
                enabledRegistry[this.map.id] = this;
                this.enabled = true;

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true;

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler;

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap,
                                               (this.map.isDefine ? this.map : this.map.parentMap),
                                               false,
                                               !this.skipMap);
                        this.depMaps[i] = depMap;

                        handler = getOwn(handlers, depMap.id);

                        if (handler) {
                            this.depExports[i] = handler(this);
                            return;
                        }

                        this.depCount += 1;

                        on(depMap, 'defined', bind(this, function (depExports) {
                            if (this.undefed) {
                                return;
                            }
                            this.defineDep(i, depExports);
                            this.check();
                        }));

                        if (this.errback) {
                            on(depMap, 'error', bind(this, this.errback));
                        } else if (this.events.error) {
                            // No direct errback on this module, but something
                            // else is listening for errors, so be sure to
                            // propagate the error correctly.
                            on(depMap, 'error', bind(this, function(err) {
                                this.emit('error', err);
                            }));
                        }
                    }

                    id = depMap.id;
                    mod = registry[id];

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this);
                    }
                }));

                //Enable each plugin that is used in
                //a dependency
                eachProp(this.pluginMaps, bind(this, function (pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    if (mod && !mod.enabled) {
                        context.enable(pluginMap, this);
                    }
                }));

                this.enabling = false;

                this.check();
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt);
                });
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name];
                }
            }
        };

        function callGetModule(args) {
            //Skip modules already defined.
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
            }
        }

        function removeListener(node, func, name, ieName) {
            //Favor detachEvent because of IE9
            //issue, see attachEvent/addEventListener comment elsewhere
            //in this file.
            if (node.detachEvent && !isOpera) {
                //Probably IE. If not it will throw an error, which will be
                //useful to know.
                if (ieName) {
                    node.detachEvent(ieName, func);
                }
            } else {
                node.removeEventListener(name, func, false);
            }
        }

        /**
         * Given an event from a script node, get the requirejs info from it,
         * and then removes the event listeners on the node.
         * @param {Event} evt
         * @returns {Object}
         */
        function getScriptData(evt) {
            //Using currentTarget instead of target for Firefox 2.0's sake. Not
            //all old browsers will be supported, but this one was easy enough
            //to support and still makes sense.
            var node = evt.currentTarget || evt.srcElement;

            //Remove the listeners once here.
            removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
            removeListener(node, context.onScriptError, 'error');

            return {
                node: node,
                id: node && node.getAttribute('data-requiremodule')
            };
        }

        function intakeDefines() {
            var args;

            //Any defined modules in the global queue, intake them now.
            takeGlobalQueue();

            //Make sure any remaining defQueue items get properly processed.
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' +
                        args[args.length - 1]));
                } else {
                    //args are id, deps, factory. Should be normalized by the
                    //define() function.
                    callGetModule(args);
                }
            }
            context.defQueueMap = {};
        }

        context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            defQueueMap: {},
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,

            /**
             * Set a configuration for the context.
             * @param {Object} cfg config object to integrate.
             */
            configure: function (cfg) {
                //Make sure the baseUrl ends in a slash.
                if (cfg.baseUrl) {
                    if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
                        cfg.baseUrl += '/';
                    }
                }

                // Convert old style urlArgs string to a function.
                if (typeof cfg.urlArgs === 'string') {
                    var urlArgs = cfg.urlArgs;
                    cfg.urlArgs = function(id, url) {
                        return (url.indexOf('?') === -1 ? '?' : '&') + urlArgs;
                    };
                }

                //Save off the paths since they require special processing,
                //they are additive.
                var shim = config.shim,
                    objs = {
                        paths: true,
                        bundles: true,
                        config: true,
                        map: true
                    };

                eachProp(cfg, function (value, prop) {
                    if (objs[prop]) {
                        if (!config[prop]) {
                            config[prop] = {};
                        }
                        mixin(config[prop], value, true, true);
                    } else {
                        config[prop] = value;
                    }
                });

                //Reverse map the bundles
                if (cfg.bundles) {
                    eachProp(cfg.bundles, function (value, prop) {
                        each(value, function (v) {
                            if (v !== prop) {
                                bundlesMap[v] = prop;
                            }
                        });
                    });
                }

                //Merge shim
                if (cfg.shim) {
                    eachProp(cfg.shim, function (value, id) {
                        //Normalize the structure
                        if (isArray(value)) {
                            value = {
                                deps: value
                            };
                        }
                        if ((value.exports || value.init) && !value.exportsFn) {
                            value.exportsFn = context.makeShimExports(value);
                        }
                        shim[id] = value;
                    });
                    config.shim = shim;
                }

                //Adjust packages if necessary.
                if (cfg.packages) {
                    each(cfg.packages, function (pkgObj) {
                        var location, name;

                        pkgObj = typeof pkgObj === 'string' ? {name: pkgObj} : pkgObj;

                        name = pkgObj.name;
                        location = pkgObj.location;
                        if (location) {
                            config.paths[name] = pkgObj.location;
                        }

                        //Save pointer to main module ID for pkg name.
                        //Remove leading dot in main, so main paths are normalized,
                        //and remove any trailing .js, since different package
                        //envs have different conventions: some use a module name,
                        //some use a file name.
                        config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main')
                                     .replace(currDirRegExp, '')
                                     .replace(jsSuffixRegExp, '');
                    });
                }

                //If there are any "waiting to execute" modules in the registry,
                //update the maps for them, since their info, like URLs to load,
                //may have changed.
                eachProp(registry, function (mod, id) {
                    //If module already has init called, since it is too
                    //late to modify them, and ignore unnormalized ones
                    //since they are transient.
                    if (!mod.inited && !mod.map.unnormalized) {
                        mod.map = makeModuleMap(id, null, true);
                    }
                });

                //If a deps array or a config callback is specified, then call
                //require with those args. This is useful when require is defined as a
                //config object before require.js is loaded.
                if (cfg.deps || cfg.callback) {
                    context.require(cfg.deps || [], cfg.callback);
                }
            },

            makeShimExports: function (value) {
                function fn() {
                    var ret;
                    if (value.init) {
                        ret = value.init.apply(global, arguments);
                    }
                    return ret || (value.exports && getGlobal(value.exports));
                }
                return fn;
            },

            makeRequire: function (relMap, options) {
                options = options || {};

                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;

                    if (options.enableBuildCallback && callback && isFunction(callback)) {
                        callback.__requireJsBuild = true;
                    }

                    if (typeof deps === 'string') {
                        if (isFunction(callback)) {
                            //Invalid call
                            return onError(makeError('requireargs', 'Invalid require call'), errback);
                        }

                        //If require|exports|module are requested, get the
                        //value for them from the special handlers. Caveat:
                        //this only works while module is being defined.
                        if (relMap && hasProp(handlers, deps)) {
                            return handlers[deps](registry[relMap.id]);
                        }

                        //Synchronous access to one module. If require.get is
                        //available (as in the Node adapter), prefer that.
                        if (req.get) {
                            return req.get(context, deps, relMap, localRequire);
                        }

                        //Normalize module name, if it contains . or ..
                        map = makeModuleMap(deps, relMap, false, true);
                        id = map.id;

                        if (!hasProp(defined, id)) {
                            return onError(makeError('notloaded', 'Module name "' +
                                        id +
                                        '" has not been loaded yet for context: ' +
                                        contextName +
                                        (relMap ? '' : '. Use require([])')));
                        }
                        return defined[id];
                    }

                    //Grab defines waiting in the global queue.
                    intakeDefines();

                    //Mark all the dependencies as needing to be loaded.
                    context.nextTick(function () {
                        //Some defines could have been added since the
                        //require call, collect them.
                        intakeDefines();

                        requireMod = getModule(makeModuleMap(null, relMap));

                        //Store if map config should be applied to this require
                        //call for dependencies.
                        requireMod.skipMap = options.skipMap;

                        requireMod.init(deps, callback, errback, {
                            enabled: true
                        });

                        checkLoaded();
                    });

                    return localRequire;
                }

                mixin(localRequire, {
                    isBrowser: isBrowser,

                    /**
                     * Converts a module name + .extension into an URL path.
                     * *Requires* the use of a module name. It does not support using
                     * plain URLs like nameToUrl.
                     */
                    toUrl: function (moduleNamePlusExt) {
                        var ext,
                            index = moduleNamePlusExt.lastIndexOf('.'),
                            segment = moduleNamePlusExt.split('/')[0],
                            isRelative = segment === '.' || segment === '..';

                        //Have a file extension alias, and it is not the
                        //dots from a relative path.
                        if (index !== -1 && (!isRelative || index > 1)) {
                            ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
                            moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
                        }

                        return context.nameToUrl(normalize(moduleNamePlusExt,
                                                relMap && relMap.id, true), ext,  true);
                    },

                    defined: function (id) {
                        return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
                    },

                    specified: function (id) {
                        id = makeModuleMap(id, relMap, false, true).id;
                        return hasProp(defined, id) || hasProp(registry, id);
                    }
                });

                //Only allow undef on top level require calls
                if (!relMap) {
                    localRequire.undef = function (id) {
                        //Bind any waiting define() calls to this context,
                        //fix for #408
                        takeGlobalQueue();

                        var map = makeModuleMap(id, relMap, true),
                            mod = getOwn(registry, id);

                        mod.undefed = true;
                        removeScript(id);

                        delete defined[id];
                        delete urlFetched[map.url];
                        delete undefEvents[id];

                        //Clean queued defines too. Go backwards
                        //in array so that the splices do not
                        //mess up the iteration.
                        eachReverse(defQueue, function(args, i) {
                            if (args[0] === id) {
                                defQueue.splice(i, 1);
                            }
                        });
                        delete context.defQueueMap[id];

                        if (mod) {
                            //Hold on to listeners in case the
                            //module will be attempted to be reloaded
                            //using a different config.
                            if (mod.events.defined) {
                                undefEvents[id] = mod.events;
                            }

                            cleanRegistry(id);
                        }
                    };
                }

                return localRequire;
            },

            /**
             * Called to enable a module if it is still in the registry
             * awaiting enablement. A second arg, parent, the parent module,
             * is passed in for context, when this method is overridden by
             * the optimizer. Not shown here to keep code compact.
             */
            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id);
                if (mod) {
                    getModule(depMap).enable();
                }
            },

            /**
             * Internal method used by environment adapters to complete a load event.
             * A load event could be a script load or just a load pass from a synchronous
             * load call.
             * @param {String} moduleName the name of the module to potentially complete.
             */
            completeLoad: function (moduleName) {
                var found, args, mod,
                    shim = getOwn(config.shim, moduleName) || {},
                    shExports = shim.exports;

                takeGlobalQueue();

                while (defQueue.length) {
                    args = defQueue.shift();
                    if (args[0] === null) {
                        args[0] = moduleName;
                        //If already found an anonymous module and bound it
                        //to this name, then this is some other anon module
                        //waiting for its completeLoad to fire.
                        if (found) {
                            break;
                        }
                        found = true;
                    } else if (args[0] === moduleName) {
                        //Found matching define call for this script!
                        found = true;
                    }

                    callGetModule(args);
                }
                context.defQueueMap = {};

                //Do this after the cycle of callGetModule in case the result
                //of those calls/init calls changes the registry.
                mod = getOwn(registry, moduleName);

                if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
                        if (hasPathFallback(moduleName)) {
                            return;
                        } else {
                            return onError(makeError('nodefine',
                                             'No define call for ' + moduleName,
                                             null,
                                             [moduleName]));
                        }
                    } else {
                        //A script that does not call define(), so just simulate
                        //the call for it.
                        callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
                    }
                }

                checkLoaded();
            },

            /**
             * Converts a module name to a file path. Supports cases where
             * moduleName may actually be just an URL.
             * Note that it **does not** call normalize on the moduleName,
             * it is assumed to have already been normalized. This is an
             * internal API, not a public one. Use toUrl for the public API.
             */
            nameToUrl: function (moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url,
                    parentPath, bundleId,
                    pkgMain = getOwn(config.pkgs, moduleName);

                if (pkgMain) {
                    moduleName = pkgMain;
                }

                bundleId = getOwn(bundlesMap, moduleName);

                if (bundleId) {
                    return context.nameToUrl(bundleId, ext, skipExt);
                }

                //If a colon is in the URL, it indicates a protocol is used and it is just
                //an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
                //or ends with .js, then assume the user meant to use an url and not a module id.
                //The slash is important for protocol-less URLs as well as full paths.
                if (req.jsExtRegExp.test(moduleName)) {
                    //Just a plain path, not module name lookup, so just return it.
                    //Add extension if it is included. This is a bit wonky, only non-.js things pass
                    //an extension, this method probably needs to be reworked.
                    url = moduleName + (ext || '');
                } else {
                    //A module that needs to be converted to a path.
                    paths = config.paths;

                    syms = moduleName.split('/');
                    //For each module name segment, see if there is a path
                    //registered for it. Start with most specific name
                    //and work up from it.
                    for (i = syms.length; i > 0; i -= 1) {
                        parentModule = syms.slice(0, i).join('/');

                        parentPath = getOwn(paths, parentModule);
                        if (parentPath) {
                            //If an array, it means there are a few choices,
                            //Choose the one that is desired
                            if (isArray(parentPath)) {
                                parentPath = parentPath[0];
                            }
                            syms.splice(0, i, parentPath);
                            break;
                        }
                    }

                    //Join the path parts together, then figure out if baseUrl is needed.
                    url = syms.join('/');
                    url += (ext || (/^data\:|^blob\:|\?/.test(url) || skipExt ? '' : '.js'));
                    url = (url.charAt(0) === '/' || url.match(/^[\w\+\.\-]+:/) ? '' : config.baseUrl) + url;
                }

                return config.urlArgs && !/^blob\:/.test(url) ?
                       url + config.urlArgs(moduleName, url) : url;
            },

            //Delegates to req.load. Broken out as a separate function to
            //allow overriding in the optimizer.
            load: function (id, url) {
                req.load(context, id, url);
            },

            /**
             * Executes a module callback function. Broken out as a separate function
             * solely to allow the build system to sequence the files in the built
             * layer in the right sequence.
             *
             * @private
             */
            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args);
            },

            /**
             * callback for script loads, used to check status of loading.
             *
             * @param {Event} evt the event from the browser for the script
             * that was loaded.
             */
            onScriptLoad: function (evt) {
                //Using currentTarget instead of target for Firefox 2.0's sake. Not
                //all old browsers will be supported, but this one was easy enough
                //to support and still makes sense.
                if (evt.type === 'load' ||
                        (readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
                    //Reset interactive script so a script node is not held onto for
                    //to long.
                    interactiveScript = null;

                    //Pull out the name of the module and the context.
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },

            /**
             * Callback for script errors.
             */
            onScriptError: function (evt) {
                var data = getScriptData(evt);
                if (!hasPathFallback(data.id)) {
                    var parents = [];
                    eachProp(registry, function(value, key) {
                        if (key.indexOf('_@r') !== 0) {
                            each(value.depMaps, function(depMap) {
                                if (depMap.id === data.id) {
                                    parents.push(key);
                                    return true;
                                }
                            });
                        }
                    });
                    return onError(makeError('scripterror', 'Script error for "' + data.id +
                                             (parents.length ?
                                             '", needed by: ' + parents.join(', ') :
                                             '"'), evt, [data.id]));
                }
            }
        };

        context.require = context.makeRequire();

        req.sync = function (deps,callback) {
            //Some defines could have been added since the
            //require call, collect them.
            intakeDefines();

            var requireMod = getModule(makeModuleMap(null, undefined));

            //Store if map config should be applied to this require
            //call for dependencies.
            requireMod.skipMap = undefined;

            requireMod.init(deps, callback, undefined, {
                enabled: true
            });
            checkLoaded();
            if(isArray(deps)){
                var result = [];
                each(deps,function (id,i) {
                    result.push(defined[id]);
                })
                return result;
            }
        };
        req.reg = function (obj) {
            if(obj.id == undefined||obj['export'] == undefined){
                return false;
            }
            defined[obj.id] = obj['export'];
            return true;
        }
        return context;
    }

    /**
     * Main entry point.
     *
     * If the only argument to require is a string, then the module that
     * is represented by that string is fetched for the appropriate context.
     *
     * If the first argument is an array, then it will be treated as an array
     * of dependency string names to fetch. An optional function callback can
     * be specified to execute when all of those dependencies are available.
     *
     * Make a local req variable to help Caja compliance (it assumes things
     * on a require that are not standardized), and to give a short
     * name for minification/local scope use.
     */
    req = requirejs = function (deps, callback, errback, optional) {

        //Find the right context, use default
        var context, config,
            contextName = defContextName;

        // Determine if have config object in the call.
        if (!isArray(deps) && typeof deps !== 'string') {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = errback;
                errback = optional;
            } else {
                deps = [];
            }
        }

        if (config && config.context) {
            contextName = config.context;
        }

        context = getOwn(contexts, contextName);
        if (!context) {
            context = contexts[contextName] = req.s.newContext(contextName);
        }

        if (config) {
            context.configure(config);
        }

        return context.require(deps, callback, errback);
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Execute something after the current tick
     * of the event loop. Override for other envs
     * that have a better solution than setTimeout.
     * @param  {Function} fn function to execute later.
     */
    req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
        setTimeout(fn, 4);
    } : function (fn) { fn(); };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    req.version = version;

    //Used to filter out dependencies that are already paths.
    req.jsExtRegExp = /^\/|:|\?|\.js$/;
    req.isBrowser = isBrowser;
    s = req.s = {
        contexts: contexts,
        newContext: newContext
    };

    //Create default context.
    req({});

    //Exports some context-sensitive methods on global require.
    each([
        'toUrl',
        'undef',
        'defined',
        'specified'
    ], function (prop) {
        //Reference from contexts instead of early binding to default context,
        //so that during builds, the latest instance of the default context
        //with its config gets used.
        req[prop] = function () {
            var ctx = contexts[defContextName];
            return ctx.require[prop].apply(ctx, arguments);
        };
    });

    if (isBrowser) {
        head = s.head = document.getElementsByTagName('head')[0];
        //If BASE tag is in play, using appendChild is a problem for IE6.
        //When that browser dies, this can be removed. Details in this jQuery bug:
        //http://dev.jquery.com/ticket/2709
        baseElement = document.getElementsByTagName('base')[0];
        if (baseElement) {
            head = s.head = baseElement.parentNode;
        }
    }

    /**
     * Any errors that require explicitly generates will be passed to this
     * function. Intercept/override it if you want custom error handling.
     * @param {Error} err the error object.
     */
    req.onError = defaultOnError;

    /**
     * Creates the node for the load command. Only used in browser envs.
     */
    req.createNode = function (config, moduleName, url) {
        var node = config.xhtml ?
                document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
                document.createElement('script');
        node.type = config.scriptType || 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };

    /**
     * Does the request to load a module for the browser case.
     * Make this a separate function to allow other environments
     * to override it.
     *
     * @param {Object} context the require context to find state.
     * @param {String} moduleName the name of the module.
     * @param {Object} url the URL to the module.
     */
    req.load = function (context, moduleName, url) {
        var config = (context && context.config) || {},
            node;
        if (isBrowser) {
            //In the browser so use a script tag
            node = req.createNode(config, moduleName, url);

            node.setAttribute('data-requirecontext', context.contextName);
            node.setAttribute('data-requiremodule', moduleName);

            //Set up load listener. Test attachEvent first because IE9 has
            //a subtle issue in its addEventListener and script onload firings
            //that do not match the behavior of all other browsers with
            //addEventListener support, which fire the onload event for a
            //script right after the script execution. See:
            //https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
            //UNFORTUNATELY Opera implements attachEvent but does not follow the script
            //script execution mode.
            if (node.attachEvent &&
                    //Check if node.attachEvent is artificially added by custom script or
                    //natively supported by browser
                    //read https://github.com/requirejs/requirejs/issues/187
                    //if we can NOT find [native code] then it must NOT natively supported.
                    //in IE8, node.attachEvent does not have toString()
                    //Note the test for "[native code" with no closing brace, see:
                    //https://github.com/requirejs/requirejs/issues/273
                    !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
                    !isOpera) {
                //Probably IE. IE (at least 6-8) do not fire
                //script onload right after executing the script, so
                //we cannot tie the anonymous define call to a name.
                //However, IE reports the script as being in 'interactive'
                //readyState at the time of the define call.
                useInteractive = true;

                node.attachEvent('onreadystatechange', context.onScriptLoad);
                //It would be great to add an error handler here to catch
                //404s in IE9+. However, onreadystatechange will fire before
                //the error handler, so that does not help. If addEventListener
                //is used, then IE will fire error before load, but we cannot
                //use that pathway given the connect.microsoft.com issue
                //mentioned above about not doing the 'script execute,
                //then fire the script load event listener before execute
                //next script' that other browsers do.
                //Best hope: IE10 fixes the issues,
                //and then destroys all installs of IE 6-9.
                //node.attachEvent('onerror', context.onScriptError);
            } else {
                node.addEventListener('load', context.onScriptLoad, false);
                node.addEventListener('error', context.onScriptError, false);
            }
            node.src = url;

            //Calling onNodeCreated after all properties on the node have been
            //set, but before it is placed in the DOM.
            if (config.onNodeCreated) {
                config.onNodeCreated(node, config, moduleName, url);
            }

            //For some cache cases in IE 6-8, the script executes before the end
            //of the appendChild execution, so to tie an anonymous define
            //call to the module name (which is stored on the node), hold on
            //to a reference to this node, but clear after the DOM insertion.
            currentlyAddingScript = node;
            if (baseElement) {
                head.insertBefore(node, baseElement);
            } else {
                head.appendChild(node);
            }
            currentlyAddingScript = null;

            return node;
        } else if (isWebWorker) {
            try {
                //In a web worker, use importScripts. This is not a very
                //efficient use of importScripts, importScripts will block until
                //its script is downloaded and evaluated. However, if web workers
                //are in play, the expectation is that a build has been done so
                //that only one script needs to be loaded anyway. This may need
                //to be reevaluated if other use cases become common.

                // Post a task to the event loop to work around a bug in WebKit
                // where the worker gets garbage-collected after calling
                // importScripts(): https://webkit.org/b/153317
                setTimeout(function() {}, 0);
                importScripts(url);

                //Account for anonymous modules
                context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError('importscripts',
                                'importScripts failed for ' +
                                    moduleName + ' at ' + url,
                                e,
                                [moduleName]));
            }
        }
    };

    function getInteractiveScript() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }

        eachReverse(scripts(), function (script) {
            if (script.readyState === 'interactive') {
                return (interactiveScript = script);
            }
        });
        return interactiveScript;
    }

    //Look for a data-main script attribute, which could also adjust the baseUrl.
    if (isBrowser && !cfg.skipDataMain) {
        //Figure out baseUrl. Get it from the script tag with require.js in it.
        eachReverse(scripts(), function (script) {
            //Set the 'head' where we can append children by
            //using the script's parent.
            if (!head) {
                head = script.parentNode;
            }

            //Look for a data-main attribute to set main script for the page
            //to load. If it is there, the path to data main becomes the
            //baseUrl, if it is not already set.
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                //Preserve dataMain in case it is a path (i.e. contains '?')
                mainScript = dataMain;

                //Set final baseUrl if there is not already an explicit one,
                //but only do so if the data-main value is not a loader plugin
                //module ID.
                if (!cfg.baseUrl && mainScript.indexOf('!') === -1) {
                    //Pull off the directory of data-main for use as the
                    //baseUrl.
                    src = mainScript.split('/');
                    mainScript = src.pop();
                    subPath = src.length ? src.join('/')  + '/' : './';

                    cfg.baseUrl = subPath;
                }

                //Strip off any trailing .js since mainScript is now
                //like a module name.
                mainScript = mainScript.replace(jsSuffixRegExp, '');

                //If mainScript is still a path, fall back to dataMain
                if (req.jsExtRegExp.test(mainScript)) {
                    mainScript = dataMain;
                }

                //Put the data-main script in the files to load.
                cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

                return true;
            }
        });
    }

    /**
     * The function that handles definitions of modules. Differs from
     * require() in that a string for the module should be the first argument,
     * and the function to execute after dependencies are loaded should
     * return a value to define the module corresponding to the first argument's
     * name.
     */
    define = function (name, deps, callback) {
        var node, context;

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = [];
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                callback
                    .toString()
                    .replace(commentRegExp, commentReplace)
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep);
                    });

                //May be a CommonJS thing even without require calls, but still
                //could use exports, and module. Avoid doing exports and module
                //work though if it just needs require.
                //REQUIRES the function to expect the CommonJS variables in the
                //order listed below.
                deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
            }
        }

        //If in IE 6-8 and hit an anonymous define() call, do the interactive
        //work.
        if (useInteractive) {
            node = currentlyAddingScript || getInteractiveScript();
            if (node) {
                if (!name) {
                    name = node.getAttribute('data-requiremodule');
                }
                context = contexts[node.getAttribute('data-requirecontext')];
            }
        }

        //Always save off evaluating the def call until the script onload handler.
        //This allows multiple modules to be in a file without prematurely
        //tracing dependencies, and allows for anonymous module support,
        //where the module name is not known until the script onload event
        //occurs. If no context, use the global queue, and get it processed
        //in the onscript load callback.
        if (context) {
            context.defQueue.push([name, deps, callback]);
            context.defQueueMap[name] = true;
        } else {
            globalDefQueue.push([name, deps, callback]);
        }
    };

    define.amd = {
        jQuery: true
    };

    /**
     * Executes the text. Normally just uses eval, but can be modified
     * to use a better, environment-specific call. Only used for transpiling
     * loader plugins, not for plain JS modules.
     * @param {String} text the text to execute/evaluate.
     */
    req.exec = function (text) {
        /*jslint evil: true */
        return eval(text);
    };

    //Set up with config info.
    req(cfg);
}(this, (typeof setTimeout === 'undefined' ? undefined : setTimeout)));
window.localeFile = (window.localeFile ? window.localeFile : "app/widgets/app-lang_zh_CN");
window.bossJS = {
    init: function (options) {
        if(!!!options || typeof options != "object"){
            options = {};
        }
        if (!!!options.jquery) {
            if (window.jQuery&&jQuery.fn.jquery){
                options.jquery = window.jQuery
            }else if(window.$&&$.fn.jquery){
                options.jquery = window.$
            }else {
                throw new Error("jquery undefied");
            }
        }
        if(!!!options.path){
            options.path =  "";
        }
        require.reg({
            "id":"jquery",
            "export":options.jquery
        })
        window._contextPath = options.path;
        require.config({
            baseUrl: _contextPath
            , shim: {
                "base/json2": {
                    exports: "JSON"
                },
                "base/dotpl-js": {
                    exports: "dotpl"
                }
            }
        });
        /**
         * establish history variables
         */

        var initJsList = [
            "app/core/app-jquery",
            "app/core/app-core",
            "base/dotpl-js",
            "app/app-funcbase",
            "app/widgets/window/app-messager",
            "app/util/app-utils",
            "app/widgets/window/app-dialog"];
        require.sync(initJsList, function ($, App, template, func, $messager, $utils, dialog) {
            window.jQuery = $;
            window.$ = $;
            window.$template = function (render, vars) {
                return template.applyTpl(render, vars);
            };
            window.$messager = $messager;
            window.$utils = $utils;
            /**
             * 增加启动方法
             */
            window.$app = window.$A = window.$a = App;
            require.sync([
                "bs-http-plugin/bs-ca-auth",
                "bs-http-plugin/bs-doccamera",
                "bs-http-plugin/bs-pd",
                "bs-http-plugin/bs-pos",
                "bs-http-plugin/bs-print",
                "bs-http-plugin/data-transmit/socket"], function (CA, DocCamera, PD, POS, Print, Socket) {
                window.bossJS = {
                    CA: CA,
                    DocCamera: DocCamera,
                    PD: PD,
                    POS: POS,
                    Print: Print,
                    Socket: Socket
                }
            });
        });
        return bossJS;
    }
};

define('app/core/app-class',[],function() {

    // Class
    // -----------------
    // Thanks to:
    //  - http://mootools.net/docs/core/Class/Class
    //  - http://ejohn.org/blog/simple-javascript-inheritance/
    //  - https://github.com/ded/klass
    //  - http://documentcloud.github.com/backbone/#Model-extend
    //  - https://github.com/joyent/node/blob/master/lib/util.js
    //  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js
    // The base Class implementation.
    /**
     *
     * @class
     * @name Class
     * @classdesc 提供简洁的 OO 实现
     */
    function Class(o) {
        // Convert existed function to Class.
        if (!(this instanceof Class) && isFunction(o)) {
            return classify(o);
        }
    }
    /**
     * 创建类对象方法
     * @function create
     * @memberof Class
     * @static
     * @example 创建一个类
     * // Create a new Class.
     * //
     * //    var SuperPig = Class.create({
     * //        Extends: Animal,//继承类
     * //        Implements: Flyable,//实现了,相当于SuperPig拥有了Flyable的所有方法
     * //        initialize: function() {//初始化方法
     * //            SuperPig.superclass.initialize.apply(this, arguments);
     * //        },
     * //        Statics: {
     * //            COLOR: 'red'
     * //        }
     * //    });
     * //
     * @param parent 父类
     * @param properties 方法对象
     * @returns {*}
     */
    Class.create = function(parent, properties) {
        if (!isFunction(parent)) {
            properties = parent;
            parent = null;
        }

        properties || (properties = {});
        parent || (parent = properties.Extends || Class);
        properties.Extends = parent;

        // The created class constructor
        function SubClass() {
            // Call the parent constructor.
            parent.apply(this, arguments);

            // Only call initialize in self constructor.
            if (this.constructor === SubClass && this.initialize) {
                this.initialize.apply(this, arguments);
            }
        }

        // Inherit class (static) properties from parent.
        if (parent !== Class) {
            mix(SubClass, parent);
        }

        // Add instance properties to the subclass.
        implement.call(SubClass, properties);

        // Make subclass extendable.
        return classify(SubClass);
    };


    function implement(properties) {
        var key, value;

        for (key in properties) {
            value = properties[key];

            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value);
            } else {
                this.prototype[key] = value;
            }
        }
    }



    /**
     * 由 Class.create 创建的类，自动具有 extend 方法，功能与 Class.create 完全一样，只是继承的父类是 SomeClass 自身，前面的例子中已说明，不赘述
     * @memberof Class
     * @example 创建一个类
     *
     *
     * //function Animal() {
     *  // }
     * // Animal.prototype.talk = function() {};
     * //var Dog = Class(Animal).extend({
     *  //swim: function() {}
     *  // });
     * // Create a sub Class based on `Class`.
     * //
     * @param properties 方法对象
     * @returns {*}
     */
    Class.extend = function(properties) {
        properties || (properties = {});
        properties.Extends = this;

        return Class.create(properties);
    };


    function classify(cls) {
        cls.extend = Class.extend;
        cls.implement = implement;
        return cls;
    }


    // Mutators define special properties.
    Class.Mutators = {
        'Extends': function(parent) {
            var existed = this.prototype;
            var proto = createProto(parent.prototype);

            // Keep existed properties.
            mix(proto, existed);

            // Enforce the constructor to be what we expect.
            proto.constructor = this;

            // Set the prototype chain to inherit from `parent`.
            this.prototype = proto;

            // Set a convenience property in case the parent's prototype is
            // needed later.
            this.superclass = parent.prototype;
        },

        'Implements': function(items) {
            isArray(items) || (items = [items]);
            var proto = this.prototype, item;

            while (item = items.shift()) {
                mix(proto, item.prototype || item);
            }
        },

        'Statics': function(staticProperties) {
            mix(this, staticProperties);
        }
    };


    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {
    }

    // See: http://jsperf.com/object-create-vs-new-ctor
    var createProto = Object.__proto__ ?
            function(proto) {
                return { __proto__: proto };
            } :
            function(proto) {
                Ctor.prototype = proto;
                return new Ctor();
            };


    // Helpers
    // ------------

    function mix(r, s) {
        // Copy "all" properties including inherited ones.
        for (var p in s) {
            // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除掉。
            if (p === 'prototype') continue;
            r[p] = s[p];
        }
    }


    var toString = Object.prototype.toString;
    var isArray = Array.isArray;

    if (!isArray) {
        isArray = function(val) {
            return toString.call(val) === '[object Array]';
        };
    }

    var isFunction = function(val) {
        return toString.call(val) === '[object Function]';
    };


    return Class;
});

define('app/core/app-attribute',['require','exports','module'],function(require, exports) {

    // Attribute
    // -----------------
    // Thanks to:
    //  - http://documentcloud.github.com/backbone/#Model
    //  - http://yuilibrary.com/yui/docs/api/classes/AttributeCore.html
    //  - https://github.com/berzniz/backbone.getters.setters

	var Attribute={};

    // 负责 attributes 的初始化
    // attributes 是与实例相关的状态信息，可读可写，发生变化时，会自动触发相关事件
    Attribute.initAttrs = function(config) {
        var specialProps = this.propsInAttrs || [];

        // Get all inherited attributes.
        var attrs = getInheritedAttrs(this, specialProps);

        // Merge user-specific attributes from config.
        if (config) {
            merge(attrs, normalize(config));
        }

        // Automatically register `_onChangeX` method as 'change:x' handler.
        for (key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var eventKey = getChangeEventKey(key);
                if (this[eventKey]) {
                    this.on('change:' + key, this[eventKey]);
                }
            }
        }

        // Convert `on/before/afterXxx` config to event handler.
        parseEventsFromAttrs(this, attrs);

        // initAttrs 是在初始化时调用的，默认情况下实例上肯定没有 attrs，不存在覆盖问题
        this.attrs = attrs;

        // 让属性的初始值生效
        for (var key in attrs) {
            if (!attrs.hasOwnProperty(key)) continue;
            var attr = attrs[key];

            // 在 set 里，有可能调用到 getter / setter 方法，在这两个方法里，很可能
            // 会引用尚未初始化的变量，比如 this.element. 这时采取忽略就好。因为这种
            // 情况下的属性，一般并不需要初始化。
            try {

                // 如果同时有 value 和 setter，先要调用一下 setter，以保证
                // 关联属性的值正确。比如只有纯 setter / getter 的 xy 属性。
                if (attr.hasOwnProperty('value') && attr.setter) {
                    attr.setter.call(this, attr.value, key);
                }

                // 设置之，如果有改变，则触发事件
                this.set(key, this.get(key));
            }
            catch (ex) {
                // 虽然可忽略，但还是尽可能让开发者知晓
                if (window.console) {
                    console.log('A caught exception occurs: ' + ex);
                }
            }
        }

        // 将 this.attrs 上的 special properties 放回 this 上
        copySpecialProps(specialProps, this, this.attrs, true);
    };


    // Get the value of an attribute.
    Attribute.get = function(key) {
        var attr = this.attrs[key] || {};
        var val = attr.value;
        return attr.getter ? attr.getter.call(this, val, key) : val;
    };


    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    Attribute.set = function(key, val, options) {
        var attrs = {};

        // set("key", val, options)
        if (isString(key)) {
            attrs[key] = val;
        }
        // set({ "key": val, "key2": val2 }, options)
        else {
            attrs = key;
            options = val;
        }

        options || (options = {});

        // ready 表示组件的初始状态是否已 OK
        // 在 ready 之前，所有属性的设置操作都是静默的
        var ready = this.__ready;
        var silent = ready ? options.silent : true;

        var now = this.attrs;
        var changed = this.__changedAttrs || (this.__changedAttrs = {});

        for (key in attrs) {
            if (!attrs.hasOwnProperty(key)) continue;

            var attr = now[key] || (now[key] = {});
            val = attrs[key];

            if (attr.readOnly) {
                throw 'This attribute is readOnly: ' + key;
            }

            // invoke validator
            if (attr.validator) {
                var ex = attr.validator.call(this, val, key);
                if (ex !== true) {
                    if (options.error) {
                        options.error.call(this, ex);
                    }
                    continue;
                }
            }

            // invoke setter
            if (attr.setter) {
                val = attr.setter.call(this, val, key);
            }

            // 获取设置前的 prev 值
            // ready 之前，实例上属性的 prev 值都未定义
            var prev = ready ? this.get(key) : null;

            // 获取需要设置的 val 值
            // 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
            if (isPlainObject(prev) && isPlainObject(val)) {
                val = merge(merge({}, prev), val);
            }

            // set finally
            now[key].value = val;

            // invoke change event
            if (!isEqual(prev, val)) {
                if (silent) {
                    changed[key] = [val, prev];
                }
                else {
                    this.trigger('change:' + key, val, prev, key);
                }
            }
        }

        return this;
    };


    // Call this method to manually fire a `"change"` event for triggering
    // a `"change:attribute"` event for each changed attribute.
    Attribute.change = function() {
        var changed = this.__changedAttrs;

        if (changed) {
            for (var key in changed) {
                if (changed.hasOwnProperty(key)) {
                    var args = changed[key];
                    this.trigger('change:' + key, args[0], args[1], key);
                }
            }
            delete this.__changedAttrs;
        }

        return this;
    };


    // Helpers
    // -------

    var toString = Object.prototype.toString;

    var isArray = Array.isArray || function(val) {
        return toString.call(val) === '[object Array]';
    };

    function isString(val) {
        return toString.call(val) === '[object String]';
    }

    function isFunction(val) {
        return toString.call(val) === '[object Function]';
    }

    function isPlainObject(o) {
        return o &&
            // 排除 boolean/string/number/function 等
            // 标准浏览器下，排除 window 等非 JS 对象
            // 注：ie8- 下，toString.call(window 等对象)  返回 '[object Object]'
                toString.call(o) === '[object Object]' &&
            // ie8- 下，排除 window 等非 JS 对象
                ('isPrototypeOf' in o);
    }

    function isEmptyObject(o) {
        for (var p in o) {
            if (o.hasOwnProperty(p)) return false;
        }
        return true;
    }

    function merge(receiver, supplier) {
        var key, value;

        for (key in supplier) {
            if (supplier.hasOwnProperty&&supplier.hasOwnProperty(key)) {
                value = supplier[key];

                // 只 clone 数组和 plain object，其他的保持不变
                if (isArray(value)) {
                    value = value.slice();
                }
                else if (isPlainObject(value)) {
                    value = merge(receiver[key] || {}, value);
                }

                receiver[key] = value;
            }
        }

        return receiver;
    }

    var keys = Object.keys;

    if (!keys) {
        keys = function(o) {
            var result = [];

            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        }
    }


    var EVENT_PATTERN = /^(on|before|after)([A-Z].*)$/;
    var EVENT_NAME_PATTERN = /^(Change)?([A-Z])(.*)/;

    function parseEventsFromAttrs(host, attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var value = attrs[key].value, m;

                /*if (isFunction(value) && (m = key.match(EVENT_PATTERN))) {
                    host[m[1]](getEventName(m[2]), value);
                    delete attrs[key];
                }*/
            }
        }
    }

    // Converts `Show` to `show` and `ChangeTitle` to `change:title`
    function getEventName(name) {
        var m = name.match(EVENT_NAME_PATTERN);
        var ret = m[1] ? 'change:' : '';
        ret += m[2].toLowerCase() + m[3];
        return ret;
    }


    var ATTR_SPECIAL_KEYS = ['value', 'getter', 'setter',
        'validator', 'readOnly'];

    // normalize `attrs` to
    //
    //   {
    //      value: 'xx',
    //      getter: fn,
    //      setter: fn,
    //      validator: fn,
    //      readOnly: boolean
    //   }
    //
    function normalize(attrs) {
        // clone it
        attrs = merge({}, attrs);

        for (var key in attrs) {
            var attr = attrs[key];

            if (isPlainObject(attr) &&
                    hasOwnProperties(attr, ATTR_SPECIAL_KEYS)) {
                continue;
            }

            attrs[key] = {
                value: attr
            };
        }

        return attrs;
    }

    function hasOwnProperties(object, properties) {
        for (var i = 0, len = properties.length; i < len; i++) {
            if (object.hasOwnProperty(properties[i])) {
                return true;
            }
        }
        return false;
    }


    function getChangeEventKey(key) {
        return '_onChange' + key.charAt(0).toUpperCase() + key.substring(1);
    }

    function copySpecialProps(specialProps, receiver, supplier, isAttr) {
        for (var i = 0, len = specialProps.length; i < len; i++) {
            var key = specialProps[i];

            if (key in supplier && supplier.hasOwnProperty(key)) {
                var val = supplier[key];
                receiver[key] = isAttr ? val.value : val;
            }
        }
    }

    function getInheritedAttrs(instance, specialProps) {
        var inherited = [];
        var proto = instance.constructor.prototype;

        while (proto) {
            // 不要拿到 prototype 上的
            if (!proto.hasOwnProperty('attrs')) {
                proto.attrs = {};
            }

            // 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
            copySpecialProps(specialProps, proto.attrs, proto);

            // 为空时不添加
            if (!isEmptyObject(proto.attrs)) {
                inherited.unshift(proto.attrs);
            }

            // 向上回溯一级
            proto = proto.constructor.superclass;
        }

        // Merge and clone default values to instance.
        var result = {};
        for (var i = 0, len = inherited.length; i < len; i++) {
            result = merge(result, normalize(inherited[i]));
        }

        return result;
    }


    // 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined, '', [], {}
    function isEmptyAttrValue(o) {
        return o == null || // null, undefined
                (isString(o) || isArray(o)) && o.length === 0 || // '', []
                isPlainObject(o) && isEmptyObject(o); // {}
    }

    // 判断属性值 a 和 b 是否相等，注意仅适用于属性值的判断，非普适的 === 或 == 判断。
    function isEqual(a, b) {
        if (a === b) return true;

        if (isEmptyAttrValue(a) && isEmptyAttrValue(b)) return true;

        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;

        switch (className) {

            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
                // Primitives and their corresponding object wrappers are
                // equivalent; thus, `"5"` is equivalent to `new String("5")`.
                return a == String(b);

            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive. An `equal`
                // comparison is performed for other numeric values.
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);

            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values.
                // Dates are compared by their millisecond representations.
                // Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a == +b;

            // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
                return a.source == b.source &&
                        a.global == b.global &&
                        a.multiline == b.multiline &&
                        a.ignoreCase == b.ignoreCase;

            // 简单判断数组包含的 primitive 值是否相等
            case '[object Array]':
                var aString = a.toString();
                var bString = b.toString();

                // 只要包含非 primitive 值，为了稳妥起见，都返回 false
                return aString.indexOf('[object') === -1 &&
                        bString.indexOf('[object') === -1 &&
                        aString === bString;
        }

        if (typeof a != 'object' || typeof b != 'object') return false;

        // 简单判断两个对象是否相等，只判断第一层
        if (isPlainObject(a) && isPlainObject(b)) {

            // 键值不相等，立刻返回 false
            if (!isEqual(keys(a), keys(b))) {
                return false;
            }

            // 键相同，但有值不等，立刻返回 false
            for (var p in a) {
                if (a[p] !== b[p]) return false;
            }

            return true;
        }

        // 其他情况返回 false, 以避免误判导致 change 事件没发生
        return false;
    }

    return Attribute;
});

define('app/core/app-events',[],function() {
// Events
// -----------------
// Thanks to:
//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
//  - https://github.com/joyent/node/blob/master/lib/events.js


// Regular expression used to split event strings
var eventSplitter = /\s+/


// A module that can be mixed in to *any object* in order to provide it
// with custom events. You may bind with `on` or remove with `off` callback
// functions to an event; `trigger`-ing an event fires all callbacks in
// succession.
//
//     var object = new Events();
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
function Events() {
}


// Bind one or more space separated events, `events`, to a `callback`
// function. Passing `"all"` will bind the callback to all events fired.
Events.prototype.on = function(events, callback, context) {
  var cache, event, list
  if (!callback) return this

  cache = this.__events || (this.__events = {})
  events = events.split(eventSplitter)

  while (event = events.shift()) {
    list = cache[event] || (cache[event] = [])
    list.push(callback, context)
  }

  return this
}

Events.prototype.once = function(events, callback, context) {
  var that = this
  var cb = function() {
    that.off(events, cb)
    callback.apply(context || that, arguments)
  }
  return this.on(events, cb, context)
}

// Remove one or many callbacks. If `context` is null, removes all callbacks
// with that function. If `callback` is null, removes all callbacks for the
// event. If `events` is null, removes all bound callbacks for all events.
Events.prototype.off = function(events, callback, context) {
  var cache, event, list, i

  // No events, or removing *all* events.
  if (!(cache = this.__events)) return this
  if (!(events || callback || context)) {
    delete this.__events
    return this
  }

  events = events ? events.split(eventSplitter) : keys(cache)

  // Loop through the callback list, splicing where appropriate.
  while (event = events.shift()) {
    list = cache[event]
    if (!list) continue

    if (!(callback || context)) {
      delete cache[event]
      continue
    }

    for (i = list.length - 2; i >= 0; i -= 2) {
      if (!(callback && list[i] !== callback ||
          context && list[i + 1] !== context)) {
        list.splice(i, 2)
      }
    }
  }

  return this
}


// Trigger one or many events, firing all bound callbacks. Callbacks are
// passed the same arguments as `trigger` is, apart from the event name
// (unless you're listening on `"all"`, which will cause your callback to
// receive the true name of the event as the first argument).
Events.prototype.trigger = function(events) {
  var cache, event, all, list, i, len, rest = [], args, returned = true;
  if (!(cache = this.__events)) return this
  events = events.split(eventSplitter)

  // Fill up `rest` with the callback arguments.  Since we're only copying
  // the tail of `arguments`, a loop is much faster than Array#slice.
  for (i = 1, len = arguments.length; i < len; i++) {
    rest[i - 1] = arguments[i]
  }

  // For each event, walk through the list of callbacks twice, first to
  // trigger the event, then to trigger any `"all"` callbacks.
  while (event = events.shift()) {
    // Copy callback lists to prevent modification.
    if (all = cache.all) all = all.slice()
    if (list = cache[event]) list = list.slice()

    // Execute event callbacks except one named "all"
    if (event !== 'all') {
      returned = triggerEvents(list, rest, this) && returned
    }

    // Execute "all" callbacks.
    returned = triggerEvents(all, [event].concat(rest), this) && returned
  }

  return returned
}

Events.prototype.emit = Events.prototype.trigger


// 扩展是否绑定了XXX方法   Mr.T
Events.prototype.hasBindEvent = function(eventName) {
  var cache = this.__events || (this.__events = {});
  var event = cache[eventName];
  return event && event.length > 1;
}
// Helpers
// -------

var keys = Object.keys

if (!keys) {
  keys = function(o) {
    var result = []

    for (var name in o) {
      if (o.hasOwnProperty(name)) {
        result.push(name)
      }
    }
    return result
  }
}

// Mix `Events` to object instance or Class function.
Events.mixTo = function(receiver) {
  receiver = isFunction(receiver) ? receiver.prototype : receiver
  var proto = Events.prototype

  var event = new Events
  for (var key in proto) {
    if (proto.hasOwnProperty(key)) {
      copyProto(key)
    }
  }

  function copyProto(key) {
    receiver[key] = function() {
      proto[key].apply(event, Array.prototype.slice.call(arguments))
      return this
    }
  }
}

//对象增强，添加event能力
Events.enhance = function (receiver) {
    if(typeof receiver !='object'){
      return;
    }
    var proto = Events.prototype
    for (var key in proto) {
        if (proto.hasOwnProperty(key)) {
            receiver[key] = proto[key]
        }
    }
}

// Execute callbacks
function triggerEvents(list, args, context) {
  var pass = true

  if (list) {
    var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2]
    // call is faster than apply, optimize less than 3 argu
    // http://blog.csdn.net/zhengyinhui100/article/details/7837127
    switch (args.length) {
      case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
      case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
      case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
      case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
      default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
    }
  }
  // trigger will return false if one of the callbacks return false
  return pass;
}

function isFunction(func) {
  return Object.prototype.toString.call(func) === '[object Function]'
}

return Events;
});

/*
    json2.js
    2012-10-08

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

define("base/json2", function(){});

/**
 * App系统核心对象
 */
define('app/core/app-core',["jquery", "app/core/app-jquery", "base/json2"], function($) {

	var $A = undefined,$hostUrl="",$contextPath,$caInfo=null,_caCryptoType;
	$A = function(selector, context) {
		if (typeof $A._exfn == "function") {
			return $A._exfn(selector, context);
		}
		return $(selector, context);
	};
    $A.debug = false;
    (function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable && pair[1]=='true'){
            	$A.debug = true;
            	return;
            }
        }
    })("__debug");
	return $.extend($A, {
		/**
		 * 设置为开发状态
		 */
		develop : true,
		/**
		 * 常用键盘码常量
		 */
		keyCode : {
			ENTER : 13,
			ESC : 27,
			END : 35,
			HOME : 36,
			SHIFT : 16,
			TAB : 9,
			LEFT : 37,
			RIGHT : 39,
			UP : 38,
			DOWN : 40,
			DELETE : 46,
			BACKSPACE : 8,
			HOME : 36,
			END : 35,
			PLUS : 187,
			PLUS1 : 107,
			MINUS : 189,
			MINUS1 : 109,
			POINT : 190,
			POINT1 : 110,
			PgUp : 33,
			PgDn : 34,
			Z : 90
		},
		/**
		 * 是否属于数组按键中
		 */
		containKeyCode : function(e, keys) {
			for (var i = 0; i < keys.length; i++) {
				var keyInfo = keys[i];
				if (isNaN(keyInfo)) {
					if (keyInfo.keyCode != e.keyCode) {
						continue;
					}
					if (keyInfo.ctrlKey != undefined) {
						if (keyInfo.ctrlKey != e.ctrlKey) {
							continue;
						}
					}
					if (keyInfo.shiftKey != undefined) {
						if (keyInfo.shiftKey != e.shiftKey) {
							continue;
						}
					}
					return true;
				} else if (e.keyCode == keyInfo) {
					return true;
				}
			}
			return false;
		},
		/**
		 * 远程访问的状态码
		 */
		statusCode : {
			ok : 200,
			error : 300,
			timeout : "250",
			internalError : 500,
			notFound : 404
		},

		/**
		 * require 脚本文件时缓存的参数及对象使用的属性
		 */
		jsattrs : {
			PARAM : "__jsparam",
			OBJECT : "__jsobj"
		},
		/**
		 * 系统初始化方法集合
		 */
		initMethods : {},
		/**
		 * 系统销毁方法集合
		 */
		destroyMethods : {},
		/**
		 * 状态对象
		 */
		status : {
			spliter : true
		},
		/**
		 * 自定义事件类型
		 */
		eventType : {
			pageLoad : "onload",
			pageDestroy : "pageDestroy"
		},
		/**
		 * 注册初始化方法
		 * 
		 * @param key{String/Object}
		 *            包含多个初始化方法的集合
		 * @param func{Function}
		 *            构造方法
		 */
		regInitMethod : function(key, func) {
			var othis = this;
			var initMethods = othis.initMethods;
			if ($.isPlainObject(key)) {
				initMethods = $.extend(initMethods, key);
			} else if ($.isFunction(key)) {
				if (key.appid) {
					initMethods[key.appid] = null;
					delete initMethods[key.appid];
				} else {
					key.appid = othis.nextId();
					initMethods[key.appid] = key;
				}
			} else if (typeof key === "string") {
				if (func && $.isFunction(func)) {
					func.appid = key;
					initMethods[key] = func;
				} else {
					initMethods[key] = null;
					delete initMethods[key];
				}
			} else {
				throw "valid component's constructor";
			}
		},
		getPageComponens:function(box){
			var box=box||$A.getContainer();
			if (!$(box).data("componens")){
				var $componens = $("[name=componens]",box),componens=null;
				if ($componens.length>0){
					var cmpstr=$componens.val().trim();
					componens=$.parseJSON(cmpstr)
				}
				$(box).data("componens",componens);
				 $("[name=componens]",box).remove();
			}
			return $(box).data("componens");
		},
		//根据控件id检测控件权限
		cehckPageComponensById:function(id){
			var cmps=this.getPageComponens();
			var hasRight=true;
			if (cmps){
				
				for (var i=0;i<cmps.length;i++){
					cmp=cmps[i]
					if (cmp.id==id&&cmp.hidden==true){
						hasRight=false;
					}
				}
				
			}
			return hasRight;
		},
		/**
		 * 检验页面控件权限
		 */
		checkPageComponens:function($box){
			//获取当前页面控件权限
			var cmps=this.getPageComponens($box),cmp;
		
			if (cmps){
			
				for (var i=0;i<cmps.length;i++){
					cmp=cmps[i]
					if (cmp.hidden==true){
						 $("[id="+cmp.id+"]",$box).remove();
					}
				}
				/*var pageComponens=cmp["pageComponens"],checkUserCmp=cmp["userComponens"];
				if (pageComponens!=""){
					var pagecmps=pageComponens.split(",");
					for(var i=0,len=pagecmps.length;i<len;i++){
						if (pagecmps[i]&&!checkUserCmp[pagecmps[i]]){
							 $("[id="+pagecmps[i]+"]",$box).remove();
						}
					}
				}*/
				
			}
			
			
		},
		/**
		 * 初试化方法调用
		 */
		initCalls : function($box) {
			var othis = this;
			var initMethods = $A.initMethods;
			for (name in initMethods) {
				initMethods[name]($box);
			}
		},
		/**
		 * 初始化方法，包括组件和布局等
		 */
		init : function(box) {
			var $box=$(box||"body");
			$box.clearAppJsObject();
			var $js = $("[name=jsRequire]",$box);
		
			this.checkPageComponens($box);
			if($js.length == 0){
				$A.initCalls($box);
				return;
			}
		
			var rs =new Array;
			var ids=new Array;
			$js.each(function(idx,item){
				var $item=$(this),jspath = $item.val();
				if(jspath){
					ids.push($item.attr("id"));
					rs.push(jspath);
				}
			});
			if(rs.length == 0){
				$box.css('visibility','');
				$A.initCalls($box);
				return;
			}
			require(rs,function(){
				var jsobj = new Array,nids=new Array,args=arguments;
				$.each(args,function(i){
					if(args[i] != null && ids[i]!=null){
						jsobj.push(args[i]);
						nids.push(ids[i]);
					}
				});
				if(nids.length > 0){
					$box.setAppJsObject(nids,jsobj);
					triggerBeforePageInit(jsobj, $box);
					//add by tw
					if($box.data("onPageLoad")){
						var funcName = $box.data("onPageLoad");
						try{
							var f = new Function(nids,"return ("+funcName+")");
							var onPageLoadFunc = f.apply(this,jsobj);
							$box.one($A.eventType.pageLoad,{"pageLoadFunc":onPageLoadFunc,"uiPageModel":$box.data("uiPageModel")},function(e){
								if (e.data["pageLoadFunc"]){
									
									e.data["pageLoadFunc"].call(jsobj[0],e.data["uiPageModel"],$box)
									//e.data["pageLoadFunc"].appli(e.data["uiPageModel"],$box);
								}
							});
						}catch(e){
							window.alert(e);
							return {};
						}
					}
					
				}
				$A.initCalls($box);
			});
			$js.remove();
			$A.resolveUiPageModel($box);
			$box.removeData("onPageLoad");
			var $uiPageLoad = $(">div.__uiPageLoad",$box);
			if($uiPageLoad.length>0){
				var pageLoadFuncName = $uiPageLoad.text();
				$box.data("onPageLoad",pageLoadFuncName);
				$uiPageLoad.remove();
			}
			/**
			 * 页面对象声明的pageBeforeInit方法
			 */
			function triggerBeforePageInit(jsobj, $box){
				if(!(jsobj && jsobj[0])){
//					$box.css('visibility','');
					return;
				}
				var func = jsobj[0].beforePageInit;
				if(!$.isFunction(func)){
//					$box.css('visibility','');
					return;
				}
				func($box, $box.data('uiPageModel'));
				$box.css('visibility','');
			}
			//end add by tw
		},
		resolveUiPageModel: function($box){
			//add by tw
			var $pageModel = $(">div.__uiPageModel",$box);
			if($pageModel.length>0){
				var json = $pageModel.text();
				$box.data("uiPageModel",$.parseJSON(json));
				$pageModel.remove();
			}else{
				$box.data("uiPageModel", {innerModel: true});
			}
		},
		/**
		 * 页面销毁时处理方法
		 */
		regDestroyMethod : function(key, func) {
			var othis = this;
			var destroyMethods = othis.destroyMethods;
			if ($.isPlainObject(key)) {
				destroyMethods = $.extend(destroyMethods, key);
			} else if ($.isFunction(key)) {
				if (key.appid) {
					destroyMethods[key.appid] = null;
					delete destroyMethods[key.appid];
				} else {
					key.appid = othis.nextId();
					destroyMethods[key.appid] = key;
				}
			} else if (typeof key === "string") {
				if (func && $.isFunction(func)) {
					func.appid = key;
					destroyMethods[key] = func;
				} else {
					destroyMethods[key] = null;
					delete destroyMethods[key];
				}
			} else {
				throw "valid component's destroy";
			}
		},
		/**
		 * 销毁方法调用
		 */
		destroyCalls : function($box, e) {
			var othis = this;
			var destroyMethods = othis.destroyMethods;
			for (name in destroyMethods) {
				destroyMethods[name]($box, e);
			}
		},
		/**
		 * 页面加载时调动，非ajax加载
		 * 
		 * @param options
		 */
		boot : function(options) {
			this.options = $.extend(this.options, options);
			this.init();
			var _doc = $(document);
			var $this = this;
			if (!_doc.isBind(this.eventType.pageDestroy)) {
				_doc.bind(this.eventType.pageDestroy, function(e) {
							var box = e.target;
							$this.destroyCalls(box, e);
						});
			}
		},

		/**
		 * 生成下一个id或一组id
		 * 
		 * @param count{Number}
		 *            生成id的个数
		 */
		nextId : (function() {
			var idno = 0;
			return function(count) {
				if (count && count > 1) {
					var ids = new Array();
					for (var i = 0; i < count; i++) {
						idno++;
						ids.push("app_" + idno);
					}
					return ids;
				}
				return ++idno;
			};
		})(),
		/**
		 * 字符串转换为json对象
		 * 
		 * @param json{Object}
		 *            json对象
		 */
		jsonEval : function(json, context) {// add by tw
			try {
				// add by tw
				if (context) {
					var evalstr = "";
					for (var key in context) {
						evalstr += "var " + key + "=context[\"" + key + "\"];";
					}
					eval(evalstr);
					return eval('(' + json + ')');
				}
				// end add by tw
				return eval('(' + json + ')');
			} catch (e) {
				return {};
			}
		},
		/**
		 * json转换为字符串
		 * 
		 * @param json{Object}
		 *            json对象
		 * @param {string}
		 *            字符串
		 */
		toJsonString : function(value, replacer, space) {
			return JSON.stringify(value, replacer, space);
		},
		/**
		 * 调试信息输出
		 */
		log : function(msg) {
			if (this.develop) {
				if (window.console)
					console.log(msg);
				else
					alert(msg);
			}
		},
		/**
		 * 生成唯一的id字符串：前缀+当前时间毫秒数
		 * 
		 * @param prefix
		 *            前缀
		 * @returns {String}
		 */
		uuid : function(prefix) {
			prefix = prefix === undefined ? 'bs_' : prefix;
			return prefix + this.nextId();
		},
		/**
		 * 获取页面元素的属性
		 * 
		 * @returns 元素属性
		 */
		getAttrFromElement : function($element) {
			try{
				var attrs = getAttrs($element[0]), _options = $element
						.getJsonAttr('_options');
				// 初始化数据源
				if (attrs.data) {
					attrs.data = $element.getJsonAttr('data');
				}
				// 初始化以选中节点
				if (attrs.selectednode) {
					attrs.selectednode = $element.getJsonAttr('selectednode');
				}
				// 初始化回调事件
				if (attrs.events) {
					$.extend(attrs, $element.getJsEvent(attrs.events));
				}
				return $.extend(attrs, _options);
			}catch(e){
				var id = $element.attr('id');
				if(!id){
					id = $element[0].outerHTML;
				}
				throw new Error('组件[' + id + ']获取属性出错.');
			}
			/**
			 * 获取元素的属性
			 * 
			 * @param $el
			 * @returns {___anonymous2415_2416}
			 */
			function getAttrs($el) {
				var attrs = {};
				if ($el.attributes) {
					// 继承html的原有属性
					$.each($el.attributes, function(i, att) {
								var name = att.name.toLowerCase();
								if (att.value == 'true') {
									attrs[name] = true;
								} else if (att.value == 'false') {
									attrs[name] = false;
								} else {
									if (att.value)
									attrs[name] = $.fn.escapeHtml(att.value);
								}
							});
				}
				return attrs;
			}
		},
		destroyDom : function(dom) {
			var plugins = $A.options.getPlugins();
			var comps = [];
			for (var i = 0; i < plugins.length; i++) {
				var plugin = plugins[i];
				var r;
				
				if (!plugin.className){
					 r=$('.app-' + plugin.pluginName, dom);
				}else{
					 r=$('.' + plugin.className, dom);
				}
				
				if (r.length) {
					if (r[plugin.pluginName]) {
						comps.push({
									name : plugin.pluginName,
									jq : r
								});
					}
				}
			}
			var destroy=false;
			for (var i = 0; i < comps.length; i++) {
				var destoryItem = comps[i];
				destroy=false;
				$.each(destoryItem.jq, function(index, item) {
					var data = $("input:first-child", item).data(destoryItem.name);
					if(data){
						data.destroy();
						destroy=true;
					}
				});
				if (destroy==false){
				destoryItem.jq[destoryItem.name]('destroy');
				}
			}
			if (!typeof CollectGarbage == "undefined") {
				CollectGarbage()
			}
		},
		getComponent: function($input, componentName){
			if(!$A.debug){
				return $input.data(componentName);
			}
			var data = $input.data();
			if(!data){
				return;
			}
			var componentNames = ['textbox', 'number', 'money', 
                  'comboztree', 'combogrid', 'checkbox', 'suggest',
                  'datetime', 'typeahead', 'reference', 'combobox']
				,names = [];
			for(var i = 0; i < componentNames.length; i++){
				var name = componentNames[i]
				if(data[name]){
					names.push(name);
				}
			}
			if(names.length == 0){
				return null;
			}else if(names.length == 1){
				if(names[0] == componentName){
					return data[componentName];
				}else{
					throw new Error('该组件已经声明为[' + names[0] +
							'],无法重复声明为[' + componentName + ']');
				}
			}else{
				throw new Error('无法捕获的异常');
			}
		},
		/**
		 * 调用组件的方法
		 */
		componentMethodApply: function(component, methodName, methodArgs){
			if(!component){
				throw new Error('调用未初始化的组件方法');
			}
			var method = component[methodName];
			if($.isFunction(method)){
				return method.apply(component, methodArgs);
			}else{
				throw new Error('组件未声明[' + methodName + ']方法');
			}
		},
		/**
		 * 组件方法调用异常包装
		 */
		throwCompMethodError: function($element, className, methodName, e){
			var id = $element.attr('id')
				,msg = ''
				,type = getTypeMsg(e, $element);
			if(!id){
				id = $element[0].outerHTML;
			}
			msg = '通过元素[' + id + ']调用类型为[' + className + ']组件的[' + methodName + ']方法时出现异常';
			if(type){
				msg += ':元素已声明为类型[' + type + ']的组件:' + e;
			}else{
				msg += ':' + e;
			}
			throw new Error(msg);
			function getTypeMsg(e, $element){
				if(e.message == '调用未初始化的组件方法'){
					var $parent = $element.parent();
					if(!$parent.hasClass('app-wrapper')){
						return ''; 
					}
					if($parent.hasClass('app-textbox')){
						return 'textbox';
					}
					if($parent.hasClass('app-combobox')){
						return 'combobox';
					}
					if($parent.hasClass('app-number')){
						return 'number';
					}
					if($parent.hasClass('app-money')){
						return 'money';
					}
					if($parent.hasClass('app-comboztree')){
						return 'comboztree';
					}
					if($parent.hasClass('app-combogrid')){
						return 'combogrid';
					}
					if($parent.hasClass('app-typeahead')){
						return 'typeahead';
					}
					if($parent.hasClass('app-suggest')){
						return 'suggest';
					}
					if($parent.hasClass('app-datatime')){
						return 'datatime';
					}
				}
				return '';
			}
		},
		/**
		 * 组件初始化调用异常包装
		 */
		throwCompInitError: function($element, className){
			var id = $element.attr('id');
			if(!id){
				id = $element[0].outerHTML;
			}
			throw new Error('元素[' + id + ']已经初始化为[' + className + ']组件:无法重复初始化');
		},
		showWaitScreen: function(msg){
			if(typeof msg === 'undefined'){
				msg = '正在努力加载中...'
			}
			if(!$a.$wait){
				$a.$wait = $('<div id="waitMask" class="dialog-mask" style="z-index:999999999;display:block;"><div>');
				$a.$wait.append($('<div style="width: 150px;height: 150px;margin: auto;position: absolute;top: 0;left: 0;bottom: 0;right: 0;color: #fff;font-size: 18px;">\
									<div style="width: 124px;height: 124px;background:url(resources/common/themes/default/images/loading2.gif) no-repeat center center;margin-bottom: 5px;"></div>\
									<div id="waitScreenMsg">' + msg + '</div></div>'));
				$a.$wait.appendTo('body');
			}else{
				$a.$wait.find("#waitScreenMsg").text(msg);
				$a.$wait.show();
			}
		},
		hideWaitScreen: function(){
			if($a.$wait){
				$a.$wait.hide();
			}
		},
		setContextPath:function(contextPath){
			$contextPath=contextPath
		},
		getContextPath:function(){
			return $contextPath;
		},
		getCaProvider:function(){
			
			return _caProvider;
			
		},
		setCaInfo:function(caInfo){
			
			$caInfo=caInfo;
		},
		getCaInfo:function(){
			return $caInfo;
		},
		getHostUrl:function(){
			var location=window.location;
			try{
				if (!$contextPath){
					$contextPath=_contextPath;
				}
			}catch(ex){
				
			}
			if ($hostUrl==""){
				$hostUrl=location.protocol+"//"+location.host+$contextPath+"/";
			}
			return $hostUrl;
		},
		getCaCryptoType:function(){
			
			return _caCryptoType;
			
		},
		setCaCryptoType:function(caCryptoType){
			_caCryptoType=caCryptoType
			
		}

	});
});
/**
 * 汉字拼音转换
 */
define('base/pinyin',[],function(){
	/**
	 * 拼音汉字集合
	 */
	var PinYin = {"a":"\u554a\u963f\u9515","ai":"\u57c3\u6328\u54ce\u5509\u54c0\u7691\u764c\u853c\u77ee\u827e\u788d\u7231\u9698\u8bf6\u6371\u55f3\u55cc\u5ad2\u7477\u66a7\u7839\u953f\u972d","an":"\u978d\u6c28\u5b89\u4ffa\u6309\u6697\u5cb8\u80fa\u6848\u8c19\u57ef\u63de\u72b4\u5eb5\u6849\u94f5\u9e4c\u9878\u9eef","ang":"\u80ae\u6602\u76ce","ao":"\u51f9\u6556\u71ac\u7ff1\u8884\u50b2\u5965\u61ca\u6fb3\u5773\u62d7\u55f7\u5662\u5c99\u5ed2\u9068\u5aaa\u9a9c\u8071\u87af\u93ca\u9ccc\u93d6","ba":"\u82ad\u634c\u6252\u53ed\u5427\u7b06\u516b\u75a4\u5df4\u62d4\u8dcb\u9776\u628a\u8019\u575d\u9738\u7f62\u7238\u8307\u83dd\u8406\u636d\u5c9c\u705e\u6777\u94af\u7c91\u9c85\u9b43","bai":"\u767d\u67cf\u767e\u6446\u4f70\u8d25\u62dc\u7a17\u859c\u63b0\u97b4","ban":"\u6591\u73ed\u642c\u6273\u822c\u9881\u677f\u7248\u626e\u62cc\u4f34\u74e3\u534a\u529e\u7eca\u962a\u5742\u8c73\u94a3\u7622\u764d\u8228","bang":"\u90a6\u5e2e\u6886\u699c\u8180\u7ed1\u68d2\u78c5\u868c\u9551\u508d\u8c24\u84a1\u8783","bao":"\u82de\u80de\u5305\u8912\u96f9\u4fdd\u5821\u9971\u5b9d\u62b1\u62a5\u66b4\u8c79\u9c8d\u7206\u52f9\u8446\u5b80\u5b62\u7172\u9e28\u8913\u8db5\u9f85","bo":"\u5265\u8584\u73bb\u83e0\u64ad\u62e8\u94b5\u6ce2\u535a\u52c3\u640f\u94c2\u7b94\u4f2f\u5e1b\u8236\u8116\u818a\u6e24\u6cca\u9a73\u4eb3\u8543\u5575\u997d\u6a97\u64d8\u7934\u94b9\u9e41\u7c38\u8ddb","bei":"\u676f\u7891\u60b2\u5351\u5317\u8f88\u80cc\u8d1d\u94a1\u500d\u72c8\u5907\u60eb\u7119\u88ab\u5b5b\u9642\u90b6\u57e4\u84d3\u5457\u602b\u6096\u789a\u9e4e\u8919\u943e","ben":"\u5954\u82ef\u672c\u7b28\u755a\u574c\u951b","beng":"\u5d29\u7ef7\u752d\u6cf5\u8e66\u8ff8\u552a\u5623\u750f","bi":"\u903c\u9f3b\u6bd4\u9119\u7b14\u5f7c\u78a7\u84d6\u853d\u6bd5\u6bd9\u6bd6\u5e01\u5e87\u75f9\u95ed\u655d\u5f0a\u5fc5\u8f9f\u58c1\u81c2\u907f\u965b\u5315\u4ef3\u4ffe\u8298\u835c\u8378\u5421\u54d4\u72f4\u5eb3\u610e\u6ed7\u6fde\u5f3c\u59a3\u5a62\u5b16\u74a7\u8d32\u7540\u94cb\u79d5\u88e8\u7b5a\u7b85\u7be6\u822d\u895e\u8df8\u9ac0","bian":"\u97ad\u8fb9\u7f16\u8d2c\u6241\u4fbf\u53d8\u535e\u8fa8\u8fa9\u8fab\u904d\u533e\u5f01\u82c4\u5fed\u6c74\u7f0f\u7178\u782d\u78a5\u7a39\u7a86\u8759\u7b3e\u9cca","biao":"\u6807\u5f6a\u8198\u8868\u5a4a\u9aa0\u98d1\u98d9\u98da\u706c\u9556\u9573\u762d\u88f1\u9cd4","bie":"\u9cd6\u618b\u522b\u762a\u8e69\u9cd8","bin":"\u5f6c\u658c\u6fd2\u6ee8\u5bbe\u6448\u50a7\u6d5c\u7f24\u73a2\u6ba1\u8191\u9554\u9acc\u9b13","bing":"\u5175\u51b0\u67c4\u4e19\u79c9\u997c\u70b3\u75c5\u5e76\u7980\u90b4\u6452\u7ee0\u678b\u69df\u71f9","bu":"\u6355\u535c\u54fa\u8865\u57e0\u4e0d\u5e03\u6b65\u7c3f\u90e8\u6016\u62ca\u535f\u900b\u74ff\u6661\u949a\u91ad","ca":"\u64e6\u5693\u7924","cai":"\u731c\u88c1\u6750\u624d\u8d22\u776c\u8e29\u91c7\u5f69\u83dc\u8521","can":"\u9910\u53c2\u8695\u6b8b\u60ed\u60e8\u707f\u9a96\u74a8\u7cb2\u9eea","cang":"\u82cd\u8231\u4ed3\u6ca7\u85cf\u4f27","cao":"\u64cd\u7cd9\u69fd\u66f9\u8349\u8279\u5608\u6f15\u87ac\u825a","ce":"\u5395\u7b56\u4fa7\u518c\u6d4b\u5202\u5e3b\u607b","ceng":"\u5c42\u8e6d\u564c","cha":"\u63d2\u53c9\u832c\u8336\u67e5\u78b4\u643d\u5bdf\u5c94\u5dee\u8be7\u7339\u9987\u6c4a\u59f9\u6748\u6942\u69ce\u6aab\u9497\u9538\u9572\u8869","chai":"\u62c6\u67f4\u8c7a\u4faa\u8308\u7625\u867f\u9f87","chan":"\u6400\u63ba\u8749\u998b\u8c17\u7f20\u94f2\u4ea7\u9610\u98a4\u5181\u8c04\u8c36\u8487\u5edb\u5fcf\u6f7a\u6fb6\u5b71\u7fbc\u5a75\u5b17\u9aa3\u89c7\u7985\u9561\u88e3\u87fe\u8e94","chang":"\u660c\u7316\u573a\u5c1d\u5e38\u957f\u507f\u80a0\u5382\u655e\u7545\u5531\u5021\u4f25\u9b2f\u82cc\u83d6\u5f9c\u6005\u60dd\u960a\u5a3c\u5ae6\u6636\u6c05\u9cb3","chao":"\u8d85\u6284\u949e\u671d\u5632\u6f6e\u5de2\u5435\u7092\u600a\u7ec9\u6641\u8016","che":"\u8f66\u626f\u64a4\u63a3\u5f7b\u6f88\u577c\u5c6e\u7817","chen":"\u90f4\u81e3\u8fb0\u5c18\u6668\u5ff1\u6c89\u9648\u8d81\u886c\u79f0\u8c0c\u62bb\u55d4\u5bb8\u741b\u6987\u809c\u80c2\u789c\u9f80","cheng":"\u6491\u57ce\u6a59\u6210\u5448\u4e58\u7a0b\u60e9\u6f84\u8bda\u627f\u901e\u9a8b\u79e4\u57d5\u5d4a\u5fb5\u6d48\u67a8\u67fd\u6a18\u665f\u584d\u77a0\u94d6\u88ce\u86cf\u9172","chi":"\u5403\u75f4\u6301\u5319\u6c60\u8fdf\u5f1b\u9a70\u803b\u9f7f\u4f88\u5c3a\u8d64\u7fc5\u65a5\u70bd\u50ba\u5880\u82aa\u830c\u640b\u53f1\u54e7\u557b\u55e4\u5f73\u996c\u6cb2\u5ab8\u6555\u80dd\u7719\u7735\u9e31\u761b\u892b\u86a9\u87ad\u7b1e\u7bea\u8c49\u8e05\u8e1f\u9b51","chong":"\u5145\u51b2\u866b\u5d07\u5ba0\u833a\u5fe1\u61a7\u94f3\u825f","chou":"\u62bd\u916c\u7574\u8e0c\u7a20\u6101\u7b79\u4ec7\u7ef8\u7785\u4e11\u4fe6\u5733\u5e31\u60c6\u6eb4\u59af\u7633\u96e0\u9c8b","chu":"\u81ed\u521d\u51fa\u6a71\u53a8\u8e87\u9504\u96cf\u6ec1\u9664\u695a\u7840\u50a8\u77d7\u6410\u89e6\u5904\u4e8d\u520d\u61b7\u7ecc\u6775\u696e\u6a17\u870d\u8e70\u9edc","chuan":"\u63e3\u5ddd\u7a7f\u693d\u4f20\u8239\u5598\u4e32\u63be\u821b\u60f4\u9044\u5ddb\u6c1a\u948f\u9569\u8221","chuang":"\u75ae\u7a97\u5e62\u5e8a\u95ef\u521b\u6006","chui":"\u5439\u708a\u6376\u9524\u5782\u9672\u68f0\u69cc","chun":"\u6625\u693f\u9187\u5507\u6df3\u7eaf\u8822\u4fc3\u83bc\u6c8c\u80ab\u6710\u9e51\u877d","chuo":"\u6233\u7ef0\u851f\u8fb6\u8f8d\u955e\u8e14\u9f8a","ci":"\u75b5\u8328\u78c1\u96cc\u8f9e\u6148\u74f7\u8bcd\u6b64\u523a\u8d50\u6b21\u8360\u5472\u5d6f\u9e5a\u8785\u7ccd\u8d91","cong":"\u806a\u8471\u56f1\u5306\u4ece\u4e1b\u506c\u82c1\u6dd9\u9aa2\u742e\u7481\u679e","cu":"\u51d1\u7c97\u918b\u7c07\u731d\u6b82\u8e59","cuan":"\u8e7f\u7be1\u7a9c\u6c46\u64ba\u6615\u7228","cui":"\u6467\u5d14\u50ac\u8106\u7601\u7cb9\u6dec\u7fe0\u8403\u60b4\u7480\u69b1\u96b9","cun":"\u6751\u5b58\u5bf8\u78cb\u5fd6\u76b4","cuo":"\u64ae\u6413\u63aa\u632b\u9519\u539d\u811e\u9509\u77ec\u75e4\u9e7e\u8e49\u8e9c","da":"\u642d\u8fbe\u7b54\u7629\u6253\u5927\u8037\u54d2\u55d2\u601b\u59b2\u75b8\u8921\u7b2a\u977c\u9791","dai":"\u5446\u6b79\u50a3\u6234\u5e26\u6b86\u4ee3\u8d37\u888b\u5f85\u902e\u6020\u57ed\u7519\u5454\u5cb1\u8fe8\u902f\u9a80\u7ed0\u73b3\u9edb","dan":"\u803d\u62c5\u4e39\u5355\u90f8\u63b8\u80c6\u65e6\u6c2e\u4f46\u60ee\u6de1\u8bde\u5f39\u86cb\u4ebb\u510b\u5369\u840f\u5556\u6fb9\u6a90\u6b9a\u8d55\u7708\u7605\u8043\u7baa","dang":"\u5f53\u6321\u515a\u8361\u6863\u8c20\u51fc\u83ea\u5b95\u7800\u94db\u88c6","dao":"\u5200\u6363\u8e48\u5012\u5c9b\u7977\u5bfc\u5230\u7a3b\u60bc\u9053\u76d7\u53e8\u5541\u5fc9\u6d2e\u6c18\u7118\u5fd1\u7e9b","de":"\u5fb7\u5f97\u7684\u951d","deng":"\u8e6c\u706f\u767b\u7b49\u77aa\u51f3\u9093\u5654\u5d9d\u6225\u78f4\u956b\u7c26","di":"\u5824\u4f4e\u6ef4\u8fea\u654c\u7b1b\u72c4\u6da4\u7fdf\u5ae1\u62b5\u5e95\u5730\u8482\u7b2c\u5e1d\u5f1f\u9012\u7f14\u6c10\u7c74\u8bcb\u8c1b\u90b8\u577b\u839c\u837b\u5600\u5a23\u67e2\u68e3\u89cc\u7825\u78b2\u7747\u955d\u7f9d\u9ab6","dian":"\u98a0\u6382\u6ec7\u7898\u70b9\u5178\u975b\u57ab\u7535\u4f43\u7538\u5e97\u60e6\u5960\u6dc0\u6bbf\u4e36\u963d\u576b\u57dd\u5dc5\u73b7\u765c\u766b\u7c1f\u8e2e","diao":"\u7889\u53fc\u96d5\u51cb\u5201\u6389\u540a\u9493\u8c03\u8f7a\u94de\u8729\u7c9c\u8c82","die":"\u8dcc\u7239\u789f\u8776\u8fed\u8c0d\u53e0\u4f5a\u57a4\u581e\u63f2\u558b\u6e2b\u8f76\u7252\u74de\u8936\u800b\u8e40\u9cbd\u9cce","ding":"\u4e01\u76ef\u53ee\u9489\u9876\u9f0e\u952d\u5b9a\u8ba2\u4e22\u4ec3\u5576\u738e\u815a\u7887\u753a\u94e4\u7594\u8035\u914a","dong":"\u4e1c\u51ac\u8463\u61c2\u52a8\u680b\u4f97\u606b\u51bb\u6d1e\u578c\u549a\u5cbd\u5cd2\u5902\u6c21\u80e8\u80f4\u7850\u9e2b","dou":"\u515c\u6296\u6597\u9661\u8c46\u9017\u75d8\u8538\u94ad\u7aa6\u7aac\u86aa\u7bfc\u9161","du":"\u90fd\u7763\u6bd2\u728a\u72ec\u8bfb\u5835\u7779\u8d4c\u675c\u9540\u809a\u5ea6\u6e21\u5992\u828f\u561f\u6e0e\u691f\u6a50\u724d\u8839\u7b03\u9ad1\u9ee9","duan":"\u7aef\u77ed\u953b\u6bb5\u65ad\u7f0e\u5f56\u6934\u7145\u7c16","dui":"\u5806\u5151\u961f\u5bf9\u603c\u619d\u7893","dun":"\u58a9\u5428\u8e72\u6566\u987f\u56e4\u949d\u76fe\u9041\u7096\u7818\u7905\u76f9\u9566\u8db8","duo":"\u6387\u54c6\u591a\u593a\u579b\u8eb2\u6735\u8dfa\u8235\u5241\u60f0\u5815\u5484\u54da\u7f0d\u67c1\u94ce\u88f0\u8e31","e":"\u86fe\u5ce8\u9e45\u4fc4\u989d\u8bb9\u5a25\u6076\u5384\u627c\u904f\u9102\u997f\u5669\u8c14\u57a9\u57ad\u82ca\u83aa\u843c\u5443\u6115\u5c59\u5a40\u8f6d\u66f7\u816d\u786a\u9507\u9537\u9e57\u989a\u9cc4","en":"\u6069\u84bd\u6441\u5514\u55ef","er":"\u800c\u513f\u8033\u5c14\u9975\u6d31\u4e8c\u8d30\u8fe9\u73e5\u94d2\u9e38\u9c95","fa":"\u53d1\u7f5a\u7b4f\u4f10\u4e4f\u9600\u6cd5\u73d0\u57a1\u781d","fan":"\u85e9\u5e06\u756a\u7ffb\u6a0a\u77fe\u9492\u7e41\u51e1\u70e6\u53cd\u8fd4\u8303\u8d29\u72af\u996d\u6cdb\u8629\u5e61\u72ad\u68b5\u6535\u71d4\u7548\u8e6f","fang":"\u574a\u82b3\u65b9\u80aa\u623f\u9632\u59a8\u4eff\u8bbf\u7eba\u653e\u531a\u90a1\u5f77\u94ab\u822b\u9c82","fei":"\u83f2\u975e\u5561\u98de\u80a5\u532a\u8bfd\u5420\u80ba\u5e9f\u6cb8\u8d39\u82be\u72d2\u60b1\u6ddd\u5983\u7ecb\u7eef\u69a7\u8153\u6590\u6249\u7953\u7829\u9544\u75f1\u871a\u7bda\u7fe1\u970f\u9cb1","fen":"\u82ac\u915a\u5429\u6c1b\u5206\u7eb7\u575f\u711a\u6c7e\u7c89\u594b\u4efd\u5fff\u6124\u7caa\u507e\u7035\u68fc\u610d\u9cbc\u9f22","feng":"\u4e30\u5c01\u67ab\u8702\u5cf0\u950b\u98ce\u75af\u70fd\u9022\u51af\u7f1d\u8bbd\u5949\u51e4\u4ff8\u9146\u8451\u6ca3\u781c","fu":"\u4f5b\u5426\u592b\u6577\u80a4\u5b75\u6276\u62c2\u8f90\u5e45\u6c1f\u7b26\u4f0f\u4fd8\u670d\u6d6e\u6daa\u798f\u88b1\u5f17\u752b\u629a\u8f85\u4fef\u91dc\u65a7\u812f\u8151\u5e9c\u8150\u8d74\u526f\u8986\u8d4b\u590d\u5085\u4ed8\u961c\u7236\u8179\u8d1f\u5bcc\u8ba3\u9644\u5987\u7f1a\u5490\u5310\u51eb\u90db\u8299\u82fb\u832f\u83a9\u83d4\u544b\u5e5e\u6ecf\u8274\u5b5a\u9a78\u7ec2\u6874\u8d59\u9efb\u9efc\u7f58\u7a03\u99a5\u864d\u86a8\u8709\u8760\u876e\u9eb8\u8dba\u8dd7\u9cc6","ga":"\u5676\u560e\u86e4\u5c2c\u5477\u5c15\u5c1c\u65ee\u9486","gai":"\u8be5\u6539\u6982\u9499\u76d6\u6e89\u4e10\u9654\u5793\u6224\u8d45\u80f2","gan":"\u5e72\u7518\u6746\u67d1\u7aff\u809d\u8d76\u611f\u79c6\u6562\u8d63\u5769\u82f7\u5c34\u64c0\u6cd4\u6de6\u6f89\u7ec0\u6a44\u65f0\u77f8\u75b3\u9150","gang":"\u5188\u521a\u94a2\u7f38\u809b\u7eb2\u5c97\u6e2f\u6206\u7f61\u9883\u7b7b","gong":"\u6760\u5de5\u653b\u529f\u606d\u9f9a\u4f9b\u8eac\u516c\u5bab\u5f13\u5de9\u6c5e\u62f1\u8d21\u5171\u857b\u5efe\u54a3\u73d9\u80b1\u86a3\u86e9\u89e5","gao":"\u7bd9\u768b\u9ad8\u818f\u7f94\u7cd5\u641e\u9550\u7a3f\u544a\u777e\u8bf0\u90dc\u84bf\u85c1\u7f1f\u69d4\u69c1\u6772\u9506","ge":"\u54e5\u6b4c\u6401\u6208\u9e3d\u80f3\u7599\u5272\u9769\u845b\u683c\u9601\u9694\u94ec\u4e2a\u5404\u9b32\u4ee1\u54ff\u5865\u55dd\u7ea5\u643f\u8188\u784c\u94ea\u9549\u88bc\u988c\u867c\u8238\u9abc\u9ac2","gei":"\u7ed9","gen":"\u6839\u8ddf\u4e98\u831b\u54cf\u826e","geng":"\u8015\u66f4\u5e9a\u7fb9\u57c2\u803f\u6897\u54fd\u8d53\u9ca0","gou":"\u94a9\u52fe\u6c9f\u82df\u72d7\u57a2\u6784\u8d2d\u591f\u4f5d\u8bdf\u5ca3\u9058\u5abe\u7f11\u89cf\u5f40\u9e32\u7b31\u7bdd\u97b2","gu":"\u8f9c\u83c7\u5495\u7b8d\u4f30\u6cbd\u5b64\u59d1\u9f13\u53e4\u86ca\u9aa8\u8c37\u80a1\u6545\u987e\u56fa\u96c7\u560f\u8bc2\u83f0\u54cc\u5d2e\u6c69\u688f\u8f71\u726f\u727f\u80cd\u81cc\u6bc2\u77bd\u7f5f\u94b4\u9522\u74e0\u9e2a\u9e44\u75fc\u86c4\u9164\u89da\u9cb4\u9ab0\u9e58","gua":"\u522e\u74dc\u5250\u5be1\u6302\u8902\u5366\u8bd6\u5471\u681d\u9e39","guai":"\u4e56\u62d0\u602a\u54d9","guan":"\u68fa\u5173\u5b98\u51a0\u89c2\u7ba1\u9986\u7f50\u60ef\u704c\u8d2f\u500c\u839e\u63bc\u6dab\u76e5\u9e73\u9ccf","guang":"\u5149\u5e7f\u901b\u72b7\u6844\u80f1\u7592","gui":"\u7470\u89c4\u572d\u7845\u5f52\u9f9f\u95fa\u8f68\u9b3c\u8be1\u7678\u6842\u67dc\u8dea\u8d35\u523d\u5326\u523f\u5e8b\u5b84\u59ab\u6867\u7085\u6677\u7688\u7c0b\u9c91\u9cdc","gun":"\u8f8a\u6eda\u68cd\u4e28\u886e\u7ef2\u78d9\u9ca7","guo":"\u9505\u90ed\u56fd\u679c\u88f9\u8fc7\u9998\u8803\u57da\u63b4\u5459\u56d7\u5e3c\u5d1e\u7313\u6901\u8662\u951e\u8052\u872e\u873e\u8748","ha":"\u54c8","hai":"\u9ab8\u5b69\u6d77\u6c26\u4ea5\u5bb3\u9a87\u54b4\u55e8\u988f\u91a2","han":"\u9163\u61a8\u90af\u97e9\u542b\u6db5\u5bd2\u51fd\u558a\u7f55\u7ff0\u64bc\u634d\u65f1\u61be\u608d\u710a\u6c57\u6c49\u9097\u83e1\u6496\u961a\u701a\u6657\u7113\u9894\u86b6\u9f3e","hen":"\u592f\u75d5\u5f88\u72e0\u6068","hang":"\u676d\u822a\u6c86\u7ed7\u73e9\u6841","hao":"\u58d5\u568e\u8c6a\u6beb\u90dd\u597d\u8017\u53f7\u6d69\u8585\u55e5\u5686\u6fe0\u704f\u660a\u7693\u98a2\u869d","he":"\u5475\u559d\u8377\u83cf\u6838\u79be\u548c\u4f55\u5408\u76d2\u8c89\u9602\u6cb3\u6db8\u8d6b\u8910\u9e64\u8d3a\u8bc3\u52be\u58d1\u85ff\u55d1\u55ec\u9616\u76cd\u86b5\u7fee","hei":"\u563f\u9ed1","heng":"\u54fc\u4ea8\u6a2a\u8861\u6052\u8a07\u8605","hong":"\u8f70\u54c4\u70d8\u8679\u9e3f\u6d2a\u5b8f\u5f18\u7ea2\u9ec9\u8ba7\u836d\u85a8\u95f3\u6cd3","hou":"\u5589\u4faf\u7334\u543c\u539a\u5019\u540e\u5820\u5f8c\u9005\u760a\u7bcc\u7cc7\u9c8e\u9aba","hu":"\u547c\u4e4e\u5ffd\u745a\u58f6\u846b\u80e1\u8774\u72d0\u7cca\u6e56\u5f27\u864e\u552c\u62a4\u4e92\u6caa\u6237\u51b1\u553f\u56eb\u5cb5\u7322\u6019\u60da\u6d52\u6ef9\u7425\u69f2\u8f77\u89f3\u70c0\u7173\u623d\u6248\u795c\u9e55\u9e71\u7b0f\u9190\u659b","hua":"\u82b1\u54d7\u534e\u733e\u6ed1\u753b\u5212\u5316\u8bdd\u5290\u6d4d\u9a85\u6866\u94e7\u7a1e","huai":"\u69d0\u5f8a\u6000\u6dee\u574f\u8fd8\u8e1d","huan":"\u6b22\u73af\u6853\u7f13\u6362\u60a3\u5524\u75ea\u8c62\u7115\u6da3\u5ba6\u5e7b\u90c7\u5942\u57b8\u64d0\u571c\u6d39\u6d63\u6f36\u5bf0\u902d\u7f33\u953e\u9ca9\u9b1f","huang":"\u8352\u614c\u9ec4\u78fa\u8757\u7c27\u7687\u51f0\u60f6\u714c\u6643\u5e4c\u604d\u8c0e\u968d\u5fa8\u6e5f\u6f62\u9051\u749c\u8093\u7640\u87e5\u7bc1\u9cc7","hui":"\u7070\u6325\u8f89\u5fbd\u6062\u86d4\u56de\u6bc1\u6094\u6167\u5349\u60e0\u6666\u8d3f\u79fd\u4f1a\u70e9\u6c47\u8bb3\u8bf2\u7ed8\u8bd9\u8334\u835f\u8559\u54d5\u5599\u96b3\u6d04\u5f57\u7f0b\u73f2\u6656\u605a\u867a\u87ea\u9ebe","hun":"\u8364\u660f\u5a5a\u9b42\u6d51\u6df7\u8be8\u9984\u960d\u6eb7\u7f17","huo":"\u8c41\u6d3b\u4f19\u706b\u83b7\u6216\u60d1\u970d\u8d27\u7978\u6509\u56af\u5925\u94ac\u952a\u956c\u8020\u8816","ji":"\u51fb\u573e\u57fa\u673a\u7578\u7a3d\u79ef\u7b95\u808c\u9965\u8ff9\u6fc0\u8ba5\u9e21\u59ec\u7ee9\u7f09\u5409\u6781\u68d8\u8f91\u7c4d\u96c6\u53ca\u6025\u75be\u6c72\u5373\u5ac9\u7ea7\u6324\u51e0\u810a\u5df1\u84df\u6280\u5180\u5b63\u4f0e\u796d\u5242\u60b8\u6d4e\u5bc4\u5bc2\u8ba1\u8bb0\u65e2\u5fcc\u9645\u5993\u7ee7\u7eaa\u5c45\u4e0c\u4e69\u525e\u4f76\u4f74\u8114\u58bc\u82a8\u82b0\u8401\u84ba\u857a\u638e\u53fd\u54ad\u54dc\u5527\u5c8c\u5d74\u6d0e\u5f50\u5c50\u9aa5\u757f\u7391\u696b\u6b9b\u621f\u6222\u8d4d\u89ca\u7284\u9f51\u77f6\u7f81\u5d47\u7a37\u7620\u7635\u866e\u7b08\u7b04\u66a8\u8dfb\u8dfd\u9701\u9c9a\u9cab\u9afb\u9e82","jia":"\u5609\u67b7\u5939\u4f73\u5bb6\u52a0\u835a\u988a\u8d3e\u7532\u94be\u5047\u7a3c\u4ef7\u67b6\u9a7e\u5ac1\u4f3d\u90cf\u62ee\u5cac\u6d43\u8fe6\u73c8\u621b\u80db\u605d\u94d7\u9553\u75c2\u86f1\u7b33\u8888\u8dcf","jian":"\u6b7c\u76d1\u575a\u5c16\u7b3a\u95f4\u714e\u517c\u80a9\u8270\u5978\u7f04\u8327\u68c0\u67ec\u78b1\u7877\u62e3\u6361\u7b80\u4fed\u526a\u51cf\u8350\u69db\u9274\u8df5\u8d31\u89c1\u952e\u7bad\u4ef6\u5065\u8230\u5251\u996f\u6e10\u6e85\u6da7\u5efa\u50ed\u8c0f\u8c2b\u83c5\u84b9\u641b\u56dd\u6e54\u8e47\u8b07\u7f23\u67a7\u67d9\u6957\u620b\u622c\u726e\u728d\u6bfd\u8171\u7751\u950f\u9e63\u88e5\u7b15\u7bb4\u7fe6\u8dbc\u8e3a\u9ca3\u97af","jiang":"\u50f5\u59dc\u5c06\u6d46\u6c5f\u7586\u848b\u6868\u5956\u8bb2\u5320\u9171\u964d\u8333\u6d1a\u7edb\u7f30\u729f\u7913\u8029\u7ce8\u8c47","jiao":"\u8549\u6912\u7901\u7126\u80f6\u4ea4\u90ca\u6d47\u9a84\u5a07\u56bc\u6405\u94f0\u77eb\u4fa5\u811a\u72e1\u89d2\u997a\u7f34\u7ede\u527f\u6559\u9175\u8f7f\u8f83\u53eb\u4f7c\u50ec\u832d\u6322\u564d\u5ce4\u5fbc\u59e3\u7e9f\u656b\u768e\u9e6a\u86df\u91ae\u8de4\u9c9b","jie":"\u7a96\u63ed\u63a5\u7686\u79f8\u8857\u9636\u622a\u52ab\u8282\u6854\u6770\u6377\u776b\u7aed\u6d01\u7ed3\u89e3\u59d0\u6212\u85c9\u82a5\u754c\u501f\u4ecb\u75a5\u8beb\u5c4a\u5048\u8ba6\u8bd8\u5588\u55df\u736c\u5a55\u5b51\u6840\u7352\u78a3\u9534\u7596\u88b7\u9889\u86a7\u7faf\u9c92\u9ab1\u9aeb","jin":"\u5dfe\u7b4b\u65a4\u91d1\u4eca\u6d25\u895f\u7d27\u9526\u4ec5\u8c28\u8fdb\u9773\u664b\u7981\u8fd1\u70ec\u6d78\u5c3d\u537a\u8369\u5807\u5664\u9991\u5ed1\u5997\u7f19\u747e\u69ff\u8d46\u89d0\u9485\u9513\u887f\u77dc","jing":"\u52b2\u8346\u5162\u830e\u775b\u6676\u9cb8\u4eac\u60ca\u7cbe\u7cb3\u7ecf\u4e95\u8b66\u666f\u9888\u9759\u5883\u656c\u955c\u5f84\u75c9\u9756\u7adf\u7ade\u51c0\u522d\u5106\u9631\u83c1\u734d\u61ac\u6cfe\u8ff3\u5f2a\u5a67\u80bc\u80eb\u8148\u65cc","jiong":"\u70af\u7a98\u5182\u8fe5\u6243","jiu":"\u63ea\u7a76\u7ea0\u7396\u97ed\u4e45\u7078\u4e5d\u9152\u53a9\u6551\u65e7\u81fc\u8205\u548e\u5c31\u759a\u50e6\u557e\u9604\u67e9\u6855\u9e6b\u8d73\u9b0f","ju":"\u97a0\u62d8\u72d9\u75bd\u9a79\u83ca\u5c40\u5480\u77e9\u4e3e\u6cae\u805a\u62d2\u636e\u5de8\u5177\u8ddd\u8e1e\u952f\u4ff1\u53e5\u60e7\u70ac\u5267\u5028\u8bb5\u82e3\u82f4\u8392\u63ac\u907d\u5c66\u741a\u67b8\u6910\u6998\u6989\u6a58\u728b\u98d3\u949c\u9514\u7aad\u88fe\u8d84\u91b5\u8e3d\u9f83\u96ce\u97ab","juan":"\u6350\u9e43\u5a1f\u5026\u7737\u5377\u7ee2\u9104\u72f7\u6d93\u684a\u8832\u9529\u954c\u96bd","jue":"\u6485\u652b\u6289\u6398\u5014\u7235\u89c9\u51b3\u8bc0\u7edd\u53a5\u5282\u8c32\u77cd\u8568\u5658\u5d1b\u7357\u5b53\u73cf\u6877\u6a5b\u721d\u9562\u8e76\u89d6","jun":"\u5747\u83cc\u94a7\u519b\u541b\u5cfb\u4fca\u7ae3\u6d5a\u90e1\u9a8f\u6343\u72fb\u76b2\u7b60\u9e87","ka":"\u5580\u5496\u5361\u4f67\u5494\u80e9","ke":"\u54af\u5777\u82db\u67ef\u68f5\u78d5\u9897\u79d1\u58f3\u54b3\u53ef\u6e34\u514b\u523b\u5ba2\u8bfe\u5ca2\u606a\u6e98\u9a92\u7f02\u73c2\u8f72\u6c2a\u778c\u94b6\u75b4\u7aa0\u874c\u9ac1","kai":"\u5f00\u63e9\u6977\u51ef\u6168\u5240\u57b2\u8488\u5ffe\u607a\u94e0\u950e","kan":"\u520a\u582a\u52d8\u574e\u780d\u770b\u4f83\u51f5\u83b0\u83b6\u6221\u9f9b\u77b0","kang":"\u5eb7\u6177\u7ce0\u625b\u6297\u4ea2\u7095\u5751\u4f09\u95f6\u94aa","kao":"\u8003\u62f7\u70e4\u9760\u5c3b\u6832\u7292\u94d0","ken":"\u80af\u5543\u57a6\u6073\u57a0\u88c9\u9880","keng":"\u542d\u5fd0\u94ff","kong":"\u7a7a\u6050\u5b54\u63a7\u5025\u5d06\u7b9c","kou":"\u62a0\u53e3\u6263\u5bc7\u82a4\u853b\u53e9\u770d\u7b58","ku":"\u67af\u54ed\u7a9f\u82e6\u9177\u5e93\u88e4\u5233\u5800\u55be\u7ed4\u9ab7","kua":"\u5938\u57ae\u630e\u8de8\u80ef\u4f89","kuai":"\u5757\u7b77\u4fa9\u5feb\u84af\u90d0\u8489\u72ef\u810d","kuan":"\u5bbd\u6b3e\u9acb","kuang":"\u5321\u7b50\u72c2\u6846\u77ff\u7736\u65f7\u51b5\u8bd3\u8bf3\u909d\u5739\u593c\u54d0\u7ea9\u8d36","kui":"\u4e8f\u76d4\u5cbf\u7aa5\u8475\u594e\u9b41\u5080\u9988\u6127\u6e83\u9997\u532e\u5914\u9697\u63c6\u55b9\u559f\u609d\u6126\u9615\u9035\u668c\u777d\u8069\u8770\u7bd1\u81fe\u8dec","kun":"\u5764\u6606\u6346\u56f0\u6083\u9603\u7428\u951f\u918c\u9cb2\u9ae1","kuo":"\u62ec\u6269\u5ed3\u9614\u86de","la":"\u5783\u62c9\u5587\u8721\u814a\u8fa3\u5566\u524c\u647a\u908b\u65ef\u782c\u760c","lai":"\u83b1\u6765\u8d56\u5d03\u5f95\u6d9e\u6fd1\u8d49\u7750\u94fc\u765e\u7c41","lan":"\u84dd\u5a6a\u680f\u62e6\u7bee\u9611\u5170\u6f9c\u8c30\u63fd\u89c8\u61d2\u7f06\u70c2\u6ee5\u5549\u5c9a\u61d4\u6f24\u6984\u6593\u7f71\u9567\u8934","lang":"\u7405\u6994\u72fc\u5eca\u90ce\u6717\u6d6a\u83a8\u8497\u5577\u9606\u9512\u7a02\u8782","lao":"\u635e\u52b3\u7262\u8001\u4f6c\u59e5\u916a\u70d9\u6d9d\u5520\u5d02\u6833\u94d1\u94f9\u75e8\u91aa","le":"\u52d2\u4e50\u808b\u4ec2\u53fb\u561e\u6cd0\u9cd3","lei":"\u96f7\u956d\u857e\u78ca\u7d2f\u5121\u5792\u64c2\u7c7b\u6cea\u7fb8\u8bd4\u837d\u54a7\u6f2f\u5ad8\u7f27\u6a91\u8012\u9179","ling":"\u68f1\u51b7\u62ce\u73b2\u83f1\u96f6\u9f84\u94c3\u4f36\u7f9a\u51cc\u7075\u9675\u5cad\u9886\u53e6\u4ee4\u9143\u5844\u82d3\u5464\u56f9\u6ce0\u7eeb\u67c3\u68c2\u74f4\u8046\u86c9\u7fce\u9cae","leng":"\u695e\u6123","li":"\u5398\u68a8\u7281\u9ece\u7bf1\u72f8\u79bb\u6f13\u7406\u674e\u91cc\u9ca4\u793c\u8389\u8354\u540f\u6817\u4e3d\u5389\u52b1\u783e\u5386\u5229\u5088\u4f8b\u4fd0\u75e2\u7acb\u7c92\u6ca5\u96b6\u529b\u7483\u54e9\u4fea\u4fda\u90e6\u575c\u82c8\u8385\u84e0\u85dc\u6369\u5456\u5533\u55b1\u7301\u6ea7\u6fa7\u9026\u5a0c\u5ae0\u9a8a\u7f21\u73de\u67a5\u680e\u8f79\u623e\u783a\u8a48\u7f79\u9502\u9e42\u75a0\u75ac\u86ce\u870a\u8821\u7b20\u7be5\u7c9d\u91b4\u8dde\u96f3\u9ca1\u9ce2\u9ee7","lian":"\u4fe9\u8054\u83b2\u8fde\u9570\u5ec9\u601c\u6d9f\u5e18\u655b\u8138\u94fe\u604b\u70bc\u7ec3\u631b\u8539\u5941\u6f4b\u6fc2\u5a08\u740f\u695d\u6b93\u81c1\u81a6\u88e2\u880a\u9ca2","liang":"\u7cae\u51c9\u6881\u7cb1\u826f\u4e24\u8f86\u91cf\u667e\u4eae\u8c05\u589a\u690b\u8e09\u9753\u9b49","liao":"\u64a9\u804a\u50da\u7597\u71ce\u5be5\u8fbd\u6f66\u4e86\u6482\u9563\u5ed6\u6599\u84fc\u5c25\u5639\u7360\u5bee\u7f2d\u948c\u9e69\u8022","lie":"\u5217\u88c2\u70c8\u52a3\u730e\u51bd\u57d2\u6d0c\u8d94\u8e90\u9b23","lin":"\u7433\u6797\u78f7\u9716\u4e34\u90bb\u9cde\u6dcb\u51db\u8d41\u541d\u853a\u5d99\u5eea\u9074\u6aa9\u8f9a\u77b5\u7cbc\u8e8f\u9e9f","liu":"\u6e9c\u7409\u69b4\u786b\u998f\u7559\u5218\u7624\u6d41\u67f3\u516d\u62a1\u507b\u848c\u6cd6\u6d4f\u905b\u9a9d\u7efa\u65d2\u7198\u950d\u954f\u9e68\u938f","long":"\u9f99\u804b\u5499\u7b3c\u7abf\u9686\u5784\u62e2\u9647\u5f04\u5785\u830f\u6cf7\u73d1\u680a\u80e7\u783b\u7643","lou":"\u697c\u5a04\u6402\u7bd3\u6f0f\u964b\u55bd\u5d5d\u9542\u7618\u8027\u877c\u9ac5","lu":"\u82a6\u5362\u9885\u5e90\u7089\u63b3\u5364\u864f\u9c81\u9e93\u788c\u9732\u8def\u8d42\u9e7f\u6f5e\u7984\u5f55\u9646\u622e\u5786\u6445\u64b8\u565c\u6cf8\u6e0c\u6f09\u7490\u680c\u6a79\u8f73\u8f82\u8f98\u6c07\u80ea\u9565\u9e2c\u9e6d\u7c0f\u823b\u9c88","lv":"\u9a74\u5415\u94dd\u4fa3\u65c5\u5c65\u5c61\u7f15\u8651\u6c2f\u5f8b\u7387\u6ee4\u7eff\u634b\u95fe\u6988\u8182\u7a06\u891b","luan":"\u5ce6\u5b6a\u6ee6\u5375\u4e71\u683e\u9e3e\u92ae","lue":"\u63a0\u7565\u950a","lun":"\u8f6e\u4f26\u4ed1\u6ca6\u7eb6\u8bba\u56f5","luo":"\u841d\u87ba\u7f57\u903b\u9523\u7ba9\u9aa1\u88f8\u843d\u6d1b\u9a86\u7edc\u502e\u8366\u645e\u7321\u6cfa\u6924\u8136\u9559\u7630\u96d2","ma":"\u5988\u9ebb\u739b\u7801\u8682\u9a6c\u9a82\u561b\u5417\u551b\u72b8\u5b37\u6769\u9ebd","mai":"\u57cb\u4e70\u9ea6\u5356\u8fc8\u8109\u52a2\u836c\u54aa\u973e","man":"\u7792\u9992\u86ee\u6ee1\u8513\u66fc\u6162\u6f2b\u8c29\u5881\u5e54\u7f26\u71b3\u9558\u989f\u87a8\u9cd7\u9794","mang":"\u8292\u832b\u76f2\u5fd9\u83bd\u9099\u6f2d\u6726\u786d\u87d2","meng":"\u6c13\u840c\u8499\u6aac\u76df\u9530\u731b\u68a6\u5b5f\u52d0\u750d\u77a2\u61f5\u791e\u867b\u8722\u8813\u824b\u8268\u9efe","miao":"\u732b\u82d7\u63cf\u7784\u85d0\u79d2\u6e3a\u5e99\u5999\u55b5\u9088\u7f08\u7f2a\u676a\u6dfc\u7707\u9e4b\u8731","mao":"\u8305\u951a\u6bdb\u77db\u94c6\u536f\u8302\u5192\u5e3d\u8c8c\u8d38\u4f94\u88a4\u52d6\u8306\u5cc1\u7441\u6634\u7266\u8004\u65c4\u61cb\u7780\u86d1\u8765\u87ca\u9ae6","me":"\u4e48","mei":"\u73ab\u679a\u6885\u9176\u9709\u7164\u6ca1\u7709\u5a92\u9541\u6bcf\u7f8e\u6627\u5bd0\u59b9\u5a9a\u5776\u8393\u5d4b\u7338\u6d7c\u6e44\u6963\u9545\u9e5b\u8882\u9b45","men":"\u95e8\u95f7\u4eec\u626a\u739f\u7116\u61d1\u9494","mi":"\u772f\u919a\u9761\u7cdc\u8ff7\u8c1c\u5f25\u7c73\u79d8\u89c5\u6ccc\u871c\u5bc6\u5e42\u8288\u5196\u8c27\u863c\u5627\u7315\u736f\u6c68\u5b93\u5f2d\u8112\u6549\u7cf8\u7e3b\u9e8b","mian":"\u68c9\u7720\u7ef5\u5195\u514d\u52c9\u5a29\u7f05\u9762\u6c94\u6e4e\u817c\u7704","mie":"\u8511\u706d\u54a9\u881b\u7bfe","min":"\u6c11\u62bf\u76bf\u654f\u60af\u95fd\u82e0\u5cb7\u95f5\u6cef\u73c9","ming":"\u660e\u879f\u9e23\u94ed\u540d\u547d\u51a5\u8317\u6e9f\u669d\u7791\u9169","miu":"\u8c2c","mo":"\u6478\u6479\u8611\u6a21\u819c\u78e8\u6469\u9b54\u62b9\u672b\u83ab\u58a8\u9ed8\u6cab\u6f20\u5bde\u964c\u8c1f\u8309\u84e6\u998d\u5aeb\u9546\u79e3\u763c\u8031\u87c6\u8c8a\u8c98","mou":"\u8c0b\u725f\u67d0\u53b6\u54de\u5a7a\u7738\u936a","mu":"\u62c7\u7261\u4ea9\u59c6\u6bcd\u5893\u66ae\u5e55\u52df\u6155\u6728\u76ee\u7766\u7267\u7a46\u4eeb\u82dc\u5452\u6c90\u6bea\u94bc","na":"\u62ff\u54ea\u5450\u94a0\u90a3\u5a1c\u7eb3\u5185\u637a\u80ad\u954e\u8872\u7bac","nai":"\u6c16\u4e43\u5976\u8010\u5948\u9f10\u827f\u8418\u67f0","nan":"\u5357\u7537\u96be\u56ca\u5583\u56e1\u6960\u8169\u877b\u8d67","nao":"\u6320\u8111\u607c\u95f9\u5b6c\u57b4\u7331\u7459\u7847\u94d9\u86f2","ne":"\u6dd6\u5462\u8bb7","nei":"\u9981","nen":"\u5ae9\u80fd\u6798\u6041","ni":"\u59ae\u9713\u502a\u6ce5\u5c3c\u62df\u4f60\u533f\u817b\u9006\u6eba\u4f32\u576d\u730a\u6029\u6ee0\u6635\u65ce\u7962\u615d\u7768\u94cc\u9cb5","nian":"\u852b\u62c8\u5e74\u78be\u64b5\u637b\u5ff5\u5eff\u8f87\u9ecf\u9c87\u9cb6","niang":"\u5a18\u917f","niao":"\u9e1f\u5c3f\u8311\u5b32\u8132\u8885","nie":"\u634f\u8042\u5b7d\u556e\u954a\u954d\u6d85\u4e5c\u9667\u8616\u55eb\u8080\u989e\u81ec\u8e51","nin":"\u60a8\u67e0","ning":"\u72de\u51dd\u5b81\u62e7\u6cde\u4f5e\u84e5\u549b\u752f\u804d","niu":"\u725b\u626d\u94ae\u7ebd\u72c3\u5ff8\u599e\u86b4","nong":"\u8113\u6d53\u519c\u4fac","nu":"\u5974\u52aa\u6012\u5476\u5e11\u5f29\u80ec\u5b65\u9a7d","nv":"\u5973\u6067\u9495\u8844","nuan":"\u6696","nuenue":"\u8650","nue":"\u759f\u8c11","nuo":"\u632a\u61e6\u7cef\u8bfa\u50a9\u6426\u558f\u9518","ou":"\u54e6\u6b27\u9e25\u6bb4\u85d5\u5455\u5076\u6ca4\u6004\u74ef\u8026","pa":"\u556a\u8db4\u722c\u5e15\u6015\u7436\u8469\u7b62","pai":"\u62cd\u6392\u724c\u5f98\u6e43\u6d3e\u4ff3\u848e","pan":"\u6500\u6f58\u76d8\u78d0\u76fc\u7554\u5224\u53db\u723f\u6cee\u88a2\u897b\u87e0\u8e52","pang":"\u4e53\u5e9e\u65c1\u802a\u80d6\u6ec2\u9004","pao":"\u629b\u5486\u5228\u70ae\u888d\u8dd1\u6ce1\u530f\u72cd\u5e96\u812c\u75b1","pei":"\u5478\u80da\u57f9\u88f4\u8d54\u966a\u914d\u4f69\u6c9b\u638a\u8f94\u5e14\u6de0\u65c6\u952b\u9185\u9708","pen":"\u55b7\u76c6\u6e53","peng":"\u7830\u62a8\u70f9\u6f8e\u5f6d\u84ec\u68da\u787c\u7bf7\u81a8\u670b\u9e4f\u6367\u78b0\u576f\u580b\u562d\u6026\u87db","pi":"\u7812\u9739\u6279\u62ab\u5288\u7435\u6bd7\u5564\u813e\u75b2\u76ae\u5339\u75de\u50fb\u5c41\u8b6c\u4e15\u9674\u90b3\u90eb\u572e\u9f19\u64d7\u567c\u5e80\u5ab2\u7eb0\u6787\u7513\u7765\u7f74\u94cd\u75e6\u7656\u758b\u868d\u8c94","pian":"\u7bc7\u504f\u7247\u9a97\u8c1d\u9a88\u728f\u80fc\u890a\u7fe9\u8e41","piao":"\u98d8\u6f02\u74e2\u7968\u527d\u560c\u5ad6\u7f25\u6b8d\u779f\u87b5","pie":"\u6487\u77a5\u4e3f\u82e4\u6c15","pin":"\u62fc\u9891\u8d2b\u54c1\u8058\u62da\u59d8\u5ad4\u6980\u725d\u98a6","ping":"\u4e52\u576a\u82f9\u840d\u5e73\u51ed\u74f6\u8bc4\u5c4f\u4fdc\u5a09\u67b0\u9c86","po":"\u5761\u6cfc\u9887\u5a46\u7834\u9b44\u8feb\u7c95\u53f5\u9131\u6ea5\u73c0\u948b\u94b7\u76a4\u7b38","pou":"\u5256\u88d2\u8e23","pu":"\u6251\u94fa\u4ec6\u8386\u8461\u83e9\u84b2\u57d4\u6734\u5703\u666e\u6d66\u8c31\u66dd\u7011\u530d\u5657\u6fee\u749e\u6c06\u9564\u9568\u8e7c","qi":"\u671f\u6b3a\u6816\u621a\u59bb\u4e03\u51c4\u6f06\u67d2\u6c8f\u5176\u68cb\u5947\u6b67\u7566\u5d0e\u8110\u9f50\u65d7\u7948\u7941\u9a91\u8d77\u5c82\u4e5e\u4f01\u542f\u5951\u780c\u5668\u6c14\u8fc4\u5f03\u6c7d\u6ce3\u8bab\u4e9f\u4e93\u573b\u8291\u840b\u847a\u5601\u5c7a\u5c90\u6c54\u6dc7\u9a90\u7eee\u742a\u7426\u675e\u6864\u69ed\u6b39\u797a\u61a9\u789b\u86f4\u871e\u7da6\u7dae\u8dbf\u8e4a\u9ccd\u9e92","qia":"\u6390\u6070\u6d3d\u845c","qian":"\u7275\u6266\u948e\u94c5\u5343\u8fc1\u7b7e\u4edf\u8c26\u4e7e\u9ed4\u94b1\u94b3\u524d\u6f5c\u9063\u6d45\u8c34\u5811\u5d4c\u6b20\u6b49\u4f65\u9621\u828a\u82a1\u8368\u63ae\u5c8d\u60ad\u614a\u9a9e\u6434\u8930\u7f31\u6920\u80b7\u6106\u94a4\u8654\u7b9d","qiang":"\u67aa\u545b\u8154\u7f8c\u5899\u8537\u5f3a\u62a2\u5af1\u6a2f\u6217\u709d\u9516\u9535\u956a\u8941\u8723\u7f9f\u8deb\u8dc4","qiao":"\u6a47\u9539\u6572\u6084\u6865\u77a7\u4e54\u4fa8\u5de7\u9798\u64ac\u7fd8\u5ced\u4fcf\u7a8d\u5281\u8bee\u8c2f\u835e\u6100\u6194\u7f32\u6a35\u6bf3\u7857\u8df7\u9792","qie":"\u5207\u8304\u4e14\u602f\u7a83\u90c4\u553c\u60ec\u59be\u6308\u9532\u7ba7","qin":"\u94a6\u4fb5\u4eb2\u79e6\u7434\u52e4\u82b9\u64d2\u79bd\u5bdd\u6c81\u82a9\u84c1\u8572\u63ff\u5423\u55ea\u5659\u6eb1\u6a8e\u8793\u887e","qing":"\u9752\u8f7b\u6c22\u503e\u537f\u6e05\u64ce\u6674\u6c30\u60c5\u9877\u8bf7\u5e86\u5029\u82d8\u570a\u6aa0\u78ec\u873b\u7f44\u7b90\u8b26\u9cad\u9ee5","qiong":"\u743c\u7a77\u909b\u8315\u7a79\u7b47\u928e","qiu":"\u79cb\u4e18\u90b1\u7403\u6c42\u56da\u914b\u6cc5\u4fc5\u6c3d\u5def\u827d\u72b0\u6e6b\u9011\u9052\u6978\u8d47\u9e20\u866c\u86af\u8764\u88d8\u7cd7\u9cc5\u9f3d","qu":"\u8d8b\u533a\u86c6\u66f2\u8eaf\u5c48\u9a71\u6e20\u53d6\u5a36\u9f8b\u8da3\u53bb\u8bce\u52ac\u8556\u8627\u5c96\u8862\u9612\u74a9\u89d1\u6c0d\u795b\u78f2\u766f\u86d0\u883c\u9eb4\u77bf\u9ee2","quan":"\u5708\u98a7\u6743\u919b\u6cc9\u5168\u75ca\u62f3\u72ac\u5238\u529d\u8be0\u8343\u737e\u609b\u7efb\u8f81\u754e\u94e8\u8737\u7b4c\u9b08","que":"\u7f3a\u7094\u7638\u5374\u9e4a\u69b7\u786e\u96c0\u9619\u60ab","qun":"\u88d9\u7fa4\u9021","ran":"\u7136\u71c3\u5189\u67d3\u82d2\u9aef","rang":"\u74e4\u58e4\u6518\u56b7\u8ba9\u79b3\u7a70","rao":"\u9976\u6270\u7ed5\u835b\u5a06\u6861","ruo":"\u60f9\u82e5\u5f31","re":"\u70ed\u504c","ren":"\u58ec\u4ec1\u4eba\u5fcd\u97e7\u4efb\u8ba4\u5203\u598a\u7eab\u4ede\u834f\u845a\u996a\u8f6b\u7a14\u887d","reng":"\u6254\u4ecd","ri":"\u65e5","rong":"\u620e\u8338\u84c9\u8363\u878d\u7194\u6eb6\u5bb9\u7ed2\u5197\u5d58\u72e8\u7f1b\u6995\u877e","rou":"\u63c9\u67d4\u8089\u7cc5\u8e42\u97a3","ru":"\u8339\u8815\u5112\u5b7a\u5982\u8fb1\u4e73\u6c5d\u5165\u8925\u84d0\u85b7\u5685\u6d33\u6ebd\u6fe1\u94f7\u8966\u98a5","ruan":"\u8f6f\u962e\u670a","rui":"\u854a\u745e\u9510\u82ae\u8564\u777f\u868b","run":"\u95f0\u6da6","sa":"\u6492\u6d12\u8428\u5345\u4ee8\u6332\u98d2","sai":"\u816e\u9cc3\u585e\u8d5b\u567b","san":"\u4e09\u53c1\u4f1e\u6563\u5f61\u9993\u6c35\u6bf5\u7cc1\u9730","sang":"\u6851\u55d3\u4e27\u6421\u78c9\u98a1","sao":"\u6414\u9a9a\u626b\u5ac2\u57fd\u81ca\u7619\u9ccb","se":"\u745f\u8272\u6da9\u556c\u94e9\u94ef\u7a51","sen":"\u68ee","seng":"\u50e7","sha":"\u838e\u7802\u6740\u5239\u6c99\u7eb1\u50bb\u5565\u715e\u810e\u6b43\u75e7\u88df\u970e\u9ca8","shai":"\u7b5b\u6652\u917e","shan":"\u73ca\u82eb\u6749\u5c71\u5220\u717d\u886b\u95ea\u9655\u64c5\u8d61\u81b3\u5584\u6c55\u6247\u7f2e\u5261\u8baa\u912f\u57cf\u829f\u6f78\u59d7\u9a9f\u81bb\u9490\u759d\u87ee\u8222\u8dda\u9cdd","shang":"\u5892\u4f24\u5546\u8d4f\u664c\u4e0a\u5c1a\u88f3\u57a7\u7ef1\u6b87\u71b5\u89de","shao":"\u68a2\u634e\u7a0d\u70e7\u828d\u52fa\u97f6\u5c11\u54e8\u90b5\u7ecd\u52ad\u82d5\u6f72\u86f8\u7b24\u7b72\u8244","she":"\u5962\u8d4a\u86c7\u820c\u820d\u8d66\u6444\u5c04\u6151\u6d89\u793e\u8bbe\u538d\u4f58\u731e\u7572\u9e9d","shen":"\u7837\u7533\u547b\u4f38\u8eab\u6df1\u5a20\u7ec5\u795e\u6c88\u5ba1\u5a76\u751a\u80be\u614e\u6e17\u8bdc\u8c02\u5432\u54c2\u6e16\u6939\u77e7\u8703","sheng":"\u58f0\u751f\u7525\u7272\u5347\u7ef3\u7701\u76db\u5269\u80dc\u5723\u4e1e\u6e11\u5ab5\u771a\u7b19","shi":"\u5e08\u5931\u72ee\u65bd\u6e7f\u8bd7\u5c38\u8671\u5341\u77f3\u62fe\u65f6\u4ec0\u98df\u8680\u5b9e\u8bc6\u53f2\u77e2\u4f7f\u5c4e\u9a76\u59cb\u5f0f\u793a\u58eb\u4e16\u67ff\u4e8b\u62ed\u8a93\u901d\u52bf\u662f\u55dc\u566c\u9002\u4ed5\u4f8d\u91ca\u9970\u6c0f\u5e02\u6043\u5ba4\u89c6\u8bd5\u8c25\u57d8\u83b3\u84cd\u5f11\u5511\u9963\u8f7c\u8006\u8d33\u70bb\u793b\u94c8\u94ca\u87ab\u8210\u7b6e\u8c55\u9ca5\u9cba","shou":"\u6536\u624b\u9996\u5b88\u5bff\u6388\u552e\u53d7\u7626\u517d\u624c\u72e9\u7ef6\u824f","shu":"\u852c\u67a2\u68b3\u6b8a\u6292\u8f93\u53d4\u8212\u6dd1\u758f\u4e66\u8d4e\u5b70\u719f\u85af\u6691\u66d9\u7f72\u8700\u9ecd\u9f20\u5c5e\u672f\u8ff0\u6811\u675f\u620d\u7ad6\u5885\u5eb6\u6570\u6f31\u6055\u500f\u587e\u83fd\u5fc4\u6cad\u6d91\u6f8d\u59dd\u7ebe\u6bf9\u8167\u6bb3\u956f\u79eb\u9e6c","shua":"\u5237\u800d\u5530\u6dae","shuai":"\u6454\u8870\u7529\u5e05\u87c0","shuan":"\u6813\u62f4\u95e9","shuang":"\u971c\u53cc\u723d\u5b40","shui":"\u8c01\u6c34\u7761\u7a0e","shun":"\u542e\u77ac\u987a\u821c\u6042","shuo":"\u8bf4\u7855\u6714\u70c1\u84b4\u6420\u55cd\u6fef\u5981\u69ca\u94c4","si":"\u65af\u6495\u5636\u601d\u79c1\u53f8\u4e1d\u6b7b\u8086\u5bfa\u55e3\u56db\u4f3a\u4f3c\u9972\u5df3\u53ae\u4fdf\u5155\u83e5\u549d\u6c5c\u6cd7\u6f8c\u59d2\u9a77\u7f0c\u7940\u7960\u9536\u9e36\u801c\u86f3\u7b25","song":"\u677e\u8038\u6002\u9882\u9001\u5b8b\u8bbc\u8bf5\u51c7\u83d8\u5d27\u5d69\u5fea\u609a\u6dde\u7ae6","sou":"\u641c\u8258\u64de\u55fd\u53df\u55d6\u55fe\u998a\u6eb2\u98d5\u778d\u953c\u878b","su":"\u82cf\u9165\u4fd7\u7d20\u901f\u7c9f\u50f3\u5851\u6eaf\u5bbf\u8bc9\u8083\u5919\u8c21\u850c\u55c9\u612b\u7c0c\u89eb\u7a23","suan":"\u9178\u849c\u7b97","sui":"\u867d\u968b\u968f\u7ee5\u9ad3\u788e\u5c81\u7a57\u9042\u96a7\u795f\u84d1\u51ab\u8c07\u6fc9\u9083\u71e7\u772d\u7762","sun":"\u5b59\u635f\u7b0b\u836a\u72f2\u98e7\u69ab\u8de3\u96bc","suo":"\u68ad\u5506\u7f29\u7410\u7d22\u9501\u6240\u5522\u55e6\u5a11\u686b\u7743\u7fa7","ta":"\u584c\u4ed6\u5b83\u5979\u5854\u736d\u631e\u8e4b\u8e0f\u95fc\u6ebb\u9062\u69bb\u6c93","tai":"\u80ce\u82d4\u62ac\u53f0\u6cf0\u915e\u592a\u6001\u6c70\u90b0\u85b9\u80bd\u70b1\u949b\u8dc6\u9c90","tan":"\u574d\u644a\u8d2a\u762b\u6ee9\u575b\u6a80\u75f0\u6f6d\u8c2d\u8c08\u5766\u6bef\u8892\u78b3\u63a2\u53f9\u70ad\u90ef\u8548\u6619\u94bd\u952c\u8983","tang":"\u6c64\u5858\u642a\u5802\u68e0\u819b\u5510\u7cd6\u50a5\u9967\u6e8f\u746d\u94f4\u9557\u8025\u8797\u87b3\u7fb0\u91a3","thang":"\u5018\u8eba\u6dcc","theng":"\u8d9f\u70eb","tao":"\u638f\u6d9b\u6ed4\u7ee6\u8404\u6843\u9003\u6dd8\u9676\u8ba8\u5957\u6311\u9f17\u5555\u97ec\u9955","te":"\u7279","teng":"\u85e4\u817e\u75bc\u8a8a\u6ed5","ti":"\u68af\u5254\u8e22\u9511\u63d0\u9898\u8e44\u557c\u4f53\u66ff\u568f\u60d5\u6d95\u5243\u5c49\u8351\u608c\u9016\u7ee8\u7f07\u9e48\u88fc\u918d","tian":"\u5929\u6dfb\u586b\u7530\u751c\u606c\u8214\u8146\u63ad\u5fdd\u9617\u6b84\u754b\u94bf\u86ba","tiao":"\u6761\u8fe2\u773a\u8df3\u4f7b\u7967\u94eb\u7a95\u9f86\u9ca6","tie":"\u8d34\u94c1\u5e16\u841c\u992e","ting":"\u5385\u542c\u70c3\u6c40\u5ef7\u505c\u4ead\u5ead\u633a\u8247\u839b\u8476\u5a77\u6883\u8713\u9706","tong":"\u901a\u6850\u916e\u77b3\u540c\u94dc\u5f64\u7ae5\u6876\u6345\u7b52\u7edf\u75db\u4f5f\u50ee\u4edd\u833c\u55f5\u6078\u6f7c\u783c","tou":"\u5077\u6295\u5934\u900f\u4ea0","tu":"\u51f8\u79c3\u7a81\u56fe\u5f92\u9014\u6d82\u5c60\u571f\u5410\u5154\u580d\u837c\u83df\u948d\u9174","tuan":"\u6e4d\u56e2\u7583","tui":"\u63a8\u9893\u817f\u8715\u892a\u9000\u5fd2\u717a","tun":"\u541e\u5c6f\u81c0\u9968\u66be\u8c5a\u7a80","tuo":"\u62d6\u6258\u8131\u9e35\u9640\u9a6e\u9a7c\u692d\u59a5\u62d3\u553e\u4e47\u4f57\u5768\u5eb9\u6cb1\u67dd\u7823\u7ba8\u8204\u8dce\u9f0d","wa":"\u6316\u54c7\u86d9\u6d3c\u5a03\u74e6\u889c\u4f64\u5a32\u817d","wai":"\u6b6a\u5916","wan":"\u8c4c\u5f2f\u6e7e\u73a9\u987d\u4e38\u70f7\u5b8c\u7897\u633d\u665a\u7696\u60cb\u5b9b\u5a49\u4e07\u8155\u525c\u8284\u82cb\u83c0\u7ea8\u7efe\u742c\u8118\u7579\u873f\u7ba2","wang":"\u6c6a\u738b\u4ea1\u6789\u7f51\u5f80\u65fa\u671b\u5fd8\u5984\u7f54\u5c22\u60d8\u8f8b\u9b4d","wei":"\u5a01\u5dcd\u5fae\u5371\u97e6\u8fdd\u6845\u56f4\u552f\u60df\u4e3a\u6f4d\u7ef4\u82c7\u840e\u59d4\u4f1f\u4f2a\u5c3e\u7eac\u672a\u851a\u5473\u754f\u80c3\u5582\u9b4f\u4f4d\u6e2d\u8c13\u5c09\u6170\u536b\u502d\u504e\u8bff\u9688\u8473\u8587\u5e0f\u5e37\u5d34\u5d6c\u7325\u732c\u95f1\u6ca9\u6d27\u6da0\u9036\u5a13\u73ae\u97ea\u8ece\u709c\u7168\u71a8\u75ff\u8249\u9c94","wen":"\u761f\u6e29\u868a\u6587\u95fb\u7eb9\u543b\u7a33\u7d0a\u95ee\u520e\u6120\u960c\u6c76\u74ba\u97eb\u6b81\u96ef","weng":"\u55e1\u7fc1\u74ee\u84ca\u8579","wo":"\u631d\u8717\u6da1\u7a9d\u6211\u65a1\u5367\u63e1\u6c83\u83b4\u5e44\u6e25\u674c\u809f\u9f8c","wu":"\u5deb\u545c\u94a8\u4e4c\u6c61\u8bec\u5c4b\u65e0\u829c\u68a7\u543e\u5434\u6bcb\u6b66\u4e94\u6342\u5348\u821e\u4f0d\u4fae\u575e\u620a\u96fe\u6664\u7269\u52ff\u52a1\u609f\u8bef\u5140\u4ef5\u9622\u90ac\u572c\u82b4\u5e91\u6003\u5fe4\u6d6f\u5be4\u8fd5\u59a9\u9a9b\u727e\u7110\u9e49\u9e5c\u8708\u92c8\u9f2f","xi":"\u6614\u7199\u6790\u897f\u7852\u77fd\u6670\u563b\u5438\u9521\u727a\u7a00\u606f\u5e0c\u6089\u819d\u5915\u60dc\u7184\u70ef\u6eaa\u6c50\u7280\u6a84\u88ad\u5e2d\u4e60\u5ab3\u559c\u94e3\u6d17\u7cfb\u9699\u620f\u7ec6\u50d6\u516e\u96b0\u90d7\u831c\u8478\u84f0\u595a\u550f\u5f99\u9969\u960b\u6d60\u6dc5\u5c63\u5b09\u73ba\u6a28\u66e6\u89cb\u6b37\u71b9\u798a\u79a7\u94b8\u7699\u7a78\u8725\u87cb\u823e\u7fb2\u7c9e\u7fd5\u91af\u9f37","xia":"\u778e\u867e\u5323\u971e\u8f96\u6687\u5ce1\u4fa0\u72ed\u4e0b\u53a6\u590f\u5413\u6380\u846d\u55c4\u72ce\u9050\u7455\u7856\u7615\u7f45\u9ee0","xian":"\u9528\u5148\u4ed9\u9c9c\u7ea4\u54b8\u8d24\u8854\u8237\u95f2\u6d8e\u5f26\u5acc\u663e\u9669\u73b0\u732e\u53bf\u817a\u9985\u7fa1\u5baa\u9677\u9650\u7ebf\u51bc\u85d3\u5c98\u7303\u66b9\u5a34\u6c19\u7946\u9e47\u75eb\u86ac\u7b45\u7c7c\u9170\u8df9","xiang":"\u76f8\u53a2\u9576\u9999\u7bb1\u8944\u6e58\u4e61\u7fd4\u7965\u8be6\u60f3\u54cd\u4eab\u9879\u5df7\u6a61\u50cf\u5411\u8c61\u8297\u8459\u9977\u5ea0\u9aa7\u7f03\u87d3\u9c9e\u98e8","xiao":"\u8427\u785d\u9704\u524a\u54ee\u56a3\u9500\u6d88\u5bb5\u6dc6\u6653\u5c0f\u5b5d\u6821\u8096\u5578\u7b11\u6548\u54d3\u54bb\u5d24\u6f47\u900d\u9a81\u7ee1\u67ad\u67b5\u7b71\u7bab\u9b48","xie":"\u6954\u4e9b\u6b47\u874e\u978b\u534f\u631f\u643a\u90aa\u659c\u80c1\u8c10\u5199\u68b0\u5378\u87f9\u61c8\u6cc4\u6cfb\u8c22\u5c51\u5055\u4eb5\u52f0\u71ee\u85a4\u64b7\u5ee8\u7023\u9082\u7ec1\u7f2c\u69ad\u698d\u6b59\u8e9e","xin":"\u85aa\u82af\u950c\u6b23\u8f9b\u65b0\u5ffb\u5fc3\u4fe1\u8845\u56df\u99a8\u8398\u6b46\u94fd\u946b","xing":"\u661f\u8165\u7329\u60fa\u5174\u5211\u578b\u5f62\u90a2\u884c\u9192\u5e78\u674f\u6027\u59d3\u9649\u8347\u8365\u64e4\u60bb\u784e","xiong":"\u5144\u51f6\u80f8\u5308\u6c79\u96c4\u718a\u828e","xiu":"\u4f11\u4fee\u7f9e\u673d\u55c5\u9508\u79c0\u8896\u7ee3\u83a0\u5cab\u9990\u5ea5\u9e3a\u8c85\u9af9","xu":"\u589f\u620c\u9700\u865a\u5618\u987b\u5f90\u8bb8\u84c4\u9157\u53d9\u65ed\u5e8f\u755c\u6064\u7d6e\u5a7f\u7eea\u7eed\u8bb4\u8be9\u5729\u84ff\u6035\u6d2b\u6e86\u987c\u6829\u7166\u7809\u76f1\u80e5\u7cc8\u9191","xuan":"\u8f69\u55a7\u5ba3\u60ac\u65cb\u7384\u9009\u7663\u7729\u7eda\u5107\u8c16\u8431\u63ce\u9994\u6ceb\u6d35\u6e32\u6f29\u7487\u6966\u6684\u70ab\u714a\u78b9\u94c9\u955f\u75c3","xue":"\u9774\u859b\u5b66\u7a74\u96ea\u8840\u5671\u6cf6\u9cd5","xun":"\u52cb\u718f\u5faa\u65ec\u8be2\u5bfb\u9a6f\u5de1\u6b89\u6c5b\u8bad\u8baf\u900a\u8fc5\u5dfd\u57d9\u8340\u85b0\u5ccb\u5f87\u6d54\u66db\u7aa8\u91ba\u9c9f","ya":"\u538b\u62bc\u9e26\u9e2d\u5440\u4e2b\u82bd\u7259\u869c\u5d16\u8859\u6daf\u96c5\u54d1\u4e9a\u8bb6\u4f22\u63e0\u5416\u5c88\u8fd3\u5a05\u740a\u6860\u6c29\u7811\u775a\u75d6","yan":"\u7109\u54bd\u9609\u70df\u6df9\u76d0\u4e25\u7814\u8712\u5ca9\u5ef6\u8a00\u989c\u960e\u708e\u6cbf\u5944\u63a9\u773c\u884d\u6f14\u8273\u5830\u71d5\u538c\u781a\u96c1\u5501\u5f66\u7130\u5bb4\u8c1a\u9a8c\u53a3\u9765\u8d5d\u4fe8\u5043\u5156\u8ba0\u8c33\u90fe\u9122\u82ab\u83f8\u5d26\u6079\u95eb\u960f\u6d07\u6e6e\u6edf\u598d\u5ae3\u7430\u664f\u80ed\u814c\u7131\u7f68\u7b75\u917d\u9b47\u990d\u9f39","yang":"\u6b83\u592e\u9e2f\u79e7\u6768\u626c\u4f6f\u75a1\u7f8a\u6d0b\u9633\u6c27\u4ef0\u75d2\u517b\u6837\u6f3e\u5f89\u600f\u6cf1\u7080\u70ca\u6059\u86d8\u9785","yao":"\u9080\u8170\u5996\u7476\u6447\u5c27\u9065\u7a91\u8c23\u59da\u54ac\u8200\u836f\u8981\u8000\u592d\u723b\u5406\u5d3e\u5fad\u7039\u5e7a\u73e7\u6773\u66dc\u80b4\u9e5e\u7a88\u7e47\u9cd0","ye":"\u6930\u564e\u8036\u7237\u91ce\u51b6\u4e5f\u9875\u6396\u4e1a\u53f6\u66f3\u814b\u591c\u6db2\u8c12\u90ba\u63f6\u9980\u6654\u70e8\u94d8","yi":"\u4e00\u58f9\u533b\u63d6\u94f1\u4f9d\u4f0a\u8863\u9890\u5937\u9057\u79fb\u4eea\u80f0\u7591\u6c82\u5b9c\u59e8\u5f5d\u6905\u8681\u501a\u5df2\u4e59\u77e3\u4ee5\u827a\u6291\u6613\u9091\u5c79\u4ebf\u5f79\u81c6\u9038\u8084\u75ab\u4ea6\u88d4\u610f\u6bc5\u5fc6\u4e49\u76ca\u6ea2\u8be3\u8bae\u8c0a\u8bd1\u5f02\u7ffc\u7fcc\u7ece\u5208\u5293\u4f7e\u8bd2\u572a\u572f\u57f8\u61ff\u82e1\u858f\u5f08\u5955\u6339\u5f0b\u5453\u54a6\u54bf\u566b\u5cc4\u5db7\u7317\u9974\u603f\u6021\u6092\u6f2a\u8fe4\u9a7f\u7f22\u6baa\u8d3b\u65d6\u71a0\u9487\u9552\u9571\u75cd\u7617\u7654\u7fca\u8864\u8734\u8223\u7fbf\u7ff3\u914f\u9edf","yin":"\u8335\u836b\u56e0\u6bb7\u97f3\u9634\u59fb\u541f\u94f6\u6deb\u5bc5\u996e\u5c39\u5f15\u9690\u5370\u80e4\u911e\u5819\u831a\u5591\u72fa\u5924\u6c24\u94df\u763e\u8693\u972a\u9f88","ying":"\u82f1\u6a31\u5a74\u9e70\u5e94\u7f28\u83b9\u8424\u8425\u8367\u8747\u8fce\u8d62\u76c8\u5f71\u9896\u786c\u6620\u5b34\u90e2\u8314\u83ba\u8426\u6484\u5624\u81ba\u6ee2\u6f46\u701b\u745b\u748e\u6979\u9e66\u763f\u988d\u7f42","yo":"\u54df\u5537","yong":"\u62e5\u4f63\u81c3\u75c8\u5eb8\u96cd\u8e0a\u86f9\u548f\u6cf3\u6d8c\u6c38\u607f\u52c7\u7528\u4fd1\u58c5\u5889\u6175\u9095\u955b\u752c\u9cd9\u9954","you":"\u5e7d\u4f18\u60a0\u5fe7\u5c24\u7531\u90ae\u94c0\u72b9\u6cb9\u6e38\u9149\u6709\u53cb\u53f3\u4f51\u91c9\u8bf1\u53c8\u5e7c\u5363\u6538\u4f91\u83b8\u5466\u56ff\u5ba5\u67da\u7337\u7256\u94d5\u75a3\u8763\u9c7f\u9edd\u9f2c","yu":"\u8fc2\u6de4\u4e8e\u76c2\u6986\u865e\u611a\u8206\u4f59\u4fde\u903e\u9c7c\u6109\u6e1d\u6e14\u9685\u4e88\u5a31\u96e8\u4e0e\u5c7f\u79b9\u5b87\u8bed\u7fbd\u7389\u57df\u828b\u90c1\u5401\u9047\u55bb\u5cea\u5fa1\u6108\u6b32\u72f1\u80b2\u8a89\u6d74\u5bd3\u88d5\u9884\u8c6b\u9a6d\u79ba\u6bd3\u4f1b\u4fe3\u8c00\u8c15\u8438\u84e3\u63c4\u5581\u5704\u5709\u5d5b\u72f3\u996b\u5ebe\u9608\u59aa\u59a4\u7ea1\u745c\u6631\u89ce\u8174\u6b24\u65bc\u715c\u71e0\u807f\u94b0\u9e46\u7610\u7600\u7ab3\u8753\u7afd\u8201\u96e9\u9f89","yuan":"\u9e33\u6e0a\u51a4\u5143\u57a3\u8881\u539f\u63f4\u8f95\u56ed\u5458\u5706\u733f\u6e90\u7f18\u8fdc\u82d1\u613f\u6028\u9662\u586c\u6c85\u5a9b\u7457\u6a7c\u7230\u7722\u9e22\u8788\u9f0b","yue":"\u66f0\u7ea6\u8d8a\u8dc3\u94a5\u5cb3\u7ca4\u6708\u60a6\u9605\u9fa0\u6a3e\u5216\u94ba","yun":"\u8018\u4e91\u90e7\u5300\u9668\u5141\u8fd0\u8574\u915d\u6655\u97f5\u5b55\u90d3\u82b8\u72c1\u607d\u7ead\u6b92\u6600\u6c32","za":"\u531d\u7838\u6742\u62f6\u5482","zai":"\u683d\u54c9\u707e\u5bb0\u8f7d\u518d\u5728\u54b1\u5d3d\u753e","zan":"\u6512\u6682\u8d5e\u74d2\u661d\u7c2a\u7ccc\u8db1\u933e","zang":"\u8d43\u810f\u846c\u5958\u6215\u81e7","zao":"\u906d\u7cdf\u51ff\u85fb\u67a3\u65e9\u6fa1\u86a4\u8e81\u566a\u9020\u7682\u7076\u71e5\u5523\u7f2b","ze":"\u8d23\u62e9\u5219\u6cfd\u4ec4\u8d5c\u5567\u8fee\u6603\u7b2e\u7ba6\u8234","zei":"\u8d3c","zen":"\u600e\u8c2e","zeng":"\u589e\u618e\u66fe\u8d60\u7f2f\u7511\u7f7e\u9503","zha":"\u624e\u55b3\u6e23\u672d\u8f67\u94e1\u95f8\u7728\u6805\u69a8\u548b\u4e4d\u70b8\u8bc8\u63f8\u5412\u54a4\u54f3\u600d\u781f\u75c4\u86b1\u9f44","zhai":"\u6458\u658b\u5b85\u7a84\u503a\u5be8\u7826","zhan":"\u77bb\u6be1\u8a79\u7c98\u6cbe\u76cf\u65a9\u8f97\u5d2d\u5c55\u8638\u6808\u5360\u6218\u7ad9\u6e5b\u7efd\u8c35\u640c\u65c3","zhang":"\u6a1f\u7ae0\u5f70\u6f33\u5f20\u638c\u6da8\u6756\u4e08\u5e10\u8d26\u4ed7\u80c0\u7634\u969c\u4ec9\u9123\u5e5b\u5d82\u7350\u5adc\u748b\u87d1","zhao":"\u62db\u662d\u627e\u6cbc\u8d75\u7167\u7f69\u5146\u8087\u53ec\u722a\u8bcf\u68f9\u948a\u7b0a","zhe":"\u906e\u6298\u54f2\u86f0\u8f99\u8005\u9517\u8517\u8fd9\u6d59\u8c2a\u966c\u67d8\u8f84\u78d4\u9e67\u891a\u8707\u8d6d","zhen":"\u73cd\u659f\u771f\u7504\u7827\u81fb\u8d1e\u9488\u4fa6\u6795\u75b9\u8bca\u9707\u632f\u9547\u9635\u7f1c\u6862\u699b\u8f78\u8d48\u80d7\u6715\u796f\u755b\u9e29","zheng":"\u84b8\u6323\u7741\u5f81\u72f0\u4e89\u6014\u6574\u62ef\u6b63\u653f\u5e27\u75c7\u90d1\u8bc1\u8be4\u5ce5\u94b2\u94ee\u7b5d","zhi":"\u829d\u679d\u652f\u5431\u8718\u77e5\u80a2\u8102\u6c41\u4e4b\u7ec7\u804c\u76f4\u690d\u6b96\u6267\u503c\u4f84\u5740\u6307\u6b62\u8dbe\u53ea\u65e8\u7eb8\u5fd7\u631a\u63b7\u81f3\u81f4\u7f6e\u5e1c\u5cd9\u5236\u667a\u79e9\u7a1a\u8d28\u7099\u75d4\u6ede\u6cbb\u7a92\u536e\u965f\u90c5\u57f4\u82b7\u646d\u5e19\u5fee\u5f58\u54ab\u9a98\u6809\u67b3\u6800\u684e\u8f75\u8f7e\u6534\u8d3d\u81a3\u7949\u7957\u9ef9\u96c9\u9e37\u75e3\u86ed\u7d77\u916f\u8dd6\u8e2c\u8e2f\u8c78\u89ef","zhong":"\u4e2d\u76c5\u5fe0\u949f\u8877\u7ec8\u79cd\u80bf\u91cd\u4ef2\u4f17\u51a2\u953a\u87bd\u8202\u822f\u8e35","zhou":"\u821f\u5468\u5dde\u6d32\u8bcc\u7ca5\u8f74\u8098\u5e1a\u5492\u76b1\u5b99\u663c\u9aa4\u5544\u7740\u501c\u8bf9\u836e\u9b3b\u7ea3\u80c4\u78a1\u7c40\u8233\u914e\u9cb7","zhu":"\u73e0\u682a\u86db\u6731\u732a\u8bf8\u8bdb\u9010\u7af9\u70db\u716e\u62c4\u77a9\u5631\u4e3b\u8457\u67f1\u52a9\u86c0\u8d2e\u94f8\u7b51\u4f4f\u6ce8\u795d\u9a7b\u4f2b\u4f8f\u90be\u82ce\u8331\u6d19\u6e1a\u6f74\u9a7a\u677c\u69e0\u6a65\u70b7\u94e2\u75b0\u7603\u86b0\u7afa\u7bb8\u7fe5\u8e85\u9e88","zhua":"\u6293","zhuai":"\u62fd","zhuan":"\u4e13\u7816\u8f6c\u64b0\u8d5a\u7bc6\u629f\u556d\u989b","zhuang":"\u6869\u5e84\u88c5\u5986\u649e\u58ee\u72b6\u4e2c","zhui":"\u690e\u9525\u8ffd\u8d58\u5760\u7f00\u8411\u9a93\u7f12","zhun":"\u8c06\u51c6","zhuo":"\u6349\u62d9\u5353\u684c\u7422\u8301\u914c\u707c\u6d4a\u502c\u8bfc\u5ef4\u855e\u64e2\u555c\u6d5e\u6dbf\u6753\u712f\u799a\u65ab","zi":"\u5179\u54a8\u8d44\u59ff\u6ecb\u6dc4\u5b5c\u7d2b\u4ed4\u7c7d\u6ed3\u5b50\u81ea\u6e0d\u5b57\u8c18\u5d6b\u59ca\u5b73\u7f01\u6893\u8f8e\u8d40\u6063\u7726\u9531\u79ed\u8014\u7b2b\u7ca2\u89dc\u8a3e\u9cbb\u9aed","zong":"\u9b03\u68d5\u8e2a\u5b97\u7efc\u603b\u7eb5\u8159\u7cbd","zou":"\u90b9\u8d70\u594f\u63cd\u9139\u9cb0","zu":"\u79df\u8db3\u5352\u65cf\u7956\u8bc5\u963b\u7ec4\u4fce\u83f9\u5550\u5f82\u9a75\u8e74","zuan":"\u94bb\u7e82\u6525\u7f35","zui":"\u5634\u9189\u6700\u7f6a","zun":"\u5c0a\u9075\u6499\u6a3d\u9cdf","zuo":"\u6628\u5de6\u4f50\u67de\u505a\u4f5c\u5750\u5ea7\u961d\u963c\u80d9\u795a\u9162","cou":"\u85ae\u6971\u8f8f\u8160","nang":"\u652e\u54dd\u56d4\u9995\u66e9","o":"\u5594","dia":"\u55f2","chuai":"\u562c\u81aa\u8e39","cen":"\u5c91\u6d94","diu":"\u94e5","nou":"\u8028","fou":"\u7f36","bia":"\u9adf"};
	/**
	 * 单个汉字拼音转换
	 * @param ch{String}拼音字符串
	 * @return {String}转换后的串
	 */
	function pinyinSearch(ch,convert){
		for (var name in PinYin){
			if (PinYin[name].indexOf(ch) < 0) {
				continue;
			}
			if(convert)
				return convert(name);
			return name;
		}
		return false;
	}
	
	/**
	 * 获取拼音首字母
	 * @param ch{String}拼音字符串
	 * @return {String}拼音首字母
	 */
	function getCapitalized(ch){
		var first = ch.substr(0,1).toUpperCase();
		var spare = ch.substr(1,ch.length);
		return first + spare;
	}
	
	/**
	 * 获取拼音首字母
	 * @param ch{String}拼音字符串
	 * @return {String}拼音首字母
	 */
	function getInitials(ch){
		return ch.substr(0,1).toUpperCase();
	}
	
	/**
	 * 获取拼音首字母
	 * @param ch{String}拼音字符串
	 * @return {String}拼音首字母
	 */
	function getUapperInitials(ch){
		return ch.substr(0,1).toUpperCase();
	}
	/**
	 * 将汉字转换为拼音
	 * @param chStr{String}汉字串
	 * @param convert{function} 转换策略
	 * @return {String}拼音首字母
	 */
	function chinese2Pinyin(chStr,convert){
		var len = chStr.length;
		var rs = "";
		var reg = new RegExp('[a-zA-Z0-9\- ]');
		for (var i=0;i<len;i++) {
			var val = chStr.charAt(i);
			var name = pinyinSearch(val,convert);
			if(reg.test(val)) {
				rs += val;
			} else if (name!==false) {
				rs += name;
			}
			
		}
		rs = rs.replace(/ /g,'-');
		while (rs.indexOf('--')>0) {
			rs = rs.replace('--','-');
		}
		return rs;
	}
	return {
		/**
		 * 获取汉字拼音首字母串
		 * @param ch{String}拼音字符串
		 * @return {String}拼音首字母串
		 */
		toInitials:function(chStr) {
			return chinese2Pinyin(chStr,getInitials);
		},
		/**
		 * 获取汉字拼音大写首字母串
		 * @param ch{String}拼音字符串
		 * @return {String}大写的拼音首字母串
		 */
		toUpperInitials:function(chStr) {
			return chinese2Pinyin(chStr,getUapperInitials);
		},
		
		/**
		 * 获取汉字拼音串
		 * @param ch{String}拼音字符串
		 * @return {String}汉字拼音串
		 */
		toPinyin:function(chStr) {
			return chinese2Pinyin(chStr);
		},
		/**
		 * 获取汉字首字母大写的拼音串
		 * @param ch{String}拼音字符串
		 * @return {String}首字母大写的拼音串
		 */
		toCapPinyin:function(chStr) {
			return chinese2Pinyin(chStr);
		}
	}
});
	

	


define('app/core/app-base',["app/core/app-class","app/core/app-attribute","app/core/app-events"],function(Class,Attribute,Events) {

    // Base Events、Aspect
    /**
     *
     * @class
     * @name Base
     * @extends Class
     * @classdesc  Base 是一个基础类，提供 Class、Attrs 和  支持。
     */
    var Base = Class.create({
        Implements: [Attribute,Events],
        initialize: function(config) {
               this.initAttrs(config);
            // 对于 Base 来说，`change:attr` 事件的含义应该是在实例化后，当属性有变化
            // 时触发，初始化过程中不应该触发。
     
            // 标识实例已准备好
        	parseEventsFromInstance(this, this.attrs);
        },
        /**
         * 注销方法
         * @abstract
         * @memberof Base
         */
        destroy: function() {
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
        },
        bind:function(target,eventObj){
        	var evts=eventObj;
        	if (arguments.length==1){
        		evts=target;
        	}
          	for(var eventName in evts){
          		this.on(eventName,evts[eventName]);
          	}
        },
        unbind:function(trage,events){
          if (typeof events=="string"){
          		this.off(events);
          }
          if (typeof events=="array"){
          	for(var i=0,len=events.length;i<len;i++){
          		this.off(events[i]);
          	}
          }
        }
    });
   return Base;
function parseEventsFromInstance(host, attrs) {
  for (var attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      var m = '_onChange' + ucfirst(attr);
      if (host[m]) {
        host.on('change:' + attr, host[m]);
      }
    }
  }
}
function ucfirst(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}
});

define('app/core/app-options-helper',["app/core/app-base"],function(Base){

	ConfigHelper = Base.extend({
				propsInAttrs : ["configData", "columns","buttons","editors"],
				attrs : {
					configData : {},
					columns : {},
					buttons : {},
					editors:{}
				},
				initialize : function(opt) {
					opt=opt||{};
					if (!opt.configData){
						opt={configData:opt}
					}
					this.sourceData=opt.configData||opt;
					ConfigHelper.superclass.initialize.call(this,opt);
					
					if (this.configData) {
						if (this.configData.columns) {
							this.addColumns(this.configData.columns);
						}
						if (this.configData.frozenColumns) {
							this.addColumns(this.configData.frozenColumns);
						}
						if (this.configData.frozenColumnsRight) {
							this.addColumns(this.configData.frozenColumnsRight);
						}
						if (this.configData.toolbar) {
							this.addButtons(this.configData.toolbar);
						}
					
					}
				},
				
				//添加列集合
				addColumns : function(columns) {
					if (columns) {
						for (var i = 0; i < columns.length; i++) {
							for (var j = 0; j < columns[i].length; j++) {
								this.columns[columns[i][j].id] = columns[i][j];
								if (columns[i][j]&&columns[i][j].buttons){
									this.addButtons(columns[i][j].buttons);
								}
							if (columns[i][j]&&columns[i][j].editor){
									this.addEditors(columns[i][j].id,columns[i][j].editor);
								}
						}
					}
				}
				},
				addEditors:function(id,editor){
					editor.options = editor.options||{};
				  	this.editors[id] = editor.options;
				},
				//添加按钮集合
				addButtons : function(buttons) {
					if (buttons) {
						var removeBtns=[];
						for (var i = 0; i < buttons.length; i++) {
							this.buttons[buttons[i].id]=buttons[i];
							if (!$A.cehckPageComponensById(buttons[i].id)){
								//buttons[i]=null;
								removeBtns.push(i);
							}
						}
						for(var i=0;i<removeBtns.length;i++){
							buttons.splice((removeBtns[i]-i),1);
						}
					}
					
					
				},
				getButton:function(id){
					var button=this.buttons[id],temp=new ConfigHelper(button);
					return temp;
				},
				getColumn:function(id){
					var column=this.columns[id],tem=new ConfigHelper(column);
					return tem;
					
				},
				getEditor:function(id){
					var editor=this.editors[id],temp=new ConfigHelper(editor);
					return temp;
				},
			    setAttr:function(attrName,value){
			    	this.sourceData[attrName]=value;
			    },
			    setAttrs:function(attrs){
			    	if (attrs){
				    	for(var key in attrs){
				    		this.sourceData[key]=attrs[key];
				    	}
			    	}
			    }
			});
			return ConfigHelper;
	
});
/**
 * 针对jquery增加核心的扩展
 */
define('app/core/app-jquery',["jquery","app/core/app-core","base/pinyin","app/core/app-options-helper"],function($,$A,$pinyin,ConfigHelper){
	
	
	/**
	 * 空方法
	 */
	$.emptyFunction = function(){};
	
	$.isEmpty = function(v, allowBlank){
            return v === null || v === undefined || (($.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    };
	$.extend($.fn,{

		escapeHtml : function(str) {
			if (str) {
				//str = str.replace(/&/g, '&amp;');
				str = str.replace(/</g, '&lt;');
				str = str.replace(/>/g, '&gt;');
				str = str.replace(/"/g, '&quot;');
				str = str.replace(/'/g, '&#039;');
			}
			return str;
		},
		unescapeHtml:function(str){
			if (str) {
				//str = str.replace(/&amp;/g, '&');
				str = str.replace(/&lt;/g, '<');
				str = str.replace(/&gt;/g, '>');
				str = str.replace(/&quot;/g, '"');
				str = str.replace(/&#039;/g, '\'');
			}
			return str;
		},
		/**
		 * 初始化方法
		 */
		initPageUI:function(){
			$A.init(this);
		},
		/**
		 * 清除js对象缓存
		 */
		clearAppJsObject:function(){
			$(this).removeAttr("__jsappobj");
			$(this)[0].__jsappobj=null;
		},
		/**
		 * 设置js对象缓存
		 */
		setAppJsObject:function(jsParam,jsobjs){
			$(this).attr("__jsappobj","true");
			$(this)[0].__jsappobj={
				param:jsParam,
				objs:jsobjs
			};
		},
		/**
		 * 取得js对象缓存
		 * @return {Object}带有param和objs属性,param为参数名,objs为js对象数组
		 */
		getAppJsObject:function(){
			var $this=$(this)
			,$parents = $this.parents("[__jsappobj]")
			,jsobj = $this[0].__jsappobj
			,params=null
			,jsobjs=null;
			if(jsobj != null && typeof jsobj=="object" && $.isArray(jsobj.param) && $.isArray(jsobj.objs)){
				params=jsobj.param;
				jsobjs = jsobj.objs;
			}else{
				params=[];
				jsobjs =[];
			}
			$parents.each(function(){
				var $p=$(this)
				,j = this.__jsappobj;
				if(j == null)
					return;
				if(!$.isArray(j.param) || !$.isArray(j.objs))
					return;
				var jp=j.param,jo=j.objs;
				for(var i = 0; i < jp.length; i++){
					if($.inArray(jp[i],params)<0){
						params.push(jp[i]);
						jsobjs.push(jo[i]);
					}
				}
			});
			if(params.length == 0)
				return null;
			return {param:params.join(","),objs:jsobjs};
		},
		/**
		 * 获取带有引入js对象的方法
		 */
		getJsFunction:function(funcstr,target){
			var o = $(this).getAppJsObject();
			if(o){
				var f = new Function(o.param,"return function(){"+funcstr+"};");
				return f.apply(o,o.objs);
			}
			return new Function(funcstr);
		},
		/**
		 * 获取一个元素上的json形式的属性值
		 * add by tw
		 * @param attrName
		 * @returns
		 */
		getJsonAttr:function(attrName){
			var o = $(this).getAppJsObject() || {
				"param":"",
				"objs":[]
			};
			var attrValue = $(this).attr(attrName);
			var id= $(this).attr("id");
			
			
		//	try{
				var f = new Function(o.param,"return ("+attrValue+")");
				//console.log(o.objs);
				var attrValue=f.apply(this,o.objs);
				if (o.objs&&o.objs.length>0&&id){
					var initJsObj=o.objs[0];
					if (initJsObj.uiExtConfig){
						var uiExtConfig=initJsObj.uiExtConfig;
						if (uiExtConfig[id]&&$.isFunction(uiExtConfig[id])){
							attrValue["beforeRender"]=function(config){
									//重置初始化对象
									var confighelper=new ConfigHelper(config);
									uiExtConfig[id].call(this,confighelper);
								
							};
						}
						
					}
					
				}
				//console.log(id);
				//console.log(attrValue)
				return attrValue;
			/*}catch(e){
				alert(attrValue);
					alert(o.param);
				window.alert(e);
				return {};
			}*/
		},
		// 2014-09-24 add function  by sjq
		/**
		 * 
		 * @example  
		 * var funobj=$A.getPageJsFunction("test.add");
		 * if ($.isFunction(funobj)){
		 *     //funobj() or funobj.call() or funobj.apply;
		 * }
		 * 
		 * 获取页面中的js方法
		 * @param funcstr
		 * @param target
		 * @returns
		 *
		 */
		getPageJsProperty:function(funcstr,target){
			var o = $(this).getAppJsObject();
			if(o){
				var f = new Function(o.param,"if (typeof "+funcstr+" !== 'undefined') return "+funcstr+";");
				return f.apply(o,o.objs);
			}
			return null;
		},
		/**
		 * 获取带有引入js对象的方法
		 */
		getJsCacheFunc:function(funcstr,target){
			var $this = $(this)
			,func = $this.data("jsfunction");
			if(func){
				return func;
			}
			func = $this.getJsFunction(funcstr,target);
			$this.data("jsfunction",func);
			return func;
		},
		/**
		 * 获取带有引入js对象的方法
		 */
		getJsEvent:function(events){
			var o = $(this).getAppJsObject();
			if(o){
				var f = new Function(o.param,'var e = '+events+';return e;');
				return f.apply(o,o.objs);
			}
			return $A.jsonEval(events);
		},
		/**
		 * 判断当前元素的是否为指定的标签
		 * @param tn 指定的标签
		 */
		isTag:function(tn) {
			if(!tn) return false;
			return $(this)[0].tagName.toLowerCase() == tn?true:false;
		},
		/**
		 * 鼠标悬浮样式处理
		 * @param className{String}样式名
		 * @param speed 加载速度
		 */
		hoverClass: function(className, speed){
			var _className = className || "hover";
			return this.each(function(){
				var $this = $(this), mouseOutTimer;
				$this.hover(function(){
					if (mouseOutTimer) clearTimeout(mouseOutTimer);
					$this.addClass(_className);
				},function(){
					mouseOutTimer = setTimeout(function(){$this.removeClass(_className);}, speed||10);
				});
			});
		},
		/**
		 * 聚焦样式处理
		 * @param className{String}样式名
		 */
		focusClass: function(className){
			var _className = className || "textInputFocus";
			return this.each(function(){
				$(this).focus(function(){
					$(this).addClass(_className);
				}).blur(function(){
					$(this).removeClass(_className);
				});
			});
		},
		/**
		 * 判断当前元素是否已经绑定某个事件
		 * @param {Object} type
		 */
		isBind:function(type) {
			var _events = $(this).data("events");
			return _events && type && _events[type];
		},
		/**
		 * 取得dom元素的指定数值属性值
		 * @param pre{string} 数值属性一般为left,width等
		 * @param {number} 属性值
		 */
		cssNum:function(pre){
			var cssPre = $(this).css(pre);
			return cssPre.substring(0, cssPre.indexOf("px")) * 1;
		},
		
		/**
		 * 判断两个jquery对象是否相等
		 * @param obj2{jqueryObject} jquery对象
		 */
		equalObject:function(obj){
			var $this = (this);
			if($this.length == 0 && (obj == null||obj.length==0))
				return true;
			if(obj == null)
				return false;
			if($this.length != obj.length)
				return false;
			for(var i = 0; i < obj.length; i++){
				if($this[i] != obj[i])
					return false;
			}
			return true;
		},
		/**
		 * parse options, including standard 'data-options' attribute.
		 * 
		 * calling examples:
		 * parseOptions(target);
		 * parseOptions(target, ['id','title','width',{fit:'boolean',border:'boolean'},{min:'number'}]);
		 */
		parseOptions: function(target, properties){
			var t = $(target);
			var options = {};
			var o = $(target).getAppJsObject() || {
				"param":"",
				"objs":[]
			};
			var s = $.trim(t.attr('data-options'));
			if (s){
				if (s.substring(0, 1) != '{'){
					s = '{' + s + '}';
				}
				//options = (new Function(o.param'return ' + s))();
				
				
				var f = new Function(o.param,"return ("+s+")");
				//console.log(o.objs);
				var options=f.apply(this,o.objs);
			}
			for( key in options){
				if ($.isEmpty(options[key])){
					delete options[key];
				}
			}
			$.map(['width','height','left','top','minWidth','maxWidth','minHeight','maxHeight'], function(p){
				if (!target.style){
					console.log(target);
				}
			
				var pv = $.trim(target.style[p] || '');
				if (pv){
					if (pv.indexOf('%') == -1){
						pv = parseInt(pv) || undefined;
					}
					options[p] = pv;
				}
			});
				
			if (properties){
				var opts = {};
				for(var i=0; i<properties.length; i++){
					var pp = properties[i];
					if (typeof pp == 'string'){
						opts[pp] = t.attr(pp);
					} else {
						for(var name in pp){
							var type = pp[name];
							if (type == 'boolean'){
								opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
							} else if (type == 'number'){
								opts[name] = t.attr(name)=='0' ? 0 : parseFloat(t.attr(name)) || undefined;
								if(!opts[name]&&options[name]){
									options[name]=parseFloat(options[name]);
								}
							}
						}
					}
				}
				$.extend(options, opts);
			}
			return options;
		},
		
		/**
	 * extend plugin to set box model width
	 */
	_outerWidth : function(width){
		if (width == undefined){
			if (this[0] == window){
				return this.width() || document.body.clientWidth;
			}
			return this.outerWidth()||0;
		}
		return this._size('width', width);
	},
	
	/**
	 * extend plugin to set box model height
	 */
	_outerHeight : function(height){
		if (height == undefined){
			if (this[0] == window){
				return this.height() || document.body.clientHeight;
			}
			return this.outerHeight()||0;
		}
		return this._size('height', height);
	},
	
	_scrollLeft : function(left){
		if (left == undefined){
			return this.scrollLeft();
		} else {
			return this.each(function(){$(this).scrollLeft(left)});
		}
	},
	parseValue:function (property, value, parent, delta){
		delta = delta || 0;
		var v = $.trim(String(value||''));
		var endchar = v.substr(v.length-1, 1);
		if (endchar == '%'){
			v = parseInt(v.substr(0, v.length-1));
			if (property.toLowerCase().indexOf('width') >= 0){
				v = Math.floor((parent.width()-delta) * v / 100.0);
			} else {
				v = Math.floor((parent.height()-delta) * v / 100.0);
			}
		} else {
			v = parseInt(v) || undefined;
		}
		return v;
	},
	_size : function(options, parent){
		var _slef=this;
		if (typeof options == 'string'){
			if (options == 'clear'){
				return this.each(function(){
					$(this).css({width:'',minWidth:'',maxWidth:'',height:'',minHeight:'',maxHeight:''});
				});
			} else if (options == 'unfit'){
				return this.each(function(){
					_fit(this, $(this).parent(), false);
				});
			} else {
				if (parent == undefined){
					return _css(this[0], options);
				} else {
					return this.each(function(){
						_css(this, options, parent);
					});
				}
			}
		} else {
			return this.each(function(){
				parent = parent || $(this).parent();
				$.extend(options, _fit(this, parent, options.fit)||{});
				var r1 = _setSize(this, 'width', parent, options);
				var r2 = _setSize(this, 'height', parent, options);
				if (r1 || r2){
					$(this).addClass('app-fluid');
				} else {
					$(this).removeClass('app-fluid');
				}
			});
		}
		
		function _fit(target, parent, fit){
			var t = $(target)[0];
			var p = parent[0];
			var fcount = p.fcount || 0;
			if (fit){
				if (!t.fitted){
					t.fitted = true;
					p.fcount = fcount + 1;
					$(p).addClass('panel-noscroll');
					if (p.tagName == 'BODY'){
						$('html').addClass('panel-fit');
					}
				}
				return {
					width: ($(p).width()||1),
					height: ($(p).height()||1)
				};
			} else {
				if (t.fitted){
					t.fitted = false;
					p.fcount = fcount - 1;
					if (p.fcount == 0){
						$(p).removeClass('panel-noscroll');
						if (p.tagName == 'BODY'){
							$('html').removeClass('panel-fit');
						}
					}
				}
				return false;
			}
		}
		
		function _setSize(target, property, parent, options){
			var t = $(target);
			var p = property;
			var p1 = p.substr(0,1).toUpperCase() + p.substr(1);
			var min = _slef.parseValue('min'+p1, options['min'+p1], parent);// || 0;
			var max = _slef.parseValue('max'+p1, options['max'+p1], parent);// || 99999;
			var val = _slef.parseValue(p, options[p], parent);
			var fluid = (String(options[p]||'').indexOf('%') >= 0 ? true : false);
			if (!isNaN(val)){
				var v = Math.min(Math.max(val, min||0), max||99999);
				if (!fluid){
					options[p] = v;
				}
				t._size('min'+p1, '');
				t._size('max'+p1, '');
				t._size(p, v);
			} else {
				t._size(p, '');
				t._size('min'+p1, min);
				t._size('max'+p1, max);
			}
			return fluid || options.fit;
		}
		function _css(target, property, value){
			var t = $(target);
			if (value == undefined){
				value = parseInt(target.style[property]);
				if (isNaN(value)){return undefined;}
				if ($._boxModel){
					value += getDeltaSize();
				}
				return value;
			} else if (value === ''){
				t.css(property, '');
			} else {
				if ($._boxModel){
					value -= getDeltaSize();
					if (value < 0){value = 0;}
				}
				t.css(property, value+'px');
			}
			function getDeltaSize(){
				if (property.toLowerCase().indexOf('width') >= 0){
					return t.outerWidth() - t.width();
				} else {
					return t.outerHeight() - t.height();
				}
			}
		}
	}
	});
	
	
	
	/**
	 * 扩展String方法
	 */
	$.extend(String.prototype, {
		/**
		 * 字符串是否为正整数
		 */
		isPositiveInteger:function(){
			return (new RegExp(/^[1-9]\d*$/).test(this));
		},
		/**
		 * 字符串是否为整数
		 */
		isInteger:function(){
			return (new RegExp(/^\d+$/).test(this));
		},
		/**
		 * 字符串是否为数值型
		 */
		isNumber: function(value, element) {
			return (new RegExp(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/).test(this));
		},
		/**
		 * 去字符串的前后空格
		 */
		trim:function(){
			return this.replace(/(^\s*)|(\s*$)|\r|\n/g, "");
		},
		/**
		 * 当前字符串进行转码
		 */
		trans:function() {
			return this.replace(/&lt;/g, '<').replace(/&gt;/g,'>').replace(/&quot;/g, '"');
		},
		/**
		 * 全部替换字符串
		 * @param os 需要替换字符串正则表达式
		 * @param ns 替换的字符串
		 * @return 替换结果
		 */
		replaceAll:function(os, ns) {
			return this.replace(new RegExp(os,"gm"),ns);
		},
		/**
		 * 模板替换
		 * @param $data 上下文书局
		 * @return 替换结果串
		 */
		evalTm:function($data) {
			if (!$data) return this;
			return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_{\\\\\\.}]*})","g"), function($1){
				var v = $data[$1.replace(/[{}]+/g, "")];
				return v?v:$1;
			});
		},
		/**
		 * 通过指定元素内容里包含的元素id为上下文的变量名，元素值为变量值进行模板替换
		 * @param _box 模板替换的范围
		 * @return 替换结果
		 */
		evalTmById:function(_box) {
			var $parent = _box || $(document);
			return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_{\\\\\\.}]*})","g"), function($1){
				var $input = $parent.find("#"+$1.replace(/[{}]+/g, ""));
				return $input.size() > 0 ? $input.val() : $1;
			});
		},
		/**
		 * 通过指定元素内容里包含的元素id为上下文的变量名，元素值为变量值进行模板替换
		 * @param _box 模板替换的范围
		 * @return 替换结果
		 */
		evalTmByAttr:function(t) {
			if(!t)
				return this.toString();
			var $t =$(t);
			return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_{\\\\\\.}]*})","g"), function($1){
				var attr= $1.replace(/[{}]+/g, "");
				var v = attr=='text'?$t.text():(attr=='value'|| attr=='val')?$t.val()||$t.attr(attr):$t.attr(attr);
				return v || $1;
			});
		},
		/**
		 * 转换模板串
		 */
		evalTemplate:function(el){
			if(this.isFinishedTm())
				return this.toString();
			var $el = $(el)
			,box = $el.attr("evalTarget")||el||document
			,$box=$(box);
			var val = this.evalTmById($box);
			val = this.evalTmByAttr($el.attr("evalTarget")||el);
			if (!val.isFinishedTm() && $el.attr("eval-warn")) {
				$A.messager.error($el.attr("eval-warn"));
				return false;
			}
			return val;
		},
		/**
		 * 模板替换是否完成
		 * @return 布尔值
		 */
		isFinishedTm:function(){
			return !(new RegExp("{[A-Za-z_]+[A-Za-z0-9_]*}").test(this)); 
		},
		/**
		 * 去掉字符串前面指定的字母
		 */
		skipChar:function(ch) {
			if (!this || this.length===0) {return '';}
			if (this.charAt(0)===ch) {return this.substring(1).skipChar(ch);}
			return this;
		},
		/**
		 * 判断是否为合格的密码串
		 */
		isValidPwd:function() {
			return (new RegExp(/^([_]|[a-zA-Z0-9]){6,32}$/).test(this)); 
		},
		/**
		 * 判断是否为邮件地址串
		 */
		isValidMail:function(){
			return(new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/).test(this.trim()));
		},
		/**
		 * 判断当前串是否为空串
		 */
		isSpaces:function() {
			for(var i=0; i<this.length; i+=1) {
				var ch = this.charAt(i);
				if (ch!=' '&& ch!="\n" && ch!="\t" && ch!="\r") {return false;}
			}
			return true;
		},
		/**
		 * 是否为电话号码
		 */
		isPhone:function() {
			return (new RegExp(/(^([0-9]{3,4}[-])?\d{3,8}(-\d{1,6})?$)|(^\([0-9]{3,4}\)\d{3,8}(\(\d{1,6}\))?$)|(^\d{3,8}$)/).test(this));
		},
		/**
		 * 是否为url地址
		 */
		isUrl:function(){
			return (new RegExp(/^[a-zA-z]+:\/\/([a-zA-Z0-9\-\.]+)([-\w .\/?%&=:]*)$/).test(this));
		},
		/**
		 * 判断是否为外部地址
		 */
		isExternalUrl:function(){
			return this.isUrl() && this.indexOf("://"+document.domain) == -1;
		},
		/**
		 * 获取汉字拼音首字母串
		 * @return {String}拼音首字母串
		 */
		toInitials:function() {
			return $pinyin.toInitials(this);
		},
		/**
		 * 获取汉字拼音大写首字母串
		 * @return {String}大写的拼音首字母串
		 */
		toUpperInitials:function() {
			return $pinyin.toUpperInitials(this);
		},
		
		/**
		 * 获取汉字拼音串
		 * @param ch{String}拼音字符串
		 * @return {String}汉字拼音串
		 */
		toPinyin:function() {
			return $pinyin.toPinyin(this);
		},
		
		/**
		 * 获取汉字首字母大写的拼音串
		 * @return {String}首字母大写的拼音串
		 */
		toCapPinyin:function() {
			return $pinyin.toCapPinyin(this);
		}
		
	});
	return $;
});

define('bs-http-plugin/config-ext',["app/core/app-core",],function ($A) {
    var config = {
        "bs-client-config":{
            //控件下载地址
            downloadUrl:$A.getHostUrl()+'resources/bsnetfun/bosssoft-assistant-v1.5.4.exe',
            //前端控件实例初始化时更新，如果客户端未启动，会在启动成功后再发一次更新请求
            initUpdate:true,
            //客户端更新地址，initUpdate为true时才起作用
            updateUrl:$A.getHostUrl()

        }
    }
    return config;
});
/**
 * Created by qiu.yong on 2017/5/16.
 */
define('bs-http-plugin/config',["app/core/app-jquery","app/core/app-core","bs-http-plugin/config-ext"], function (AppCore,$A,GlobalConfig) {

    var Config = {
        version:'1.0',
        url:'http://127.0.0.1:13526/',
        guardUrl:'http://127.0.0.1:13528/controlMainApp',
        heartbeat:'heart',
        update:'update',
        startUrl:'BosssoftAssistant://',
        cookies: window._cookies||'no-cookies',
        timeout:2000,
        sliceSize:1024
    }
    var gcfg = GlobalConfig["bs-client-config"];
    if(gcfg){
        $.extend(Config,gcfg);
    }
    return Config;
});
//https://github.com/kelektiv/node-uuid

define('bs-http-plugin/util/uuid',[],function () {
    var uuid = null;

    !function(e){uuid=e()}(function(){return function e(n,r,o){function t(f,u){if(!r[f]){if(!n[f]){var a="function"==typeof require&&require;if(!u&&a)return a(f,!0);if(i)return i(f,!0);var d=new Error("Cannot find module '"+f+"'");throw d.code="MODULE_NOT_FOUND",d}var s=r[f]={exports:{}};n[f][0].call(s.exports,function(e){var r=n[f][1][e];return t(r?r:e)},s,s.exports,e,n,r,o)}return r[f].exports}for(var i="function"==typeof require&&require,f=0;f<o.length;f++)t(o[f]);return t}({1:[function(e,n,r){var o=e("./v1"),t=e("./v4"),i=t;i.v1=o,i.v4=t,n.exports=i},{"./v1":4,"./v4":5}],2:[function(e,n,r){function o(e,n){var r=n||0,o=t;return o[e[r++]]+o[e[r++]]+o[e[r++]]+o[e[r++]]+"-"+o[e[r++]]+o[e[r++]]+"-"+o[e[r++]]+o[e[r++]]+"-"+o[e[r++]]+o[e[r++]]+"-"+o[e[r++]]+o[e[r++]]+o[e[r++]]+o[e[r++]]+o[e[r++]]+o[e[r++]]}for(var t=[],i=0;i<256;++i)t[i]=(i+256).toString(16).substr(1);n.exports=o},{}],3:[function(e,n,r){(function(e){var r,o=e.crypto||e.msCrypto;if(o&&o.getRandomValues){var t=new Uint8Array(16);r=function(){return o.getRandomValues(t),t}}if(!r){var i=new Array(16);r=function(){for(var e,n=0;n<16;n++)0===(3&n)&&(e=4294967296*Math.random()),i[n]=e>>>((3&n)<<3)&255;return i}}n.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],4:[function(e,n,r){function o(e,n,r){var o=n&&r||0,t=n||[];e=e||{};var f=void 0!==e.clockseq?e.clockseq:a,l=void 0!==e.msecs?e.msecs:(new Date).getTime(),c=void 0!==e.nsecs?e.nsecs:s+1,v=l-d+(c-s)/1e4;if(v<0&&void 0===e.clockseq&&(f=f+1&16383),(v<0||l>d)&&void 0===e.nsecs&&(c=0),c>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");d=l,s=c,a=f,l+=122192928e5;var p=(1e4*(268435455&l)+c)%4294967296;t[o++]=p>>>24&255,t[o++]=p>>>16&255,t[o++]=p>>>8&255,t[o++]=255&p;var y=l/4294967296*1e4&268435455;t[o++]=y>>>8&255,t[o++]=255&y,t[o++]=y>>>24&15|16,t[o++]=y>>>16&255,t[o++]=f>>>8|128,t[o++]=255&f;for(var b=e.node||u,w=0;w<6;++w)t[o+w]=b[w];return n?n:i(t)}var t=e("./lib/rng"),i=e("./lib/bytesToUuid"),f=t(),u=[1|f[0],f[1],f[2],f[3],f[4],f[5]],a=16383&(f[6]<<8|f[7]),d=0,s=0;n.exports=o},{"./lib/bytesToUuid":2,"./lib/rng":3}],5:[function(e,n,r){function o(e,n,r){var o=n&&r||0;"string"==typeof e&&(n="binary"==e?new Array(16):null,e=null),e=e||{};var f=e.random||(e.rng||t)();if(f[6]=15&f[6]|64,f[8]=63&f[8]|128,n)for(var u=0;u<16;++u)n[o+u]=f[u];return n||i(f)}var t=e("./lib/rng"),i=e("./lib/bytesToUuid");n.exports=o},{"./lib/bytesToUuid":2,"./lib/rng":3}]},{},[1])(1)});

    return uuid;
})
;
/**
 * Created by qiu.yong on 2017/5/24.
 */

define('bs-http-plugin/data-transmit/message',["jquery"], function ($) {
    var Message = function () {
        var _self = this;
        _self.msgStack = {};
        $(window).on('message', function (event) {
            var data = event.originalEvent.data;
            data = $.parseJSON(data);
            var callback = _self.get(data.id);
            if (!!callback) {
                callback.call({}, data);
            }
        });
    };
    Message.prototype = {
        constructor:Message,
        set: function (id, callback) {
            this.msgStack[id] = callback;
        },
        get: function (id) {
            var callback = this.msgStack[id];
            if (!!callback) {
                delete this.msgStack[id];
            }
            return callback;
        }
    };
    return new Message();
});
/*
 * Dotpl-JS v1.0
 * http://code.google.com/p/dotpl-js/
 * (c) 2012 by Chunzhan.He. All rights reserved.
 * chunzhan.he@gmail.com
 */
// alert(dotpl.diving("data", {data:{data1:{val:"evolution"}}}));
// alert(dotpl.diving("data.data1", {data:{data1:{val:"evolution"}}}));
// alert(dotpl.diving("data.data1.val", {data:{data1:{val:"evolution"}}}));
// alert(dotpl.applyTpl("hello ${val}", {val:"world"}));
// alert(dotpl.applyTpl("hello ${val} ${val2}", {val:"world",val1:"wide-web",val2:"good"}, function(k,v,kv){
// if(k=='val') return kv['val']+"-"+kv['val1'];
// }));
// alert(dotpl.applyTpl("hello ${data.val}", {data:{val:"freedom"}}));
// alert(dotpl.applyTpl("hello ${data.val} nothing ${none}", {data:{val:"freedom"}}));
// alert(dotpl.applyTpl("hello ${data.data1.val}", {data:{data1:{val:"evolution"}}}));
// alert(dotpl.applyTpl("hello ${val},i ${action} you", {val:"town", action:'love'}));
// alert(dotpl.applyTpl("hello ${val},<tpl if=\"'${action}'=='love'\">i ${action} you</tpl>", {val:"town", action:'love'}));
// alert(dotpl.applyTpl("hello ${val},if false<tpl if=\"'${action}'=='love'\">i ${action} you</tpl>", {val:"town", action:'like'}));
// alert(dotpl.applyTpl("list:\n<tpl for=\".\">${__offset} hello ${key} ${val}\n</tpl>", [{key:"world", val:'like'},{key:"town", val:'freedom'}]));
// alert(dotpl.applyTpl("list:\n<tpl for=\"data\">${__offset} hello ${key} ${val}\n</tpl>", {data:[{key:"world", val:'like'},{key:"town", val:'freedom'}]}));
// alert(dotpl.applyTpl("list:\n<tpl for=\"data\">${__offset} hello ${__val} \n</tpl>", {data:[1,2,4]}));
// alert(dotpl.applyTpl("list:\n<tpl for=\"data\">${__offset} hello ${__val} \n</tpl>", {data:["s1","s2","s3"]}));
// alert(dotpl.applyTpl("list:\n<tpl for=\"data\">${__offset} hello ${key} ${val}\n</tpl>list2:\n<tpl for=\"data\">${__offset} 1024 ${key} ${val}\n</tpl>", {data:[{key:"world", val:'like'},{key:"town", val:'freedom'}]}));
// alert(dotpl.applyTpl("<tpl for=\".\">list${__offset} \n <ul><tpl0 for=\"data\"><li>${__offset} \n ${key} ${val}</li></tpl0></ul></tpl>", [{data:[{key:"world", val:'like'},{key:"town", val:'freedom'}]},{data:[{key:"world1", val:'like1'},{key:"town1", val:'freedom1'}]}]));
// dotpl.applyRTpl("/display.tpl",{key:'hellow world'},function(view){alert(view);});
define('base/dotpl-js',[],function () {
    var dotpl = function() {
        function _diving(key,kv) {
            var keys = key.split("\.");
            var i = 0;
            do {
                kv = kv[keys[i++]];
                if(kv==null) break;
            } while(i<keys.length&&typeof(kv)=='object');
            return kv;
        }
        function _applyMapTpl(tpl, values, renderer, pk, parent) {
            var re = /\${1}\{([^\}]+?)\}/ig;
            var view = tpl.replace(re, function($0,$1) {
                try {
                    var val = _diving($1,values);
                    val = (val==null?"":val);
                    if(typeof renderer=='function') {
                        var tmp = renderer.call(this, $1, val, values, pk, parent);
                        return tmp==null?val:tmp;
                    }
                    return val;
                } catch(e){ alert($1||e.message||e);return null;}
            });
            return view;
        }
        function _request(url,cb,sync) {
            var xmlhttp = null;
            if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp=new XMLHttpRequest();
            } else {// code for IE6, IE5
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange=function() {
                if (xmlhttp.readyState==4) {
                    try {
                        cb.call(this, xmlhttp.responseText,xmlhttp.status);
                    } catch(e){ alert(e.message||e);return null;}
                }
            }
            try {
                xmlhttp.open('GET',url,!!sync);
                xmlhttp.send();
            } catch(e){ alert(e.message||e);return null;}
            return xmlhttp;
        }
        function _applyTpl(tpl, data, renderer, pk, parent){
            var regx = /<(tpl\d?)\s+(\w+)\s*=\s*(['|"]{1})([^\3]+?)\3\s*>([\s\S]+?)<\/\1>/ig;
            if(regx.test(tpl)) {
                tpl = tpl.replace(regx, function($0,$1,$2,$3,$4,$5){
                    var output = "";
                    if($2!=null) {
                        if($2.toUpperCase()=="FOR") {
                            var arr = data;
                            if($4!=".") {
                                arr = _diving($4,data);
                            }
                            for(var i=0;arr!=null&&i<arr.length;i++) {
                                var item = {};
                                if(typeof(arr[i])!='object') {
                                    item.__val = arr[i];
                                } else {
                                    item = arr[i];
                                }
                                item.__offset = i;
                                output+=_applyTpl($5,item,renderer,$4,arr);
                            }
                        } else if($2.toUpperCase()=="IF") {
                            try {
                                if(eval(applyTpl($4,data))) {
                                    return _applyTpl($5, data, renderer, pk, parent);
                                }
                            } catch(e) {
                                alert($4||e.message||e);
                            }
                        }
                    }
                    return output;
                });
            }
            return _applyMapTpl(tpl, data, renderer, pk, parent);
        }
        return function(){
            this.diving=_diving;
            this.applyTpl=_applyTpl;
            //remote template
            this.applyRTpl=function(url, data, cb, renderer){
                _request(url, function(tpl, status){
                    if(status==200) {
                        cb.call(this, _applyTpl(tpl, data, renderer));
                    } else {
                        alert("Error "+status+":"+url);
                    }
                });
            };
            return this;
        };
    }()();
    window.dotpl = dotpl;
    return dotpl;
});
/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.1.9";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = require('buffer').Buffer;
        } catch (err) {}
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ? function (u) {
        return (u.constructor === buffer.constructor ? u : new buffer(u))
        .toString('base64')
    }
    : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer ? function(a) {
        return (a.constructor === buffer.constructor
                ? a : new buffer(a, 'base64')).toString();
    }
    : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
    if (global['Meteor']) {
        Base64 = global.Base64; // for normal export in Meteor.js
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('base/base64',[], function(){ return global.Base64 });
    }
})(typeof self !== 'undefined' ? self
 : typeof window !== 'undefined' ? window
 : typeof global !== 'undefined' ? global
 : this
);
/**
 * 跨域http数据传输
 * Created by qiu.yong on 2017/5/15.
 */

define('bs-http-plugin/data-transmit/socket',["jquery",
    "bs-http-plugin/util/uuid",
    "bs-http-plugin/config",
    "bs-http-plugin/data-transmit/message",
    "base/dotpl-js",
    "base/base64"
], function ($,uuid,config,msg) {

    //切割默认大小
    var sliceSize = config.sliceSize;
    //url最大长度 TODO 根据浏览器设置
    var urlMaxLen = 2000;
    var sendByIframeTimeout = 5*60*1000;
    //状态
    var STATE = {
        pending:{
            code:0,
            name:'pending',
            msg:'准备阶段'
        },
        sendData:{
            code:1,
            name:'sendData',
            msg:'发送数据'
        },
        sendDataCompleted:{
            code:2,
            name:'sendDataCompleted',
            msg:'发送数据完成'
        },
        invoking:{
            code:3,
            name:'invoking',
            msg:'dll调用'
        },
        invoked:{
            code:4,
            name:'invoked',
            msg:'dll调用完成并返回结果'
        },
        state:function(name,op){
            return $.extend(true,{},STATE[name],op);
        },
        //注册事件
        register:function (obj,fn) {
            if($.type(obj)==='undefined'){
                obj = {};
            }
            //注册状态事件
            var $eventObj = $(obj);
            var stateChange = $.isFunction(fn)?fn:$.noop;
            $eventObj.on('stateChange',stateChange);
            $eventObj.trigger('stateChange',[STATE.state('pending')]);
            return $eventObj;
        },
        //触发
        trigger:function ($eventObj,state,args) {
            if($.type(args)==='undefined'){
                args = [];
            }
            $eventObj.trigger('stateChange',[STATE.state(state)].concat([].slice.call(args,0)));
        }
    };

    var getRs = function () {
      return this.ret.ret_msg;
    };
    var Socket = function () {
    };
    Socket.prototype = {
        constructor:Socket,
        /**
         * 通过get跨域发送数据 后端给实现jsonp返回执行函数包裹结果集
         * @param op
         * {
         *  url:'xxx',
         *  sliceSize:500,//切割大小
         *  data:{
         *      xx:d,
         *      xx2:d2,
         *      payload:d3   //只有这个属性会被拆分编码
         *      },
         *  success:function(){
         *
         *  },
         *  error:function(){
         *
         *  },
         *  stateChange:function(){
         *
         *  }
         *  }
         */
        get: function (op) {
            var _self = this;
            //注册状态事件
            var $eventObj = STATE.register({},op.stateChange);
            //参数初始化
            op.success = $.isFunction(op.success)?op.success:$.noop;
            op.error = $.isFunction(op.error)?op.error:$.noop;
            //payload 初始化
            var payload = op.data;
            payload = $.type(payload)==='undefined'?{}:payload;
            // $.extend(op.data,{id:uuid.v4().replace(/-/g,'')});

            payload = JSON.stringify(payload);
            payload = _self.encodeURI(payload);
            var size = op.sliceSize?op.sliceSize:sliceSize;
            //校验url长度是否超标
            var _op = $.extend(true,{},op);
            delete _op.data.payload;
            var urlLen = op.url.length + JSON.stringify(_op.data).length+size;
            if(urlLen>urlMaxLen){
                throw new Error('url 长度超过超过可发送最大长度，请重新设置sliceSize!');
            }
            //切割
            var fragements = _self.sliceData(payload,size);
            //生成调用列表
            var ajaxRS = _self.generateAjaxArray(op,fragements);
            var dataSendCompletedAjaxConfig = ajaxRS.dataSendCompletedAjaxConfig;
            var ajaxConfig = ajaxRS.ajaxConfig;
            var deferreds = ajaxRS.deferreds;


            //发送数据包
            $(ajaxConfig).each(function (index,item) {
               $.ajax(item).done(item.success).fail(item.error);
            });
            STATE.trigger($eventObj,'sendData');
            var retDef = $.Deferred();
            //获取操作结果
            $.when.apply($,deferreds).done(function() {
                retDef.resolve.apply($,arguments);
                STATE.trigger($eventObj,'sendDataCompleted');
                dataSendCompletedAjaxConfig.success = function (data) {
                    STATE.trigger($eventObj,'invoked',arguments);
                    op.success.apply(op,arguments);
                };
                dataSendCompletedAjaxConfig.error = function (data) {
                    STATE.trigger($eventObj,'invoked',arguments);
                    op.error.apply(op,arguments);
                }
                //$.ajax(dataSendCompletedAjaxConfig);
                STATE.trigger($eventObj,'invoking');
            }).fail(function() {
                retDef.reject.apply($,arguments);
                STATE.trigger($eventObj,'invoked',arguments);
                op.error.apply(op,arguments);
            })
            return retDef;
        },
        /**
         * 通过post跨域发送，后端返回头部给添加相应跨域设置
         *
         * Access-Control-Allow-Origin 为允许哪些Origin发起跨域请求. 这里设置为”*”表示允许所有，通常设置为所有并不安全，最好指定一下。
         * Access-Control-Allow-Methods 为允许请求的方法.
         * Access-Control-Max-Age 表明在多少秒内，不需要再发送预检验请求，可以缓存该结果
         * Access-Control-Allow-Headers 表明它允许跨域请求包含content-type头，这里设置的x-requested-with ，表示ajax请求
         *
         * resp.setHeader( "Access-Control-Allow-Origin", "http://localhost:8080" );
         * resp.setHeader( "Access-Control-Allow-Headers", "x-requested-with" );
         * resp.setHeader( "Access-Control-Allow-Methods", "POST" );
         * resp.setHeader( "Access-Control-Max-Age", "3628800" );
         * @param op
         */
        post:function (op) {
            var _self = this;
            //注册状态事件
            var $eventObj = STATE.register({},op.stateChange);
            //参数初始化
            op.success = $.isFunction(op.success)?op.success:$.noop;
            op.error = $.isFunction(op.error)?op.error:$.noop;
            //payload 初始化
            var payload = op.data;
            payload = $.type(payload)==='undefined'?{}:payload;
            op.data = {id:uuid.v4().replace(/-/g,'')};
            payload = JSON.stringify(payload);
            payload = _self.base64Encode(payload);
            op.crossDomain = true;
            op.data.payload = payload;
            op.contentType = "application/x-www-form-urlencoded; charset=utf-8";
            op.dataType = "json";
            op.type = "POST";

            $.support.cors = true;
            //获取操作结果
            $.when($.ajax(op)).done(function() {
                STATE.trigger($eventObj,'invoked',arguments);
                op.success.apply(op,arguments);
            }).fail(function() {
                STATE.trigger($eventObj,'invoked',arguments);
                op.error.apply(op,arguments);
            });
            STATE.trigger($eventObj,'invoking');
        },
        send:function (op) {
            if(op.data){
                op.data = {
                    id:uuid.v4().replace(/-/g,''),
                    payload:JSON.stringify(op.data)
                }
                op.id = op.data.id;
            }
            return this.sendByIframe(op);
        },
        /**
         * 通过 form iframe post跨域发送数据 后端给实现window.parent.postMessage()返回执行执行
         * @param op
         * {
         *  url:'xxx',
         *  timeout:30000, //default 30000
         *  base64:true, //default true
         *  data:{
         *      xx:d,
         *      xx2:d2,
         *      payload:d3
         *      },
         *  success:function(){
         *
         *  },
         *  error:function(){
         *
         *  },
         *  stateChange:function(){
         *
         *  }
         *  }
         */
        sendByIframe:function (op) {
            var operateDefer = op['-operateDefer'];
            if($.type(operateDefer)==='undefined'){
                operateDefer = $.Deferred();
                op['-operateDefer'] = operateDefer;
            }
            var socketDefer = operateDefer;
            var _self = this;
            //注册状态事件
            var $eventObj = STATE.register({},op.stateChange);
            //参数初始化
            op.success = $.isFunction(op.success)?op.success:$.noop;
            op.error = $.isFunction(op.error)?op.error:$.noop;
            var $iframe = _self.createIframe(op);
            var $form = _self.createForm(op);
            var callback = function (data) {
                if($.type(data)==='undefined'){
                    data = {};
                }
                data['getResult'] = getRs;
                try {
                    var args = [data.getResult(),STATE.state('invoked')];
                    op.success.apply(this,args);
                    if(data.ret['ret_code']==='0'){
                        op.success.apply(op,args);
                        operateDefer.resolve.apply(operateDefer,args);
                    }else{
                        op.error.apply(op,args);
                        operateDefer.reject.apply(operateDefer,args);
                    }
                    $form.remove();
                    $iframe.remove();
                }catch (e){
                    args.push(e);
                    op.error.apply(this,args);
                    if(window.console){
                        window.console.error(e);
                    }else {
                        throw e;
                    }
                }
            };
            msg.set(op.data.id,callback);
            //保证 defer 方法队列先绑定
            setTimeout(function () {
                $form.submit();
            },0);
            //超时
            var timeout = op.timeout?op.timeout:sendByIframeTimeout;
            var startTime = new Date();
            var timer = setInterval(function(){
                var endTime = new Date();
                if(socketDefer.state()!=='pending'){
                    clearInterval(timer);
                    return;
                };
                if((endTime-startTime)>timeout){
                    op.error.apply(this,[{code:'timeout',msg:'超时'}]);
                    socketDefer.reject({code:'timeout',msg:'超时'});
                    clearInterval(timer);
                }
            },800);
            STATE.trigger($eventObj,'invoking');
            return socketDefer;
        },
        createIframe:function (op) {
            var template= '<iframe \
                                id="socketIframe${id}" \
                                name="socketIframe${id}" \
                                style="position:absolute; top:-9999px; left:-9999px">\
                            </iframe>';
            var $iframe = $(dotpl.applyTpl(template,op));
            $iframe.appendTo('body');
            return $iframe;
        },
        createForm:function (op) {
            if(!!op.func){
                op.invokeType = 'func';
                op.invokeValue = op.func;
            }else{
                op.invokeType = 'proc';
                op.invokeValue = op.proc;
            }
            var template= '<form id="socketForm${id}" name="socketForm${id}" \
                target="socketIframe${id}" \
                action="${url}" \
                method="post" \
                accept-charset="UTF-8" \
                > \
                </form>';
            var $form = $(dotpl.applyTpl(template,op));
            var fieldTemp = '<input type="hidden" name="" value="" />';
            if($.type(op.data)==='object'){
                for(field in op.data){
                    var $field = $(fieldTemp);
                    $field.prop('name',field);
                    $field.prop('value',op.data[field]);
                    $form.append($field);
                }
            }
            $form.appendTo('body');
            return $form;
        },
        /**
         * 拆分数据块
         */
        sliceData: function (data, size) {
            var fragments = [];
            var dataStr = '';
            if ($.type(data) === 'string') {
                dataStr = data;
            } else{
                dataStr = JSON.stringify(data);
            }
            var sum = Math.ceil(dataStr.length / size);
            for (var i = 0, start = 0; i < sum; i++, start += size) {
                fragments.push(dataStr.substr(start, size));
            }
            return fragments;
        },
        /**
         * 生成发送ajax数组
         * @param op
         * @param fragments
         * @returns {{ajaxConfig: Array, ajaxArray: Array}}
         */
        generateAjaxArray: function (op,fragments) {
            //ajax配置
            var ajaxConfig = [];
            //配置调用ajax调用
            var deferreds = [];
            var options =  {};
            $.extend(true,options,op);
            delete options.data.payload;
            var len = fragments.length;
            if(len===0){
                len = 1;
            }

            options.data.sum = len;
            var baseConfig = {
                url:op.url,
                timeout:options.timeout?options.timeout:5000,
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                dataType: 'jsonp',
                jsonp: 'jsonp',
                type:'GET'
            };
            for(var i = 0;i < len;i++){
                var data = {};
                var dfd = $.Deferred();
                deferreds.push(dfd.promise());
                $.extend(true,data,options.data);
                data.curr = i;
                if(typeof fragments[i]!=="undefined"){
                    data.payload = fragments[i];
                }
                var config = $.extend(true,{},baseConfig);
                config.success = (function(dfd){
                    return function(data){
                        dfd.resolve();
                    }
                })(dfd);
                config.error = (function(dfd){
                    return function(data){
                        dfd.reject();
                    }
                })(dfd);
                config.data = data;
                ajaxConfig.push(config);
            }
            var result ={
                dataSendCompletedAjaxConfig:$.extend(
                    true,{},
                    baseConfig,
                    options,
                    {
                        data:{
                            res:1
                        },
                        timeout:0
                    }
                ),
                ajaxConfig:ajaxConfig,
                deferreds:deferreds
            }
            return result;
        },
        /**
         */
        encodeURI: function (data) {
            return encodeURIComponent(data);
        },
        base64Encode:function (data) {
            return Base64.encode(data);
        }
    };

    var instant = new Socket();
    return instant;
});

define('app/util/app-number-format',[], function(){
	/**
	 * @class
	 * @classdesc 数字工具类
	 * @name NumberFormat-class
	 * @desc 提供数字的格式化方法
	 */
	var NumberFormat = {};
	/**
	 * 格式化数值
	 * @param num 数值
	 * @param pattern 格式化串
	 * <PRE>
	 * 1、格式化串以;;#结束 则说明0不显示
	 * 2、如果格式化串数字部分以%结束 则说明进行百分比显示 
	 * <PRE>
	 * @returns {String}
	 * @example $A.NumberFormat.format(1234, '#,###.##');->1,234
	 * @example $A.NumberFormat.format(1234, '#,###.00');->1,234.00
	 * @example $A.NumberFormat.format(0, '#,###.00');->0.00
	 * @example $A.NumberFormat.format(0, '#,###.00;;#');->
	 * @example $A.NumberFormat.format('', '#,###.00;;#');->
	 * @example $A.NumberFormat.format(null, '#,###.00;;#');->
	 * @example $A.NumberFormat.format(14, '#,###.00%');->1,400.00%
	 * @memberof NumberFormat-class
	 * @instance
	 */
	NumberFormat.format = function(num, pattern) {
		if(num == undefined){
			return '';
		}
		var result = '';
		if(pattern.indexOf(';;#') == pattern.length-3){
			if(num == 0){
				return '';
			}
			pattern = pattern.substr(0, pattern.length-3);
		}
		var hasPercent = pattern.indexOf('%') == pattern.length - 1; 
		if(hasPercent){
			num = num*100;
			pattern = pattern.substr(0, pattern.length-1);
		}
		var strarr = num ? num.toString().split('.') : [ '0' ]
			,fmtarr = pattern ? pattern.split('.') : [ '' ]
			,intStr = formatInteger(strarr, fmtarr)
			,decimalStr = formatDecimal(strarr, fmtarr)
			,result = '';
		if(decimalStr){
			result = intStr + '.' + decimalStr;
		}else{
			result = intStr;
		}
		if(hasPercent){
			result += '%';
		}
		return result;
		function formatInteger(strarr, fmtarr){
			var result = ''
				,str = strarr[0]
				,fmt = fmtarr[0]
				,i = str.length - 1
				,comma = false;
			for (var f = fmt.length - 1; f >= 0; f--) {
				switch (fmt.substr(f, 1)) {
				case '#':
					if (i >= 0)
						result = str.substr(i--, 1) + result;
					break;
				case '0':
					if (i >= 0)
						result = str.substr(i--, 1) + result;
					else
						result = '0' + result;
					break;
				case ',':
					comma = true;
					result = ',' + result;
					break;
				}
			}
			if (i >= 0) {
				if (comma) {
					var l = str.length;
					for (; i >= 0; i--) {
						result = str.substr(i, 1) + result;
						if (i > 0 && ((l - i) % 3) == 0)
							result = ',' + result;
					}
				} else
					result = str.substr(0, i + 1) + result;
			}
			return result.replace(/^,+/,'').replace(/^(-,)/,'-');
		}
		function formatDecimal(strarr, fmtarr){
			var str = strarr.length > 1 ? strarr[1] : ''
				,fmt = fmtarr.length > 1 ? fmtarr[1] : ''
				,i = 0
				,result = '';
			for (var f = 0; f < fmt.length; f++) {
				switch (fmt.substr(f, 1)) {
				case '#':
					if (i < str.length)
						result += str.substr(i++, 1);
					break;
				case '0':
					if (i < str.length)
						result += str.substr(i++, 1);
					else
						result += '0';
					break;
				}
			}
			return result;
		}
	};
	/**
	 * 三位一个逗号隔开的展现，保留s为小数
	 * @param num 数值
	 * @param precision 保留小数位
	 * @param ixMax 是否按原数值的最大小数位
	 * @returns {String}
	 */
	NumberFormat.toThousands = function(num, precision, isMax){
		var pattern = '#,##0';
		if(precision > 0){
			var decimalPattern = '';
			for(var i = 0; i < precision; i++){
				if(isMax){
					decimalPattern += '#';
				}else{
					decimalPattern += '0';
				}
			}
			pattern += '.' + decimalPattern;
		}
		return NumberFormat.format(num, pattern);
	};
	/**
	 * 转换为大写金额
	 * @param num 数值
	 * @returns {String}
	 */
	NumberFormat.toChinese = function(num){
		if (isNaN(num))
			return '';
		if(num > Math.pow(10, 12)){
			return '还未处理这么大的值';
		}
		var cn = '零壹贰叁肆伍陆柒捌玖'
			,unit = new Array('拾佰仟', '分角')
			,unit1 = new Array('万亿', '')
			,numArray = num.toString().split('.')
			,start = new Array(numArray[0].length - 1, 2);
		for ( var i = 0; i < numArray.length; i++) {
			var tmp = '';
			for ( var j = 0; j * 4 < numArray[i].length; j++) {
				var strIndex = numArray[i].length - (j + 1) * 4
					,str = numArray[i].substring(strIndex, strIndex + 4)
					,start = i ? 2 : str.length - 1
					,tmp1 = getChinese(str, i);
				tmp1 = tmp1.replace(/(零.)+/g, '零').replace(/零+$/,'');
				tmp = (tmp1 + (tmp1 ? unit1[i].charAt(j - 1) : '')) + tmp;
			}
			numArray[i] = tmp;
		}
		numArray[1] = numArray[1] ? numArray[1] : '';
		numArray[0] = numArray[0] ? numArray[0] + '元' : numArray[0];
		numArray[1] = numArray[1].match(/分/) ? numArray[1] : numArray[1] + '整';
		return numArray[0] + numArray[1];
		/**
		 * 转换为大写
		 * @param num 数字
		 * @param 数字所在索引
		 * @returns {String} 大写值
		 */
		function getChinese(num, index) {
			num = num.replace(/\d/g, function($1) {
				return cn.charAt($1)+ unit[index].charAt(start-- % 4 ? start % 4: -1);
			});
			return num;
		}
	};
	return NumberFormat;
});
define('app/util/app-xss-utils',[], function() {

	var REGX_DECODE = /&\w+;|&#(\d+);/g;

	var DECODE = {
		"&lt;" : "<",
		"&gt;" : ">",
		"&amp;" : "&",
		"&nbsp;" : " ",
		"&quot;" : "\""
		// Add more
	};

	String.prototype.xssDecode = function(s) {
		s = (s != undefined) ? s : this.toString();
		return (typeof s != "string") ? s : s.replace(REGX_DECODE,
				function($0, $1) {
					var c = DECODE[$0];
					if (c == undefined) {
						if (!isNaN($1)) {
							c = String.fromCharCode(($1 == 160) ? 32 : $1);
						} else {
							c = $0;
						}
					}
					return c;
				});
	};
});
define('app/util/app-utils',["app/core/app-jquery","app/core/app-core", 
        'app/util/app-number-format', 'app/util/app-xss-utils'], function ($, App, NumberFormat){
	
	var DEFAULT_DATE_PATTERN = "yyyy-MM-dd";
	
	var IDCARD1_PATTERN = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
	
	var IDCARD2_PATTERN = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;
	
	var _PrivateFuncs = {
			"formatDateNum":function(num,len){
				var v = num.toString();
				if(v.length<len){
					var tmp = [len-v.length];
					for(var i=0;i<tmp.length;i++){
						tmp[i] = "0";
					}
					v = tmp.join("")+v;
				}else if(v.length>len){
					v = v.substring(v.length-len,v.length);
				}
				return v;
			}
	};
	
	/**
	 * 定义工具方法
	 */
	App.utils={
		/**
		 * 过滤特殊的html和js标签
		 */
		htmlencode: function(s){  
		    var div = document.createElement('div');  
		    div.appendChild(document.createTextNode(s));  
		    return div.innerHTML;  
		},
		/**
		 * 收集指定html元素指定属性，生成选项对象
		 */
		collectOptions:function(el,opNames){
			if(!opNames||!jQuery.isArray(opNames))
				return null;
			$el = $(el);
			var options = {};
			for(var i=0; i< opNames.length;i++){
				var val,name = opNames[i];
				if(name.indexOf(":")>-1){
					var t = name.split(":");
					val=$el.attr(t[0]);
					name=t[1];
				}else{
					val = $el.attr(name);
				}
				if(val){
					if(val.isInteger()){
						options[name] = parseInt(val,10);
					}else{
						options[name] = val;
					}
				}
			}
			return options;
		},
		/**
		 * 转换元素属性中的模板变量
		 */
		evalElementAttr:function(el,attrName){
			var $el = $(el),attr=attrName||"href";
			var val = this.attr($el,attr);
			if(!val || val.isFinishedTm())
				return val;
			val = val.evalTemplate(el);
			return val;
		},
		
		/**
		 * 取得当前元素的指定属性值包括val text html属性
		 */
		attr:function(el,attr){
			if(!attr)
				return null;
			return attr=='text'?$(el).text():(attr=='html'?$(el).html():(attr=='val'||attr=='value'?$(el).val():$(el).attr(attr)));
		},
		/**
		 * 格式化消息串
		 */
		format:function(msg,args){
			args = args || [];
			var result = msg;
			for (var i = 0; i < args.length; i++){
				result = result.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
			}
			return result;
		},
		/**
		 * 获取传入日期的月份范围，月份的第一天到最后一天
		 * @param date
		 * @result {begin,end}
		 */
		getMonthRange: function(date){
			var year = date.getFullYear()
				,month = date.getMonth()
				,days = new Date(year, month + 1, 0).getDate()
				,begin = new Date(year,month,1)
				,end = new Date(year,month,days); 
			return {begin:begin,end:end};
		},
		/**
		 * 获取传入年度的范围，年度的第一天到最后一天
		 * @param year
		 * @result {begin,end}
		 */
		getYearRange: function(year){
			var begin = new Date(year,0,1)
				,end = new Date(year,11,31); 
			return {begin:begin,end:end};
		},
		/**
		 * 获取传入日期所在季度的范围，季度第一天和最后一天
		 * @param date
		 * @returns {string} begin,end
		 */
		getSeasonRange: function(date){
			var year = date.getFullYear()
				,month = date.getMonth()
				,season = getMonth_Season(month + 1)
				,firstMonth = 0
				,lastMonth = 0;
			switch (season) {
			case 1:
				firstMonth = 1;
				lastMonth = 3;
				break;
			case 2:
				firstMonth = 4;
				lastMonth = 6;
				break;
			case 3:
				firstMonth = 7;
				lastMonth = 9;
				break;
			case 4:
				firstMonth = 10;
				lastMonth = 12;
				break;
			default:
				break;
			}
			var lastDate = new Date(year, lastMonth, 0).getDate()
				,begin = new Date(year, firstMonth - 1, 1)
				,end = new Date(year, lastMonth - 1, lastDate);
			return {begin:begin,end:end};
			/**
			 * 返回当前的日期为第几季度
			 * @param date
			 * @returns {Number}
			 */
			function getMonth_Season(month){
				var result = 0;
				if(month <= 3){
					result = 1;
				}else if(month <= 6){
					result = 2;
				}else if(month <= 9){
					result = 3;
				}else if(month <= 12){
					result = 4;
				}
				return result;
			}
		},
		/**
		 * 三位一个逗号隔开的展现，保留s为小数
		 * @param s 数值
		 * @param n 保留小数位(默认保留2位)
		 * @returns {String}
		 */
		formatNumber: function(s, n){
			if(n == undefined || typeof n != 'number'){
				n = 2;
			}
			return NumberFormat.toThousands(s, n);
		},
		/**
		 * 三位一个逗号隔开展现，最大保留x为小数
		 * @param s 数值
		 * @param x 最大保留小数位
		 */
		formatNumberSpc: function(s, n){
			return NumberFormat.toThousands(s, n, true);
		},
		/**
		 * 转换为大写金额
		 * @param n 数值
		 * @returns {String}
		 */
		formatChinese: function(n){
			return NumberFormat.toChinese(n);
		},
		/**
		 * 解析一个字符串变成Date对象
		 * @param str
		 * @param pattern
		 * @returns {Date}
		 */
		"parseDate" : function(str,pattern){
			if(!str){
				return;
			}
			if(!pattern){
				pattern = DEFAULT_DATE_PATTERN;
			}
			var tmp = [],nms = [];
			var r = pattern.replace(/[y|M|d|H|m|s]+/g,function($0){
				tmp.push($0);
				return "(\\d+)";
			});
			var reg = new RegExp(r,"g");
			if(!reg.test(str)){
				alert("解析日期时间出错");
				return  null;
			}
			str.replace(reg,function(){
				nms = $.makeArray(arguments).slice(1,tmp.length+1);
			});
			var date = new Date();
			for(var i=0;i<tmp.length;i++){
				var k = tmp[i];
				var n = parseInt(nms[i],10);
				switch(k.charAt(0)){
					case 'y':{date.setFullYear(n);break;}
					case 'M':{date.setMonth(n-1);break;}
					case 'd':{date.setDate(n);break;}
					case 'H':{date.setHours(n);break;}
					case 'm':{date.setMinutes(n);break;}
					case 's':{date.setSeconds(n);break;}
					case 'S':{date.setMilliseconds(n);break;}
				}
			}
			return date;
		},
		
		/**
		 * 格式化Date
		 * @param {date} date
		 * @param {string} pattern
		 * @return {string}
		 */
		"formatDate" : function(date,pattern){
			if(!date){
				return;
			}
			if(!pattern){
				pattern = DEFAULT_DATE_PATTERN;
			}
			var result = pattern.replace(/[y|M|d|H|m|s]+/g,function($0){
				var value="",len = $0.length,c=$0.charAt(0);
				switch(c){
					case 'y':{value = date.getFullYear();break;}
					case 'M':{value = date.getMonth()+1;break;}
					case 'd':{value = date.getDate();break;}
					case 'H':{value = date.getHours();break;}
					case 'm':{value = date.getMinutes();break;}
					case 's':{value = date.getSeconds();break;}
					case 'S':{value = date.getMilliseconds();break;}
				}
				return _PrivateFuncs.formatDateNum(value,len);
			});
			return result;
		},
		/**
		 * 是否是身份证
		 */
		"isIDCard":function(idCard){
			return /^((1[1-5])|(2[1-3])|(3[1-7])|(4[1-6])|(5[0-4])|(6[1-5])|71|(8[12])|91)\d{4}((19\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(19\d{2}(0[13578]|1[02])31)|(19\d{2}02(0[1-9]|1\d|2[0-8]))|(19([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/.test(idCard);
		},
		/**
		 * 判断是否是正整数
		 * @param {string}
		 * @returns {Boolean}
		 */
		"isPlusInteger" : function(str){
			//包括零
			return /^(0|[1-9][0-9]*)$/.test(str) && str.length<11;
		},
		/**
		 * 判断是否是座机号码
		 * @param {string}phoneNum
		 * @return {boolean}
		 */
		"isPhone":function (phoneNum){
			return /^(\d{3,4}-?)?[1-9]\d{6,7}([-|转]\d{2,4})?$/.test(phoneNum);
			//return (new RegExp(/^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$/)).test(phoneNum);
		},
		/**
		 * 是否是手机号码
		 */
		"isMobile":function (mobileNum){
			return (new RegExp(/^((\(\d{3}\))|(\d{3}\-))?1[358]\d{9}$/)).test(mobileNum);
		},
		/**
		 * 是否是邮件
		 */
		"isMail" : function (mail){
			return (new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/)).test(mail);
		},
		/**
		 * 是否是URL
		 */
		"isURL":function (u){
			return (new RegExp(/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/)).test(u);
		},
		/**
		 * 是否是邮编
		 */
		"isZipCode":function (zipCode){
			return (new RegExp(/^[1-9]\d{5}$/)).test(zipCode);
		},
		//校验只能是数字
		"isDigits" : function(field) {
			return (new RegExp(/^[0-9]*$/)).test(field)&& field.length<=32;
		},
        /**
		 *
		 * @param {array|function}
		 * @description 快速排序
		 *
         */
		sort:function (array,fn) {
			var len = array.length;
			if(len<=1){
				return array;
			}
			var middleIndex = Math.floor(len/2);
			var middleVal = array[middleIndex];
			var leftArray = [],rightArray = [];
			$(array).each(function (index,item) {
                var r = fn(middleVal,item);
				if(r>=1){
					leftArray.push(item);
				}else if(r<0){
                   	rightArray.push(item);
				}else if(r==0&&index>middleIndex){
                    rightArray.push(item);
				}else if(r==0&&index<middleIndex){
                    leftArray.push(item);
                }
            })
			return App.utils.sort(leftArray,fn).concat(middleVal,App.utils.sort(rightArray,fn));
        }
	};



	/**
	 * 扩展jQuery匹配表达式
	 */
	function innerTextExactMatch(elem, text) {
		return (elem.textContent || elem.innerText || $(elem).text() || '').toLowerCase() === (text || '').toLowerCase();
	}
	
	$.expr[':'].innerTextExactMatch = $.expr.createPseudo?
		$.expr.createPseudo(function (text) {
			return function (elem) {
				return innerTextExactMatch(elem, text);
			};
		}) :
		function (elem, i, match) {
			return innerTextExactMatch(elem, match[3]);
	};
	/**
	 * 获取字符串长度(英文占1个字符，中文汉字占2个字符)
	 */
	String.prototype.gblen = function(){    
	    var len = 0;    
	    for (var i=0; i<this.length; i++) {    
	        if (this.charCodeAt(i)>127 || this.charCodeAt(i)==94) {    
	             len += 2;    
	         } else {    
	             len ++;    
	         }    
	     }    
	    return len;    
	}
	App.NumberFormat = NumberFormat;
	App.utils.addTreeBtn = function(node, btn){
		var nodeId = node.tId
			,btnId = nodeId + '_' +btn.id;
		if ($('#' + btnId).length>0) return;
		var $btn = $('<span class="button ' + btn.icon + '" id="' + 
				btnId + '" title="' + btn.title +
				'"></span>'); 
		$btn.on('click', function(e){
			btn.handler(node);
			e.stopPropagation();
		});
		$('#' + nodeId + '_span').after($btn);
	};
	return App.utils;
});
/**
 * 系统选项设置
 */
define('app/widgets/app-frags',["app/core/app-core"],function($A){
	$A.frags={
			//aoo.dialog
			dialogFrag:'<div class="dialog" id="${dialogId}" >'
					+'<div class="dialog-header" onselectstart="return false;" oncopy="return false;" onpaste="return false;" oncut="return false;">'
						+'<div class="closebg"><a class="close">×</a></div>'
						+'<h5>${title}</h5>'
					+'</div>'
				+'</div>'
			,
			//app.dialog
			dialogNoHeaderFrag:'<div class="dialog" id="${dialogId}" style="visibility:hidden;"></div>'
			,
			// app.dialog shadow
			dialogProxy:'<div id="dialogProxy" class="dialog dialogProxy">'
						//+'<div class="dialog-header" >'
						//+'<div class="closebg"></div>'
						//+'<h5></h5>'
						//+'</div>'
					+'</div>'
			,
			//other  fragment
			globalBodyFrag:'<!--遮盖屏幕-->'
				+'<div id="_alertBackground" class="alertBackground"></div>'
				+'<div id="_dialogMask" class="dialog-mask"></div>'
			,
			//app.alertMsg
			alertBoxFrag:'<div id="_alertMsgBox" class="alert"><div class="alertContent"><i class="${icon}"></i><span><a href="javascript:void(0)" onclick="$A.messager.toggleDetail();">${message}</a></span><tpl if=\"\'${detail}\'!=\'\'\"><div id="__alertDetails" class="alertDetail" style=\"display:none;\">${detail}</div></tpl></div><div class="alertFooter"><div class="btn-toolbar">${butFragment}</div></div></div>'
			,
			alertBoxFrag_NoDetail:'<div id="_alertMsgBox" class="alert"><div class="alertContent"><i class="${icon}"></i><span>${message}</span><tpl if=\"\'${detail}\'!=\'\'\"><div id="__alertDetails" class="alertDetail" style=\"display:none;\">${detail}</div></tpl></div><div class="alertFooter"><div class="btn-toolbar">${butFragment}</div></div></div>'
			,
			//tips
			tipsBoxFrag:'<div id="_tipsMsgBox" class="tips"><div class="tipsContent"><i class="${icon}"></i><span><a href="javascript:void(0)">${message}</a></span></div></div>'
			,
			alertButFrag:'<a class="btn #css#" rel="#callback#" onclick="$A.messager.close()" href="javascript:">#butMsg#</a>'
			,
			navTabCM:'<ul id="navTabCM">'
					+'<li rel="reload">刷新标签页</li>'
					+'<li rel="closeCurrent">关闭标签页</li>'
					+'<li rel="closeOther">关闭其它标签页</li>'
					+'<li rel="closeAll">关闭全部标签页</li>'
				+'</ul>'
			,
			dialogCM:'<ul id="dialogCM">'
					+'<li rel="closeCurrent">关闭弹出窗口</li>'
					+'<li rel="closeOther">关闭其它弹出窗口</li>'
					+'<li rel="closeAll">关闭全部弹出窗口</li>'
				+'</ul>'
			,
			externalFrag:'iframe src="{url}" style="width:100%;height:{height};" frameborder="no" border="0" marginwidth="0" marginheight="0"></iframe>'
			,
			statusCode_503:'服务器当前负载过大或者正在维护!'
			,
			validateFormError:'提交数据不完整，{0}个字段有错误，请改正后再提交!'
			,
			sessionTimout:'会话超时，请重新登录!'
			,
			alertSelectMsg:'请选择信息!'
			,
			forwardConfirmMsg:'继续下一步!'
			,
			mainTabTitle:'我的主页'
	};
	return $A.frags;
});
define('app/widgets/window/app-messager',["app/core/app-jquery","app/core/app-core","app/widgets/app-frags",localeFile],function($,$A,$frags,$lang) {
	var $msglang = $lang.messager;
	var that = null;
	that = {
			
		/**
		 * 消息框id
		 */
		_boxId: "#_alertMsgBox",
		
		/**
		 * Tips框ID
		 */
		_tipsId:"#_tipsMsgBox",
		
		/**
		 * 消息框背景
		 */
		_bgId: "#_alertBackground",
		
		/**
		 * 关闭时长
		 */
		_closeTimer: null,
		
		/**
		 * 消息类型
		 */
		_types: {error:"error", info:"info", warn:"warn", correct:"correct", confirm:"confirm"},

		/**
		 * 取得消息框标题
		 */
		_getTitle: function(key){
			return $msglang[key.toUpperCase()];
		},
		
		/**
		 * 按回车键事件
		 */
		_keydownOk: function(event){
			if (event.keyCode == $A.keyCode.ENTER) event.data.target.trigger("click");
		},
		
		/**
		 * 按取消键事件
		 */
		_keydownEsc: function(event){
			if (event.keyCode == $A.keyCode.ESC||event.keyCode == $A.keyCode.ENTER) event.data.target.trigger("click");
		},
		toggleDetail:function(){
			$('#__alertDetails').toggle();
			this.relayout();
		},
		relayout:function(){
			var $box=$(this._boxId);
			var pos = $box.attr("pos");
			if(pos == "top"){
				$box.css( {"left":($(window).width() - $box.width())/2 + "px","top":"0px"});
			}else if(pos=="bottom"){
				$box.css( {"bottom":"0px","right":"0px"});
			}else{
				$box.css( {"left":($(window).width() - $box.width())/2 + "px","top":($(window).height() - $box.height())/2 + "px"} );
			}
		},
		/**
		 * 打开消息框
		 * @param {Object} type 消息类型
		 * @param {Object} msg 消息内容
		 * @param {Object} buttons [button1, button2] 消息按钮
		 */
		_open: function(type, msg, buttons,pos){
			$(this._boxId).remove();
			var butsHtml = "";
			if (buttons) {
				for (var i = 0; i < buttons.length; i++) {
					var sRel = buttons[i].call ? "callback" : "";
					var css = buttons[i].css ? buttons[i].css : "";
					butsHtml += $frags["alertButFrag"].replace("#butMsg#", buttons[i].name).replace("#callback#", sRel).replace("#css#", css);
				}
			}
			var msgObj;
			if(typeof msg=="string"){
				msgObj=$A.jsonEval(msg);
			}else{
				msgObj=msg;
			}
			
			if(msgObj.message == null&&msgObj.detail==null){
				msgObj={
					type:type,
					icon:type,
					title:this._getTitle(type),
					message:msg,
					butFragment:butsHtml
				};
			}else{
				msgObj = $.extend({
					type:type,
					icon:type,
					title:this._getTitle(type),
					butFragment:butsHtml
				},msgObj);
			}
			var tpl = msgObj.detail?$frags["alertBoxFrag"]:$frags["alertBoxFrag_NoDetail"];
			
			var boxHtml = $template(tpl,msgObj);
			$(boxHtml).appendTo("body");
			var $box=$(this._boxId);
			$box.attr("pos",pos);
			this.relayout();
			
			if (this._closeTimer) {
				clearTimeout(this._closeTimer);
				this._closeTimer = null;
			}
			if (this._types.info == type || this._types.correct == type){
				this._closeTimer = setTimeout(function(){that.close();}, 3500);
			} else {
				$(this._bgId).show();
			}
			
			var jButs = $(this._boxId).find("a.btn");
			var jCallButs = jButs.filter("[rel=callback]");
			var jDoc = $(document);
			for (var i = 0; i < buttons.length; i++) {
				if (buttons[i].call) jCallButs.eq(i).click(buttons[i].call);
				if (buttons[i].keyCode == $A.keyCode.ENTER) {
					jDoc.bind("keydown",{target:jButs.eq(i)}, this._keydownOk);
				}
				if (buttons[i].keyCode == $A.keyCode.ESC) {
					jDoc.bind("keydown",{target:jButs.eq(i)}, this._keydownEsc);
				}
			}
			return $box;
		},
		
		/**
		 * 关系消息框
		 */
		close: function(fadeSpeed){
			$(document).unbind("keydown", this._keydownOk).unbind("keydown", this._keydownEsc);
			$msgBox = $(this._boxId);
			//var pos = $msgBox.attr("pos");
			if(fadeSpeed){
				$msgBox.fadeOut(fadeSpeed,function(){
					$msgBox.remove();
				});
			}else{
				$msgBox.hide();
				setTimeout(function(){
						$msgBox.remove();
				}, 500);
				$(this._bgId).hide();
			}
			
		},
		
		/**
		 * 打开错误消息框
		 */
		error: function(msg, options) {
			this._alert(this._types.error, msg, options);
		},
		
		/**
		 * 打开普通消息框
		 */
		info: function(msg, options) {
			this._alert(this._types.info, msg, options,"bottom");
		},
		
		/**
		 * 打开警告消息框
		 */
		warn: function(msg, options) {
			this._alert(this._types.warn, msg, options);
		},
		
		/**
		 * 打开成功消息框
		 */
		correct: function(msg, options) {
			this._tips(this._types.correct, msg, options,"center");
		},
		
		/**
		 * 打开消息框
		 */
		_alert: function(type, msg, options,pos) {
			
			var op = {okName:$msglang.OK, okCall:null,okCss:"btn-primary singlebtn"};
			$.extend(op, options);
			var buttons = [
				{name:op.okName, call: op.okCall, keyCode:$A.keyCode.ENTER,css:op.okCss}
			];
			var $dlg=this._open(type, msg, buttons,pos);
			$("a",$dlg).focus();
		},
		
		_tips:function(type,msg,options,pos){
			$(this._tipsId).remove();
			var msgObj = {
					"icon":type,
					"message":msg
			};
			
			options = options||{};
			var displayTime = options.displayTime || 1500;//默认两秒
			var fadeSpeed = options.fadeSpeed || 800;//默认两秒
			
			var tpl = $frags["tipsBoxFrag"];
			var boxHtml = $template(tpl,msgObj);
			
			$(boxHtml).appendTo("body");
			
			var $box=$(this._tipsId);
			$box.show();
			$box.attr("pos",pos);
			var pos = $box.attr("pos");
			if(pos == "top"){
				$box.css( {"left":($(window).width() - $box.width())/2 + "px","top":"0px"});
			}else if(pos=="bottom"){
				$box.css( {"bottom":"0px","right":"0px"});
			}else{
				$box.css( {"left":($(window).width() - $box.width())/2 + "px","top":45 + "px"} );
			}
			$box.show();
			setTimeout(function(){
/*				$box.fadeOut(fadeSpeed,function(){
					$box.remove();
				});*/
				$box.animate({
					"top":"-=38",
					"opacity":0
				},fadeSpeed,function(){
					$box.remove();
				});
				
			},displayTime);
		},
		
		/**
		 * 打开确认消息框
		 * @param {Object} msg 消息内容
		 * @param {Object} options {okName, okCal, cancelName, cancelCall} 按钮
		 */
		confirm: function(msg, options) {
			var op = {okName:$msglang.OK, okCall:null,okCss:"btn-primary", cancelName:$msglang.CANCEL, cancelCall:null,button:null};
			$.extend(op, options);

			var _self=this;
			/*
			var buttons = [
				{name:op.okName, call: op.okCall, keyCode:$A.keyCode.ENTER,css:op.okCss},
				{name:op.cancelName, call: op.cancelCall, keyCode:$A.keyCode.ESC}
			];
			*/
			//暂时去掉热键
			var buttons = [
				{name:op.okName, call: op.okCall, css:(op.button&&op.button==_self.BUTTONS.OK)?op.okCss:""},
				{name:op.cancelName, call: op.cancelCall, keyCode:$A.keyCode.ESC,css:((!op.button)||op.button==_self.BUTTONS.CANCEL)?op.okCss:""}
			];
			this._open(this._types.confirm, msg, buttons);
		},
		BUTTONS:{
		  OK:'OK',
		  CANCEL:'CANCEL'
		}
	};
	$A.messager = that;
	return $A.messager;
});


/**
 * 系统选项设置
 */
define('app/core/app-options',["app/core/app-core",localeFile],function(App,AppLang){
	App.options={
		/**
		 * app控件的默认值
		 */
		appDefaults:{
			xquery:{
				className: 'xquery'
			},
			XqueryBox:{
				className: 'app-xquerybox'
			},
			Textbox: {
				/**
				 * 隐藏值
				 * @memberof textbox-class
				 * @property {String} [value] 值
				 */
				value: '',
				/**
				 * 显示值
				 * @memberof textbox-class
				 * @property {String} [text] 显示值
				 */
				text: '',
				/**
				 * 可输入的最长字符数
				 * @memberof textbox-class
				 * @property {Number} [maxLength] 字符数
				 */
				maxLength: null,
				/**
				 * 只读状态
				 * @memberof textbox-class
				 * @property {Boolean} [readonly=false] 只读状态
				 */
				readonly: false,
				/**
				 * 禁用状态
				 * @memberof textbox-class
				 * @property {Boolean} [disabled=false] 禁用状态
				 */
				disabled: false,
				/**
				 * 控件的宽度
				 * @property {Number|String} [width] 宽度
				 * @todo 默认由css控制
				 * @todo 可以指定具体像素宽度[px] eg.150px
				 * @todo 也可以指定百分比宽度[%]，百分比宽度为相对于父级元素的宽度 eg.100%
				 * @memberof textbox-class
				 */
				width: '',
				/**
				 * 显示值文本框的css样式
				 * @memberof textbox-class
				 * @property {Style} [style] 显示值文本框的css样式
				 * @example &lt;input &#9;class="app-textbox"
				 * &#9;style="color:red;text-align:center;"
				 * &#9;_options="{value:'德国 Germany'}"
				 * />
				 */
				style: '',
				/**
				 * 包装器的css样式
				 * @memberof textbox-class
				 * @property {Style} [wrapstyle] 包装器的css样式
				 * @example &lt;input &#9;class="app-textbox"
				 * &#9;wrapstyle="height:60px;"
				 * />
				 */
				wrapstyle: '',
				/**
				 * 显示值是否为多行文本框
				 * @memberof textbox-class
				 * @property {Boolean} [multiline=false] 多行
				 * @example &lt;input &#9;class="app-textbox"
				 * &#9;wrapstyle="height:60px;"
				 * &#9;multiline="true"
				 * />
				 */
				multiline: false,
				/**
				 * 是否显示清除按钮
				 * <PRE>多选状态 默认为true</PRE>
				 * @memberof textbox-class
				 * @property {Boolean} [clearbtn=false] 显示清除按钮
				 */
				clearbtn: false,
				/**
				 * 辅助提示信息
				 * @memberof textbox-class
				 * @property {String} [tips] 辅助提示信息
				 */
				tips: '',
				/**
				 * <span class="type-signature static">使用时 需考虑输入法影响键码</span>
				 * 定义如何筛选按下的键，如果为自定义事件 返回false阻止输入
				 * <PRE>内置过滤类型
				 * positiveNumber: 只允许输入 0-9，小数点
				 * number: 只允许输入 0-9，小数点，正负号
				 * 0-9：只允许输入 0-9
				 * all：任意输入
				 * </PRE>
				 * @memberof textbox-class
				 * @property {String|Function} [filter] 键盘输入的过滤器
				 */
				filter: null,
				/**
				 * <span class="type-signature static">该属性与filter属性只能设置一个，当设置forbidWord时，filter失效</span>
				 * 禁止输入的字符
				 * @memberof textbox-class
				 * @property {String} [forbidWord] 禁止输入的字符
				 */
				forbidWord: null,
				/**
				 * <span class="type-signature static">该属性与filter属性只能设置一个，当设置permitWord时，filter失效</span>
				 * 允许输入的字符
				 * @memberof textbox-class
				 * @property {String} [permitWord] 允许输入的字符
				 */
				permitWord: null,
				/**
				 * 是否去除前后空格
				 * @memberof textbox-class
				 * @property {Boolean} [trim=true] 去除
				 */
				trim: true,
				className: 'app-textbox'
			},
			Combo: {
				/**
				 * 数据对象中作为隐藏值的属性名
				 * @memberof combo-class
				 * @property {String} [valuefield=id] 隐藏值属性名
				 */
				valuefield: 'id',
				/**
				 * 数据对象中作为显示值的属性名
				 * @memberof combo-class
				 * @property {String} [textfield=name] 显示值属性名
				 */
				textfield: 'name',
				/**
				 * 查询参数
				 * <PRE>
				 * 	如果值为Function,如果要想置空查询条件，则必须返回{}对象
				 * </PRE>
				 * @memberof combo-class
				 * @property {Json|Function} [parameter] 查询参数
				 * @example &lt;input &#9;class="app-combobox"
				 * &#9;_options="{
				 * &#9;&#9;parameter: {param:'paramVal'},
				 * &#9;&#9;valuefield: 'value',
				 * &#9;&#9;textfield: 'text'
				 * &#9;&#9;action: 'html/example/app-input/data/data.valueAndText'
				 * &#9;}"
				 * />
				 */
				parameter: null,
				/**
				 * 自动隐藏打开按钮
				 * @memberof combo-class
				 * @property {Boolean} [autoHideOpenBtn=false] 不自动隐藏
				 */
				autoHideOpenBtn: false,
				/**
				 * 是否自动隐藏下拉面板
				 * @memberof combo-class
				 * @property {Boolean} [fadeout=false] 不自动
				 */
				fadeout: false,
				/**
				 * 下拉面板的宽度
				 * @todo 宽度默认为空，继承至input组件的宽度
				 * @todo 可以指定具体像素宽度[px] eg.250
				 * @todo 也可以指定百分比宽度[%]，百分比宽度为相对于面板所属的组件宽度 eg. 150%
				 * @memberof combo-class
				 * @property {Number|String} [panelwidth] 下拉面板的宽度
				 */
				panelwidth: '',
				/**
				 * 面板高度
				 * @memberof combo-class
				 * @property {Number} [panelheight=265] 下拉面板的高度
				 */
				panelheight: 265,
				/**
				 * 自定义面板高度
				 * @memberof combo-class
				 * @property {Number} [customPanelHeight=0] 高度
				 */
				customPanelHeight: 0,
				/**
				 * 自定义面板在主面板的相对位置
				 * top 上边
				 * bottom 下边
				 * @memberof combo-class
				 * @property {String} [customPanelPosition=bottom]
				 */
				customPanelPosition: 'bottom',
				/**
				 * <span class="type-signature static">override</span>
				 * 是否拥有一个打开按钮
				 * @memberof combo-class
				 * @property {Boolean} [openbtn=true] 拥有打开按钮
				 */
				openbtn: true,
				/**
				 * 格式化配置
				 * <PRE>
				 * 函数类型：eg.function(node){ return node.code + '-' + node.name ;}
				 * 通过setSelectedNode方法设置时，调用该函数进行格式化
				 * 该函数接收选中节点作为参数，返回一个字符串作为显示值
				 * 字符串类型：eg. code
				 * 指定一个实体的属性
				 * 表达式类型：eg.{code}-{name}
				 * 使用{}包裹字段并使用实体进行替换
				 * </PRE>
				 * @memberof combo-class
				 * @property {Function|String} [formatter=null] 格式化配置
				 */
				formatter: null,
				/**
				 * 打开下拉面板
				 * @memberof combo-class
				 * @property {Array} keyShowPanel=[{keyCode:App.keyCode.DOWN, ctrlKey:true}
				 * 				,{keyCode:App.keyCode.UP, ctrlKey:true}] 按键值数组
				 */
				keyShowPanel: [{keyCode:App.keyCode.DOWN, ctrlKey:true}
								,{keyCode:App.keyCode.UP, ctrlKey:true}],
				/**
				 * 打开下拉面板
				 * @memberof combo-class
				 * @property {Array} keyHidePanel=[App.keyCode.ESC,App.keyCode.TAB] 按键值数组
				 */
				keyHidePanel: [App.keyCode.ESC, App.keyCode.TAB],
				/**
				 * 定位下一个节点
				 * @memberof combo-class
				 * @property {Array} keyNextNode=[App.keyCode.DOWN] 按键值数组
				 */
				keyNextNode: [App.keyCode.DOWN],
				/**
				 * 定位上一个节点
				 * @memberof combo-class
				 * @property {Array} keyPrevNode=[App.keyCode.UP] 按键值数组
				 */
				keyPrevNode: [App.keyCode.UP],
				/**
				 * 选中当前节点
				 * @memberof combo-class
				 * @property {Array} keyPrevNode=[App.keyCode.ENTER] 按键值数组
				 */
				keyPickNode: [App.keyCode.ENTER],
				className: 'app-combo'
			},
			Combobox: {
				/**
				 * 要加载数据的url，也可以通过action设置
				 * @memberof combobox-class
				 * @property {Url} [url] url数据源
				 */
				url: '',
				/**
				 * 是否允许多选
				 * @memberof combobox-class
				 * @property {Boolean} [multiple=false] 多选
				 * />
				 */
				multiple: false,
				/**
				 * 本地数据源，
				 * 当配置该属性时，优先使用该数据源 并忽略action
				 * @memberof combobox-class
				 * @property {Json} [data] 本地数据源
				 */
				data: null,
				/**
				 * <span class="type-signature static">override</span>
				 * 下拉面板高度
				 * @memberof combobox-class
				 * @property {Number} [panelheight=242] 下拉面板的高度
				 */
				panelheight: 242,
				/**
				 * 定位下一个节点
				 * @memberof combobox-class
				 * @property {Array} keyNextNode=[App.keyCode.DOWN,App.keyCode.RIGHT] 按键值数组
				 */
				keyNextNode: [App.keyCode.DOWN,App.keyCode.RIGHT],
				/**
				 * 定位上一个节点
				 * @memberof combobox-class
				 * @property {Array} keyPrevNode=[App.keyCode.UP,App.keyCode.LEFT] 按键值数组
				 */
				keyPrevNode: [App.keyCode.UP,App.keyCode.LEFT],
				/**
				 * 允许联想
				 * @memberof combobox-class
				 * @property {Boolean} [usesuggest=false] 允许联想
				 */
				usesuggest: false,
				/**
				 * 是否允许删除节点
				 * @memberof combobox-class
				 * @property {Boolean} [nodeDelete=false] 不允许
				 */
				nodeDelete: false,
				/**
				 * 是否允许按键可清除值
				 * @memberof combobox-class
				 * @property {Boolean} [clearable=true] 允许
				 */
				clearable: true,
				className: 'app-combobox'
			},
			Comboztree: {
				/**
				 * 要加载数据的url，也可以通过action设置
				 * @memberof comboztree-class
				 * @property {Url} [url] url数据源
				 */
				url: '',
				/**
				 * 异步加载子节点的url地址 当[async = true 时生效]
				 * @memberof comboztree-class
				 * @property {Url} [asyncUrl] asyncUrl
				 */
				asyncUrl: '',
				/**
				 * 只能选择叶子节点
				 * @memberof comboztree-class
				 * @property {Boolean} [onlyleaf=false] 只能选择叶子节点
				 */
				onlyleaf: false,
				/**
				 * 是否独自选择节点 当multiple为true时 有效
				 * @todo 勾选父节点时勾选子节点
				 * @todo 取消勾选父节点时取消勾选子节点
				 * @todo 子节点全部勾选时是勾选父节点
				 * @todo 子节点全部取消勾选时是取消勾选父节点
				 * @memberof comboztree-class
				 * @property {Boolean} [checkBySelf=false] 关联选择
				 */
				checkBySelf: false,
				/**
				 * 远程数据，次级节点异步加载设置
				 * @memberof comboztree-class
				 * @property {Boolean} [async=true] 是否异步加载节点
				 */
				async: true,
				/**
				 * 设置 树 是否显示节点的图标
				 * @memberof comboztree-class
				 * @property {Boolean} [showIcon=false] true / false 分别表示 显示 / 隐藏 图标
				 */
				showIcon: false,
				/**
				 * 是否允许多选
				 * @memberof comboztree-class
				 * @property {Boolean} [multiple=false] 多选
				 */
				multiple: false,
				/**
				 * 节点唯一标识的属性名称
				 * 默认和valuefield相同
				 * @memberof comboztree-class
				 * @property {String} [idfield=null] 节点唯一标识的属性名称
				 */
				idfield: null,
				/**
				 * 节点数据中保存其父节点唯一标识的属性名称
				 * @memberof comboztree-class
				 * @property {String} [pidfield=pId] 父节点唯一标识的属性名称
				 */
				pidfield: 'pId',
				/**
				 * 用于修正根节点父节点数据，即 pIdKey 指定的属性值
				 * @memberof comboztree-class
				 * @property {String} [rootpidvalue=''] 根节点属性值
				 */
				rootpidvalue: '',
				/**
				 * 异步加载时需要自动提交父节点属性的参数
				 * @todo 将需要作为参数提交的属性名称，制作成 Array 即可，例如：["id", "name"]
				 * @todo 可以设置提交时的参数名称，例如 server 只接受 zId : ["id=zId"]
				 * @memberof comboztree-class
				 * @property {String} [rootpidvalue=''] 根节点属性值
				 * @example <PRE>&lt;input &#9;class="app-comboztree"
				 * &#9;_options="{
				 * &#9;&#9;action: 'platform/sample/base/ui/treeJson.do',
				 * &#9;&#9;autoparam: 'id,name'
				 * &#9;}"
				 * /></PRE>  假设 异步加载 父节点(node = {id:1, name:"test"}) 的子节点时，将提交参数 id=1&name=test
				 * @example <PRE>&lt;input &#9;class="app-comboztree"
				 * &#9;_options="{
				 * &#9;&#9;action: 'platform/sample/base/ui/treeJson.do',
				 * &#9;&#9;autoparam: 'id=zId,name'
				 * &#9;}"
				 * /></PRE>  假设 异步加载 父节点(node = {id:1, name:"test"}) 的子节点时，将提交参数 zId=1&name=test
				 */
				autoparam: null,
				/**
				 * 异步加载时子节点时，要提交的静态参数
				 * @memberof comboztree-class
				 * @example <PRE>&lt;input &#9;class="app-comboztree"
				 * &#9;_options="{
				 * &#9;&#9;action: 'platform/sample/base/ui/treeJson.do',
				 * &#9;&#9;otherParam: {dataSet: 'bank'}
				 * &#9;}"
				 * /></PRE>
				 */
				otherParam: null,
				/**
				 * 允许联想
				 * @memberof comboztree-class
				 * @property {Boolean} [usesuggest=false] 允许联想
				 */
				usesuggest: false,
				/**
				 * <span class="type-signature static">override</span>
				 * 下拉面板的高度
				 * @memberof comboztree-class
				 * @property {Number} [panelheight=232] 下拉面板的高度
				 */
				panelheight: 232,
				/**
				 * 对值进行优化，该参数只针对multiple = true 时，有效
				 * @todo 忽略半勾选节点
				 * @todo 并当父节点被全选时，子节点不作为值
				 * @memberof comboztree-class
				 * @property {Boolean} [shrinkValue=true] 默认进行优化值
				 */
				shrinkValue: true,
				/**
				 * 忽略半勾选节点
				 * @memberof comboztree-class
				 * @property {Boolean} [ignoreHalfCheck=true] 默认忽略
				 */
				ignoreHalfCheck: true,
				/**
				 * 进行本地高亮匹配检索时的延迟检索时间(ms)
				 * @memberof comboztree-class
				 * @property {Number} [lazy=300] 延迟检索时间(毫秒)
				 */
				lazy: 300,
				/**
				 * 定位到子节点
				 * @memberof comboztree-class
				 * @property {Array} keyChildNode=[App.keyCode.RIGHT] 按键值数组
				 */
				keyChildNode: [App.keyCode.RIGHT],
				/**
				 * 定位到父节点
				 * @memberof comboztree-class
				 * @property {Array} keyParentNode=[App.keyCode.LEFT] 按键值数组
				 */
				keyParentNode: [App.keyCode.LEFT],
				className: 'app-comboztree'
			},
			Reference: {
				/**
				 * 数据对象中作为隐藏值的属性名
				 * @memberof reference-class
				 * @property {String} [valuefield=id] 隐藏值属性名
				 */
				valuefield: 'id',
				/**
				 * 数据对象中作为显示值的属性名
				 * @memberof reference-class
				 * @property {String} [textfield=name] 显示值属性名
				 */
				textfield: 'name',
				/**
				 * 弹出对话框的标题
				 * @memberof reference-class
				 * @property {Boolean} [title=对话框] 标题
				 */
				title: '对话框',
				/**
				 * 显示标题栏
				 * @memberof reference-class
				 * @property {Boolean} [hasheader=true] 显示标题栏
				 */
				hasheader: true,
				/**
				 * 对话框的宽度，null则会自适应
				 * @memberof reference-class
				 * @property {Number} [digWidth=null] 宽度
				 */
				digWidth: null,
				/**
				 * 对话框的高度，null则会自适应
				 * @memberof reference-class
				 * @property {Number} [digHeight=null] 高度
				 */
				digHeight: null,
				/**
				 * <span class="type-signature static">override</span>
				 * 是否拥有一个清除按钮
				 * @memberof reference-class
				 * @property {Boolean} [clearbtn=true] 拥有清除按钮
				 */
				clearbtn: true,
				/**
				 * <span class="type-signature static">override</span>
				 * 是否拥有一个打开按钮
				 * @memberof reference-class
				 * @property {Boolean} [openbtn=true] 拥有打开按钮
				 */
				openbtn: true,
				/**
				 * 对话框的url
				 * @memberof reference-class
				 * @property {URL} [url=null] 对话框的url
				 */
				url: null,
				className: 'app-reference'
			},
			Suggest: {
				/**
				 * <span class="type-signature static">override</span>
				 * 面板高度 该面板为固定高度
				 * @memberof suggest-class
				 * @property {Number} [panelheight=242] 下拉面板的高度
				 */
				panelheight: 242,
				/**
				 * 联想面板内 已选结果面板的高度
				 * @memberof suggest-class
				 * @property {Number} [slt_area=30] 已选框的高度
				 */
				slt_area: 30,
				/**
				 * 联想地址，该属性优先于action
				 * @memberof suggest-class
				 * @property {String} [suggest] 联想地址
				 */
				suggest: '',
				/**
				 * 联想过滤时使用的匹配属性，多个属性使用,分隔
				 * <PRE>
				 * 当没有配置该属性时，默认使用textfield
				 * 远程联想时 可以通过_key接收输入的搜索关键字、suggestfield接收该字段的配置
				 * </PRE>
				 * @memberof suggest-class
				 * @property {String} [suggestfield] 匹配属性
				 */
				suggestfield: '',
				/**
				 * 是否远程加载，该属性优先于async
				 * false：第一次根据suggest进行远程加载作为数据源，此后根据本地数据源进行联想匹配
				 * true: 如果为true，则每次根据suggest去后台匹配数据
				 * @memberof suggest-class
				 * @property {Boolean} [remote=false] 每次远程联想
				 */
				remote: false,
				/**
				 * 进行联想的延迟检索时间(ms)
				 * @memberof suggest-class
				 * @property {Number} [lazy=500] 远程搜索时间（毫秒）
				 */
				lazy: 500,
				/**
				 * 是否允许多选
				 * @memberof suggest-class
				 * @property {Boolean} [multiple=false] 多选
				 */
				multiple:false,
				/**
				 * 接受输入的内容作为值
				 * @memberof suggest-class
				 * @property {Boolean} [acceptText=false] 不接受
				 */
				acceptText: false,
				/**
				 * 联想清值，该属性设置只在单选模式生效
				 * @memberof suggest-class
				 * @property {Boolean} [suggestClear=false] 联想时是否清值
				 */
				suggestClear: false,
				/**
				 * 切换到已选区域，定位下一个已选择节点
				 * @memberof suggest-class
				 * @property {Array} keyNextSltNode=[App.keyCode.RIGHT] 按键值数组
				 */
				keyNextSltNode: [App.keyCode.RIGHT],
				/**
				 * 切换到已选区域，定位上一个已选择节点
				 * @memberof suggest-class
				 * @property {Array} keyPrevSltNode=[App.keyCode.LEFT] 按键值数组
				 */
				keyPrevSltNode: [App.keyCode.LEFT],
				className: 'app-suggest'
			},
			Typeahead: {
				/**
				 * 联想地址
				 * @memberof typeahead-class
				 * @property {String} [suggest] 联想地址
				 */
				suggest: '',
				/**
				 * 是否远程加载
				 * false：第一次根据suggest进行远程加载作为数据源，此后根据本地数据源进行联想匹配
				 * true: 如果为true，则每次根据suggest去后台匹配数据
				 * @memberof typeahead-class
				 * @property {Boolean} [remote=false] 每次远程联想
				 */
				remote: false,
				/**
				 * 进行联想的延迟检索时间(ms)
				 * @memberof typeahead-class
				 * @property {Number} [lazy=500] 远程搜索时间（毫秒）
				 */
				lazy: 500,
				/**
				 * 定位下一个节点
				 * @memberof typeahead-class-class
				 * @property {Array} keyNextNode=[App.keyCode.DOWN,App.keyCode.RIGHT] 按键值数组
				 */
				keyNextNode: [App.keyCode.DOWN,App.keyCode.RIGHT],
				/**
				 * 定位上一个节点
				 * @memberof typeahead-class-class
				 * @property {Array} keyPrevNode=[App.keyCode.UP,App.keyCode.LEFT] 按键值数组
				 */
				keyPrevNode: [App.keyCode.UP,App.keyCode.LEFT],
				className: 'app-typeahead'
			},
			Money: {
				/**
				 * 数值的小数位
				 * @memberof money-class
				 * @property {Number} [precision=2] 保留2位小数
				 */
				precision: 2,
				/**
				 * 格式化函数
				 * <PRE>
				 * 该函数接收当前输入的值，并返回一个字符串作为显示值
				 * 内置格式化方法
				 * 大写金额：chinese
				 * 千分位金额：thousand
				 * </PRE>
				 * @memberof money-class
				 * @property {String|Function} [formatter] 格式化函数
				 */
				formatter: 'thousand',
				/**
				 * <span class="type-signature static">override</span>
				 * 定义如何筛选按下的键，返回true接受输入
				 * <PRE>内置过滤类型
				 * positiveNumber: 只允许输入 0-9，小数点
				 * number: 只允许输入 0-9，小数点，正负号
				 * 0-9：只允许输入 0-9
				 * all：任意输入
				 * </PRE>
				 * @memberof money-class
				 * @property {String|Function} [filter='number'] 键盘输入的过滤器
				 */
				filter: 'number',
				/**
				 * 前缀(只针对千分法)
				 * @memberof money-class
				 * @property {String} [prefix=¥] 前缀
				 */
				prefix: '¥',
				className: 'app-money'
			},
			Number: {
				/**
				 * 最小值  组件允许接受的最小值
				 * @memberof number-class
				 * @property {Number} [min=null] 最小值
				 */
				min: null,
				/**
				 * 最大值  组件允许接受的最大值
				 * @memberof number-class
				 * @property {Number} [max=null] 最大值
				 */
				max: null,
				/**
				 * 不定长精度
				 * <PRE>
				 * 	false：为定长的进度，即精度为几位，则保留几位小数
				 * 	true：为不定长的进度，即输入的进度为几位，则最大保留到几位，此时precision代表最大精度
				 * </PRE>
				 * @memberof number-class
				 * @property {Number} [varlen=false] 变长精度
				 */
				varlen: false,
				/**
				 * 精度
				 * @memberof number-class
				 * @property {Number} [precision=0] 保留0位小数
				 */
				precision: 0,
				/**
				 * 前缀
				 * @memberof number-class
				 * @property {String} [prefix=''] 前缀
				 */
				prefix: '',
				/**
				 * 后缀
				 * @memberof number-class
				 * @property {String} [suffix=''] 后缀
				 */
				suffix: '',
				/**
				 * <span class="type-signature static">override</span>
				 * 定义如何筛选按下的键，返回true接受输入
				 * <PRE>内置过滤类型
				 * number: 只允许输入 0-9，小数点，正负号
				 * 0-9：只允许输入 0-9
				 * all：任意输入
				 * </PRE>
				 * @memberof number-class
				 * @property {String|Function} [filter='number'] 键盘输入的过滤器
				 */
				filter: 'number',
				/**
				 * 定义格式化输出显示值。返回的字符串值，会显示在输入框中
				 * <PRE>内置格式化方法
				 * 大写金额：chinese
				 * 千分位金额：thousand
				 * </PRE>
				 * @memberof number-class
				 * @property {String|Function} [formatter] 格式化函数
				 */
				formatter: null,
				/**
				 * 当值为0时 显示为空
				 * @memberof number-class
				 * @property {String|Function} [zeroIsNull=false] 0显示为0
				 */
				zeroIsNull: false,
				className: 'app-number'
			},
			DateTime: {
				/**
				 * <span class="type-signature static">override</span>
				 * 是否拥有一个打开按钮
				 * @memberof datetime-class
				 * @property {Boolean} [openbtn=true] 拥有打开按钮
				 */
				openbtn: true,
				/**
				 * 是否只能选择
				 * @memberof datetime-class
				 * @property {Boolean} [onlySelect=false] 可以选择和输入
				 */
				onlySelect: false,
				/**
				 * 日期时间框类型
				 * <PRE>
				 * type可选类型：
				 * year: 年  eg. 2014
				 * month: 月  eg. 12
				 * year-month: 年月 eg. 2014-12
				 * date: 年月日  eg. 2014-12-12
				 * datetime: 年月日时分  eg. 2014-12-12 12:12
				 * hour-minute: 时分  eg. 12:12
				 * hour: 时  eg. 12
				 * minute: 分  eg. 12
				 * </PRE>
				 * @memberof datetime-class
				 * @property {String} [type=date] 类型
				 */
				type: 'date',
				/**
				 * 显示值的日期时间格式化串
				 * <PRE>
				 * p, P, h, hh, i, ii, s, ss, d, dd, m, mm, M, MM, yy, yyyy 的任意组合。
				 * p : 小写的 ('am' or 'pm') - 根据区域文件
				 * P : 大写的 ('AM' or 'PM') - 根据区域文件
				 * s : 10以下不用0填充首位的秒数
				 * ss : 2位秒数显示，10以下用0填充首位
				 * i : 10以下不用0填充首位的分数
				 * ii : 2位分数显示，10以下用0填充首位
				 * h : 10以下不用0填充首位的时数 - 24小时制
				 * hh : 2位时数显示，10以下用0填充首位 - 24小时制
				 * H : 10以下不用0填充首位的时数 - 12小时制
				 * HH : 2位时数显示，10以下用0填充首位 - 12小时制
				 * d : 10以下不用0填充首位的日期
				 * dd : 2位日期显示，10以下用0填充首位
				 * m : 10以下不用0填充首位的月份
				 * mm : 2位月份显示，10以下用0填充首位
				 * M : 月份的短文本表示，前三个字母
				 * MM : 月份的全文本表示，如 January or March
				 * yy : 2位年份显示
				 * yyyy : 4位年份显示
				 * </PRE>
				 * @memberof datetime-class
				 * @property {String} [format=yyyy-mm-dd] 格式化串
				 */
				format: 'yyyy-mm-dd',
				/**
				 * 隐藏值的日期时间格式化串，具体方式参照显示值格式化
				 * @memberof datetime-class
				 * @property {String} [valueFormat] 格式化串
				 */
				valueFormat: null,
				/**
				 * 语言
				 * @memberof datetime-class
				 * @property {String} [language=zh_CN] 语言
				 */
				language: AppLang.locale,
				/**
				 * 一周从哪一天开始。0（星期日）到6（星期六）
				 * @memberof datetime-class
				 * @property {String} [weekStart=1] 一周从哪一天开始
				 */
				weekStart: 1,
				/**
				 * 当选择一个日期之后是否立即关闭此日期时间选择器
				 * @memberof datetime-class
				 * @property {Boolean} [autoclose=true] 自动关闭
				 */
				autoclose: true,
				/**
				 * 是否显示今天按钮
				 * <PRE>
				 * 如果此值为true 或 "linked"，
				 * 		则在日期时间选择器组件的底部显示一个 "Today" 按钮用以选择当前日期。
				 * 如果是true的话，"Today" 按钮仅仅将视图转到当天的日期.
				 * 如果是"linked"，当天日期将会被选中
				 * </PRE>
				 * @memberof datetime-class
				 * @property {Boolean} [todayBtn=true] 显示今天按钮
				 */
				todayBtn: true,
				/**
				 * 高亮当前日期
				 * @memberof datetime-class
				 * @property {Boolean} [todayHighlight=true] 高亮当前日期
				 */
				todayHighlight: true,
				/**
				 * 日期时间选择器打开之后首先显示的视图。
				 * <PRE>可接受的值
				 * 0 小时视图
				 * 1 日期视图
				 * 2 月视图
				 * 3 年视图
				 * 4 十年视图
				 * </PRE>
				 * @memberof datetime-class
				 * @property {Number} [startView=2] 起始视图
				 */
				startView: 2,
				/**
				 * 日期时间选择器所能够提供的最精确的时间选择视图。
				 * <PRE>
				 * 可接受的值
				 * 0 小时视图
				 * 1 日期视图
				 * 2 月视图
				 * 3 年视图
				 * 4 十年视图
				 * </PRE>
				 * @memberof datetime-class
				 * @property {Number} [minView=2] 结束视图
				 */
				minView: 2,
				className: 'app-datetime'
			},
			Grid: {
				/**
				 * 要加载数据的url，也可以通过action设置
				 * @memberof grid-class
				 * @property {Url} [url] url数据源
				 */
				url: '',
				/**
				 * 网格的标题
				 * @memberof grid-class
				 * @property {String|Number} [title] 网格标题
				 */
				title: '',
				/**
				 * 标题行高
				 * @memberof grid-class
				 * @property {Number} [headRowHeight] 标题行高
				 */
				headRowHeight: 28,
				/**
				 * 斑马条纹
				 * @memberof grid-class
				 * @property {Boolean} [striped=true] 斑马条纹
				 */
				striped: true,
				/**
				 * 工具条最大高度(px)
				 * @memberof grid-class
				 * @property {Number} [toolbarHeight=33] 工具条最大高度
				 */
				toolbarHeight: 33,
				/**
				 * 工具条
				 * @memberof grid-class
				 * @property {Array} [toolbar] 工具条
				 * @property {String} [toolbar.text] 按钮标题
				 * @property {String} [toolbar.iconCls] 按钮样式
				 * @property {Function} [toolbar.handler] 按钮操作
				 */
				toolbar: null,
				/**
				 * 表格主键
				 * @memberof grid-class
				 * @property {String} [idField=id] 表格主键
				 */
				idField: 'id',
				/**
				 * 是否生成隐藏列的内容数据
				 * @todo 不生成内容数据的表格不能使用将初始为隐藏列设置为显示功能
				 * @memberof grid-class
				 * @property {Boolean} [hiddenColumnInit=false] 不生成
				 */
				hiddenColumnInit: false,
				/**
				 * 网格的宽度
				 * <PRE>宽度默认为空：撑满整个父容器</PRE>
				 * @memberof grid-class
				 * @property {Number} [width] 宽度
				 */
				width: null,
				/**
				 * 网格的高度
				 * <PRE>
				 * 1、高度默认为空：撑满整个父容器
				 * 2、当值为push时，高度随着数据的变化而变化
				 * </PRE>
				 * @memberof grid-class
				 * @property {Number|String} [height] 高度
				 */
				height: null,
				/**
				 * 跟随滚动
				 * <PRE>默认all
				 * 可选值
				 * none 不跟随
				 * header 网格头
				 * footer 网格尾
				 * all 网格头和网格尾
				 * </PRE>
				 * @memberof grid-class
				 * @property {String} [follow=all] 表头/尾跟随
				 */
				follow: 'all',
				/**
				 * 是否列标题栏的对齐方式跟随
				 * @todo 当结果为false时，标题头居中
				 * @todo 当结果为true时，标题头与列的对齐方式相同
				 * @memberof grid-class
				 * @property {Boolean} [halign=false] 列标题栏的对齐方式跟随
				 */
				halign: false,
				/**
				 * 是否显示复选框
				 * @memberof grid-class
				 * @property {Boolean} [checkbox=false] 是否显示复选框
				 */
		        checkbox: false,
		        /**
				 * 是否显示单选框
				 * @memberof grid-class
				 * @property {Boolean} [radiobox=false] 是否显示单选框
				 */
		        radiobox: false,
		        /**
				 * 是否允许多列排序
				 * @memberof grid-class
				 * @property {Boolean} [multiSort=false] 多列排序
				 */
		        multiSort: false,
		        /**
				 * 是否远程排序
				 * @memberof grid-class
				 * @property {Boolean} [remoteSort=false] 远程排序
				 */
		        remoteSort: false,
		        /**
				 * 行号
				 * <PRE>
				 * 默认none
				 * 可选值
				 * none: 不显示
				 * normal: 普通
				 * repeat: 重复
				 * </PRE>
				 * @memberof grid-class
				 * @property {String} [rownumbers='none'] 行号
				 */

		        rownumbers: 'none',
		        /**
				 * 视图扩展
				 * <PRE>
				 * view:{type:'CardView'卡片类型,region:'right'//卡片位置,formEl:'表单id',cardWidth:'卡片宽',rowRender:'渲染回调'}
				 * </PRE>
				 * @memberof view
				 * @property{Object} [view=null]
				 */
				view:{type:'GridView',region:'right',isDefault:false},
				/**
				 * 是否开启切换视图
				 * <PRE>
				 * 默认false
				 * </PRE>
				 * @memberof grid-class
				 * @property {boolean}
				 */
				switchView:false,
		        /**
		         * 是否显示合计行序号
		         * @memberof grid-class
				 * @property {String} [footerRowNumber=false]
		         */
		        footerRowNumber: false,
		        /**
				 * 分页
				 * <PRE>
				 * 默认'none'
				 * 可选值
				 * none: 不分页
				 * up: 上分页
				 * down: 下分页
				 * all: 上下分页
				 * </PRE>
				 * @memberof grid-class
				 * @property {String} [pager=none] 分页
				 */
		        pager: 'none',
				/**
				 * 分页栏上的打印和导出按钮是否显示
				 * @memberof grid-class
				 * @property {Object} [pagerToolbarIcon] 
				 * @property {Boolean} [pagerToolbarIcon.download=false] 不显示下载按钮
				 * @property {Boolean} [pagerToolbarIcon.print=false] 不显示打印按钮
				 */
		        pagerToolbarIcon: {
		        	download: false,
		        	print: false
		        },
		        /**
				 * 默认当前页
				 * @memberof grid-class
				 * @property {Number} [pageNumber=1] 默认当前页
				 */
				pageNumber: 1,
				/**
				 * 每页默认的结果数
				 * @memberof grid-class
				 * @property {Number} [pageSize=10] 每页默认的结果数
				 */
				pageSize: 10,
				/**
				 * 可选择设定的每页结果数
				 * @memberof grid-class
				 * @property {Array} [pageList=10, 15, 20, 50, 100, 200] 可选择设定的每页结果数
				 */
				pageList: [10, 15, 20, 50, 100, 200],
				/**
				 * 主视图列
				 * @memberof grid-class
				 * @property {Array<Array>} [columns] 主视图列
				 */
				columns: null,
				/**
				 * 左固定列
				 * @memberof grid-class
				 * @property {Array<Array>} [frozenColumns] 左固定列
				 */
				frozenColumns: null,
				/**
				 * 右视图列
				 * @memberof grid-class
				 * @property {Array<Array>} [frozenColumnsRight] 右视图列
				 */
				frozenColumnsRight: null,
				/**
				 * 是否对编辑过的数据进行标记
				 * @memberof grid-class
				 * @property {Boolean} [markChange=false] 不标记
				 */
				markChange: false,
				/**
				 * 网格是否可编辑的总开关
				 * @memberof grid-class
				 * @property {Boolean} [editable=true] 可编辑
				 */
				editable: true,
				/**
				 * 设置了如何去解析从Server端传回来的json数据
				 * @memberof grid-class
				 * @property {Object} [jsonReader] json定义
				 * @property {Number} [jsonReader.total=totalRecords] 总记录数字段
				 * @property {Object} [jsonReader.rows=data] 主数据字段
				 * @property {Object} [jsonReader.footer=footer] 合计数据字段
				 */
				jsonReader: {
					/**
					 * 总记录数
					 */
					total: 'totalRecords',
					/**
					 * 表格数据
					 */
					rows: 'data',
					/**
					 * 表格尾数据
					 */
					footer: 'footer'
				},
				/**
				 * 初始查询参数
				 * <PRE>
				 * 已用关键字：page、rows、sort、order、__transor
				 * </PRE>
				 * @memberof grid-class
				 * @property {Object} [queryParams] 查询参数
				 */
				queryParams: null,
				/**
				 * 自定义面板的jquery表达式
				 * <PRE>
				 * 组件根据 $A(headerCustom) 取得面板 eg. #query
				 * </PRE>
				 * @memberof grid-class
				 * @property {String} [headerCustom] jquery表达式
				 */
				headerCustom: null,
				/**
				 * 初始化网格时 自动加载数据
				 * @memberof grid-class
				 * @property {Boolean} [autoLoad=true] 标志
				 */
				autoLoad: true,
				/**
				 * 自适应填充宽度
				 * <PRE>
				 * 默认为N 不自适应
				 * 可选值：
				 * N：[no] 不进行自适应填充
				 * ES: [extend&shrink]将列宽进行伸长/缩短以填充满表格，取消横向滚动
				 * E: [extend]将列框进行伸展以填充满表格，取消横向滚动
				 * </PRE>
				 * @memberof grid-class
				 * @property {Boolean} [fitColumns='N'] 标志
				 */
				fitColumns: 'E',
				/**
		         * 自定义合计栏的配置
		         * <PRE>
		         * summary.method 计算的函数，如果函数为空，则使用网格的data进行替换模板
		         * summary.template 模板
		         * </PRE>
		         * @property {Object} [summary] 自定义合计栏的配置
		         * @property {Function} [summary.method] 合计的计算方法
		         * @property {template} summary.template 模板
		         * @memberof grid-class
		         */
		        summary: null,
		      	/**
		         * 合计栏所在位置 可选值 top bottom
		         * @property {String} [summaryPos=bottom] 合计栏所在位置
		         * @memberof grid-class
		         */
		        summaryPos: 'bottom',
		        /**
		         * 网格列是否可以调整宽度
		         * <PRE>
				 * 1、默认为'true'，可以调整列宽
				 * </PRE>
		         * @property {Boolean} [columnResizable=true] 允许调整列宽
		         * @memberof grid-class
		         */
		        columnResizable: true,
		        /**
				 * 是否点击数据行开始编辑
				 * @memberof grid-class
				 * @property {Boolean} [autoBeginEdit=true] 开始编辑
				 */
				autoBeginEdit: true,
				/**
				 * 是否点击非数据行结束编辑
				 * @memberof grid-class
				 * @property {Boolean} [autoEndEdit=true] 结束编辑
				 */
				autoEndEdit: true,
				/**
				 * 是否使用编辑器的代理删除按钮
				 * 该参数在有编辑器的情况下生效
				 * @memberof grid-class
				 * @property {Boolean} [editorDelBtn=true] 使用
				 */
				editorDelBtn: true,
				/**
				 * 要合并的列名
				 * @memberof grid-class
				 * @property {Array<String>} [mergeColumns] 要自动合并的列
				 */
				mergeColumns: null,
				/**
				 * 是否允许进行列的隐藏/显示操作
				 * @memberof grid-class
				 * @property {Boolean} [columnManager=true] 允许
				 */
				columnManager: true,
				/**
				 * 每次双击必须间隔毫秒数
				 */
				dblOnce: 1000,
				/**
				 * 定位编辑器上边的编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyUpEditor=App.keyCode.UP] 按键值数组
				 */
				keyUpEditor: [App.keyCode.UP],
				/**
				 * 定位编辑器下边的编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyDownEditor=App.keyCode.DOWN] 按键值数组
				 */
				keyDownEditor: [App.keyCode.DOWN],
				/**
				 * 定位编辑器左边的编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyLeftEditor=App.keyCode.LEFT] 按键值数组
				 */
				keyLeftEditor: [App.keyCode.LEFT],
				/**
				 * 定位编辑器右边的编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyRightEditor=App.keyCode.RIGHT] 按键值数组
				 */
				keyRightEditor: [App.keyCode.RIGHT],
				/**
				 * 是否启用特殊按键[keyNextEditor、keyPrevEditor、keyAppendRow、keyDeleteRow]
				 * @memberof grid-class
				 * @property {Boolean} [keySpecEnabled=true]
				 */
				keySpecEnabled: true,
				/**
				 * 定位编辑器的下一个编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyNextEditor=[App.keyCode.ENTER, App.keyCode.TAB]] 按键值数组
				 */
				keyNextEditor: [App.keyCode.ENTER, App.keyCode.TAB],
				/**
				 * 定位编辑器的上一个编辑器
				 * @memberof grid-class
				 * @property {Array<Number>} [keyPrevEditor=[{keyCode:App.keyCode.TAB, shiftKey:true}]] 按键值数组
				 */
				keyPrevEditor: [{keyCode:App.keyCode.TAB, shiftKey:true}],
				/**
				 * 追加一行到末尾
				 * @memberof grid-class
				 * @property {Array<Number>} [keyPrevEditor=[{keyCode:App.keyCode.PLUS, ctrlKey:true}]] 按键值数组
				 */
				keyAppendRow: [{keyCode:App.keyCode.PLUS, shiftKey:true}],
				/**
				 * 删除当前编辑行
				 * @memberof grid-class
				 * @property {Array<Number>} [keyPrevEditor=[{keyCode:App.keyCode.MINUS, ctrlKey:true}]] 按键值数组
				 */
				keyDeleteRow: [{keyCode:App.keyCode.MINUS, shiftKey:true, ctrlKey:true}]

			},
			/**
			 * 网格的列属性
			 * @class
			 * @classdesc 表格
			 * @name gridColumn
			 */
			Column: {
				/**
				 * 列属性
				 * @property {String} field 列属性
				 * @memberof gridColumn
				 */
				field: null,
				/**
				 * 列标题
				 * <PRE>操作列配置按钮，title配置为数字，该数字代表buttons的索引，且按钮不加入数据域</PRE>
				 * @property {String} title 列标题
				 * @memberof gridColumn
				 */
				title: null,
				/**
				 * 列公式
				 * <PRE>表达式可以直接使用当前行变量
				 * 	表达式内提供下列三个特殊方法功能动态维度列使用
				 * 		getNum(field)
				 * 		getStr(field)
				 * 		sumSuffix(suffixStr)</PRE>
				 * @property {String} formula 计算表达式
				 * @memberof gridColumn
				 */
				formula: null,
				/**
				 * 合并列
				 * @property {Number} [colspan] 合并列
				 * @memberof gridColumn
				 */
				colspan: null,
				/**
				 * 合并行
				 * @property {Number} [rowspan] 合并行
				 * @memberof gridColumn
				 */
				rowspan: null,
				/**
				 * 宽度
				 * @property {Number} [Column.width=100] 宽度
				 * @memberof gridColumn
				 */
				width: 100,
				/**
				 * 打印宽度单位mm
				 * @property {Number} [Column.printWidth] 打印宽度
				 * @memberof gridColumn
				 */
				printWidth: null,
				/**
				 * 打印数据类型
				 * <PRE>
				 * String 字符串
				 * Number0 整型的数值
				 * Number1 保留1位小数的数值
				 * Number2 保留2位小数的数值
				 * Number3 保留3位小数的数值
				 * Number4 保留4位小数的数值
				 * Number5 保留5位小数的数值
				 * Number6 保留6位小数的数值
				 * </PRE>
				 * @property {String} [Column.printType=String] 默认为字符串类型
				 * @memberof gridColumn
				 */
				printType: 'String',
				/**
				 * 固定列
				 * 可选值: left, right
				 * @property {String} [Column.frozen] 固定
				 * @memberof gridColumn
				 */
				frozen: null,
				/**
				 * 隐藏
				 * @property {Number} [Column.hidden=false] 隐藏
				 * @memberof gridColumn
				 */
				hidden: false,
		        /**
				 * 对齐方式 可选值 center left right
				 * @property {String} [Column.align=center] 对齐方式
				 * @memberof gridColumn
				 */
		        align: 'center',
		        /**
		         * 可排序
		         * @property {Boolean} [sortable=false] 对齐方式
		         * @memberof gridColumn
		         */
		        sortable: false,
		        /**
		         * 自定义排序函数，用来做局部排序
		         * @property {Function} [sorter] 排序函数
		         * @property {Object} sorter.a 第一个值
		         * @property {Object} sorter.b 第二个值
		         * @example {title: '自定义排序方法',align:'right',field: 'f3',
		         * &#9;sortable:true,
		         * &#9;sorter: function(a,b){
		         * &#9;&#9;return a.f3 - b.f3;
		         * &#9;}
		         * }
		         * @memberof gridColumn
		         */
		        sorter: null,
		        /**
		         * 返回样式字符串定制的单元格样式的函数
		         * @property {Function} [styler] 样式函数
		         * @property {String} styler.val 值
		         * @property {Object} styler.row 行数据对象
		         * @property {index} styler.i 行号
		         * @example {title: '样式修改列',field: 'f2',
		         * &#9;styler:function(val,row,i){
		         * &#9;&#9;var n = parseInt(val.substr(val.lastIndexOf('-')+1));
		         * &#9;&#9;if(n%2==1){
		         * &#9;&#9;&#9;return 'color:green;';
		         * &#9;&#9;}else{
		         * &#9;&#9;&#9;return 'color:red;';
		         * &#9;&#9;}
		         * &#9;}
		         * }
		         * @memberof gridColumn
		         */
		        styler: null,
		        /**
		         * 格式化配置
		         * <PRE>
		         * 1、函数类型： 自定义编写的函数
		         * 该函数接收选中四个参数，分别为该单元格的值，行实体对象，行号，列。函数返回一个字符串作为显示值
				 * 2、数值格式化：指定格式化串 [#,###.00]
				 * 3、字符串连接：使用{}包裹变量
				 * 4、内置格式化方法：内置格式化方法编码
		         * </PRE>
		         * @property {Function|String} [formatter] 格式化
		         * @property {String} formatter.value 值
		         * @property {Object} formatter.row 行数据对象
		         * @property {Number} formatter.rowIndex 行号
		         * @property {GridColumn} formatter.column 列
		         * @example {title: '格式化显示列',align:'left',field: 'f1',
		         * &#9;formatter:function(value,row,rowIndex,column){
		         * &#9;&#9;return '格式化列';
		         * &#9;}
		         * }
		         * @example {title: 'f1显示f2的值',align:'left',field: 'f1', formatter:'[#,###.00]'}
		         * @example {title: 'f1显示f2的值',align:'left',field: 'f1', formatter:'{f1}-{f2}'}
		         * @example {title: 'f1显示f2的值',align:'left',field: 'f1', formatter:'oneYesZeroNo'}
		         * @memberof gridColumn
		         */
		        formatter: null,
		        /**
		         * 编辑器设置
		         * @property {Object} [editor] 格式化函数
		         * @property {String} editor.type 编辑器类型
		         * @property {Object} editor.options 编辑器初始化属性[详见个组件]
		         * @example {
		         * &#9;title : '主列标题2',
		         * &#9;field : 'c2',
		         * &#9;width : 120,
		         * &#9;editor : {
		         * &#9;&#9;type : 'combogrid',
		         * &#9;&#9;options : {
		         * &#9;&#9;&#9;panelwidth: 400,
		         * &#9;&#9;&#9;url: 'platform/sample/base/ui/combogridData.do',
		         * &#9;&#9;&#9;&#9;columns: [[
		         * &#9;&#9;&#9;&#9;{title: 'id列',field: 'id',hidden:true},
		         * &#9;&#9;&#9;&#9;{title: '名称列',field: 'name',width: 100},
		         * &#9;&#9;&#9;&#9;{title: '主列标题3',field: 'c3',width: 150},
		         * &#9;&#9;&#9;&#9;{title: '主列标题4',field: 'c4',width: 200},
		         * &#9;&#9;&#9;&#9;{title: '主列标题5',field: 'c5',width: 250},
		         * &#9;&#9;&#9;&#9;{title: '主列标题6',field: 'c6',width: 500}
		         * &#9;&#9;&#9;]]
		         * &#9;&#9;}
		         * &#9;}
		         * }
		         * @memberof gridColumn
		         */
		        editor: null,
		        /**
		         * 单元格按钮
		         * @property {Array} [buttons] 主数据单元格中的按钮
		      	 * @property {String} [buttons.text] 标题
				 * @property {String} [buttons.iconCls] 样式
				 * @property {Function|Boolean} [buttons.disabled] 是否可用
				 * @property {Function} [buttons.handler] 操作
				 * @property {Object} [buttons.handler.rowData] 行数据
				 * @property {Number} [buttons.handler.rowIndex] 行号
				 * @example {
				 * &#9;title : '操作',
				 * &#9;width : 200,
				 * &#9;buttons:[ {
				 * &#9;&#9;text : '编辑',
				 * &#9;&#9;iconCls : 'btn-edit',
				 * &#9;&#9;disabled : true,
				 * &#9;&#9;handler : function(rowData, rowIndex) {
				 * &#9;&#9;&#9;$('#gridEditorOnClickTr').grid('beginEdit', rowIndex);
				 * &#9;&#9;}
				 * &#9;} , {
				 * &#9;&#9;text : '撤销编辑',
				 * &#9;&#9;iconCls : 'btn-reset',
				 * &#9;&#9;disabled : function(rowData, rowIndex) {
				 * &#9;&#9;&#9;return rowIndex%2==0?true:false;
				 * &#9;&#9;},
				 * &#9;&#9;handler : function(rowData, rowIndex) {
				 * &#9;&#9;&#9;$('#gridEditorOnClickTr').grid('cancelEdit', rowIndex);
				 * &#9;&#9;}
				 * &#9;} , {
				 * &#9;&#9;text : '应用编辑',
				 * &#9;&#9;iconCls : 'btn-start',
				 * &#9;&#9;handler : function(rowData, rowIndex) {
				 * &#9;&#9;&#9;$('#gridEditorOnClickTr').grid('acceptChange', rowIndex);
				 * &#9;&#9;}
				 * &#9;}
				 * }
		         * @memberof gridColumn
		         */
		        buttons: null,
		        /**
		         * 数据列是否提示浮动的title
		         * @property {Boolean} [showTitle=false] 标志
		         * @memberof gridColumn
		         */
		        showTitle: false,
		        /**
		         * 合计值选项
		         * <PRE>
		         * summary.type 可选值：
		         * &#9;&#9;sum: 合计值
		         * &#9;&#9;avg：平均值
		         * &#9;&#9;min：最小值
		         * &#9;&#9;max：最大值
		         * &#9;&#9;count：计数值
		         * summary.text 要输出的值
		         * </PRE>
		         * @property {Object} [summary] 合计值选项
		         * @property {String} [summary.type] 类型
		         * @property {String} [summary.text] 文字
		         * @memberof gridColumn
		         */
		        summary: null,
		        /**
		         * 网格列是否可以调整宽度
		         * @property {Boolean} [resizable=true] 允许调整列宽
		         * @memberof gridColumn
		         */
		        resizable: true,
		        /**
		         * 是否为行头
		         * @property {Boolean} [rowHeader=false] 不是行头
		         * @memberof gridColumn
		         */
		        rowHeader: false,
		        /**
		         * 是否作为 列隐藏/显示树 的节点
		         * @property {Boolean} [showTree=true] 允许
		         * @memberof gridColumn
		         */
		        showTree: true,
		        /**
		         * 是否锁定列隐藏/显示操作，锁定将不允许用户进行列的隐藏/显示操作
		         * @property {Boolean} [lockTree=false] 允许
		         * @memberof gridColumn
		         */
		        lockTree: false
			},
			Combogrid: {
				/**
				 * 要加载数据的url，也可以通过action设置
				 * @memberof combogrid-class
				 * @property {Url} [url] url数据源
				 */
				url: '',
				/**
				 * <span class="type-signature static">override</span>
				 * 下拉面板的高度
				 * @memberof combogrid-class
				 * @property {Number} [panelheight=297] 下拉面板的高度
				 */
				panelheight: 297,
				/**
				 * 是否允许多选 也可以由checkbox来设置该属性
				 * s.multiple = s.checkbox || s.multiple;
				 * @memberof combogrid-class
				 * @property {Boolean} [multiple=false] 多选
				 */
				multiple: false,
				/**
				 * 联想过滤时使用的匹配属性，多个属性使用,分隔
				 * <PRE style="color:red;">
				 * 当没有配置该属性时，默认使用textfield
				 * 远程联想时 可以通过_key接收输入的搜索关键字、suggestfield接收该字段的配置
				 * </PRE>
				 * @memberof combogrid-class
				 * @property {String} [suggestfield] 匹配属性
				 */
				suggestfield: '',
				/**
				 * 是否允许网格搜索
				 * @todo 当下拉网格不分页时，根据当前页面的数据进行匹配
				 * @todo 当下拉网格存在分页，则根据url进行远程匹配
				 *          远程用 _key 来接受检索关键字，suggestfield来接受检索的匹配属性
				 * </PRE>
				 * @memberof combogrid-class
				 * @property {boolean} [search=false] 允许网格搜索
				 */
				search: false,
				/**
				 * 延迟搜索时间（毫秒）
				 * @memberof combogrid-class
				 * @property {Object} [lazy=500] 延迟搜索时间（毫秒）
				 */
				lazy: 500,
				/**
				 * 允许联想
				 * @memberof combogrid-class
				 * @property {Boolean} [usesuggest=false] 允许联想
				 */
				usesuggest: false,
				/**
				 * 下一页
				 * @memberof combogrid-class
				 * @property {Array} keyNextPage=[App.keyCode.RIGHT] 按键值数组
				 */
				keyNextPage: [App.keyCode.RIGHT],
				/**
				 * 上一页
				 * @memberof combogrid-class
				 * @property {Array} keyPrevPage=[App.keyCode.LEFT] 按键值数组
				 */
				keyPrevPage: [App.keyCode.LEFT],
				className: 'app-combogrid',
				/**
				 * <span class="type-signature static">override</span>
				 * 下拉表格内部表格的默认设置
				 * @see {@link grid} 查看grid组件
				 * @memberof combogrid-class
				 * @property {Object} Grid 下拉表格内部表格的默认设置
				 * @property {Boolean} [Grid.pagerToolbar=false] 上分页与标题栏同行
				 * @property {Boolean} [Grid.rownumbers='repeat'] 网格行号
				 * @property {Boolean} [Grid.autoHeight=true] 自动增高模式
				 * @property {Boolean} [Grid.follow=all] 头/尾跟随滚动
				 * @property {Number} [Grid.clickDelay=0] 单击确认毫秒数
				 */
				Grid:{
					/**
					 * 上分页是否与工具栏同行，false则与标题栏同行
					 */
			        pagerToolbar: false,
					/**
					 * 网格行号
					 */
					rownumbers: 'repeat',
					/**
					 * 内置的网格尾固定高度
					 * 网格头/尾 不跟随滚动
					 */
					follow: null,
					/**
					 * 单击确认毫秒数
					 */
					clickDelay: 0
				}
			},
			Checkbox:{
				/**
				 * 数据对象中作为隐藏值的属性名
				 * @memberof checkbox-class
				 * @property {String} [valuefield=id] 隐藏值属性名
				 */
				valuefield: 'id',
				/**
				 * 数据对象中作为显示值的属性名
				 * @memberof checkbox-class
				 * @property {String} [textfield=name] 显示值属性名
				 */
				textfield: 'name',
				/**
				 * 可以勾选的个数
				 * @memberof checkbox-class
				 * @property {number} [checkLen=0] 0不做限制
				 */
				checkedLen: 0,
				/**
				 * 布局方式，默认为水平布局，可选为：'horizontal' | 'vertical'
				 * @memberof checkbox-class
				 * @property {Array} orient=[horizontal]
				 */
				orient: 'horizontal'
			},
			progressbar: {
				/**
				 * 宽度 默认与父元素宽度相同
				 * @memberof progressbar-class
				 * @property {String} [width=auto] 进度条的宽度
				 */
				width: 'auto',
				/**
				 * 进度值
				 * @memberof progressbar-class
				 * @property {Number} [value=0] 进度值
				 */
				value : 0,
				/**
				 * 高度
				 * @memberof progressbar-class
				 * @property {String} [height=20px] 高度
				 */
				height: '20px',
				/**
				 * 背景色
				 * @memberof progressbar-class
				 * @property {String} [background-color=#4AAE98] 背景色
				 */
				'background-color': '#4AAE98',
				/**
				 * 进度值的前景色
				 * @memberof progressbar-class
				 * @property {String} [color=black] 前景色
				 */
				color: 'black',
				/**
				 * 是否显示条纹
				 * @memberof progressbar-class
				 * @property {String} [striped=true] 显示条纹
				 */
				striped: true,
				/**
				 * 进度最大值
				 * @memberof progressbar-class
				 * @property {String} [max=100] 进度最大值
				 */
				max: 100
			},
			upload: {
				/**
				 * 上传的url
				 * @memberof upload-class
				 * @property {url} uploadUrl=attachment/upload.do 上传的url
				 */
				uploadUrl: 'attachment/upload.do',
				/**
				 * 是否初始化已上传的文件
				 * @memberof upload-class
				 * @property {Boolean} [requestFile=false] 初始化已上传的文件
				 */
				requestFile: false,
				/**
				 * 获取已上传文件的url
				 * @memberof upload-class
				 * @property {url} [fileUrl=attachment/getFiles.do] 获取已上传文件的url
				 */
				fileUrl: 'attachment/getFiles.do',
				/**
				 * 删除已上传文件的url
				 * @memberof upload-class
				 * @property {url} [deleteUrl=attachment/delete.do] 删除已上传文件的url
				 */
				deleteUrl: 'attachment/delete.do',
				/**
				 * 工具栏的位置 可选值 top|bottom
				 * @memberof upload-class
				 * @property {Boolean} [toolbarPosition=top] 工具栏的位置
				 */
				toolbarPosition: 'top',
				/**
				 * 顶层的css样式
				 * @memberof upload-class
				 * @property {style} [style] 顶层的css样式
				 */
				style: '',
				/**
				 * 顶层的class类名
				 * @memberof upload-class
				 * @property {Class} [css] 顶层的class类名
				 */
				css: '',
				/**
				 * 设置宽度后为平铺显示文件
				 * @memberof upload-class
				 * @property {Class} [fileWidth] 文件项的宽度
				 */
				fileWidth: '',
				/**
				 * 文件是否可以删除
				 * @memberof upload-class
				 * @property {Class} [canDelete=false] 不能删除文件
				 */
				canDelete: false,
				/**
				 * 文件的扩展名
				 * @memberof upload-class
				 * @property {String} [exts] 文件的扩展名
				 * @example exts=".zip,.jpg,.rar"
				 */
				exts: '',
				/**
				 * 上传文件按钮的文本
				 * @memberof upload-class
				 * @property {String} [uploadBtnText=上传文件] 上传文件按钮的文本
				 */
				uploadBtnText: '上传文件',
				/**
				 * 可以上传多个文件
				 * @memberof upload-class
				 * @property {Boolean} [multiple=true] 上传多个文件
				 */
				multiple: true
			},
			Button:{
				/**
				 * id
				 * @memberof Button
				 * @property {String}
				 */
				id : null,
				 /**
				 * 是否禁用
				  * @memberof Button
			      * @property {Boolean} [value=false]
				 */
				disabled : false,
				/**
				 * 是否切换元素的可见状态
				* @memberof Button
			 	* @property {Boolean} [value=false]
				 */
				toggle : false,
				/**
				 * 是否选中,当toggle为true有有效
				 * @memberof Button
			 	 * @property {Boolean} [selected=false]
				 * 是否选中
				 */
				selected : false,
				/**
				 * 按钮组.当group值一样时，认为是一组按钮
				 * @memberof Button
			 	 * @property {String} [group='']
				 */
				group : null,
				plain : false,
				/**
				 * @memberof Button
			 	 * @property {String} [text='']
				 * 按钮文本
				 */
				text : "",
				/**
				 * @memberof Button
			 	 * @property {String} [iconCls='']
				 * ico图标样式
				 */
				iconCls : null,
				/**
				 * ico对齐方式
				 * @memberof Button
			 	 * @property {String} [iconCls='left']
				 */
				iconAlign : "left",
                /**
                 * 按钮大小
                 * @memberof Button
                 * @property {String} [iconCls='small'] 小按钮 small,large
                 */
			    size: 'small',	// small,large
                /**
                 * 按钮点击事件
                 * @event Button#onClick
                 * @property {Function} [onClick=emptyFunction]
                 */
				onClick: function(){}
			},
			MenuButton : {
                className:'app-menubutton',
                /**
				 * 禁用启用
				 *  @memberof menututton
			 	 * @property {Boolean} [disabled=false]
				 */
				disabled: false,
				/**
				 * 是否为平面按钮
				 *  @memberof menututton
			 	 * @property {Boolean} [plain=false]
				 */
				plain: true,
				/**
				 * 绑定的菜单id
				 * @memberof menututton
			 	 * @property {String} [menu='']
			 	 * @example menu="#menu1"
				 */
				menu: null,
				/**
				 * 定义了时间以毫秒为单位显示菜单时，悬停按钮
				 * @memberof menututton
			 	 * @property {Number} [duration=100]
			 	 * @example duration=100
				 */
				duration: 100
			},
			Menu: {
                className:'app-menu',
                zIndex:110000,
				left: 0,
				top: 0,
				alignTo: null,
				align: 'left',
				minWidth: 120,
				duration: 100,	// Defines duration time in milliseconds to hide when the mouse leaves the menu.
				hideOnUnhover: true,	// Automatically hides the menu when mouse exits it
				onShow: function(){},
				onHide: function(){},
				onClick: function(item){}
			},
			Panel:{
				/**
				 * @memberof panel
			 	 * @property {String} [id='']
				 * 面板id
				 */
				id:null,
				/**
				 * 面板内间距
				 * @memberof panel
			 	 * @property {String} [padding='0 0 0 0']
				 */
				paddings:"0 0 0 0",
				margins:"0 0 0 0",
				/**
				 * @memberof panel
			 	 * @property {String} [title='']
				 * 面板标题
				 */
				title:null,
				/**
				 * @memberof panel
			 	 * @property {String} [width='auto']
				 * 面板宽度
				 */
				width: 'auto',
				/**
				 * @memberof panel
			 	 * @property {String} [height='auto']
				 * 面板高度
				 */
				height: 'auto',
				/**
				 * @memberof panel
			 	 * @property {String} [left=null]
				 * 面板定位横向坐标
				 */
				left: null,
				/**
				 * @memberof panel
			 	 * @property {String} [top=null]
				 * 面板定位纵向坐标
				 */
				top: null,
				/**
				 * @memberof panel
			 	 * @property {String} [cls=null]
				 * 面板附加样式
				 */
				cls: null,
				/**
				 * @memberof panel
			 	 * @property {String} [headerCls=null]
				 * 面板头部附加样式名
				 */
				headerCls: null,
				/**
				 * @memberof panel
			 	 * @property {String} [bodyCls=null]
				 * 内容体附加样式名
				 */
				bodyCls: null,
				/**
				 * @memberof panel
			 	 * @property {String} [style={}]
				 * 面板样式
				 */
				style: {},
				/**
				 * @memberof panel
			 	 * @property {String} [href=null]
				 * ajax地址
				 */
				href: null,
				/**
				 * @memberof panel
			 	 * @property {String} [cache=true]
				 * 是否缓存
				 */
				cache: true,
				/**
				 * @memberof panel
			 	 * @property {String} [fit=false]
				 * 是否自适应父级控件，放在layout有效
				 */
				fit: false,
				/**
				 * @memberof panel
			 	 * @property {String} [border=true]
				 * 就否显示面板边框
				 */
				border: true,
				/**
				 * @memberof panel
			 	 * @property {String} [doSize=true]
				 *  true to set size and do layout
				 */
				doSize: true,
				/**
				 * @memberof panel
			 	 * @property {String} [noheader=false]
				 *  是否显示标题头
				 */
				noheader: false,
				/**
				 * @memberof panel
			 	 * @property {String} [content=null]
				 * 面板内容体
				 */
				content: null,	// the body content if specified
				/**
				 * @memberof panel
			 	 * @property {String} [collapsible=false]
				 * 是否可收缩
				 */
				collapsible: false,
				/**
				 * @memberof panel
			 	 * @property {String} [minimizable=false]
				 * 是否最小化
				 */
				minimizable: false,
				/**
				 * @memberof panel
			 	 * @property {String} [maximizable=false]
				 * 是否最大化
				 */
				maximizable: false,
				/**
				 * @memberof panel
			 	 * @property {String} [closable=false]
				 * 是否可关闭
				 */
				closable: false,
				/**
				 * @memberof panel
			 	 * @property {String} [collapsed=false]
				 * 收缩状态
				 */
				collapsed: false,
				/**
				 * @memberof panel
			 	 * @property {String} [minimized=false]
				 * 最小化状态
				 */
				minimized: false,
				/**
				 * @memberof panel
			 	 * @property {String} [maximized=false]
				 * 最大化状态
				 */
				maximized: false,
				/**
				 * @memberof panel
			 	 * @property {String} [closed=false]
				 * 关闭状态
				 */
				closed: false,
				extractor:null,
				method : "get",
				/**
				 * @memberof panel
			 	 * @property {String} [queryParams={}]
			 	 * ajax加载参数
				 */
				queryParams : {},
				loader:function(){},
				tools: [],
				loadingMessage: 'Loading...',
				/**
				 * @memberof panel
			 	 * @fires Panel#onLoad
			 	 * 打开前事件
				 */
				onLoad: function(){},
				/**
				 * @memberof panel
			 	 * @fires Panel#onBeforeOpen
			 	 * 打开前事件
				 */
				onBeforeOpen: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onOpen
			 	 * 打开事件
				 */
				onOpen: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onBeforeClose
			 	 * 关闭前事件
				 */
				onBeforeClose: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onClose
			 	 * 关闭事件
				 */
				onClose: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onClose
			 	 * 注销前事件
				 */
				onBeforeDestroy: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onClose
			 	 * 注销事件
				 */
				onDestroy: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onResize
			 	 * @property {Number} width
			 	 * @property {Number} height
			 	 * 注销事件
				 */
				onResize: function(width,height){},
				/**
				 * @memberof panel
			 	 * @event Panel#onMove
			 	 * 移动事件
				 */
				onMove: function(left,top){},
				/**
				 * @memberof panel
			 	 * @event Panel#onMaximize
			 	 * 最大化事件
				 */
				onMaximize: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onRestore
			 	 * 重置事件
				 */
				onRestore: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onMinimize
			 	 * 最小化事件
				 */
				onMinimize: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onMinimize
			 	 * 收缩前事件
				 */
				onBeforeCollapse: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onBeforeExpand
			 	 * 展开前事件
				 */
				onBeforeExpand: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onBeforeExpand
			 	 * 收缩展开监听
				 */
				onCollapse: function(){},
				/**
				 * @memberof panel
			 	 * @event Panel#onBeforeExpand
			 	 * 展开事件
				 */
				onExpand: function(){}
		}

		},
		/**
		 * 统一的zindex定义
		 */
		zindexs:{
			droppanel:2000,
			dialog:1001,
			dialogMask:1000,
			dialogBack:999
		},
		dataTable:{
			iDisplayLength: 20,
		    aLengthMenu: [[20, 50, 100], [20, 50, 100]],
			bServerSide: true,
			bProcessing: false,
			bDeferRender:false,
			sAjaxDataProp:"data",
			pageListLength:10
		},
		pagination:{
			pageSize:20,
			listLength:10,
			pageSizeMenu: [20, 50, 100]
		},
		flexigrid:{
			rpOptions:[20, 50, 100]
		},
		jqgrid:{
			pageList:[20, 50, 100]
		},
		simpletree:{
			selected:"selected",
			exp:"center_expandable",
			coll:"center_collapsable",
			firstExp:"first_expandable",
			firstColl:"first_collapsable",
			lastExp:"last_expandable",
			lastColl:"last_collapsable",
			expandIcon:"icon-folder-close",
			folderIcon:"icon-folder-open",
			oneExp:"one_expandable",
			oneColl:"one_collapsable",
			leafIcon:"icon-file",
			ck:"checked",
			unck:"unchecked"
		},
		getPlugins:function(){
			var plugins=[];
			for(var plugin in this.appDefaults){
				plugins.push({pluginName:plugin.toLowerCase(),className:this.appDefaults[plugin].className});
			}
			return plugins;
		}
	};
	return App.options;
});
/**
 * @class JsonResult
 * <p>此类封装服务调用返回信息</p>
 * @constructor
 * @param {Object} src JSON格式的源数据
 * @param {Object} onlyData 仅含数据(没有调用结果等信息)
 * @return {XY.data.JsonResult} 创建的对象
 */
define('app/data/app-json-result',["jquery"],function($){
var JsonResult = function(src, onlyData) {
	var o = null, status = null;

	if ($.type(src) === "string") {
		o = $.parseJSON(src);
	} else if ($.isPlainObject(src) && src.responseText) {
		o = $.parseJSON(src.responseText);
	} else {
		o = src;
	}

	if (onlyData) {
		status = {code : JsonResult.SUCCESS, message : null};
	} else {
		status={code:o.statusCode,message:o.message}
		
	}

	//private
	//TODO : 不需要暴露这些属性
	this.code = parseInt(status.code, 10);
	this.message = status.message
	this.translator=o["translator"];
	this.translateBodys=o["translateBodys"];
	this.data = null;

	/*
	 * 读取数据部分
	 * 1.如果 onlyData == true, 则整个对象就是数据
	 *   否则认为对象中的 result 属性为数据
	 * 2.上述所得数据可能为对象，也可能为基本类型的数据
	 */
	var data = onlyData ? o : o.data;
	if ($.isPlainObject(data)) {
		this.data = {};
		$.extend(this.data, data);
	} else {
		this.data = data;
	}
};

JsonResult.prototype = {

	/**
	 * 返回运行结果代码
	 * @return {Number} 代码
	 */
	getCode : function(){
		return this.code;
	},

	/**
	 * 返回运行结果消息
	 * @return {String} 消息
	 */
	getMessage : function(){
		return this.message;
	},

	/**
	 * 返回原始数据
	 * @param {String} name 属性名，支持多级(a.b.c)
	 * @return {Object} 对象中对应的属性
	 */
	getRawData : function(name){
		var o = this.data;

		// o 为基本类型时, 应该直接返回
		if ($.isPlainObject(o) && (name!=""&&name!=null&&name!=undefined)) {
			var d = name.split("."),
			    len = d.length;

			for (var i = 0; i < len; i++) {
				o = o[d[i]];
				if (o === null || o === undefined) break;
			}
		}
		
		return o;
	},

	/**
	 * 返回有类型的数据
	 * 如果没有定义类型，则返回原始数据
	 * @param {String} name 属性名，支持多级(a.b.c)
	 * @return {Object} 对象中对应的属性
	 */
	getData : function(name){
		var data = this.getRawData(name);

		if ($.isPlainObject(data)) {
			if (data["totalPage"]){
				data["translator"]=this.translator;
				data["dicts"]=this.translateBodys;
			}
		}

		return data;
	}

};
/**
 * 服务调用返回值 : 成功
 * @property SUCCESS
 * @type {Number}
 */
JsonResult.SUCCESS = 200;
/**
 * 服务调用返回值 : 失败
 * @property FAILURE
 * @type {Number}
 */
JsonResult.FAILURE = -1;
/**
 * 服务调用返回值 : 警告
 * @property WARN
 * @type {Number}
 */
JsonResult.WARN = 1;
/**
 * 服务调用返回值 : 未认证
 * @property UN_AUTHED
 * @type {Number}
 */
JsonResult.UN_AUTHED = -999;
return JsonResult;
});

/**
 * 针对jquery增加ajax的扩展
 */
define('app/data/app-ajax',["app/core/app-jquery","app/core/app-core","app/util/app-utils",
        "app/widgets/window/app-messager","app/core/app-options",
        "app/data/app-json-result"],
        function($,$A,$utils,$messager,$options,JsonResult) {
	
	
	var _ajaxProgressBar = $("#_ajaxProgressBar");
	
	if (_ajaxProgressBar.length==0){
	
		$("body").prepend('<div id="_ajaxProgressBar" class="ajaxProgressBar" style="display:none;"><!--<div class="ajaxProgressBarText">数据处理中..</div>--></div>')
		_ajaxProgressBar= $("#_ajaxProgressBar");
	}
	
	$(document).ajaxStart(function(){
		_ajaxProgressBar.show();
	}).ajaxStop(function(){
		_ajaxProgressBar.hide();
	}).ajaxError(function(){
		_ajaxProgressBar.hide();
	})
	$A.loadLogin=function(){
		
		//	window.location.href="main.do";
			window.location.reload();	
		}
	
	/**
	 * 回调用方法列表
	 */
	function _callback(funcs,json,$toggle){
		if(funcs == null)
			return;
		if(typeof funcs === "string")
			funcs = funcs.split(",");
		if(!$.isArray(funcs))
			return
		for(var i = 0; i < funcs.length; i++){
			if($.isFunction($A.ajax.callbackFunctions[funcs[i]])){
				$A.ajax.callbackFunctions[funcs[i]](json,$toggle);
			}
		}
	};
	/**
	 * ajax之前调用的方法
	 * @param $toggle 触发元素
	 * @param options ajax选项
	 * @returns 是否可以继续调用
	 */
	function _breforeCall(options){
		var $toggle=options.toggle
			,funcs = options.beforeCall||($toggle?$toggle.attr("ajax-before"):null);
		if(!funcs)
			return true;
		funcs = funcs.split(",");
		var i = options['_beforeCallIndex']||0;
		for(;i < funcs.length; i++){
			var fn = $A.ajax.beforeCallFunctions[funcs[i]];
			options['_beforeCallIndex'] = i+1;
			if(!$.isFunction(fn))
				continue;
			if(!fn(options))
				return false;
		}
		return true;
	}
	
/**
	 * 表单提交后的方法处理
	 */
	var that = {
		callbackFunctions:{
			/**
			 * 刷新表格对象
			 */
			refreshTable:function(json,options){
				var $toggle = options.toggle;
				if($toggle && $toggle.attr("refreshTable")){
					$A($toggle.attr("refreshTable")).bsgrid("reload");
				}else if(options["refreshTable"]){
					$A(options["refreshTable"]).bsgrid("reload");
				}else{
					$A(".jqgrid").bsgrid("reload");
				}
			},
			/**
			 * 刷新表格对象
			 */
			refreshMainDetail:function(json,options){
				var params = json.params;
				if(!params)
					return;
				$(params).each(function(key,value){
					var $ctrl = $A(key);
					if($ctrl.length == 0)
						return;
					if($ctrl.isForm()){
						$ctrl.refreshFormData(value);
					}else if($ctrl.isGrid()){
						if(!value)
							return;
						if(options.submitMode=="all"){
							$ctrl.bsgrid("refreshAllData",value);
						}else{
							$ctrl.bsgrid("refreshEditData",value);
						}
					}
				});
			},
			/**
			 * 通过ajax方式刷新当前页面
			 */
			refreshAjaxPage:function(json,options){
				var $toggle = options.toggle;
				var box = json.refreshBox||options['refreshBox']||$toggle.attr('refreshBox')||$toggle.attr('data-target')
					,$box=$(box)
					,url = json.url||options['refreshUrl']||$toggle.attr('refreshUrl')||$box.attr("url");
				if(url && $box.length>0)
					$box.htmlAJAX({url:url});
			},
			/**
			 * 刷新当前页面
			 */
			refreshPage:function(json,options){
				window.location.reload();
			},
			/**
			 * 刷新数据加载器
			 */
			reloadDataLoader:function(json,options){
				var $toggle = options.toggle;
				var target = json.dataloader||options["dataloader"]||($toggle?$toggle.attr("dataloader"):null);
				$(target).dataloader("load");
			},
			/**
			 * 跳转到其他页面
			 */
			forwardUrl:function(json,options){
				var $toggle = options.toggle;
				var url=json.forwardUrl||options["forwardUrl"]||($toggle?$toggle.attr("forwardUrl"):null);
				if(window.location.href == url)
					return;
				window.location=url;
			},
			/**
			 * 关闭自己
			 */
			closeSelf:function(json,options){
				var $dialog = $A.getCurrentDialog();
				if($dialog&&$dialog.length>0){
					$A.dialog.close($dialog);
					return;
				}
				$A.navTab.closeCurrentTab();
			},
			/**
			 * 切换页签
			 */
			switchTab:function(json,options){
				var tabId=json.tabId||options.tabId;
				var $tab = $("#"+tabId,$A.getContainer());
				$tab.tab("show");
			},
			/**
			 * 回调方法
			 */
			callMethod:function(json,options){
				var $toggle = options.toggle;
				var method = json.method||options["callMethod"]||($toggle?$toggle.attr("callMethod"):null);
				if(method){
					method = decodeURIComponent(method);
					setTimeout(new Function(methodName), 100);
				}
			}
		},
		beforeCallFunctions:{
			/**
			 * 收集数据并作为参数
			 * @param options ajax调用选项
			 */
			collectData:function(options){
				var $toggle=options.toggle
					,finder = options.collectFinder||($toggle?$toggle.attr("collectFinder"):null)
					,valAttr = options.collectAttr||($toggle?$toggle.attr("collectAttr"):'value')
					,param = options.collectParam||($toggle?$toggle.attr("collectParam"):'checkId')
					,box = options.collectBox||($toggle?$toggle.attr("collectBox"):document)
					,$box = $(box);
				if(!finder)
					return true;
				var paramVal = [];
				$(finder,$box).each(function(){
					paramVal.push($(this).attr(valAttr));
				});
				if(paramVal.length>0){
					if(paramVal.length == 1)
						paramVal = paramVal[0];
					var data = options['data'];
					if(!data){
						data = options['data'] = {};
					}
					data[param]=paramVal;
				}
				return true;
			},
			/**
			 * 调用前确认提示
			 */
			confirmPrompt:function(options){
				var $toggle=options.toggle
					,prompt=options.confirm||($toggle?$toggle.attr("confirm"):null);
				if (prompt) {
					prompt = prompt.evalTemplate($toggle);
					if(!prompt)
						return;
					$messager.confirm(prompt, {
						okCall: function(ok){
							return ok&&$A.ajax.ajaxCall(options);
						}
					});
					return false;
				}
				return true;
			}
		},
		/**
		 * ajax成功后调用的方法
		 */
		successCall:function(json,options){
			/*that.ajaxSuccess(json);
			if (json.statusCode != null&&json.statusCode != $A.statusCode.ok)
				return;
			var $toggle = options.toggle;
			_callback(json.callbackType,json,options);
			var cb = options.afterCall;
			if(cb){
				_callback(cb,json,options);
			}
			if($toggle && $toggle.length>0)
				_callback($toggle.attr("callback"),json,options);
			if(options.callback){
				options.callback(json,options);
			}*/
		},
		
		respToResult:function(src){
	    	var o=null;
	    	var reuslt
	    	if ($.type(src) === "string") {
	    		try{
	    			
	    		 o = $.parseJSON(src);
	    		}catch(ex){
	    			o=src;
	    		}
	    	} else if ($.isPlainObject(src) && src.responseText) {
	    		try{
	    		o = $.parseJSON(src.responseText);
	    		}catch(ex){
	    			try{
	    			o = $A.jsonEval(src.responseText);
	    			
	    			
	    			}
	    			catch(ex){
	    				o=src.responseText;
	    			}
	    		}
	    	} else {
	    		o = src;
	    	}
	    	if (o && o["type"]&&o["type"]=="__bosssoft"){
	    		reuslt = new JsonResult(o);
	    	}else{
	    		reuslt=o;
	    	}
	    	return reuslt;
	    },
		/**
		 * ajax 远程调用
		 */
		ajaxCall:function(config){
			var _self=this;
			var options = $.extend({
				type:'POST',
				dataType:"json",
				cache: false,
				failure : function(data,jr) {
					$messager.error(jr.getMessage());
				}
			},config);
			
			if (options.success || options.failure) {
				var processSuccess = options.success||options.callback;
				var processFailure = options.failure;
                processSuccess = $.isFunction(processSuccess)?processSuccess:$.noop;
                processFailure = $.isFunction(processFailure)?processFailure:$.noop;
                options.success = function(resp, opts) {
					
					try{
					var json=_self.respToResult(resp);
					_self.ajaxSuccess(json, opts)
					if (json instanceof JsonResult){
						code = json.getCode();
						message = json.getMessage();
						if (code === JsonResult.SUCCESS) {
							processSuccess(json.getData(),json, opts);
						} else {
							processFailure(json.getData(),json, opts);
						}
					}else{
						processSuccess(json, opts);
					}
					}catch(ex){
						if (window.console){
							window.console.log(ex);
						}else{
							$messager.error('系统繁忙！请稍后重试...');
						}
						ajaxDebugInfo(options, resp, opts);
					}
				}
			}
			
			if (options.error) {
				var processError=options.error;
				options.error=function(xhr, ajaxOptions, thrownError, options){
						var json=_self.respToResult(xhr);
						processError(json,xhr, ajaxOptions, thrownError, options)
				}
				
			}else{
				options.error=that.ajaxError;
			}
			
			if(!_breforeCall(options))
				return;
			if (options.data){
			if('object' == $.type(options)){//Mr.T 如果为对象 则将对象按照请求类型进行字符串拼接
				if((options.contentType && options.contentType.indexOf('application/json') > -1)){
					options.data = JSON.stringify(options.data);
				}else{
					options.data = $.param(options.data, true);
				}
			}
			}
			var result = $.ajax(options);
			//如果為同步代碼，验证返回是否
			if(options.async==false){
				try{
                    result = eval(result);
                    if($.type(result)==='object'){
                        result.statusCode&&$A.ajax.ajaxSuccess(result);
                    }
                }catch(e) {
					//TODO
				}

			}
			return result;
		},

		/**
		 * ajax访问错误处理
		 */
		ajaxError:function (xhr, ajaxOptions, thrownError, op){
			if(xhr.status=="401"){
				//$A.ajaxLogin();
			}else if(xhr.status=="405"){
				
			}else if(xhr.status=="404"){
				$messager.error("找不到对应的URL地址");
			}
			else{
				var json=that.respToResult(xhr);
				if (json instanceof JsonResult){
					$messager.error(json.getMessage());
				}else{
					var message=json["message"]||"网络异常,请求出错!"
					$messager.error(message);
				}
			}
				/**
				$messager.error("<div>Http status: " + xhr.status + " " + xhr.statusText + "</div>" 
						+ "<div>ajaxOptions: "+ajaxOptions + "</div>"
						+ "<div>thrownError: "+thrownError + "</div>"
						+ "<div>"+xhr.responseText+"</div>");
						**/
//			}else{
//				$messager.error("系统发生异常,请联系管理员");
//			}
			if( this.errorHandle && $.isFunction(this.errorHandle)){
				this.errorHandle();
			}
		},
		/**
		 * ajax访问成功后的处理
		 */
		ajaxSuccess:function (json){
			if(json.statusCode == $A.statusCode.error || json.statusCode == $A.statusCode.internalError|| json.statusCode == $A.statusCode.notFound) {
				if(json.message)
					$messager.error(json.message);
			} else if (json.statusCode == $A.statusCode.timeout) {
				
					$messager.error(json.message, {okCall:$A.loadLogin});
			
			} else {
				if(json.message)
					$messager.correct(json.message);
			};
		}
	};
	$A.ajax = that;
	$.fn.extend({
		/**
		 * 通过ajax请求向元素内部增加请求结果html
		 * @url{string}请求的地址
		 * @data{object}请求数据
		 * @callback{function}回调方法
		 */
		loadUrl: function(url,data,callback){
			$(this).htmlAJAX({url:url, data:data, callback:callback});
		},
		/**
		 * 当前容器加载URL内容
		 * @param options 加载选项
		 * {
		 * 		type:请求方式POST/GET默认POST
		 * 		cache:是否缓存true/false默认false 
		 * 		async:是否异步true/false默认true
		 * 		global:是否为全局请求(是否会触发ajaxStart和ajaxEnd的事件)默认为true
		 * 		success:请求成功时的方法处理
		 * 		error:请求失败的方法处理
		 * 		operator:加载内容后内容处理append/prepend/before/after/inner，默认设置为当前元素的内容
		 * 		init:是否进行界面初始化，默认为true
		 * 		history:true
		 * }
		 * 
		 */
		loadAppURL: function(options){
			var $this = $(this);
			
			if ($.fn.xheditor) {
				$("textarea.editor", $this).xheditor(false);
			}
			var op = {
				type:'POST',
				cache:false,
				async:true,
				init:true,
				history:false,
				title:window.title,
				
				complete:function(response,flag,responses, responseHeaders ){
					if (response.status=="404"){
						$messager.error("找不到对应的URL地址");

					}
					
				},
				success:function(response,flag,xhr){
					var loadMask;
					if(op.history){
						var title=this.title;
						var url=this.url;
						History.pushState({title:title,url:url},title,url);
					}
					var json = $A.jsonEval(response);
					if (json.statusCode==$A.statusCode.timeout){
						/*session超时处理*/
						if(json.message) 
							$messager.error(json.message, {okCall:$A.loadLogin});
						else
							$A.loadLogin();
					} else if (json.statusCode==$A.statusCode.error|| json.statusCode == $A.statusCode.internalError|| json.statusCode == $A.statusCode.notFound){
						/*错误处理*/
						if(json.message)
							$messager.error(json);
							if (options.error&&$.isFunction(options.error)){
					
							options.error.call(this,arguments)
					
					}
					} else {
//						var funcId = xhr.getResponseHeader("funcid");
//						var menuId = xhr.getResponseHeader("menuid");
//						var subSysId = xhr.getResponseHeader("subSysId");
//						if(funcId&&menuId){
//							$this.data("__funcid",funcId);
//							$this.data("__menuid",menuId);
//							$this.data("__subsysid",subSysId);
//						}
						$this.css('visibility','hidden');
						switch(this.operator){
						case "append":
							$this.append(response);
							break;
						case "prepend":
							$this.prepend(response);
							break;
						case "before":
							$this.before(response);
							break;
						case "after":
							$this.after(response);
							break;
						case "replace":
							$this=$this.replaceWith(response);
							break;
						default:	
						
						if(op.loading){
						    loadMask=$("<div class=\"loadingPage-mask\"></div>");
						    $this.html(response)
						    loadMask.height( $this.innerHeight());
					    	loadMask.width( $this.innerWidth());
						   	$this.prepend(loadMask);
						}else{
							 $this.html(response)
						}
						}
						
						
						if ($.isFunction(this.beforePageInit)){
							$A.resolveUiPageModel($this);
							this.beforePageInit($this, model);
						}
                        if(this.onPageLoad){
                            $this.one($A.eventType.pageLoad,{"pageLoadFunc":this.onPageLoad,"uiPageModel":$this.data("uiPageModel")},function(e){
                                e.data["pageLoadFunc"]($this.data("uiPageModel"));
                                if (loadMask){
                                    loadMask.remove();
                                }
                                $this.css('visibility', '');
                            });
                        }else {
                            $this.one($A.eventType.pageLoad, function () {
                                if (loadMask) {
                                    loadMask.remove();
                                }
                                $this.css('visibility', '');
                            })
                        }
                        // 如果可能页面没js 执行速度回比较快，执行不到监听回调  $this.one($A.eventType.pageLoad
                        if(options.init !==false){
                            $this.initPageUI();
                        }
                        if ($.isFunction(this.callback)){
							//add by tw
							this.callback(response,$this.data("uiPageModel"));
						}
					}
					$this.fadeIn();
				},
				error:function (xhr, ajaxOptions, thrownError){
					if (options.error&&$.isFunction(options.error)){
					
							options.error.call(this,arguments)
					
					}
					//that.ajaxError(xhr, ajaxOptions, thrownError);
					if(xhr.status=="401"){
						//$A.ajaxLogin();
					}else if(xhr.status=="405"){
						
					}else{
						this.success(xhr.responseText);
						$this.fadeIn();
					}
				}
			};
			op = $.extend(op,$options.ajax,options);
			//如果是ie，url进行中文 encodeURI
			if (!$.browser.webkit){
				if (op.url){
					op.url=encodeURI(op.url)
				}
			}
			$.ajax(op);
		},
		appendAJAX:function(options){
			options.operator='append';
			$(this).loadAppURL(options);
		},
		prependAJAX:function(options){
			options.operator='prepend';
			$(this).loadAppURL(options);
		},
		breforeAJAX:function(options){
			options.operator='before';
			$(this).loadAppURL(options);
		},
		afterAJAX:function(options){
			options.operator='after';
			$(this).loadAppURL(options);
		},
		replaceAJAX:function(options){
			options.operator='replace';
			$(this).loadAppURL(options);
		},
		htmlAJAX:function(options){
			options.operator=null;
			$(this).loadAppURL(options);
		}

	});
	$("body").on("click.data-api","[ajax-toggle='ajax']", function(event){
		event.preventDefault();
		var $this = $(this)
			,url = $utils.evalElementAttr($this);
		if (!url) {
			return false;
		}
		that.ajaxCall({url:url,toggle:$this});
	});
	return that;
	/**
	 * ajax请求回执处理异常信息打印
	 */
	function ajaxDebugInfo(options, resp, status){
		if(window.debugModel){
			var msg = ['请求地址：' + options.url];
			msg.push('请求处理状态：' + status);
			msg.push('请求处理结果：' + resp);
			alert(msg.join('。'));
		}
	}
});
define('app/widgets/drag/app-drag',["app/core/app-jquery","app/core/app-core"],function($,App){
	$.fn.drager = function(options){
		if (typeof options == 'string') {
			if (options == 'destroy') 
				return this.each(function(){
					$(this).unbind('mousedown', App.dragTool.start);
					$.data(this, 'app/widgets/drag/app-dragdata', null);
				});
		}
		return this.each(function(){
			var el = $(this);
			$.data(App.dragTool, 'app/widgets/drag/app-dragdata', {
				options: $.extend({
					el: el,
					obj: el
				}, options)
			});
			if (options.event) 
				App.dragTool.start(options.event);
			else {
				var select = options.selector;
				$(select, obj).bind('mousedown', App.dragTool.start);
			}
		});
	};
	App.dragTool = {
		start: function(e){
			document.onselectstart=function(e){return false};//禁止选择

			var data = $.data(this, 'app/widgets/drag/app-dragdata');
			var el = data.options.el[0];
			$.data(el, 'app/widgets/drag/app-dragdata', {
				options: data.options
			});
			if (!App.dragTool.current) {
				App.dragTool.current = {
					el: el,
					oleft: parseInt(el.style.left) || 0,
					otop: parseInt(el.style.top) || 0,
					ox: e.pageX || e.screenX,
					oy: e.pageY || e.screenY
				};
				$(document).bind("mouseup", App.dragTool.stop).bind("mousemove", App.dragTool.drag);
			}
		},
		drag: function(e){
			if (!e)  var e = window.event;
			var current = App.dragTool.current;
			var data = $.data(current.el, 'app/widgets/drag/app-dragdata');
			var left = (current.oleft + (e.pageX || e.clientX) - current.ox);
			var top = (current.otop + (e.pageY || e.clientY) - current.oy);
			if (top < 1) top = 0;
			if (data.options.move == 'horizontal') {
				if ((data.options.minW && left >= $(data.options.obj).cssNum("left") + data.options.minW) && (data.options.maxW && left <= $(data.options.obj).cssNum("left") + data.options.maxW)) 
					current.el.style.left = left + 'px';
				else if (data.options.scop) {
					if (data.options.relObj) {
						if ((left - parseInt(data.options.relObj.style.left)) > data.options.cellMinW) {
							current.el.style.left = left + 'px';
						}
					} else 
						current.el.style.left = left + 'px';
				}
			} else if (data.options.move == 'vertical') {
					current.el.style.top = top + 'px';
			} else {
				var selector = data.options.selector ? $(data.options.selector, data.options.obj) : $(data.options.obj);
				if (left >= -selector.outerWidth() * 2 / 3 && top >= 0 && (left + selector.outerWidth() / 3 < $(window).width()) && (top + selector.outerHeight() < $(window).height())) {
					current.el.style.left = left + 'px';
					current.el.style.top = top + 'px';
				}
			}
			
			if (data.options.drag) {
				data.options.drag.apply(current.el, [current.el]);
			}
			
			return App.dragTool.preventEvent(e);
		},
		stop: function(e){
			var current = App.dragTool.current;
			var data = $.data(current.el, 'app/widgets/drag/app-dragdata');
			$(document).unbind('mousemove', App.dragTool.drag).unbind('mouseup', App.dragTool.stop);
			if (data.options.stop) {
				data.options.stop.apply(current.el, [current.el]);
			}
			App.dragTool.current = null;

			document.onselectstart=function(e){return true};//启用选择
			return App.dragTool.preventEvent(e);
		},
		preventEvent:function(e){
			if (e.stopPropagation) e.stopPropagation();
			if (e.preventDefault) e.preventDefault();
			return false;			
		}
	};
	return App.dragTool;
});

define('app/widgets/drag/app-dialogdrag',["app/core/app-jquery","app/core/app-core","app/data/app-ajax","app/widgets/drag/app-drag"],function($,$a,$ajax){
	var dialogDragTarget=".dialog-header,.dlg-box-head";
	
	function disableSelection(){
//		document.onselectstart=function(){return false;};
//		$("body").css("-moz-user-select","none");
	}
	
	function enableSelection(){
//		document.onselectstart=function(){return true;};
//		$("body").css("-moz-user-select","inherit");
	}
	
	$.fn.dialogDrag = function(options){
		if (options&&options.dragTarget){
			dialogDragTarget=options.dragTarget;
		}else{
			dialogDragTarget=".dialog-header,.dlg-box-head";
		}
        if (typeof options == 'string') {
            if (options == 'destroy') 
				return this.each(function() {
						var dialog = this;
						
						$(dialogDragTarget, dialog).unbind("mousedown");
                });
        }
		return this.each(function(){
			var $dlg = $(this);
			$(dialogDragTarget, $dlg).mousedown(function(e){
//				//如果是在dialogheader中的A上触发的，则不拖拽
				disableSelection();
				var $target = $(e.target);
				if($target.is('label')|| $target.is('input')
					||$target.is("a")||$target.parents("a").size()>0){
					return;
				}
				$a.dialog.switchDialog($dlg);
				$dlg.data("task",true);
				setTimeout(function(){
					if($dlg.data("task"))
						$.dialogDrag.start($dlg,e);
				},100);
				
				//modify by tw，拖拽的mouseup事件绑定在document上，并且在mouseup后自动删除该事件
				$(document).on("mouseup",{"$dlg":$dlg},function(e){
					$dlg.data("task",false);
					$(document).unbind("mouseup",arguments.callee);
					enableSelection();
					return true;
				});
				
				return true;//Mr.t 事件继续传播
			});
		});
	};
	$.dialogDrag = {
		_init:function($dlg) {
			var $shadow = $("#dialogProxy");
			if (!$shadow.size()) {
				$shadow = $($a.frags["dialogProxy"]);
				$("body").append($shadow);
			}
			$("h5", $shadow).html($(dialogDragTarget+" h5", $dlg).html());
		},
		start:function($dlg,event){
				this._init($dlg);
				var $shadow = $("#dialogProxy");
				$shadow.css({
					left: $dlg.css("left"),
					top: $dlg.css("top"),
					marginLeft: $dlg.css("marginLeft"),
					height: $dlg.css("height"),
					width: $dlg.css("width"),
					zIndex:parseInt($dlg.css("zIndex")) +1
				}).show();
				$("div.dialog-content",$shadow).css("height",$("div.dialog-content",$dlg).css("height"));
				$shadow.data("dialog",$dlg);
				//$dlg.css({left:"-10000px",top:"-10000px"});
				$shadow.drager({
					selector:dialogDragTarget,
					stop: this.stop,
					event:event
				});
				return false;
		},
		stop:function(){
			var $shadow = $(arguments[0]);
			var $dlg = $shadow.data("dialog");
			$dlg.css({left:$shadow.css("left"),top:$shadow.css("top")});
			$shadow.hide();
		}
	};
});
/**
 * 对话框
 */
define('app/widgets/window/app-dialog',["app/core/app-jquery","app/core/app-core","app/data/app-ajax","app/core/app-options","app/widgets/drag/app-dialogdrag"],function($,$A,$ajax,$options) {
    //对话框状态
    var DIALOG_STATE ={
        OPENING:0,
        OPENED:1,
        TAG:'_dialog_open_statue'
    };

	/**
	 * 内部方法显示对话框
	 */
	function showDialog($dlg,options){
		 if (options.mask) {
				var $mask = $("#_dialogMask");
				if($mask.size() == 0){
					$("body").append("<div id='_dialogMask' class='dialog-mask'></div>");
				}
				$mask.css("zIndex",$options.zindexs.dialogMask);
				$("#_dialogMask").show();
			 }
		 var $h5 = $("div.dialog-header h5,div.dlg-box-head h5",$dlg);
		 if($h5.length>0&& !$h5.html()){
			 var $ti = $("title",$dlg);
			 var html = $ti.html();
			 $ti.remove();
			 if(!html){
				 html=options["title"]||"对话框";
			 }
			 var icon = $ti.attr("icon")||options.icon;
			 if(icon){
				 html= '<i class="'+icon+'"></i><span>'+html+"</span>";
			 }
			 $h5.html(html);
		 }
		 $dlg.one('hide', function () {
			 if(options.src)
			 	$(options.src).focus();
			 var hideHandle = options['closeCallback'];
			 if(hideHandle && $.isFunction(hideHandle)){
				 hideHandle($dlg,options);
			 }
		 });
	
		 if ($("body").height()<$dlg.height()){
		 	$dlg.height($("body").height());
		 }

		 	var $dlgContent=$(".dialog-content",$dlg);
			 var $header=$(".dialog-header,.dlg-box-head",$dlg);
			 $header.on("selectstart",function(){return false;});
			 $header.on("copy",function(){return false;});
			 $header.on("paste",function(){return false;});
			 $header.on("cut",function(){return false;});
			 var $footer=$(".dialog-footer",$dlg);
			 	var height=Math.min($dlg.height(),$(document).height());
			 	var ch=$dlg.outerHeight()-$header.outerHeight()-$footer.outerHeight();
				$dlgContent.innerHeight(ch);
				if (options.width){

					if ($dlgContent.outerWidth()>options.width){

						$dlg.width($dlgContent.outerWidth())
					}
				}
			 	
		 $A.dialog.relayout($dlg);
		
	
		
		 $A.dialog.setCurrent($dlg);
		 var callback = options['callback'];
		 if(callback && $.isFunction(callback)){
			 callback($dlg,options);
		 }
		 	if (options&&options.afterShow){
				options.afterShow.call(this,$dlg);
		}
		 	
		 if(options.mode=="url"){
		  $dlg.on($A.eventType.pageLoad,function(){
					timeout = setTimeout(function() {
						$dlg.css("visibility", "");
						$dlg.show();
					}, 50);
					
					
					
		})
		 	}else{
		 		
		 		$dlg.css("visibility", "");
				$dlg.show();
		 	}

        $dlg.data(DIALOG_STATE.TAG,DIALOG_STATE.OPENED);
	 };
	/**
	 * 对话框堆栈
	 */
	$A.dialog = {
		_op:{
			hasheader:true,
			mask:true, 
			dragTarget:null,
			drawable:true,
			reload:true,
			mode:"url",
			beforShow:function(){},
			afterShow:function(){},
			afterClose:function(){}
		},
		_current:[],
		_zIndex:42,
		/**
		 * 取得当前对话框
		 */
		getCurrent:function(){
			if(this._current.length==0)
				return null;
			return this._current[this._current.length-1];
		},
		getDialog:function(dlgId){
			for(var i=0,n=this._current.length;i<n;i++){
				if(this._current[i].is("#"+dlgId)){
					return this._current[i];
				}
			}
			return null;
		},
		/**
		 * 取得当前对话框
		 */
		relayout:function($dlg){
			if(!$dlg)
				$dlg = this.getCurrent();
			$dlg.css( "left", Math.max(($(window).width() - $dlg.width())/2,0) + "px" );
			$dlg.css( "top",  Math.max((document.body.clientHeight - $dlg.height())/2,0) + "px" );
			
		},
		/**
		 * 重新载入对话框内容
		 */
		reload:function(url, options){
			var $dlg = (options.dialogId && $("#_dialogs #"+options.dialogId)) || this.getCurrent();
			if (!$dlg||$dlg.size()==0)
				return;
			var op = $.extend({},$dlg.data("options"), options);
			$dlg.data("options",op);
			if(op.hasheader)
				$dlg.find(">:not(:first)").remove();
//			else
//				$dlg.html("");
			$dlg.data("url",url);
			if(op.reload){
				$dlg.attr("reload","true");
			}else{
				$dlg.removeAttr("reload");
			}
			if(options.mode=="url"){
				  
				var p = {
					type:"POST", 
					url:url,
					data:op.params,
					history:false,
					operator: op.operator ? op.operator : "append",
					callback:function(response){
						
					
						//$dlg.find("[layoutHeight]").layoutHeight($dlg);
						$(".btn.close", $dlg).click(function(){
							$A.dialog.close($dlg);
							return false;
						});
						if (op.dragTarget){
							$dlg.dialogDrag(op);
						}else if(op.drawable&&!op.hasheader){
							$dlg.dialogDrag(op);
						}
						 $A.dialog.setCurrent($dlg)
						if (options && options.beforShow) {
							options.beforShow.call(this, $dlg);
						}
						//$dlg.css("visibility","hidden");

						showDialog($dlg, op);
					},error:function(){
						  $dlg.data(DIALOG_STATE.TAG,"");
					}
				};
				if(options.onPageLoad){
					p["onPageLoad"] = options.onPageLoad;
				}
				if(options.beforePageInit){
					p["beforePageInit"] = options.beforePageInit;
				}	
				$dlg.loadAppURL(p);
			
			}else if(options.mode=="html"){
				$dlg.append(url);
				//$dlg.find("[layoutHeight]").layoutHeight($dlg);
				$(".btn.close", $dlg).click(function(){
					$A.dialog.close($dlg);
					return false;
				});
				if (options && options.beforShow) {
							options.beforShow.call(this, $dlg);
						}
				//add by tw 在initPageUI之后在重新计算一次位置
				$dlg.one($A.eventType.pageLoad,{"$dlg":$dlg},function(e){
					$A.dialog.relayout(e.data.$dlg);
				});
				
				$dlg.initPageUI();
				showDialog($dlg,op);
			}else if(options.mode=="node"){
				if(options.hasheader){
	                $dlg.find(">:not(.dialog-header)").remove();
				}else{
					$dlg.empty();
				}
				$dlg.append($(url));
				//$dlg.find("[layoutHeight]").layoutHeight($dlg);
				$(".btn.close", $dlg).click(function(){
					$A.dialog.close($dlg);
					return false;
				});
				if(options.onPageLoad){
					$dlg.one($A.eventType.pageLoad,{"$dlg":$dlg},function(e){
						options.onPageLoad(options,$dlg);
						
						
					});
				}
				$dlg.initPageUI();
				if (options && options.beforShow) {
					options.beforShow.call(this, $dlg);
				}
						
				$dlg.dialogDrag(options);
						
				showDialog($dlg,op);
			}
			
		},
		/**
		 * 打开对话框
		 */
		open:function(url, dlgid, title, options) {
			var $dialogs = $('#_dialogs');
			if($dialogs.size() == 0){
				$('body').append('<div id="_dialogs"></div>');
				$dialogs = $('#_dialogs');
			}
			if(typeof url == "object"){
				options=url;
				url=options.url;
				dlgid=options.dialogId;
				title=options.title;
			}else if(typeof dlgid == "object"){
				options=dlgid;
				dlgid=options.dialogId;
				title=options.title;
			}else if(typeof title == "object"){
				options=title;
				title=options.title;
			}
			var $dlg = $("#"+dlgid,$dialogs);
			if($dlg.size() == 0 && url=="#")
				 return;
			if(!dlgid){
				dlgid = "dialog"+$A.nextId();
			}
			options["dialogId"]=dlgid;
			options["title"]=title;
			var op = $.extend({},$A.dialog._op, options);
			//重复打开一个层
			if($dlg.size()>0) {
//				if(width>0){
//					$dlg.css("width",width);
//					$dlg.css("marginLeft",0-width/2);
//				}
                //获取dialog 目前状态
                var dlgOpState = $dlg.data(DIALOG_STATE.TAG);
                if(dlgOpState===DIALOG_STATE.OPENING){
                    return;
                }
                $dlg.data(DIALOG_STATE.TAG,DIALOG_STATE.OPENING);

				if(op.reload || url != $dlg.data("url")){
					this.reload(url,op);
				}else{
					showDialog($dlg,op);
				}
				//初始化对话框时，加载自定义绑定数据
				$dlg.removeData("bindData");
				if(op.bindData){
					$dlg.data("bindData",op.bindData);
				}

			} else { //打开一个全新的层
				if(op.hasheader){
					var ht=$template($A.frags["dialogFrag"],op);
					$dialogs.append($(ht.toString()));
				}else{
					var ht=$template($A.frags["dialogNoHeaderFrag"],op);
					$dialogs.append($(ht.toString()));
				}
				$dlg = $(">.dialog:last-child", $dialogs);
				//对话框添加状态
                $dlg.data(DIALOG_STATE.TAG,DIALOG_STATE.OPENING);
                //初始化对话框时，加载自定义绑定数据
				if(op.bindData){
					$dlg.data("bindData",op.bindData);
				}
				
				($.fn.bgiframe && $dlg.bgiframe());
				/*注册事件*/
				var pageLoad = op[$A.eventType.pageLoad];
				if(typeof pageLoad =="function"){
					$dlg.on($A.eventType.pageLoad,pageLoad);
				}else if(op.pageLoad===false){
					$dlg.unbind($A.eventType.pageLoad);
				}
//				if(width>0){
//					$dlg.css("width",width);
//					$dlg.css("marginLeft",0-width/2);
//				}
				
				$dlg.find(".dialog-header").find("h5").html(title);
				 if(options.width){
					 $dlg.css( "width", options.width);
				 }
				 if(options.height){
					// $dlg.css( "height", options.height);
				 		$dlg.innerHeight(options.height);
					 
				 }
				if(!op.mask){
					$dlg.click(function(){
						$A.dialog.switchDialog($dlg);
					});
				}
				
//				if(op.resizable)
//					$dlg.jresize();
				
				if(op.drawable&&op.hasheader)
					$dlg.dialogDrag();
				$("a.close", $dlg).click(function(event){ 
					$A.dialog.close($dlg,event);
					return false;
				});
				
//				$("div.dialog-header a", $dlg).mousedown(function(){
//					return false;
//				});
				$dlg.attr("reload",op.reload);
				this.reload(url,op);
				return $dlg;
			}
		},

		/**
		 * 设置当前对话框
		 */
		setCurrent:function($dlg) {
			var old = this.getCurrent();
			if(old&&old.is($dlg))
				return;
			$dlg.css("zIndex", ($options.zindexs.dialog));
			this._current.push($dlg);
			if(old)
				old.css("zIndex",$options.zindexs.dialogBack);
		},
		/**
		 * 切换当前层
		 * @param {Object} dialog
		 */
		switchDialog:function($dlg) {
			if($dlg == null || $dlg.length == 0)
				return;
			if($dlg.is(this.getCurrent()))
				return;
			var index = $dlg.css("zIndex");
			if(this.getCurrent()) {
				var cindex = $(this.getCurrent()).css("zIndex");
				$(this._current).css("zIndex", index);
				$dlg.css("zIndex", cindex);
				for(var i = 0; i< this._current.length; i++){
					if($dlg.equalObject(this._current[i])){
						this._current.splice(i,1);
					}
				}
				this._current.push($dlg);
			}
		},
		/**
		 * 关闭对话框
		 */
		close:function($dlg,event) {
			if ($dlg){
			var opt=$dlg.data("options");
			if (opt&&opt.beforeClose){
				
				if (opt.beforeClose.call(this,$dlg,event) === false){
					
					return;
				}
				
			}}
			if(typeof $dlg == 'string') 
				$dlg = $("#_dialogs #"+$dlg);
			if($dlg == null || $dlg.length == 0)
				return;
			$dlg.css("display","none");
			for(var i = 0; i< this._current.length; i++){
				if($dlg.equalObject(this._current[i])){
					this._current.splice(i,1);
				}
			}
			var cr= this.getCurrent();
			
			if(cr!=null)
				cr.css("zIndex", $options.zindexs.dialog);
			else
				$("#_dialogMask").hide();
			$dlg.trigger("hide");
			if($dlg.attr("reload")=="true"){
				$A.destroyDom($dlg);
				$dlg.trigger($A.eventType.pageDestroy).remove();
			}
			if (opt&&opt.afterClose){
				opt.afterClose.call(this,$dlg)
			}
		},
		/**
		 * 关闭当前对话框
		 */
		closeCurrent:function(){
			this.close(this.getCurrent());
		},
		//添加绑定数据功能
		getBindData:function($dlg){
			if(!$dlg){
				$dlg = this.getCurrent();
			}
			return $dlg.data("bindData");
		},
		checkTimeout:function(){
			var $conetnt = $(".dialog-content", this.getCurrent());
			var json = $A.jsonEval($conetnt.html());
			if (json && json.statusCode == $A.statusCode.timeout) this.closeCurrent();
		}
	};
	
	/**
	 * 对话框
	 */
	$.fn.closeDialog = function(){
		$A.dialog.close($(this));
	};
	
	$.fn.showDialog = function(){
		 $A.dialog.setCurrent($(this));
		 $(this).show();
	};
	/**
	 * 定义全局方法
	 */
	$.closeDialog = function($dlg){
		if($dlg){
			$dlg.closeDialog();
		}else{
			$A.dialog.closeCurrent();
		}
	};
	/**
	 * 定义全局方法
	 */
	$.openModalDialog = function(options){
		return $A.dialog.open(options);
	};
	
	$(document).on('click',"a[target=dialog]", function (e) {
		e.preventDefault();
		var $this = $(this);
		var opt = $this.getJsonAttr("_dialog_options");
		$.openModalDialog(opt);
	});
	
	return $A.dialog;
	
});



define('app/app-funcbase',["app/core/app-jquery","app/core/app-core"],function ($,$A) {
	/**
	 * 系统函数库
	 */
	return {
		
		/**
		 * 打开对话框
		 */
		openDialog:function(options){
			if(typeof options === "string"){
				options = {url:options};
			}
			var path = options["url"];
			if(!path)
				return;
			if(path.indexOf(_contextPath)!=0){
				if(path.indexOf("/")!=0){
					path="/"+path;
				}
				path=_contextPath+path;
			}
			var dialogId = options["dialogId"];
			if(!dialogId){
				dialogId = "dialog"+$A.nextId();
				options["dialogId"]=dialogId;
				options["data-target"]="#"+dialogId;
			}
			options["url"]=path;
			require(["app/widgets/window/app-dialog"],function(){
				$.openModalDialog(options);
			});
		},
		
		/**
		 * 通过指定的表单地址在对话框中编辑当前选中列表数据
		 */
		editGridRowDialog:function(options){
			var that = this;
			require(["app/widgets/window/app-dialog","app/widgets/window/app-messager"],function($dialog,$messager){
				var gridId = options["gridId"];
				if(!gridId){
					$messager.error("请指定列表对象！");
					return;
				}
				var $grid = $A("#"+gridId);
				if($grid.length==0){
					$messager.error("请指定列表对象！");
					return;
				}
				var id = $grid.bsgrid('getSelectRowId');
				if (id)	{
					options["params"]={id:id};
					$.openModalDialog(options);
				} else { $messager.warn("请选中一行数据后再编辑！");}
			});
		},
		/**
		 * 通过指定的表单地址在对话框中编辑当前选中列表数据
		 */
		deleteGridSelRows:function(options){
			require(["app/widgets/window/app-messager","app/data/app-ajax"],function($messager,$ajax){
				var gridId = options["gridId"];
				if(!gridId){
					$messager.error("请指定列表对象！");
					return;
				}
				var $grid = $("#"+gridId);
				if($grid.length==0){
					$messager.error("请指定列表对象！");
					return;
				}
				var delUrl = options["delUrl"];
				if(!delUrl){
					$messager.error("请指定删除数据的服务地址！");
					return
				}
				if(!delUrl.startsWith("/")){
					delUrl="/"+delUrl;
				}
				delUrl = _contextPath + delUrl;
				var ids = $grid.bsgrid('getSelectRowId');
				if (ids&& ids.length>0)	{
					var op = {
							type:'POST',
							url:delUrl,
							data:{ids:ids},
							dataType:"json",
							cache: false,
							beforeCall:'confirmPrompt',
							confirm:"确认删除这些数据吗？",
							afterCall:'refreshTable'
						};
					$ajax.ajaxCall(op);
				} else { $messager.warn("请选中需要删除的数据！");}
			});
		},
		/**
		 * 通过指定的表单地址在对话框中编辑当前选中列表数据
		 */
		editSingleDataDialog:function(options){
			var that = this;
			require(["app/widgets/window/app-dialog","app/widgets/window/app-messager"],function($dialog,$messager){
				var loadUrl = options["url"];
				if(!loadUrl){
					$messager.error("请指定加载表单数据的服务地址！");
					return;
				}
				if(!loadUrl.startsWith("/")){
					loadUrl="/"+loadUrl;
				}
				loadUrl = _contextPath + loadUrl;
				var id=options["id"];
				if(!id){
					$messager.error("参数设置错误！");
					return;
				}
				options["params"]={id:id};
				options["url"]=loadUrl;
				$.openModalDialog(options);
			});
		},
		/**
		 * 通过指定的表单地址在对话框中编辑当前选中列表数据
		 */
		deleteSingleData:function(options){
			require(["app/widgets/window/app-messager","app/data/app-ajax"],function($messager,$ajax){
				var delUrl = options["url"];
				if(!delUrl){
					$messager.error("请指定删除数据的服务地址！");
					return;
				}
				if(!delUrl.startsWith("/")){
					delUrl="/"+delUrl;
				}
				delUrl = _contextPath + delUrl;
				var id=options["id"];
				if(!id){
					$messager.error("参数设置错误！");
					return;
				}
				var op = {
					type:'POST',
					url:delUrl,
					data:{id:id},
					dataType:"json",
					cache: false,
					beforeCall:'confirmPrompt',
					confirm:options[confirm]||"确认删除这些数据吗？",
					afterCall:'refreshTable'
				};
				$ajax.ajaxCall(op);
			});
		},
		/**
		 *  保存表单对话框
		 */
		saveFormDialog:function(options){
			if(typeof options === "string"){
				options = {formId:options};
			}
			var container = $A.getContainer();
			require(["app/widgets/form/app-form"],function(){
				var formId = options["formId"];
				if(formId){
					$("#"+options["formId"],container).submitForm(options);
				}else{
					$("form",container).submitForm(options);
				}
			});
		},
		/**
		 * grid列转义 0-->""  1-->√
		 */
		transferGridColumn:function(cellvalue, options, rowObject){
			
			return cellvalue == '1' ? "<font color='green'>√</font>" : "";
		},
		transferGridColumn2:function(cellvalue, options, rowObject){
			if(cellvalue == undefined){
				return '';
			}else{
				return cellvalue == '1' ? "<font color='green'>√</font>" : "<font style='color:red !Important'>╳</font>";
			}

		},
		/**
		 * form列转义 0-->""  1-->√
		 */
		transferFormColumn:function(value){
			 
			return value == '1' ? "<font color='green'>√</font>" : "";
			 
		},
		/**
		 * 关闭对话框
		 */
		closeDialog:function(){
			$A.dialog.closeCurrent();
		}
	}
});

define('bs-http-plugin/base-pluginvoke',["app/core/app-class",
    "app/core/app-attribute",
    "app/core/app-events",
    "bs-http-plugin/config",
    "bs-http-plugin/data-transmit/socket",
    "bs-http-plugin/util/uuid",
    "app/widgets/window/app-dialog",
    "app/widgets/window/app-messager",
    "base/dotpl-js",
    "app/app-funcbase",
    "base/base64"
], function (Class, Attribute, Events,Config,Socket,uuid) {

    //状态
    var STATE = {
        initParams:{
            code:0,
            name:'initializing',
            msg:'初始化'
        },
        initialized:{
            code:1,
            name:'',
            msg:'初始化完成'
        },
        state:function(name,op){
            return $.extend(true,{},STATE[name],op);
        }
    };


    /**
     * @desc 使用请引入 'bs-http-plugin/base-pluginvoke'
     * @class
     * @classdesc dll http 调用基类
     * @name base-pluginvoke
     * @extends Class
     *
     */
    var BasePluginvoke = Class.create({
        Implements: [Attribute, Events],
        /**
         * @type {string} dll名称，可在第一次实例化时指定
         * @memberOf base-pluginvoke
         * @instance
         * @example
         * var p = BasePluginvoke.create({
         *      module:'print',
         *      config:{appId:'xxxx'}
         *  });
         */
        module:'',
        /**
         *
         * @type {object}  dll名称 ，可在第一次实例化时指定。
         * @memberOf base-pluginvoke
         * @example
         * BasePluginvoke.getInstance({
		 * 	config:{
		 * 		appId:'xxxx'
		 * 	}
		 * })
         *@instance
         */
        config:{appId:'bosssoft'},
        /**
         *
         * @type {boolean}  调用博思客户端助手失败时是否自动弹出帮助对话框,如果设置为true请配置url地址。
         * @memberOf base-pluginvoke
         * @example
         * var instance = BasePluginvoke.getInstance({
		 * 	config:{
		 * 		appId:'xxxx'
		 * 	},
		 * 	isShowHelp:true
		 * })
         * instance.enableShowHelp();
         * instance.enableShowHelp('downloadUrl');
         * instance.disableShowHelp();
         *@instance
         */
        isShowHelp:true,

        /**
         *
         * @private
         * @type {string} 博思客户端下载地址
         * @memberOf base-pluginvoke
         * @example
         * var instance = BasePluginvoke.getInstance({
		 * 	config:{
		 * 		appId:'xxxx'
		 * 	},
		 * 	isShowHelp:true,
		 * 	downloadUrl:'xxxxxxxxxxx'
		 * })
         * BasePluginvoke.setDownloadUrl('xxxxxxxxxx');
         *@instance
         */
        downloadUrl:Config.downloadUrl,
        /**
         * @memberOf base-pluginvoke
         * @type {array} 自动生成函数列表。
         * @example
         *  var BsPrintX = BasePluginvoke.extend({
         *      functions:[
         *          {
         *           jsName:'initParams',    //js对象实例化后生成的方法吗
         *            dllName:'INIT_PARAMS',  //js对象方法调用后发送的请求参数，proc:'INIT_PARAMS'
         *            initRequired:false      //默认true，需要init返回的$.Deferred() 对象为resolve状态才能执行，为false时不需init返回的Deferred对象
         *        },
         *        'funts'//jsName = 'funts'，dllName = 'funts',initRequired = true
         *      ]
         *      //..........此处省略一坨代码
         * });
         *    var instance = BsPrintX.getIntance();
         *    instance.funts();
         * @instance
         */
        functions:[],
        /**
         * @memberOf base-pluginvoke
         * @type {array} 自动生成函数列表。
         * @example
         *  var BsPrintX = BasePluginvoke.extend({
         *      processes:[
         *          {
         *           jsName:'initParams',    //js对象实例化后生成的方法吗
         *            dllName:'INIT_PARAMS',  //js对象方法调用后发送的请求参数，proc:'INIT_PARAMS'
         *            initRequired:false      //默认true，需要init返回的$.Deferred() 对象为resolve状态才能执行，为false时不需init返回的Deferred对象
         *        },
         *        'funts'//jsName = 'funts'，dllName = 'funts',initRequired = true
         *      ]
         *      //..........此处省略一坨代码
         * });
         *    var instance = BsPrintX.getIntance();
         *    instance.initParams()
         * @instance
         */
        processes:[],
        /**
         * @private
         * @param op
         */
        initialize: function (op) {
            var _self = this;
            $.extend(_self,op);
            if(Config.initUpdate){
                BasePluginvoke.clientUpdate(Config.updateUrl);
            }
            _self.addConfig('version',Config.version);
            if(typeof _self['module'] === "undefined"){
                throw new Error('请设置module属性!');
            }
            //方法初始化functions
            _self.initMethods(_self.functions,'func');
            //过程初始化processes
            _self.initMethods(_self.processes,'proc');
            //初始化
            _self.initStateDefer = _self.init();
        },
        /**
         * @private
         * 初始化方法集
         * @param array
         * @param type
         */
        initMethods:function (array,type) {
            var _self = this;
            if($.isArray(array)){
                $(array).each(function (index,funName,callType) {
                    if(typeof _self[funName] === "undefined"){
                        _self.generateFun(funName,type);
                    }
                })
            }
        },
        /**
         *
         * @private
         * @memberOf base-pluginvoke
         * @description 在调用由functions或者processes方法列表生成的js方法，如果需要添加配置项比如success、
         * error、stateChange等配置项时可先调用operateConfig方法提前设置，然后该方法会返回一个可调用自带function
         * @param operate   dll方法（必填）
         * @param options 方法调用配置（必填）
         * @example
         *  printInstance.operateConfig('doPos',{
         *      stateChange:function (event,state,data) {
         *          console.info('stateChange',state,data,new Date());
         *      }
         *  })('appCode',{Module:'dll'},{A:'AA'}).done(function (data) {
         *      console.log('config dos success',data);
         *  }).fail(function (obj) {
         *      console.log('config dos error',obj);
         *  });
         * @returns {Function}
         * @instance
         */
        operateConfig:function (operate,options) {
            var _self = this;
            if(!$.isFunction(_self[operate])) {
                throw new Error(operate+ " 不是函数...");
            }
            options['-isOptions-'] = true;
            return function () {
                var funcArray = [].slice.apply(arguments);
                funcArray.unshift(options);
                return  _self[operate].apply(_self,funcArray);
            }
        },
        /**
         * @private
         * 生成调用function
         */
        generateFun:function(funObj,callType){
            var _self = this;
            var jsName = '';
            var dllName = '';
            //校验并赋值
            if($.type(funObj)==='string'){
                jsName = dllName = funObj;
            }else if($.type(funObj)==='object'){
                jsName = funObj.jsName;
                dllName = funObj.dllName;
                if($.type(jsName)==='string' && $.type(dllName)==='undefined' ){
                    dllName = jsName;
                }
                if($.type(jsName)==='undefined' && $.type(dllName)==='string' ){
                    jsName = dllName;
                }
                if($.type(jsName)==='undefined' && $.type(dllName)==='undefined' ){
                    throw new Error('必须定义一个jsName 或者 dllName')
                }
            }
            var options = {
                module:_self.module
            };
            options[callType] = dllName;
            //根据-isOptions-属性判断是否是配置对象，如果没有配置对象则自动生成。
            _self[jsName] = function (op) {
                var callOp = _self._initArgs(arguments);
                $.extend(true,callOp,options);
                var operateDefer = _self.newOperation(callOp);
                var exec = function(){
                    return _self.operate.apply(_self,[callOp]);
                }
                //不需要初始化直接执行
                if(funObj.initRequired===false){
                    exec();
                    return operateDefer;
                }
                $.when(_self.initStateDefer)
                .done(function () {
                    exec();
                })
                .fail(function(){
                    operateDefer.reject.apply(operateDefer,arguments);
                    if(_self.isShowHelp){
                        _self.showHelp();
                    }
                });
                return operateDefer;
            };
        },
        /**
         * @private
         * @returns {object}
         * @instance
         */
        _initArgs:function (args) {
            var funArgs = [].slice.apply(args,[1]);
            var callOp = args[0];
            if(!($.type(callOp)==='object'&&callOp['-isOptions-']===true)){
                callOp = {};
                funArgs = [].slice.apply(args);
            }
            callOp.data = funArgs;
            return callOp;
        },
        /**
         * @private
         * @returns $.Deferred
         * @instance
         */
        newOperation:function (op) {
            return op['-operateDefer'] = $.Deferred();
        },
        setOperation:function (op) {
            if(op['-operateDefer']){
                return op['-operateDefer'];
            }
            return op['-operateDefer'] = $.Deferred();
        },
        /**
         * @private
         * @memberOf base-pluginvoke
         * @description 获取初始化状态$.Deferred对象
         * @returns  $.Deferred()
         * @example
         * printInstance.getInitState();
         * @instance
         */
        getInitState:function () {
            var _self = this;
            return _self.initStateDefer;
        },
        /**
         *
         * @private
         * @description 初始化回调函数，子类需要覆盖，必须返回$.Deferred(); $.Deferred() jquery版的promise实现，虽然不好，将就着用吧，等待兼容高版本浏览器
         * @returns $.Deferred();
         * @see 关于 $.Derferred http://www.ruanyifeng.com/blog/2011/08/a_detailed_explanation_of_jquery_deferred_object.html
         */
        init:function () {
            var defer = $.Deferred();
            defer.resolve();
            return defer;
        },
        /**
         *
         * @memberOf base-pluginvoke
         * @event
         * @virtual
         * @description 调用错误统一回调接口，子类需要覆盖
         * @param data {object} dll调用返回结果
         * @param state {object} 状态
         * @param state.code {number} 状态code
         * @param state.msg {number} 状态中文描述
         * @param state.name {number} 状态英文描述
         * @param ret  {object} dll调用返回结果,包含成功失败code
         * @instance
         */
        onError:function (data, state, ret) {
        },
        /**
         *
         * @memberOf base-pluginvoke
         * @private
         * @description 调用dll的公共操作方法{func:'funName',data:[]}
         * @param {object}  options
         * @param {string}  options.func dll调用方法名，func和proc只能存在一个
         * @param {string}  options.proc dll调用方法名，func和proc只能存在一个
         * @param {array}   object.data dll方法参数列表，按照dll方法参数顺序填写
         * @param {function}   object.stateChange 调用dll方法状态更新回调；第一个参数回调事件，第二个参数为回调返回的数据，只有invoked才有结果，其他都为undefined
         * @param {function}   object.success 调用dll方法成功回调；第一个参数为返回结果，第二个参数为事件
         * @param {function}   object.error 调用dll方法失败回调；第一个参数为返回结果，第二个参数为事件
         * @example
         *  var instantce = BasePluginvoke.create({
         *          module:'print',
         *          config:{
         *              app:'123'
         *          }
         *         });
         * instantce.operate(
         * {
         *    data:[ //dll方法参数列表，按照dll方法参数顺序填写
         *       'templateId',
         *       '001'
         *   ],
         *    func:'queryPrintTemplate',//dll方法名，相对的process为 proc:'queryPrintTemplate'
         *   stateChange:function (event,state,data) {   //调用dll方法状态更新回调
         *       console.info(state,data,new Date());
         *   }
         * }
         * ).done(function (data,state) { //成功后的回调，也可以在options中定义success:function(data,state){}
         *   console.info('done base call success      ',data);
         * }).fail(function (data,state) {//失败后的回调，也可以在options中定义error:function(data,state){}
         *   console.info('base call error      ',data);
         * });
         * @returns $.Deferred();
         *
         * @instance
         */
        operate: function (op) {
            var _self = this;
            var operateDefer = _self.setOperation(op);
            var id = uuid.v4().replace(/-/g,'');
            var data = {
                id:id,
                payload:Base64.encode(JSON.stringify({
                    config:_self.config,
                    data:op.data
                }))
            };
            if(op.func){
                data.func = op.func;
            }else if(op.proc){
                data.proc = op.proc;
            }
            var options = $.extend({},op,{
                id:id,
                url:Config.url + _self.module,
                data:data,
                sliceSize:op.sliceSize
            });
            //当发生错误时，回调onError
            var socketDefer = Socket.sendByIframe(options);
            var heartbeat = BasePluginvoke.heartbeat().fail(function () {
                _self.getInitState().reject.apply(_self.getInitState(),arguments);
                if(_self.isShowHelp){
                    _self.showHelp();
                }
            });
            var deferArray = [
                heartbeat,
                operateDefer,
                socketDefer
            ];
            $.when.apply($,deferArray).fail(function () {
                var args = [];
                args = args.concat([].slice.call(arguments,0));
                _self.onError.apply(_self,args);
                operateDefer.rejectWith(op,args);
            })
            return operateDefer;
        },
        /**
         * @memberOf base-pluginvoke
         * @private
         * @description 添加config配置
         * @example printInstance.addConfig('key',1);
         * @param key
         * @param value
         * @instance
         */
        addConfig:function (key,value) {
            if($.type(key)!=='string'){
                return;
            }
            this.config[key] = value;
        },
        /**
         *
         * @private
         * @description 删除config配置
         * @example printInstance.removeConfig('key');
         * @param key
         * @instance
         */
        removeConfig:function (key) {
            delete this.config[key];
        },
        /**
         * 注销方法
         * @private
         * @instance
         */
        destroy: function () {
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
        },
        /**
         * 绑定事件
         * @private
         * @param eventName
         * @param eventCallFun
         * @instance
         */
        bind: function (eventName, eventCallFun) {
            this.on(eventName, eventCallFun, this);
        },
        /**
         * 解除绑定
         * @private
         * @param eventName
         * @instance
         */
        unbind: function (eventName) {
            if (typeof eventName == "string") {
                this.off(eventName, null, this);
            }
        },
        /**
         * @private
         * @description  启用自动弹出帮助窗口,请配置url地址。
         * @memberOf base-pluginvoke
         * @param {string} url 下载url
         * @example
         * instance.enableShowHelp();
         * instance.enableShowHelp('downloadUrl');
         *@instance
         */
        enableShowHelp:function (url) {
            this.setDownloadUrl(url);
            this.isShowHelp = true;
        },
        /**
         *
         * @description  禁用自动弹出帮助窗口
         * @memberOf base-pluginvoke
         * @private
         * @example
         * instance.disableShowHelp();
         *@instance
         */
        disableShowHelp:function () {
            this.isShowHelp = false;
        },
        /**
         * @private
         * @description  配置下载url
         * @memberOf base-pluginvoke
         * @param {string} url 下载url
         * @example
         * instance.setDownloadUrl('xxxx');
         *@instance
         */
        setDownloadUrl:function (url) {
            // if($.type(url)==='string'){
            //     this.downloadUrl = url;
            // }
        },
        /**
         * @memberOf base-pluginvoke
         * @private
         * @description 添加config配置
         * @example printInstance.addConfig('key',1);
         * @instance
         */
        showHelp:function () {
            var _self = this;
            if($('#bsClientHelpDlg').length){
                return;
            }
            var html = '\
                    <div class="dlg-box-head" id="unInstallControl_dialog" style="height:50px;">\
                    <div class="dlg-box-head-left" id="dragTarget" style="height:40px;width:480px;display:inline;">\
                      <span class="dlg-box-head-title" style="font-size:18px">控件提示</span> <span class="dlg-box-head-text"></span>\
                        </div>\
                    <div class="dlg-box-head-right" style="width:60px;float:right;display:inline;">\
                    </div>\
                    </div>	\
                    <div class="dialog_content" style="height: 210px;">\
                    <div style="box-sizing: border-box;height:100px;padding:40px 20px 20px 20px;;font-size:16px;font-weight:normal;text-align:center;">本系统需要安装    <span style="color:red;">博思客户端助手</span>   才能保证正常运行</div> \
                    <div style="height:60px;padding:20px 20px;font-size:16px;font-weight:normal;text-align:center;"> \
                    <a id="startBtn" class="app-button l-btn l-btn-small" style="height:35px;background:#449d44;color:#fff;margin-right:20px;filter:none;">\
                            <span class="l-btn-left">\
                                <span class="l-btn-text" style="font-size:14px;padding-top:3px;">启动博思客户端</span>\
                            </span>\
                        </a>\
                    <a id="handlerStartBtn" data-url="${startUrl}" class="app-button l-btn l-btn-small" \style="height:35px;background: rgba(206, 52, 38, 0.8);color:#fff;margin-right:20px;filter:none;display:none;">\
                            <span class="l-btn-left">\
                                <span class="l-btn-text" style="font-size:14px;padding-top:3px;">手动启动博思客户端</span>\
                            </span>\
                        </a>\
                    <a id="downBtn" data-url="${downloadUrl}" class="app-button l-btn l-btn-small" \style="height:35px;background:#ec971f;color:#fff;margin-right:20px;filter:none;">\
                            <span class="l-btn-left">\
                                <span class="l-btn-text" style="font-size:14px;padding-top:3px;">下载博思客户端助手</span>\
                            </span>\
                        </a>\
                    <a id="closeBtn" class="app-button l-btn l-btn-small" style="height:35px;background:#e6e6e6;color:#333;margin-right:20px;">\
                            <span class="l-btn-left">\
                                <span class="l-btn-text" style="font-size:14px;padding-top:3px;">关闭提示</span>\
                            </span>\
                        </a>\
                    </div> \
                    </div>';

            // 获取未安装打印控件界面
            var $node = $(dotpl.applyTpl(html,{
                downloadUrl:_self.downloadUrl,
                startUrl:Config.startUrl
            }));
            $node.find('#downBtn').on('click',function () {
                window.open($(this).data('url'),'下载博思客户端')
            });
            $node.find('#handlerStartBtn').on('click',function () {
                window.open($(this).data('url'),'通过浏览器手动启动博思客户端')
            });
            $node.find('#startBtn').on('click',function () {
                var timeout = 2500;
                Socket.get({
                    url:Config.guardUrl+"?ct=2",
                    timeout:10000,
                    data:{
                        payload:{

                        }
                    }
                }).done(function () {
                    $('#bsClientHelpDlg').fadeOut(1000);
                    $A.messager.correct('启动成功!',3000);
                    setTimeout(function () {
                        $('#bsClientHelpDlg').closeDialog();
                        if(Config.initUpdate){
                            BasePluginvoke.clientUpdate(Config.updateUrl);
                        }
                    },timeout);
                }).fail(function () {
                    $A.messager.warn('启动失败，请尝试手动启动或重新安装博思客户端...');
                    $('#startBtn').hide();
                    $('#handlerStartBtn').css('display','inline-block');
                }).always(function () {
                });
            });
            // 绑定取消事件
            $node.find("#closeBtn").bind("click",function(){
                $('#bsClientHelpDlg').closeDialog();
            });
            var options = {
                dialogId : "bsClientHelpDlg",
                hasheader : false,
                height : '260px',
                width : '200px',
                mode : "node",
                url : $node,
                beforeClose:function () {

                },
                onPageLoad:function(){

                }
            }
            $.openModalDialog(options);
        },

        Statics:{
            /**
             * @static
             * @memberOf base-pluginvoke
             * @function create
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)

             * @param {string} op.module 模块名称(<span style="color:red">必填</span>)
             * @example
             *         var instantce = BasePluginvoke.create({
             *          module:'print',
             *          config:{
             *              app:'123'
             *          }
             *         });
             */
            create:function (op) {
                return new BasePluginvoke(op);
            },
            /**
             * @static
             * @function heartbeat
             * @memberOf base-pluginvoke
             * @param {number} time
             * @description 心跳检查bs客户端是否启动。心跳检查响应时间设置，默认是3000毫秒
             * @example
             * BasePluginvoke.heartbeat(1500).done(function(){
             *  console.log('success');
             * }).fail(function(){
             *  console.log('error');
             * })
             */
            heartbeat:function (time) {
                if(!$.isNumeric(time)){
                    time = Config.timeout;
                }
                var heart = $.Deferred();
                var jsonp = 'heartbeat_'+ uuid.v4().replace(/-/g,'');
                window[jsonp] = function () {
                    heart.resolve();
                }
                var headNode = document.getElementsByTagName('head')[0];
                var scriptNode = document.createElement('script');
                scriptNode.type = 'text/javascript';
                scriptNode.charset = 'utf-8';
                scriptNode.async = true;
                scriptNode.src = Config.url + Config.heartbeat + '?jsonp='+jsonp;
                var step = time/2;
                var timeconsum = 0;
                var interval = setInterval(function () {
                    timeconsum += step;
                    if(timeconsum>=time){
                        window[jsonp] = undefined;
                        clearInterval(interval);
                        if(heart.state() == 'pending'){
                            heart.reject({code:'timeout',msg:'超时'})
                        }
                    }
                },step);
                headNode.appendChild(scriptNode);
                return heart;
            },
            clientUpdate:function (url,time) {
                if(!$.isNumeric(time)){
                    time = Config.timeout;
                }
                return Socket.get({
                    url:Config.url+Config.update,
                    timeout:time,
                    data:{
                        url:url,
                        payload:{

                        }
                    }
                }).done(function () {

                }).fail(function () {

                });
            }
        }
    });



    return BasePluginvoke;
});

define('bs-http-plugin/bs-ca-auth',['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke,Socket) {

    /**
     * @desc ca认证控件 使用请引入 'bs-http-plugin/bs-ca-auth'
     * @class
     * @classdesc
     * @name bs-ca-auth
     * @extends base-pluginvoke
     */
    var CaAuth = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-ca-auth
         * @instance
         * @example
         * module:'ca'
         */
        module:'ca',
        /**
         * @description 自动生成函数列表
         */
        functions:[
            /**
             * @function doSign
             * @instance
             * @memberOf bs-ca-auth
             * @description CA签名验证
             * @param {object} options
             * @param {string} options.signText 待签名串
             * @param {string} options.provider 签名供应者 'Jit'、'Kinsec'、'LNJH'
             * @returns {object}
             *
             * @example
             * var instance = CaAuth.getInstance();
             * instance.doSign({
			 * 	signText:'xxxx',
			 * 	provider:'Jit'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             *
             *
             * //会自动获取后台配置项，前提有配置全局变量     window._caProvider
             * var instance = CaAuth.getInstance();
             * instance.doSign('xxxx').done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doSign',

            'initParams'
        ],
        doSign:function (data) {
            if($.type(data)=='string'){
                data ={
                    signText:data,
                }
            }
            if($.type(data.provider)!='string'){
                data.provider = $A.getCaProvider();
            }
            if($.type(data.provider)!='string'){
                return $.Deferred().reject('CA验证提供商为空');
            }
            if($.type(data.cryptoType)!='string'){
                data.cryptoType = $A.getCaCryptoType();
            }
            //用户
            return this.operate({
                data:[data],
                func:'doSign'
            })
        },
        validateSN:function (data) {
            var cardInfo = $A.getCaInfo();
            if(!cardInfo||!cardInfo.caNo){
                var msg = "Ukey信息与当前ca产商不一致，请联系管理员！";
                return $.Deferred().reject(msg);
            }
            if($.type(data)=='string'){
                data ={
                    signText:data,
                }
            }
			data.certNo = cardInfo.caNo;
            return this.doSign(data)
        },
        Statics:{
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-ca-auth
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = CaAuth.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new CaAuth(op);
                }
                return this.instance;
            }
        }
    });
    return CaAuth;
});
define('bs-http-plugin/bs-doccamera',['bs-http-plugin/base-pluginvoke',"bs-http-plugin/util/uuid"], function (BasePluginvoke,uuid) {

    /**
     * @desc 高拍仪 使用请引入 'bs-http-plugin/bs-doccamera'
     * @class
     * @classdesc
     * @name bs-doccamera
     * @extends base-pluginvoke
     */
    var Doccamera = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-doccamera
         * @instance
         * @example
         * module:'Doccamera'
         */
        module: 'Doccamera',
        /**
         * @description 自动生成函数列表
         */
        functions: [
            'TakePhotoes',
            'GetImageList',
            'GetImageListWithoutBase64',
            'GetImages',
            'ClearImages'
        ],
        getPicture: function (id,method) {
            var me = this;
            var dfd = $.Deferred();
            var fn = function () {
                me[method]().then(function (data) {
                    if (data[id]) {
                        dfd.resolve(data[id]);
                    }
                    if (data[id] || data['state'] == 0) {
                        return
                    }
                    setTimeout(function () {
                        fn();
                    }, 2500);
                }).fail(function () {
                    dfd.rejectWith(dfd, arguments);
                })
            };
            fn();
            return dfd;
        },
        /**
         * @function takePicture
         * @instance
         * @memberOf bs-doccamera
         * @description 拍照
         * @returns {object}  $.Deferred().done(function(data){});
         * <pre>操作成功后 data数据结构 {
         *      success:true|false,
         *      message:'xxx',
         *      pictures:[
         *          {
         *              filename:'文件名',
         *              picture:'base64',
         *              type:'图片类型后缀'
         *          }
         *      ]
         * }
         * </pre>
         *
         * @example
         * var instance = CaAuth.getInstance();
         * instance.takePicture().done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
         */
        takePicture: function () {
            var me = this;
            var id = uuid.v4().replace(/-/g, '');
            return me.TakePhotoes({id:id}).then(function () {
                return me.getPicture(id,'GetImageList');
            })
        },

        /**
         * @function bufferTakePicture
         * @instance
         * @memberOf bs-doccamera
         * @description 高拍仪所拍摄拍的照片预存硬盘上，再读取
         * @returns {object}  $.Deferred().done(function(data){});
         * <pre>操作成功后 data数据结构 {
         *      success:true|false,
         *      message:'xxx',
         *      pictures:[
         *          {
         *              filename:'文件名',
         *              picture:'base64',
         *              type:'图片类型后缀'
         *          }
         *      ]
         * }
         * </pre>
         *
         * @example
         * var instance = CaAuth.getInstance();
         * instance.bufferTakePicture().done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
         */
        bufferTakePicture:function(){
            var dfd = $.Deferred();
            var me = this;
            var id = uuid.v4().replace(/-/g, '');
            return me.TakePhotoes({id:id}).then(function () {
                return me.getPicture(id,'GetImageListWithoutBase64');
            }).then(function (data) {
                return me.getImagesAndClean(id,data);
            })
        },
        getImgSize:2,
        getImagesAndClean:function (id,picInfo) {
            var me = this;
            var dfd = $.Deferred();
            var pictures = picInfo['pictures'];
            if(!$.isArray(pictures)){
                dfd.rejectWith(this,['picture is not array!']);
            }
            pictures = $(pictures).map(function (index,item) {
                return item['filename']
            }).toArray();
            var result = {};
            var respics = [];
            var fn = function () {
                if(pictures.length==0){
                    dfd.resolve(result);
                    me.ClearImages();
                    return;
                }
                me.GetImages({pictures:pictures.splice(0,me.getImgSize)}).then(function (data) {
					result = data[id];
                    respics = respics.concat(result['pictures']);
                    result['pictures'] = respics;
                    fn();
                    if (data[id] || data['state'] == 0) {
                        return
                    }
                }).fail(function () {
                    dfd.rejectWith(dfd, arguments);
                })
            }
            fn();
            return dfd;
        },
        Statics: {
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-doccamera
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = Doccamera.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance: function (op) {
                if (!this.instance) {
                    this.instance = new Doccamera(op);
                }
                return this.instance;
            }
        }
    });
    return Doccamera;
});

define('bs-http-plugin/bs-pd',['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke,Socket) {

    /**
     * @desc  PD刷卡 使用请引入 'bs-http-plugin/bs-pd'
     * @class
     * @classdesc
     * @name bs-pd
     * @extends base-pluginvoke
     */
    var Pd = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-pd
         * @instance
         * @example
         * module:'print'
         */
        module:'pd',
        /**
         * @description 自动生成函数列表
         */
        functions:[
            /**
             * @function doPd
             * @instance
             * @memberOf bs-pd
             * @description CA签名验证
             * @param {object} options
             * @returns {string} options.aUrl
             * @returns {string} options.aPdaName
             * @returns {string} options.aOrgCode
             * @returns {string} options.aPdId
             * @returns {string} options.aPdCode
             *
             * @example
             * var instance = Pd.getInstance();
             * instance.expPd({
             * aUrl: '',
             * aPdaName: '',
             * aOrgCode: '',
             * aPdId: '',
             * aPdCode: ''
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'expPd',


            /**
             * @function impPd
             * @instance
             * @memberOf bs-pd
             * @description CA签名验证
             * @returns {string} options.aUrl
             * @returns {string} options.aPdaName
             * @returns {string} options.aOrgCode
             * @returns {object}
             *
             * @example
             * var instance = Pd.getInstance();
             * instance.impPd({
             * aUrl: '',
             * aPdaName: '',
             * aOrgCode: '',
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'impPd'
        ],
        Statics:{
            /**
             * @static
             * @memberOf bs-pd
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = Pd.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new Pd(op);
                }
                return this.instance;
            }
        }
    });
    return Pd;
});

define('bs-http-plugin/bs-pos',['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke,Socket) {

    /**
     * @desc  POS刷卡 使用请引入 'bs-http-plugin/bs-pos'
     * @class
     * @classdesc
     * @name bs-pos
     * @extends base-pluginvoke
     */
    var Pos = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-pos
         * @instance
         * @example
         * module:'print'
         */
        module:'pos',
        /**
         * @description 自动生成函数列表
         */
        functions:[
            /**
             * @function doPos
             * @instance
             * @memberOf bs-pos
             * @description CA签名验证
             * @param {object} options
             * @param {string} options.totalAmt 金额
             * @param {string} options.posNo POS机号
             * @param {string} options.posPNo POS员工号
             * @param {string} options.transDate 交易日期
             * @param {string} options.transNo 交易号
             * @param {string} options.transVoucher 交易凭证
             * @param {string} options.letterNo 缴款码
             * @param {string} options.transType 交易类型
             * @param {string} options.account 账号
             * @returns {object}
             *
             * @example
             * var instance = Pos.getInstance();
             * instance.doPos({
			 * 	totalAmt:'xxxx',
			 * 	posNo:'xxxx',
			 * 	posPNo:'xxxx',
			 * 	transDate:'xxxx',
			 * 	transNo:'xxxx',
			 * 	transVoucher:'xxxx',
			 * 	letterNo:'xxxx',
			 * 	transType:'xxxx',
			 * 	account:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doPos',

            'initParams'
        ],
        Statics:{
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-pos
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = Pos.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new Pos(op);
                }
                return this.instance;
            }
        }
    });
    return Pos;
});

define('bs-http-plugin/util/img-lazyload',["jquery"
], function (jQuery) {

    /**
     * Created by qiuyong on 2017/7/19.
     * 参考：https://zhuanlan.zhihu.com/p/24057749?refer=dreawer
     */
    (function ($) {
        /**
         * 防抖动函数
         * @param fun
         * @param delay
         * @param time
         * @return {Function}
         */
        function throttle(fun,args, delay, time) {
            var timeout,
                startTime = new Date();
            return function(e) {
                var context = this,
                    curTime = new Date();
                args.push(e);
                clearTimeout(timeout);
                // 如果达到了规定的触发时间间隔，触发 handler
                if (curTime - startTime >= time) {
                    fun.apply(context, args);
                    startTime = curTime;
                    // 没达到触发间隔，重新设定定时器
                } else {
                    timeout = setTimeout(function () {
                        fun.apply(context, args);
                    }, delay);
                }
            };
        };

        function onload(img, fn) {
            var timer = setInterval(function() {
                if (img.complete) {
                    fn(img)
                    clearInterval(timer)
                }
            }, 500)
        }

        function lazyload($contanier,imgSel,defImg,onloadFn){
            var imgs = $contanier.find(imgSel);
            //过滤已经正在延迟加载的
            imgs = imgs.filter(function(index,img){
                if($(img).attr('lazyloaded')) return false;
                return true;
            })
            $(imgs).each(function (index,item) {
                var $img = $(item);
                if (item.offsetTop < parseInt($contanier.height()) + parseInt($contanier.scrollTop())) {
                    if ($img.attr('src') === defImg) {
                        $img.attr('lazyloaded',true);
                        var src = $img.attr("data-src");
                        //加载中图片隐藏
                        var $loadImg = $(document.createElement('img'));
                        $loadImg.attr('src',src);
                        $('body').append($loadImg);
                        $loadImg.hide();
                        onload($loadImg[0],function () {
                            $img.attr("src", src);
                            $loadImg.remove();
                            onloadFn($img);
                        })
                    }
                }
            })
        }

        $.fn.extend({
            imgLazyLoad:function (imgSel,defImg,onloadFn) {
                var $contanier =  $(this);
                onloadFn = $.isFunction(onloadFn)?onloadFn:$.noop;
                $contanier.find(imgSel).each(function(index,img){
					if(!$(img).attr('lazyloaded')){
						$(img).attr('src',defImg);
					}
				})
                $contanier.scroll(throttle(lazyload,[$contanier,imgSel,defImg,onloadFn],500,1000));
                lazyload($contanier,imgSel,defImg,onloadFn);
            }
        });
    })(jQuery);


});

define('bs-http-plugin/bs-print',['bs-http-plugin/base-pluginvoke',
    "bs-http-plugin/data-transmit/socket",
    "bs-http-plugin/config",
    "bs-http-plugin/util/img-lazyload",
], function (BasePluginvoke, Socket, Config) {


    /**
     * @desc 打印控件 使用请引入 'bs-http-plugin/bs-print'
     * @class
     * @classdesc
     * @name bs-print
     * @extends base-pluginvoke
     */
    var BsPrint = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-print
         * @instance
         * @example
         * module:'print'
         */
        module: 'print',
        /**
         * @description 自动生成函数列表
         */
        functions: [

            {
                jsName: 'initParams',  //js对象实例化后生成的方法吗
                dllName: 'initParams',//js对象方法调用后发送的请求参数，func:'initParams'
                initRequired: false////默认true，需要init返回的$.Deferred() 对象为resolve状态才能执行，为false时不需init返回的Deferred对象
            },

            /**
             * @function doPrintRemoteImage
             * @instance
             * @memberOf bs-print
             * @description 打印图片
             * @param {object} options
             * @param {object} options.PrintPreview  是否预览 默认值false
             * @param {object} options.ShowPrintSet  是否显示打印份数设置 默认值false
             * @param {int} options.ShowMode  1：裁剪、2：铺满、3：按比例缩放、4：完整显示、5：平铺 。默认值4
             * @param {object} options.PrintSet
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doPrintRemoteImage({
             *      Url: "",
             *      PrintPreview: true, //是否预览
             *      ShowPrintSet: true, //是否显示打印份数设置
             *      ShowMode: 4,        //1：裁剪、2：铺满、3：按比例缩放、4：完整显示、5：平铺
             *      Name: "" ,           //打印任务名称
             *      PrintSet:{}         //打印设置，默认获取ModuleId:00000000
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            "doPrintRemoteImage",

            /**
             * @deprecated 已废弃，不建议使用
             * @function getTemplateList
             * @instance
             * @memberOf bs-print
             * @description 一种票据可能会配置多个模板，所以通过ModuleId可以获取到多个模板
             * @param {object} options
             * @param {string} options.ModuleId 模块编号
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getTemplateList({
			 * 	ModuleId:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getTemplateList',

            /**
             * @deprecated 已废弃，不建议使用
             * @function getDefaultTemplete
             * @instance
             * @memberOf bs-print
             * @description 获取默认模板
             * @param {object} options
             * @param {string} options.ModuleId 模块ID
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getDefaultTemplete({
			 * 	ModuleId:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getDefaultTemplete',


            /**
             * @deprecated 已废弃，不建议使用
             * @function getLocal
             * @instance
             * @memberOf bs-print
             * @description 获取存储本地信息
             * @param {object} options
             * @param {string} options.Node 模块编号
             * @param {string} options.Key 模块编号
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getLocal({
			 * 	Node:'xxxx',
			 * 	Key:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getLocal',

            /**
             * @deprecated 已废弃，不建议使用
             * @function setLocal
             * @instance
             * @memberOf bs-print
             * @description 存储本地信息
             * @param {object} options
             * @param {string} options.Node 模块编号
             * @param {string} options.Key 模块编号
             * @param {string} options.Value 模块编号
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.setLocal({
			 * 	Node:'xxxx',
			 * 	Key:'xxxx',
			 * 	Value:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'setLocal',


            /**
             * @function getPrinter
             * @instance
             * @memberOf bs-print
             * @description 获取预览图片
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @param {string} options.PrintTemplateUrl 打印模板地址
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getPrinter({
			 * 	PrintData:{...},
			 * 	PrintSet:{...},
			 * 	PrintTemplateUrl:{...}
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getPrinter',

            /**
             * @function setPrinter
             * @instance
             * @memberOf bs-print
             * @description 打印设置
             * @param {object} options
             * @param {string} options.ModuleId 模块编号
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.setPrinter({
			 * 	ModuleId:''
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'setPrinter',

            /**
             * @function getPrintSet
             * @instance
             * @memberOf bs-print
             * @description 获取打印设置
             * @param {object} options
             * @param {object} options.ModuleId 模块编号
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getPrintSet({
			 * 	ModuleId:'xxxx'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getPrintSet',


            /**
             * @deprecated 已废弃，不建议使用
             * @function getTemplatePath
             * @instance
             * @memberOf bs-print
             * @description 获取模板路径
             * @param {object} options
             * @param {string} options.ModuleId 模块ID
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getTemplatePath({
			 * 	ModuleId:''
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getTemplatePath',


            /**
             * @function getPrintPreviewImage
             * @instance
             * @memberOf bs-print
             * @description 获取预览图片
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @param {string} options.PrintTemplateUrl 打印模板地址
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.getPrintPreviewImage({
			 * 	PrintData:{...},
			 * 	PrintSet:{...},
			 * 	PrintTemplateUrl:'xxx'
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'getPrintPreviewImage',

            /**
             * @function doDesign
             * @instance
             * @memberOf bs-print
             * @description 打印模板设计
             * @param {object} options
             * @param {string} options.LoadReportURL 模板加载地址
             * @param {string} options.SaveReportURL 模板保存地址
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doDesign({
			 * 	SaveReportURL:'xxxx',
			 * 	LoadReportURL:'xxxx'
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doDesign',

            /**
             * @function doPreview
             * @instance
             * @memberOf bs-print
             * @description 打印预览。支持批量打印，PrintData传入数组，PrintSize参数是切割PrintData，每次发送的大小
             * @param {object} options
             * @param {string} options.LoadReportURL 模板加载地址
             * @param {boolean} options.PrintPreview 是否打印预览
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet 打印设置
             * @param {integer} options.PrintSize 打印或者预览每次发送数据大小，默认打印全部
             * @param {function} options.ProcessChange 打印或者预览处理回调函数
             * @param {function} options.PrintCallBack 打印按钮回调函数，预览的时候才有打印按钮
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doPreview({
			 * 	LoadReportURL:'xxxx',
			 * 	PrintPreview:false,
			 * 	PrintData:{...},
			 * 	PrintSet:{...}
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doPreview',

            /**
             * @function printReport
             * @instance
             * @memberOf bs-print
             * @description 打印报表
             * @param {object} options
             * @param {boolean} options.PrintPreview 是否打印预览
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet 打印设置
             * @param {object} options.Header 报表头
             * @param {object} options.Detail 详细数据
             * @param {integer} options.ColumnPrintAdaptMethod 打印适配方法
             * @returns {object}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.printReport({
			 * 	PrintPreview:false,
			 * 	PrintData:{...},
			 * 	PrintSet:{...},
			 * 	Header:{...},
			 * 	Detail:{...},
			 * 	ColumnPrintAdaptMethod:1
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'printReport',

            /**
             * @function doPrintMultiSubReport
             * @instance
             * @memberOf bs-print
             * @description  打印多重子报表
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @param {string} options.LoadReportURL 模板加载地址
             * @param {object/array} options.SubReports 子报表数据
             * @param {boolean} options.PrintPreview 是否打印预览
             * @param {object} options.Groups 打印控制等信息
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doPrintMultiSubReport({
			 * 	PrintData:{...},
			 * 	PrintSet:{...},
			 * 	LoadReportURL:'xxxxx',
			 * 	SubReports:{...},
			 * 	PrintPreview:false,
			 * 	Groups:{...}
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doPrintMultiSubReport',

            /**
             * @function doCoordinate
             * @instance
             * @memberOf bs-print
             * @description 点阵打印
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doCoordinate({
			 * 	PrintData:{...},
			 * 	PrintSet:{...}
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doCoordinate',
            /**
             * @function doCustomPrint
             * @instance
             * @memberOf bs-print
             * @description 自定义打印
             * @param {object} options
             * @param {object} options.PrintData 打印数据
             * @param {object} options.PrintSet     打印设置
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.doCustomPrint({
			 * 	PrintData:{...},
			 * 	PrintSet:{...}
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doCustomPrint',


            /**
             * @function openFile
             * @instance
             * @memberOf bs-print
             * @description 选择文件夹
             * @param {object} options
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.openFile().done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'openFile',

            /**
             * @function exportMedia
             * @instance
             * @memberOf bs-print
             * @description 导出多媒体文件
             * @param {object} options
             * @param {object} options.PrintData    打印数据
             * @param {object} options.PrintSet     打印设置
             * @returns {string}
             *
             * @example
             * var print = BsPrint.getInstance();
             * print.exportMedia({
                    "PrintData": [{
                        "Name": "导出文件名",
                        "Data": {}
                    }],
                    "PrintSet": {},
                    "ExportType": "PDF/Excel(默认PDF)",
                    "LoadReportURL": "模板地址(支持http下载模板和使用本地模板)",
                    "tempVersion": "模板版本"
			 * }).done(function(data){
			 * 		//TODO show image
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'exportMedia'
        ],
        init: function () {
            var _self = this;
            var initOptions = _self.initOptions;
            var defer = $.Deferred();
            _self.initParams(initOptions).done(function (data, state, Rs) {
                defer.resolve();
            }).fail(function (data, state, Rs) {
                defer.reject({code: -1, msg: '初始化失败！！！！'});
            });
            return defer;
        },

        template: {
            /**
             * 打印预览窗口
             * @type {string}
             */
            printPreViewDialog: '\
                <div class="dlg-box-head">\
                    <div class="dlg-box-head-left">\
                        <span class="dlg-box-head-title">打印预览</span>\
                        <span class="pre-view-msg"></span>\
                    </div>\
                    <div class="dlg-box-head-right">\
                        <div class=" btnarea menubar btn-dlg-toolbar">\
                        </div>\
                    </div>\
                </div>\
                <div class="dialog-content print-pre-view" style="padding: 30px;">\
                </div>',
            /**
             * 打印窗口
             * @type {string}
             */
            printDialog: '\
            <div class="dlg-box-head">\
                <div class="dlg-box-head-left">\
                    <span class="dlg-box-head-title">打印</span>\
                </div>\
            </div>\
            <div class="dialog-content print-pre-view">\
                <span class="print-view-msg"></span>\
            </div>'
        },


        exportMedia: function (data) {
            var self = this;
            return self.openFile().then(function (path) {
                data.ExportPath = path;
                return self.operate({
                    data: [data],
                    func: 'exportMedia'
                })
            })
        },
        /**
         * @return {*}
         */
        doPreview: function () {
            var _self = this;
            var op = _self._initArgs(arguments);
            var dfd = $.Deferred();
            $.when(_self.initStateDefer)
                .done(function () {
                    //初始化参数
                    var index = 0;
                    var dialogOptions = _self.getItem(op, 'DialogOptions');
                    dialogOptions = $.type(dialogOptions) === 'undefined' ? {} : dialogOptions;
                    //是否由前端展示窗体，false的时候由前端展示窗体。默认false
                    var showForm = _self.getItem(op, 'ShowForm');
                    var printPreView = _self.getItem(op, 'PrintPreview');
                    var msgDlg = _self.getItem(op, 'MessageDialog');
                    var defImg = _self.getItem(op, 'DefImg');
                    if ($.type(msgDlg) === 'undefined') {
                        msgDlg = true
                    }
                    showForm = showForm === false ? showForm : true;
                    _self.setItem(op, 'ShowForm', showForm);
                    var isPreview = !showForm && printPreView;
                    //打印数据
                    var printData = _self.getItem(op, 'PrintData');
                    printData = $.isArray(printData) ? printData : [printData];
                    var printLength = printData.length;
                    //打印或者预览每次调用dll的数据大小
                    var frequency = _self.getItem(op, 'PrintSize');
                    frequency = $.isNumeric(frequency) ? frequency : printLength;

                    //打印按钮回调
                    var printCallBack = _self.getItem(op, 'PrintCallBack');
                    printCallBack = _self.isFunction(printCallBack);
                    //过程改变回调
                    var processChange = _self.getItem(op, 'ProcessChange');
                    processChange = _self.isFunction(processChange);

                    //默认图片
                    if(!!!defImg)
                        defImg = $A.getHostUrl() + 'resources/common/themes/images/print/default.gif';
                    var message = {
                        printSuccessMsg: '打印成功！',
                        printErrorMsg: '预览失败！',
                        preViewSuccessMsg: '预览成功！',
                        preViewErrorMsg: '预览成功！',
                        printDoingMsg: '正在打印',
                        preViewDoingMsg: '正在预览',
                        getSuccessMsg: function () {
                            if (printPreView) {
                                return this.preViewSuccessMsg;
                            }
                            return this.printSuccessMsg;
                        },
                        getErrorMsg: function () {
                            if (printPreView) {
                                return this.preViewErrorMsg;
                            }
                            return this.printErrorMsg;
                        },
                        getDoingMsg: function () {
                            if (printPreView) {
                                return this.preViewDoingMsg;
                            }
                            return this.printDoingMsg;
                        }
                    };
                    $.extend(message, _self.getItem(op, 'Message'));

                    //打印图片数组
                    var printImg = [];
                    //保证页面只有一个滚动条
                    var bodyOverflow = $(document.body).css('overflow');
                    $(document.body).css('overflow', 'hidden');
                    //打开对话框配置
                    var html = "";
                    var dlgOptions = {
                        dialogId: "_dlgdoPreViewImg",
                        hasheader: false,
                        title: ' ',
                        height: '75%',
                        width: '60%',
                        mode: "node",
                        buttons: [
                            {
                                id: 'btnPrint',
                                text: '打印',
                                visible: false,
                                click: function () {
                                    op.func = 'doPrintImage';
                                    _self.newOperation(op);
                                    _self.setItem(op, 'PrintData', printImg);

                                    var printDlgOp = $.extend(true, {}, dlgOptions)
                                    printDlgOp.dialogId = "_printDlg";
                                    printDlgOp.beforeClose = $.noop;
                                    printDlgOp.url = dotpl.applyTpl(_self.template.printDialog, {
                                        msg: message.printDoingMsg + '请稍后...'
                                    });
                                    printDlgOp.width = '600px';
                                    printDlgOp.height = '200px';
                                    msgDlg && $.openModalDialog(printDlgOp);
                                    var printDlg = $("#" + printDlgOp.dialogId);

                                    $.when(_self.operate(op)).done(function (data) {
                                        printDlg.find('.print-view-msg')
                                            .removeClass("print-view-msg")
                                            .addClass("print-view-msg-success")
                                            .text(message.printSuccessMsg);
                                        printDlg.fadeOut(2600, function () {
                                            printDlg.closeDialog();
                                        });
                                        dfd.resolve.apply(dfd, arguments);
                                    }).fail(function (data) {
                                        dfd.resolve.apply(dfd, arguments);
                                        printDlg.find('.print-view-msg')
                                            .removeClass("print-view-msg")
                                            .addClass("print-view-msg-success")
                                            .text(message.printErrorMsg);
                                    });
                                    printCallBack();
                                }
                            },
                            {
                                id: 'btnClose',
                                text: '关闭',
                                click: function () {
                                    var $dlg = $('#' + dlgOptions.dialogId);
                                    $dlg.closeDialog();
                                }
                            }
                        ],
                        buttonsExt: [],
                        buttonGen: function () {
                            var $dlg = $('#' + dlgOptions.dialogId);
                            var $right = $dlg.find('.dlg-box-head-right>div');
                            var template = '<a id="${id}" class="app-button hidden l-btn l-btn-large l-btn-plain">\
                                        <span class="l-btn-left l-btn-icon-top">\
                                            <span class="l-btn-text">${text}</span>\
                                            <i class="l-btn-icon add48">&nbsp;</i>\
                                        </span>\
                                    </a>';
                            var buttons = this.buttons.concat(this.buttonsExt);
                            $(buttons).each(function (index, btnOp) {
                                var $button = $(dotpl.applyTpl(template, btnOp));
                                $button.on('click', btnOp.click);
                                btnOp.visible === false && $button.hide();
                                $right.append($button);
                            })
                        },
                        beforeClose: function () {
                            $(document.body).css('overflow', bodyOverflow);
                        }
                    };
                    if (isPreview) {
                        html = _self.template.printPreViewDialog;
                    } else {
                        html = _self.template.printDialog;
                        dlgOptions.height = '220px';
                        dlgOptions.width = '600px';
                    }
                    $.extend(true, dlgOptions, dialogOptions);

                    dlgOptions.url = $(html);
                    if ($('#' + dlgOptions.dialogId).length) {
                        $('#' + dlgOptions.dialogId).closeDialog();
                    }
                    msgDlg && $.openModalDialog(dlgOptions);
                    dlgOptions.buttonGen();
                    var $dlg = $('#' + dlgOptions.dialogId);
                    var $content = $dlg.find('.dialog-content');
                    var $msg = isPreview ? $dlg.find(".pre-view-msg") : $dlg.find(".print-view-msg");

                    doPreView(op, index);

                    function doPreView(options, index) {
                        options.func = 'doPreview';
                        var end = index + frequency;
                        if (end > printLength) end = printLength;
                        _self.setItem(options, 'PrintData', printData.slice(index, end));
                        var curIndex = {
                            index: end == 0 ? 1 : end,
                            total: printLength == 0 ? 1 : printLength
                        }
                        index = end;
                        _self.newOperation(options);
                        $.when(_self.operate(options)).done(function (data) {
                            //过程回调
                            var processRs = processChange(data, index, printLength);
                            var showMsg = "(${index}/${total})";
                            showMsg = dotpl.applyTpl(showMsg, curIndex);
                            if (isPreview) {
                                printImg = printImg.concat(data.list);
                                $(data.list).each(function (i, imgPath) {
                                    var $img = $('<img style="display: block;margin: 100px auto;" />');
                                    $img.attr('data-src', data.url + '?fn=' + imgPath);
                                    // $img.attr('data-src',data.url+'/'+imgPath);
                                    $content.append($img)
                                });
                                $content.imgLazyLoad('img',
                                    defImg,
                                    function ($img) {
                                        $img.addClass('print-img-loaded');
                                        $img.attr('style', '');
                                    }
                                );
                                showMsg = "正在生成预览图片" + showMsg;
                            } else {
                                showMsg = message.getDoingMsg() + showMsg;
                            }
                            if ($.type(processRs) !== 'undefined') {
                                showMsg = processRs;
                            }
                            $msg.text(showMsg);
                            //传输结束
                            if (index == printLength) {

                                if (isPreview) {
                                    $dlg.find('#btnPrint').css('display', 'inline-block');
                                    $msg.fadeOut(600, function () {
                                        $msg.remove();
                                    });
                                } else {
                                    setTimeout(function () {
                                        $msg.removeClass("print-view-msg")
                                            .addClass("print-view-msg-success").text(message.getSuccessMsg());
                                        $dlg.fadeOut(2600, function () {
                                            $dlg.closeDialog();
                                        });
                                    }, 800);
                                }
                                dfd.resolve.apply(dfd, arguments);
                                return;
                            }
                            doPreView(options, index);
                        }).fail(function () {
                            dfd.reject.apply(dfd, arguments);
                            if (!showForm) {

                            } else {
                                $msg.removeClass("print-view-msg")
                                    .addClass("print-view-msg-success").text(message.getErrorMsg());
                                $dlg.fadeOut(2600, function () {
                                    $dlg.closeDialog();
                                });
                            }
                        });
                    }
                })
                .fail(function () {

                });
            return dfd;
        },
        /**
         * @instance
         * @memberOf bs-print
         * @description 生成预览图片，图片路径为本地客户端为服务器
         * @param {object} options
         * @param {string} options.LoadReportURL 模板加载地址
         * @param {object} options.PrintData 打印数据
         * @param {object} options.PrintSet 打印设置
         * @returns {object}
         *
         * @example
         * var print = BsPrint.getInstance();
         * print.doImage({
         * 	LoadReportURL:'xxxx',
         * 	PrintData:{...},
         * 	PrintSet:{...}
         * }).done(function(data){
         * 		//TODO success
         * }).fail(function(){
         * 		//TODO error
         * })
         */
        doImage: function () {
            var _self = this;
            var dfd = $.Deferred();
            var op = _self._initArgs(arguments);
            $.when(_self.initStateDefer).done(function () {
                _self.setItem(op, 'ShowForm', false);
                _self.setItem(op, 'PrintPreview', true);
                var printData = _self.getItem(op, 'PrintData');
                if (!$.isArray(printData)) {
                    printData = [printData];
                    _self.setItem(op, 'PrintData', printData);
                }
                op.func = 'doPreview';
                _self.newOperation(op);
                _self.operate(op).done(function () {
                    dfd.resolveWith(op, arguments);
                }).fail(function (arg) {
                    dfd.rejectWith(op, arguments);
                })
            }).fail(function () {
                dfd.reject();
            });
            return dfd;
        },
        getItem: function (options, key) {
            return options.data[0][key];
        },
        setItem: function (options, key, val) {
            return options.data[0][key] = val;
        },
        isFunction: function (fn) {
            return $.isFunction(fn) ? fn : function () {
            };
        },
        Statics: {
            getDefInstance: function (op) {
                var defOp = {
                    initOptions: {
                        Cookie: Config.cookies,
                        HostUrl: $A.getHostUrl(),
                        DownLoadUrl: 'undefined',
                        QueryTempListUrl: 'undefined',
                        QueryTempNameUrl: 'undefined'
                    }
                };
                if ($.type(op) === 'undefined') {
                    op = {};
                }
                $.extend(true, op, defOp);
                if (!this.instance || this.instance.getInitState().state() === 'rejected') {
                    this.instance = new BsPrint(op);
                }
                return this.instance;
            },
            /**
             * @description 获取控件实例
             * @static
             * @memberOf bs-print
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @param {object} op.initOptions 初始化函数
             * @param {string} op.initOptions.Cookie cookie
             * @param {string} op.initOptions.HostUrl 主机地址
             * @param {string} op.initOptions.DownLoadUrl 模板下载地址
             * @param {string} op.initOptions.QueryTempListUrl 模板查询地址
             * @param {string} op.initOptions.QueryTempNameUrl 模板查询地址
             * @example
             *         var instantce = BsPrint.getInstance({
             *          config:{
             *              appId:'123'
             *          },
             *          initOptions:{
             *          	Cookie:_cookies,
             *          	HostUrl:$A.getHostUrl(),
             *          	DownLoadUrl:'xxxx/yyyy/download.do',
             *          	QueryTempListUrl:'xxxx/yyyy/queryList.do',
             *          	QueryTempNameUrl:'xxxx/yyyy/query.do'
             *          }
             *         });
             */
            getInstance: function (op) {
                if (!this.instance || this.instance.getInitState().state() === 'rejected') {
                    this.instance = new BsPrint(op);
                }
                return this.instance;
            }
        }
    });
    return BsPrint;
});
(function (scope) {
    var casUrl = 'http://127.0.0.1:13526/ca';
    var heartUrl = 'http://127.0.0.1:13526/heart';
    var Message = function () {
        var _self = this;
        _self.msgStack = {};
        window.onmessage = function (event) {
            var data = event.data;
            data = $.parseJSON(data);
            var callback = _self.get(data.id);
            if (!!callback) {
                callback.call({}, data);
            }
        };
    };
    Message.prototype = {
        constructor:Message,
        set: function (id, callback) {
            this.msgStack[id] = callback;
        },
        get: function (id) {
            var callback = this.msgStack[id];
            if (!!callback) {
                delete this.msgStack[id];
            }
            return callback;
        }
    };
    var message = new Message();


    var getRs = function () {
        return this.ret.ret_msg;
    };
    var Socket = function () {
    };
    Socket.prototype = {
        constructor:Socket,
        send:function (op) {
            var _self = this;
            var data = op.data;
            op.id = op.data.id = new Date().getTime();
            if(typeof data.payload === 'undefined'){
                throw new Error('data.payload not found!');
            }
            //payload 初始化
            var payload = data.payload;
            payload = JSON.stringify(payload);
            payload = _self.base64Encode(payload);
            op.data.payload = payload;
            var $iframe = _self.createIframe(op);
            var $form = _self.createForm(op);
            //  " 会截断数据
            $form.find('[name="payload"]').val(payload);
            var callback = function (data) {
                if(data==='undefined'){
                    data = {};
                }
                data['getResult'] = getRs;
                var args = [data.getResult()];
                try {
                    args = args.concat([].slice.call(arguments,0));
                    args.push(op);
                    if(data.ret['ret_code']==='0'){
                        op.success.apply(op,args);
                    }else{
                        op.error.apply(op,args);
                    }
                    $form.remove();
                    $iframe.remove();
                }catch (e){
                    $form.remove();
                    $iframe.remove();
                    throw e;
                }
            }
            message.set(op.id,callback);
            $form.submit();
            $.ajax({
                url:heartUrl,
                timeout:op.timeout?op.timeout:3000,
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                dataType: 'jsonp',
                jsonp: 'jsonp',
                type:'GET',
                error:function () {
                    $form.remove();
                    $iframe.remove();
                    op.clientError.apply(op,arguments)
                }
            })
        },
        createIframe:function (op) {
            var template= '<iframe \
                                id="socketIframe$id" \
                                name="socketIframe$id" \
                                style="position:absolute; top:-9999px; left:-9999px">\
                            </iframe>';
            var $iframe = $(template.replace(/\$id/g,op.id));
            $iframe.appendTo('body');
            return $iframe;
        },
        createForm:function (op) {
            if(!!op.func){
                op.invokeType = 'func';
                op.invokeValue = op.func;
            }else{
                op.invokeType = 'proc';
                op.invokeValue = op.proc;
            }
            var template= '<form id="socketForm$id" name="socketForm$id" \
                target="socketIframe$id" \
                action="$url" \
                method="post" \
                accept-charset="UTF-8" \
                > \
                <input type="hidden" name="$invokeType" value="$invokeValue" /> \
                <input type="hidden" name="id" value="$id" /> \
                <input type="hidden" name="payload" /> \
                </form>';
            var $form = $(
                template.replace(/\$id/g,op.id)
                    .replace(/\$url/,op.url)
                    .replace(/\$invokeType/,op.invokeType)
                    .replace(/\$invokeValue/,op.invokeValue)
            );
            $form.appendTo('body');
            return $form;
        },
        base64Encode:function (data) {
            return Base64.encode(data);
        }
    };

    var socket = new Socket();

    var CASLogin = function () {
    };

    CASLogin.prototype = {
        constructor:CASLogin,
        doSign:function (op) {
            var success = $.isFunction(op.success)?op.success:$.noop;
            var error = $.isFunction(op.success)?op.success:$.noop;
            var clientError = $.isFunction(op.clientError)?op.clientError:$.noop;
            delete op.success;
            delete op.error;
            delete op.clientError;
            var options = {
                url:casUrl,
                func:'doSign',
                success:success,
                error:error,
                clientError:clientError,
                data:{
                    payload:{
                        config:{
                        	appId:'cas-server'
                        },
                        data:[
                            op
                        ]
                    }
                }
            };

           socket.send(options);
        }
    };

    scope.casLogin = new CASLogin();
}(window));


define("bs-http-plugin/cas-login", function(){});

define('app/widgets/app-lang_zh_CN',["app/core/app-jquery","app/core/app-core","app/util/app-utils"],function($,App,AppUtils){
	var that ={
		locale:"zh_CN",
		msg:function(code,args){
			return AppUtils.format(this._messages[code], args);
		},
		/**
		 * 基于编码的信息，可以带有{0}…{n}的变量
		 */
		_messages:{
			validateFormError:"提交数据不完整，{0}个字段有错误，请改正后再提交! ",
			alertSelectMsg:"请选择信息!"
		},
		messager:{
			OK:"确定",
			CANCEL:"取消",
			CONFIRM:"确认",
			ERROR:"错误",
			WARN:"警告",
			INFO:"信息",
			CORRECT:"成功",
			PROMPT:"提示"
		},
		/**
		 * 表格多语
		 */
		dataTable:{
			oLanguage:{
				oPaginate:{
					sFirst: "首页",
					sLast: "末页",
					sPrevious:"上一页",
					sNext:"下一页"
				},
				sLengthMenu: "每页显示 _MENU_ 条",
				sSearch:"查找:_INPUT_",
				sEmptyTable: "无符合条件的数据",
				sInfo: "当显示&nbsp;从 _START_ 到 _END_ 条记录&nbsp;&nbsp;&nbsp;总共 _TOTAL_ 记录",
				sInfoEmpty: "无显示记录",
				sLoadingRecords: "加载中...",
				sProcessing: "处理中...",
				sZeroRecords: "无符合条件的数据"
			}
		},
		pagination:{
			previous:"上一页",
			next:"下一页",
			pageInfo:"总共{0}记录,共{2}页,&nbsp;&nbsp;&nbsp;当显示第{3}页&nbsp;从{4}到{5}条记录",
			pageSizeInfo:"<ul class='ulnostyle uloneline'><li class='controltxt' >每页</li><li>{0}</li><li class='controltxt'>条记录</li></ul>"
		},
		validator:{
			
		},
		datetimepicker:{
			days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
			daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
			daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
			months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			today: "今日",
			suffix: [],
			meridiem: []
		},
		magicsuggest:{
			noSuggestionText:"无相关数据"
		},
		flexigrid:{
			errormsg:"加载数据错误",
			pagestat:"当前显示从 {from}到{to}条记录&nbsp;&nbsp;&nbsp;总共{total}记录 ",
			pagetext:"",
			outof:"/",
			procmsg:"数据加载中……",
			nomsg:"无符合条件的数据"
		}
	};
	App.lang = that;
	
	$.jgrid = $.jgrid || {};
	$.extend($.jgrid,{
	    defaults : {
	        recordtext: "{0} - {1}\u3000共 {2} 条", // 共字前是全角空格
	        emptyrecords: "无符合条件的记录。",
	        loadtext: "读取中...",
	        pgtext : " {0} 共 {1} 页"
	    },
	    search : {
	        caption: "搜索...",
	        Find: "查找",
	        Reset: "重置",
	        odata: [{ oper:'eq', text:'等于\u3000\u3000'},{ oper:'ne', text:'不等\u3000\u3000'},{ oper:'lt', text:'小于\u3000\u3000'},{ oper:'le', text:'小于等于'},{ oper:'gt', text:'大于\u3000\u3000'},{ oper:'ge', text:'大于等于'},{ oper:'bw', text:'开始于'},{ oper:'bn', text:'不开始于'},{ oper:'in', text:'属于\u3000\u3000'},{ oper:'ni', text:'不属于'},{ oper:'ew', text:'结束于'},{ oper:'en', text:'不结束于'},{ oper:'cn', text:'包含\u3000\u3000'},{ oper:'nc', text:'不包含'}],
	        groupOps: [ { op: "AND", text: "所有" },    { op: "OR",  text: "任一" } ]
	    },
	    edit : {
	        addCaption: "添加记录",
	        editCaption: "编辑记录",
	        bSubmit: "提交",
	        bCancel: "取消",
	        bClose: "关闭",
	        saveData: "数据已改变，是否保存？",
	        bYes : "是",
	        bNo : "否",
	        bExit : "取消",
	        msg: {
	            required:"此字段必需",
	            number:"请输入有效数字",
	            minValue:"输值必须大于等于 ",
	            maxValue:"输值必须小于等于 ",
	            email: "这不是有效的e-mail地址",
	            integer: "请输入有效整数",
	            date: "请输入有效时间",
	            url: "无效网址。前缀必须为 ('http://' 或 'https://')",
	            nodefined : " 未定义！",
	            novalue : " 需要返回值！",
	            customarray : "自定义函数需要返回数组！",
	            customfcheck : "Custom function should be present in case of custom checking!"
	        }
	    },
	    view : {
	        caption: "查看记录",
	        bClose: "关闭"
	    },
	    del : {
	        caption: "删除",
	        msg: "删除所选记录？",
	        bSubmit: "删除",
	        bCancel: "取消"
	    },
	    nav : {
	        edittext: "",
	        edittitle: "编辑所选记录",
	        addtext:"",
	        addtitle: "添加新记录",
	        deltext: "",
	        deltitle: "删除所选记录",
	        searchtext: "",
	        searchtitle: "查找",
	        refreshtext: "",
	        refreshtitle: "刷新表格",
	        alertcap: "注意",
	        alerttext: "请选择记录",
	        viewtext: "",
	        viewtitle: "查看所选记录"
	    },
	    col : {
	        caption: "选择列",
	        bSubmit: "确定",
	        bCancel: "取消"
	    },
	    errors : {
	        errcap : "错误",
	        nourl : "没有设置url",
	        norecords: "没有要处理的记录",
	        model : "colNames 和 colModel 长度不等！"
	    },
	    formatter : {
	        integer : {thousandsSeparator: ",", defaultValue: '0'},
	        number : {decimalSeparator:".", thousandsSeparator: ",", decimalPlaces: 2, defaultValue: '0.00'},
	        currency : {decimalSeparator:".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0.00'},
	        date : {
	            dayNames:   [
	                "日", "一", "二", "三", "四", "五", "六",
	                "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六",
	            ],
	            monthNames: [
	                "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二",
	                "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
	            ],
	            AmPm : ["am","pm","上午","下午"],
	            S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th';},
	            srcformat: 'Y-m-d',
	            newformat: 'Y-m-d',
	            parseRe : /[Tt\\\/:_;.,\t\s-]/,
	            masks : {
	                // see http://php.net/manual/en/function.date.php for PHP format used in jqGrid
	                // and see http://docs.jquery.com/UI/Datepicker/formatDate
	                // and https://github.com/jquery/globalize#dates for alternative formats used frequently
	                // one can find on https://github.com/jquery/globalize/tree/master/lib/cultures many
	                // information about date, time, numbers and currency formats used in different countries
	                // one should just convert the information in PHP format
	                ISO8601Long:"Y-m-d H:i:s",
	                ISO8601Short:"Y-m-d",
	                // short date:
	                //    n - Numeric representation of a month, without leading zeros
	                //    j - Day of the month without leading zeros
	                //    Y - A full numeric representation of a year, 4 digits
	                // example: 3/1/2012 which means 1 March 2012
	                ShortDate: "n/j/Y", // in jQuery UI Datepicker: "M/d/yyyy"
	                // long date:
	                //    l - A full textual representation of the day of the week
	                //    F - A full textual representation of a month
	                //    d - Day of the month, 2 digits with leading zeros
	                //    Y - A full numeric representation of a year, 4 digits
	                LongDate: "l, F d, Y", // in jQuery UI Datepicker: "dddd, MMMM dd, yyyy"
	                // long date with long time:
	                //    l - A full textual representation of the day of the week
	                //    F - A full textual representation of a month
	                //    d - Day of the month, 2 digits with leading zeros
	                //    Y - A full numeric representation of a year, 4 digits
	                //    g - 12-hour format of an hour without leading zeros
	                //    i - Minutes with leading zeros
	                //    s - Seconds, with leading zeros
	                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
	                FullDateTime: "l, F d, Y g:i:s A", // in jQuery UI Datepicker: "dddd, MMMM dd, yyyy h:mm:ss tt"
	                // month day:
	                //    F - A full textual representation of a month
	                //    d - Day of the month, 2 digits with leading zeros
	                MonthDay: "F d", // in jQuery UI Datepicker: "MMMM dd"
	                // short time (without seconds)
	                //    g - 12-hour format of an hour without leading zeros
	                //    i - Minutes with leading zeros
	                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
	                ShortTime: "g:i A", // in jQuery UI Datepicker: "h:mm tt"
	                // long time (with seconds)
	                //    g - 12-hour format of an hour without leading zeros
	                //    i - Minutes with leading zeros
	                //    s - Seconds, with leading zeros
	                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
	                LongTime: "g:i:s A", // in jQuery UI Datepicker: "h:mm:ss tt"
	                SortableDateTime: "Y-m-d\\TH:i:s",
	                UniversalSortableDateTime: "Y-m-d H:i:sO",
	                // month with year
	                //    Y - A full numeric representation of a year, 4 digits
	                //    F - A full textual representation of a month
	                YearMonth: "F, Y" // in jQuery UI Datepicker: "MMMM, yyyy"
	            },
	            reformatAfterEdit : false
	        },
	        baseLinkUrl: '',
	        showAction: '',
	        target: '',
	        checkbox : {disabled:true},
	        idName : 'id'
	    }
	});
	return that;
});
define('app-plugin',["bs-http-plugin/base-pluginvoke",

"bs-http-plugin/bs-ca-auth",

"bs-http-plugin/bs-doccamera",

"bs-http-plugin/bs-pd",

"bs-http-plugin/bs-pos",

"bs-http-plugin/bs-print",

"bs-http-plugin/cas-login",

"bs-http-plugin/config-ext",

"bs-http-plugin/config",

"bs-http-plugin/data-transmit/message",

"bs-http-plugin/data-transmit/socket",

"bs-http-plugin/util/img-lazyload",

"bs-http-plugin/util/uuid",

"app/widgets/app-lang_zh_CN"],function(){});
