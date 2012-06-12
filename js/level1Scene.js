Crafty.scene("level1Scene", function() {

    // the game tick
    Crafty.e("Ticker")
        .bind("EnterFrame", function(f) {
            if (A.tick === undefined) A.tick = 0;
            A.tick += 1;
            // a separate tick for the ball
            if (A.spintick === undefined) A.spintick = 0;
            A.spintick += 1;
        })
        .bind("Reset", function() {
            A.spintick = 0;
        })
        .bind("RestartGame", function() {
            A.tick = 0;
            A.spintick = 0;
        });

    // the play again button
    Crafty.e("2D, Canvas, Mouse, Image")
        .image("images/playagain.png")
        .attr({x:150, y:-200, z:100})
        .bind("GameOver", function() {
            A.gamePaused = true;
            this.y = 200;
        })
        .bind("Click", function() {
            this.y = -200;
            Crafty.trigger("RestartGame");
            Crafty.trigger("Reset");
            A.gamePaused = false;
        });

    // the scorekeeper
    Crafty.e("2D, Canvas, Text")
        .attr({x: 10, y:10, _score:0, _seconds:0})
        .text("Score: 0 Alive for: 0 seconds.")
        .bind("EnterFrame", function(f) {
            if (this._start === undefined) {
                this._start = new Date();
                this._start = this._start.getTime();
            }
            if (f.frame % 30 !== 0) return;
            var now = new Date();
            now = now.getTime();
            this._seconds = Math.round((now - this._start) / 1000);
            this.text("Score: " + this._score + " Alive for: " + this._seconds + " seconds.");
        })
        .bind("RestartGame", function() {
            this._start = new Date();
            this._start = this._start.getTime();
            this._seconds = 0;
            this._score = 0;
            this.text("Score: 0");
        })
        .bind("GotOne", function() {
            this._score += 1;
        });

    // the health meter
    Crafty.e("2D, Canvas, Text")
        .attr({x: 300, y:10})
        .text("Health: 10")
        .bind("RestartGame", function() {
            this.text("Health: 10");
        })
        .bind("GotHit", function(health) {
            this.text("Health: " + health);
        });

    // the ui
    Crafty.e("Keyboard")
        .bind("KeyDown", function(e) {
            if (this.isDown("UP_ARROW")) {
                A.cheat = true;
            }
            if (this.isDown(32)) {
                Crafty.trigger("Release");
            }
            if (this.isDown("LEFT_ARROW")) {
                Crafty.trigger("SwingCCW");
            }
            if (this.isDown("RIGHT_ARROW")) {
                Crafty.trigger("SwingCW");
            }
        });

    // hurt flash
    Crafty.e().bind("GotHit", function() {
        Crafty.e("2D, Canvas, Tween, Color").color("rgba(255,3,3,0.3)").attr({x:0, y:0, w:640, h:480}).tween({x:-1}, 20).bind("TweenEnd", function() {this.destroy()});
    });

    // the 'camera'
    Crafty.e("Camera")
        .attr({_shake: false, _shakecount: 0})
        .bind("GotHit", function() {
            this._shake = true;
            this._shakecount = 0;
        })
        .bind("Boom", function() {
            this._shake = true;
            this._shakecount = 0;
        })
        .bind("EnterFrame", function() {
            if (!this._shake) return;
            if (A.tick % 5 !== 0) return;

            Crafty.viewport.x = Crafty.math.randomInt(-10, 10);
            Crafty.viewport.y = Crafty.math.randomInt(-10, 10);

            this._shakecount += 1;

            if (this._shakecount > 10) {
                this._shakecount = 0;
                this._shake = false;
                Crafty.viewport.x = 0;
                Crafty.viewport.y = 0;
            }
        })

    // the floor
    Crafty.e("2D, Canvas, Color, Collision, Solid, Platform")
        .color("#222222")
        .collision()
        .attr({x:-100, y:300, w:1000, h: 30});

    // the enemy spawner
    Crafty.e("Spawner")
        .attr({_nextSpawnTick: 100, _interval: 150, _speed: 1500})
        .bind("RestartGame", function() {
            this._speed = 2000;
            this._interval = 150;
            this._nextSpawnTick = 100;
        })
        .bind("EnterFrame", function() {
            if (!A.gamePaused && A.tick > this._nextSpawnTick && this._interval > 20) {

                // randomly left or right or leftup or rightup
                var randint = Crafty.math.randomInt(0, 3);
                var newX = randint===0||randint===2?0:640;
                var newY = randint===0||randint===1?250:-40;

                // create an enemy
                Crafty.e("2D, Canvas, Tween, Collision, Color, Solid, enemy")
                    .collision()
                    .color("#334455")
                    .attr({x: newX, y: newY, w:Crafty.math.randomInt(10, 30), h:Crafty.math.randomInt(20, 40)})
                    .tween({x: 300, y: 240}, this._speed)
                    .bind("GameOver", function() {
                        var that = this;
                        this.destroy();
                        Crafty.e("2D, Canvas, Color").color("#334455").attr({x: that.x, y: that.y, w: that.w, h: that.h}).bind("EnterFrame", function(f) {this.x = that.x + Math.sin(f.frame / 6) * that.w / 2; this.y = that.y + Math.sin(f.frame / 6) * that.h / 2; this.w = that.w + Math.sin(f.frame / 6) * that.w / 2; this.h = that.h + Math.cos(f.frame / 6) * that.h / 2;}).bind("RestartGame", function() {this.destroy();});
                    })
                    .bind("GotOne", function(ent) {
                        if (this===ent) {
                            this._dead = true;
                            this.tween({x: this.x - 20, y: this.y + 5, h: 0, w: 100}, 3);
                        }
                    })
                    .bind("TweenEnd", function() {
                        this.destroy();
                    })
                    .bind("RestartGame", function() {
                        this.destroy();
                    })
                    .bind("HitBy", function(ent) {
                        if (ent === this) {
                            this.destroy();
                        }
                    });

                this._interval = Math.round(this._interval * 0.99);
                this._nextSpawnTick = A.tick + this._interval;
                this._speed = Math.round(this._speed * 0.992);

            }
        });

    // the guy
    Crafty.e("2D, Canvas, Collision, Color, theguy")
        .color("#999999")
        .attr({x:300, y:250, z:2, w:10, h:60, _health:10})
        .collision()
        .bind("RestartGame", function() {
            this._health = 10;
        })
        .onHit("enemy", function(ent) {
            if (A.cheat) return;
            if (ent[0].obj._dead) return;

            A.hit.play({volume: 50});
            this._health -= 1;
            Crafty.trigger("GotHit", this._health);
            Crafty.trigger("HitBy", ent[0].obj);

            for (var i = 0; i < 6; i++) {
                var that = this;
                Crafty.e("2D, Canvas, Gravity, Collision, Color").color("995522").attr({x: that.x, y: that.y, w: 5, h: 5, dx: Crafty.math.randomInt(-5, 5), dy: Crafty.math.randomInt(-5, 5)}).collision().gravity("Floor").onHit("Solid", function(){this.destroy()}).bind("EnterFrame", function() {this.x += this.dx; this.y += this.dy});
            }

            if (this._health === 0) {
                Crafty.trigger("GameOver", 0);
            }
        });

    // the "chain"
    Crafty.e("2D, Canvas")
        .attr({
            x: 244,
            y: 177,
            z: 3,
            w: 100,
            h: 100,
            _ctx: Crafty.canvas.context,
            draw: function() {
                if (A.theBall === undefined) return;

                this._ctx.beginPath();
                this._ctx.lineTo(300, 250);
                this._ctx.lineTo(Math.round(A.theBall.x), Math.round(A.theBall.y));
                this._ctx.stroke();
            }
        })
        .bind("EnterFrame", function() {
            // what the... hax
            this.draw();
            this.w = 100;
            this.h = 100;
        })
        .bind("Reset", function() {
            this.visible = true;
            this.bind("EnterFrame", function() {
                // also hax.. but stupider
                this.draw();
                this.w = 100;
                this.h = 100;
            });
        })
        .bind("Release", function() {
            this.visible = false;
            this.unbind("EnterFrame");
        });

    // ball component
    Crafty.c("Ball", {
        dir: function(dir) {
            this._dir = dir;
            return this;
        },
        init: function() {

            this.addComponent("2D, Canvas, Color, Gravity, Collision, theBall");

            this.x = 300;
            this.y = 200;
            this.z = 4;
            this.w = 10;
            this.h = 10;
            this._dir = "CW";
            this._begin = true;
            this._rotating = true;

            this.collision();
            this.gravityConst(0.07);
            this.antigravity();

            this.bind("EnterFrame", function() {
                if (this._rotating) {
                    // figure out dx and dy while rotating
                    if (this._dir === "CCW") {
                        this.dx = Math.sin(A.spintick / 12) * 4;
                        this.dy = Math.cos(A.spintick / 12) * 4;
                    } else if (this._dir === "CW") {
                        this.dx = Math.cos(1.57 + A.spintick / 12) * 4;
                        this.dy = Math.sin(1.57 + A.spintick / 12) * 4;
                    }
                }

                this.x += this.dx;
                this.y += this.dy;

                // draw a trail
                if (this.dx !== 0) {
                    Crafty.e("2D, Canvas, Tween, Color")
                        .color("#FF8811")
                        .attr({x: this.x, y: this.y, w: 10, h: 10})
                        .tween({w: 0, h: 0}, 15)
                        .bind("TweenEnd", function() {
                            this.destroy();
                        });
                }

            });

            // what happens when we hit a solid thing
            this.onHit("Solid", function(e) {

                if (this._rotating) return; // if still on chain, do nothing

                this.antigravity();
                this.y = e[0].obj.y - this.h;
                this.dx = 0;
                this.dy = 0;
                this.visible = false;

                if (e[0].obj.has("enemy")) {

                    A.explode.play({volume: 50});

                    Crafty.trigger("GotOne", e[0].obj); // let enemy know he ded

                    Crafty.trigger("Boom"); // shake the camera

                    // generate explosion area
                    var expX = this.x;
                    var expY = this.y;
                    Crafty.e("2D, Canvas, Tween, Explosion")
                        .attr({x: expX, y: expY, w: 1, h: 1, visible: false})
                        .tween({x: expX - 50, y: expY - 50, w:100, h:100}, 60)
                        .bind("EnterFrame", function() {
                            if (A.tick % 3 === 0) {
                                var littleX = this.x + Crafty.math.randomInt(-30, this.w + 30) - 15;
                                var littleY = this.y + Crafty.math.randomInt(-30, this.h + 30) - 15;
                                // a puff
                                Crafty.e("2D, Canvas, Tween, Color, Explosion")
                                    .color("FF9944")
                                    .attr({x: littleX,
                                           y: littleY,
                                           w: 1,
                                           h: 1})
                                    .tween({x: littleX - 15, y: littleY - 15, w: 30, h: 30}, 10)
                                    .bind("TweenEnd", function() {this.destroy()});
                            }
                        })
                        .bind("TweenEnd", function() {
                            Crafty("Explosion").each(function() {this.destroy()});
                        });
                }

                this.destroy();

            });

            this.bind("Release", function() {
                if (this._rotating) {
                    this._rotating = false;
                    this.gravity("Floor");
                }
            });

            return this;
        }
    });

    // the ball handler
    Crafty.e("BallHandler")
        .bind("SwingCW", function() {
            if (A.theBall && A.theBall._rotating) return;
            A.theBall = Crafty.e("Ball").dir("CW");
            Crafty.trigger("Reset");
        })
        .bind("SwingCCW", function() {
            if (A.theBall && A.theBall._rotating) return;
            A.theBall = Crafty.e("Ball").dir("CCW");
            Crafty.trigger("Reset");
        })
        .bind("RestartGame", function() {
            A.theBall = Crafty.e("Ball").dir("CW");
        });

    A.theBall = Crafty.e("Ball").dir("CW");
});