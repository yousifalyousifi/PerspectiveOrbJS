

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
var container, stats;
var camera, scene, renderer, composer;
var meshSecondary, meshPrimary;
var mouseX, mouseY;

var bloomPass;

var NUM_ROWS = 40;
var NUM_COLS = 40;
var NUM_SPHERES = NUM_COLS * NUM_ROWS;

var spherePrimaryPosition;
var sphereSecondaryPosition;
var spheresPrimary = [];
var spheresSecondary = [];

var starsObject;

var primaryMatrials = [];
var secondaryMatrials = [];

var mouseDown = false;
var shiftKeyDown = false;

var boundingBox
var boundingBoxDial

var options = new (function() {

	this.showInfo = true;
	this.sideView = false;
	this.needMouseDown = false
	this.needShiftKeyDown = false
	this.dynamicColorPrimary = false;
	this.dynamicColorSecondary = false;
	this.colorPrimary = [255,255,255];
	this.colorSecondary = [255,0,0]
	this.showStars = true;
	this.newStars = createStarsObject;

	this.expoStrength = 3
	this.expoRadius = 0.5;
	this.expoThreshold = 0;

	//helper variables
	this.dynamicColorPrimaryInterval = null;
	this.dynamicColorSecondaryInterval = null;

})();


init();
animate();

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 50, aspect, 1, 10000 );
	camera.position.set(0,0,1000);

	let geometery = new THREE.SphereBufferGeometry( 5, 10,10 );

	//primary sphere
	spherePrimaryPosition = new THREE.Vector3(0,0,0);
	for(let i = 0; i < NUM_SPHERES; i++) {
		let primaryMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } );
		let meshPrimary = new THREE.Mesh(geometery, primaryMaterial);
		meshPrimary.position.copy(spherePrimaryPosition);
		scene.add( meshPrimary );
		spheresPrimary.push(meshPrimary);
		primaryMatrials.push(primaryMaterial);
	}

	//secondary sphere
	sphereSecondaryPosition = new THREE.Vector3(0,0,-1000);
	for(let i = 0; i < NUM_SPHERES; i++) {
		let secondaryMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
		let meshSecondary = new THREE.Mesh(geometery, secondaryMaterial);
		meshSecondary.position.copy(sphereSecondaryPosition);
		scene.add( meshSecondary );
		spheresSecondary.push(meshSecondary);
		secondaryMatrials.push(secondaryMaterial);
	}



	//stars
	createStarsObject();


	var params = {
		exposure: 1.5,
		bloomStrength: 3,
		bloomThreshold: 0,
		bloomRadius: 0.5
	};

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = Math.pow( params.exposure, 4.0 );
	renderer.autoClear = false;
	container.appendChild( renderer.domElement );

	var renderScene = new THREE.RenderPass( scene, camera );
	bloomPass = new THREE.UnrealBloomPass( 
		new THREE.Vector2( window.innerWidth, window.innerHeight ), 
		params.bloomStrength, 
		params.bloomRadius, 
		params.bloomThreshold );
	bloomPass.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );
	composer.setSize( window.innerWidth, window.innerHeight );
	composer.addPass( renderScene );
	composer.addPass( bloomPass );

	stats = new Stats();
	// container.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	document.addEventListener( 'mousemove', onmousemove, false );
	document.addEventListener( 'mousedown', onmousedown, false );
	document.addEventListener( 'mouseup', onmouseup, false );
	document.addEventListener( 'touchmove', ontouchmove, false );

	mouseX = 0.25 * SCREEN_WIDTH;
	mouseY = 0.9 * SCREEN_HEIGHT;

	boundingBox = new BoundingBox()
	boundingBoxDial = new BoundingBoxDial(boundingBox)

	// window.setInterval(() => {
	// 	secondaryMaterial.color = new THREE.Color(Math.random(), Math.random(), 0);
	// }, 500);

}

function onKeyDown( event ) {
	if(event.key == "Shift") {
		shiftKeyDown = true;
	}
}

function onKeyUp( event ) {
	if(event.key == "Shift") {
		shiftKeyDown = false;
	}
}

var mousepoints = [];

function onmousemove( event ) {
	if(options.needMouseDown || options.needShiftKeyDown) {
		let check = true;
		if(options.needMouseDown && !mouseDown) {
			check = false;
		}
		if(options.needShiftKeyDown && !shiftKeyDown) {
			check = false;
		}
		if(check) {
			console.log("mousemove mouseDown")
			mouseX = event.clientX;
			mouseY = event.clientY;
			mousepoints.push(event)
		}
	} else if(!options.needMouseDown) {
		console.log("mousemove")
		mouseX = event.clientX;
		mouseY = event.clientY;
		mousepoints.push(event)
	}
}
function onmousedown( event ) {
		console.log("onmousedown ")
	mouseDown = true
	onmousemove(event)
}
function onmouseup( event ) {
		console.log("onmouseup ")
	mouseDown = false
}

