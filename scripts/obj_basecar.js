let dbg_wp = {

}

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
        this.waypoint = new ObjWaypoint(scene, {x:params.x, y:params.y});
        this.create();
    }

    static preload (scene) {
        ObjBaseCar.image_assets.forEach( (asset) => {
            return scene.load.image(asset.key, asset.filename);
        })        
    }

    clearRoute () {
        this.patrol = [];
        this.patrol_idx = 0;
        this.waypoint.setPosition(-100, -100);
    }

    setRoute ( patrolList ) {
        this.patrol = patrolList;
        this.patrol_idx = 2;

        if (this.patrol_idx < this.patrol.length) {
            let loc = this.patrol[this.patrol_idx];
            this.waypoint.setPosition(loc.x, loc.y);
        } else {
            this.waypoint.setPosition(-100,-100);
        }
    }

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

    }

    update () {
        if (this.patrol.length == 0) {
            this.setVelocity(0,0);
            return;
        }

        if ((this.patrol_idx < 0) || (this.patrol_idx >= this.patrol.length)) {
            this.setVelocity(0,0);
            return;
        }

        let target_x = (this.waypoint.x < 0) ? 0 : this.waypoint.x;
        let target_y = (this.waypoint.y < 0) ? 0 : this.waypoint.y;

        let dx = this.x - target_x;
        let dy = this.y - target_y;
        let angle = Math.atan2(dy, dx);
        let rot = this.rotation + Math.PI/2;
        let dr = (angle - rot) % (Math.PI*2);

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

        let ay = this.speed * Math.sin(this.rotation - Math.PI/2);
        let ax = this.speed * Math.cos(this.rotation - Math.PI/2);

        this.setVelocity(ax, ay);
    }
}
