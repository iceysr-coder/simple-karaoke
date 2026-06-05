// AudioWorklet processor: noise gate + gain
class NoiseGateProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'threshold', defaultValue: 0.02, minValue: 0, maxValue: 1 },
      { name: 'enabled', defaultValue: 1, minValue: 0, maxValue: 1 },
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const threshold = parameters.threshold[0];
    const enabled = parameters.enabled[0];

    for (let ch = 0; ch < input.length; ch++) {
      const inBuf = input[ch];
      const outBuf = output[ch];
      for (let i = 0; i < inBuf.length; i++) {
        const s = inBuf[i];
        outBuf[i] = (!enabled || Math.abs(s) > threshold) ? s : 0;
      }
    }
    return true;
  }
}

registerProcessor('noise-gate', NoiseGateProcessor);
