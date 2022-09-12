import "normalize.css";

import Loop from "raf-loop";
import {
  clamp,
  fitImage,
  loadImage,
  mapRange,
  measureAudio,
  onWindowResize,
} from "./utils";
import image1 from "../images/01.jpg";
import image2 from "../images/02.jpg";
import image3 from "../images/03.jpg";
import image4 from "../images/04.jpg";
import image5 from "../images/05.jpg";
import image6 from "../images/06.jpg";

(async () => {
  const images = await Promise.all(
    [image1, image2, image3, image4, image5, image6].map((img) =>
      loadImage(img)
    )
  );

  const audio = await measureAudio();

  const DIMENSIONS = {
    WIDTH: window.innerWidth,
    HEIGHT: window.innerHeight,
  };

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const resize = () => {
    DIMENSIONS.WIDTH = window.innerWidth;
    DIMENSIONS.HEIGHT = window.innerHeight;

    const dpr = window.devicePixelRatio;
    canvas.width = DIMENSIONS.WIDTH * dpr;
    canvas.height = DIMENSIONS.HEIGHT * dpr;
    canvas.style.width = `${DIMENSIONS.WIDTH}px`;
    canvas.style.height = `${DIMENSIONS.HEIGHT}px`;

    ctx.scale(dpr, dpr);
  };

  const update = () => {
    audio.update();

    ctx.save();
    ctx.clearRect(0, 0, DIMENSIONS.WIDTH, DIMENSIONS.HEIGHT);

    // console.log(audio.getValue());
    const idx = clamp(
      Math.floor(mapRange(audio.getValue(), 0, 1, 0, images.length - 1)),
      0,
      images.length - 1
    );

    if (!images[idx]) {
      console.log(idx);
    }

    const { x, y, width, height } = fitImage(
      images[idx],
      DIMENSIONS.WIDTH,
      DIMENSIONS.HEIGHT
    );
    ctx.drawImage(images[idx], x, y, width, height);

    console.log();

    ctx.restore();
  };

  onWindowResize(resize);

  resize();
  const engine = new Loop(update);
  engine.start();
})();
