import cuerpoSpritePath from './assets/cuerpo.png';
import camisetaSpritePath from './assets/camiseta.png';
import pantalonSpritePath from './assets/pantalon.png';
import { alto, ancho } from './dimens.ts';

interface GoalPos {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
}

interface SpriteState {
  readonly goalPos: GoalPos;
  ready: boolean;
}

const cuerpoPos = { x: ancho / 2, y: alto / 2 };
const camisetaPos: GoalPos = {
  minX: ancho * 0.48,
  minY: alto * 0.36,
  width: alto * 0.06,
  height: alto * 0.06,
};
const pantalonPos: GoalPos = {
  minX: ancho * 0.48,
  minY: alto * 0.56,
  width: alto * 0.06,
  height: alto * 0.06,
};

class ClothesState extends Phaser.State {
  private readonly draggableSprites: { [id: string]: SpriteState } = {
    camiseta: { goalPos: camisetaPos, ready: false },
    pantalon: { goalPos: pantalonPos, ready: false },
  };

  preload() {
    this.game.load.image('cuerpo', cuerpoSpritePath);
    this.game.load.image('camiseta', camisetaSpritePath);
    this.game.load.image('pantalon', pantalonSpritePath);
  }

  private drawDropBoxes() {
    const graphics = this.game.add.graphics(0, 0);
    graphics.lineStyle(2, 0x0000ff, 1);
    graphics.drawRect(
      camisetaPos.minX,
      camisetaPos.minY,
      camisetaPos.width,
      camisetaPos.height
    );
    graphics.drawRect(
      pantalonPos.minX,
      pantalonPos.minY,
      pantalonPos.width,
      pantalonPos.height
    );
  }

  private addDraggableSprite(params: {
    height: number;
    widthToHeight: number;
    xNum: number;
    yNum: number;
    resourceName: string;
    group: Phaser.Group;
  }) {
    const draggable = params.group.create(
      ancho * params.xNum / 7,
      alto * params.yNum / 7,
      params.resourceName
    );
    draggable.height = params.height;
    draggable.width = params.height * params.widthToHeight;
    draggable.anchor.setTo(0.5, 0.5);
    draggable.inputEnabled = true;
    draggable.input.enableDrag();
    draggable.events.onDragStop.add(this.onDragStop, this);
  }

  create() {
    const cuerpo = this.game.add.sprite(cuerpoPos.x, cuerpoPos.y, 'cuerpo');
    cuerpo.height = alto * 6 / 10;
    cuerpo.width = cuerpo.height * 4 / 10;
    cuerpo.anchor.setTo(0.5, 0.5);

    const group = this.game.add.group();
    group.inputEnableChildren = true;

    this.addDraggableSprite({
      height: alto * 1 / 7,
      widthToHeight: 1,
      xNum: 1,
      yNum: 1,
      resourceName: 'camiseta',
      group,
    });
    this.addDraggableSprite({
      height: alto * 1 / 4,
      widthToHeight: 4 / 10,
      xNum: 5,
      yNum: 5,
      resourceName: 'pantalon',
      group,
    });

    this.drawDropBoxes();
  }

  private areAllSpritesReady() {
    const spriteStates = Object.keys(this.draggableSprites);
    return spriteStates.every(key => {
      const state = this.draggableSprites[key];
      return state.ready;
    });
  }

  private gameOver() {
    this.game.state.start('Video');
  }

  private checkSpriteDraggedAtGoal(
    spriteState: SpriteState,
    sprite: Phaser.Sprite
  ) {
    const { goalPos } = spriteState;
    const maxX = goalPos.minX + goalPos.width;
    const maxY = goalPos.minY + goalPos.height;
    const { centerX, centerY } = sprite;
    if (
      centerX > goalPos.minX &&
      centerX < maxX &&
      centerY > goalPos.minY &&
      centerY < maxY
    ) {
      sprite.input.enabled = false;
      spriteState.ready = true;
      if (this.areAllSpritesReady()) this.gameOver();
    }
  }

  private onDragStop(sprite, pointer) {
    const { pantalon, camiseta } = this.draggableSprites;
    switch (sprite.key) {
      case 'pantalon':
        this.checkSpriteDraggedAtGoal(pantalon, sprite);
        break;
      case 'camiseta':
        this.checkSpriteDraggedAtGoal(camiseta, sprite);
        break;
    }
  }
}

export default ClothesState;
