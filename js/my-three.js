/**
 * 渲染器
 * @param       {Object} obj 配置项
 * @constructor
 */
function Renderer(obj) {
    return this.init(obj);
};
Renderer.prototype = {
    init: function(obj) {
        this.$settings = obj || {}
        this.$el = this.$settings.el ? document.querySelector(this.$settings.el.el) : document.body;

        var renderer = new THREE.WebGLRenderer({ alpha:true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.$el.appendChild(renderer.domElement);



        return renderer;
    }
};

/**
 * 场景
 * @constructor
 */
function Scene() {
    return new THREE.Scene();
};

/**
 * 相机
 * @constructor
 */
function Camera(obj) {
    return this.init(obj);
};
Camera.prototype = {
    init: function(obj) {
        this.$settings = obj || {};

        var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        _mt_tool.mixin(this.$settings.position, camera.position, true);
        return camera;
    }
};

/**
 * 盒子
 * @param       {Object} obj 配置项
 * @constructor
 */
function Cube(obj) {
    return this.init(obj);
};
Cube.prototype = {
    init: function(obj) {
        this.$settings = obj || {};
        this.$material = this.$settings.material || {};

        this.$size = _mt_tool.mixin(this.size, this.$settings.size);

        var geometry = new THREE.CubeGeometry(this.$size.x, this.$size.y, this.$size.x);
        var material;

        if(this.$material.texture) {
            var texture = new Texture(this.$material.texture.url);
            material = new THREE.MeshBasicMaterial({ map: texture });
            //normalMap 凹凸
            //specularMap 纹理
        } else if(this.$material.color) {
            material = new THREE.MeshBasicMaterial({color: this.$material.color});
            // '0x00ff00'
        };

        var cube = new THREE.Mesh(geometry, material);

        _mt_tool.mixin(this.$settings.position, cube.position, true);

        return cube;
    },
    size: {
        x: 1,
        y: 1,
        z: 1
    }
};

/**
 * 分组
 * @constructor
 */
function Group(obj) {
    return this.init(obj);
};
Group.prototype = {
    init: function(obj) {
        this.$settings = obj || {};

        var group = new THREE.Group();

        var args = [];
        args.push.apply(args, this.$settings.children);
        args.forEach(function(item) {
            group.add(item)
        });

        _mt_tool.mixin(this.$settings.position, group.position, true);

        return group;
    }
};

function Texture(url) {
    var loader = new THREE.TextureLoader();
    var texture = loader.load(url);
    return texture
};

function Raycaster(obj) {
    this.init(obj);
};
Raycaster.prototype = {
    init: function(obj) {
        this.$settings = obj || {};
        this.$type = this.$settings.type || 'mousedown';
        this.$el = this.$settings.el ? document.querySelector(this.$settings.el.el) : document.body;
        this.$camera = this.$settings.camera;
        this.$scene = this.$settings.scene;
        this.$handler = this.$settings.handler;

        var childNodes = _mt_tool.treeBreakArr(this.$scene.children)

        this.$el.addEventListener(this.$type, function(e) {
            e.preventDefault();
            var mouse = {};

            mouse.x = (e.clientX / this.$el.offsetWidth) * 2 - 1;
            mouse.y = -(e.clientY / this.$el.offsetHeight) * 2 + 1;

            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera( mouse, this.$camera );

            var intersects = raycaster.intersectObjects( childNodes );

            if(intersects.length) {
                var INTERSECTED = intersects[0].object;

                this.$handler && this.$handler(INTERSECTED);
            };
        }.bind(this));
    }
};

/**
 * 动画渲染
 * @param       {Object} obj 配置项
 * @constructor
 */
function Animation(obj) {
    //scene, renderer, camera, callback
    function animation() {
        //自定义动作
        obj.callback && obj.callback();

        //更新场景
        obj.renderer.render(obj.scene, obj.camera);
        requestAnimationFrame(animation);

        //更新监视器
        obj.stats && obj.stats.update();

        //更新鼠标控制器
        obj.controls && obj.controls.update();
    };

    return animation();
};

/**
 * 鼠标控制器
 * @param       {Object} obj 配置项
 * @constructor
 */
function Control(obj) {
    return this.init(obj);
};
Control.prototype = {
    init: function(obj) {
        if(!THREE.OrbitControls) {
            throw new Error('未找到OrbitControls相关类，请确保引用了OrbitControls.js');
            return false;
        };

        this.$settings = obj;

        var controls = new THREE.OrbitControls( obj.camera, obj.renderer.domElement );

        Object.keys(this.setting).forEach(function(key) {
            controls[this.setting[key].key] = obj[key] === undefined ? this.setting[key].default : obj[key];
        }.bind(this));

        return controls;
    },
    setting: {
        pan: {
            key: 'enablePan',
            default: true
        },
        zoom: {
            key: 'enableZoom',
            default: true
        },
        rotate: {
            key: 'enableRotate',
            default: true
        }
    }
};

/**
 * 3D效果文字
 * @param       {Object} obj 设置项
 * @constructor
 */
function TextGeometry(obj) {
    return this.init(obj);
};
TextGeometry.prototype = {
    init: function(obj) {
        this.$settings = obj;
        _mt_tool.mixin(this.setting, this.$settings, true);

        var geometry = new THREE.TextGeometry(this.$settings.text, {
            font: this.$settings.font,
            size: this.$settings.size,
            height: this.$settings.height,
        } );

        var m = new THREE.MeshBasicMaterial({color: this.$settings.color});
        var mesh = new THREE.Mesh(geometry,m);

        _mt_tool.mixin(this.$settings.position, mesh.position, true);

        return mesh;
    },
    setting: {
        text: 'hello world',
        color: 0xff0000,
        size: 2,
        height: 1
    }
};

var _mt_tool = {
    mixin: function(from, to, cover) {
        if(!from) return to;
        if(!to) return from;

        Object.keys(from).forEach(function(key) {
            if(!cover) {
                if(!to[key]) {
                    to[key] = from[key];
                };
            } else {
                to[key] = from[key];
            };
        });

        return to;
    },
    treeBreakArr: function(treeArr) {
        var arr = [];

        treeArr.forEach(function(item) {
            if(/group/i.test(item.type)) {
                arr.push.apply(arr, _mt_tool.treeBreakArr(item.children));
            } else {
                if(!/light|linesegments/i.test(item.type)) {
                    arr.push(item);
                };
            };
        });

        return arr;
    }
}
