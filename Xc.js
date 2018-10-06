(function(window, document, undefined){
    // 兼容requestAnimationFrame
    window.requestAnimationFrame = window.requestAnimationFrame || function (fn) {
        return setTimeout(fn, 1000 / 60);
    };
    // 兼容cancelAnimationFrame
    window.cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;
    // 兼容getElementsByClassName
    if(!document.getElementsByClassName){
        document.getElementsByClassName = function(eleName){
            var ele = document.getElementsByTagName('*')
                eleAry = []
                reg = new RegExp('\\b'+eleName+'\\b');
            for (var i = 0, len = ele.length; i < len; i++){
                if(reg.test(ele[i].className)){
                    eleAry.push(ele[i])
                }
            }
            return eleAry
        }
    }

    // 兼容getElementsByClassName
    if(!document.querySelectorAll){
        document.querySelectorAll = function(str){
            var style = document.createElement('style'),
                elements = [],
                element = null;
            document.__xc = []
            var head = document.documentElement.firstChild;
            head.appendChild(style);
            style.styleSheet.cssText = str + '{xc: expression(document.__xc && document.__xc.push(this))}';
            window.scrollBy(0,0)
            style.parentNode.removeChild(style)

            while (document.__xc.length) {
                element = document.__xc.shift()
                element.style.removeAttribute("xc")
                elements.push(element)
            }
            document.__xc = null;
            return elements
        }
    }

    // 兼容trim
    if(!String.prototype.trim){
        String.prototype.trim = function(){
            return this.replace(/^\s+|\s+$/g,"")
        }
    }

    // 内部方法 用于存储事件函数
    var _addEventFn = function(obj){
        if(typeof obj.dom.events === 'undefined'){
            obj.dom.events = {}
            obj.dom.events[obj.type] = [obj.fn]
        }else if(obj.dom.events[obj.type] instanceof Array){
            // 这是事件已经存过了
            obj.dom.events[obj.type].push(obj.fn)
        }else{
            obj.dom.events[obj.type] = [obj.fn]
        }
        obj.dom.events[obj.type].origin = obj.origin
    }

    // 处理事件修饰符 事件指令 事件冒泡和事件默认行为
    var _eventModifiers = function(arr, e){
        Xc.Each(arr, function(k, i){
            if(k === 'stop'){
                if(e.stopPropagation){
                    e.stopPropagation()
                }else{
                    e.cancelBubble = true
                }
            }else if(k === 'prevent'){
                if(e.preventDefault){
                    e.preventDefault()
                }else{
                    e.returnValue = false
                }
            }
        })
    }

    // 解绑事件函数
    var _removeEvent = function(obj, type, fn){
        if(obj.removeEventListener){
            obj.removeEventListener(type, fn)
        }else if(obj.detachEvent){
            obj.detachEvent('on'+type, fn)
        }
    }

    var domReadyEvent = [];
    // Xc类
    var Xc = function(str){

        if(typeof str === 'function'){
            domReadyEvent.push(str)
        }else{
            return new Xc.prototype.init(str)
        }
    }



    // 静态类数组转数组
    Xc.toArray = function(o){
        return Array.prototype.slice.call(o);
    }

    // 遍历方法
    Xc.Each = function(o, fn, that){
        for (var i = 0, len = o.length; i < len; i++) {
            var flag = fn.call(that || o[i], o[i], i, o)
            if(flag === 'false'){
                break;
            }else if(flag === 'true'){
                continue;
            }
        }
    }

    // 判断数据类型 
    Xc.type = function(o){
        var _toString = Object.prototype.toString;

        var _type = {
            "undefined": "undefined",
            "number": "number",
            "boolean": "boolean",
            "string": "string",
            "symbol": "symbol",
            "[object Array]": "array",
            "[object Function]": "function",
            "[object RegExp]": "regexp",
            "[object Math]": "math",
            "[object Date]": "date",
            "[object Error]": "error",
            "[object Null]": "null",
            "[object Object]": "object"
        }

        return _type[typeof o] || _type[_toString.call(o)] || (o ? "object" : "null")
    }

    Xc.prototype = {
        constructor: Xc,
        // 用于保存一次节点记录
        prevNode: null,
        init: function(select){

            var o = {
                html: function(){
                    var div = document.createElement('div')
                    div.innerHTML = select
                    return div.children
                },
                id: function(){
                    var o = document.getElementById(select.slice(1));
                    return o === null ? [] : [o];
                },
                className: function(){
                    return document.getElementsByClassName(select.slice(1))
                },
                tagName: function(){
                    return document.getElementsByTagName(select)
                },
                css3: function(){
                    document.querySelectorAll(select)
                }
            }

            function f(select){
                if(/^</.test(select)){
                    return 'html'
                }else if(/[~+>\s]/.test(select)){
                    return 'css3'
                }else if(/^\./.test(select)){
                    return 'className'
                }else if(/^#/.test(select)){
                    return 'id'
                }else if(/^[\w]+$/.test(select)){
                    return 'tagName'
                }
            }


            if(typeof select === "object"){
                arr = [select]
            }else if(typeof select === "string"){
                select = select.trim()
                arr = o[f(select)]()
                // arr = Xc.toArray(o[f(select)]())
            }

            Xc.Each(arr, function(v, i){
                this[i] = v
            }, this)
            this.length = arr.length
        },
        // 绑定事件
        on: function(eventType, fn){
            // 处理有事件修饰符的情况
            var arr = eventType.split(/\./),
                type = arr.shift();

            if(arguments.length === 0) return

            for (var i = 0, len = this.length; i < len; i++) {
                (function(i){

                    var that = this[i]

                    // 判断滚轮事件
                    if(type === 'mousewheel'){
                        // 滚轮事件兼容
                        var f = function(e){
                            _eventModifiers(arr, e)
                            e.wheelD = e.wheelDelta / 120 || e.detail / -3;
                            fn.call(that, e)
                        }
                        f.fn = fn
                        if(that.addEventListener){
                            that.addEventListener(
                                that.onmousewheel === null ? 'mousewheel' : 'DOMMouseScroll', 
                                f, 
                                false)                            
                        }else if(that.attachEvent){
                            that.attachEvent('on'+type, f)
                        }
                    }else{ 
                        //非滚轮事件
                        var f = function(e){
                            _eventModifiers(arr, e)
                            fn.call(that, e)
                        }
                        f.fn = fn

                        if(that.addEventListener){
                            that.addEventListener(type, f, false)                            
                        }else if(that.attachEvent){
                            that.attachEvent('on'+type, f)
                        }
                    }
                    // 把事件函数存起来  用于off方法遍历解绑
                    _addEventFn({
                        dom: that,
                        type: type,
                        fn: f,
                        origin: eventType
                    })

                }).call(this, i)
            }
            return this
        },
        // 解绑事件
        off: function(type, fn){
            if(arguments.length <= 0) return

            var isFn = typeof fn === 'function';

            for(var i = 0, len = this.length; i < len; i++){
                var domEventArr = this[i].events[type],
                    that = this[i]
                // 不存在事件类型 不需要解绑
                if(!domEventArr) return

                for (var j = domEventArr.length - 1; j >= 0; j--) {
                    if(type === 'mousewheel'){
                        if(isFn){
                            if(domEventArr[j].fn === fn){
                                _removeEvent(
                                    that, 
                                    that.onmousewheel === null ? 'mousewheel' : 'DOMMouseScroll', 
                                    domEventArr[j]
                                )
                            }
                        }else{
                            _removeEvent(
                                that, 
                                that.onmousewheel === null ? 'mousewheel' : 'DOMMouseScroll', 
                                domEventArr[j]
                            )
                        }
                    }else{ //普通事件
                        if(isFn){
                            if(domEventArr[j].fn === fn){
                                _removeEvent(
                                    that, 
                                    type, 
                                    domEventArr[j]
                                )
                            }
                        }else{
                            _removeEvent(
                                that, 
                                type, 
                                domEventArr[j]
                            )
                        }
                    }
                    domEventArr.splice(j, 1)
                }
            }
            return this
        },
        // 一次性事件
        one: function(eventType, fn){
            // 处理有事件修饰符的情况
            var arr = eventType.split(/\./),
                type = arr.shift();

            if(arguments.length !== 2) return

            for (var i = 0, len = this.length; i < len; i++) {
                (function(i){

                    var that = this[i]

                    // 判断滚轮事件
                    if(type === 'mousewheel'){
                        // 滚轮事件兼容
                        var f = function(e){
                            _eventModifiers(arr, e)
                            e.wheelD = e.wheelDelta / 120 || e.detail / -3;
                            fn.call(that, e)
                            Xc(that).off(type, fn)
                        }
                        f.fn = fn
                        if(that.addEventListener){
                            that.addEventListener(
                                that.onmousewheel === null ? 'mousewheel' : 'DOMMouseScroll', 
                                f, 
                                false)                            
                        }else if(that.attachEvent){
                            that.attachEvent('on'+type, f)
                        }
                    }else{ 
                        //非滚轮事件
                        var f = function(e){
                            _eventModifiers(arr, e)
                            fn.call(that, e)
                            Xc(that).off(type, fn)
                        }
                        f.fn = fn

                        if(that.addEventListener){
                            that.addEventListener(type, f, false)
                        }else if(that.attachEvent){
                            that.attachEvent('on'+type, f)
                        }
                    }
                    // 把事件函数存起来  用于off方法遍历解绑
                    _addEventFn({
                        dom: that,
                        type: type,
                        fn: f,
                        origin: eventType
                    })

                }).call(this, i)
            }
            return this
        },
        // 遍历
        each: function(fn){
            Xc.Each(this, function(v, i, s){
                var flag = fn.call(v, v, i, s)
                if(flag !== 'undefined'){
                    return flag
                }
            })
        },
        // val --》 value
        val: function(v){
            if(Xc.type(v) === 'undefined'){
                try {
                    var val = this[0].value
                } catch (e) {
                    throw Error("只有表单对象才有value")
                }
                return val
            }else{
                this.each(function(k, i){
                    k.value = v
                })
                return this
            }
        },
        // html --> innerHTML
        html: function(v){
            if(Xc.type(v) === 'undefined'){
                try {
                    var val = this[0].innerHTML
                } catch (e) {
                    throw Error("对象的innerHTML不存在，请检查html()前的对象")
                }
                return val
            }else{
                this.each(function(k, i){
                    try {
                        k.innerHTML = v
                    } catch (e) {
                        throw Error("对象的innerHTML不存在，请检查html()前的对象")
                    }                    
                })
                return this
            }
        },
        // text --> innerText
        text: function(v){
            if(Xc.type(v) === 'undefined'){
                try {
                    var val = this[0].innerText
                } catch (e) {
                    throw Error("对象的innerText不存在，请检查text()前的对象")
                }
                return val
            }else{
                this.each(function(k, i){
                    try {
                        k.innerText = v
                    } catch (e) {
                        throw Error("对象的innerText不存在，请检查text()前的对象")
                    }                    
                })
                return this
            }
        },
        // eq 筛选对象 返回一个被Xc包装的对象
        eq: function(i){
            var len = this.length

            if(Xc.type(i) !== 'number' || i % 1 !== 0){
                throw Error("请确保值为整数或者下标在元素范围内")
            }
            i %= len
            if(i < 0){
                i += len
            }
            Xc.prototype.prevNode = new this.init(this)
            return new this.init(this[i])
        },
        // end 返回筛选之前的节点历史记录 
        end: function(){
            var obj = Xc.prototype.prevNode[0]
            Xc.prototype.prevNode = null
            return obj
        },
        // addClass添加类名
        addClass: function(eName){
            this.each(function(){
                var newArr = this.className.split(/\s/g).concat(eName.split(/\s/g)),
                    len = newArr.length;
                for (var i = 0; i < len; i++) {
                    for (var j = newArr.length - 1 ; j > i; j--) {
                        if(!newArr[j]){
                            newArr.splice(j, 1);
                        }
                        if(newArr[i] === newArr[j]){
                            newArr.splice(j, 1)
                        }
                    }
                };
                this.className = newArr.join(" ")
            })
            return this
        },
        // removeClass删除类名
        removeClass: function(eName){
            this.each(function(){
                var oldName = this.className.split(/\s/g),
                newName = eName.split(/\s/g),
                len = newName.length;
                for (var i = 0; i < len; i++) {
                    for (var j = oldName.length - 1; j >= 0; j--) {
                        if(oldName[j] === newName[i]){
                            oldName.splice(j, 1)
                        }
                    }
                }
                this.className = oldName.join(" ")
            })
            return this
        },
        // hasClass 判断类名是否存在 如果存在返回true 否则返回false
        hasClass: function(eName){
            var reg = new RegExp("\\b" + eName + "\\b")
            return reg.test(this[0].className)
        },
        // 类名存在就删除 不存在就添加
        toggleClass: function(eName){
            this.each(function(){
                var that = Xc(this)
                if(that.hasClass(eName)){
                    that.removeClass(eName)
                }else{
                    that.addClass(eName)
                }
            })
            
            return this
        },
        // 将前面的对象或元素插入到很后面
        appendTo: function(select){
            if(!select) return
            if(select instanceof Xc){
                // 本微型库包装的对象
                o = select
            }else{
                var o = Xc(select)
            }
            var event = []
            var target = this
            Xc.Each(o, function(k, i){
                var node = target[0].cloneNode(true)
                event.push(node)
                k.appendChild(node)
            })

            for (var key in target[0].events) {
                // key是事件类型
                Xc.Each(event, function(k){
                    // k是赋值后的node节点
                    Xc.Each(target[0].events[key], function(k2){
                        // k2是事件函数
                        Xc(k).on(target[0].events[key].origin, k2)
                    })
                })
            }
            return this
        },
        // 将后面的对象或元素插入到很前面
        append: function(select){
            if(!select) return
            if(select instanceof Xc){
                select.appendTo(this)
            }else{
                var node = Xc(select)[0];
                this.each(function(){
                    this.appendChild(node.cloneNode(true))
                })
            }
            return this
        },
        // 删除元素
        remove: function(select){
            // 可以不传
            // 传字符串选择器
            // object
            var type = Xc.type(select)

            if(type === 'undefined'){
                this.each(function(){
                    this.innerHTML = ""
                })
            }else if(type === 'string'){
                var o = Xc(select)

                this.each(function(k1){
                    o.each(function(k2){
                        k2.parentNode === k1 && k1.removeChild(k2)
                    })
                })
            }else if(type === 'object'){
                if(select instanceof Xc){
                    this.each(function(k1){
                        select.each(function(k2){
                            k2.parentNode === k1 && k1.removeChild(k2)
                        })
                    })
                }else{
                    if(select.length !== undefined){
                        this.each(function(k1){
                            for (var i = select.length - 1; i >= 0; i--) {
                                select[i].parentNode === k1 && k1.removeChild(select[i])
                            }
                        })
                    }else{
                        this.each(function(k1){
                            select.parentNode === k1 && k1.removeChild(select)
                        })
                    }
                }
            }
            return this
        },
        // css
        css: function(a, b){
            var type = Xc.type(a)
            var c =''
            if (type === 'string') {
                if(!!b){ //b存在
                    if(/width|height|top|right|bottom|left/i.test(a)){
                        !isNaN(b/1) && (c = 'px')
                    }
                    this.each(function(){
                        this.style[a] = b + c
                    })
                }else{ //b不存在
                    if(window.getComputedStyle){
                        return getComputedStyle(this[0])[a]
                    }else{
                        return this[0].currentStyle[a]
                    }
                }
            }else if(type=== 'object'){
                for (const key in a) {
                    this.css(key, a[key])
                }
            }
            return this
        },
        // 主要用来操作自定义标签属性 也可以操作合法标签属性
        attr: function(a, b){
            var type = Xc.type(a)
            if(type === 'string'){
                if(!!b){
                    this.each(function(){
                        this.setAttribute(a, b)
                    })
                }else{
                    return this[0].getAttribute(a)
                }
            }else if(type === 'object'){
                for (const key in a) {
                    this.attr(key, a[key])
                }
            }
            return this
        },
        // 操作合法标签属性
        prop: function(a, b){
            var type = Xc.type(a)
            if(type === 'string'){
                if(Xc.type(b) !== 'undefined'){
                    this.each(function(){
                        this[a] = b
                    })
                }else{
                    return this[0][a]
                }
            }else if(type === 'object'){
                for (const key in a) {
                    this.prop(key, a[key])
                }
            }
            return this
        },
        // 删除属性
        removeAttr: function(s){
            var type = Xc.type(s)
            if(type === 'undefined') return
            var arr = s.split(/\s/g);
            this.each(function(o){
                Xc.Each(arr, function(a){
                    o.removeAttribute(a)
                })
            })
            return this
        },
        index: function(str){
            /* 
             *  _Xc('#box').index()   #box在它父级的所有子元素里的序号
             *  _Xc('#box').index('div')   返回#box 在页面所有div集合中的序号
             *  _Xc('div').index(document.getElementId('box'))   在div集合中 返回一个#box的序号
             *  _Xc('div').index(_Xc('#box'))   同上 只是一个传原生对象 一个自定义构造对象
             * 
            */

            var type = Xc.type(str),
                index = -1;

            if(this.length === 0) return index;
            if(type === 'undefined'){
                Xc.Each(this[0].parentNode.children, function(v, i){
                    if(v === this){
                        index = i
                    }
                }, this[0])
            }else if(type === 'string'){
                var o = Xc(str)
                return o.index(this)
            }else if(type === 'object'){
                if(str instanceof Xc){
                    this.each(function(v, i){
                        if(this === str[0]){
                            index = i
                        }
                    })
                }else{
                    this.each(function(v, i){
                        if(v === str){
                            index = i
                        }
                    })
                }
            }
            return index
        },
        animate: function(json, time, easing, callback){
            /*
            处理参数：
                - 得到初始值 和 目标值 ， 得到变化量，并且用{}存起来
                - 删除初始值与目标值相同的属性
                - 检查当前运动曲线是否有值，没有值就设置默认值
                - 检查是否有回调函数
                - 检查是否有不能加 px 的属性
            在IE低版本，如果不在css写属性时，获取的默认是会是auto
            */
            if(this.length >= 2 || this.length === 0) return
            var ele = this[0],
                startValue = {},
                changeValue = {},
                date = null,
                eleStyle = ele.currentStyle || getComputedStyle(ele),
                arrNoPxAttr = ["z-index", "zIndex", "opacity"],
                Tween = {
                    linear: function (t, b, c, d) {  //匀速
                        return c * t / d + b;   //  t/d = prop;
                    },
                    easeIn: function (t, b, c, d) {  //加速曲线
                        return c * (t /= d) * t + b;
                    },
                    easeOut: function (t, b, c, d) {  //减速曲线
                        return -c * (t /= d) * (t - 2) + b;
                    },
                    easeBoth: function (t, b, c, d) {  //加速减速曲线
                        if ((t /= d / 2) < 1) {
                            return c / 2 * t * t + b;
                        }
                        return -c / 2 * ((--t) * (t - 2) - 1) + b;
                    },
                    easeInStrong: function (t, b, c, d) {  //加加速曲线
                        return c * (t /= d) * t * t * t + b;
                    },
                    easeOutStrong: function (t, b, c, d) {  //减减速曲线
                        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                    },
                    easeBothStrong: function (t, b, c, d) {  //加加速减减速曲线
                        if ((t /= d / 2) < 1) {
                            return c / 2 * t * t * t * t + b;
                        }
                        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
                    },
                    elasticIn: function (t, b, c, d, a, p) {  //正弦衰减曲线（弹动渐入）
                        if (t === 0) {
                            return b;
                        }
                        if ((t /= d) === 1) {
                            return b + c;
                        }
                        if (!p) {
                            p = d * 0.3;
                        }
                        if (!a || a < Math.abs(c)) {
                            a = c;
                            var s = p / 4;
                        } else {
                            var s = p / (2 * Math.PI) * Math.asin(c / a);
                        }
                        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                    },
                    elasticOut: function (t, b, c, d, a, p) {    //正弦增强曲线（弹动渐出）
                        if (t === 0) {
                            return b;
                        }
                        if ((t /= d) === 1) {
                            return b + c;
                        }
                        if (!p) {
                            p = d * 0.3;
                        }
                        if (!a || a < Math.abs(c)) {
                            a = c;
                            var s = p / 4;
                        } else {
                            var s = p / (2 * Math.PI) * Math.asin(c / a);
                        }
                        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
                    },
                    elasticBoth: function (t, b, c, d, a, p) {
                        if (t === 0) {
                            return b;
                        }
                        if ((t /= d / 2) === 2) {
                            return b + c;
                        }
                        if (!p) {
                            p = d * (0.3 * 1.5);
                        }
                        if (!a || a < Math.abs(c)) {
                            a = c;
                            var s = p / 4;
                        }
                        else {
                            var s = p / (2 * Math.PI) * Math.asin(c / a);
                        }
                        if (t < 1) {
                            return - 0.5 * (a * Math.pow(2, 10 * (t -= 1)) *
                                Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                        }
                        return a * Math.pow(2, -10 * (t -= 1)) *
                            Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
                    },
                    backIn: function (t, b, c, d, s) {     //回退加速（回退渐入）
                        if (typeof s === 'undefined') {
                            s = 1.70158;
                        }
                        return c * (t /= d) * t * ((s + 1) * t - s) + b;
                    },
                    backOut: function (t, b, c, d, s) {
                        if (typeof s === 'undefined') {
                            s = 3.70158;  //回缩的距离
                        }
                        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
                    },
                    backBoth: function (t, b, c, d, s) {
                        if (typeof s === 'undefined') {
                            s = 1.70158;
                        }
                        if ((t /= d / 2) < 1) {
                            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                        }
                        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
                    },
                    //弹球减振（弹球渐出）
                    bounceIn: function (t, b, c, d) {
                        return c - Tween['bounceOut'](d - t, 0, c, d) + b;
                    },
                    bounceOut: function (t, b, c, d) {
                        if ((t /= d) < (1 / 2.75)) {
                            return c * (7.5625 * t * t) + b;
                        } else if (t < (2 / 2.75)) {
                            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
                        } else if (t < (2.5 / 2.75)) {
                            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
                        }
                        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
                    },
                    bounceBoth: function (t, b, c, d) {
                        if (t < d / 2) {
                            return Tween['bounceIn'](t * 2, 0, c, d) * 0.5 + b;
                        }
                        return Tween['bounceOut'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
                    }
                };
            easing = easing || "easeBoth"; //对速度曲线做处理
            for (var key in json) {
                // 0 1  auto
                var val = parseFloat(eleStyle[key]);
                // isNaN();  是NaN会返回true,不是NaN时返回false
                startValue[key] = isNaN(val) ? 1 : val;
                changeValue[key] = parseFloat(json[key]) - startValue[key];//变化量
                if (changeValue[key] === 0) {
                    delete startValue[key];
                    delete changeValue[key];
                    delete json[key];
                }
            }
            date = new Date();
            (function running() {
                var nowDate = new Date() - date; //得到当前的时间
                if (nowDate >= time) {
                    nowDate = time; //强行当前时间为总时间
                } else {
                    requestAnimationFrame(running);
                }
                for (var key in json) {
                    //计算当前的值
                    var val = Tween[easing](nowDate, startValue[key], changeValue[key], time),
                        isPx = false;
                    //arrNoPxAttr = ["z-index", "zIndex", "opacity"],
                    for (var i = 0; i < arrNoPxAttr.length; i++) {
                        if (key === arrNoPxAttr[i]) {
                            //能进来一定是key灯油数组里的某一项
                            isPx = true;
                            break;
                        }
                    }

                    //当前的变量为true就不加单位，反之添加单位
                    ele.style[key] = val + (isPx ? "" : "px");

                    if (key === "opacity") {
                        ele.style.filter = "alpha(opacity=" + val * 100 + ")";
                    }
                }
                if (nowDate >= time) {
                    callback && callback.call(ele);
                }
            }());
            return this
        }
    }



    // Object.setPrototypeOf(arr, Xc.prototype)
    Xc.prototype.init.prototype = Xc.prototype
    


    // domReady IIFE
    ;(function(w, d){
        var done = false,
            init = function(){
                if(!done){
                    Xc.Each(domReadyEvent, function(){
                        this()
                    })
                    domReadyEvent.length = 0;
                }
            };
        // 监听dom结构是否可用 不兼容IE678
        Xc(d).one("DOMContentLoaded", init)

        f();
        function f(){
            try {
                d.documentElement.doScroll("left")
            } catch (error) {
                setTimeout(f)
                return
            }
            init()
        }
        d.onreadyStatechange = function(){
            if(d.readyState === 'complete'){
                d.onreadystatechange = null
                init()
            }
        }
        w.onload = function(){
            w.onload = null
            init()
        }
    })(window, document)


    // nick
    ;(function(){
        Xc("script").each(function(){
            var v = this.getAttribute("nick")
            if(v){
                window[v] = Xc
            }
        })
    })()


    window._Xc = Xc
    

})(window, document)