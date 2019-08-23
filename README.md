# -minitype-Library
本类库为模仿JQuery类库开发的微型类库

# 语法的用法以及修改
在jquery中，我们使用的为 $(selector) 来选择元素或者创建元素等操作。而在本微型库中，我们使用 _Xc(selector) 来代替，当然我们也可以在script标签中的nick属性来设置其用法
默认：
    <script src="Fy.js"></script>
    <script>
   		_Xc(select)
    </script>
修改语法：
    <script nick="$" src="Xc.js"></script>
    <script>
   		$(select)
    </script>

# _Xc(select) 
    选择器选择
        _Xc("p")  //选择所有p标签
        _Xc("#wrap")  //选择id为wrap的标签
        _Xc(".box")  //选择class为.box的标签
        _Xc("#wrap div") //选择id为wrap的标签下的div元素

    创建标签
        _Xc("<p></p>") //创建一个p标签

    包装对象
        _Xc(document.getElementById('box')) // 将id为box元素变为类库包装对象，使其方便使用类库方法
    IIFE自执行
        _Xc(function(){
            // 将代码放到这里可以使函数在DOM渲染后自执行
        })

# .on(type， fn)  绑定事件
    在这里，实现了对于事件的二级绑定，例：
        _Xc(".box").on('click', function(){})
    同时，为了实现阻止冒泡行为与阻止默认行为 本方法模仿vue指令的来实现了对这两个事件的阻止， 例：
        _Xc(".box").on('click.stop.prevent', function(){})
    要实现阻止，只需在type后面点就行  stop为阻止冒泡行为  prevent阻止默认行为
    （在本方法中，你无须考虑兼容性，本方法已经兼容了IE5及其以上版本和其它大部分浏览器，不管是火狐的滚轮事件还是IE的监听和冒泡或默认行为）
# .off(type, fn) 解绑事件
    _Xc(".box").off('click', function(){})

# .one(type， fn)  一次性事件
    _Xc(".box").one('click', function(){})
# .each(fn)  遍历元素
    _Xc("div").each(fucntion(){})
# .val(v)  获取value值
    _Xc("input").val() 这里将获取input第一个value值
    _Xc("input").val('aaa') 这里将设置所有input标签value值为aaa
    本方法是与DOM元素的.value一样，同时，本方法与jquery的原则也相同，都遵循get-->first set-->all的规则（下面也将相同）
# .html(v)  innerHTML
    本方法与innerHTML相同 
# .text(v)  一次性事件
    本方法与innerText相同 
# .eq(i)  筛选对象 返回一个被Xc包装的对象
    _Xc('input').eq(1)  //获取第二个input标签
# .end()  返回筛选之前的节点历史记录 
    _Xc('input').eq(1).end() //返回_Xc('input') 也就是筛选之前的集合
# .addClass(eName)  添加类名
    _Xc('#box').addClass('aaa') // #box对象class属性添加aaa
# .removeClass(eName)  删除类名
    _Xc('#box').removeClass('aaa') // #box对象class属性删除aaa
# .hasClass(eName)  检测类名是否存在
    _Xc('#box').hasClass('aaa') // #box对象class属性是否有aaa 有则放回true 反之false 
# .toggleClass(eName)  有则添加，没有则不添加
    _Xc('#box').toggleClass('aaa') // #box对象class属性有aaa则删除 无则添加
# .appendTo(select)  将前面的对象或元素插入到很后面
    _Xc('#box').appendTo('div') // 将#box元素添加到所有div标签中
# .append(select)  将后面的对象或元素插入到很前面
    _Xc('#box').append('div') // 将#box元素中添加div标签
# .remove(select)  删除元素
    _Xc('#box').append() //删除#box元素
# .css(a, b)  获取单个元素
     _Xc('#box').css('width') //获取#box 的宽度
     _Xc('#box').css('width', '200') //设置#box 的宽度为 100px
     _Xc('#box').css({
         width: 100,
         height: 200
     })                 //以对象的形式来设置#box的多条样式
# .attr(a, b)  // 主要用来操作自定义标签属性 也可以操作合法标签属性
    _Xc('#box').attr('xc') //获取#box 的属性名为 xc 的值
    _Xc('#box').attr('xc', 'aaa') //设置#box 的属性名 xc 并赋值为 aaa
# .prop(a, b)  操作合法标签属性
    _Xc('#input').attr('checked') //获取#input 的属性名为 checked 的值
    _Xc('#input').attr('checked', 'true') //设置#box 的属性名 checked 并赋值为 true
# .removeAttr(s)  删除属性
    _Xc('#input').removeAttr('checked') //删除#input 的属性checked
# .index(str)  获取单个元素
    _Xc('#box').index()   #box在它父级的所有子元素里的序号
    _Xc('#box').index('div')   返回#box 在页面所有div集合中的序号
    _Xc('div').index(document.getElementId('box'))   在div集合中 返回一个#box的序号
    _Xc('div').index(_Xc('#box'))   同上 只是一个传原生对象 一个自定义构造对象
# .animate(json, time, easing, callback)  动画
    _Xc('#box').animate({
        width: 200px,
        height: 500px
    }, 1000, linear, function(){})
    json：需要改变的样式属性（key）及其目标值（value） 组成的对象
    time：运动时间，毫秒为单位
    easing：运动方式 取值为(linear, easeIn, easeOut, easeBoth, easeInStrong, easeOutStrong, easeBothStrong, elasticIn, elasticOut, elasticBoth, backIn, backOut, backBoth, bounceIn, bounceOut, bounceBoth)
    callback：执行完动画后的回调函数

