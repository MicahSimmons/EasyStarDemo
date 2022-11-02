
class ObjPaceCar extends ObjBaseCar {
    constructor (scene, params) {
        params.name = "Car1";
        params.patrol_cycle = true;
        super(scene, params);
    }

    create () {
        super.create();
        this.scene.cameras.main.startFollow(this);
    }
}

class ObjChaseCar extends ObjBaseCar {
    static image_assets = [
        { key: "Car2", filename:"./images/Car_3_01.png"}
    ]

    constructor (scene, params) {
        params.name = "Car2";
        super(scene, params);

        this.finder = params.finder;
        this.speed = 256;
        this.steering = -1;
        this.setCollideWorldBounds();
        this.scene.cameras.main.startFollow(this);

    }

    static preload (scene) {
        ObjChaseCar.image_assets.forEach( (asset) => {
            return scene.load.image(asset.key, asset.filename);
        })        
    }

    pursue (gameObj) {
        this.path_target = gameObj;
        setInterval( () => {
            let mgx = Math.floor(this.x / 64);
            let mgy = Math.floor(this.y / 64);
            let tgx = Math.floor(this.path_target.x / 64);
            let tgy = Math.floor(this.path_target.y / 64);
            console.log(`Path - from:(${mgx}, ${mgy}), to:(${tgx}, ${tgy})`)
            this.finder.findPath(mgx, mgy, tgx, tgy, (path) => {
                if (path == null) {
                    console.log("Path not found");
                } else {
                    this.clearRoute();
                    this.setRoute(path.map( 
                        (point) => { 
                            return { x:point.x*64, y:point.y*64}
                        }
                    ));
                }
            })
        }, 1000);
    }
}