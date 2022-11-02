

let init_model = {
    config: {
        type: Phaser.AUTO,
        width: 960,
        height: 540,
        pixelArt: true,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: true
          }
        },
        scene: [
            SceneDemo
        ],
        parent: "dom_id"
      },
}

class GameModel {
    constructor (dom_id) {
        Object.entries(init_model).forEach((e,i) => {
            let [k,v] = e;
            this[k] = v;
          });
        this.config.parent = dom_id;
    }
}


class Game {
    constructor (dom_id) {
        this.model = new GameModel(dom_id);
        document.addEventListener("DOMContentLoaded", () => { this.start() } );

    }

    start () {
        this.phaser = new Phaser.Game(this.model.config);
        this.phaser.model = this.model;
    }
}