var socket = io.connect("http://24.16.255.56:8888");
window.onload = function () {

    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");

    saveButton.onclick = function() {
        saveData();
    }

    loadButton.onclick = function() {
        loadData();
    }

    function saveData() {
        console.log("Saving");

        var objectsList = [];
        for (var i = 0; i < game.entities.length; i++) {
            var ent = game.entities[i];
            objectsList.push({
                            player: ent.player,
                            radius: ent.radius,
                            colors: ent.colors,
                            color: ent.color,
                            gravity: ent.gravity,
                            gravitySpeed: ent.gravitySpeed,
                            bounce: ent.bounce,
                            x: ent.x,
                            y: ent.y,
                            velocity: ent.velocity,
                            speed: ent.speed
                            });
        }

        socket.emit("save", {studentname: "Hoi Leung Marcus Cheung", statename: "aState", data: {objects: objectsList}});
        console.log("Saved");
    }

    function loadData() {
        console.log("Loading");
        socket.emit("load", { studentname: "Hoi Leung Marcus Cheung", statename: "aState" });    
        console.log("Loaded");
    }

    socket.on("load", function (data) {
        
        game.entities = [];
        
        for (var i = 0; i < data.data.objects.length; i++) {
            var object = data.data.objects[i];
            
            var circle = new Circle(game);
            circle.player = object.player;
            circle.radius = object.radius;
            circle.colors = object.colors;
            circle.color = object.color;
            circle.gravity = object.gravity;
            circle.gravitySpeed = object.gravitySpeed;
            circle.bounce = object.bounce;
            circle.x = object.x;
            circle.y = object.y;
            circle.velocity = object.velocity;
            circle.speed = object.speed;
            game.addEntity(circle);            
        }
    });

    socket.on("connect", function () {
        console.log("Socket connected.")
    });
    socket.on("disconnect", function () {
        console.log("Socket disconnected.")
    });
    socket.on("reconnect", function () {
        console.log("Socket reconnected.")
    });


}

function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};

function Circle(game) {
    this.player = 1;
    this.radius = 20;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.color = 3;
    this.gravity = 0.05;
    this.gravitySpeed = 0;
    this.bounce = 1.00;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    };
}

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.collideRight = function () {
    return this.x + this.radius > 800;
};
Circle.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
Circle.prototype.collideBottom = function () {
    return this.y + this.radius > 800;
};
Circle.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};

Circle.prototype.collide = function (other) {

    return distance(this, other) < this.radius + other.radius;
};




Circle.prototype.update = function () {
    Entity.prototype.update.call(this);


    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) {
            this.color = 2;
            this.x = this.radius;
        }
        if (this.collideRight()) this.x = 800 - this.radius;


    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) {
            this.radius += 20;
            this.y = this.radius;
            this.color = 3;
        }
        if (this.collideBottom()) {
            this.y = 800 - this.radius;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }

        this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
        this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
    }
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent && this.collide(ent)) {

            if (this.color !== ent.color) {
                this.radius -= .005;
                ent.radius -= .005;
            } else {
                this.radius += .01;
                ent.radius += .01;
            }


            var colorTemo = this.color;
            this.color = ent.color;
            ent.color = colorTemo;


            var temp = this.velocity;
            this.velocity = ent.velocity;
            ent.velocity = temp;
        };
    };

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
    }
    this.gravitySpeed += this.gravity;

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick + this.gravitySpeed;

}

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

var friction = 1;
var acceleration = 10000;
var maxSpeed = 200;

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();
var game = null;

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");
ASSET_MANAGER.queueDownload("./img/blue.png");


ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    game = gameEngine;
    var circle = new Circle(gameEngine);

    circle.color = 0;
    gameEngine.addEntity(circle);

    for (var i = 0; i < 10; i++) {
        circle = new Circle(gameEngine);

        gameEngine.addEntity(circle);
    };

    gameEngine.init(ctx);
    gameEngine.start();
});
