
class Main extends egret.DisplayObjectContainer {

    public static vector:Main;

    public constructor() {
        super();
        Main.vector = this;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })



    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        // this.startAnimation(result);
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private textfield: egret.TextField;
    private curEle: Ele[] = [];
    private bg:Background = new Background();
    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {

        console.log(this.stage.stageWidth);
        console.log(this.stage.stageHeight);

        this.bg = new Background();
        this.addChild(this.bg);

        this.curEle = Ele.createPair(this);

        //设置显示对象可以相应触摸事件
        this.bg.touchEnabled = true;
        this.bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        this.bg.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);

    }

    private startX:number;
    private startY:number;
    private endX:number;
    private endY:number;
    private direction:number;
    private onTouchBegin( evt:egret.TouchEvent ) {
        this.startX = evt.stageX;
        this.startY = evt.stageY;
    }
    private onTouchEnd( evt:egret.TouchEvent ) {
        this.endX = evt.stageX;
        this.endY = evt.stageY;
        this.direction = TouchCal.cal(this.startX,this.startY,this.endX,this.endY);
        var indexX;
        var indexY;
        switch(this.direction){
            case 1:
                // 无操作
                console.log(1);
                break;
            case 3:
                // 下落
                this.bg.touchEnabled = false;
                if(this.curEle[0].indexY > this.curEle[1].indexY){
                    this.curEle[0].down();
                    this.curEle[1].down();
                }else{
                    this.curEle[1].down();
                    this.curEle[0].down();
                }
                setTimeout(() => {
                    Ele.checkPuzzle(this.curEle);
                    this.curEle = Ele.createPair(this);
                    this.bg.touchEnabled = true;
                }, 600);
                break;
            case 2:
                // 向右移动一格
                indexX = this.curEle[0].indexX > this.curEle[1].indexX ? this.curEle[0].indexX : this.curEle[1].indexX
                if(indexX < 5 ){
                    this.curEle[0].moveWithOutAnimation(this.curEle[0].indexX+1,this.curEle[0].indexY);
                    this.curEle[1].moveWithOutAnimation(this.curEle[1].indexX+1,this.curEle[1].indexY);
                }
                
                break;
            case 4:
                // 向左移动一格
                indexX = this.curEle[0].indexX < this.curEle[1].indexX ? this.curEle[0].indexX : this.curEle[1].indexX
                if(indexX > 0 ){
                    this.curEle[0].moveWithOutAnimation(this.curEle[0].indexX-1,this.curEle[0].indexY);
                    this.curEle[1].moveWithOutAnimation(this.curEle[1].indexX-1,this.curEle[1].indexY);
                }
                break;
            case 0:
                // 变换
                console.log(0);
                Ele.transform(this.curEle[0],this.curEle[1]);
                break;
        }
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: string[]) {
        let parser = new egret.HtmlTextParser();

        let textflowArr = result.map(text => parser.parse(text));
        let textfield = this.textfield;
        let count = -1;
        let change = () => {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            let textFlow = textflowArr[count];

            // 切换描述内容
            // Switch to described content
            textfield.textFlow = textFlow;
            let tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, this);
        };

        change();
    }
}