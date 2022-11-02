class GridLoader {
    static tileset_assets = [
        { key: "RaceBackground", filename: "./images/GrassTileset.png"}
    ]
    static map_assets = [
        { key: "RaceTrack", filename: "./Racetrack.json" }
    ]

    constructor (scene) {
        this.scene = scene;
        this.map_assets = GridLoader.map_assets;
        this.tileset_assets = GridLoader.tileset_assets;
    }

    static preload (scene) {
        GridLoader.tileset_assets.forEach( (asset) => {
            return scene.load.image(asset.key, asset.filename);
        })

        GridLoader.map_assets.forEach( (asset) => {
            scene.load.tilemapTiledJSON(asset.key, asset.filename);
        })
    }

    create () {
        this.map = this.scene.make.tilemap( { key: this.map_assets[0].key});
        this.tileHeight = this.map.tileHeight;
        this.tileWidth = this.map.tileWidth;

        this.tilesets = this.tileset_assets.map( 
            (asset) => { return this.map.addTilesetImage(asset.key, asset.key) }
        )
        this.map_layers = this.map.layers.map( 
            (layer) => this.map.createLayer(layer.name, this.tilesets, 0, 0)
        );

        this.mapWidth = this.tileWidth*this.map.width;
        this.mapHeight = this.tileHeight*this.map.height;
        console.log(`${this.mapWidth}, ${this.mapHeight}`)
        this.scene.cameras.main.setBounds(0, 0, 
            this.mapWidth, this.mapHeight);
    }

    update () {

    }

    getWaypoints () {
        let waypoints = [];
        this.map_layers.forEach( (layer, index) => {
            if (layer.layer.name == 'Patrol') {
                console.log("Adding waypoints");
                for (let y=0; y<this.map.height; y++) {
                    for (let x=0; x<this.map.width; x++) {
                        let tile = layer.getTileAt(x,y);
                        if (tile) {
                            let obj = {
                                index: tile.index,
                                x: x*this.map.tileWidth,
                                y: y*this.map.tileHeight
                            }
                            waypoints.push(obj);
                        }
                    }
                }
            }
        })
        return waypoints.sort( (a,b) => (a.index < b.index) ? -1 : 1);
    }

    getCollisionGrid () {
        let grid = [];
        this.map_layers.forEach( (layer, index) => {
            if (layer.layer.name == 'collision') {
                for (let row=0; row<this.map.height; row++) {
                    let row = [];
                    for (let col=0; col<this.map.width; col++) {
                        row.push( (layer.getTileAt(row, col)) ? -1 : 0);
                    }
                    grid.push(row);
                }
            }
        })
        return grid;
    }
}
