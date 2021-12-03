
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.4' }, detail), true));
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

    /* src/routes/Gallery.svelte generated by Svelte v3.42.4 */

    const file$e = "src/routes/Gallery.svelte";

    function create_fragment$h(ctx) {
    	let section;
    	let div10;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let div9;
    	let div4;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let div8;
    	let div5;
    	let img3;
    	let img3_src_value;
    	let t7;
    	let div6;
    	let img4;
    	let img4_src_value;
    	let t8;
    	let div7;
    	let img5;
    	let img5_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div10 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Master Cleanse Reliac Heirloom";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical gentrify, subway tile poke farm-to-table. Franzen you probably haven't heard of them man bun deep jianbing selfies heirloom.";
    			t3 = space();
    			div9 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t4 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t5 = space();
    			div3 = element("div");
    			img2 = element("img");
    			t6 = space();
    			div8 = element("div");
    			div5 = element("div");
    			img3 = element("img");
    			t7 = space();
    			div6 = element("div");
    			img4 = element("img");
    			t8 = space();
    			div7 = element("div");
    			img5 = element("img");
    			attr_dev(h1, "class", "sm:text-3xl text-2xl font-medium title-font text-gray-900 lg:w-1/3 lg:mb-0 mb-4");
    			add_location(h1, file$e, 3, 8, 163);
    			attr_dev(p, "class", "lg:pl-6 lg:w-2/3 mx-auto leading-relaxed text-base");
    			add_location(p, file$e, 4, 8, 300);
    			attr_dev(div0, "class", "flex w-full mb-20 flex-wrap");
    			add_location(div0, file$e, 2, 6, 112);
    			attr_dev(img0, "alt", "gallery");
    			attr_dev(img0, "class", "w-full object-cover h-full object-center block");
    			if (!src_url_equal(img0.src, img0_src_value = "https://dummyimage.com/500x300")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$e, 9, 12, 717);
    			attr_dev(div1, "class", "md:p-2 p-1 w-1/2");
    			add_location(div1, file$e, 8, 10, 673);
    			attr_dev(img1, "alt", "gallery");
    			attr_dev(img1, "class", "w-full object-cover h-full object-center block");
    			if (!src_url_equal(img1.src, img1_src_value = "https://dummyimage.com/501x301")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$e, 12, 12, 902);
    			attr_dev(div2, "class", "md:p-2 p-1 w-1/2");
    			add_location(div2, file$e, 11, 10, 858);
    			attr_dev(img2, "alt", "gallery");
    			attr_dev(img2, "class", "w-full h-full object-cover object-center block");
    			if (!src_url_equal(img2.src, img2_src_value = "https://dummyimage.com/600x360")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$e, 15, 12, 1088);
    			attr_dev(div3, "class", "md:p-2 p-1 w-full");
    			add_location(div3, file$e, 14, 10, 1043);
    			attr_dev(div4, "class", "flex flex-wrap w-1/2");
    			add_location(div4, file$e, 7, 8, 627);
    			attr_dev(img3, "alt", "gallery");
    			attr_dev(img3, "class", "w-full h-full object-cover object-center block");
    			if (!src_url_equal(img3.src, img3_src_value = "https://dummyimage.com/601x361")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$e, 20, 12, 1334);
    			attr_dev(div5, "class", "md:p-2 p-1 w-full");
    			add_location(div5, file$e, 19, 10, 1289);
    			attr_dev(img4, "alt", "gallery");
    			attr_dev(img4, "class", "w-full object-cover h-full object-center block");
    			if (!src_url_equal(img4.src, img4_src_value = "https://dummyimage.com/502x302")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$e, 23, 12, 1519);
    			attr_dev(div6, "class", "md:p-2 p-1 w-1/2");
    			add_location(div6, file$e, 22, 10, 1475);
    			attr_dev(img5, "alt", "gallery");
    			attr_dev(img5, "class", "w-full object-cover h-full object-center block");
    			if (!src_url_equal(img5.src, img5_src_value = "https://dummyimage.com/503x303")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$e, 26, 12, 1704);
    			attr_dev(div7, "class", "md:p-2 p-1 w-1/2");
    			add_location(div7, file$e, 25, 10, 1660);
    			attr_dev(div8, "class", "flex flex-wrap w-1/2");
    			add_location(div8, file$e, 18, 8, 1243);
    			attr_dev(div9, "class", "flex flex-wrap md:-m-2 -m-1");
    			add_location(div9, file$e, 6, 6, 576);
    			attr_dev(div10, "class", "container px-5 py-24 mx-auto flex flex-wrap");
    			add_location(div10, file$e, 1, 4, 47);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div10);
    			append_dev(div10, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div10, t3);
    			append_dev(div10, div9);
    			append_dev(div9, div4);
    			append_dev(div4, div1);
    			append_dev(div1, img0);
    			append_dev(div4, t4);
    			append_dev(div4, div2);
    			append_dev(div2, img1);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, img2);
    			append_dev(div9, t6);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, img3);
    			append_dev(div8, t7);
    			append_dev(div8, div6);
    			append_dev(div6, img4);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, img5);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Gallery', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.42.4 */

    const { Error: Error_1, Object: Object_1, console: console_1$8 } = globals;

    // (251:0) {:else}
    function create_else_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location$1 = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$8.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location: location$1,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.42.4 */

    const file$d = "src/routes/Home.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Witaj na stronie z zadaniami z zajęć Aplikacje Internetowe";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Nic tu nie znajdziesz :D";
    			attr_dev(p0, "class", "text-4xl text-yellow-400 text-center mt-40");
    			add_location(p0, file$d, 1, 4, 58);
    			attr_dev(p1, "class", "text-sm text-center text-gray-300");
    			add_location(p1, file$d, 2, 4, 180);
    			attr_dev(div, "class", "flex items-center w-full flex-col h-1/2");
    			add_location(div, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/routes/NotFound.svelte generated by Svelte v3.42.4 */

    const file$c = "src/routes/NotFound.svelte";

    function create_fragment$e(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "404";
    			add_location(h1, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/Tailwindcss.svelte generated by Svelte v3.42.4 */

    function create_fragment$d(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tailwindcss', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tailwindcss> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tailwindcss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwindcss",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/header.svelte generated by Svelte v3.42.4 */

    const file$b = "src/components/header.svelte";

    function create_fragment$c(ctx) {
    	let header;
    	let div;
    	let a0;
    	let svg;
    	let path;
    	let t0;
    	let span;
    	let t2;
    	let nav;
    	let a1;
    	let t4;
    	let a2;
    	let t6;
    	let a3;
    	let t8;
    	let a4;
    	let t10;
    	let a5;
    	let t12;
    	let a6;
    	let t14;
    	let a7;
    	let t16;
    	let a8;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			a0 = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Aplikacje Internetowe";
    			t2 = space();
    			nav = element("nav");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t4 = space();
    			a2 = element("a");
    			a2.textContent = "Cars";
    			t6 = space();
    			a3 = element("a");
    			a3.textContent = "Country";
    			t8 = space();
    			a4 = element("a");
    			a4.textContent = "Quiz";
    			t10 = space();
    			a5 = element("a");
    			a5.textContent = "TTT";
    			t12 = space();
    			a6 = element("a");
    			a6.textContent = "Sudoku";
    			t14 = space();
    			a7 = element("a");
    			a7.textContent = "Sudoku 2.0";
    			t16 = space();
    			a8 = element("a");
    			a8.textContent = "Jolka";
    			attr_dev(path, "d", "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5");
    			add_location(path, file$b, 5, 10, 470);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "class", "w-10 h-10 text-white p-2 bg-yellow-500 rounded-full");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$b, 4, 8, 240);
    			attr_dev(span, "class", "ml-3 text-xl");
    			add_location(span, file$b, 7, 8, 569);
    			attr_dev(a0, "class", "flex title-font font-medium items-center text-white mb-4 md:mb-0");
    			add_location(a0, file$b, 3, 6, 154);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "mr-5 hover:text-white hover:no-underline");
    			add_location(a1, file$b, 10, 8, 786);
    			attr_dev(a2, "href", "/#/Cars");
    			attr_dev(a2, "class", "mr-5 hover:text-white hover:no-underline");
    			add_location(a2, file$b, 11, 8, 866);
    			attr_dev(a3, "href", "/#/Country");
    			attr_dev(a3, "class", "mr-5 hover:text-white hover:no-underline");
    			add_location(a3, file$b, 12, 8, 952);
    			attr_dev(a4, "href", "/#/Quiz");
    			attr_dev(a4, "class", "mr-5 hover:text-white hover:no-underline");
    			add_location(a4, file$b, 13, 8, 1044);
    			attr_dev(a5, "href", "/#/TicTacToe");
    			attr_dev(a5, "class", "mr-5 hover:text-white hover:no-underline");
    			add_location(a5, file$b, 14, 8, 1130);
    			attr_dev(a6, "href", "/#/sudoku");
    			attr_dev(a6, "class", "mr-5 hover:text-white hover:no-underline");
    			add_location(a6, file$b, 15, 8, 1220);
    			attr_dev(a7, "href", "/#/sudoku2");
    			attr_dev(a7, "class", "mr-5 hover:text-white hover:no-underline");
    			add_location(a7, file$b, 16, 8, 1310);
    			attr_dev(a8, "href", "/#/jolka");
    			attr_dev(a8, "class", "mr-5 hover:text-white hover:no-underline");
    			add_location(a8, file$b, 17, 8, 1405);
    			attr_dev(nav, "class", "md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-700 flex flex-wrap items-center text-base justify-center");
    			add_location(nav, file$b, 9, 6, 644);
    			attr_dev(div, "class", "container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center");
    			add_location(div, file$b, 2, 4, 62);
    			attr_dev(header, "class", "text-gray-400 bg-gray-900 body-font");
    			add_location(header, file$b, 1, 2, 4);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);
    			append_dev(div, a0);
    			append_dev(a0, svg);
    			append_dev(svg, path);
    			append_dev(a0, t0);
    			append_dev(a0, span);
    			append_dev(div, t2);
    			append_dev(div, nav);
    			append_dev(nav, a1);
    			append_dev(nav, t4);
    			append_dev(nav, a2);
    			append_dev(nav, t6);
    			append_dev(nav, a3);
    			append_dev(nav, t8);
    			append_dev(nav, a4);
    			append_dev(nav, t10);
    			append_dev(nav, a5);
    			append_dev(nav, t12);
    			append_dev(nav, a6);
    			append_dev(nav, t14);
    			append_dev(nav, a7);
    			append_dev(nav, t16);
    			append_dev(nav, a8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/footer.svelte generated by Svelte v3.42.4 */

    const file$a = "src/components/footer.svelte";

    function create_fragment$b(ctx) {
    	let footer;
    	let div;
    	let a0;
    	let svg0;
    	let path0;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let a1;
    	let svg1;
    	let path1;
    	let t3;
    	let a2;
    	let svg2;
    	let path2;
    	let t4;
    	let a3;
    	let svg3;
    	let rect;
    	let path3;
    	let t5;
    	let a4;
    	let svg4;
    	let path4;
    	let circle;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Aplikacje Internetowe";
    			t2 = space();
    			span1 = element("span");
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t3 = space();
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t4 = space();
    			a3 = element("a");
    			svg3 = svg_element("svg");
    			rect = svg_element("rect");
    			path3 = svg_element("path");
    			t5 = space();
    			a4 = element("a");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			circle = svg_element("circle");
    			attr_dev(path0, "d", "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5");
    			add_location(path0, file$a, 4, 8, 473);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "class", "w-10 h-10 text-white p-2 bg-yellow-500 rounded-full");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$a, 3, 6, 245);
    			attr_dev(span0, "class", "ml-3 text-xl");
    			add_location(span0, file$a, 6, 6, 568);
    			attr_dev(a0, "class", "flex title-font font-medium items-center md:justify-start justify-center text-white");
    			add_location(a0, file$a, 2, 4, 142);
    			attr_dev(path1, "d", "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z");
    			add_location(path1, file$a, 12, 10, 907);
    			attr_dev(svg1, "fill", "currentColor");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "class", "w-5 h-5");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$a, 11, 8, 770);
    			attr_dev(a1, "class", "text-gray-400");
    			add_location(a1, file$a, 10, 6, 735);
    			attr_dev(path2, "d", "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z");
    			add_location(path2, file$a, 17, 10, 1200);
    			attr_dev(svg2, "fill", "currentColor");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "class", "w-5 h-5");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$a, 16, 8, 1063);
    			attr_dev(a2, "class", "ml-3 text-gray-400");
    			add_location(a2, file$a, 15, 6, 1023);
    			attr_dev(rect, "width", "20");
    			attr_dev(rect, "height", "20");
    			attr_dev(rect, "x", "2");
    			attr_dev(rect, "y", "2");
    			attr_dev(rect, "rx", "5");
    			attr_dev(rect, "ry", "5");
    			add_location(rect, file$a, 22, 10, 1608);
    			attr_dev(path3, "d", "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01");
    			add_location(path3, file$a, 23, 10, 1682);
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			attr_dev(svg3, "stroke-width", "2");
    			attr_dev(svg3, "class", "w-5 h-5");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			add_location(svg3, file$a, 21, 8, 1457);
    			attr_dev(a3, "class", "ml-3 text-gray-400");
    			add_location(a3, file$a, 20, 6, 1417);
    			attr_dev(path4, "stroke", "none");
    			attr_dev(path4, "d", "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z");
    			add_location(path4, file$a, 28, 10, 1991);
    			attr_dev(circle, "cx", "4");
    			attr_dev(circle, "cy", "4");
    			attr_dev(circle, "r", "2");
    			attr_dev(circle, "stroke", "none");
    			add_location(circle, file$a, 29, 10, 2119);
    			attr_dev(svg4, "fill", "currentColor");
    			attr_dev(svg4, "stroke", "currentColor");
    			attr_dev(svg4, "stroke-linecap", "round");
    			attr_dev(svg4, "stroke-linejoin", "round");
    			attr_dev(svg4, "stroke-width", "0");
    			attr_dev(svg4, "class", "w-5 h-5");
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			add_location(svg4, file$a, 27, 8, 1832);
    			attr_dev(a4, "class", "ml-3 text-gray-400");
    			add_location(a4, file$a, 26, 6, 1792);
    			attr_dev(span1, "class", "inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start");
    			add_location(span1, file$a, 9, 4, 645);
    			attr_dev(div, "class", "container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col");
    			add_location(div, file$a, 1, 2, 56);
    			attr_dev(footer, "class", "text-gray-400 bg-gray-900 body-font");
    			add_location(footer, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(a0, t0);
    			append_dev(a0, span0);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path1);
    			append_dev(span1, t3);
    			append_dev(span1, a2);
    			append_dev(a2, svg2);
    			append_dev(svg2, path2);
    			append_dev(span1, t4);
    			append_dev(span1, a3);
    			append_dev(a3, svg3);
    			append_dev(svg3, rect);
    			append_dev(svg3, path3);
    			append_dev(span1, t5);
    			append_dev(span1, a4);
    			append_dev(a4, svg4);
    			append_dev(svg4, path4);
    			append_dev(svg4, circle);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
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

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/routes/Shop.svelte generated by Svelte v3.42.4 */

    const file$9 = "src/routes/Shop.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let div11;
    	let div1;
    	let h10;
    	let t1;
    	let p0;
    	let t3;
    	let div0;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let div10;
    	let div3;
    	let div2;
    	let h20;
    	let t9;
    	let h11;
    	let t11;
    	let p1;
    	let span0;
    	let svg0;
    	let path0;
    	let t12;
    	let t13;
    	let t14;
    	let p2;
    	let span1;
    	let svg1;
    	let path1;
    	let t15;
    	let t16;
    	let t17;
    	let p3;
    	let span2;
    	let svg2;
    	let path2;
    	let t18;
    	let t19;
    	let t20;
    	let button2;
    	let t21;
    	let svg3;
    	let path3;
    	let t22;
    	let p4;
    	let t24;
    	let div5;
    	let div4;
    	let span3;
    	let t26;
    	let h21;
    	let t28;
    	let h12;
    	let span4;
    	let t30;
    	let span5;
    	let t32;
    	let p5;
    	let span6;
    	let svg4;
    	let path4;
    	let t33;
    	let t34;
    	let t35;
    	let p6;
    	let span7;
    	let svg5;
    	let path5;
    	let t36;
    	let t37;
    	let t38;
    	let p7;
    	let span8;
    	let svg6;
    	let path6;
    	let t39;
    	let t40;
    	let t41;
    	let p8;
    	let span9;
    	let svg7;
    	let path7;
    	let t42;
    	let t43;
    	let t44;
    	let button3;
    	let t45;
    	let svg8;
    	let path8;
    	let t46;
    	let p9;
    	let t48;
    	let div7;
    	let div6;
    	let h22;
    	let t50;
    	let h13;
    	let span10;
    	let t52;
    	let span11;
    	let t54;
    	let p10;
    	let span12;
    	let svg9;
    	let path9;
    	let t55;
    	let t56;
    	let t57;
    	let p11;
    	let span13;
    	let svg10;
    	let path10;
    	let t58;
    	let t59;
    	let t60;
    	let p12;
    	let span14;
    	let svg11;
    	let path11;
    	let t61;
    	let t62;
    	let t63;
    	let p13;
    	let span15;
    	let svg12;
    	let path12;
    	let t64;
    	let t65;
    	let t66;
    	let p14;
    	let span16;
    	let svg13;
    	let path13;
    	let t67;
    	let t68;
    	let t69;
    	let button4;
    	let t70;
    	let svg14;
    	let path14;
    	let t71;
    	let p15;
    	let t73;
    	let div9;
    	let div8;
    	let h23;
    	let t75;
    	let h14;
    	let span17;
    	let t77;
    	let span18;
    	let t79;
    	let p16;
    	let span19;
    	let svg15;
    	let path15;
    	let t80;
    	let t81;
    	let t82;
    	let p17;
    	let span20;
    	let svg16;
    	let path16;
    	let t83;
    	let t84;
    	let t85;
    	let p18;
    	let span21;
    	let svg17;
    	let path17;
    	let t86;
    	let t87;
    	let t88;
    	let p19;
    	let span22;
    	let svg18;
    	let path18;
    	let t89;
    	let t90;
    	let t91;
    	let p20;
    	let span23;
    	let svg19;
    	let path19;
    	let t92;
    	let t93;
    	let t94;
    	let button5;
    	let t95;
    	let svg20;
    	let path20;
    	let t96;
    	let p21;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div11 = element("div");
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Pricing";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical.";
    			t3 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Monthly";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Annually";
    			t7 = space();
    			div10 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "START";
    			t9 = space();
    			h11 = element("h1");
    			h11.textContent = "Free";
    			t11 = space();
    			p1 = element("p");
    			span0 = element("span");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t12 = space();
    			t13 = text("Vexillologist pitchfork");
    			t14 = space();
    			p2 = element("p");
    			span1 = element("span");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t15 = space();
    			t16 = text("Tumeric plaid portland");
    			t17 = space();
    			p3 = element("p");
    			span2 = element("span");
    			svg2 = svg_element("svg");
    			path2 = svg_element("path");
    			t18 = space();
    			t19 = text("Mixtape chillwave tumeric");
    			t20 = space();
    			button2 = element("button");
    			t21 = text("Button\r\n              ");
    			svg3 = svg_element("svg");
    			path3 = svg_element("path");
    			t22 = space();
    			p4 = element("p");
    			p4.textContent = "Literally you probably haven't heard of them jean shorts.";
    			t24 = space();
    			div5 = element("div");
    			div4 = element("div");
    			span3 = element("span");
    			span3.textContent = "POPULAR";
    			t26 = space();
    			h21 = element("h2");
    			h21.textContent = "PRO";
    			t28 = space();
    			h12 = element("h1");
    			span4 = element("span");
    			span4.textContent = "$38";
    			t30 = space();
    			span5 = element("span");
    			span5.textContent = "/mo";
    			t32 = space();
    			p5 = element("p");
    			span6 = element("span");
    			svg4 = svg_element("svg");
    			path4 = svg_element("path");
    			t33 = space();
    			t34 = text("Vexillologist pitchfork");
    			t35 = space();
    			p6 = element("p");
    			span7 = element("span");
    			svg5 = svg_element("svg");
    			path5 = svg_element("path");
    			t36 = space();
    			t37 = text("Tumeric plaid portland");
    			t38 = space();
    			p7 = element("p");
    			span8 = element("span");
    			svg6 = svg_element("svg");
    			path6 = svg_element("path");
    			t39 = space();
    			t40 = text("Hexagon neutra unicorn");
    			t41 = space();
    			p8 = element("p");
    			span9 = element("span");
    			svg7 = svg_element("svg");
    			path7 = svg_element("path");
    			t42 = space();
    			t43 = text("Mixtape chillwave tumeric");
    			t44 = space();
    			button3 = element("button");
    			t45 = text("Button\r\n              ");
    			svg8 = svg_element("svg");
    			path8 = svg_element("path");
    			t46 = space();
    			p9 = element("p");
    			p9.textContent = "Literally you probably haven't heard of them jean shorts.";
    			t48 = space();
    			div7 = element("div");
    			div6 = element("div");
    			h22 = element("h2");
    			h22.textContent = "BUSINESS";
    			t50 = space();
    			h13 = element("h1");
    			span10 = element("span");
    			span10.textContent = "$56";
    			t52 = space();
    			span11 = element("span");
    			span11.textContent = "/mo";
    			t54 = space();
    			p10 = element("p");
    			span12 = element("span");
    			svg9 = svg_element("svg");
    			path9 = svg_element("path");
    			t55 = space();
    			t56 = text("Vexillologist pitchfork");
    			t57 = space();
    			p11 = element("p");
    			span13 = element("span");
    			svg10 = svg_element("svg");
    			path10 = svg_element("path");
    			t58 = space();
    			t59 = text("Tumeric plaid portland");
    			t60 = space();
    			p12 = element("p");
    			span14 = element("span");
    			svg11 = svg_element("svg");
    			path11 = svg_element("path");
    			t61 = space();
    			t62 = text("Hexagon neutra unicorn");
    			t63 = space();
    			p13 = element("p");
    			span15 = element("span");
    			svg12 = svg_element("svg");
    			path12 = svg_element("path");
    			t64 = space();
    			t65 = text("Vexillologist pitchfork");
    			t66 = space();
    			p14 = element("p");
    			span16 = element("span");
    			svg13 = svg_element("svg");
    			path13 = svg_element("path");
    			t67 = space();
    			t68 = text("Mixtape chillwave tumeric");
    			t69 = space();
    			button4 = element("button");
    			t70 = text("Button\r\n              ");
    			svg14 = svg_element("svg");
    			path14 = svg_element("path");
    			t71 = space();
    			p15 = element("p");
    			p15.textContent = "Literally you probably haven't heard of them jean shorts.";
    			t73 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h23 = element("h2");
    			h23.textContent = "SPECIAL";
    			t75 = space();
    			h14 = element("h1");
    			span17 = element("span");
    			span17.textContent = "$72";
    			t77 = space();
    			span18 = element("span");
    			span18.textContent = "/mo";
    			t79 = space();
    			p16 = element("p");
    			span19 = element("span");
    			svg15 = svg_element("svg");
    			path15 = svg_element("path");
    			t80 = space();
    			t81 = text("Vexillologist pitchfork");
    			t82 = space();
    			p17 = element("p");
    			span20 = element("span");
    			svg16 = svg_element("svg");
    			path16 = svg_element("path");
    			t83 = space();
    			t84 = text("Tumeric plaid portland");
    			t85 = space();
    			p18 = element("p");
    			span21 = element("span");
    			svg17 = svg_element("svg");
    			path17 = svg_element("path");
    			t86 = space();
    			t87 = text("Hexagon neutra unicorn");
    			t88 = space();
    			p19 = element("p");
    			span22 = element("span");
    			svg18 = svg_element("svg");
    			path18 = svg_element("path");
    			t89 = space();
    			t90 = text("Vexillologist pitchfork");
    			t91 = space();
    			p20 = element("p");
    			span23 = element("span");
    			svg19 = svg_element("svg");
    			path19 = svg_element("path");
    			t92 = space();
    			t93 = text("Mixtape chillwave tumeric");
    			t94 = space();
    			button5 = element("button");
    			t95 = text("Button\r\n              ");
    			svg20 = svg_element("svg");
    			path20 = svg_element("path");
    			t96 = space();
    			p21 = element("p");
    			p21.textContent = "Literally you probably haven't heard of them jean shorts.";
    			attr_dev(h10, "class", "sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900");
    			add_location(h10, file$9, 3, 8, 175);
    			attr_dev(p0, "class", "lg:w-2/3 mx-auto leading-relaxed text-base text-gray-500");
    			add_location(p0, file$9, 4, 8, 272);
    			attr_dev(button0, "class", "py-1 px-4 bg-indigo-500 text-white focus:outline-none");
    			add_location(button0, file$9, 6, 10, 512);
    			attr_dev(button1, "class", "py-1 px-4 focus:outline-none");
    			add_location(button1, file$9, 7, 10, 610);
    			attr_dev(div0, "class", "flex mx-auto border-2 border-indigo-500 rounded overflow-hidden mt-6");
    			add_location(div0, file$9, 5, 8, 418);
    			attr_dev(div1, "class", "flex flex-col text-center w-full mb-20");
    			add_location(div1, file$9, 2, 6, 113);
    			attr_dev(h20, "class", "text-sm tracking-widest title-font mb-1 font-medium");
    			add_location(h20, file$9, 13, 12, 920);
    			attr_dev(h11, "class", "text-5xl text-gray-900 pb-4 mb-4 border-b border-gray-200 leading-none");
    			add_location(h11, file$9, 14, 12, 1008);
    			attr_dev(path0, "d", "M20 6L9 17l-5-5");
    			add_location(path0, file$9, 18, 18, 1474);
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "stroke-width", "2.5");
    			attr_dev(svg0, "class", "w-3 h-3");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file$9, 17, 16, 1313);
    			attr_dev(span0, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span0, file$9, 16, 14, 1178);
    			attr_dev(p1, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p1, file$9, 15, 12, 1114);
    			attr_dev(path1, "d", "M20 6L9 17l-5-5");
    			add_location(path1, file$9, 25, 18, 1969);
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "stroke-width", "2.5");
    			attr_dev(svg1, "class", "w-3 h-3");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$9, 24, 16, 1808);
    			attr_dev(span1, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span1, file$9, 23, 14, 1673);
    			attr_dev(p2, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p2, file$9, 22, 12, 1609);
    			attr_dev(path2, "d", "M20 6L9 17l-5-5");
    			add_location(path2, file$9, 32, 18, 2463);
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "stroke-width", "2.5");
    			attr_dev(svg2, "class", "w-3 h-3");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$9, 31, 16, 2302);
    			attr_dev(span2, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span2, file$9, 30, 14, 2167);
    			attr_dev(p3, "class", "flex items-center text-gray-600 mb-6");
    			add_location(p3, file$9, 29, 12, 2103);
    			attr_dev(path3, "d", "M5 12h14M12 5l7 7-7 7");
    			add_location(path3, file$9, 38, 16, 2923);
    			attr_dev(svg3, "fill", "none");
    			attr_dev(svg3, "stroke", "currentColor");
    			attr_dev(svg3, "stroke-linecap", "round");
    			attr_dev(svg3, "stroke-linejoin", "round");
    			attr_dev(svg3, "stroke-width", "2");
    			attr_dev(svg3, "class", "w-4 h-4 ml-auto");
    			attr_dev(svg3, "viewBox", "0 0 24 24");
    			add_location(svg3, file$9, 37, 14, 2758);
    			attr_dev(button2, "class", "flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded");
    			add_location(button2, file$9, 36, 12, 2600);
    			attr_dev(p4, "class", "text-xs text-gray-500 mt-3");
    			add_location(p4, file$9, 41, 12, 3021);
    			attr_dev(div2, "class", "h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden");
    			add_location(div2, file$9, 12, 10, 807);
    			attr_dev(div3, "class", "p-4 xl:w-1/4 md:w-1/2 w-full");
    			add_location(div3, file$9, 11, 8, 753);
    			attr_dev(span3, "class", "bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl");
    			add_location(span3, file$9, 46, 12, 3333);
    			attr_dev(h21, "class", "text-sm tracking-widest title-font mb-1 font-medium");
    			add_location(h21, file$9, 47, 12, 3468);
    			add_location(span4, file$9, 49, 14, 3671);
    			attr_dev(span5, "class", "text-lg ml-1 font-normal text-gray-500");
    			add_location(span5, file$9, 50, 14, 3703);
    			attr_dev(h12, "class", "text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200");
    			add_location(h12, file$9, 48, 12, 3554);
    			attr_dev(path4, "d", "M20 6L9 17l-5-5");
    			add_location(path4, file$9, 55, 18, 4159);
    			attr_dev(svg4, "fill", "none");
    			attr_dev(svg4, "stroke", "currentColor");
    			attr_dev(svg4, "stroke-linecap", "round");
    			attr_dev(svg4, "stroke-linejoin", "round");
    			attr_dev(svg4, "stroke-width", "2.5");
    			attr_dev(svg4, "class", "w-3 h-3");
    			attr_dev(svg4, "viewBox", "0 0 24 24");
    			add_location(svg4, file$9, 54, 16, 3998);
    			attr_dev(span6, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span6, file$9, 53, 14, 3863);
    			attr_dev(p5, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p5, file$9, 52, 12, 3799);
    			attr_dev(path5, "d", "M20 6L9 17l-5-5");
    			add_location(path5, file$9, 62, 18, 4654);
    			attr_dev(svg5, "fill", "none");
    			attr_dev(svg5, "stroke", "currentColor");
    			attr_dev(svg5, "stroke-linecap", "round");
    			attr_dev(svg5, "stroke-linejoin", "round");
    			attr_dev(svg5, "stroke-width", "2.5");
    			attr_dev(svg5, "class", "w-3 h-3");
    			attr_dev(svg5, "viewBox", "0 0 24 24");
    			add_location(svg5, file$9, 61, 16, 4493);
    			attr_dev(span7, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span7, file$9, 60, 14, 4358);
    			attr_dev(p6, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p6, file$9, 59, 12, 4294);
    			attr_dev(path6, "d", "M20 6L9 17l-5-5");
    			add_location(path6, file$9, 69, 18, 5148);
    			attr_dev(svg6, "fill", "none");
    			attr_dev(svg6, "stroke", "currentColor");
    			attr_dev(svg6, "stroke-linecap", "round");
    			attr_dev(svg6, "stroke-linejoin", "round");
    			attr_dev(svg6, "stroke-width", "2.5");
    			attr_dev(svg6, "class", "w-3 h-3");
    			attr_dev(svg6, "viewBox", "0 0 24 24");
    			add_location(svg6, file$9, 68, 16, 4987);
    			attr_dev(span8, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span8, file$9, 67, 14, 4852);
    			attr_dev(p7, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p7, file$9, 66, 12, 4788);
    			attr_dev(path7, "d", "M20 6L9 17l-5-5");
    			add_location(path7, file$9, 76, 18, 5642);
    			attr_dev(svg7, "fill", "none");
    			attr_dev(svg7, "stroke", "currentColor");
    			attr_dev(svg7, "stroke-linecap", "round");
    			attr_dev(svg7, "stroke-linejoin", "round");
    			attr_dev(svg7, "stroke-width", "2.5");
    			attr_dev(svg7, "class", "w-3 h-3");
    			attr_dev(svg7, "viewBox", "0 0 24 24");
    			add_location(svg7, file$9, 75, 16, 5481);
    			attr_dev(span9, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span9, file$9, 74, 14, 5346);
    			attr_dev(p8, "class", "flex items-center text-gray-600 mb-6");
    			add_location(p8, file$9, 73, 12, 5282);
    			attr_dev(path8, "d", "M5 12h14M12 5l7 7-7 7");
    			add_location(path8, file$9, 82, 16, 6106);
    			attr_dev(svg8, "fill", "none");
    			attr_dev(svg8, "stroke", "currentColor");
    			attr_dev(svg8, "stroke-linecap", "round");
    			attr_dev(svg8, "stroke-linejoin", "round");
    			attr_dev(svg8, "stroke-width", "2");
    			attr_dev(svg8, "class", "w-4 h-4 ml-auto");
    			attr_dev(svg8, "viewBox", "0 0 24 24");
    			add_location(svg8, file$9, 81, 14, 5941);
    			attr_dev(button3, "class", "flex items-center mt-auto text-white bg-indigo-500 border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded");
    			add_location(button3, file$9, 80, 12, 5779);
    			attr_dev(p9, "class", "text-xs text-gray-500 mt-3");
    			add_location(p9, file$9, 85, 12, 6204);
    			attr_dev(div4, "class", "h-full p-6 rounded-lg border-2 border-indigo-500 flex flex-col relative overflow-hidden");
    			add_location(div4, file$9, 45, 10, 3218);
    			attr_dev(div5, "class", "p-4 xl:w-1/4 md:w-1/2 w-full");
    			add_location(div5, file$9, 44, 8, 3164);
    			attr_dev(h22, "class", "text-sm tracking-widest title-font mb-1 font-medium");
    			add_location(h22, file$9, 90, 12, 6514);
    			add_location(span10, file$9, 92, 14, 6722);
    			attr_dev(span11, "class", "text-lg ml-1 font-normal text-gray-500");
    			add_location(span11, file$9, 93, 14, 6754);
    			attr_dev(h13, "class", "text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200");
    			add_location(h13, file$9, 91, 12, 6605);
    			attr_dev(path9, "d", "M20 6L9 17l-5-5");
    			add_location(path9, file$9, 98, 18, 7210);
    			attr_dev(svg9, "fill", "none");
    			attr_dev(svg9, "stroke", "currentColor");
    			attr_dev(svg9, "stroke-linecap", "round");
    			attr_dev(svg9, "stroke-linejoin", "round");
    			attr_dev(svg9, "stroke-width", "2.5");
    			attr_dev(svg9, "class", "w-3 h-3");
    			attr_dev(svg9, "viewBox", "0 0 24 24");
    			add_location(svg9, file$9, 97, 16, 7049);
    			attr_dev(span12, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span12, file$9, 96, 14, 6914);
    			attr_dev(p10, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p10, file$9, 95, 12, 6850);
    			attr_dev(path10, "d", "M20 6L9 17l-5-5");
    			add_location(path10, file$9, 105, 18, 7705);
    			attr_dev(svg10, "fill", "none");
    			attr_dev(svg10, "stroke", "currentColor");
    			attr_dev(svg10, "stroke-linecap", "round");
    			attr_dev(svg10, "stroke-linejoin", "round");
    			attr_dev(svg10, "stroke-width", "2.5");
    			attr_dev(svg10, "class", "w-3 h-3");
    			attr_dev(svg10, "viewBox", "0 0 24 24");
    			add_location(svg10, file$9, 104, 16, 7544);
    			attr_dev(span13, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span13, file$9, 103, 14, 7409);
    			attr_dev(p11, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p11, file$9, 102, 12, 7345);
    			attr_dev(path11, "d", "M20 6L9 17l-5-5");
    			add_location(path11, file$9, 112, 18, 8199);
    			attr_dev(svg11, "fill", "none");
    			attr_dev(svg11, "stroke", "currentColor");
    			attr_dev(svg11, "stroke-linecap", "round");
    			attr_dev(svg11, "stroke-linejoin", "round");
    			attr_dev(svg11, "stroke-width", "2.5");
    			attr_dev(svg11, "class", "w-3 h-3");
    			attr_dev(svg11, "viewBox", "0 0 24 24");
    			add_location(svg11, file$9, 111, 16, 8038);
    			attr_dev(span14, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span14, file$9, 110, 14, 7903);
    			attr_dev(p12, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p12, file$9, 109, 12, 7839);
    			attr_dev(path12, "d", "M20 6L9 17l-5-5");
    			add_location(path12, file$9, 119, 18, 8693);
    			attr_dev(svg12, "fill", "none");
    			attr_dev(svg12, "stroke", "currentColor");
    			attr_dev(svg12, "stroke-linecap", "round");
    			attr_dev(svg12, "stroke-linejoin", "round");
    			attr_dev(svg12, "stroke-width", "2.5");
    			attr_dev(svg12, "class", "w-3 h-3");
    			attr_dev(svg12, "viewBox", "0 0 24 24");
    			add_location(svg12, file$9, 118, 16, 8532);
    			attr_dev(span15, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span15, file$9, 117, 14, 8397);
    			attr_dev(p13, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p13, file$9, 116, 12, 8333);
    			attr_dev(path13, "d", "M20 6L9 17l-5-5");
    			add_location(path13, file$9, 126, 18, 9188);
    			attr_dev(svg13, "fill", "none");
    			attr_dev(svg13, "stroke", "currentColor");
    			attr_dev(svg13, "stroke-linecap", "round");
    			attr_dev(svg13, "stroke-linejoin", "round");
    			attr_dev(svg13, "stroke-width", "2.5");
    			attr_dev(svg13, "class", "w-3 h-3");
    			attr_dev(svg13, "viewBox", "0 0 24 24");
    			add_location(svg13, file$9, 125, 16, 9027);
    			attr_dev(span16, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span16, file$9, 124, 14, 8892);
    			attr_dev(p14, "class", "flex items-center text-gray-600 mb-6");
    			add_location(p14, file$9, 123, 12, 8828);
    			attr_dev(path14, "d", "M5 12h14M12 5l7 7-7 7");
    			add_location(path14, file$9, 132, 16, 9648);
    			attr_dev(svg14, "fill", "none");
    			attr_dev(svg14, "stroke", "currentColor");
    			attr_dev(svg14, "stroke-linecap", "round");
    			attr_dev(svg14, "stroke-linejoin", "round");
    			attr_dev(svg14, "stroke-width", "2");
    			attr_dev(svg14, "class", "w-4 h-4 ml-auto");
    			attr_dev(svg14, "viewBox", "0 0 24 24");
    			add_location(svg14, file$9, 131, 14, 9483);
    			attr_dev(button4, "class", "flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded");
    			add_location(button4, file$9, 130, 12, 9325);
    			attr_dev(p15, "class", "text-xs text-gray-500 mt-3");
    			add_location(p15, file$9, 135, 12, 9746);
    			attr_dev(div6, "class", "h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden");
    			add_location(div6, file$9, 89, 10, 6401);
    			attr_dev(div7, "class", "p-4 xl:w-1/4 md:w-1/2 w-full");
    			add_location(div7, file$9, 88, 8, 6347);
    			attr_dev(h23, "class", "text-sm tracking-widest title-font mb-1 font-medium");
    			add_location(h23, file$9, 140, 12, 10056);
    			add_location(span17, file$9, 142, 14, 10263);
    			attr_dev(span18, "class", "text-lg ml-1 font-normal text-gray-500");
    			add_location(span18, file$9, 143, 14, 10295);
    			attr_dev(h14, "class", "text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200");
    			add_location(h14, file$9, 141, 12, 10146);
    			attr_dev(path15, "d", "M20 6L9 17l-5-5");
    			add_location(path15, file$9, 148, 18, 10751);
    			attr_dev(svg15, "fill", "none");
    			attr_dev(svg15, "stroke", "currentColor");
    			attr_dev(svg15, "stroke-linecap", "round");
    			attr_dev(svg15, "stroke-linejoin", "round");
    			attr_dev(svg15, "stroke-width", "2.5");
    			attr_dev(svg15, "class", "w-3 h-3");
    			attr_dev(svg15, "viewBox", "0 0 24 24");
    			add_location(svg15, file$9, 147, 16, 10590);
    			attr_dev(span19, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span19, file$9, 146, 14, 10455);
    			attr_dev(p16, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p16, file$9, 145, 12, 10391);
    			attr_dev(path16, "d", "M20 6L9 17l-5-5");
    			add_location(path16, file$9, 155, 18, 11246);
    			attr_dev(svg16, "fill", "none");
    			attr_dev(svg16, "stroke", "currentColor");
    			attr_dev(svg16, "stroke-linecap", "round");
    			attr_dev(svg16, "stroke-linejoin", "round");
    			attr_dev(svg16, "stroke-width", "2.5");
    			attr_dev(svg16, "class", "w-3 h-3");
    			attr_dev(svg16, "viewBox", "0 0 24 24");
    			add_location(svg16, file$9, 154, 16, 11085);
    			attr_dev(span20, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span20, file$9, 153, 14, 10950);
    			attr_dev(p17, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p17, file$9, 152, 12, 10886);
    			attr_dev(path17, "d", "M20 6L9 17l-5-5");
    			add_location(path17, file$9, 162, 18, 11740);
    			attr_dev(svg17, "fill", "none");
    			attr_dev(svg17, "stroke", "currentColor");
    			attr_dev(svg17, "stroke-linecap", "round");
    			attr_dev(svg17, "stroke-linejoin", "round");
    			attr_dev(svg17, "stroke-width", "2.5");
    			attr_dev(svg17, "class", "w-3 h-3");
    			attr_dev(svg17, "viewBox", "0 0 24 24");
    			add_location(svg17, file$9, 161, 16, 11579);
    			attr_dev(span21, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span21, file$9, 160, 14, 11444);
    			attr_dev(p18, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p18, file$9, 159, 12, 11380);
    			attr_dev(path18, "d", "M20 6L9 17l-5-5");
    			add_location(path18, file$9, 169, 18, 12234);
    			attr_dev(svg18, "fill", "none");
    			attr_dev(svg18, "stroke", "currentColor");
    			attr_dev(svg18, "stroke-linecap", "round");
    			attr_dev(svg18, "stroke-linejoin", "round");
    			attr_dev(svg18, "stroke-width", "2.5");
    			attr_dev(svg18, "class", "w-3 h-3");
    			attr_dev(svg18, "viewBox", "0 0 24 24");
    			add_location(svg18, file$9, 168, 16, 12073);
    			attr_dev(span22, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span22, file$9, 167, 14, 11938);
    			attr_dev(p19, "class", "flex items-center text-gray-600 mb-2");
    			add_location(p19, file$9, 166, 12, 11874);
    			attr_dev(path19, "d", "M20 6L9 17l-5-5");
    			add_location(path19, file$9, 176, 18, 12729);
    			attr_dev(svg19, "fill", "none");
    			attr_dev(svg19, "stroke", "currentColor");
    			attr_dev(svg19, "stroke-linecap", "round");
    			attr_dev(svg19, "stroke-linejoin", "round");
    			attr_dev(svg19, "stroke-width", "2.5");
    			attr_dev(svg19, "class", "w-3 h-3");
    			attr_dev(svg19, "viewBox", "0 0 24 24");
    			add_location(svg19, file$9, 175, 16, 12568);
    			attr_dev(span23, "class", "w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0");
    			add_location(span23, file$9, 174, 14, 12433);
    			attr_dev(p20, "class", "flex items-center text-gray-600 mb-6");
    			add_location(p20, file$9, 173, 12, 12369);
    			attr_dev(path20, "d", "M5 12h14M12 5l7 7-7 7");
    			add_location(path20, file$9, 182, 16, 13189);
    			attr_dev(svg20, "fill", "none");
    			attr_dev(svg20, "stroke", "currentColor");
    			attr_dev(svg20, "stroke-linecap", "round");
    			attr_dev(svg20, "stroke-linejoin", "round");
    			attr_dev(svg20, "stroke-width", "2");
    			attr_dev(svg20, "class", "w-4 h-4 ml-auto");
    			attr_dev(svg20, "viewBox", "0 0 24 24");
    			add_location(svg20, file$9, 181, 14, 13024);
    			attr_dev(button5, "class", "flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded");
    			add_location(button5, file$9, 180, 12, 12866);
    			attr_dev(p21, "class", "text-xs text-gray-500 mt-3");
    			add_location(p21, file$9, 185, 12, 13287);
    			attr_dev(div8, "class", "h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden");
    			add_location(div8, file$9, 139, 10, 9943);
    			attr_dev(div9, "class", "p-4 xl:w-1/4 md:w-1/2 w-full");
    			add_location(div9, file$9, 138, 8, 9889);
    			attr_dev(div10, "class", "flex flex-wrap -m-4");
    			add_location(div10, file$9, 10, 6, 710);
    			attr_dev(div11, "class", "container px-5 py-24 mx-auto");
    			add_location(div11, file$9, 1, 4, 63);
    			attr_dev(section, "class", "text-gray-600 body-font overflow-hidden");
    			add_location(section, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div11);
    			append_dev(div11, div1);
    			append_dev(div1, h10);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t5);
    			append_dev(div0, button1);
    			append_dev(div11, t7);
    			append_dev(div11, div10);
    			append_dev(div10, div3);
    			append_dev(div3, div2);
    			append_dev(div2, h20);
    			append_dev(div2, t9);
    			append_dev(div2, h11);
    			append_dev(div2, t11);
    			append_dev(div2, p1);
    			append_dev(p1, span0);
    			append_dev(span0, svg0);
    			append_dev(svg0, path0);
    			append_dev(span0, t12);
    			append_dev(p1, t13);
    			append_dev(div2, t14);
    			append_dev(div2, p2);
    			append_dev(p2, span1);
    			append_dev(span1, svg1);
    			append_dev(svg1, path1);
    			append_dev(span1, t15);
    			append_dev(p2, t16);
    			append_dev(div2, t17);
    			append_dev(div2, p3);
    			append_dev(p3, span2);
    			append_dev(span2, svg2);
    			append_dev(svg2, path2);
    			append_dev(span2, t18);
    			append_dev(p3, t19);
    			append_dev(div2, t20);
    			append_dev(div2, button2);
    			append_dev(button2, t21);
    			append_dev(button2, svg3);
    			append_dev(svg3, path3);
    			append_dev(div2, t22);
    			append_dev(div2, p4);
    			append_dev(div10, t24);
    			append_dev(div10, div5);
    			append_dev(div5, div4);
    			append_dev(div4, span3);
    			append_dev(div4, t26);
    			append_dev(div4, h21);
    			append_dev(div4, t28);
    			append_dev(div4, h12);
    			append_dev(h12, span4);
    			append_dev(h12, t30);
    			append_dev(h12, span5);
    			append_dev(div4, t32);
    			append_dev(div4, p5);
    			append_dev(p5, span6);
    			append_dev(span6, svg4);
    			append_dev(svg4, path4);
    			append_dev(span6, t33);
    			append_dev(p5, t34);
    			append_dev(div4, t35);
    			append_dev(div4, p6);
    			append_dev(p6, span7);
    			append_dev(span7, svg5);
    			append_dev(svg5, path5);
    			append_dev(span7, t36);
    			append_dev(p6, t37);
    			append_dev(div4, t38);
    			append_dev(div4, p7);
    			append_dev(p7, span8);
    			append_dev(span8, svg6);
    			append_dev(svg6, path6);
    			append_dev(span8, t39);
    			append_dev(p7, t40);
    			append_dev(div4, t41);
    			append_dev(div4, p8);
    			append_dev(p8, span9);
    			append_dev(span9, svg7);
    			append_dev(svg7, path7);
    			append_dev(span9, t42);
    			append_dev(p8, t43);
    			append_dev(div4, t44);
    			append_dev(div4, button3);
    			append_dev(button3, t45);
    			append_dev(button3, svg8);
    			append_dev(svg8, path8);
    			append_dev(div4, t46);
    			append_dev(div4, p9);
    			append_dev(div10, t48);
    			append_dev(div10, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h22);
    			append_dev(div6, t50);
    			append_dev(div6, h13);
    			append_dev(h13, span10);
    			append_dev(h13, t52);
    			append_dev(h13, span11);
    			append_dev(div6, t54);
    			append_dev(div6, p10);
    			append_dev(p10, span12);
    			append_dev(span12, svg9);
    			append_dev(svg9, path9);
    			append_dev(span12, t55);
    			append_dev(p10, t56);
    			append_dev(div6, t57);
    			append_dev(div6, p11);
    			append_dev(p11, span13);
    			append_dev(span13, svg10);
    			append_dev(svg10, path10);
    			append_dev(span13, t58);
    			append_dev(p11, t59);
    			append_dev(div6, t60);
    			append_dev(div6, p12);
    			append_dev(p12, span14);
    			append_dev(span14, svg11);
    			append_dev(svg11, path11);
    			append_dev(span14, t61);
    			append_dev(p12, t62);
    			append_dev(div6, t63);
    			append_dev(div6, p13);
    			append_dev(p13, span15);
    			append_dev(span15, svg12);
    			append_dev(svg12, path12);
    			append_dev(span15, t64);
    			append_dev(p13, t65);
    			append_dev(div6, t66);
    			append_dev(div6, p14);
    			append_dev(p14, span16);
    			append_dev(span16, svg13);
    			append_dev(svg13, path13);
    			append_dev(span16, t67);
    			append_dev(p14, t68);
    			append_dev(div6, t69);
    			append_dev(div6, button4);
    			append_dev(button4, t70);
    			append_dev(button4, svg14);
    			append_dev(svg14, path14);
    			append_dev(div6, t71);
    			append_dev(div6, p15);
    			append_dev(div10, t73);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h23);
    			append_dev(div8, t75);
    			append_dev(div8, h14);
    			append_dev(h14, span17);
    			append_dev(h14, t77);
    			append_dev(h14, span18);
    			append_dev(div8, t79);
    			append_dev(div8, p16);
    			append_dev(p16, span19);
    			append_dev(span19, svg15);
    			append_dev(svg15, path15);
    			append_dev(span19, t80);
    			append_dev(p16, t81);
    			append_dev(div8, t82);
    			append_dev(div8, p17);
    			append_dev(p17, span20);
    			append_dev(span20, svg16);
    			append_dev(svg16, path16);
    			append_dev(span20, t83);
    			append_dev(p17, t84);
    			append_dev(div8, t85);
    			append_dev(div8, p18);
    			append_dev(p18, span21);
    			append_dev(span21, svg17);
    			append_dev(svg17, path17);
    			append_dev(span21, t86);
    			append_dev(p18, t87);
    			append_dev(div8, t88);
    			append_dev(div8, p19);
    			append_dev(p19, span22);
    			append_dev(span22, svg18);
    			append_dev(svg18, path18);
    			append_dev(span22, t89);
    			append_dev(p19, t90);
    			append_dev(div8, t91);
    			append_dev(div8, p20);
    			append_dev(p20, span23);
    			append_dev(span23, svg19);
    			append_dev(svg19, path19);
    			append_dev(span23, t92);
    			append_dev(p20, t93);
    			append_dev(div8, t94);
    			append_dev(div8, button5);
    			append_dev(button5, t95);
    			append_dev(button5, svg20);
    			append_dev(svg20, path20);
    			append_dev(div8, t96);
    			append_dev(div8, p21);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Shop', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Shop> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Shop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shop",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/routes/Contact.svelte generated by Svelte v3.42.4 */

    const file$8 = "src/routes/Contact.svelte";

    function create_fragment$9(ctx) {
    	let section;
    	let div20;
    	let div0;
    	let h10;
    	let t1;
    	let p0;
    	let t3;
    	let div19;
    	let div3;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let div1;
    	let h20;
    	let t6;
    	let h11;
    	let t8;
    	let p1;
    	let t10;
    	let div6;
    	let div5;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let div4;
    	let h21;
    	let t13;
    	let h12;
    	let t15;
    	let p2;
    	let t17;
    	let div9;
    	let div8;
    	let img2;
    	let img2_src_value;
    	let t18;
    	let div7;
    	let h22;
    	let t20;
    	let h13;
    	let t22;
    	let p3;
    	let t24;
    	let div12;
    	let div11;
    	let img3;
    	let img3_src_value;
    	let t25;
    	let div10;
    	let h23;
    	let t27;
    	let h14;
    	let t29;
    	let p4;
    	let t31;
    	let div15;
    	let div14;
    	let img4;
    	let img4_src_value;
    	let t32;
    	let div13;
    	let h24;
    	let t34;
    	let h15;
    	let t36;
    	let p5;
    	let t38;
    	let div18;
    	let div17;
    	let img5;
    	let img5_src_value;
    	let t39;
    	let div16;
    	let h25;
    	let t41;
    	let h16;
    	let t43;
    	let p6;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div20 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Master Cleanse Reliac Heirloom";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical gentrify, subway tile poke farm-to-table. Franzen you probably haven't heard of them man bun deep jianbing selfies heirloom.";
    			t3 = space();
    			div19 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t4 = space();
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "THE SUBTITLE";
    			t6 = space();
    			h11 = element("h1");
    			h11.textContent = "Shooting Stars";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.";
    			t10 = space();
    			div6 = element("div");
    			div5 = element("div");
    			img1 = element("img");
    			t11 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "THE SUBTITLE";
    			t13 = space();
    			h12 = element("h1");
    			h12.textContent = "The Catalyzer";
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.";
    			t17 = space();
    			div9 = element("div");
    			div8 = element("div");
    			img2 = element("img");
    			t18 = space();
    			div7 = element("div");
    			h22 = element("h2");
    			h22.textContent = "THE SUBTITLE";
    			t20 = space();
    			h13 = element("h1");
    			h13.textContent = "The 400 Blows";
    			t22 = space();
    			p3 = element("p");
    			p3.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.";
    			t24 = space();
    			div12 = element("div");
    			div11 = element("div");
    			img3 = element("img");
    			t25 = space();
    			div10 = element("div");
    			h23 = element("h2");
    			h23.textContent = "THE SUBTITLE";
    			t27 = space();
    			h14 = element("h1");
    			h14.textContent = "Neptune";
    			t29 = space();
    			p4 = element("p");
    			p4.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.";
    			t31 = space();
    			div15 = element("div");
    			div14 = element("div");
    			img4 = element("img");
    			t32 = space();
    			div13 = element("div");
    			h24 = element("h2");
    			h24.textContent = "THE SUBTITLE";
    			t34 = space();
    			h15 = element("h1");
    			h15.textContent = "Holden Caulfield";
    			t36 = space();
    			p5 = element("p");
    			p5.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.";
    			t38 = space();
    			div18 = element("div");
    			div17 = element("div");
    			img5 = element("img");
    			t39 = space();
    			div16 = element("div");
    			h25 = element("h2");
    			h25.textContent = "THE SUBTITLE";
    			t41 = space();
    			h16 = element("h1");
    			h16.textContent = "Alper Kamu";
    			t43 = space();
    			p6 = element("p");
    			p6.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.";
    			attr_dev(h10, "class", "sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900");
    			add_location(h10, file$8, 3, 8, 159);
    			attr_dev(p0, "class", "lg:w-2/3 mx-auto leading-relaxed text-base");
    			add_location(p0, file$8, 4, 8, 279);
    			attr_dev(div0, "class", "flex flex-col text-center w-full mb-20");
    			add_location(div0, file$8, 2, 6, 97);
    			attr_dev(img0, "alt", "gallery");
    			attr_dev(img0, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img0.src, img0_src_value = "https://picsum.photos/200/300")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$8, 9, 12, 678);
    			attr_dev(h20, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h20, file$8, 11, 14, 936);
    			attr_dev(h11, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h11, file$8, 12, 14, 1049);
    			attr_dev(p1, "class", "leading-relaxed");
    			add_location(p1, file$8, 13, 14, 1146);
    			attr_dev(div1, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div1, file$8, 10, 12, 813);
    			attr_dev(div2, "class", "flex relative");
    			add_location(div2, file$8, 8, 10, 637);
    			attr_dev(div3, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div3, file$8, 7, 8, 590);
    			attr_dev(img1, "alt", "gallery");
    			attr_dev(img1, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img1.src, img1_src_value = "https://picsum.photos/200/300")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$8, 19, 12, 1423);
    			attr_dev(h21, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h21, file$8, 21, 14, 1681);
    			attr_dev(h12, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h12, file$8, 22, 14, 1794);
    			attr_dev(p2, "class", "leading-relaxed");
    			add_location(p2, file$8, 23, 14, 1890);
    			attr_dev(div4, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div4, file$8, 20, 12, 1558);
    			attr_dev(div5, "class", "flex relative");
    			add_location(div5, file$8, 18, 10, 1382);
    			attr_dev(div6, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div6, file$8, 17, 8, 1335);
    			attr_dev(img2, "alt", "gallery");
    			attr_dev(img2, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img2.src, img2_src_value = "https://picsum.photos/200/300")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$8, 29, 12, 2167);
    			attr_dev(h22, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h22, file$8, 31, 14, 2425);
    			attr_dev(h13, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h13, file$8, 32, 14, 2538);
    			attr_dev(p3, "class", "leading-relaxed");
    			add_location(p3, file$8, 33, 14, 2634);
    			attr_dev(div7, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div7, file$8, 30, 12, 2302);
    			attr_dev(div8, "class", "flex relative");
    			add_location(div8, file$8, 28, 10, 2126);
    			attr_dev(div9, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div9, file$8, 27, 8, 2079);
    			attr_dev(img3, "alt", "gallery");
    			attr_dev(img3, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img3.src, img3_src_value = "https://dummyimage.com/602x362")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$8, 39, 12, 2911);
    			attr_dev(h23, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h23, file$8, 41, 14, 3170);
    			attr_dev(h14, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h14, file$8, 42, 14, 3283);
    			attr_dev(p4, "class", "leading-relaxed");
    			add_location(p4, file$8, 43, 14, 3373);
    			attr_dev(div10, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div10, file$8, 40, 12, 3047);
    			attr_dev(div11, "class", "flex relative");
    			add_location(div11, file$8, 38, 10, 2870);
    			attr_dev(div12, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div12, file$8, 37, 8, 2823);
    			attr_dev(img4, "alt", "gallery");
    			attr_dev(img4, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img4.src, img4_src_value = "https://dummyimage.com/605x365")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$8, 49, 12, 3650);
    			attr_dev(h24, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h24, file$8, 51, 14, 3909);
    			attr_dev(h15, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h15, file$8, 52, 14, 4022);
    			attr_dev(p5, "class", "leading-relaxed");
    			add_location(p5, file$8, 53, 14, 4121);
    			attr_dev(div13, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div13, file$8, 50, 12, 3786);
    			attr_dev(div14, "class", "flex relative");
    			add_location(div14, file$8, 48, 10, 3609);
    			attr_dev(div15, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div15, file$8, 47, 8, 3562);
    			attr_dev(img5, "alt", "gallery");
    			attr_dev(img5, "class", "absolute inset-0 w-full h-full object-cover object-center");
    			if (!src_url_equal(img5.src, img5_src_value = "https://dummyimage.com/606x366")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$8, 59, 12, 4398);
    			attr_dev(h25, "class", "tracking-widest text-sm title-font font-medium text-indigo-500 mb-1");
    			add_location(h25, file$8, 61, 14, 4657);
    			attr_dev(h16, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h16, file$8, 62, 14, 4770);
    			attr_dev(p6, "class", "leading-relaxed");
    			add_location(p6, file$8, 63, 14, 4863);
    			attr_dev(div16, "class", "px-8 py-10 relative z-10 w-full border-4 border-gray-200 bg-white opacity-0 hover:opacity-100");
    			add_location(div16, file$8, 60, 12, 4534);
    			attr_dev(div17, "class", "flex relative");
    			add_location(div17, file$8, 58, 10, 4357);
    			attr_dev(div18, "class", "lg:w-1/3 sm:w-1/2 p-4");
    			add_location(div18, file$8, 57, 8, 4310);
    			attr_dev(div19, "class", "flex flex-wrap -m-4");
    			add_location(div19, file$8, 6, 6, 547);
    			attr_dev(div20, "class", "container px-5 py-24 mx-auto");
    			add_location(div20, file$8, 1, 4, 47);
    			attr_dev(section, "class", "text-gray-600 body-font");
    			add_location(section, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div20);
    			append_dev(div20, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div20, t3);
    			append_dev(div20, div19);
    			append_dev(div19, div3);
    			append_dev(div3, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t6);
    			append_dev(div1, h11);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			append_dev(div19, t10);
    			append_dev(div19, div6);
    			append_dev(div6, div5);
    			append_dev(div5, img1);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, h21);
    			append_dev(div4, t13);
    			append_dev(div4, h12);
    			append_dev(div4, t15);
    			append_dev(div4, p2);
    			append_dev(div19, t17);
    			append_dev(div19, div9);
    			append_dev(div9, div8);
    			append_dev(div8, img2);
    			append_dev(div8, t18);
    			append_dev(div8, div7);
    			append_dev(div7, h22);
    			append_dev(div7, t20);
    			append_dev(div7, h13);
    			append_dev(div7, t22);
    			append_dev(div7, p3);
    			append_dev(div19, t24);
    			append_dev(div19, div12);
    			append_dev(div12, div11);
    			append_dev(div11, img3);
    			append_dev(div11, t25);
    			append_dev(div11, div10);
    			append_dev(div10, h23);
    			append_dev(div10, t27);
    			append_dev(div10, h14);
    			append_dev(div10, t29);
    			append_dev(div10, p4);
    			append_dev(div19, t31);
    			append_dev(div19, div15);
    			append_dev(div15, div14);
    			append_dev(div14, img4);
    			append_dev(div14, t32);
    			append_dev(div14, div13);
    			append_dev(div13, h24);
    			append_dev(div13, t34);
    			append_dev(div13, h15);
    			append_dev(div13, t36);
    			append_dev(div13, p5);
    			append_dev(div19, t38);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div17, img5);
    			append_dev(div17, t39);
    			append_dev(div17, div16);
    			append_dev(div16, h25);
    			append_dev(div16, t41);
    			append_dev(div16, h16);
    			append_dev(div16, t43);
    			append_dev(div16, p6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
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

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/routes/Lottery.svelte generated by Svelte v3.42.4 */

    const { console: console_1$7 } = globals;
    const file$7 = "src/routes/Lottery.svelte";

    function create_fragment$8(ctx) {
    	let head;
    	let t0;
    	let div3;
    	let div0;
    	let label;
    	let t2;
    	let input0;
    	let t3;
    	let button0;
    	let t5;
    	let div1;
    	let t6;
    	let div2;
    	let input1;
    	let t7;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			head = element("head");
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Ile liczb";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Losuj";
    			t5 = space();
    			div1 = element("div");
    			t6 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t7 = space();
    			button1 = element("button");
    			add_location(head, file$7, 2, 0, 4);
    			attr_dev(label, "for", "");
    			add_location(label, file$7, 9, 8, 93);
    			attr_dev(input0, "type", "number");
    			input0.value = /*liczba*/ ctx[0];
    			add_location(input0, file$7, 10, 8, 131);
    			attr_dev(button0, "id", "losuj");
    			attr_dev(button0, "class", "py-1 px-4 bg-indigo-500 text-white ");
    			add_location(button0, file$7, 11, 8, 177);
    			attr_dev(div0, "id", "top");
    			attr_dev(div0, "class", "top svelte-sndca7");
    			add_location(div0, file$7, 8, 4, 57);
    			attr_dev(div1, "id", "allBills");
    			attr_dev(div1, "class", "middle svelte-sndca7");
    			add_location(div1, file$7, 13, 4, 294);
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$7, 17, 8, 382);
    			add_location(button1, file$7, 18, 8, 411);
    			attr_dev(div2, "class", "bottom svelte-sndca7");
    			add_location(div2, file$7, 16, 4, 352);
    			attr_dev(div3, "class", "center svelte-sndca7");
    			add_location(div3, file$7, 7, 0, 31);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, label);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			append_dev(div0, t3);
    			append_dev(div0, button0);
    			append_dev(div3, t5);
    			append_dev(div3, div1);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			append_dev(div2, t7);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = listen_dev(button0, "click", /*losowanie*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
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
    	validate_slots('Lottery', slots, []);
    	let liczba, zgadnij;
    	let liczby = [];

    	function losowanie() {
    		document.querySelector('#losuj');
    		console.log('xx');
    		for (let i = 1; i <= liczba; i++) liczby.push(i);

    		liczby.forEach(element => {
    			const newDiv = document.createElement('div');
    			newDiv.setAttribute('class', 'bill');
    			newDiv.textContent = element;
    			allBills.appendChild(newDiv);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$7.warn(`<Lottery> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ liczba, zgadnij, liczby, losowanie });

    	$$self.$inject_state = $$props => {
    		if ('liczba' in $$props) $$invalidate(0, liczba = $$props.liczba);
    		if ('zgadnij' in $$props) zgadnij = $$props.zgadnij;
    		if ('liczby' in $$props) liczby = $$props.liczby;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [liczba, losowanie];
    }

    class Lottery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lottery",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/routes/TicTacToe.svelte generated by Svelte v3.42.4 */

    const { console: console_1$6 } = globals;
    const file$6 = "src/routes/TicTacToe.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (38:8) {#each row as col,j}
    function create_each_block_1$4(ctx) {
    	let button;
    	let t_value = /*col*/ ctx[10] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*i*/ ctx[9], /*j*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "cell w-40 h-40");
    			add_location(button, file$6, 38, 8, 1048);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tab*/ 1 && t_value !== (t_value = /*col*/ ctx[10] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(38:8) {#each row as col,j}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#each tab as row,i}
    function create_each_block$6(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*row*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "flex justify-center");
    			add_location(div, file$6, 36, 4, 975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*zmien, tab*/ 3) {
    				each_value_1 = /*row*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(36:4) {#each tab as row,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let each_value = /*tab*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "w-full h-screen flex flex-col justify-center ");
    			add_location(div, file$6, 34, 0, 884);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tab, zmien*/ 3) {
    				each_value = /*tab*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('TicTacToe', slots, []);
    	let tab = [["", "", ""], ["", "", ""], ["", "", ""]];
    	let win = false;
    	let whoWin = "";
    	let tak;
    	let flaga = 'x';

    	function zmien(i, j) {
    		if (tab[i][j] == '') {
    			$$invalidate(0, tab[i][j] = flaga, tab);
    			if (flaga == 'x') flaga = "o"; else if (flaga == 'o') flaga = 'x';

    			for (let x = 0; x < 3; x++) {
    				if (tab[0][x] == 'o' && tab[1][x] == 'o' && tab[2][x] == 'o' || tab[x][0] == 'o' && tab[x][1] == 'o' && tab[x][2] == 'o') {
    					alert("O wygrało");
    					whoWin = "O";
    				} else if (tab[0][x] == 'x' && tab[1][x] == 'x' && tab[2][x] == 'x' || tab[x][0] == 'x' && tab[x][1] == 'x' && tab[x][2] == 'x') {
    					alert("X wygrał");
    					whoWin = "X";
    				}

    				console.log(whoWin);

    				if (whoWin != "") {
    					window.location.reload(true);
    				}
    			}
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<TicTacToe> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, j) => zmien(i, j);
    	$$self.$capture_state = () => ({ tab, win, whoWin, tak, flaga, zmien });

    	$$self.$inject_state = $$props => {
    		if ('tab' in $$props) $$invalidate(0, tab = $$props.tab);
    		if ('win' in $$props) win = $$props.win;
    		if ('whoWin' in $$props) whoWin = $$props.whoWin;
    		if ('tak' in $$props) tak = $$props.tak;
    		if ('flaga' in $$props) flaga = $$props.flaga;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tab, zmien, click_handler];
    }

    class TicTacToe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TicTacToe",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/routes/Country.svelte generated by Svelte v3.42.4 */

    const { console: console_1$5 } = globals;
    const file$5 = "src/routes/Country.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (32:4) {:catch error}
    function create_catch_block$3(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[8].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$5, 32, 8, 989);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(32:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {:then user}
    function create_then_block$3(ctx) {
    	let select;
    	let t;
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;
    	let each_value = /*user*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			img = element("img");
    			attr_dev(select, "class", "text-white");
    			attr_dev(select, "name", "");
    			attr_dev(select, "id", "miasta");
    			if (/*wartosc*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$5, 22, 4, 651);
    			attr_dev(img, "id", "flaga");
    			if (!src_url_equal(img.src, img_src_value = "https://www.countryflags.io/af/flat/64.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$5, 28, 8, 880);
    			add_location(div, file$5, 27, 4, 865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*wartosc*/ ctx[0]);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[3]),
    					listen_dev(select, "change", /*zmien*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 2) {
    				each_value = /*user*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*wartosc, promise*/ 3) {
    				select_option(select, /*wartosc*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(22:4) {:then user}",
    		ctx
    	});

    	return block;
    }

    // (24:8) {#each user as user}
    function create_each_block$5(ctx) {
    	let option;
    	let t_value = /*user*/ ctx[5].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*user*/ ctx[5].code;
    			option.value = option.__value;
    			add_location(option, file$5, 24, 8, 779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(24:8) {#each user as user}",
    		ctx
    	});

    	return block;
    }

    // (20:20)           <p>Loading...</p>      {:then user}
    function create_pending_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$5, 20, 8, 610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(20:20)           <p>Loading...</p>      {:then user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block$3,
    		value: 5,
    		error: 8
    	};

    	handle_promise(/*promise*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			add_location(div, file$5, 18, 0, 573);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
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

    async function getUsers() {
    	let response = await fetch("./kraje.json");
    	let users = await response.json();
    	return users;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Country', slots, []);
    	const selCities = document.querySelector("#miasta");
    	const promise = getUsers();
    	console.log(promise);

    	//let selected = selCities.options[selCities.selectedIndex].text
    	//console.log(selected)
    	let wartosc;

    	function zmien() {
    		let link = `https://www.countryflags.io/${wartosc}/flat/64.png`;
    		document.getElementById('flaga').src = link;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<Country> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		wartosc = select_value(this);
    		$$invalidate(0, wartosc);
    		$$invalidate(1, promise);
    	}

    	$$self.$capture_state = () => ({
    		getUsers,
    		selCities,
    		promise,
    		wartosc,
    		zmien
    	});

    	$$self.$inject_state = $$props => {
    		if ('wartosc' in $$props) $$invalidate(0, wartosc = $$props.wartosc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wartosc, promise, zmien, select_change_handler];
    }

    class Country extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Country",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/routes/quiz.svelte generated by Svelte v3.42.4 */

    const { console: console_1$4 } = globals;
    const file$4 = "src/routes/quiz.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>       async function getQuiz(){          let URL = "./pytania.json"          let res = await fetch(URL);          res = await res.json()          console.log(res)          return res      }
    function create_catch_block$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>       async function getQuiz(){          let URL = \\\"./pytania.json\\\"          let res = await fetch(URL);          res = await res.json()          console.log(res)          return res      }",
    		ctx
    	});

    	return block;
    }

    // (52:0) {:then quiz}
    function create_then_block$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*i*/ ctx[0] < /*quiz*/ ctx[3].length) return create_if_block$3;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(52:0) {:then quiz}",
    		ctx
    	});

    	return block;
    }

    // (70:0) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*quiz*/ ctx[3].length + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text("To twój wynik ");
    			t1 = text(/*x*/ ctx[1]);
    			t2 = text("/");
    			t3 = text(t3_value);
    			attr_dev(p, "class", "text-yellow-400 text-6xl");
    			add_location(p, file$4, 70, 52, 2231);
    			attr_dev(div, "class", "h-96 flex justify-center items-center");
    			add_location(div, file$4, 70, 0, 2179);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*x*/ 2) set_data_dev(t1, /*x*/ ctx[1]);
    			if (dirty & /*quiz*/ 8 && t3_value !== (t3_value = /*quiz*/ ctx[3].length + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(70:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (53:0) {#if i < quiz.length}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let each_value = /*quiz*/ ctx[3].slice(/*i*/ ctx[0], /*i*/ ctx[0] + 1);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quiz, i, handleClick, x*/ 27) {
    				each_value = /*quiz*/ ctx[3].slice(/*i*/ ctx[0], /*i*/ ctx[0] + 1);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(53:0) {#if i < quiz.length}",
    		ctx
    	});

    	return block;
    }

    // (65:12) {#each item.q as pytanie}
    function create_each_block_1$3(ctx) {
    	let button;
    	let t_value = /*pytanie*/ ctx[12] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*pytanie*/ ctx[12], /*item*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "justify-center rounded-md transition duration-500 ease-in-out hover:bg-yellow-800 transform hover:-translate-y-1 hover:scale-110 m-3 p-4 bg-yellow-400 flex w-1/3 content-center text-white svelte-1wnh4q");
    			add_location(button, file$4, 65, 16, 1850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*quiz, i*/ 9 && t_value !== (t_value = /*pytanie*/ ctx[12] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(65:12) {#each item.q as pytanie}",
    		ctx
    	});

    	return block;
    }

    // (54:4) {#each quiz.slice(i,i+1) as item}
    function create_each_block$4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*quiz*/ ctx[3].length + "";
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let t6;
    	let t7;
    	let h2;
    	let t8_value = /*i*/ ctx[0] + 1 + "";
    	let t8;
    	let t9;
    	let t10_value = /*item*/ ctx[9].pytanie + "";
    	let t10;
    	let t11;
    	let div3;
    	let t12;
    	let each_value_1 = /*item*/ ctx[9].q;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Pytanie ");
    			t1 = text(/*i*/ ctx[0]);
    			t2 = text("/");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			t5 = text(/*x*/ ctx[1]);
    			t6 = text("ptk");
    			t7 = space();
    			h2 = element("h2");
    			t8 = text(t8_value);
    			t9 = text(".");
    			t10 = text(t10_value);
    			t11 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			attr_dev(div0, "class", "text-3xl text-yellow-400");
    			attr_dev(div0, "id", "question");
    			add_location(div0, file$4, 55, 12, 1395);
    			attr_dev(div1, "id", "points");
    			attr_dev(div1, "class", "text-3xl text-yellow-400");
    			add_location(div1, file$4, 58, 12, 1524);
    			attr_dev(div2, "class", "w-3/4 flex flex-row justify-between items-center");
    			add_location(div2, file$4, 54, 8, 1319);
    			attr_dev(h2, "class", "text-3xl m-5 text-yellow-400");
    			add_location(h2, file$4, 62, 8, 1644);
    			attr_dev(div3, "class", "flex flex-row flex-wrap w-full items-center justify-center");
    			add_location(div3, file$4, 63, 8, 1721);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t8);
    			append_dev(h2, t9);
    			append_dev(h2, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div3, t12);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*i*/ 1) set_data_dev(t1, /*i*/ ctx[0]);
    			if (dirty & /*quiz*/ 8 && t3_value !== (t3_value = /*quiz*/ ctx[3].length + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*x*/ 2) set_data_dev(t5, /*x*/ ctx[1]);
    			if (dirty & /*i*/ 1 && t8_value !== (t8_value = /*i*/ ctx[0] + 1 + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*quiz, i*/ 9 && t10_value !== (t10_value = /*item*/ ctx[9].pytanie + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*handleClick, quiz, i*/ 25) {
    				each_value_1 = /*item*/ ctx[9].q;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, t12);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(54:4) {#each quiz.slice(i,i+1) as item}",
    		ctx
    	});

    	return block;
    }

    // (50:13)   loading  {:then quiz}
    function create_pending_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("loading");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(50:13)   loading  {:then quiz}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let label;
    	let t1;
    	let input;
    	let t2;
    	let promise;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 3
    	};

    	handle_promise(promise = /*quiz*/ ctx[3], info);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Wprowadź plik z pytaniami";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			info.block.c();
    			attr_dev(label, "for", "");
    			add_location(label, file$4, 46, 8, 1031);
    			input.multiple = "FALSE";
    			attr_dev(input, "accept", "application/json");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "id", "file");
    			add_location(input, file$4, 47, 8, 1088);
    			attr_dev(div0, "class", "w-3/4 flex flex-row justify-between items-center text-xl text-white");
    			attr_dev(div0, "id", "question");
    			add_location(div0, file$4, 45, 5, 926);
    			attr_dev(div1, "class", "pytania flex flex-col w-full items-center");
    			add_location(div1, file$4, 44, 0, 864);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			append_dev(div1, t2);
    			info.block.m(div1, info.anchor = null);
    			info.mount = () => div1;
    			info.anchor = null;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[6]),
    					listen_dev(input, "change", /*change_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*quiz*/ 8 && promise !== (promise = /*quiz*/ ctx[3]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
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

    async function getQuiz() {
    	let URL = "./pytania.json";
    	let res = await fetch(URL);
    	res = await res.json();
    	console.log(res);
    	return res;
    }

    function akturalizuj(odpowiedz, poprawna, e) {
    	
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Quiz', slots, []);
    	let quiz = getQuiz();
    	let i = 0;
    	let x = 0;

    	function handleClick(pickedQuestion, answer) {
    		window.setTimeout(
    			() => {
    				if (pickedQuestion == answer) {
    					console.log("dobrze");
    					$$invalidate(1, x++, x);
    				} else {
    					console.log("źle");
    				}

    				$$invalidate(0, i++, i);
    			},
    			100
    		);
    	}

    	let files = [];

    	async function sprawdz() {
    		const text = await files[0].text();
    		let json = JSON.parse(text);
    		console.log(json);
    		$$invalidate(3, quiz = json);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Quiz> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(2, files);
    	}

    	const change_handler = () => sprawdz();
    	const click_handler = (pytanie, item) => handleClick(pytanie, item.odp);

    	$$self.$capture_state = () => ({
    		getQuiz,
    		quiz,
    		i,
    		x,
    		handleClick,
    		akturalizuj,
    		files,
    		sprawdz
    	});

    	$$self.$inject_state = $$props => {
    		if ('quiz' in $$props) $$invalidate(3, quiz = $$props.quiz);
    		if ('i' in $$props) $$invalidate(0, i = $$props.i);
    		if ('x' in $$props) $$invalidate(1, x = $$props.x);
    		if ('files' in $$props) $$invalidate(2, files = $$props.files);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(3, quiz = getQuiz());

    	return [
    		i,
    		x,
    		files,
    		quiz,
    		handleClick,
    		sprawdz,
    		input_change_handler,
    		change_handler,
    		click_handler
    	];
    }

    class Quiz extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quiz",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/routes/Cars.svelte generated by Svelte v3.42.4 */

    const { console: console_1$3 } = globals;
    const file$3 = "src/routes/Cars.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>     async function getCars(){         let Url="https://private-anon-f8e8e552de-carsapi1.apiary-mock.com/manufacturers"         let res = await fetch(             Url,             {                 method:"GET"             }
    function create_catch_block$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>     async function getCars(){         let Url=\\\"https://private-anon-f8e8e552de-carsapi1.apiary-mock.com/manufacturers\\\"         let res = await fetch(             Url,             {                 method:\\\"GET\\\"             }",
    		ctx
    	});

    	return block;
    }

    // (22:8) {:then cars}
    function create_then_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*cars*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cars*/ 1) {
    				each_value = /*cars*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(22:8) {:then cars}",
    		ctx
    	});

    	return block;
    }

    // (23:12) {#each cars as item}
    function create_each_block$3(ctx) {
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h2;
    	let t2;
    	let h1;
    	let t4;
    	let p;
    	let t6;
    	let div0;
    	let a;
    	let t7;
    	let svg0;
    	let path0;
    	let path1;
    	let t8;
    	let span0;
    	let svg1;
    	let path2;
    	let circle;
    	let t9;
    	let t10;
    	let span1;
    	let svg2;
    	let path3;
    	let t11;
    	let t12;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "CATEGORY";
    			t2 = space();
    			h1 = element("h1");
    			h1.textContent = "The Catalyzer";
    			t4 = space();
    			p = element("p");
    			p.textContent = "Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.";
    			t6 = space();
    			div0 = element("div");
    			a = element("a");
    			t7 = text("Learn More\n                        ");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t8 = space();
    			span0 = element("span");
    			svg1 = svg_element("svg");
    			path2 = svg_element("path");
    			circle = svg_element("circle");
    			t9 = text("1.2K");
    			t10 = space();
    			span1 = element("span");
    			svg2 = svg_element("svg");
    			path3 = svg_element("path");
    			t11 = text("6");
    			t12 = space();
    			attr_dev(img, "class", "lg:h-48 md:h-36 w-full object-cover object-center");
    			if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[1].img_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "blog");
    			add_location(img, file$3, 25, 18, 734);
    			attr_dev(h2, "class", "tracking-widest text-xs title-font font-medium text-gray-400 mb-1");
    			add_location(h2, file$3, 27, 20, 884);
    			attr_dev(h1, "class", "title-font text-lg font-medium text-gray-900 mb-3");
    			add_location(h1, file$3, 28, 20, 996);
    			attr_dev(p, "class", "leading-relaxed mb-3");
    			add_location(p, file$3, 29, 20, 1097);
    			attr_dev(path0, "d", "M5 12h14");
    			add_location(path0, file$3, 33, 26, 1587);
    			attr_dev(path1, "d", "M12 5l7 7-7 7");
    			add_location(path1, file$3, 34, 26, 1640);
    			attr_dev(svg0, "class", "w-4 h-4 ml-2");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			add_location(svg0, file$3, 32, 24, 1416);
    			attr_dev(a, "class", "text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0");
    			add_location(a, file$3, 31, 22, 1313);
    			attr_dev(path2, "d", "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z");
    			add_location(path2, file$3, 39, 26, 2091);
    			attr_dev(circle, "cx", "12");
    			attr_dev(circle, "cy", "12");
    			attr_dev(circle, "r", "3");
    			add_location(circle, file$3, 40, 26, 2180);
    			attr_dev(svg1, "class", "w-4 h-4 mr-1");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file$3, 38, 24, 1920);
    			attr_dev(span0, "class", "text-gray-400 mr-3 inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200");
    			add_location(span0, file$3, 37, 22, 1752);
    			attr_dev(path3, "d", "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z");
    			add_location(path3, file$3, 45, 26, 2577);
    			attr_dev(svg2, "class", "w-4 h-4 mr-1");
    			attr_dev(svg2, "stroke", "currentColor");
    			attr_dev(svg2, "stroke-width", "2");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "stroke-linecap", "round");
    			attr_dev(svg2, "stroke-linejoin", "round");
    			attr_dev(svg2, "viewBox", "0 0 24 24");
    			add_location(svg2, file$3, 44, 24, 2406);
    			attr_dev(span1, "class", "text-gray-400 inline-flex items-center leading-none text-sm");
    			add_location(span1, file$3, 43, 22, 2307);
    			attr_dev(div0, "class", "flex items-center flex-wrap ");
    			add_location(div0, file$3, 30, 20, 1248);
    			attr_dev(div1, "class", "p-6");
    			add_location(div1, file$3, 26, 18, 846);
    			attr_dev(div2, "class", "h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden");
    			add_location(div2, file$3, 24, 16, 625);
    			attr_dev(div3, "class", "p-4 md:w-1/3");
    			add_location(div3, file$3, 23, 12, 582);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			append_dev(div1, h1);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(div1, t6);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, t7);
    			append_dev(a, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(div0, t8);
    			append_dev(div0, span0);
    			append_dev(span0, svg1);
    			append_dev(svg1, path2);
    			append_dev(svg1, circle);
    			append_dev(span0, t9);
    			append_dev(div0, t10);
    			append_dev(div0, span1);
    			append_dev(span1, svg2);
    			append_dev(svg2, path3);
    			append_dev(span1, t11);
    			append_dev(div3, t12);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cars*/ 1 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[1].img_url)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(23:12) {#each cars as item}",
    		ctx
    	});

    	return block;
    }

    // (20:21)          loading         {:then cars}
    function create_pending_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("loading");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(20:21)          loading         {:then cars}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 0
    	};

    	handle_promise(promise = /*cars*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			info.block.c();
    			attr_dev(div0, "class", "flex flex-row w-full flex-wrap");
    			add_location(div0, file$3, 18, 4, 433);
    			attr_dev(div1, "class", "flex flex-row w-full flex-wrap items-center");
    			add_location(div1, file$3, 17, 0, 371);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*cars*/ 1 && promise !== (promise = /*cars*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
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

    async function getCars() {
    	let Url = "https://private-anon-f8e8e552de-carsapi1.apiary-mock.com/manufacturers";
    	let res = await fetch(Url, { method: "GET" });
    	res = await res.json();
    	return res;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cars', slots, []);
    	let cars = getCars();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Cars> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ getCars, cars });

    	$$self.$inject_state = $$props => {
    		if ('cars' in $$props) $$invalidate(0, cars = $$props.cars);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, cars = getCars());
    	return [cars];
    }

    class Cars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cars",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/routes/Sudoku.svelte generated by Svelte v3.42.4 */

    const { console: console_1$2 } = globals;
    const file$2 = "src/routes/Sudoku.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (118:16) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-white");
    			add_location(div, file$2, 118, 20, 3335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 1 && t_value !== (t_value = /*el*/ ctx[7] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(118:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (115:16) {#if (i+j) % 2 == 0}
    function create_if_block$2(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-white");
    			add_location(div, file$2, 115, 20, 3142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 1 && t_value !== (t_value = /*el*/ ctx[7] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(115:16) {#if (i+j) % 2 == 0}",
    		ctx
    	});

    	return block;
    }

    // (114:12) {#each blok as el,j}
    function create_each_block_1$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if ((/*i*/ ctx[6] + /*j*/ ctx[9]) % 2 == 0) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(114:12) {#each blok as el,j}",
    		ctx
    	});

    	return block;
    }

    // (112:8) {#each grid as blok,i}
    function create_each_block$2(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*blok*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "w-full flex flex-row");
    			add_location(div, file$2, 112, 12, 3017);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 1) {
    				each_value_1 = /*blok*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(112:8) {#each grid as blok,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let each_value = /*grid*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "w-2/5 flex flex-row flex-wrap border-2");
    			add_location(div0, file$2, 110, 8, 2921);
    			attr_dev(div1, "class", "flex w-full justify-center items-center");
    			add_location(div1, file$2, 109, 4, 2859);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*grid*/ 1) {
    				each_value = /*grid*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
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

    function isSafe$1(grid, row, col, num) {
    	// Check if we find the same num
    	// in the similar row , we
    	// return false
    	for (let x = 0; x <= 8; x++) if (grid[row][x] == num) return false;

    	// Check if we find the same num
    	// in the similar column ,
    	// we return false
    	for (let x = 0; x <= 8; x++) if (grid[x][col] == num) return false;

    	// Check if we find the same num
    	// in the particular 3*3
    	// matrix, we return false
    	let startRow = row - row % 3, startCol = col - col % 3;

    	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (grid[i + startRow][j + startCol] == num) return false;
    	return true;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sudoku', slots, []);
    	let N = 9;

    	/* Takes a partially filled-in grid and attempts
        to assign values to all unassigned locations in
        such a way to meet the requirements for
        Sudoku solution (non-duplication across rows,
        columns, and boxes) */
    	function solveSuduko(grid, row, col) {
    		if (row == N - 1 && col == N) return true;

    		if (col == N) {
    			row++;
    			col = 0;
    		}

    		if (grid[row][col] != 0) return solveSuduko(grid, row, col + 1);

    		for (let num = 1; num < 10; num++) {
    			if (isSafe$1(grid, row, col, num)) {
    				grid[row][col] = num;
    				if (solveSuduko(grid, row, col + 1)) return true;
    			}

    			grid[row][col] = 0;
    		}

    		return false;
    	}

    	/* A utility function to print grid */
    	function print(grid) {
    		for (let i = 0; i < N; i++) {
    			for (let j = 0; j < N; j++) document.write(grid[i][j] + " ");
    			document.write("<br>");
    		}
    	}

    	let grid = [
    		[3, 0, 6, 5, 0, 8, 4, 0, 0],
    		[5, 2, 0, 0, 0, 0, 0, 0, 0],
    		[0, 8, 7, 0, 0, 0, 0, 3, 1],
    		[0, 0, 3, 0, 1, 0, 0, 8, 0],
    		[9, 0, 0, 8, 6, 3, 0, 0, 5],
    		[0, 5, 0, 0, 9, 0, 6, 0, 0],
    		[1, 3, 0, 0, 0, 0, 2, 5, 0],
    		[0, 0, 0, 0, 0, 0, 0, 7, 4],
    		[0, 0, 5, 2, 0, 6, 3, 0, 0]
    	];

    	if (solveSuduko(grid, 0, 0)) {
    		//print(grid)
    		console.log(grid);

    		grid = grid;
    	} else document.write("no solution exists ");

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Sudoku> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ N, solveSuduko, print, isSafe: isSafe$1, grid });

    	$$self.$inject_state = $$props => {
    		if ('N' in $$props) N = $$props.N;
    		if ('grid' in $$props) $$invalidate(0, grid = $$props.grid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [grid];
    }

    class Sudoku extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sudoku",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/routes/Sudoku2.svelte generated by Svelte v3.42.4 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/routes/Sudoku2.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    // (308:10) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-white");
    			add_location(div, file$1, 308, 12, 10036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gridToPrint*/ 2 && t_value !== (t_value = /*el*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(308:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (301:48) 
    function create_if_block_14(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-white");
    			add_location(div, file$1, 301, 12, 9806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gridToPrint*/ 2 && t_value !== (t_value = /*el*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(301:48) ",
    		ctx
    	});

    	return block;
    }

    // (294:72) 
    function create_if_block_13(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-white border-b-4");
    			add_location(div, file$1, 294, 12, 9534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gridToPrint*/ 2 && t_value !== (t_value = /*el*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(294:72) ",
    		ctx
    	});

    	return block;
    }

    // (287:72) 
    function create_if_block_12(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-white border-b-4");
    			add_location(div, file$1, 287, 12, 9238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gridToPrint*/ 2 && t_value !== (t_value = /*el*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(287:72) ",
    		ctx
    	});

    	return block;
    }

    // (280:72) 
    function create_if_block_11(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-white border-r-4");
    			add_location(div, file$1, 280, 12, 8942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gridToPrint*/ 2 && t_value !== (t_value = /*el*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(280:72) ",
    		ctx
    	});

    	return block;
    }

    // (273:72) 
    function create_if_block_10(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-white border-r-4");
    			add_location(div, file$1, 273, 12, 8646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gridToPrint*/ 2 && t_value !== (t_value = /*el*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(273:72) ",
    		ctx
    	});

    	return block;
    }

    // (266:96) 
    function create_if_block_9(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-white border-b-4 border-r-4");
    			add_location(div, file$1, 266, 12, 8339);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gridToPrint*/ 2 && t_value !== (t_value = /*el*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(266:96) ",
    		ctx
    	});

    	return block;
    }

    // (259:96) 
    function create_if_block_8(ctx) {
    	let div;
    	let t_value = /*el*/ ctx[26] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-white border-b-4 border-r-4");
    			add_location(div, file$1, 259, 12, 8008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gridToPrint*/ 2 && t_value !== (t_value = /*el*/ ctx[26] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(259:96) ",
    		ctx
    	});

    	return block;
    }

    // (253:48) 
    function create_if_block_7(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler_7(...args) {
    		return /*click_handler_7*/ ctx[16](/*j*/ ctx[28], /*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-red-600");
    			add_location(div, file$1, 253, 12, 7676);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_7, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(253:48) ",
    		ctx
    	});

    	return block;
    }

    // (247:48) 
    function create_if_block_6(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler_6(...args) {
    		return /*click_handler_6*/ ctx[15](/*j*/ ctx[28], /*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-red-600");
    			add_location(div, file$1, 247, 12, 7392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_6, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(247:48) ",
    		ctx
    	});

    	return block;
    }

    // (241:72) 
    function create_if_block_5(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[14](/*j*/ ctx[28], /*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-red-600 border-r-4");
    			add_location(div, file$1, 241, 12, 7097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_5, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(241:72) ",
    		ctx
    	});

    	return block;
    }

    // (235:72) 
    function create_if_block_4(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[13](/*j*/ ctx[28], /*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-red-600 border-b-4");
    			add_location(div, file$1, 235, 12, 6778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(235:72) ",
    		ctx
    	});

    	return block;
    }

    // (229:72) 
    function create_if_block_3(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[12](/*j*/ ctx[28], /*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-red-600 border-r-4");
    			add_location(div, file$1, 229, 12, 6459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(229:72) ",
    		ctx
    	});

    	return block;
    }

    // (223:72) 
    function create_if_block_2(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[11](/*j*/ ctx[28], /*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-red-600 border-b-4");
    			add_location(div, file$1, 223, 12, 6140);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(223:72) ",
    		ctx
    	});

    	return block;
    }

    // (217:96) 
    function create_if_block_1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[10](/*j*/ ctx[28], /*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-500 border-solid border border-gray-100 text-red-600 border-b-4 border-r-4");
    			add_location(div, file$1, 217, 12, 5810);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(217:96) ",
    		ctx
    	});

    	return block;
    }

    // (211:10) {#if el == 0 && (i + j) % 2 == 0 && i % 3 == 2 && i != 8 && j % 3 == 2 && j != 8}
    function create_if_block$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[9](/*j*/ ctx[28], /*i*/ ctx[25], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "el h-16 flex justify-center items-center w-16 bg-gray-700 border-solid border border-gray-100 text-red-600 border-b-4 border-r-4");
    			add_location(div, file$1, 211, 12, 5456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(211:10) {#if el == 0 && (i + j) % 2 == 0 && i % 3 == 2 && i != 8 && j % 3 == 2 && j != 8}",
    		ctx
    	});

    	return block;
    }

    // (210:8) {#each blok as el, j}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*el*/ ctx[26] == 0 && (/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 == 0 && /*i*/ ctx[25] % 3 == 2 && /*i*/ ctx[25] != 8 && /*j*/ ctx[28] % 3 == 2 && /*j*/ ctx[28] != 8) return create_if_block$1;
    		if (/*el*/ ctx[26] == 0 && (/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 != 0 && /*i*/ ctx[25] % 3 == 2 && /*i*/ ctx[25] != 8 && /*j*/ ctx[28] % 3 == 2 && /*j*/ ctx[28] != 8) return create_if_block_1;
    		if (/*el*/ ctx[26] == 0 && (/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 == 0 && /*i*/ ctx[25] % 3 == 2 && /*i*/ ctx[25] != 8) return create_if_block_2;
    		if (/*el*/ ctx[26] == 0 && (/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 == 0 && /*j*/ ctx[28] % 3 == 2 && /*j*/ ctx[28] != 8) return create_if_block_3;
    		if (/*el*/ ctx[26] == 0 && (/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 != 0 && /*i*/ ctx[25] % 3 == 2 && /*i*/ ctx[25] != 8) return create_if_block_4;
    		if (/*el*/ ctx[26] == 0 && (/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 != 0 && /*j*/ ctx[28] % 3 == 2 && /*j*/ ctx[28] != 8) return create_if_block_5;
    		if (/*el*/ ctx[26] == 0 && (/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 == 0) return create_if_block_6;
    		if (/*el*/ ctx[26] == 0 && (/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 != 0) return create_if_block_7;
    		if ((/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 == 0 && /*el*/ ctx[26] != 0 && /*i*/ ctx[25] % 3 == 2 && /*i*/ ctx[25] != 8 && /*j*/ ctx[28] % 3 == 2 && /*j*/ ctx[28] != 8) return create_if_block_8;
    		if ((/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 != 0 && /*el*/ ctx[26] != 0 && /*i*/ ctx[25] % 3 == 2 && /*i*/ ctx[25] != 8 && /*j*/ ctx[28] % 3 == 2 && /*j*/ ctx[28] != 8) return create_if_block_9;
    		if ((/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 == 0 && /*el*/ ctx[26] != 0 && /*j*/ ctx[28] % 3 == 2 && /*j*/ ctx[28] != 8) return create_if_block_10;
    		if ((/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 != 0 && /*el*/ ctx[26] != 0 && /*j*/ ctx[28] % 3 == 2 && /*j*/ ctx[28] != 8) return create_if_block_11;
    		if ((/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 == 0 && /*el*/ ctx[26] != 0 && /*i*/ ctx[25] % 3 == 2 && /*i*/ ctx[25] != 8) return create_if_block_12;
    		if ((/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 != 0 && /*el*/ ctx[26] != 0 && /*i*/ ctx[25] % 3 == 2 && /*i*/ ctx[25] != 8) return create_if_block_13;
    		if ((/*i*/ ctx[25] + /*j*/ ctx[28]) % 2 == 0 && /*el*/ ctx[26] != 0) return create_if_block_14;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(210:8) {#each blok as el, j}",
    		ctx
    	});

    	return block;
    }

    // (208:4) {#each gridToPrint as blok, i}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*blok*/ ctx[23];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "w-full flex flex-row");
    			add_location(div, file$1, 208, 6, 5287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*changeVal, gridToPrint*/ 34) {
    				each_value_1 = /*blok*/ ctx[23];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(208:4) {#each gridToPrint as blok, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let t3;
    	let label1;
    	let p;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let label2;
    	let span;
    	let t9;
    	let input1;
    	let t10;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*gridToPrint*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Wprowadź plik z sudoku";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			label1 = element("label");
    			p = element("p");
    			t4 = text("Błędy ");
    			t5 = text(/*bledy*/ ctx[0]);
    			t6 = text("/10");
    			t7 = space();
    			label2 = element("label");
    			span = element("span");
    			span.textContent = "Podaj liczbę 1-9";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			button = element("button");
    			button.textContent = "Rozwiąz";
    			add_location(label0, file$1, 203, 8, 5022);
    			input0.multiple = "FALSE";
    			attr_dev(input0, "accept", "application/json");
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "id", "file");
    			attr_dev(input0, "class", "svelte-8b7fgd");
    			add_location(input0, file$1, 204, 8, 5068);
    			attr_dev(div0, "class", "w-3/4 flex flex-row justify-between items-center text-xl text-yellow-400 m-5");
    			attr_dev(div0, "id", "question");
    			add_location(div0, file$1, 202, 4, 4909);
    			attr_dev(div1, "class", "w-2/5 flex flex-row flex-wrap border-2");
    			add_location(div1, file$1, 206, 4, 5193);
    			attr_dev(p, "class", "text-white");
    			add_location(p, file$1, 319, 9, 10311);
    			add_location(label1, file$1, 319, 2, 10304);
    			attr_dev(span, "class", "text-white");
    			add_location(span, file$1, 321, 5, 10376);
    			attr_dev(input1, "id", "inp");
    			input1.autofocus = true;
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "1");
    			attr_dev(input1, "max", "9");
    			attr_dev(input1, "class", "w-10 text-white m-3 text-center svelte-8b7fgd");
    			add_location(input1, file$1, 322, 4, 10429);
    			add_location(label2, file$1, 320, 2, 10364);
    			attr_dev(button, "class", "w-24 text-center text-white rounded-md");
    			add_location(button, file$1, 332, 2, 10604);
    			attr_dev(div2, "class", "flex w-full justify-center items-center flex-col");
    			attr_dev(div2, "id", "rozw");
    			add_location(div2, file$1, 201, 0, 4832);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t3);
    			append_dev(div2, label1);
    			append_dev(label1, p);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    			append_dev(div2, t7);
    			append_dev(div2, label2);
    			append_dev(label2, span);
    			append_dev(label2, t9);
    			append_dev(label2, input1);
    			set_input_value(input1, /*num*/ ctx[2]);
    			append_dev(div2, t10);
    			append_dev(div2, button);
    			input1.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[7]),
    					listen_dev(input0, "change", /*change_handler*/ ctx[8], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[17]),
    					listen_dev(button, "click", /*click_handler_8*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gridToPrint, changeVal*/ 34) {
    				each_value = /*gridToPrint*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*bledy*/ 1) set_data_dev(t5, /*bledy*/ ctx[0]);

    			if (dirty & /*num*/ 4 && to_number(input1.value) !== /*num*/ ctx[2]) {
    				set_input_value(input1, /*num*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function isSafe(grid, row, col, num) {
    	for (let d = 0; d < grid.length; d++) {
    		if (grid[row][d] == num) {
    			return false;
    		}
    	}

    	for (let r = 0; r < grid.length; r++) {
    		if (grid[r][col] == num) {
    			return false;
    		}
    	}

    	let sqrt = Math.floor(Math.sqrt(grid.length));
    	let boxRowStart = row - row % sqrt;
    	let boxColStart = col - col % sqrt;

    	for (let r = boxRowStart; r < boxRowStart + sqrt; r++) {
    		for (let d = boxColStart; d < boxColStart + sqrt; d++) {
    			if (grid[r][d] == num) {
    				return false;
    			}
    		}
    	}

    	return true;
    }

    function valid(arraySolution) {
    	// for (let i = 0; i < 9; ++i) {
    	//   for (let j = 0; j < 9; ++j) {
    	//     if (arraySolution[i][j] == 0) arraySolution[i][j] == 1;
    	//   }
    	// }
    	for (var y = 0; y < 9; ++y) {
    		for (var x = 0; x < 9; ++x) {
    			var value = arraySolution[y][x];

    			if (value) {
    				// Check the line
    				for (var x2 = 0; x2 < 9; ++x2) {
    					if (x2 != x && arraySolution[y][x2] == value) {
    						return false;
    					}
    				}

    				// Check the column
    				for (var y2 = 0; y2 < 9; ++y2) {
    					if (y2 != y && arraySolution[y2][x] == value) {
    						return false;
    					}
    				}

    				// Check the square
    				var startY = Math.floor(y / 3) * 3;

    				for (var y2 = startY; y2 < startY + 3; ++y2) {
    					var startX = Math.floor(x / 3) * 3;

    					for (x2 = startX; x2 < startX + 3; ++x2) {
    						if ((x2 != x || y2 != y) && arraySolution[y2][x2] == value) {
    							return false;
    						}
    					}
    				}
    			}
    		}
    	}

    	return true;
    }

    function solveSudoku(grid, n) {
    	let row = -1;
    	let col = -1;
    	let isEmpty = true;

    	for (let i = 0; i < n; i++) {
    		for (let j = 0; j < n; j++) {
    			if (grid[i][j] == 0) {
    				row = i;
    				col = j;
    				isEmpty = false;
    				break;
    			}
    		}

    		if (!isEmpty) {
    			break;
    		}
    	}

    	if (isEmpty) {
    		return true;
    	}

    	for (let num = 1; num <= n; num++) {
    		if (isSafe(grid, row, col, num)) {
    			grid[row][col] = num;

    			if (solveSudoku(grid, n)) {
    				return true;
    			} else {
    				grid[row][col] = 0;
    			}
    		}
    	}

    	return false;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sudoku2', slots, []);

    	let grid = [
    		[3, 0, 6, 5, 0, 8, 4, 0, 0],
    		[5, 2, 0, 0, 0, 0, 0, 0, 0],
    		[0, 8, 7, 0, 0, 0, 0, 3, 1],
    		[0, 0, 3, 0, 1, 0, 0, 8, 0],
    		[9, 0, 0, 8, 6, 3, 0, 0, 5],
    		[0, 5, 0, 0, 9, 0, 6, 0, 0],
    		[1, 3, 0, 0, 0, 0, 2, 5, 0],
    		[0, 0, 0, 0, 0, 0, 0, 7, 4],
    		[0, 0, 5, 2, 0, 6, 3, 0, 0]
    	];

    	let N = 9;
    	let bledy = 0;

    	if (solveSudoku(grid, N)) {
    		console.log(grid);
    		grid = grid;
    	} else document.write("no solution exists ");

    	let gridToPrint = [
    		[3, 0, 6, 5, 0, 8, 4, 0, 0],
    		[5, 2, 0, 0, 0, 0, 0, 0, 0],
    		[0, 8, 7, 0, 0, 0, 0, 3, 1],
    		[0, 0, 3, 0, 1, 0, 0, 8, 0],
    		[9, 0, 0, 8, 6, 3, 0, 0, 5],
    		[0, 5, 0, 0, 9, 0, 6, 0, 0],
    		[1, 3, 0, 0, 0, 0, 2, 5, 0],
    		[0, 0, 0, 0, 0, 0, 0, 7, 4],
    		[0, 0, 5, 2, 0, 6, 3, 0, 0]
    	];

    	let gridToSolve = [
    		[3, 0, 6, 5, 0, 8, 4, 0, 0],
    		[5, 2, 0, 0, 0, 0, 0, 0, 0],
    		[0, 8, 7, 0, 0, 0, 0, 3, 1],
    		[0, 0, 3, 0, 1, 0, 0, 8, 0],
    		[9, 0, 0, 8, 6, 3, 0, 0, 5],
    		[0, 5, 0, 0, 9, 0, 6, 0, 0],
    		[1, 3, 0, 0, 0, 0, 2, 5, 0],
    		[0, 0, 0, 0, 0, 0, 0, 7, 4],
    		[0, 0, 5, 2, 0, 6, 3, 0, 0]
    	];

    	let b;
    	let num;

    	function solve() {
    		// document.getElementById("rozw").innerHTML =
    		$$invalidate(1, gridToPrint = grid);
    	}

    	function changeVal(x, y, thisDiv) {
    		if (num > 0 && num < 10 && !thisDiv.hasAttribute("po")) {
    			console.log(num);
    			gridToSolve[y][x] = num;
    			console.log(grid);

    			if (gridToSolve[y][x] === grid[y][x]) {
    				thisDiv.innerText = num;
    				thisDiv.classList.add("text-green-500");
    				thisDiv.setAttribute("po", "tak");
    			} else {
    				$$invalidate(0, bledy++, bledy);
    			}

    			if (JSON.stringify(grid) === JSON.stringify(gridToSolve)) {
    				alert("Gratulacje, wygrałeś");
    				window.location.reload(true);
    			}

    			if (bledy == 10) {
    				alert("Przykro mi ale przegrałeś :(");
    				location.reload(true);
    			}

    			document.getElementById("inp").focus();
    			thisDiv.innerText = num;
    		}
    	}

    	let files = [];

    	async function sprawdz() {
    		const text = await files[0].text();
    		let json = JSON.parse(text);
    		let json1 = JSON.parse(text);
    		let json2 = JSON.parse(text);
    		console.log(json);
    		grid = await json;
    		$$invalidate(1, gridToPrint = json1);
    		gridToSolve = json2;
    		solveSudoku(grid, N);
    		$$invalidate(0, bledy = 0);
    		console.log(grid);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Sudoku2> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		files = this.files;
    		$$invalidate(3, files);
    	}

    	const change_handler = () => sprawdz();
    	const click_handler = (j, i, e) => changeVal(j, i, e.target);
    	const click_handler_1 = (j, i, e) => changeVal(j, i, e.target);
    	const click_handler_2 = (j, i, e) => changeVal(j, i, e.target);
    	const click_handler_3 = (j, i, e) => changeVal(j, i, e.target);
    	const click_handler_4 = (j, i, e) => changeVal(j, i, e.target);
    	const click_handler_5 = (j, i, e) => changeVal(j, i, e.target);
    	const click_handler_6 = (j, i, e) => changeVal(j, i, e.target);
    	const click_handler_7 = (j, i, e) => changeVal(j, i, e.target);

    	function input1_input_handler() {
    		num = to_number(this.value);
    		$$invalidate(2, num);
    	}

    	const click_handler_8 = () => solve();

    	$$self.$capture_state = () => ({
    		grid,
    		N,
    		bledy,
    		isSafe,
    		valid,
    		solveSudoku,
    		gridToPrint,
    		gridToSolve,
    		b,
    		num,
    		solve,
    		changeVal,
    		files,
    		sprawdz
    	});

    	$$self.$inject_state = $$props => {
    		if ('grid' in $$props) grid = $$props.grid;
    		if ('N' in $$props) N = $$props.N;
    		if ('bledy' in $$props) $$invalidate(0, bledy = $$props.bledy);
    		if ('gridToPrint' in $$props) $$invalidate(1, gridToPrint = $$props.gridToPrint);
    		if ('gridToSolve' in $$props) gridToSolve = $$props.gridToSolve;
    		if ('b' in $$props) b = $$props.b;
    		if ('num' in $$props) $$invalidate(2, num = $$props.num);
    		if ('files' in $$props) $$invalidate(3, files = $$props.files);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bledy,
    		gridToPrint,
    		num,
    		files,
    		solve,
    		changeVal,
    		sprawdz,
    		input0_change_handler,
    		change_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		input1_input_handler,
    		click_handler_8
    	];
    }

    class Sudoku2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sudoku2",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/routes/Jolka.svelte generated by Svelte v3.42.4 */

    const { console: console_1 } = globals;
    const file = "src/routes/Jolka.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (1:0)  <script>     // async function getData(){     //     let URL = "./krzyzowka.json"     //     let res = await fetch(URL);     //     res = await res.json()     //     return res     // }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0)  <script>     // async function getData(){     //     let URL = \\\"./krzyzowka.json\\\"     //     let res = await fetch(URL);     //     res = await res.json()     //     return res     // }",
    		ctx
    	});

    	return block;
    }

    // (77:4) {:then data}
    function create_then_block(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let each_value_1 = /*data*/ ctx[0].slowa;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*data*/ ctx[0].haslo;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex flex-col text-white m-5");
    			attr_dev(div0, "onload", "onLoadToPrint()");
    			add_location(div0, file, 77, 4, 1969);
    			attr_dev(div1, "class", "flex flex-row m-5");
    			add_location(div1, file, 90, 4, 2631);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value_1 = /*data*/ ctx[0].slowa;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0].haslo;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(77:4) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (84:16) {:else}
    function create_else_block(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			attr_dev(p, "class", "bg-transparent");
    			attr_dev(p, "id", /*slowo*/ ctx[8].slowo);
    			add_location(p, file, 84, 100, 2487);
    			attr_dev(div, "class", "flex flex-row justify-center items-center w-10 h-10 bg-gray-600 border");
    			add_location(div, file, 84, 16, 2403);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(84:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (82:16) {#if slowo.haslo == i}
    function create_if_block(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			attr_dev(p, "class", "bg-transparent");
    			attr_dev(p, "id", /*slowo*/ ctx[8].slowo);
    			add_location(p, file, 82, 100, 2307);
    			attr_dev(div, "class", "flex flex-row justify-center items-center w-10 h-10 bg-gray-800 border");
    			add_location(div, file, 82, 16, 2223);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(82:16) {#if slowo.haslo == i}",
    		ctx
    	});

    	return block;
    }

    // (81:12) {#each slowo.slowo as litera,i}
    function create_each_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*slowo*/ ctx[8].haslo == /*i*/ ctx[12]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(81:12) {#each slowo.slowo as litera,i}",
    		ctx
    	});

    	return block;
    }

    // (79:8) {#each data.slowa as slowo}
    function create_each_block_1(ctx) {
    	let div;
    	let t;
    	let each_value_2 = /*slowo*/ ctx[8].slowo;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "flex justify-start flex-row");
    			add_location(div, file, 79, 8, 2081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value_2 = /*slowo*/ ctx[8].slowo;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(79:8) {#each data.slowa as slowo}",
    		ctx
    	});

    	return block;
    }

    // (92:8) {#each data.haslo as litera}
    function create_each_block(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			attr_dev(p, "class", "bg-transparent");
    			attr_dev(p, "id", /*litera*/ ctx[5]);
    			add_location(p, file, 92, 94, 2794);
    			attr_dev(div, "class", "flex flex-row justify-center items-center w-10 h-10 bg-yellow-700 border");
    			add_location(div, file, 92, 8, 2708);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(92:8) {#each data.haslo as litera}",
    		ctx
    	});

    	return block;
    }

    // (75:18)          loading     {:then data}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("loading");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(75:18)          loading     {:then data}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 0
    	};

    	handle_promise(/*data*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "flex flex-col justify-evenly flex-wrap");
    			add_location(div, file, 73, 0, 1856);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
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

    function getRandomIntInt(min, max) {
    	min = Math.ceil(min);
    	max = Math.floor(max);
    	return Math.floor(Math.random() * (max - min)) + min;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Jolka', slots, []);

    	const data = {
    		"slowa": [
    			{ "slowo": "react", "haslo": 0 },
    			{ "slowo": "javascript", "haslo": 9 },
    			{ "slowo": "python", "haslo": 4 },
    			{ "slowo": "tailwind", "haslo": 1 },
    			{ "slowo": "bootstrap", "haslo": 8 },
    			{ "slowo": "angular", "haslo": 0 },
    			{ "slowo": "html", "haslo": 2 },
    			{ "slowo": "django", "haslo": 4 }
    		],
    		"haslo": "program"
    	};

    	let wordsToPrint = [];

    	function onLoadToPrint() {
    		let a = 0;

    		data.slowa.forEach(item => {
    			let tabWithRngPos = [];
    			wordsToPrint.push(item.slowo);
    			wordsToPrint[a] = wordsToPrint[a].split('');
    			for (let i = 0; i < item.slowo.length; i++) wordsToPrint[a][i] = "-";
    			let iOfR = 0;

    			while (iOfR != 3) {
    				let temp = getRandomIntInt(0, item.slowo.length);

    				if (!tabWithRngPos.includes(temp) && temp != item.haslo) {
    					tabWithRngPos.push(temp);
    					iOfR++;
    				}
    			}

    			console.log(tabWithRngPos);
    			for (let i = 0; i < item.slowo.length; i++) tabWithRngPos = [];
    			a++;
    		});

    		console.log(wordsToPrint);
    	}

    	let guess;

    	function checkWord() {
    		data.slowa.forEach(item => {
    			if (item.slowo == guess) ;
    		});
    	}

    	onLoadToPrint();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Jolka> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		data,
    		wordsToPrint,
    		getRandomIntInt,
    		onLoadToPrint,
    		guess,
    		checkWord
    	});

    	$$self.$inject_state = $$props => {
    		if ('wordsToPrint' in $$props) wordsToPrint = $$props.wordsToPrint;
    		if ('guess' in $$props) guess = $$props.guess;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class Jolka extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jolka",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.4 */

    function create_fragment(ctx) {
    	let tailwindcss;
    	let t0;
    	let header;
    	let t1;
    	let router;
    	let t2;
    	let footer;
    	let current;
    	tailwindcss = new Tailwindcss({ $$inline: true });
    	header = new Header({ $$inline: true });

    	router = new Router({
    			props: {
    				routes: {
    					"/": Home,
    					"/gallery": Gallery,
    					"/shop": Shop,
    					"/contact": Contact,
    					"/TicTacToe": TicTacToe,
    					"/lottery": Lottery,
    					"/country": Country,
    					"/quiz": Quiz,
    					"/cars": Cars,
    					"/sudoku": Sudoku,
    					"/sudoku2": Sudoku2,
    					"/jolka": Jolka,
    					"*": NotFound
    				}
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(tailwindcss.$$.fragment);
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(router.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwindcss, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(router, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwindcss.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwindcss.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwindcss, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Gallery,
    		Router,
    		Home,
    		NotFound,
    		Tailwindcss,
    		Header,
    		Footer,
    		Shop,
    		Contact,
    		Lottery,
    		TicTacToe,
    		Country,
    		Quiz,
    		Cars,
    		Sudoku,
    		Sudoku2,
    		Jolka
    	});

    	return [];
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

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
