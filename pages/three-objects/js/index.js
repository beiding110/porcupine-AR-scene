(function() {
    var myStats = new MyStats;

    var scene = new Scene();
    var renderer = new Renderer();
    var camera = new Camera({
        position: {
            y: 2
        }
    });

    var cube = new Cube({
        size: {
            x: 2,
            y: 1,
            z: 3
        },
        material: {
            texture: {
                url: '/img/texture-1.png'
            }
        },
        position: {
            y: 2
        }
    });

    var cube2 = new Cube({
        material: {
            color: 0x00ff00,
        },
        position: {
            x: 2
        }
    });

    var group = new Group({
        children: [cube, cube2],
        position: {
            z: -10
        }
    });
    scene.add(group);

    var helper = new THREE.GridHelper( 100, 50 );
    scene.add( helper );

    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    var loader = new THREE.FontLoader();
    loader.load( '../three-objects/json/FeHelper-20191104164827.json', function ( font ) {
        var test = new TextGeometry({
            font: font,
            position: {
                z: -12
            }
        });
        scene.add(test);
    } );

    var controls = new Control( {
        camera: camera,
        renderer: renderer
    } );

    new Animation({
        scene: scene,
        renderer: renderer,
        camera: camera,
        stats: myStats,
        controls: controls,
        callback: function() {
            cube.rotation.y += 0.1;
            cube2.rotation.x += 0.1;
            // camera.rotation.y += .01;
        }
    });

    new Raycaster({
        camera: camera,
        scene: scene,
        handler: function(item) {
            item.scale.set(2, 2, 2);
        }
    })
}())