function ontouchmove( event ) {
	console.log("touch")
	mouseX = event.touches[0].clientX;
  	mouseY = event.touches[0].clientY;
}

function onWindowResize() {
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
	boundingBox.handleWindowSizeChange()
}

function animate() {
	requestAnimationFrame( animate );
	boundingBox.update()
	boundingBoxDial.update()
	render();
	stats.update();
}

function render() {
	var r = Date.now() * 0.00005;
	renderer.clear();
	renderer.setViewport( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );

	let x = camera.position.x;
	let y = camera.position.y;

	// Side View
	if(options.sideView) {
		camera.position.set(1500,0,0);
		camera.lookAt( sphereSecondaryPosition );
	} else {
		camera.position.set(0,0,1000);
		camera.lookAt( 0,0,0 );
	}

	createPerspectiveOrb(10000,10000,mouseX / SCREEN_WIDTH, mouseX / SCREEN_WIDTH, mouseY / SCREEN_HEIGHT);

	// renderer.render( scene, camera );
	composer.render();
}

function createPerspectiveOrb(maxX,maxY, ratioX, ratioY, lookAtRatio) {
	
	let adjustedMaxX = ratioX * maxX;
	let adjustedMaxY = ratioY * maxY;
	let lookAt = sphereSecondaryPosition.clone().multiplyScalar(lookAtRatio);

	let cameraZ = (SCREEN_HEIGHT / 2) / Math.tan((camera.fov*(Math.PI*2)/360) / 2);

	for (let j = 0; j < NUM_ROWS; j++) {
		for (let i = 0; i < NUM_COLS; i++) {
	
			let primary = spheresPrimary[i + j * NUM_ROWS ];
			let secondary = spheresSecondary[i + j * NUM_ROWS ];

			//primary.material.color.setRGB(i/NUM_COLS, j/NUM_ROWS, 1); //debug colors

			primary.position.copy(spherePrimaryPosition);
			secondary.position.copy(sphereSecondaryPosition);

			let transform = fakecamera(
					-1 * ((i / NUM_COLS) - 0.5) * adjustedMaxX, // eye x
					((j / NUM_ROWS) - 0.5) * adjustedMaxY, // eye y
					cameraZ, // eye z
					lookAt.x, lookAt.y, lookAt.z, // LookAt centre x y z
					0, 1, 0);// up x y z

			primary.position.applyMatrix4(transform);
			secondary.position.applyMatrix4(transform);
		}
	}

}

function createStarsObject() {
	if(starsObject) {
		scene.remove(starsObject);
	}
	var starGeometry = new THREE.BufferGeometry();
	var vertices = [];
	for ( var i = 0; i < 1000; i ++ ) {
		vertices.push( THREE.Math.randFloatSpread( 1800 ) ); // x
		vertices.push( THREE.Math.randFloatSpread( 1800 ) ); // y
		vertices.push( THREE.Math.randFloatSpread( 1800 ) ); // z
	}
	starGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	starsObject = new THREE.Points( starGeometry, new THREE.PointsMaterial( { color: 0xbbbbbb, size: 1 } ) );
	if(options.showStars) {
		scene.add( starsObject );
	}
}

function fakecamera(eyeX, eyeY, eyeZ,
	centerX, centerY, centerZ,
	upX, upY, upZ) {
	// Calculating Z vector
	let z0 = eyeX - centerX;
	let z1 = eyeY - centerY;
	let z2 = eyeZ - centerZ;
	let eyeDist = Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	if (eyeDist >= 0.0001) {
		z0 /= eyeDist;
		z1 /= eyeDist;
		z2 /= eyeDist;
	}
	
	// Calculating Y vector
	let y0 = upX;
	let y1 = upY;
	let y2 = upZ;
	
	// Computing X vector as Y cross Z
	let x0 =  y1 * z2 - y2 * z1;
	let x1 = -y0 * z2 + y2 * z0;
	let x2 =  y0 * z1 - y1 * z0;
	
//		// Recompute Y = Z cross X
	y0 =  z1 * x2 - z2 * x1;
	y1 = -z0 * x2 + z2 * x0;
	y2 =  z0 * x1 - z1 * x0;
	
	// Cross product gives area of parallelogram, which is < 1.0 for
	// non-perpendicular unit-length vectors; so normalize x, y here:
	let xmag = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	if (xmag >= 0.0001) {
		x0 /= xmag;
		x1 /= xmag;
		x2 /= xmag;
	}
	
	let ymag = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	if (ymag >= 0.0001) {
		y0 /= ymag;
		y1 /= ymag;
		y2 /= ymag;
	}
	
	let transform = new THREE.Matrix4();
	transform.set(x0, x1, x2, 0,
			 y0, y1, y2, 0,
			 z0, z1, z2, 0,
			 0, 0, 0, 1);
	
	let translation = new THREE.Matrix4();
	translation.set(
		1, 0, 0,-eyeX,
		0, 1, 0,-eyeY,
		0, 0, 1,-eyeZ,
		0, 0, 0, 1);

	transform.multiply(translation);

	return transform;
}

