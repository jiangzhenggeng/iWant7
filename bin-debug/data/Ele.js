var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var Ele = (function (_super) {
    __extends(Ele, _super);
    function Ele(num, indexX, indexY) {
        var _this = _super.call(this) || this;
        // 容器
        _this.sprite = new egret.Sprite();
        // 用于布局
        _this.baseHeight = 220;
        _this.num = num;
        _this.indexX = indexX;
        _this.indexY = indexY;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Ele.prototype.onAddToStage = function (event) {
        this.drawEle();
    };
    // 绘制一个元素
    Ele.prototype.drawEle = function () {
        //   |----50----|-15-|--80--|6|--80--|6|--80--|6|--80--|6|--80--|6|--80--|-15-|----50----|
        var shp = new egret.Shape();
        // bg inner borderWidth border text textsize
        var style = {
            0: [0x5e5e5e, 0x5e5e5e, 6, 0xcdcdcd, 0xcdcdcd, 60],
            1: [0xf9dbff, 0xae6cc6, 3, 0xfbfffb, 0xf9dbff, 46],
            2: [0xdbffc3, 0x79aa4e, 3, 0xfbfffb, 0xdbffc3, 46],
            3: [0xbbe5fd, 0x468cca, 3, 0xfbfffb, 0xbbe5fd, 46],
            4: [0xbbe5fd, 0xbbe5fd, 3, 0xfbfffb, 0x4a86c4, 55],
            5: [0xdbffc3, 0xdbffc3, 3, 0xfbfffb, 0x7bae51, 55],
            6: [0xf9dbff, 0xf9dbff, 3, 0xfbfffb, 0xaa6cc1, 55],
            7: [0xfb5944, 0xfb5944, 8, 0xfbfffb, 0xfbfffb, 63],
            8: [0xfb5944, 0xfb5944, 8, 0xf9da5f, 0xfbfffb, 63],
            9: [0xf3ae3d, 0xf3ae3d, 8, 0xf9da5f, 0xfbfffb, 63] // 三重合并的7
        };
        // 绘制元素背景
        shp.graphics.beginFill(style[this.num][0], 1);
        shp.graphics.lineStyle(style[this.num][2], style[this.num][3]);
        // shp.graphics.drawRoundRect(65 + 86 * this.indexX, this.baseHeight + 86 * this.indexY, 80, 80, 40);
        shp.graphics.drawRoundRect(0, 0, 80, 80, 40);
        shp.graphics.endFill();
        // 绘制元素小圆圈
        shp.graphics.beginFill(style[this.num][1], 1);
        shp.graphics.lineStyle(0, 0xffffff);
        // shp.graphics.drawCircle(65 + 86 * this.indexX + 40, this.baseHeight + 86 * this.indexY + 40, 30);
        shp.graphics.drawCircle(40, 40, 30);
        shp.graphics.endFill();
        this.sprite.addChild(shp);
        // 绘制文字
        var label = new egret.TextField();
        label.size = style[this.num][5];
        label.width = 80;
        label.height = 80;
        label.x = 0;
        label.y = 5; // 用于真机适配的微调
        label.textColor = style[this.num][4];
        // label.fontFamily = "YaHei";
        label.textAlign = egret.HorizontalAlign.CENTER;
        label.verticalAlign = egret.VerticalAlign.MIDDLE;
        if (this.num == 8 || this.num == 9) {
            label.text = "7";
        }
        else {
            label.text = this.num.toString();
        }
        this.sprite.addChild(label);
        // 位移
        this.sprite.x = 65 + 86 * this.indexX;
        this.sprite.y = this.baseHeight + 86 * this.indexY;
        this.addChild(this.sprite);
    };
    // 移动到指定位置，并记录matrix
    Ele.prototype.move = function (indexX, indexY, callback) {
        if (callback === void 0) { callback = null; }
        var distanceX = indexX - this.indexX;
        var distanceY = indexY - this.indexY;
        var distance = distanceX > distanceY ? distanceX : distanceY;
        Ele.matrix[this.indexX][this.indexY] = null;
        Ele.matrix[indexX][indexY] = this;
        this.indexX = indexX;
        this.indexY = indexY;
        console.log(Ele.matrix);
        // 自由落体
        var tw = egret.Tween.get(this.sprite);
        tw.to({
            x: 65 + 86 * indexX,
            y: this.baseHeight + 86 * indexY
        }, Math.sqrt(distance) * 200, egret.Ease.circIn);
        // 执行回调
        if (callback) {
            setTimeout(function () {
                callback();
            }, Math.sqrt(distance) * 200);
        }
        // 播放音效
        var downSound = RES.getRes("down_mp3");
        setTimeout(function () {
            downSound.play(0, 1);
        }, distance * 100 + 80);
    };
    // 只移动，无动画，且不计入matrix
    Ele.prototype.moveWithOutAnimation = function (indexX, indexY) {
        this.indexX = indexX;
        this.indexY = indexY;
        this.sprite.x = 65 + 86 * indexX;
        this.sprite.y = this.baseHeight + 86 * indexY;
    };
    // 下落到能下落的最低处
    Ele.prototype.down = function () {
        var indexY = Ele.getDownLocation(this);
        console.log(indexY);
        this.move(this.indexX, indexY);
    };
    // 创建新元素
    Ele.createPair = function (parent) {
        // 获取num1   0-6 随机数
        var num1 = Math.floor(Math.random() * 7);
        // 获取num2  num1+num2 != 7
        var num2 = Math.floor(Math.random() * 7);
        while (num1 + num2 == 7) {
            num2 = Math.floor(Math.random() * 7);
        }
        var curEle = [];
        var ele1 = Ele.create(num1, 2, 1);
        var ele2 = Ele.create(num2, 3, 1);
        curEle.push(ele1);
        curEle.push(ele2);
        // 添加到面板
        curEle.forEach(function (ele) {
            parent.addChild(ele);
        });
        return curEle;
    };
    Ele.create = function (num, indexX, indexY) {
        var ele = new Ele(num, indexX, indexY);
        // TODO 添加事件
        ele.touchEnabled = true;
        // ele.addEventListener( egret.TouchEvent.TOUCH_TAP, ele.remove, ele );
        ele.addEventListener(egret.TouchEvent.TOUCH_TAP, function () { return ele.changeTo7(true, false, true, false); }, ele);
        return ele;
    };
    Ele.prototype.remove = function () {
        this.alpha = 0;
        Ele.matrix[this.indexX][this.indexY] = null;
        // 该元素上方的元素下移
        for (var i = this.indexY - 1; i >= 0; i--) {
            // console.log("Ele.matrix.indexY:"+i);
            if (Ele.matrix[this.indexX][i]) {
                Ele.matrix[this.indexX][i].down();
            }
        }
    };
    // 转化为7
    Ele.prototype.changeTo7 = function (top, right, bottom, left) {
        var indexX = this.indexX;
        var indexY = this.indexY;
        Ele.matrix[indexX][indexY].alpha = 0;
        var curEle = this;
        var eleTop, eleRight, eleBottom, eleLeft;
        if (top) {
            eleTop = Ele.matrix[indexX][indexY - 1];
            Ele.matrix[indexX][indexY - 1].move(indexX, indexY);
        }
        if (right) {
            eleRight = Ele.matrix[indexX + 1][indexY];
            Ele.matrix[indexX + 1][indexY].move(indexX, indexY);
        }
        if (bottom) {
            eleBottom = Ele.matrix[indexX][indexY + 1];
            Ele.matrix[indexX][indexY + 1].move(indexX, indexY);
        }
        if (left) {
            eleLeft = Ele.matrix[indexX - 1][indexY];
            Ele.matrix[indexX - 1][indexY].move(indexX, indexY);
        }
        // 计算有几次合并
        var times = [top, right, bottom, left].filter(function (ele, index, array) {
            if (ele) {
                return true;
            }
            return false;
        });
        var newEle;
        switch (times.length) {
            case 1:
                newEle = Ele.create(7, indexX, indexY);
                break;
            case 2:
                // 双重7
                newEle = Ele.create(8, indexX, indexY);
                break;
            case 3:
                // 三重7
                newEle = Ele.create(8, indexX, indexY);
                break;
            default:
                newEle = Ele.create(8, indexX, indexY);
        }
        Main.vector.addChild(newEle);
        setTimeout(function () {
            // 原地移动，目的是为了记录matrix
            [curEle, eleTop, eleRight, eleBottom, eleLeft].forEach(function (ele) {
                if (ele) {
                    ele.alpha = 0;
                    ele = null;
                }
            });
            newEle.move(indexX, indexY);
            Ele.tidyColumn(indexX - 1);
            Ele.tidyColumn(indexX);
            Ele.tidyColumn(indexX + 1);
        }, 300);
    };
    // 清理某一列的空格
    Ele.tidyColumn = function (indexX) {
        // 记录可以放置的空位Y坐标
        var p1 = 8;
        // 记录当前空位上方有元素的最低点坐标
        var p2 = 8;
        while (1) {
            while (p1 >= 0 && Ele.matrix[indexX][p1] != null) {
                p1--;
            }
            p2 = p1 - 1;
            while (p2 >= 0 && Ele.matrix[indexX][p2] == null) {
                p2--;
            }
            if (p1 < 0 || p2 < 0) {
                break;
            }
            if (p1 >= 2 && p2 >= 0) {
                Ele.matrix[indexX][p2].move(indexX, p1);
            }
        }
    };
    // 点击变换
    Ele.transform = function (ele1, ele2) {
        // 同一行
        if (ele1.indexY == ele2.indexY) {
            if (ele1.indexX < ele2.indexX) {
                ele1.indexY -= 1;
                ele2.indexX -= 1;
            }
            else {
                ele2.indexY -= 1;
                ele1.indexX -= 1;
            }
        }
        else {
            // 最后一列单独考虑
            if (ele1.indexX == 5) {
                if (ele1.indexY < ele2.indexY) {
                    ele1.indexY += 1;
                    ele2.indexX -= 1;
                }
                else {
                    ele1.indexX -= 1;
                    ele2.indexY += 1;
                }
            }
            else {
                if (ele1.indexY < ele2.indexY) {
                    ele1.indexX += 1;
                    ele1.indexY += 1;
                }
                else {
                    ele2.indexX += 1;
                    ele2.indexY += 1;
                }
            }
        }
        ele1.moveWithOutAnimation(ele1.indexX, ele1.indexY);
        ele2.moveWithOutAnimation(ele2.indexX, ele2.indexY);
        var tapSound = RES.getRes("tap_mp3");
        tapSound.play(0, 1);
    };
    // 计算从初始状态下落的位置
    Ele.getDownLocation = function (ele) {
        // 初始化，只初始化一次
        if (Ele.matrix.length == 0) {
            for (var i = 0; i < 6; i++) {
                Ele.matrix[i] = [];
                for (var j = 0; j < 9; j++) {
                    Ele.matrix[i][j] = null;
                }
            }
        }
        // 查询落点位置
        var indexY = 8;
        console.log("ele.indexY:" + ele.indexY);
        for (var i = ele.indexY + 1; i < 9; i++) {
            console.log("i:" + i);
            // 如果当前位置有元素，则在上面一层放置
            if (Ele.matrix[ele.indexX][i]) {
                indexY = i - 1;
                break;
            }
            // 最底层
            if (i >= 8) {
                indexY = 8;
            }
        }
        return indexY;
    };
    // 检查是否可以组成7，每次需要传入至少一个元素加入待检查队列
    Ele.checkPuzzle = function (eleList) {
        // 加入队列
        eleList.forEach(function (ele) {
            Ele.checkQueue.push(ele);
        });
        // 初始化为0
        if (Ele.puzzleResult.length == 0) {
            for (var i = 0; i < 6; i++) {
                Ele.puzzleResult[i] = [];
                for (var j = 0; j < 9; j++) {
                    Ele.puzzleResult[i][j] = 0;
                }
            }
        }
    };
    // 用于记录场景中格子的占用 初始化为null
    Ele.matrix = [];
    // 检查队列，用于存放待检查元素
    Ele.checkQueue = [];
    return Ele;
}(egret.DisplayObjectContainer));
__reflect(Ele.prototype, "Ele");
