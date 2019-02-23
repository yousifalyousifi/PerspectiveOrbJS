 class BoundingBox {


 	constructor() {
 		this.id = "boundingBox"
 		this.el = document.getElementById(this.id);
 		this.vX = 0.1;
 		this.vY = 0.1;
 		this.set(200,200,100,150)
 		this.el.style.border = "white solid 1px"
 		this.el.style.position = "fixed"
 		this._windowWidth = window.innerWidth
 		this._windowHeight = window.innerHeight
 		this.currentTime = Date.now()
 	}

 	update() {
 		let now = Date.now()
 		let elapsed = now - this.currentTime
 		this.currentTime = now

        if (this.x < 0)
        { //this hit the left edge
            this.x = 0;
            this.vX = -this.vX;
        } else if (this.x + this.width > this._windowWidth)
        { //this hit the right edge
            this.x = this._windowWidth - this.width;
            this.vX = -this.vX;
        } else if (this.y < 0)
        { //this hit the top edge
            this.y = 0;
            this.vY = -this.vY;
        } else if (this.y + this.height > this._windowHeight)
        {//this hit the bottom edge
            this.y = this._windowHeight - this.height;
            this.vY = -this.vY;
        } else
        {
            this.x += this.vX * elapsed;
            this.y += this.vY * elapsed;
        }
        this.setX(this.x)
        this.setY(this.y)
 	}

 	set(x,y,w,h) {
 		this.setX(x)
 		this.setY(y)
 		this.setWidth(w)
 		this.setHeight(h)
 	}
 	setX(x) {
 		this.x = x
 		this.el.style.left = x+"px"
 	}
 	setY(y) {
 		this.y = y
 		this.el.style.top = y+"px"
 	}
 	setWidth(w) {
 		this.width = w
 		this.el.style.width = w+"px"
 	}
 	setHeight(h) {
 		this.height = h
 		this.el.style.height = h+"px"
 	}

 	handleWindowSizeChange() {
 		console.log('HI')
 		this._windowWidth = window.innerWidth
 		this._windowHeight = window.innerHeight
 	}
 	setHidden(hidden) {
 		this.el.style.visibility = hidden ? "hidden" : "visible"
 	}
 }

 class BoundingBoxDial {

 	constructor(box) {
 		this.id = "boundingBoxDial"
 		this.el = document.getElementById(this.id);
 		this.el.style.borderRadius = "50%"
 		this.el.style.backgroundColor = "yellow"
 		this.el.style.position = "fixed"
 		this.radiusX = box.width/2
 		this.radiusY = box.height/2
 		this.box = box
 		this.angle = 0
 		this.rpm = 60
 		this.set(this.angle,this.radius,20,20)
 		this.currentTime = Date.now()
 	}

 	update() {
 		let now = Date.now()
 		let elapsed = now - this.currentTime
 		this.currentTime = now
 		let deltaAngle = (this.rpm*Math.PI*2)/60/1000*elapsed
 		this.angle = this.angle + deltaAngle
 		this.radiusX = this.box.width/2
 		this.radiusY = this.box.height/2

 		let boxCentreX = this.box.x + this.box.width / 2
 		let boxCentreY = this.box.y + this.box.height / 2

 		let x = Math.cos(this.angle) * this.radiusX + boxCentreX - this.width/2
 		let y = Math.sin(this.angle) * this.radiusY + boxCentreY - this.height/2

        this.setX(x)
        this.setY(y)
 	}

 	set(x,y,w,h) {
 		this.setX(x)
 		this.setY(y)
 		this.setWidth(w)
 		this.setHeight(h)
 	}
 	setX(x) {
 		this.x = x
 		this.el.style.left = x+"px"
 	}
 	setY(y) {
 		this.y = y
 		this.el.style.top = y+"px"
 	}
 	setWidth(w) {
 		this.width = w
 		this.el.style.width = w+"px"
 	}
 	setHeight(h) {
 		this.height = h
 		this.el.style.height = h+"px"
 	}
 	setHidden(hidden) {
 		console.log(hidden)
 		this.el.style.visibility = hidden ? "hidden" : "visible"
 	}

 }