function resetPrimaryMaterialColors(color) {
	primaryMatrials.forEach((i) => i.color.set(color));
}


function setPrimaryMaterialColorsDiagonal(color,startingColumn,slope) {

	let col = startingColumn;
	let row = 0;


	while(col >= 0 && col < NUM_COLS && row >= 0 && row < NUM_ROWS) {
		let idx = col + row * NUM_ROWS ;
		primaryMatrials[idx].color.set(color);

		col += slope;
		row += 1;
	}

}


window.onload = function() {
	let controller, folder;
  	var gui = new dat.GUI({closeOnTop: true, closed: true});
  	gui.width = 300;

  	controller = gui.add(options, "showInfo")
  	controller.onChange(function(value) {
  		document.getElementById("grid").style.visibility = value?"visible":"hidden"
	});

	gui.add(options, "needMouseDown")
	gui.add(options, "needShiftKeyDown")

  	controller = gui.addColor(options, "colorPrimary");
  	let colorPrimaryController = controller;
	controller.onChange(function(value) {
		primaryMatrials.forEach((i) => i.color.setRGB(value[0]/255,value[1]/255,value[2]/255));

	});

  	controller = gui.add(options, "dynamicColorPrimary");
	controller.onChange(function(value) {
		if(value) {
			window.clearInterval(options.dynamicColorPrimaryInterval);
			options.dynamicColorPrimaryInterval = null;
			options.dynamicColorPrimaryInterval = window.setInterval(function() {
				let count = (Date.now() * 0.0001) % 1;
				primaryMatrials.forEach((i) => i.color.setHSL(count, 1, 0.5));
			}, 10);
		} else {
			window.clearInterval(options.dynamicColorPrimaryInterval);
			options.dynamicColorPrimaryInterval = null;
			let colors = colorPrimaryController.getValue();
			console.log(colors)
			primaryMatrials.forEach((i) => i.color.setRGB(colors[0]/255,colors[1]/255,colors[2]/255));
		}
	});

  	controller = gui.addColor(options, "colorSecondary");
  	let colorSecondaryController = controller;
	controller.onChange(function(value) {
		// let count = (Date.now() * 0.0001) % 1;
		// secondaryMatrials.forEach((i) => i.color.setHSL(count, 1, 0.5));
		secondaryMatrials.forEach((i) => i.color.setRGB(value[0]/255,value[1]/255,value[2]/255));
	});

	controller = gui.add(options, "dynamicColorSecondary");
	controller.onChange(function(value) {
		if(value) {
			window.clearInterval(options.dynamicColorSecondaryInterval);
			options.dynamicColorSecondaryInterval = null;
			options.dynamicColorSecondaryInterval = window.setInterval(function() {
				let count = (Date.now() * 0.00015 + 0.001) % 1;
				secondaryMatrials.forEach((i) => i.color.setHSL(count, 1, 0.5));
			}, 10);
		} else {
			window.clearInterval(options.dynamicColorSecondaryInterval);
			options.dynamicColorSecondaryInterval = null;
			let colors = colorSecondaryController.getValue();
			console.log(colors)
			secondaryMatrials.forEach((i) => i.color.setRGB(colors[0]/255,colors[1]/255,colors[2]/255));
		}
	});

	controller = gui.add(options, "showStars")
	controller.onChange(function(value) {
		if(value) {
			scene.add(starsObject)
		} else {
			scene.remove(starsObject)
		}
	});
	gui.add(options, "newStars")


  	folder = gui.addFolder("Exposure");
	controller = folder.add(options, "expoRadius", 0.00, 1.2, 0.01)
	controller.onChange(function(value) {
		bloomPass.radius = value
	});
	controller = folder.add(options, "expoStrength", 0.00, 10, 0.01)
	controller.onChange(function(value) {
		bloomPass.strength = value
	});
	controller = folder.add(options, "expoThreshold", 0.00, 1.2, 0.01)
	controller.onChange(function(value) {
		bloomPass.threshold = value
	});


  	let debug = gui.addFolder("Debug");
  	debug.add(options, 'sideView');

};
   


