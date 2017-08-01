define([
  '../lib/three/three.min',
  '../lib/three/tween.min',
  '../lib/three/CSS3DRenderer',
  '../lib/three/TrackballControls'
], function (THREE, TWEEN) {
  var gallery = {
    container: document.getElementById('threejs-container'),
    objects: [],
    sorting: false,
    cards: {},
    ranks: [],
    targets: {
      table: [],
      sphere: [],
      helix: [],
      grid: []
    },
    callback: {},
    callback2: {},
    currentTarget: undefined,
    camera: {},
    renderer: new THREE.CSS3DRenderer(),
    scene: new THREE.Scene(),
    controls: {},
    tweenCount: 0,
    pageIndex: 0,
    canUpdateControls: true,
    lastCameraPosition: undefined,
    lastCameraRotation: undefined,
    open: false,
    reset: function (targets) {
      if (gallery.currentTarget !== undefined || !gallery.canUpdateControls) {
        gallery.currentTarget = undefined;
        gallery.canUpdateControls = true;
      }
      gallery.sorting = false;
      gallery.objects = [];
      gallery.cards = {};
      var objsToRemove = _.rest(gallery.scene.children, 0);
      _.each(objsToRemove, function (object) {
        gallery.scene.remove(object);
      });
      gallery.controls.reset();
      gallery.tweenCount = 0;
      gallery.pageIndex = 0;
      gallery.initSceneContent(targets);
      gallery.transform(gallery.targets.grid, 3000);
    },
    updateSize: function () {
      gallery.camera.aspect = gallery.container.offsetWidth / gallery.container.offsetHeight;
      gallery.camera.updateProjectionMatrix();
      gallery.renderer.setSize(gallery.container.offsetWidth, gallery.container.offsetHeight);
    },
    sort: function () {
      gallery.pageIndex = 0;
      gallery.initGridLayout(gallery.objects);
      gallery.sorting = true;
      gallery.transform(gallery.targets.grid, 2000);
    },
    transform: function (targets, duration) {
      TWEEN.removeAll();
      gallery.tweenCount = 0;

      for (var i = 0; i < gallery.objects.length; i++) {

        var object = (gallery.ranks.length === 0 || gallery.sorting === false) ? gallery.objects[i] : gallery.ranks[i];
        var target = targets[i];

        if (Math.abs(target.position.z - object.position.z) > 5000) {
          var firstTween = new TWEEN.Tween(object.position)
            .to({
              x: 1.5 * target.position.x,
              y: target.position.y + Math.random() * 500 + 100,
              z: object.position.z - Math.random() * 400 - 400
            }, Math.random() * 0.2 * duration + 0.2 * duration)
            .easing(TWEEN.Easing.Sinusoidal.Out);

          firstTween.chain(new TWEEN.Tween(object.position)
            .to({
              x: target.position.x,
              y: target.position.y,
              z: target.position.z
            }, 0.3 * duration)
            .onComplete(function () {
              gallery.tweenCount--;
            })
            .easing(TWEEN.Easing.Sinusoidal.InOut));

          firstTween.start();
        } else {
          new TWEEN.Tween(object.position)
            .to({
              x: target.position.x,
              y: target.position.y,
              z: target.position.z
            }, duration)
            .onComplete(function () {
              gallery.tweenCount--;
            })
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }

        new TWEEN.Tween(object.rotation)
          .to({
            x: target.rotation.x,
            y: target.rotation.y,
            z: target.rotation.z
          }, Math.random() * 2 * duration)
          .onComplete(function () {
            gallery.tweenCount--;
          })
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        gallery.tweenCount += 2;
      }
    },
    focus: function (target, duration) {
      if (gallery.tweenCount === 0) {
        TWEEN.removeAll();

        if (gallery.canUpdateControls) {
          gallery.canUpdateControls = false;
          gallery.lastCameraPosition = gallery.camera.position.clone();
          gallery.lastCameraRotation = gallery.camera.rotation.clone();
        }

        if (gallery.currentTarget !== undefined) {
          gallery.currentTarget.className = gallery.currentTarget.className.replace(' selected', '');
        }
        gallery.currentTarget = target.element;
        gallery.currentTarget.className += ' selected';

        var newPos = target.position;
        var vectorR = new THREE.Vector3(0, 0, 1);
        var newRot = target.rotation;
        vectorR.applyAxisAngle(new THREE.Vector3(1, 0, 0), newRot.x);
        vectorR.applyAxisAngle(new THREE.Vector3(0, 1, 0), newRot.y);
        vectorR.applyAxisAngle(new THREE.Vector3(0, 0, 1), newRot.z);

        new TWEEN.Tween(gallery.camera.position)
          .to({
            x: newPos.x + 500 * vectorR.x,
            y: newPos.y + 500 * vectorR.y,
            z: newPos.z + 500 * vectorR.z
          }, duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();

        new TWEEN.Tween(gallery.camera.rotation)
          .to({
            x: newRot.x,
            y: newRot.y,
            z: newRot.z
          }, duration)
          .easing(TWEEN.Easing.Exponential.InOut)
          .start();
      }
    },
    init: function (callback) {
      gallery.camera = new THREE.PerspectiveCamera(40, gallery.container.offsetWidth / gallery.container.offsetHeight, 10, 10000);
      gallery.camera.position.z = 4150;
      gallery.camera.position.y = 930;
      gallery.updateSize();

      gallery.controls = new THREE.TrackballControls(gallery.camera, gallery.renderer.domElement);
      gallery.controls.rotateSpeed = 1.0;
      gallery.controls.zoomSpeed = 0.02;
      gallery.controls.enableDamping = true;
      gallery.controls.dynamicDampingFactor = 0.3;
      gallery.controls.minDistance = 10;
      gallery.controls.maxDistance = 10000;

      gallery.renderer.domElement.addEventListener('click', function (event) {
        if (!gallery.canUpdateControls) {
          TWEEN.removeAll();

          if (gallery.currentTarget !== undefined) {
            gallery.currentTarget.className = gallery.currentTarget.className.replace(' selected', '');
            gallery.currentTarget = undefined;
          }

          new TWEEN.Tween(gallery.camera.position)
            .to({
              x: gallery.lastCameraPosition.x,
              y: gallery.lastCameraPosition.y,
              z: gallery.lastCameraPosition.z
            }, 1000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

          new TWEEN.Tween(gallery.camera.rotation)
            .to({
              x: gallery.lastCameraRotation.x,
              y: gallery.lastCameraRotation.y,
              z: gallery.lastCameraRotation.z
            }, 1000)
            .onComplete(function () {
              gallery.canUpdateControls = true;
            })
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

          callback();
        }

        console.log(gallery.camera.position);
      }, false);

      document.addEventListener('keydown', function (event) {
        switch (event.key) {
          case 'ArrowUp':
            if (!gallery.canUpdateControls) return;
            gallery.pageIndex++;
            gallery.initGridLayout(gallery.objects);
            gallery.transform(gallery.targets.grid, 2000);
            break;
          case 'ArrowDown':
            if (!gallery.canUpdateControls) return;
            gallery.pageIndex--;
            gallery.initGridLayout(gallery.objects);
            gallery.transform(gallery.targets.grid, 2000);
            break;
        }
      }, false);

      window.addEventListener('resize', gallery.updateSize, false);
      bindButtons();

      function bindButtons() {
        var button = document.getElementById('table');
        button.addEventListener('click', function (event) {
          gallery.transform(gallery.targets.table, 2000);
        }, false);

        button = document.getElementById('sphere');
        button.addEventListener('click', function (event) {
          gallery.transform(gallery.targets.sphere, 2000);
        }, false);

        button = document.getElementById('helix');
        button.addEventListener('click', function (event) {
          gallery.transform(gallery.targets.helix, 2000);
        }, false);

        button = document.getElementById('sort');
        button.addEventListener('click', function (event) {
          gallery.sort();
        }, false);

        button = document.getElementById('reset');
        button.addEventListener('click', function (event) {
          gallery.canUpdateControls = true;
          gallery.controls.reset();
        }, false);

        button = document.getElementById('reset2');
        button.addEventListener('click', function (event) {
          gallery.canUpdateControls = true;
          gallery.camera.position.x = -1650;
          gallery.camera.position.y = 1000;
          gallery.camera.position.z = 3950;
        }, false);

        button = document.getElementById('next');
        button.addEventListener('click', function (event) {
          if (!gallery.canUpdateControls) return;
          gallery.pageIndex--;
          gallery.initGridLayout(gallery.objects);
          gallery.transform(gallery.targets.grid, 2000);
        }, false);

        button = document.getElementById('last');
        button.addEventListener('click', function (event) {
          if (!gallery.canUpdateControls) return;
          gallery.pageIndex++;
          gallery.initGridLayout(gallery.objects);
          gallery.transform(gallery.targets.grid, 2000);
        }, false);
      }
    },
    setData: function (targets, callback, callback2) {
      gallery.targets.table = [];
      gallery.targets.sphere = [];
      gallery.targets.helix = [];
      gallery.targets.grid = [];

      gallery.container.innerHTML = "";

      gallery.callback = callback;
      gallery.callback2 = callback2;

      gallery.initSceneContent(targets);

      gallery.transform(gallery.targets.grid, 3000);
    },
    warning: function (result) {
      gallery.ranks = [];
      for (var key in result) {
        if (result.hasOwnProperty(key)) {
          var num = result[key];

          if (gallery.cards[key] === undefined) continue;

          gallery.ranks.push(gallery.cards[key]);

          if (num === 0) {
            gallery.cards[key].element.className = gallery.cards[key].element.className.replace(' warning', '');
          } else if (gallery.cards[key].element.className.indexOf('warning') === -1) {
            gallery.cards[key].element.className += ' warning';
          }
        }
      }

      gallery.ranks.sort(function (a, b) {
        return result[b.cid] - result[a.cid];
      });
    },
    initSceneContent: function (objects) {
      for (var i = 0; i < objects.length; i++) {
        var element = document.createElement('div');
        // if (i % 2 !== 0 && i % 3 !== 0 && i % 5 !== 0 && i % 7 !== 0 && Math.random() > 0.7)
        //   element.className = 'element warning';
        // else
        element.className = 'element';
        element.id = 'e-' + i;
        element.tag = objects[i].id;
        element.state = '人员性质：未知';

        var hcp = objects[i].hasCaseProperty;
        if (hcp === '是') {
          element.className = 'element error';
          element.state = '人员性质：已侦/在侦';
        }

        if (objects[i].cardid[0] === '653021198606121117' ||
          objects[i].cardid[0] === '652924198701060014' ||
          objects[i].cardid[0] === '65322419890402119X' ||
          objects[i].cardid[0] === '653201198403263516') {
          element.className += ' special'
          element.state = '人员性质：已处置';
        }

        var img = document.createElement('img');
        img.tag = objects[i].id;
        img.code = objects[i].cardid[0];
        img.src = objects[i].photo;
        img.onerror = function () {
          this.src = "./img/avatar-placeholder.png";
        };
        img.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();

          // gallery.cards[event.currentTarget.tag].className = gallery.cards[event.currentTarget.tag].className.replace('warning', '');
          gallery.callback2(event.currentTarget.tag, event.currentTarget.code);
        });
        element.appendChild(img);

        var des = document.createElement('div');
        des.className = 'object-description';

        var name = document.createElement('div');
        name.className = 'object-name';
        name.textContent = '姓名：' + objects[i].name;
        des.appendChild(name);

        var nation = document.createElement('div');
        nation.className = 'object-nation';
        nation.textContent = '民族：' + objects[i].nation;
        des.appendChild(nation);

        var sex = document.createElement('div');
        sex.className = 'object-sex';
        sex.textContent = '性别：' + '男';
        des.appendChild(sex);

        var phone = document.createElement('div');
        phone.className = 'object-phone';
        phone.textContent = '生日：' + objects[i].birth;
        des.appendChild(phone);

        element.appendChild(des);

        var cssObject = new THREE.CSS3DObject(element);
        cssObject.position.x = Math.random() * 5000 - 2500;
        cssObject.position.y = Math.random() * 5000 - 2500;
        cssObject.position.z = Math.random() * 5000 - 2500;
        cssObject.cid = objects[i].id;

        gallery.cards[objects[i].id] = cssObject;

        element.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();

          var obj3d = gallery.objects[event.currentTarget.id.split('-')[1]];

          gallery.focus(obj3d, 2000);
          gallery.callback(obj3d.element.tag, obj3d.element.state);
        });

        gallery.scene.add(cssObject);

        gallery.objects.push(cssObject);
      }

      if (gallery.container.children.length === 0)
        gallery.container.appendChild(gallery.renderer.domElement);

      //initTableLayout(objects);
      //initSphereLayout(objects);
      //initHelixLayout(objects);
      gallery.initGridLayout(objects);
    },
    initGridLayout: function (objects) {
      var pageCount = Math.floor((objects.length - 1) / 28) + 1;
      gallery.targets.grid = [];

      for (var i = 0; i < objects.length; i++) {
        var object = new THREE.Object3D();

        object.position.x = ((i % 7) * 300) - 900;
        object.position.y = (-(Math.floor(i / 7) % 4) * 200) + 800;
        var z = (Math.floor(i / 28) + gallery.pageIndex) % pageCount;
        if (z < 0) z += pageCount;
        object.position.z = -z * 1000 + 2500;

        object.name = Math.floor(i / 28);

        gallery.targets.grid.push(object);
      }
    },
    animate: function () {
      window.requestAnimationFrame(gallery.animate);
      if (gallery.canUpdateControls) gallery.controls.update();
      TWEEN.update();
      gallery.render();
    },
    render: function () {
      var cameraPos = gallery.camera.position;

      gallery.objects.forEach((object) => {
        var distance = Math.abs(object.position.x - cameraPos.x) +
          Math.abs(object.position.y - cameraPos.y) / 2 +
          Math.abs(object.position.z - cameraPos.z) / 2;

        if (distance < 2000) {
          object.element.style.opacity = 1;
        } else if (distance < 3000) {
          object.element.style.opacity = 0.75;
        } else if (distance < 4000) {
          object.element.style.opacity = 0.5;
        } else if (distance < 5000) {
          object.element.style.opacity = 0.2;
        } else {
          object.element.style.opacity = 0.1;
        }
      });
      gallery.renderer.render(gallery.scene, gallery.camera);
    },
    buildGUI: function () {
      var docHeight = $(document).height();

      $("#options").css({
        "visibility": "visible",
        "top": docHeight / 2,
        "bottom": docHeight / 2,
        "border-right-width": 0,
        "box-shadow": "none"
      }).animate({
        "top": 0,
        "bottom": 0
      }, 800, function complete() {
        $("#thumbprint").animate({
          opacity: 1
        });
        $("#thumbprint").click(function () {
          if (!gallery.open) {
            gallery.openOptions();
          } else {
            gallery.closeOptions();
          }
        });
      });
    },
    openOptions: function () {
      gallery.open = true;
      var headerTopPosition = $("#header-top").position().top;
      var headerBottomPosition = $("#header-bottom").position().top;
      var headerHeight = $("#header-top").outerHeight(); /* margins or something, whatever */
      $(".header-animator").offset({
        top: $(document).height() / 2,
        left: 25
      });
      $(".header-animator").height(0);

      $("#options").css({
        "border-right-width": "1px solid #17308a;",
        "box-shadow": "0px 0px 2px rgba(30, 55, 170, 0.75);"
      });

      $("#options").data("left", $("#options").css("left"));
      $("#thumbprint").data("left", $("#thumbprint").css("left"));
      //$("#threejs-container").data("marginLeft", $("#threejs-container").css("marginLeft"));
      $("#options").animate({
        left: 0,
        opacity: 1
      }, 500);
      $("#thumbprint").animate({
        left: 260
      }, 500);
      $({
        deg: '90deg'
      }).animate({
        deg: '-90deg'
      }, {
        duration: 500,
        step: function (now) {
          $("#thumbprint").css({
            transform: 'rotate(' + now + 'deg)'
          });
        }
      });
      //$("#threejs-container").animate({ marginLeft: 150 }, 500);
      $("#options-content").delay(1200).animate({
        opacity: 1
      }, 500);

      setTimeout(function () {
        $(".header-animator").css("visibility", "visible");

        $("#header-animator-outside").animate({
          top: headerTopPosition,
          height: headerBottomPosition - headerTopPosition + headerHeight
        }, 500);

        $("#header-animator-inside").animate({
          top: headerTopPosition + headerHeight,
          height: headerBottomPosition - headerTopPosition - headerHeight
        }, 500);
      }, 500);

      setTimeout(function () {
        $(".header-animator").css("visibility", "hidden");
        $(".header").css("visibility", "visible");
      }, 1000);
    },
    closeOptions: function () {
      gallery.open = false;
      $("#options").animate({
        left: $("#options").data("left"),
        opacity: 0
      }, 500);
      $("#thumbprint").animate({
        left: $("#thumbprint").data("left")
      }, 500);
      $({
        deg: '270deg'
      }).animate({
        deg: '90deg'
      }, {
        duration: 500,
        step: function (now) {
          $("#thumbprint").css({
            transform: 'rotate(' + now + 'deg)'
          });
        }
      });
      $("#options").css({
        "border-right-width": "0;",
        "box-shadow": "none;"
      });
      $("#threejs-container").animate({
        marginLeft: $("#threejs-container").data("marginLeft")
      }, 500);
      $("#options-content").animate({
        opacity: 0
      }, 500);
      $(".header").css("visibility", "hidden");
    }
  };

  return gallery;
});