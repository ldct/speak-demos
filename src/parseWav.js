const parseWav = function(wav) {
  var readInt = function(i, bytes) {
    var ret = 0,
      shft = 0;

    while (bytes) {
      ret += wav[i] << shft;
      shft += 8;
      i++;
      bytes--;
    }
    return ret;
  };
  if (readInt(20, 2) !== 1) throw new Error('Invalid compression code, not PCM');
  if (readInt(22, 2) !== 1) throw new Error('Invalid number of channels, not 1');
  return {
    sampleRate: readInt(24, 4),
    bitsPerSample: readInt(34, 2),
    samples: wav.subarray(44)
  };
};

export default parseWav;