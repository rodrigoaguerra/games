var config = {
  type: Phaser.AUTO,
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
var cursors;
var score = 0;
var scoreText;
var platforms;
var stars;
var bombs;
var player;
var gameOver = false;

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('player', 'assets/player.png', {
    frameWidth: 150,
    frameHeight: 150,
    endFrame: 30,
  });
}

function create() {
  /**
   * Init Level
   */
  this.add.image(400, 300, 'sky');

  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  platforms = this.physics.add.staticGroup();

  // floor
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  /**
   * Init Starts
   */
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  /**
   * Create Bombs
   */
  bombs = this.physics.add.group();

  /**
   * Init Player
   */
  player = this.physics.add.sprite(150, 150, 'player').setScale(0.5);

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('player', { start: 10, end: 19, first: 10 }),
    frameRate: 20,
    repeat: -1,
  });

  this.anims.create({
    key: 'idle',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 9, first: 0 }),
    frameRate: 20,
    repeat: 1,
  });

  this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNumbers('player', { start: 20, end: 29, first: 20 }),
    frameRate: 20,
    // repeat: -1,
  });

  // Colliders
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  // Overlap
  this.physics.add.overlap(player, stars, collectStar, null, this);

  // KeyWords
  cursors = this.input.keyboard.createCursorKeys();
}

function inAction() {
  const actions = ['jump'];
  return actions.includes(player.anims.getCurrentKey());
}

function update() {
  /**
   * Get Key Words Cursors Press
   */
  if (cursors.up.isDown) {
    if (!inAction()) player.anims.play('jump', true);
  } else if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.flipX = true;
    if (!cursors.up.isDown && !inAction()) player.anims.play('run', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.flipX = false;
    if (!cursors.up.isDown && !inAction()) player.anims.play('run', true);
  } else {
    player.setVelocityX(0);
    console.log('key', !inAction());
    if (player.body.touching.down) {
      player.anims.play('idle', true);
    }
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }

  if (inAction() && player.body.touching.down) {
    player.anims.play('idle', true);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText('Score: ' + score);

  /**
   * Show Bombs
   */
  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}
