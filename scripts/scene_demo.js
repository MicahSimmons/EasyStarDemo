let cars = {}

class SceneDemo extends Phaser.Scene {
    constructor ( params ) {
        super("RaceDemo");
        this.preload = this.preload.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
    }

    init () {
        this.registry = [
            GridLoader,
            ObjPaceCar,
            ObjChaseCar,
            ObjWaypoint
        ]
    }

    preload () {
        this.registry.forEach( (obj) => obj.preload(this) );
    }

    create () {
        /* Initialize the EasyStar Library */
        this.easystar = new EasyStar.js();

        /* Initialize the world space using a Tiled map */
        this.map = new GridLoader(this);
        this.map.create();
        this.physics.world.setBounds(0, 0, this.map.mapWidth, this.map.mapHeight);
        this.physics.world.setBoundsCollision();

        /* Get the set of valid tiles from the map and pass it into EasyStar.  
         * Rather than using TileID's, I'm using a zero to indicate an empty
         * space that can be used and a one for a blocking space.
         */
        let collision_grid = this.map.getCollisionGrid();
        this.easystar.setGrid(collision_grid);
        this.easystar.setAcceptableTiles(0);
        this.easystar.setIterationsPerCalculation(1000);
        this.easystar.enableCornerCutting();
        this.easystar.enableDiagonals();

        /* One layer of my tiled map contains markers that I want my pacecar to follow.
         * Get the non-zero tiles from my patrol layer, and push that into the pacecar's 
         * pathing.
         */
        this.patrol = this.map.getWaypoints();
        this.pacecar = new ObjPaceCar(this, {x:450, y:450});
        this.pacecar.setRoute( this.patrol.map( (row) => { return { x:row.x, y:row.y }}) );

        /* Create the second NPC car, and set it to follow the first NPC car. A refrence to EasyStar
         * is passed in as a parameter for this NPC to use.
         */
        this.chasecar = new ObjChaseCar(this, {x: 550, y:450, finder:this.easystar});
        this.chasecar.pursue(this.pacecar);

        /* Just for giggles, Lets chase the chaser! */
        this.chasecar_b = new ObjChaseCar(this, {x: 600, y:425, finder:this.easystar});
        this.chasecar_b.pursue(this.chasecar);

      
        cars = {
            pace: this.pacecar,
            chase: this.chasecar,
            tail: this.chasecar_b
        }

        /* This interval lets EasyStar's algorithm run periodically.  Putting it in the Update loop would
         * burn more CPU than needed and possibly recalculate before a route can be run.
         */
        setInterval(() => {
            this.easystar.calculate();
        }, 500);
    }

    update () {
        /* Run updates for each object */
        this.map.update();
        this.pacecar.update();
        this.chasecar.update();
        this.chasecar_b.update();
    }
}