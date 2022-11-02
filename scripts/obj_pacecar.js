/* The Pace Car and the Chase Car share a lot of the same behavior and physics.
 * To avoid duplicate code, the shared aspects are in a shared base class "ObjBaseCar"
 */

/* A Pace car just sets the "patrol_cycle" routing behavior to true.
 * The Base Car class will implement what patrol_cycle does, and 
 * get the value from the class instance.
 */
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

/* I want the Chase car to look different, so I'm changing the 
 * sprite image that is loaded in preload.
 *
 * The Chase car is going to take a target as a function parameter
 * and constantly re-route to it.
 */
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

    }

    static preload (scene) {
        ObjChaseCar.image_assets.forEach( (asset) => {
            return scene.load.image(asset.key, asset.filename);
        })        
    }

    /* This is the fun part where EasyStar is used to chase after the pace car. */
    pursue (gameObj) {
        /* Save a reference to the object we are chasing. */
        this.path_target = gameObj;

        /* Periodically the Chase car needs to look for the Target and recreate the path.
         * This doesn't need to be all of the time - making an interval here so that I can
         * control how fast the NPC changes its pathing.
         */
        setInterval( () => {
            /* Translate the world coordinate system to tiles.  It doesn't need to be exact
             * so simple rounding to the upper left corners is fine.
             */
            let mgx = Math.floor(this.x / 64);
            let mgy = Math.floor(this.y / 64);
            let tgx = Math.floor(this.path_target.x / 64);
            let tgy = Math.floor(this.path_target.y / 64);
            console.log(`Path - from:(${mgx}, ${mgy}), to:(${tgx}, ${tgy})`)

            /* Ask Easystar to route a path from the current location (my-grid-x, my-grid-y) to the target location (target-grid-x, target-grid-y)*/
            this.finder.findPath(mgx, mgy, tgx, tgy, (path) => {
                /* It's possible that a path is impossible, so catch that case and log it */
                if (path == null) {
                    console.log("Path not found");
                } else {
                    /* If we get a path, forget about the prior path, and save the new path.  The setter functions below
                     * attach the path to this specific game object, and it is not shared between objects.
                     */
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