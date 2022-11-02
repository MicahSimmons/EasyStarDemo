/* Base Car implements a single car, that can be replicated and customized.
 * A base Car is actually two objects.  The game Sprite, plus a "Waypoint" 
 * object used to keep track of the Routing/Patrol path
 */
class ObjBaseCar extends Phaser.Physics.Arcade.Sprite {
    static image_assets = [
        { key: "Car1", filename:"./images/Car_1_01.png"}
    ]

    constructor (scene, params) {
        super(scene, params.x, params.y, params.name);
        this.params = params;
        this.setRoute = this.setRoute.bind(this);
        this.patrol = [];
        this.patrol_idx = 0;
        this.speed = 256;
        this.steering = Math.PI / 128;
        this.setPosition(params.x, params.y)
        this.rotation += Math.PI/2;

        /* The waypoint object is an invisible sprite used to "walk" the 
         * path supplied by Tiled/EasyStar.
         */
        this.waypoint = new ObjWaypoint(scene, {x:params.x, y:params.y});
        this.create();
    }

    static preload (scene) {
        ObjBaseCar.image_assets.forEach( (asset) => {
            return scene.load.image(asset.key, asset.filename);
        })        
    }

    /* ClearRoute will forget any prior pathing, and reset the steps taken to the new path.
     * The old path was forgotten, so the waypoint jumps to the first step of the new path.
     */
    clearRoute () {
        this.patrol = [];
        this.patrol_idx = 0;
        this.waypoint.setPosition(-100, -100);
    }

    /* Set route saves the route found by Tiled / EasyStar and attaches
     * it to the racecar game object.  I start two steps in, because the
     * first step is always the current location of the game object, and
     * second one is probably in the collision space of the first step.
     */
    setRoute ( patrolList ) {
        this.patrol = patrolList;
        this.patrol_idx = 2;

        if (this.patrol_idx < this.patrol.length) {
            /* The waypoint is going to teleport from one step of the path to the next */
            let loc = this.patrol[this.patrol_idx];
            this.waypoint.setPosition(loc.x, loc.y);
        } else {
            /* If the path has been exhaused, the waypoint moves off of the world as a special case. */
            this.waypoint.setPosition(-100,-100);
        }
    }

    /* I know that a step is complete when the game sprite collided with my waypoint.
     * Teleport the waypoint to the next step in the path.  If set to cycle the path,
     * then use a "%" mod division to go back to the start.
     */
    incPatrolStep () {
        this.patrol_idx = (this.patrol_idx + 1);
        if (this.params.patrol_cycle) {
            this.patrol_idx = this.patrol_idx % this.patrol.length
        }

        if (this.patrol_idx < this.patrol.length) {
            let loc = this.patrol[this.patrol_idx];
            this.waypoint.setPosition(loc.x, loc.y);
        } else {
            this.waypoint.setPosition(-100,-100);
        }
    }

    create () {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setScale(0.1);
        this.body.setSize(this.width, this.height/2)
        this.scene.physics.add.overlap(this, this.waypoint, (car, wp) => {
            this.incPatrolStep();
        })

        /* Clicking on a car changes the camera focus */
        this.setInteractive();
        this.on("pointerdown", () => { 
          this.scene.cameras.main.startFollow(this);
          this.scene.cameras.main.setLerp(0.2);
        })
      
    }

    update () {
        /* If no path is available, don't move. */
        if (this.patrol.length == 0) {
            this.setVelocity(0,0);
            return;
        }

        /* If we've completed the path, also stop moving. */
        if ((this.patrol_idx < 0) || (this.patrol_idx >= this.patrol.length)) {
            this.setVelocity(0,0);
            return;
        }

        /* The Path is being followed by the waypoint.  The car follows the waypoint.
         * Get the world location of the next position in the route.
         */
        let target_x = (this.waypoint.x < 0) ? 0 : this.waypoint.x;
        let target_y = (this.waypoint.y < 0) ? 0 : this.waypoint.y;

        /* I want the car sprite to rotate so that it's facing the direction it is traveling.
         * The math function ArcTan() lets you translate between X,Y coordinates to angular directions.
         */
        let dx = this.x - target_x;
        let dy = this.y - target_y;
        let angle = Math.atan2(dy, dx);
        let rot = this.rotation + Math.PI/2;
        let dr = (angle - rot) % (Math.PI*2);

        /* If the car isn't facing the correct direction, then nudge it in the correct direction */
        if (this.steering > 0) {
            if (Math.abs(dr) > this.steering) {
                //console.log(` angle: ${angle}  this.rot ${this.rotation} rot ${rot} dr: ${dr}`)
                if (dr > 0) {
                    this.rotation += this.steering;
                } else  if (dr < 0) {
                    this.rotation -= this.steering;
                }
            }
        } else {
            this.rotation = angle - (Math.PI/2);
        }

        /* Knowing the angular direction the waypoint is in, use Sin/Cos to
         * translate back to X/Y space, and multiply by the desired speed.
         *
         * This is called "Normalization" of the game coordinates, and makes
         * it so that the sprite is moving at a constant speed regardless of
         * distance or diagonal movement.
         */
        let ay = this.speed * Math.sin(this.rotation - Math.PI/2);
        let ax = this.speed * Math.cos(this.rotation - Math.PI/2);
        this.setVelocity(ax, ay);
    }
}
