import { BOSS_START, CHECKPOINTS, COINS, ENEMY_SPAWNS, SOLIDS, SPIKES, WORLD } from './level.js';

const WIDTH = 480;
const HEIGHT = 270;
const PLAYER_W = 14;
const PLAYER_H = 20;
const GRAVITY = 620;
const MAX_DT = 1 / 30;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export class GameEngine {
  constructor(canvas, onState) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.onState = onState;
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.keys = new Set();
    this.input = { left: false, right: false, jump: false, attack: false };
    this.jumpLatch = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.lastPublish = 0;
    this.raf = 0;
    this.audio = null;
    this.destroyed = false;
    this.state = 'title';
    this.soundOn = true;
    this.best = this.readBest();
    this.resetRun(false);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleVisibility);
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.publish(true);
  }

  readBest() {
    try { return Number(localStorage.getItem('pixel-quest-best') || 0); }
    catch { return 0; }
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = this.score;
      try { localStorage.setItem('pixel-quest-best', String(this.best)); } catch { /* private browsing */ }
    }
  }

  resetRun(resetState = true) {
    this.player = { x: 42, y: 210, w: PLAYER_W, h: PLAYER_H, vx: 0, vy: 0, facing: 1, grounded: false, hp: 3, invulnerable: 0, attackTimer: 0, attackCooldown: 0, anim: 0 };
    this.cameraX = 0;
    this.score = 0;
    this.coins = COINS.map((coin) => ({ ...coin, taken: false }));
    this.enemies = ENEMY_SPAWNS.map((enemy, id) => ({ ...enemy, id, y: 226, w: 16, h: 18, direction: id % 2 ? -1 : 1, alive: true, anim: id * 0.7 }));
    this.boss = { ...BOSS_START, direction: -1, alive: true, hitFlash: 0, attackCooldown: 0 };
    this.checkpointIndex = -1;
    this.spawnX = 42;
    this.spawnY = 210;
    this.elapsed = 0;
    this.flash = 0;
    this.particles = [];
    this.levelName = 'THE NEON RUINS';
    if (resetState) this.state = 'playing';
    this.input = { left: false, right: false, jump: false, attack: false };
    this.jumpLatch = false;
    this.publish(true);
  }

  start() {
    if (this.state === 'title' || this.state === 'gameover' || this.state === 'won') this.resetRun(true);
    else if (this.state === 'paused') this.state = 'playing';
    this.lastTime = performance.now();
    this.ensureAudio();
    this.publish(true);
  }

  restart() { this.resetRun(true); this.lastTime = performance.now(); this.ensureAudio(); this.publish(true); }

  togglePause() {
    if (this.state === 'playing') this.state = 'paused';
    else if (this.state === 'paused') { this.state = 'playing'; this.lastTime = performance.now(); }
    this.publish(true);
  }

  toggleSound() { this.soundOn = !this.soundOn; if (this.soundOn) this.ensureAudio(); this.publish(true); }

  setInput(action, down) {
    if (!(action in this.input)) return;
    // Start first, because start() resets held inputs. Then apply the touch press.
    if (down && (this.state === 'title' || this.state === 'gameover' || this.state === 'won')) this.start();
    this.input[action] = down;
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();
    const prevent = ['arrowleft', 'arrowright', 'arrowup', ' ', 'z', 'x', 'a', 'd', 'escape', 'enter', 'p'];
    if (prevent.includes(key)) event.preventDefault();
    if (this.keys.has(key)) return;
    this.keys.add(key);
    if (this.state === 'title' && ['arrowleft', 'arrowright', 'arrowup', ' ', 'z', 'x', 'a', 'd'].includes(key)) this.start();
    if (key === 'enter') {
      if (this.state === 'title' || this.state === 'gameover' || this.state === 'won') this.start();
      else if (this.state === 'paused') this.start();
    } else if (key === 'escape' || key === 'p') {
      this.togglePause();
    } else if (key === 'm') {
      this.toggleSound();
    }
    if (['arrowleft', 'a'].includes(key)) this.input.left = true;
    if (['arrowright', 'd'].includes(key)) this.input.right = true;
    if (['arrowup', 'w', ' '].includes(key)) this.input.jump = true;
    if (['z', 'x', 'j'].includes(key)) this.input.attack = true;
  }

  handleKeyUp(event) {
    const key = event.key.toLowerCase();
    this.keys.delete(key);
    if (['arrowleft', 'a'].includes(key)) this.input.left = false;
    if (['arrowright', 'd'].includes(key)) this.input.right = false;
    if (['arrowup', 'w', ' '].includes(key)) this.input.jump = false;
    if (['z', 'x', 'j'].includes(key)) this.input.attack = false;
  }

  handleVisibility() {
    if (document.hidden || !document.hasFocus()) {
      this.keys.clear();
      this.input = { left: false, right: false, jump: false, attack: false };
      if (this.state === 'playing') this.state = 'paused';
      this.publish(true);
    }
  }

  ensureAudio() {
    if (!this.soundOn || this.audio) return;
    try { this.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.audio = null; }
  }

  beep(frequency = 440, duration = 0.08, type = 'square', volume = 0.035) {
    if (!this.soundOn) return;
    this.ensureAudio();
    if (!this.audio) return;
    try {
      if (this.audio.state === 'suspended') this.audio.resume();
      const oscillator = this.audio.createOscillator();
      const gain = this.audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audio.currentTime);
      gain.gain.setValueAtTime(volume, this.audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audio.currentTime + duration);
      oscillator.connect(gain); gain.connect(this.audio.destination);
      oscillator.start(); oscillator.stop(this.audio.currentTime + duration);
    } catch { /* audio is optional */ }
  }

  startLoop() {
    const frame = (now) => {
      if (this.destroyed) return;
      const dt = this.lastTime ? Math.min((now - this.lastTime) / 1000, MAX_DT) : 0;
      this.lastTime = now;
      if (this.state === 'playing') this.update(dt);
      this.draw();
      if (now - this.lastPublish > 90) { this.publish(); this.lastPublish = now; }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleVisibility);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    if (this.audio) this.audio.close().catch(() => {});
  }

  publish(force = false) {
    if (!this.onState) return;
    this.onState({
      state: this.state, score: this.score, best: this.best,
      coins: this.coins?.filter((coin) => coin.taken).length || 0,
      totalCoins: this.coins?.length || COINS.length,
      hp: this.player?.hp ?? 3, bossHp: this.boss?.hp ?? 5,
      bossAlive: this.boss?.alive ?? true,
      checkpoint: this.checkpointIndex + 1,
      soundOn: this.soundOn,
      x: Math.floor(this.player?.x || 0),
    });
  }

  update(dt) {
    this.elapsed += dt;
    this.player.anim += dt * (Math.abs(this.player.vx) > 2 ? 11 : 3);
    this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
    this.player.attackTimer = Math.max(0, this.player.attackTimer - dt);
    this.player.attackCooldown = Math.max(0, this.player.attackCooldown - dt);
    this.boss.hitFlash = Math.max(0, this.boss.hitFlash - dt);
    this.boss.attackCooldown = Math.max(0, this.boss.attackCooldown - dt);
    this.flash = Math.max(0, this.flash - dt);

    const player = this.player;
    const direction = Number(this.input.right) - Number(this.input.left);
    const speed = 112;
    player.vx = direction * speed;
    if (direction) player.facing = direction;
    if (!this.input.jump) this.jumpLatch = false;
    if (this.input.jump && !this.jumpLatch && player.grounded) {
      player.vy = -248;
      player.grounded = false;
      this.jumpLatch = true;
      this.beep(300, 0.08, 'square', 0.025);
    }
    if (this.input.attack && player.attackCooldown <= 0) {
      player.attackTimer = 0.15;
      player.attackCooldown = 0.32;
      this.beep(620, 0.045, 'square', 0.018);
      this.performAttack();
    }

    player.vy += GRAVITY * dt;
    player.vy = Math.min(player.vy, 360);
    this.moveAndCollide(player, dt);
    if (player.y > HEIGHT + 80) this.damagePlayer(true);

    // Collectibles and hazards.
    for (const coin of this.coins) {
      if (!coin.taken && overlaps(player, { x: coin.x - 5, y: coin.y - 5, w: 10, h: 10 })) {
        coin.taken = true; this.score += 100; this.beep(880, 0.07, 'square', 0.025); this.addParticles(coin.x, coin.y, '#ffd166', 7);
      }
    }
    for (const spike of SPIKES) {
      if (overlaps(player, spike)) this.damagePlayer();
    }
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.anim += dt * 8;
      enemy.x += enemy.direction * enemy.speed * dt;
      if (enemy.x < enemy.min || enemy.x + enemy.w > enemy.max) enemy.direction *= -1;
      if (overlaps(player, enemy)) {
        if (player.vy > 35 && player.y + player.h - enemy.y < 11) {
          enemy.alive = false; player.vy = -150; this.score += 250; this.beep(180, 0.1, 'square'); this.addParticles(enemy.x + 8, enemy.y + 8, '#ff6b9d', 9);
        } else this.damagePlayer();
      }
    }
    if (this.boss.alive) {
      this.boss.x += this.boss.direction * 23 * dt;
      if (this.boss.x < this.boss.min || this.boss.x + this.boss.w > this.boss.max) this.boss.direction *= -1;
      if (overlaps(player, this.boss)) this.damagePlayer();
    }

    CHECKPOINTS.forEach((checkpoint, index) => {
      if (player.x >= checkpoint.x && this.checkpointIndex < index) {
        this.checkpointIndex = index; this.spawnX = checkpoint.x; this.spawnY = 210;
        this.score += 300; this.flash = 0.8; this.beep(740, 0.14, 'triangle', 0.035); this.addParticles(checkpoint.x, 210, '#6df7e8', 15);
      }
    });

    if (!this.boss.alive && player.x > WORLD.width - 98) {
      this.state = 'won'; this.score += 1000; this.saveBest(); this.beep(660, 0.18, 'triangle');
      window.setTimeout(() => { if (!this.destroyed && this.state === 'won') this.publish(true); }, 10);
    }

    this.cameraX += (clamp(player.x - WIDTH * 0.38, 0, WORLD.width - WIDTH) - this.cameraX) * Math.min(1, dt * 7);
    this.updateParticles(dt);
  }

  moveAndCollide(entity, dt) {
    const previousY = entity.y;
    entity.x += entity.vx * dt;
    for (const solid of SOLIDS) {
      if (!overlaps(entity, solid)) continue;
      if (entity.vx > 0) entity.x = solid.x - entity.w;
      else if (entity.vx < 0) entity.x = solid.x + solid.w;
    }
    entity.x = clamp(entity.x, 0, WORLD.width - entity.w);

    entity.y += entity.vy * dt;
    entity.grounded = false;
    for (const solid of SOLIDS) {
      if (!overlaps(entity, solid)) continue;
      if (entity.vy >= 0 && previousY + entity.h <= solid.y + 3) {
        entity.y = solid.y - entity.h; entity.vy = 0; entity.grounded = true;
      } else if (entity.vy < 0 && previousY >= solid.y + solid.h - 3) {
        entity.y = solid.y + solid.h; entity.vy = 0;
      }
    }
  }

  performAttack() {
    const p = this.player;
    const strike = { x: p.facing > 0 ? p.x + p.w : p.x - 20, y: p.y + 3, w: 20, h: 14 };
    for (const enemy of this.enemies) {
      if (enemy.alive && overlaps(strike, enemy)) {
        enemy.alive = false; this.score += 250; this.addParticles(enemy.x + 8, enemy.y + 8, '#ff6b9d', 9); this.beep(220, 0.09, 'square');
      }
    }
    if (this.boss.alive && this.boss.attackCooldown <= 0 && overlaps(strike, this.boss)) {
      this.boss.hp -= 1; this.boss.hitFlash = 0.15; this.boss.attackCooldown = 0.5; this.score += 150; this.addParticles(this.boss.x + 16, this.boss.y + 18, '#ffdf7e', 8); this.beep(120, 0.13, 'sawtooth', 0.03);
      if (this.boss.hp <= 0) {
        this.boss.alive = false; this.score += 1000; this.flash = 1; this.addParticles(this.boss.x + 18, this.boss.y + 18, '#6df7e8', 28); this.beep(960, 0.3, 'triangle', 0.04);
      }
    }
  }

  damagePlayer(fall = false) {
    const p = this.player;
    if (p.invulnerable > 0 || this.state !== 'playing') return;
    p.hp -= 1; p.invulnerable = 1.25; p.vy = fall ? -80 : -180; p.vx = p.x < this.boss.x ? -50 : 50; this.flash = 0.25;
    this.beep(95, 0.16, 'sawtooth', 0.04); this.addParticles(p.x + p.w / 2, p.y + p.h / 2, '#ff6b9d', 8);
    if (p.hp <= 0) {
      this.state = 'gameover'; this.saveBest(); this.publish(true); return;
    }
    if (fall) { p.x = this.spawnX; p.y = this.spawnY; p.vy = 0; p.vx = 0; }
  }

  addParticles(x, y, color, amount) {
    for (let i = 0; i < amount; i++) this.particles.push({ x, y, vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 100, life: 0.25 + Math.random() * 0.5, maxLife: 0.75, color, size: Math.random() > 0.5 ? 3 : 2 });
  }

  updateParticles(dt) {
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 180 * dt; }
  }

  draw() {
    const c = this.ctx;
    c.save();
    c.imageSmoothingEnabled = false;
    this.drawBackground(c);
    c.save(); c.translate(-Math.floor(this.cameraX), 0);
    this.drawLevel(c);
    this.drawCoins(c);
    this.drawEnemies(c);
    if (this.boss.alive) this.drawBoss(c);
    this.drawPlayer(c);
    this.drawParticles(c);
    c.restore();
    if (this.flash > 0) { c.fillStyle = `rgba(255,82,130,${this.flash * 0.23})`; c.fillRect(0, 0, WIDTH, HEIGHT); }
    this.drawCanvasLabels(c);
    c.restore();
  }

  drawBackground(c) {
    const gradient = c.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, '#111b3a'); gradient.addColorStop(0.62, '#29345a'); gradient.addColorStop(1, '#56345d');
    c.fillStyle = gradient; c.fillRect(0, 0, WIDTH, HEIGHT);
    // Pixel stars.
    for (let i = 0; i < 52; i++) {
      const x = ((i * 83 - this.cameraX * 0.15) % (WIDTH + 20) + WIDTH + 20) % (WIDTH + 20);
      const y = 12 + (i * 37) % 112;
      c.fillStyle = i % 4 === 0 ? '#ffd166' : '#b5d5ff'; c.globalAlpha = 0.45 + 0.35 * Math.sin(this.elapsed * 2 + i);
      c.fillRect(Math.floor(x), y, i % 7 === 0 ? 3 : 1, i % 7 === 0 ? 3 : 1);
    }
    c.globalAlpha = 1;
    this.drawMountainLayer(c, 0.19, 174, '#263050', 57);
    this.drawMountainLayer(c, 0.31, 197, '#1b2945', 42);
    // Floating ruins silhouettes.
    for (let i = 0; i < 8; i++) {
      const x = ((i * 87 - this.cameraX * 0.3) % (WIDTH + 100) + WIDTH + 100) % (WIDTH + 100) - 30;
      const h = 25 + (i * 13) % 36; const y = 206 - h;
      c.fillStyle = '#202846'; c.fillRect(x, y, 28, h); c.fillRect(x - 4, y, 36, 5);
      c.fillStyle = '#465276'; for (let j = 0; j < 3; j++) c.fillRect(x + 5 + j * 8, y + 10, 3, 7);
    }
  }

  drawMountainLayer(c, speed, baseline, color, step) {
    c.fillStyle = color; c.beginPath(); c.moveTo(0, HEIGHT);
    for (let x = -step; x <= WIDTH + step; x += step) {
      const sx = x - (this.cameraX * speed % step);
      const peak = baseline - (Math.abs(Math.sin((x + 20) * 0.031)) * 33 + (Math.sin(x * 0.071) + 1) * 10);
      c.lineTo(sx, peak); c.lineTo(sx + step * 0.5, peak + 18);
    }
    c.lineTo(WIDTH, HEIGHT); c.closePath(); c.fill();
  }

  drawLevel(c) {
    for (const solid of SOLIDS) {
      if (solid.kind === 'ground') {
        c.fillStyle = '#273653'; c.fillRect(solid.x, solid.y, solid.w, solid.h);
        c.fillStyle = '#6df7e8'; c.fillRect(solid.x, solid.y, solid.w, 3);
        c.fillStyle = '#455777';
        for (let x = solid.x + 4; x < solid.x + solid.w; x += 16) {
          c.fillRect(x, solid.y + 7, 7, 2); c.fillRect(x + 6, solid.y + 17, 5, 2);
        }
        c.fillStyle = '#161e36'; c.fillRect(solid.x, solid.y + 25, solid.w, 15);
      } else {
        c.fillStyle = '#53678d'; c.fillRect(solid.x, solid.y, solid.w, solid.h);
        c.fillStyle = '#d4edff'; c.fillRect(solid.x, solid.y, solid.w, 2);
        c.fillStyle = '#293653'; c.fillRect(solid.x + 4, solid.y + solid.h, solid.w - 8, 4);
        c.fillStyle = '#8aa1c8'; for (let x = solid.x + 8; x < solid.x + solid.w - 4; x += 14) c.fillRect(x, solid.y + 4, 5, 2);
      }
    }
    for (const spike of SPIKES) {
      c.fillStyle = '#ff6b9d';
      for (let x = spike.x; x < spike.x + spike.w; x += 8) {
        c.beginPath(); c.moveTo(x, spike.y + spike.h); c.lineTo(x + 4, spike.y); c.lineTo(x + 8, spike.y + spike.h); c.fill();
      }
    }
    CHECKPOINTS.forEach((checkpoint, index) => {
      c.fillStyle = '#253250'; c.fillRect(checkpoint.x, 200, 4, 44);
      c.fillStyle = this.checkpointIndex >= index ? '#6df7e8' : '#ff6b9d';
      c.beginPath(); c.moveTo(checkpoint.x + 4, 201); c.lineTo(checkpoint.x + 26, 209); c.lineTo(checkpoint.x + 4, 217); c.fill();
      if (this.checkpointIndex >= index) { c.fillStyle = '#6df7e8'; c.globalAlpha = 0.18; c.fillRect(checkpoint.x - 6, 195, 18, 50); c.globalAlpha = 1; }
    });
    // Exit gate.
    const gateX = WORLD.width - 66;
    c.fillStyle = '#14203a'; c.fillRect(gateX, 194, 34, 50);
    c.fillStyle = '#6df7e8'; c.fillRect(gateX, 194, 34, 3); c.fillRect(gateX + 4, 200, 26, 3);
    c.strokeStyle = this.boss.alive ? '#ff6b9d' : '#6df7e8'; c.lineWidth = 2; c.strokeRect(gateX + 7, 205, 20, 39);
    c.fillStyle = this.boss.alive ? '#ff6b9d' : '#6df7e8';
    for (let y = 210; y < 238; y += 8) c.fillRect(gateX + 11, y, 12, 3);
    // Tiny lamps.
    for (let x = 94; x < WORLD.width; x += 175) {
      c.fillStyle = '#121b31'; c.fillRect(x, 222, 5, 22); c.fillStyle = '#ffd166'; c.fillRect(x - 3, 218, 11, 6);
    }
  }

  drawCoins(c) {
    for (const coin of this.coins) {
      if (coin.taken) continue;
      const bob = Math.sin(this.elapsed * 5 + coin.id) * 2;
      c.fillStyle = '#a66335'; c.fillRect(coin.x - 5, coin.y - 5 + bob, 10, 10);
      c.fillStyle = '#ffd166'; c.fillRect(coin.x - 4, coin.y - 6 + bob, 8, 10);
      c.fillStyle = '#fff3b0'; c.fillRect(coin.x - 1, coin.y - 4 + bob, 2, 6);
      c.fillStyle = '#d78c40'; c.fillRect(coin.x + 2, coin.y - 2 + bob, 2, 4);
    }
  }

  drawEnemies(c) {
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const bounce = Math.round(Math.sin(e.anim) * 1);
      c.fillStyle = '#5b244f'; c.fillRect(e.x + 1, e.y + 4 + bounce, 14, 13);
      c.fillStyle = '#ff6b9d'; c.fillRect(e.x + 2, e.y + 2 + bounce, 12, 11);
      c.fillStyle = '#ffd2dc'; c.fillRect(e.x + 3, e.y + 3 + bounce, 3, 3); c.fillRect(e.x + 10, e.y + 3 + bounce, 3, 3);
      c.fillStyle = '#321d45'; c.fillRect(e.x + 4, e.y + 4 + bounce, 2, 2); c.fillRect(e.x + 10, e.y + 4 + bounce, 2, 2);
      c.fillStyle = '#a53f82'; c.fillRect(e.x + 3, e.y + 15 + bounce, 4, 3); c.fillRect(e.x + 10, e.y + 15 + bounce, 4, 3);
    }
  }

  drawBoss(c) {
    const b = this.boss;
    c.fillStyle = '#3c234b'; c.fillRect(b.x + 3, b.y + 8, b.w + 1, b.h - 4);
    c.fillStyle = b.hitFlash > 0 ? '#fff4c7' : '#9058be'; c.fillRect(b.x, b.y + 6, b.w, b.h - 8);
    c.fillStyle = '#c392f0'; c.fillRect(b.x + 4, b.y + 1, 7, 10); c.fillRect(b.x + 23, b.y + 1, 7, 10);
    c.fillStyle = '#ff6b9d'; c.fillRect(b.x + 6, b.y + 13, 22, 7);
    c.fillStyle = '#fff4c7'; c.fillRect(b.x + 8, b.y + 14, 4, 4); c.fillRect(b.x + 22, b.y + 14, 4, 4);
    c.fillStyle = '#2a183e'; c.fillRect(b.x + 10, b.y + 15, 2, 2); c.fillRect(b.x + 23, b.y + 15, 2, 2);
    c.fillStyle = '#673d91'; c.fillRect(b.x + 5, b.y + b.h - 5, 8, 6); c.fillRect(b.x + 23, b.y + b.h - 5, 8, 6);
    // Health bar follows boss in world-space.
    c.fillStyle = '#172039'; c.fillRect(b.x - 2, b.y - 10, 38, 5);
    c.fillStyle = '#ff6b9d'; c.fillRect(b.x, b.y - 8, Math.max(0, 34 * b.hp / BOSS_START.hp), 2);
  }

  drawPlayer(c) {
    const p = this.player;
    if (p.invulnerable > 0 && Math.floor(this.elapsed * 18) % 2 === 0) return;
    const running = Math.abs(p.vx) > 2 && p.grounded;
    const leg = running ? (Math.sin(p.anim) > 0 ? 2 : 0) : 0;
    const x = Math.round(p.x); const y = Math.round(p.y);
    // Shadow and scarf.
    c.fillStyle = '#10152b'; c.globalAlpha = 0.3; c.fillRect(x - 2, y + p.h, 18, 3); c.globalAlpha = 1;
    c.fillStyle = '#ff6b9d'; c.fillRect(x + (p.facing > 0 ? 2 : -5), y + 8, 9, 4);
    c.fillStyle = '#244e79'; c.fillRect(x + 1, y + 9, 12, 8);
    c.fillStyle = '#5cd7e8'; c.fillRect(x + 2, y + 7, 10, 9);
    c.fillStyle = '#ffd166'; c.fillRect(x + 2, y + 1, 10, 8);
    c.fillStyle = '#ffdf9b'; c.fillRect(x + 4, y + 2, 7, 5);
    c.fillStyle = '#172344'; c.fillRect(x + (p.facing > 0 ? 8 : 3), y + 4, 2, 2);
    c.fillStyle = '#6df7e8'; c.fillRect(x + 1, y, 12, 3); c.fillRect(x + 3, y - 2, 8, 3);
    c.fillStyle = '#f4b45d'; c.fillRect(x + 1, y + 16, 5, 4 + leg); c.fillRect(x + 8, y + 16, 5, 4 + (running ? 2 - leg : 0));
    c.fillStyle = '#ffe8c2'; c.fillRect(x, y + 18 + leg, 6, 2); c.fillRect(x + 8, y + 18 + (running ? 2 - leg : 0), 6, 2);
    if (p.attackTimer > 0) {
      const ax = p.facing > 0 ? x + 13 : x - 14;
      c.fillStyle = '#fff4c7'; c.fillRect(ax, y + 7, 15, 3);
      c.fillStyle = '#6df7e8'; c.fillRect(ax + (p.facing > 0 ? 5 : 2), y + 4, 7, 2);
      c.fillStyle = '#ffd166'; c.fillRect(ax + (p.facing > 0 ? 12 : 0), y + 5, 3, 7);
    }
  }

  drawParticles(c) {
    for (const p of this.particles) {
      c.globalAlpha = clamp(p.life / p.maxLife, 0, 1); c.fillStyle = p.color; c.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    c.globalAlpha = 1;
  }

  drawCanvasLabels(c) {
    // The diegetic in-game area label and progress indicator.
    c.fillStyle = 'rgba(8,13,29,0.7)'; c.fillRect(9, 9, 130, 18);
    c.fillStyle = '#6df7e8'; c.font = 'bold 8px monospace'; c.fillText('AREA 01  /  NEON RUINS', 15, 21);
    c.fillStyle = 'rgba(8,13,29,0.7)'; c.fillRect(WIDTH - 76, 9, 67, 18);
    c.fillStyle = '#fff4c7'; c.textAlign = 'right'; c.fillText(`${Math.floor(this.player.x / WORLD.width * 100)}%`, WIDTH - 15, 21); c.textAlign = 'left';
    if (this.state === 'playing' && this.flash > 0.25) {
      c.fillStyle = '#6df7e8'; c.font = 'bold 12px monospace'; c.textAlign = 'center'; c.fillText('CHECKPOINT!', WIDTH / 2, 64); c.textAlign = 'left';
    }
  }
}
