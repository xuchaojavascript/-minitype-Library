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
    <script nick="$" src="Fy.js"></script>
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

