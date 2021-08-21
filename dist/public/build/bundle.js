
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // https://stackoverflow.com/a/47914369
    var convert2jpg = (file) => {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], "image.jpg"));
                }, "image/jpeg", 0.98); // Quality: 98%
            };
            image.src = URL.createObjectURL(file);
        });
    };

    const dummyCallback = (_) => { };
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    function capitalize(text) {
        return text[0].toUpperCase() + text.substring(1);
    }
    /**
     * Send a series of requests to Wombo API endpoints to make Wombo lip-sync an
     * image or pair of images to a meme song/quote. This process is far from
     * instant, so an optional progress callback can be used to track the process
     * and keep the user updated.
     * If the number of images in the list is greater than 1, the meme will be
     * processed as a Wombo Combo.
     * Memes are referenced by numerical ID. All memes numbered 1 to 400
     * that are available as of 6/6/2021 are cataloged in /memes.json.
     * (A ton more memes have been added since then. I need to re-scrape the API.)
     */
    async function generateMeme(meme, images, onProgressUpdate = dummyCallback) {
        // Wombo only accepts JPGs. If any provided image is not a JPG, it must
        // be converted before it can be sent to Wombo.
        for (let i = 0; i < images.length; ++i) {
            if (images[i].type !== "image/jpeg") {
                onProgressUpdate("Converting images...");
                images[i] = await convert2jpg(images[i]);
            }
        }
        onProgressUpdate("Reserving upload locations...");
        const [requestID, uploadLocations] = await reserveUploadLocations(meme.combo);
        onProgressUpdate("Uploading images...");
        await uploadImages(uploadLocations, images);
        onProgressUpdate("Generating Wombo...");
        return await processImages(requestID, meme.id, onProgressUpdate);
    }
    /**
     * Reserve an S3 object to upload an image to.
     * The received request ID and upload_photo.fields are used in subsequent
     * requests.
     */
    async function reserveUploadLocations(combo = false) {
        const response = await fetch("/reserve-upload-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                numwombo: combo ? 2 : 1,
                premium: false,
                user_id: null,
            }),
        });
        const data = await response.json();
        return [data.id, data.upload_photos];
    }
    /**
     * Upload the images to their reserved locations.
     * This request sends the "fields" object of each entry in "upload_photos"
     * returned from the previous response along with the files to upload as
     * multipart/form-data to an Amazon AWS S3 endpoint.
     */
    async function uploadImages(uploadLocations, images) {
        for (let i = 0; i < uploadLocations.length; ++i) {
            const formData = new FormData();
            const fields = uploadLocations[i].fields;
            for (const key in fields) {
                formData.append(key, fields[key]);
            }
            formData.append("file", images[i], "image.jpg");
            await fetch("/upload-image", {
                method: "POST",
                body: formData,
            });
        }
    }
    /**
     * Ask Wombo to begin processing the uploaded image, then return the URL to the
     * completed video when finished.
     */
    async function processImages(requestID, memeID, onProgressUpdate = dummyCallback) {
        // Telling Wombo to begin lip-syncing your image to the given meme.
        await fetch("/start-processing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                request_id: requestID,
                request_info: {
                    meme_id: memeID,
                    premium: false, // TODO: What happens when you make this true?
                }
            }),
        });
        // Poll Wombo every 2 seconds for the meme's completion status.
        // (Annoying, but this is how the real app does it)
        while (true) {
            const response = await fetch("/get-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    request_id: requestID,
                }),
            });
            const data = await response.json();
            switch (data.state) {
                case "completed":
                    return data.video_url;
                case "failed":
                case "input":
                    throw Error(`Generation failed: ${JSON.stringify(data)}`);
                default:
                    onProgressUpdate(capitalize(data.state) + "...");
            }
            await delay(2000);
        }
    }

    /* src\client\components\ErrorBanner.svelte generated by Svelte v3.38.2 */

    const file$a = "src\\client\\components\\ErrorBanner.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(/*text*/ ctx[0]);
    			t1 = space();
    			button = element("button");
    			add_location(span, file$a, 7, 1, 119);
    			attr_dev(button, "class", "close icon svelte-1enxikf");
    			add_location(button, file$a, 8, 1, 141);
    			attr_dev(div, "class", "error-banner svelte-1enxikf");
    			add_location(div, file$a, 6, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			/*div_binding*/ ctx[3](div);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t0, /*text*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[3](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ErrorBanner", slots, []);
    	let { text = "" } = $$props;
    	let banner;
    	const writable_props = ["text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ErrorBanner> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => banner.remove();

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			banner = $$value;
    			$$invalidate(1, banner);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ text, banner });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("banner" in $$props) $$invalidate(1, banner = $$props.banner);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, banner, click_handler, div_binding];
    }

    class ErrorBanner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorBanner",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get text() {
    		throw new Error("<ErrorBanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ErrorBanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\client\components\pages\PageTemplate.svelte generated by Svelte v3.38.2 */
    const file$9 = "src\\client\\components\\pages\\PageTemplate.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let section_transition;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			attr_dev(section, "class", "svelte-vaz8tc");
    			toggle_class(section, "center", /*center*/ ctx[0]);
    			add_location(section, file$9, 8, 0, 143);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (dirty & /*center*/ 1) {
    				toggle_class(section, "center", /*center*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!section_transition) section_transition = create_bidirectional_transition(section, fade, /*fadeParams*/ ctx[1], true);
    				section_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!section_transition) section_transition = create_bidirectional_transition(section, fade, /*fadeParams*/ ctx[1], false);
    			section_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && section_transition) section_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PageTemplate", slots, ['default']);
    	let { center = false } = $$props;
    	const fadeParams = { duration: 250 };
    	const writable_props = ["center"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageTemplate> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("center" in $$props) $$invalidate(0, center = $$props.center);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade, center, fadeParams });

    	$$self.$inject_state = $$props => {
    		if ("center" in $$props) $$invalidate(0, center = $$props.center);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [center, fadeParams, $$scope, slots];
    }

    class PageTemplate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { center: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageTemplate",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get center() {
    		throw new Error("<PageTemplate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<PageTemplate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\DropArea.svelte generated by Svelte v3.38.2 */

    const file_1 = "src\\client\\components\\DropArea.svelte";

    // (51:1) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;
    	let if_block = !/*disabled*/ ctx[1] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "image icon svelte-nmilqg");
    			add_location(div, file_1, 51, 2, 1655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*disabled*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(51:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:1) {#if file}
    function create_if_block$6(ctx) {
    	let img;
    	let img_src_value;
    	let t;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			button = element("button");
    			attr_dev(img, "alt", "Input");
    			if (img.src !== (img_src_value = URL.createObjectURL(/*file*/ ctx[0]))) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-nmilqg");
    			add_location(img, file_1, 48, 2, 1539);
    			attr_dev(button, "class", "delete icon svelte-nmilqg");
    			add_location(button, file_1, 49, 2, 1594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*clear*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*file*/ 1 && img.src !== (img_src_value = URL.createObjectURL(/*file*/ ctx[0]))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(48:1) {#if file}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {#if !disabled}
    function create_if_block_1$1(ctx) {
    	let label;
    	let t;
    	let input_1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text("Choose or drag and drop an image\r\n\t\t\t\t");
    			input_1 = element("input");
    			attr_dev(input_1, "type", "file");
    			attr_dev(input_1, "accept", "image/*");
    			input_1.disabled = /*disabled*/ ctx[1];
    			attr_dev(input_1, "class", "svelte-nmilqg");
    			add_location(input_1, file_1, 54, 4, 1750);
    			attr_dev(label, "class", "svelte-nmilqg");
    			add_location(label, file_1, 53, 3, 1705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    			append_dev(label, input_1);
    			/*input_1_binding*/ ctx[7](input_1);

    			if (!mounted) {
    				dispose = listen_dev(input_1, "change", /*change_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*disabled*/ 2) {
    				prop_dev(input_1, "disabled", /*disabled*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*input_1_binding*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(53:2) {#if !disabled}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*file*/ ctx[0]) return create_if_block$6;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "drop-area svelte-nmilqg");
    			toggle_class(div, "empty", !/*file*/ ctx[0]);
    			toggle_class(div, "dragover", /*dragover*/ ctx[3]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[1]);
    			add_location(div, file_1, 37, 0, 1264);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(div, "dragenter", /*dragenter_handler*/ ctx[10], false, false, false),
    					listen_dev(div, "dragleave", /*dragleave_handler*/ ctx[11], false, false, false),
    					listen_dev(div, "dragover", handleDragover, false, false, false),
    					listen_dev(div, "drop", /*handleDrop*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*file*/ 1) {
    				toggle_class(div, "empty", !/*file*/ ctx[0]);
    			}

    			if (dirty & /*dragover*/ 8) {
    				toggle_class(div, "dragover", /*dragover*/ ctx[3]);
    			}

    			if (dirty & /*disabled*/ 2) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleDragover(event) {
    	// Drop event doesn't fire if dragover isn't canceled 🤷‍♂️
    	// https://stackoverflow.com/a/21341021
    	event.preventDefault();
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DropArea", slots, []);
    	
    	let { file = undefined } = $$props;
    	let { disabled = false } = $$props;
    	let input;

    	// FUNNY BUSINESS: This number's truthiness determines the component's
    	// .dragover class state.
    	// To accomodate for how dragging over a child element triggers a dragenter
    	// followed by a dragleave from the parent, we can't just use a boolean
    	// otherwise the dragleave will set the class to false even though the
    	// user is still dragging over the component.
    	// Incrementing and decrementing this value on dragenter and dragleave
    	// events and using the number's truthiness as a boolean keeps the
    	// .dragover class state accurate.
    	let dragover = 0;

    	function handleDrop(event) {
    		event.preventDefault(); // Prevent opening image in new tab
    		handleFile(event.dataTransfer.files);
    		$$invalidate(3, dragover = 0);
    	}

    	function handleFile(files) {
    		if (!disabled && files.item(0).type.startsWith("image/")) {
    			$$invalidate(0, file = files.item(0));
    		}
    	}

    	function clear(event) {
    		event.stopPropagation(); // Prevent "choose" dialog re-trigger
    		$$invalidate(0, file = undefined);
    	}

    	const writable_props = ["file", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DropArea> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(2, input);
    		});
    	}

    	const change_handler = () => handleFile(input.files);
    	const click_handler = () => file || input.click();
    	const dragenter_handler = () => $$invalidate(3, ++dragover);
    	const dragleave_handler = () => $$invalidate(3, --dragover);

    	$$self.$$set = $$props => {
    		if ("file" in $$props) $$invalidate(0, file = $$props.file);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		file,
    		disabled,
    		input,
    		dragover,
    		handleDrop,
    		handleDragover,
    		handleFile,
    		clear
    	});

    	$$self.$inject_state = $$props => {
    		if ("file" in $$props) $$invalidate(0, file = $$props.file);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("input" in $$props) $$invalidate(2, input = $$props.input);
    		if ("dragover" in $$props) $$invalidate(3, dragover = $$props.dragover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		file,
    		disabled,
    		input,
    		dragover,
    		handleDrop,
    		handleFile,
    		clear,
    		input_1_binding,
    		change_handler,
    		click_handler,
    		dragenter_handler,
    		dragleave_handler
    	];
    }

    class DropArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { file: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DropArea",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get file() {
    		throw new Error("<DropArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file(value) {
    		throw new Error("<DropArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<DropArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<DropArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\NextButton.svelte generated by Svelte v3.38.2 */
    const file$8 = "src\\client\\components\\NextButton.svelte";

    function create_fragment$8(ctx) {
    	let a;
    	let a_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "class", "next-button svelte-18i7n5");
    			attr_dev(a, "href", /*href*/ ctx[0]);
    			attr_dev(a, "download", /*download*/ ctx[1]);
    			attr_dev(a, "target", /*target*/ ctx[2]);
    			add_location(a, file$8, 9, 0, 161);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*href*/ 1) {
    				attr_dev(a, "href", /*href*/ ctx[0]);
    			}

    			if (!current || dirty & /*download*/ 2) {
    				attr_dev(a, "download", /*download*/ ctx[1]);
    			}

    			if (!current || dirty & /*target*/ 4) {
    				attr_dev(a, "target", /*target*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!a_transition) a_transition = create_bidirectional_transition(a, fly, { x: window.innerWidth, duration: 500 }, true);
    				a_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!a_transition) a_transition = create_bidirectional_transition(a, fly, { x: window.innerWidth, duration: 500 }, false);
    			a_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && a_transition) a_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NextButton", slots, ['default']);
    	
    	let { href = null } = $$props;
    	let { download = null } = $$props;
    	let { target = null } = $$props;
    	const writable_props = ["href", "download", "target"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NextButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("download" in $$props) $$invalidate(1, download = $$props.download);
    		if ("target" in $$props) $$invalidate(2, target = $$props.target);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fly, href, download, target });

    	$$self.$inject_state = $$props => {
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("download" in $$props) $$invalidate(1, download = $$props.download);
    		if ("target" in $$props) $$invalidate(2, target = $$props.target);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [href, download, target, $$scope, slots, click_handler];
    }

    class NextButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { href: 0, download: 1, target: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NextButton",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get href() {
    		throw new Error("<NextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<NextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get download() {
    		throw new Error("<NextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set download(value) {
    		throw new Error("<NextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get target() {
    		throw new Error("<NextButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set target(value) {
    		throw new Error("<NextButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\pages\UploadPage.svelte generated by Svelte v3.38.2 */
    const file$7 = "src\\client\\components\\pages\\UploadPage.svelte";

    // (18:4) {#if images[0]}
    function create_if_block$5(ctx) {
    	let nextbutton;
    	let current;

    	nextbutton = new NextButton({
    			props: {
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	nextbutton.$on("click", /*click_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(nextbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nextbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const nextbutton_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				nextbutton_changes.$$scope = { dirty, ctx };
    			}

    			nextbutton.$set(nextbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nextbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nextbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nextbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(18:4) {#if images[0]}",
    		ctx
    	});

    	return block;
    }

    // (19:8) <NextButton on:click={ () => dispatch("submit", images) }>
    function create_default_slot_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit Face");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(19:8) <NextButton on:click={ () => dispatch(\\\"submit\\\", images) }>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <PageTemplate center>
    function create_default_slot$3(ctx) {
    	let div;
    	let droparea0;
    	let updating_file;
    	let t0;
    	let droparea1;
    	let updating_file_1;
    	let t1;
    	let if_block_anchor;
    	let current;

    	function droparea0_file_binding(value) {
    		/*droparea0_file_binding*/ ctx[2](value);
    	}

    	let droparea0_props = {};

    	if (/*images*/ ctx[0][0] !== void 0) {
    		droparea0_props.file = /*images*/ ctx[0][0];
    	}

    	droparea0 = new DropArea({ props: droparea0_props, $$inline: true });
    	binding_callbacks.push(() => bind(droparea0, "file", droparea0_file_binding));

    	function droparea1_file_binding(value) {
    		/*droparea1_file_binding*/ ctx[3](value);
    	}

    	let droparea1_props = { disabled: !/*images*/ ctx[0][0] };

    	if (/*images*/ ctx[0][1] !== void 0) {
    		droparea1_props.file = /*images*/ ctx[0][1];
    	}

    	droparea1 = new DropArea({ props: droparea1_props, $$inline: true });
    	binding_callbacks.push(() => bind(droparea1, "file", droparea1_file_binding));
    	let if_block = /*images*/ ctx[0][0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(droparea0.$$.fragment);
    			t0 = space();
    			create_component(droparea1.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "svelte-s44igd");
    			add_location(div, file$7, 12, 4, 318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(droparea0, div, null);
    			append_dev(div, t0);
    			mount_component(droparea1, div, null);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const droparea0_changes = {};

    			if (!updating_file && dirty & /*images*/ 1) {
    				updating_file = true;
    				droparea0_changes.file = /*images*/ ctx[0][0];
    				add_flush_callback(() => updating_file = false);
    			}

    			droparea0.$set(droparea0_changes);
    			const droparea1_changes = {};
    			if (dirty & /*images*/ 1) droparea1_changes.disabled = !/*images*/ ctx[0][0];

    			if (!updating_file_1 && dirty & /*images*/ 1) {
    				updating_file_1 = true;
    				droparea1_changes.file = /*images*/ ctx[0][1];
    				add_flush_callback(() => updating_file_1 = false);
    			}

    			droparea1.$set(droparea1_changes);

    			if (/*images*/ ctx[0][0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*images*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(droparea0.$$.fragment, local);
    			transition_in(droparea1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(droparea0.$$.fragment, local);
    			transition_out(droparea1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(droparea0);
    			destroy_component(droparea1);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(12:0) <PageTemplate center>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let pagetemplate;
    	let current;

    	pagetemplate = new PageTemplate({
    			props: {
    				center: true,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pagetemplate.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagetemplate, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagetemplate_changes = {};

    			if (dirty & /*$$scope, images*/ 33) {
    				pagetemplate_changes.$$scope = { dirty, ctx };
    			}

    			pagetemplate.$set(pagetemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagetemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagetemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagetemplate, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UploadPage", slots, []);
    	
    	let images = [];
    	const dispatch = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UploadPage> was created with unknown prop '${key}'`);
    	});

    	function droparea0_file_binding(value) {
    		if ($$self.$$.not_equal(images[0], value)) {
    			images[0] = value;
    			$$invalidate(0, images);
    		}
    	}

    	function droparea1_file_binding(value) {
    		if ($$self.$$.not_equal(images[1], value)) {
    			images[1] = value;
    			$$invalidate(0, images);
    		}
    	}

    	const click_handler = () => dispatch("submit", images);

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		PageTemplate,
    		DropArea,
    		NextButton,
    		images,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(0, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		images,
    		dispatch,
    		droparea0_file_binding,
    		droparea1_file_binding,
    		click_handler
    	];
    }

    class UploadPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UploadPage",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\client\components\BackButton.svelte generated by Svelte v3.38.2 */
    const file$6 = "src\\client\\components\\BackButton.svelte";

    // (12:1) {#if icon}
    function create_if_block$4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			set_style(span, "background-image", "url('../img/" + /*icon*/ ctx[0] + ".svg')");
    			attr_dev(span, "class", "svelte-166giej");
    			add_location(span, file$6, 12, 2, 212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 1) {
    				set_style(span, "background-image", "url('../img/" + /*icon*/ ctx[0] + ".svg')");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:1) {#if icon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let button;
    	let t;
    	let button_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[0] && create_if_block$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", "back-button svelte-166giej");
    			add_location(button, file$6, 7, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, fly, { x: -300, duration: 500 }, true);
    				button_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!button_transition) button_transition = create_bidirectional_transition(button, fly, { x: -300, duration: 500 }, false);
    			button_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && button_transition) button_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BackButton", slots, ['default']);
    	
    	let { icon } = $$props;
    	const writable_props = ["icon"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fly, icon });

    	$$self.$inject_state = $$props => {
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [icon, $$scope, slots, click_handler];
    }

    class BackButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { icon: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackButton",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !("icon" in props)) {
    			console.warn("<BackButton> was created without expected prop 'icon'");
    		}
    	}

    	get icon() {
    		throw new Error("<BackButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<BackButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Load gradients JSON file
    const gradientsLoaded = fetch("../gradients.json")
        .then(response => response.json());
    async function generateGradient(rotation = "0deg") {
        const gradients = await gradientsLoaded;
        const gradient = gradients[Math.floor(Math.random() * gradients.length)];
        let gradientString = `linear-gradient(${rotation}`;
        for (let i = 0; i < gradient.colors.length; ++i) {
            const color = gradient.colors[i];
            const position = 100 * i / (gradient.colors.length - 1);
            gradientString += `, ${color} ${position}%`;
        }
        return gradientString + ");";
    }

    /* src\client\components\MemeRadioButton.svelte generated by Svelte v3.38.2 */
    const file$5 = "src\\client\\components\\MemeRadioButton.svelte";

    // (69:1) {#if meme.combo}
    function create_if_block$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Combo";
    			attr_dev(span, "class", "combo svelte-18g0vmo");
    			add_location(span, file$5, 69, 2, 2403);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(69:1) {#if meme.combo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let audio;
    	let audio_src_value;
    	let t1;
    	let button;
    	let t2;
    	let div;
    	let p0;
    	let t3_value = /*meme*/ ctx[1].name + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5_value = /*meme*/ ctx[1].artist + "";
    	let t5;
    	let t6;
    	let mounted;
    	let dispose;
    	let if_block = /*meme*/ ctx[1].combo && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			audio = element("audio");
    			t1 = space();
    			button = element("button");
    			t2 = space();
    			div = element("div");
    			p0 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "radio");
    			input.value = input_value_value = /*meme*/ ctx[1].id;
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "class", "svelte-18g0vmo");
    			add_location(input, file$5, 50, 1, 1899);
    			if (audio.src !== (audio_src_value = "https://songs.wombo.ai/" + /*meme*/ ctx[1].id + ".mp3")) attr_dev(audio, "src", audio_src_value);
    			attr_dev(audio, "preload", "none");
    			add_location(audio, file$5, 55, 1, 2014);
    			attr_dev(button, "class", "svelte-18g0vmo");
    			toggle_class(button, "playing", /*playing*/ ctx[5]);
    			add_location(button, file$5, 62, 1, 2263);
    			attr_dev(p0, "class", "name svelte-18g0vmo");
    			add_location(p0, file$5, 64, 2, 2299);
    			attr_dev(p1, "class", "artist svelte-18g0vmo");
    			add_location(p1, file$5, 65, 2, 2334);
    			attr_dev(div, "class", "svelte-18g0vmo");
    			add_location(div, file$5, 63, 1, 2290);
    			attr_dev(label, "class", "meme-radio-button svelte-18g0vmo");
    			toggle_class(label, "selected", /*isSelected*/ ctx[6]);
    			add_location(label, file$5, 45, 0, 1740);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, audio);
    			/*audio_binding*/ ctx[7](audio);
    			append_dev(label, t1);
    			append_dev(label, button);
    			append_dev(label, t2);
    			append_dev(label, div);
    			append_dev(div, p0);
    			append_dev(p0, t3);
    			append_dev(div, t4);
    			append_dev(div, p1);
    			append_dev(p1, t5);
    			append_dev(label, t6);
    			if (if_block) if_block.m(label, null);
    			/*label_binding*/ ctx[10](label);

    			if (!mounted) {
    				dispose = [
    					listen_dev(audio, "play", /*play_handler*/ ctx[8], false, false, false),
    					listen_dev(audio, "pause", /*pause_handler*/ ctx[9], false, false, false),
    					listen_dev(label, "click", prevent_default(/*click_handler*/ ctx[11]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*meme*/ 2 && input_value_value !== (input_value_value = /*meme*/ ctx[1].id)) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*meme*/ 2 && audio.src !== (audio_src_value = "https://songs.wombo.ai/" + /*meme*/ ctx[1].id + ".mp3")) {
    				attr_dev(audio, "src", audio_src_value);
    			}

    			if (dirty & /*playing*/ 32) {
    				toggle_class(button, "playing", /*playing*/ ctx[5]);
    			}

    			if (dirty & /*meme*/ 2 && t3_value !== (t3_value = /*meme*/ ctx[1].name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*meme*/ 2 && t5_value !== (t5_value = /*meme*/ ctx[1].artist + "")) set_data_dev(t5, t5_value);

    			if (/*meme*/ ctx[1].combo) {
    				if (if_block) ; else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(label, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*isSelected*/ 64) {
    				toggle_class(label, "selected", /*isSelected*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*audio_binding*/ ctx[7](null);
    			if (if_block) if_block.d();
    			/*label_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let _;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MemeRadioButton", slots, []);
    	
    	let { meme } = $$props;
    	let { selectedMeme = undefined } = $$props;
    	let { name = "" } = $$props;
    	let previewElement;
    	let mainElement;
    	let playing = false;
    	let isSelected = false;
    	let updatedRecently = false;

    	generateGradient("90deg").then(gradient => {
    		mainElement.setAttribute("style", `background: ${gradient}`);
    	});

    	function update() {
    		// This function inexplicably gets called twice for the component that
    		// was selected. I am tired of working on this component, so instead of
    		// fixing the problem, I've just bandaged it by not letting this
    		// function run twice in quick succession.
    		if (updatedRecently) return;

    		updatedRecently = true;
    		setTimeout(() => updatedRecently = false, 10);
    		$$invalidate(6, isSelected = meme.id === selectedMeme.id);

    		// Play/pause selected meme;
    		// stop any not-selected memes that are currently playing.
    		if (previewElement && !previewElement.paused) {
    			previewElement.pause();
    			$$invalidate(3, previewElement.currentTime = 0, previewElement);
    		} else if (isSelected) {
    			previewElement === null || previewElement === void 0
    			? void 0
    			: previewElement.play();
    		}
    	}

    	const writable_props = ["meme", "selectedMeme", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MemeRadioButton> was created with unknown prop '${key}'`);
    	});

    	function audio_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			previewElement = $$value;
    			$$invalidate(3, previewElement);
    		});
    	}

    	const play_handler = () => $$invalidate(5, playing = true);
    	const pause_handler = () => $$invalidate(5, playing = false);

    	function label_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			mainElement = $$value;
    			$$invalidate(4, mainElement);
    		});
    	}

    	const click_handler = () => $$invalidate(0, selectedMeme = meme);

    	$$self.$$set = $$props => {
    		if ("meme" in $$props) $$invalidate(1, meme = $$props.meme);
    		if ("selectedMeme" in $$props) $$invalidate(0, selectedMeme = $$props.selectedMeme);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		generateGradient,
    		meme,
    		selectedMeme,
    		name,
    		previewElement,
    		mainElement,
    		playing,
    		isSelected,
    		updatedRecently,
    		update,
    		_
    	});

    	$$self.$inject_state = $$props => {
    		if ("meme" in $$props) $$invalidate(1, meme = $$props.meme);
    		if ("selectedMeme" in $$props) $$invalidate(0, selectedMeme = $$props.selectedMeme);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("previewElement" in $$props) $$invalidate(3, previewElement = $$props.previewElement);
    		if ("mainElement" in $$props) $$invalidate(4, mainElement = $$props.mainElement);
    		if ("playing" in $$props) $$invalidate(5, playing = $$props.playing);
    		if ("isSelected" in $$props) $$invalidate(6, isSelected = $$props.isSelected);
    		if ("updatedRecently" in $$props) updatedRecently = $$props.updatedRecently;
    		if ("_" in $$props) _ = $$props._;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedMeme*/ 1) {
    			// Call update() when selectedMeme changes because of this component OR
    			// because a different instance of this component bound to the same value
    			// has changed it. Assigning update() to a click handler in the component's
    			// HTML will make it miss the events where it's been deselected.
    			// The component needs to know both when it's been selected and deselected
    			// to keep its CSS "selected" effect up to date and to stop its preview when
    			// it's been deselected.
    			_ = selectedMeme && update();
    		}
    	};

    	return [
    		selectedMeme,
    		meme,
    		name,
    		previewElement,
    		mainElement,
    		playing,
    		isSelected,
    		audio_binding,
    		play_handler,
    		pause_handler,
    		label_binding,
    		click_handler
    	];
    }

    class MemeRadioButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { meme: 1, selectedMeme: 0, name: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MemeRadioButton",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*meme*/ ctx[1] === undefined && !("meme" in props)) {
    			console.warn("<MemeRadioButton> was created without expected prop 'meme'");
    		}
    	}

    	get meme() {
    		throw new Error("<MemeRadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meme(value) {
    		throw new Error("<MemeRadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedMeme() {
    		throw new Error("<MemeRadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedMeme(value) {
    		throw new Error("<MemeRadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<MemeRadioButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<MemeRadioButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\pages\SelectMemePage.svelte generated by Svelte v3.38.2 */
    const file$4 = "src\\client\\components\\pages\\SelectMemePage.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (1:0) <script lang="ts">;  import { createEventDispatcher }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">;  import { createEventDispatcher }",
    		ctx
    	});

    	return block;
    }

    // (17:1) {:then memes}
    function create_then_block(ctx) {
    	let div;
    	let current;
    	let each_value = /*memes*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$4, 17, 2, 484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*memesLoaded, meme*/ 3) {
    				each_value = /*memes*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(17:1) {:then memes}",
    		ctx
    	});

    	return block;
    }

    // (19:3) {#each memes as item}
    function create_each_block(ctx) {
    	let memeradiobutton;
    	let updating_selectedMeme;
    	let current;

    	function memeradiobutton_selectedMeme_binding(value) {
    		/*memeradiobutton_selectedMeme_binding*/ ctx[3](value);
    	}

    	let memeradiobutton_props = { name: "meme", meme: /*item*/ ctx[7] };

    	if (/*meme*/ ctx[1] !== void 0) {
    		memeradiobutton_props.selectedMeme = /*meme*/ ctx[1];
    	}

    	memeradiobutton = new MemeRadioButton({
    			props: memeradiobutton_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(memeradiobutton, "selectedMeme", memeradiobutton_selectedMeme_binding));

    	const block = {
    		c: function create() {
    			create_component(memeradiobutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(memeradiobutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const memeradiobutton_changes = {};
    			if (dirty & /*memesLoaded*/ 1) memeradiobutton_changes.meme = /*item*/ ctx[7];

    			if (!updating_selectedMeme && dirty & /*meme*/ 2) {
    				updating_selectedMeme = true;
    				memeradiobutton_changes.selectedMeme = /*meme*/ ctx[1];
    				add_flush_callback(() => updating_selectedMeme = false);
    			}

    			memeradiobutton.$set(memeradiobutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(memeradiobutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(memeradiobutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(memeradiobutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(19:3) {#each memes as item}",
    		ctx
    	});

    	return block;
    }

    // (15:21)     <p class="progress">Loading memes...</p>   {:then memes}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading memes...";
    			attr_dev(p, "class", "progress svelte-1tti5hd");
    			add_location(p, file$4, 15, 2, 424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(15:21)     <p class=\\\"progress\\\">Loading memes...</p>   {:then memes}",
    		ctx
    	});

    	return block;
    }

    // (27:1) {#if meme}
    function create_if_block$2(ctx) {
    	let nextbutton;
    	let current;

    	nextbutton = new NextButton({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	nextbutton.$on("click", /*click_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(nextbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nextbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const nextbutton_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				nextbutton_changes.$$scope = { dirty, ctx };
    			}

    			nextbutton.$set(nextbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nextbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nextbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nextbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(27:1) {#if meme}",
    		ctx
    	});

    	return block;
    }

    // (28:2) <NextButton on:click={ () => dispatch("submit", meme) }>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Choose Meme");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(28:2) <NextButton on:click={ () => dispatch(\\\"submit\\\", meme) }>",
    		ctx
    	});

    	return block;
    }

    // (33:1) <BackButton icon="undo" on:click={ () => dispatch("back") }>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Choose new image");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(33:1) <BackButton icon=\\\"undo\\\" on:click={ () => dispatch(\\\"back\\\") }>",
    		ctx
    	});

    	return block;
    }

    // (14:0) <PageTemplate>
    function create_default_slot$2(ctx) {
    	let promise;
    	let t0;
    	let t1;
    	let backbutton;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 6,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*memesLoaded*/ ctx[0], info);
    	let if_block = /*meme*/ ctx[1] && create_if_block$2(ctx);

    	backbutton = new BackButton({
    			props: {
    				icon: "undo",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	backbutton.$on("click", /*click_handler_1*/ ctx[5]);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(backbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t0.parentNode;
    			info.anchor = t0;
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(backbutton, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*memesLoaded*/ 1 && promise !== (promise = /*memesLoaded*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}

    			if (/*meme*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*meme*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const backbutton_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				backbutton_changes.$$scope = { dirty, ctx };
    			}

    			backbutton.$set(backbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(if_block);
    			transition_in(backbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(if_block);
    			transition_out(backbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(backbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(14:0) <PageTemplate>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let pagetemplate;
    	let current;

    	pagetemplate = new PageTemplate({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pagetemplate.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagetemplate, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagetemplate_changes = {};

    			if (dirty & /*$$scope, meme, memesLoaded*/ 1027) {
    				pagetemplate_changes.$$scope = { dirty, ctx };
    			}

    			pagetemplate.$set(pagetemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagetemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagetemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagetemplate, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SelectMemePage", slots, []);
    	
    	let { memesLoaded = undefined } = $$props;
    	let meme;
    	const dispatch = createEventDispatcher();
    	const writable_props = ["memesLoaded"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectMemePage> was created with unknown prop '${key}'`);
    	});

    	function memeradiobutton_selectedMeme_binding(value) {
    		meme = value;
    		$$invalidate(1, meme);
    	}

    	const click_handler = () => dispatch("submit", meme);
    	const click_handler_1 = () => dispatch("back");

    	$$self.$$set = $$props => {
    		if ("memesLoaded" in $$props) $$invalidate(0, memesLoaded = $$props.memesLoaded);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		PageTemplate,
    		NextButton,
    		BackButton,
    		MemeRadioButton,
    		memesLoaded,
    		meme,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("memesLoaded" in $$props) $$invalidate(0, memesLoaded = $$props.memesLoaded);
    		if ("meme" in $$props) $$invalidate(1, meme = $$props.meme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		memesLoaded,
    		meme,
    		dispatch,
    		memeradiobutton_selectedMeme_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class SelectMemePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { memesLoaded: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectMemePage",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get memesLoaded() {
    		throw new Error("<SelectMemePage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set memesLoaded(value) {
    		throw new Error("<SelectMemePage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\ProgressBar.svelte generated by Svelte v3.38.2 */

    const file$3 = "src\\client\\components\\ProgressBar.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "completeness svelte-1ld3f8u");
    			set_style(div0, "width", /*progressPercent*/ ctx[0] + "%");
    			add_location(div0, file$3, 6, 1, 97);
    			attr_dev(div1, "class", "progress-bar svelte-1ld3f8u");
    			add_location(div1, file$3, 5, 0, 68);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*progressPercent*/ 1) {
    				set_style(div0, "width", /*progressPercent*/ ctx[0] + "%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProgressBar", slots, []);
    	let { progressPercent = 0 } = $$props;
    	const writable_props = ["progressPercent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProgressBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("progressPercent" in $$props) $$invalidate(0, progressPercent = $$props.progressPercent);
    	};

    	$$self.$capture_state = () => ({ progressPercent });

    	$$self.$inject_state = $$props => {
    		if ("progressPercent" in $$props) $$invalidate(0, progressPercent = $$props.progressPercent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [progressPercent];
    }

    class ProgressBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { progressPercent: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressBar",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get progressPercent() {
    		throw new Error("<ProgressBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progressPercent(value) {
    		throw new Error("<ProgressBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\pages\GeneratingPage.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\client\\components\\pages\\GeneratingPage.svelte";

    // (17:1) <BackButton icon="x" on:click={ () => dispatch("back") }>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel Wombo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(17:1) <BackButton icon=\\\"x\\\" on:click={ () => dispatch(\\\"back\\\") }>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <PageTemplate center>
    function create_default_slot$1(ctx) {
    	let p0;
    	let t0;
    	let br;
    	let t1;
    	let t2;
    	let progressbar;
    	let updating_progressPercent;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let backbutton;
    	let current;

    	function progressbar_progressPercent_binding(value) {
    		/*progressbar_progressPercent_binding*/ ctx[3](value);
    	}

    	let progressbar_props = {};

    	if (/*progressPercent*/ ctx[0] !== void 0) {
    		progressbar_props.progressPercent = /*progressPercent*/ ctx[0];
    	}

    	progressbar = new ProgressBar({ props: progressbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(progressbar, "progressPercent", progressbar_progressPercent_binding));

    	backbutton = new BackButton({
    			props: {
    				icon: "x",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	backbutton.$on("click", /*click_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("Your Wombo is");
    			br = element("br");
    			t1 = text("being created!");
    			t2 = space();
    			create_component(progressbar.$$.fragment);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(/*progressMessage*/ ctx[1]);
    			t5 = space();
    			create_component(backbutton.$$.fragment);
    			add_location(br, file$2, 12, 34, 400);
    			attr_dev(p0, "class", "progress svelte-1tti5hd");
    			add_location(p0, file$2, 12, 1, 367);
    			add_location(p1, file$2, 14, 1, 484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, br);
    			append_dev(p0, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(progressbar, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t4);
    			insert_dev(target, t5, anchor);
    			mount_component(backbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progressbar_changes = {};

    			if (!updating_progressPercent && dirty & /*progressPercent*/ 1) {
    				updating_progressPercent = true;
    				progressbar_changes.progressPercent = /*progressPercent*/ ctx[0];
    				add_flush_callback(() => updating_progressPercent = false);
    			}

    			progressbar.$set(progressbar_changes);
    			if (!current || dirty & /*progressMessage*/ 2) set_data_dev(t4, /*progressMessage*/ ctx[1]);
    			const backbutton_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				backbutton_changes.$$scope = { dirty, ctx };
    			}

    			backbutton.$set(backbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			transition_in(backbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progressbar.$$.fragment, local);
    			transition_out(backbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			destroy_component(progressbar, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			destroy_component(backbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(12:0) <PageTemplate center>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let pagetemplate;
    	let current;

    	pagetemplate = new PageTemplate({
    			props: {
    				center: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pagetemplate.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagetemplate, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagetemplate_changes = {};

    			if (dirty & /*$$scope, progressMessage, progressPercent*/ 35) {
    				pagetemplate_changes.$$scope = { dirty, ctx };
    			}

    			pagetemplate.$set(pagetemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagetemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagetemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagetemplate, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GeneratingPage", slots, []);
    	let { progressMessage = "" } = $$props;
    	let { progressPercent = 0 } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ["progressMessage", "progressPercent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GeneratingPage> was created with unknown prop '${key}'`);
    	});

    	function progressbar_progressPercent_binding(value) {
    		progressPercent = value;
    		$$invalidate(0, progressPercent);
    	}

    	const click_handler = () => dispatch("back");

    	$$self.$$set = $$props => {
    		if ("progressMessage" in $$props) $$invalidate(1, progressMessage = $$props.progressMessage);
    		if ("progressPercent" in $$props) $$invalidate(0, progressPercent = $$props.progressPercent);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		PageTemplate,
    		ProgressBar,
    		BackButton,
    		progressMessage,
    		progressPercent,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("progressMessage" in $$props) $$invalidate(1, progressMessage = $$props.progressMessage);
    		if ("progressPercent" in $$props) $$invalidate(0, progressPercent = $$props.progressPercent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		progressPercent,
    		progressMessage,
    		dispatch,
    		progressbar_progressPercent_binding,
    		click_handler
    	];
    }

    class GeneratingPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { progressMessage: 1, progressPercent: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GeneratingPage",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get progressMessage() {
    		throw new Error("<GeneratingPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progressMessage(value) {
    		throw new Error("<GeneratingPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progressPercent() {
    		throw new Error("<GeneratingPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progressPercent(value) {
    		throw new Error("<GeneratingPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\pages\ResultPage.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\client\\components\\pages\\ResultPage.svelte";

    // (18:1) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t_value = /*error*/ ctx[2]?.message + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$1, 18, 2, 530);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 4 && t_value !== (t_value = /*error*/ ctx[2]?.message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(18:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:1) {#if videoURL}
    function create_if_block$1(ctx) {
    	let video;
    	let video_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			if (video.src !== (video_src_value = /*videoURL*/ ctx[1])) attr_dev(video, "src", video_src_value);
    			video.controls = true;
    			video.autoplay = true;
    			video.loop = true;
    			attr_dev(video, "class", "svelte-a4rcgb");
    			toggle_class(video, "combo", /*meme*/ ctx[0].combo);
    			add_location(video, file$1, 16, 2, 444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*videoURL*/ 2 && video.src !== (video_src_value = /*videoURL*/ ctx[1])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*meme*/ 1) {
    				toggle_class(video, "combo", /*meme*/ ctx[0].combo);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(15:1) {#if videoURL}",
    		ctx
    	});

    	return block;
    }

    // (24:1) <NextButton href={videoURL} target="_blank">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Save");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(24:1) <NextButton href={videoURL} target=\\\"_blank\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:1) <BackButton icon="home" on:click={ () => dispatch("back") }>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back to Memes");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(28:1) <BackButton icon=\\\"home\\\" on:click={ () => dispatch(\\\"back\\\") }>",
    		ctx
    	});

    	return block;
    }

    // (14:0) <PageTemplate center>
    function create_default_slot(ctx) {
    	let t0;
    	let p;
    	let t1_value = /*meme*/ ctx[0].artist + "";
    	let t1;
    	let t2;
    	let t3_value = /*meme*/ ctx[0].name + "";
    	let t3;
    	let t4;
    	let nextbutton;
    	let t5;
    	let backbutton;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*videoURL*/ ctx[1]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	nextbutton = new NextButton({
    			props: {
    				href: /*videoURL*/ ctx[1],
    				target: "_blank",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	backbutton = new BackButton({
    			props: {
    				icon: "home",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	backbutton.$on("click", /*click_handler*/ ctx[4]);

    	const block = {
    		c: function create() {
    			if_block.c();
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = text(" - ");
    			t3 = text(t3_value);
    			t4 = space();
    			create_component(nextbutton.$$.fragment);
    			t5 = space();
    			create_component(backbutton.$$.fragment);
    			attr_dev(p, "class", "song-name svelte-a4rcgb");
    			add_location(p, file$1, 21, 1, 572);
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			insert_dev(target, t4, anchor);
    			mount_component(nextbutton, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(backbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			}

    			if ((!current || dirty & /*meme*/ 1) && t1_value !== (t1_value = /*meme*/ ctx[0].artist + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*meme*/ 1) && t3_value !== (t3_value = /*meme*/ ctx[0].name + "")) set_data_dev(t3, t3_value);
    			const nextbutton_changes = {};
    			if (dirty & /*videoURL*/ 2) nextbutton_changes.href = /*videoURL*/ ctx[1];

    			if (dirty & /*$$scope*/ 32) {
    				nextbutton_changes.$$scope = { dirty, ctx };
    			}

    			nextbutton.$set(nextbutton_changes);
    			const backbutton_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				backbutton_changes.$$scope = { dirty, ctx };
    			}

    			backbutton.$set(backbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nextbutton.$$.fragment, local);
    			transition_in(backbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nextbutton.$$.fragment, local);
    			transition_out(backbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			destroy_component(nextbutton, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(backbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:0) <PageTemplate center>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let pagetemplate;
    	let current;

    	pagetemplate = new PageTemplate({
    			props: {
    				center: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pagetemplate.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagetemplate, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pagetemplate_changes = {};

    			if (dirty & /*$$scope, videoURL, meme, error*/ 39) {
    				pagetemplate_changes.$$scope = { dirty, ctx };
    			}

    			pagetemplate.$set(pagetemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagetemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagetemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagetemplate, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResultPage", slots, []);
    	
    	let { meme } = $$props;
    	let { videoURL = "" } = $$props;
    	let { error = undefined } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ["meme", "videoURL", "error"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResultPage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("back");

    	$$self.$$set = $$props => {
    		if ("meme" in $$props) $$invalidate(0, meme = $$props.meme);
    		if ("videoURL" in $$props) $$invalidate(1, videoURL = $$props.videoURL);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		PageTemplate,
    		NextButton,
    		BackButton,
    		meme,
    		videoURL,
    		error,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ("meme" in $$props) $$invalidate(0, meme = $$props.meme);
    		if ("videoURL" in $$props) $$invalidate(1, videoURL = $$props.videoURL);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [meme, videoURL, error, dispatch, click_handler];
    }

    class ResultPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { meme: 0, videoURL: 1, error: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResultPage",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*meme*/ ctx[0] === undefined && !("meme" in props)) {
    			console.warn("<ResultPage> was created without expected prop 'meme'");
    		}
    	}

    	get meme() {
    		throw new Error("<ResultPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meme(value) {
    		throw new Error("<ResultPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoURL() {
    		throw new Error("<ResultPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoURL(value) {
    		throw new Error("<ResultPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<ResultPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<ResultPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\App.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src\\client\\components\\App.svelte";

    // (118:28) 
    function create_if_block_3(ctx) {
    	let resultpage;
    	let current;

    	resultpage = new ResultPage({
    			props: {
    				meme: /*meme*/ ctx[3],
    				videoURL: /*videoURL*/ ctx[4],
    				error: /*error*/ ctx[5]
    			},
    			$$inline: true
    		});

    	resultpage.$on("back", /*back_handler_2*/ ctx[17]);

    	const block = {
    		c: function create() {
    			create_component(resultpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(resultpage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const resultpage_changes = {};
    			if (dirty & /*meme*/ 8) resultpage_changes.meme = /*meme*/ ctx[3];
    			if (dirty & /*videoURL*/ 16) resultpage_changes.videoURL = /*videoURL*/ ctx[4];
    			if (dirty & /*error*/ 32) resultpage_changes.error = /*error*/ ctx[5];
    			resultpage.$set(resultpage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(resultpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(resultpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(resultpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(118:28) ",
    		ctx
    	});

    	return block;
    }

    // (109:32) 
    function create_if_block_2(ctx) {
    	let generatingpage;
    	let current;

    	generatingpage = new GeneratingPage({
    			props: {
    				progressMessage: /*progressMessage*/ ctx[6],
    				progressPercent: /*progressPercent*/ ctx[8]
    			},
    			$$inline: true
    		});

    	generatingpage.$on("back", /*back_handler_1*/ ctx[16]);

    	const block = {
    		c: function create() {
    			create_component(generatingpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(generatingpage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const generatingpage_changes = {};
    			if (dirty & /*progressMessage*/ 64) generatingpage_changes.progressMessage = /*progressMessage*/ ctx[6];
    			if (dirty & /*progressPercent*/ 256) generatingpage_changes.progressPercent = /*progressPercent*/ ctx[8];
    			generatingpage.$set(generatingpage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(generatingpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(generatingpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(generatingpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(109:32) ",
    		ctx
    	});

    	return block;
    }

    // (97:33) 
    function create_if_block_1(ctx) {
    	let selectmemepage;
    	let current;

    	selectmemepage = new SelectMemePage({
    			props: { memesLoaded: /*memesLoaded*/ ctx[9] },
    			$$inline: true
    		});

    	selectmemepage.$on("back", /*back_handler*/ ctx[14]);
    	selectmemepage.$on("submit", /*submit_handler_1*/ ctx[15]);

    	const block = {
    		c: function create() {
    			create_component(selectmemepage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectmemepage, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectmemepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectmemepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectmemepage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(97:33) ",
    		ctx
    	});

    	return block;
    }

    // (90:1) {#if page == "upload"}
    function create_if_block(ctx) {
    	let uploadpage;
    	let current;
    	uploadpage = new UploadPage({ $$inline: true });
    	uploadpage.$on("submit", /*submit_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(uploadpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(uploadpage, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uploadpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uploadpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uploadpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(90:1) {#if page == \\\"upload\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let span;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[2] == "upload") return 0;
    		if (/*page*/ ctx[2] == "select-meme") return 1;
    		if (/*page*/ ctx[2] == "generating") return 2;
    		if (/*page*/ ctx[2] == "result") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			span = element("span");
    			span.textContent = "Wombon't";
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "logo header svelte-1iefh40");
    			add_location(span, file, 87, 1, 3192);
    			add_location(main, file, 86, 0, 3160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, span);
    			append_dev(main, t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			/*main_binding*/ ctx[18](main);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*main_binding*/ ctx[18](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const defaultProgressMessage = "Warming up...";

    function instance($$self, $$props, $$invalidate) {
    	let progressPercent;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	

    	// Show errors in an error banner
    	onMount(() => {
    		window.addEventListener("error", event => {
    			if (error.message === "ResizeObserver loop limit exceeded") {
    				return;
    			}

    			console.error(event.error);

    			new ErrorBanner({
    					target: mainElement,
    					props: { text: event.message }
    				});
    		});
    	});

    	let mainElement;
    	let images;
    	let page = "upload";
    	let meme;
    	let videoURL;
    	let error;
    	let progressMessage = defaultProgressMessage;
    	let progressLevel = 0;
    	let maxProgress = 8;
    	let canceled = false;

    	// Load memes.json
    	// ABSTRACTION LEAK: The memes list is stored outside of the component
    	// it's used in to avoid making the component re-request the list every
    	// time it's mounted.
    	const memesLoaded = fetch("../memes.json").then(response => response.json());

    	function submitWombo() {
    		return __awaiter(this, void 0, void 0, function* () {
    			$$invalidate(7, canceled = false);
    			$$invalidate(12, maxProgress = 8);

    			// Send the request to Wombo and go to the processing page.
    			// generateMeme()'s callback will update the progress message in real
    			// time.
    			const videoURLPromise = generateMeme(meme, images, msg => {
    				if (canceled) return;
    				if (msg === "Converting images...") $$invalidate(12, maxProgress = 9);
    				if (msg !== "Pending...") $$invalidate(11, ++progressLevel);
    				$$invalidate(6, progressMessage = msg);
    			});

    			$$invalidate(11, ++progressLevel);

    			// Wait until the video is finished generating.
    			try {
    				$$invalidate(4, videoURL = yield videoURLPromise);
    			} catch(err) {
    				console.error(err);
    				$$invalidate(5, error = err);
    			}

    			if (!canceled) {
    				$$invalidate(11, progressLevel = maxProgress);
    			}

    			// Reset progress for next time.
    			$$invalidate(6, progressMessage = defaultProgressMessage);

    			$$invalidate(11, progressLevel = 0);
    			return !canceled;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const submit_handler = event => {
    		$$invalidate(1, images = event.detail);
    		$$invalidate(2, page = "select-meme");
    	};

    	const back_handler = () => $$invalidate(2, page = "upload");

    	const submit_handler_1 = async event => {
    		$$invalidate(3, meme = event.detail);
    		$$invalidate(2, page = "generating");

    		if (await submitWombo()) {
    			$$invalidate(2, page = "result");
    		}
    	};

    	const back_handler_1 = () => {
    		$$invalidate(2, page = "select-meme");
    		$$invalidate(7, canceled = true);
    	};

    	const back_handler_2 = () => $$invalidate(2, page = "select-meme");

    	function main_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			mainElement = $$value;
    			$$invalidate(0, mainElement);
    		});
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		generateMeme,
    		ErrorBanner,
    		UploadPage,
    		SelectMemePage,
    		GeneratingPage,
    		ResultPage,
    		mainElement,
    		images,
    		page,
    		meme,
    		videoURL,
    		error,
    		defaultProgressMessage,
    		progressMessage,
    		progressLevel,
    		maxProgress,
    		canceled,
    		memesLoaded,
    		submitWombo,
    		progressPercent
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("mainElement" in $$props) $$invalidate(0, mainElement = $$props.mainElement);
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    		if ("page" in $$props) $$invalidate(2, page = $$props.page);
    		if ("meme" in $$props) $$invalidate(3, meme = $$props.meme);
    		if ("videoURL" in $$props) $$invalidate(4, videoURL = $$props.videoURL);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("progressMessage" in $$props) $$invalidate(6, progressMessage = $$props.progressMessage);
    		if ("progressLevel" in $$props) $$invalidate(11, progressLevel = $$props.progressLevel);
    		if ("maxProgress" in $$props) $$invalidate(12, maxProgress = $$props.maxProgress);
    		if ("canceled" in $$props) $$invalidate(7, canceled = $$props.canceled);
    		if ("progressPercent" in $$props) $$invalidate(8, progressPercent = $$props.progressPercent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*progressLevel, maxProgress*/ 6144) {
    			$$invalidate(8, progressPercent = 100 * progressLevel / maxProgress);
    		}
    	};

    	return [
    		mainElement,
    		images,
    		page,
    		meme,
    		videoURL,
    		error,
    		progressMessage,
    		canceled,
    		progressPercent,
    		memesLoaded,
    		submitWombo,
    		progressLevel,
    		maxProgress,
    		submit_handler,
    		back_handler,
    		submit_handler_1,
    		back_handler_1,
    		back_handler_2,
    		main_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // @ts-ignore -- IDE is complaining it can't find the file; runs just fine 🤷‍♂️
    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
