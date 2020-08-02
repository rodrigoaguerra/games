var Breakout = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function Breakout() {
    Phaser.Scene.call(this, { key: 'breakout' });

    this.bricks;
    this.paddle;
    this.ball;
  },

  preload: function () {
    this.load.atlas('assets', 'images/breakout.png', 'images/breakout.json');
    this.load.image('red', 'images/red.png');
  },

  create: function () {
    //  Enable world bounds, but disable the floor
    this.physics.world.setBoundsCollision(true, true, true, false);

    //  Create the bricks in a 10x6 grid
    this.bricks = this.physics.add.staticGroup({
      key: 'assets',
      frame: ['blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1'],
      frameQuantity: 10,
      gridAlign: {
        width: 10,
        height: 6,
        cellWidth: 64,
        cellHeight: 32,
        x: 112,
        y: 100,
      },
    });

    // add effect ball
    var particles = this.add.particles('red');

    var emitter = particles.createEmitter({
      speed: 60,
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
    });

    // object ball
    this.ball = this.physics.add
      .image(400, 500, 'assets', 'ball1')
      .setCollideWorldBounds(true)
      .setBounce(1);
    // .setVelocity(150, 150);
    this.ball.setData('onPaddle', true);

    emitter.startFollow(this.ball);

    this.paddle = this.physics.add
      .image(400, 550, 'assets', 'paddle1')
      .setImmovable();

    //  Our colliders
    this.physics.add.collider(
      this.ball,
      this.bricks,
      this.hitBrick,
      null,
      this,
    );

    this.physics.add.collider(
      this.ball,
      this.paddle,
      this.hitPaddle,
      null,
      this,
    );

    //  Input events
    this.input.on(
      'pointermove',
      function (pointer) {
        //  Keep the paddle within the game
        this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

        if (this.ball.getData('onPaddle')) {
          this.ball.x = this.paddle.x;
        }
      },
      this,
    );

    this.input.on(
      'pointerup',
      function (pointer) {
        if (this.ball.getData('onPaddle')) {
          this.ball.setVelocity(-75, -300);
          this.ball.setData('onPaddle', false);
        }
      },
      this,
    );
  },

  hitBrick: function (ball, brick) {
    brick.disableBody(true, true);

    if (this.bricks.countActive() === 0) {
      this.resetLevel();
    }
  },

  resetBall: function () {
    this.ball.setVelocity(0);
    this.ball.setPosition(this.paddle.x, 500);
    this.ball.setData('onPaddle', true);
  },

  resetLevel: function () {
    this.resetBall();

    this.bricks.children.each(function (brick) {
      brick.enableBody(false, 0, 0, true, true);
    });
  },

  hitPaddle: function (ball, paddle) {
    var diff = 0;

    if (ball.x < paddle.x) {
      //  Ball is on the left-hand side of the paddle
      diff = paddle.x - ball.x;
      ball.setVelocityX(-10 * diff);
    } else if (ball.x > paddle.x) {
      //  Ball is on the right-hand side of the paddle
      diff = ball.x - paddle.x;
      ball.setVelocityX(10 * diff);
    } else {
      //  Ball is perfectly in the middle
      //  Add a little random X to stop it bouncing straight up!
      ball.setVelocityX(2 + Math.random() * 8);
    }
  },

  update: function () {
    if (this.ball.y > 600) {
      this.resetBall();
    }
  },
});

var config = {
  type: Phaser.AUTO,
  scale: {
    parent: 'mygame',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [Breakout],
};

var game = new Phaser.Game(config);

// var ball;
// var paddle;

// function preload() {
//   // add sprite
//   this.load.spritesheet('ball', 'images/ball.png', {
//     frameWidth: 50,
//     frameHeight: 50,
//   });
//   this.load.image('red', 'images/red.png');
//   this.load.image('paddle', 'images/paddle.png');
// }

// function create() {
//   //  Enable world bounds, but disable the floor
//   this.physics.world.setBoundsCollision(true, true, true, false);

//   // add effect ball
//   var particles = this.add.particles('red');

//   var emitter = particles.createEmitter({
//     speed: 60,
//     scale: { start: 0.5, end: 0 },
//     blendMode: 'ADD',
//   });

//   // object ball
//   ball = this.physics.add
//     .image(50, 50, 'ball')
//     .setCollideWorldBounds(true)
//     .setBounce(1)
//     .setVelocity(150, 150);

//   ball.setData('onPaddle', true);

//   emitter.startFollow(ball);

//   // paddle
//   paddle = this.physics.add
//     .image(config.scale.width * 0.5, config.scale.height - 15, 'paddle')
//     .setImmovable();

//   //  Our colliders
//   // this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
//   this.physics.add.collider(ball, paddle, hitPaddle, null, this);

//   //  Input events
//   this.input.on(
//     'pointermove',
//     function (pointer) {
//       //  Keep the paddle within the game
//       paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

//       if (ball.getData('onPaddle')) {
//         ball.x = paddle.x;
//       }
//     },
//     this,
//   );

//   this.input.on(
//     'pointerup',
//     function (pointer) {
//       if (ball.getData('onPaddle')) {
//         ball.setVelocity(-75, -300);
//         ball.setData('onPaddle', false);
//       }
//     },
//     this,
//   );
// }
