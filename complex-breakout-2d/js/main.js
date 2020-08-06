var Breakout = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function Breakout() {
    Phaser.Scene.call(this, {
      key: 'breakout',
    });

    // button start game
    this.playing = false;
    this.startButton;

    // level
    this.level = 1;

    // score
    this.scoreText;
    this.score = 0;

    // lives
    this.lives = 3;
    this.livesText;
    this.lifeLostText;

    // power
    this.power;
    this.hasPower = false;

    // objects game
    this.bricks;
    this.paddle;
    this.ball;
  },

  preload: function () {
    // loader 
    var progress = this.add.graphics();

    this.load.on('progress', function (value) {
        progress.clear();
        progress.fillStyle(0xffffff, 1);
        progress.fillRect(0, 270, 800 * value, 60);
    });

    this.load.on('complete', function () {
        progress.destroy();
    });

    
    this.load.image('background', 'assets/space1.png');
    // audios
    this.load.audio('music', 'assets/night.ogg');
    this.load.audio('gameover', 'assets/gameover.ogg');

    // images objects
    this.load.atlas('assets', 'images/breakout.png', 'images/breakout.json');
    this.load.image('red', 'images/red.png');
    this.load.spritesheet('buttonStart', 'images/button.png', {
      frameWidth: 120,
      frameHeight: 40,
    });
  },

  create: function () {
    // add background
    this.add.image(400, 300, 'background');
    // add sound
    this.music = this.sound.add('music');
    this.overSong = this.sound.add('gameover');

    //  Enable world bounds, but disable the floor
    this.physics.world.setBoundsCollision(true, true, true, false);

    // init the game
    this.startButton = this.add.image(400, 300, 'buttonStart').setInteractive();

    this.startButton.on('pointerup', this.startGame, this);

    // show score
    this.scoreText = this.add.text(
      5,
      5,
      `Level: ${this.level} Points: ${this.score}`,
      {
        font: '18px Arial',
        fill: '#FFFFFF',
      },
    );

    // show lifes
    this.livesText = this.add.text(700, 5, 'Lives: ' + this.lives, {
      font: '18px Arial',
      fill: '#FFFFFF',
    });

    this.lifeLostText = this.add.text(
      300,
      400,
      'Life lost, click to continue',
      {
        font: '18px Arial',
        fill: '#FFFFFF',
      },
    );

    this.lifeLostText.visible = false;

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

    this.power = particles.createEmitter({
      speed: 60,
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
    });

    // object ball
    this.ball = this.physics.add
      .image(400, 500, 'assets', 'ball1')
      .setCollideWorldBounds(true)
      .setBounce(1);

    this.ball.setData('onPaddle', true);

    // init follow ball
    this.power.startFollow(this.ball);

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
        if (this.ball.getData('onPaddle') && this.playing) {
          this.startGame();
          // restart
        } else if (!this.playing) {
          this.startGame();
        }
      },
      this,
    );

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  startGame: function () {
    this.startButton.destroy();
    if (this.ball.getData('onPaddle')) {
      // init music
      if (!this.playing) {
        this.music.play({
          loop: true,
        });
      }
      this.playing = true;
      this.ball.setVelocity(-75, -300);
      this.ball.setData('onPaddle', false);
      this.lifeLostText.setText('Life lost, click to continue');
      this.lifeLostText.visible = false;
    }
  },

  gameOver: function () {
    this.playing = false;
    this.music.stop();
    this.overSong.play();
    // game over
    this.resetLevel(false);
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

    // add power
    if (this.ball.body.velocity.x * 1 > 200 && !this.power._visible) {
      this.power._visible = true;
    } else if (this.ball.body.velocity.x * 1 < 200 && this.power._visible) {
      this.power._visible = false;
    }
  },

  hitBrick: function (ball, brick) {
    brick.disableBody(true, true);

    // if has power score mais 20;
    this.score += this.power._visible ? 20 : 10;

    this.scoreText.setText(`Level: ${this.level} Score: ${this.score}`);

    if (this.bricks.countActive() === 0) {
      this.resetLevel(true);
    }
  },

  resetBall: function () {
    this.ball.setVelocity(0);
    this.ball.setPosition(this.paddle.x, 500);
    this.ball.setData('onPaddle', true);
  },

  resetLevel: function (win) {
    if (win) {
      this.level++;
      this.scoreText.setText(`Level: ${this.level} Points: ${this.score}`);
    } else {
      this.lives = 3;
      this.score = 0;
      this.level = 1;
      this.scoreText.setText(`Level: ${this.level} Points: ${this.score}`);
      this.livesText.setText('Lives: ' + this.lives);
      this.lifeLostText.setText('You lost, game over!').visible = true;
    }

    this.resetBall();
    this.bricks.children.each(function (brick) {
      brick.enableBody(false, 0, 0, true, true);
    });
  },

  update: function () {
    // keywords move
    if (this.cursors.left.isDown) {
      this.paddle.x = Phaser.Math.Clamp(this.paddle.x - 10, 52, 748);
      if (this.ball.getData('onPaddle')) {
        this.ball.x = this.paddle.x;
      }
    } else if (this.cursors.right.isDown) {
      this.paddle.x = Phaser.Math.Clamp(this.paddle.x + 10, 52, 748);
      if (this.ball.getData('onPaddle')) {
        this.ball.x = this.paddle.x;
      }
    }

    // lost life
    if (this.ball.y > 600) {
      this.resetBall();
      this.lives--;
      if (this.lives > 0) {
        this.livesText.setText('Lives: ' + this.lives);
        this.lifeLostText.visible = true;
      } else {
        this.gameOver();
      }
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
