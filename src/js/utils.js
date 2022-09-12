export const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
};

export const measureAudio = async (amt = 10) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioStream = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    audioStream.connect(analyser);
    analyser.fftSize = 128;

    const frequencyArray = new Uint8Array(analyser.frequencyBinCount);

    const averages = {
      current: [],
    };

    const frame = () => {
      analyser.getByteFrequencyData(frequencyArray);

      let slices = Math.floor(frequencyArray.length / amt);

      averages.current = [];

      for (let i = 0; i < amt; i++) {
        averages.current.push(
          frequencyArray
            .slice(i * slices, (i + 1) * slices)
            .reduce((p, c) => p + c, 0) /
            slices /
            128
        );
      }
    };

    let interval = setInterval(frame, 30);

    return {
      update: frame,
      getValue: () =>
        [...averages.current].reduce((p, c) => p + c, 0) /
        averages.current.length,
      unlisten: () => {
        stream.getAudioTracks().forEach((tr) => tr.stop());
        clearInterval(interval);
      },
    };
  } catch {
    return false;
  }
};

export const listenCb = (el, evtType, cb, opts = {}) => {
  el.addEventListener(evtType, cb, opts);

  return () => {
    el.removeEventListener(evtType, cb);
  };
};

export const onWindowResize = (cb = () => {}) => {
  const unlisten = [
    listenCb(window, "resize", cb, { passive: true }),
    listenCb(window, "orientationchange", cb, { passive: true }),
  ];

  return () => {
    unlisten.forEach((u) => u());
  };
};

export const fitImage = (img, width, height) => {
  if (width > height) {
    const dimensions = {
      height: height,
      width: (height / img.height) * img.width,
    };

    return {
      ...dimensions,
      x: (width - dimensions.width) / 2,
      y: 0,
    };
  }

  const dimensions = {
    width: width,
    height: (width / img.width) * img.height,
  };

  return {
    ...dimensions,
    x: 0,
    y: (height - dimensions.height) / 2,
  };
};

export const mapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};
