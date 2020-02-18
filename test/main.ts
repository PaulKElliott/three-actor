import { Mesh, AnimationMixer } from "three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import App3D from "./App3D";
import { makeBlink3D, makeBlinkTick } from "../src/Blink3D";
import { makeBlinker } from "../src/Blink";
import { makeTalk3D, makeTalkTick } from "../src/Talk3D";
import { makeTalk } from "../src/Talk";
import { positionSound } from "../src/Utils3D";

const app = new App3D();

const loader = new GLTFLoader().setPath("./assets/");
loader.load("malcom.glb", function(gltf) {
  console.log(gltf);

  gltf.scene.scale.multiplyScalar(0.5);
  app.scene.add(gltf.scene);

  const body = gltf.scene.getObjectByName("Body") as Mesh;
  const box = new THREE.BoxHelper(body, new THREE.Color(0xffff00));
  app.scene.add(box);
  app.tickFuncs.push(() => {
    box.update();
  });

  const bView = makeBlink3D(body, "Blink_Left", "Blink_Right", 2.0);
  const bState = makeBlinker();
  app.tickFuncs.push(makeBlinkTick(bState, bView));

  //talking from audio
  const talkState = makeTalk();
  const soundEmitter = new THREE.PositionalAudio(app.audioListener);
  const talkView = makeTalk3D(body, "MouthOpen", soundEmitter, 0.01, talkState);
  app.tickFuncs.push(makeTalkTick(talkView, talkState));
  positionSound(body, soundEmitter);

  const audioLoader = new THREE.AudioLoader().setPath("./assets/");
  audioLoader.load("what-to-drink.mp3", function(buffer) {
    soundEmitter.setBuffer(buffer);
    soundEmitter.play(); //play it to init source with domAudioContext.createBufferSource
    soundEmitter.stop();
  });

  document.addEventListener("keydown", e => {
    if (e.code === "Space") {
      soundEmitter.stop();
      soundEmitter.play();
    }
  });

  // Exported animations
  const clock = new THREE.Clock();
  const animations = gltf.animations;
  const mixer = new AnimationMixer(gltf.scene);
  const idleAction = mixer.clipAction(animations[0]);
  idleAction.play();

  app.tickFuncs.push(() => {
    mixer.update(clock.getDelta());
  });
});