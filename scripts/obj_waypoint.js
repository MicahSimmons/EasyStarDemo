class ObjWaypoint extends Phaser.Physics.Arcade.Sprite {
    static image_assets = [
        { key: "Barrel", filename:"./images/Barrel_01.png"}
    ]

    constructor (scene, params) {
        super(scene, params.x, params.y, ObjWaypoint.image_assets[0].key);
        this.params = params
        this.create();
    }

    static preload (scene) {
        ObjWaypoint.image_assets.forEach( (asset) => {
            return scene.load.image(asset.key, asset.filename);
        })        
    }

    create () {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setScale(0.1);
        this.setImmovable(true);
        this.body.setSize(this.width, this.height)
        this.setVisible(false);


    }

    update () {
        this.setPosition(this.params.x, this.params.y);
        this.setVelocity(0,0);
    }

    setPosition (x, y) {
        let adj_x = (x<128) ? 128 : x;
        let adj_y = (y<128) ? 128 : y;

        super.setPosition(adj_x, adj_y);
    }
}
