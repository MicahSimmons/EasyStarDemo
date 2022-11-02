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
        this.easystar = new EasyStar.js();

        this.map = new GridLoader(this);
        this.map.create();
        this.physics.world.setBounds(0, 0, this.map.mapWidth, this.map.mapHeight);
        this.physics.world.setBoundsCollision();


        let collision_grid = this.map.getCollisionGrid();
        this.easystar.setGrid(collision_grid);
        this.easystar.setAcceptableTiles(0);
        this.easystar.setIterationsPerCalculation(1000);
        this.easystar.enableCornerCutting();
        this.easystar.enableDiagonals();

        this.patrol = this.map.getWaypoints();
        this.pacecar = new ObjPaceCar(this, {x:450, y:450});
        this.pacecar.setRoute( this.patrol.map( (row) => { return { x:row.x, y:row.y }}) );

        this.chasecar = new ObjChaseCar(this, {x: 550, y:450, finder:this.easystar});
        this.chasecar.pursue(this.pacecar);

        cars = {
            pace: this.pacecar,
            chase: this.chasecar
        }

        setInterval(() => {
            this.easystar.calculate();
        }, 500);
    }

    update () {
        this.map.update();
        this.pacecar.update();
        this.chasecar.update();
    }
}